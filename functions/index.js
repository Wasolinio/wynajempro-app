const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { getStorage } = require("firebase-admin/storage");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { mergeClaims } = require("./claims");
const icalSync = require("./ical-sync");
const { taskIcsResponse } = require("./task-ics");

// Inicjalizacja Firebase Admin
const app = initializeApp();
const db = getFirestore(app);

// Sekrety — definicja w jednym miejscu (functions/params.js), bo dzieli je też admin.js
const { stripeSecretKey, stripeWebhookSecret, PRICE_ID } = require("./params");

// =============================================================================
// HELPER: Usuwanie wszystkich dokumentów w subkolekcji (batch delete)
// =============================================================================
async function deleteSubcollection(parentRef, subcollectionName) {
  const collRef = parentRef.collection(subcollectionName);
  const batchSize = 100;
  let totalDeleted = 0;

  // Usuwamy w partiach po 100 dokumentów, aż kolekcja będzie pusta
  while (true) {
    const snapshot = await collRef.limit(batchSize).get();
    if (snapshot.empty) break;

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    totalDeleted += snapshot.size;
  }

  return totalDeleted;
}

// Funkcja czyszcząca wszystkie dane biznesowe użytkownika
async function cleanupUserData(uid) {
  const userRef = db.collection("users").doc(uid);

  // Usuwamy subkolekcje z danymi biznesowymi
  const rentalsDeleted = await deleteSubcollection(userRef, "rentals");
  const settingsDeleted = await deleteSubcollection(userRef, "settings");
  const checkoutDeleted = await deleteSubcollection(userRef, "checkout_sessions");
  // X26: `users/{uid}/syncState/*` trzyma UID-y rezerwacji z portali i daty pobytów.
  // Skasowanie dokumentu użytkownika NIE usuwa jego subkolekcji, więc bez tej linii dane
  // przeżywałyby żądanie usunięcia konta — ta sama klasa problemu, którą audyt N5 zamknął
  // dla `guides/*/signatures`.
  const syncStateDeleted = await deleteSubcollection(userRef, "syncState");

  console.log(
    `🧹 Dane użytkownika ${uid} wyczyszczone: ` +
    `${rentalsDeleted} rezerwacji, ${settingsDeleted} ustawień, ${checkoutDeleted} sesji checkout, ` +
    `${syncStateDeleted} stanów synchronizacji`
  );

  // Czyścimy pola Stripe z profilu, ale zostawiamy sam dokument
  await userRef.update({
    stripeSubscriptionId: FieldValue.delete(),
    paidAt: FieldValue.delete(),
    lastPaymentAt: FieldValue.delete(),
    dataCleanedAt: Timestamp.now(),
  });

  return { rentalsDeleted, settingsDeleted, checkoutDeleted, syncStateDeleted };
}

// =============================================================================
// HELPER: Usuwanie JEDNEGO przewodnika w całości — subkolekcje secrets (PIN/WiFi)
// i signatures (podpisy gości = dane osobowe), pliki Storage, dokument.
// Wspólne dla: usuwania konta, cyklicznego czyszczenia i ręcznego kasowania
// przewodnika (audyt N5: dane gości nie mogą zostawać osierocone).
// Kolejność i obsługa błędów (C.1): od danych najwrażliwszych; dokument główny
// NA KOŃCU, bo jest jedynym „tropicielem" subkolekcji i plików — błąd Storage
// NIE jest połykany (skasowanie dokumentu mimo żywych plików osierociłoby
// publicznie czytelne pliki bez szansy na dokończenie w kolejnym przebiegu).
// =============================================================================
async function deleteGuideCompletely(guideRef, bucket) {
  const guideId = guideRef.id;
  await deleteSubcollection(guideRef, "secrets");
  await deleteSubcollection(guideRef, "signatures");
  await bucket.deleteFiles({ prefix: `guides/${guideId}/` });
  await guideRef.delete();
}

// Usuwa WSZYSTKIE przewodniki użytkownika (wraz z danymi gości). Zwraca liczbę.
async function deleteUserGuides(uid) {
  const guidesSnap = await db.collection("guides").where("ownerId", "==", uid).get();
  if (guidesSnap.empty) return 0;
  const bucket = getStorage(app).bucket();
  for (const guide of guidesSnap.docs) {
    await deleteGuideCompletely(guide.ref, bucket);
  }
  return guidesSnap.size;
}

// =============================================================================
// 1. TWORZENIE SESJI STRIPE CHECKOUT (Callable Function)
// =============================================================================
exports.createCheckoutSession = onCall(
  { secrets: [stripeSecretKey], enforceAppCheck: true, maxInstances: 5 },
  async (request) => {
    // Sprawdzenie uwierzytelnienia
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Musisz być zalogowany, aby dokonać płatności."
      );
    }

    // Sprawdzenie weryfikacji email
    if (!request.auth.token.email_verified) {
      throw new HttpsError(
        "permission-denied",
        "Musisz zweryfikować swój adres email przed dokonaniem płatności."
      );
    }

    const uid = request.auth.uid;
    const email = request.auth.token.email;

    // Inicjalizacja Stripe z sekretnym kluczem
    const stripe = require("stripe")(stripeSecretKey.value().trim());

    try {
      // Sprawdź czy użytkownik ma już klienta Stripe
      const userDoc = await db.collection("users").doc(uid).get();
      const userData = userDoc.data() || {};
      let customerId = userData.stripeCustomerId;

      // Jeśli nie ma klienta Stripe, tworzymy go
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: email,
          metadata: { firebaseUID: uid },
        });
        customerId = customer.id;

        // Zapisujemy ID klienta Stripe w profilu użytkownika
        await db.collection("users").doc(uid).update({
          stripeCustomerId: customerId,
        });
      }

      // Tworzymy sesję Checkout
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        // `payment_method_types` ŚWIADOMIE POMINIĘTE. Wpisane na sztywno "card"
        // zamrażało listę metod w kodzie; bez tego pola Stripe pokazuje wszystkie
        // metody włączone w panelu, które nadają się do danego trybu.
        // ⚠️ Dla `mode: "subscription"` to i tak nie będzie BLIK ani Przelewy24 —
        // one nie obsługują płatności cyklicznych. Zostają karta i portfele
        // (Apple Pay, Google Pay, Link), a w przyszłości np. SEPA po włączeniu w panelu.
        // Gdyby kiedyś pojawił się pakiet roczny płatny jednorazowo, BLIK stanie się
        // możliwy — i wtedy wystarczy włączyć go w panelu, bez zmiany kodu.
        mode: "subscription",
        // Polski interfejs wymuszony, a nie zgadywany z przeglądarki: gospodarz
        // płacący w złotówkach za polski produkt nie ma powodu widzieć angielskiego
        // formularza tylko dlatego, że ma angielski system.
        locale: "pl",
        line_items: [
          {
            price: PRICE_ID, // definicja w functions/params.js — jedno źródło prawdy
            quantity: 1,
          },
        ],
        success_url: request.data.successUrl || "https://wynajempro.com/dashboard",
        cancel_url: request.data.cancelUrl || "https://wynajempro.com/dashboard",
        // Widoczne wprost na liście płatności w panelu Stripe — bez wchodzenia
        // w metadane widać, którego konta dotyczy wpłata. Przy obsłudze zgłoszenia
        // („zapłaciłem, a nie mam dostępu") to różnica między jednym spojrzeniem
        // a grzebaniem w szczegółach zdarzenia.
        client_reference_id: uid,
        // Zdanie pod przyciskiem płatności. Najczęstsza obawa przy subskrypcji to
        // „czy dam radę to anulować" — odpowiadamy na nią w miejscu, w którym się rodzi.
        custom_text: {
          submit: {
            message: "Subskrypcję anulujesz w każdej chwili w panelu — bez okresu wypowiedzenia.",
          },
        },
        metadata: {
          firebaseUID: uid,
        },
        subscription_data: {
          metadata: {
            firebaseUID: uid,
          },
        },
      });

      return { url: session.url };
    } catch (error) {
      console.error("Błąd tworzenia sesji Stripe:", error);
      throw new HttpsError(
        "internal",
        "Nie udało się utworzyć sesji płatności."
      );
    }
  }
);

// =============================================================================
// 2. WEBHOOK STRIPE (HTTP Function — wywoływany przez Stripe po zdarzeniach)
// =============================================================================
exports.stripeWebhook = onRequest(
  {
    secrets: [stripeSecretKey, stripeWebhookSecret],
    // Wyłączamy automatyczne parsowanie body — potrzebujemy rawBody do weryfikacji
    invoker: "public",
    maxInstances: 5,
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const stripe = require("stripe")(stripeSecretKey.value().trim());
    const sig = req.headers["stripe-signature"];

    let event;

    // Weryfikacja podpisu webhooka
    try {
      // .trim() NIE jest ostrożnością na wyrost — to naprawa realnej awarii.
      // 2026-08-19 webhook odrzucał 100% zdarzeń ze Stripe, bo w sekrecie siedział
      // biały znak (najczęściej znak nowej linii doklejony przy wklejaniu albo przez
      // `echo`). Stripe SDK sygnalizuje to osobnym zdaniem w komunikacie błędu
      // („The provided signing secret contains whitespace"), ale sam podpisu nie
      // przepuści. Skutek w produkcji byłby cichy i kosztowny: płatność przechodzi
      // w Stripe, `status` nigdy nie zmienia się na 'active', klient płaci i dalej
      // widzi ekran blokady. Obcięcie białych znaków zamyka całą tę klasę awarii.
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        stripeWebhookSecret.value().trim()
      );
    } catch (err) {
      console.error("⚠️ Weryfikacja podpisu webhooka nie powiodła się:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Obsługa zdarzeń Stripe
    try {
      switch (event.type) {
        // ---------------------------------------------------------------
        // UDANA PŁATNOŚĆ — odblokowanie dostępu
        // ---------------------------------------------------------------
        case "checkout.session.completed": {
          const session = event.data.object;
          const uid = session.metadata?.firebaseUID;

          if (uid) {
            console.log(`✅ Płatność zakończona sukcesem dla użytkownika: ${uid}`);
            await db.collection("users").doc(uid).update({
              status: "active",
              stripeCustomerId: session.customer,
              stripeSubscriptionId: session.subscription,
              paidAt: Timestamp.now(),
              scheduledDeletionAt: FieldValue.delete(),
            });
            await mergeClaims(uid, { stripeStatus: "active" });
          } else {
            console.warn("⚠️ checkout.session.completed bez firebaseUID w metadata");
          }
          break;
        }

        // ---------------------------------------------------------------
        // ODNOWIENIE SUBSKRYPCJI — potwierdzenie aktywności
        // ---------------------------------------------------------------
        case "invoice.payment_succeeded": {
          const invoice = event.data.object;
          const customerId = invoice.customer;

          if (customerId) {
            // Znajdź użytkownika po stripeCustomerId, który jest gwarantowany w bazie
            const snapshot = await db
              .collection("users")
              .where("stripeCustomerId", "==", customerId)
              .limit(1)
              .get();

            if (!snapshot.empty) {
              const userDoc = snapshot.docs[0];
              console.log(`✅ Odnowienie subskrypcji dla: ${userDoc.id}`);
              await userDoc.ref.update({
                status: "active",
                lastPaymentAt: Timestamp.now(),
                // Na wszelki wypadek (obsługa wyścigu), ustawiamy też subscription id jeśli to pierwsza płatność
                stripeSubscriptionId: invoice.subscription,
                scheduledDeletionAt: FieldValue.delete(),
              });
              await mergeClaims(userDoc.id, { stripeStatus: "active" });
            }
          }
          break;
        }

        // ---------------------------------------------------------------
        // NIEUDANA PŁATNOŚĆ — oznaczenie jako zaległość
        // ---------------------------------------------------------------
        case "invoice.payment_failed": {
          const invoice = event.data.object;
          const customerId = invoice.customer;

          if (customerId) {
            const snapshot = await db
              .collection("users")
              .where("stripeCustomerId", "==", customerId)
              .limit(1)
              .get();

            if (!snapshot.empty) {
              const userDoc = snapshot.docs[0];
              console.log(`⚠️ Płatność nie powiodła się dla: ${userDoc.id}`);
              await userDoc.ref.update({
                status: "past_due",
              });
              await mergeClaims(userDoc.id, { stripeStatus: "past_due" });
            }
          }
          break;
        }

        // ---------------------------------------------------------------
        // ANULOWANIE SUBSKRYPCJI — zablokowanie dostępu
        // ---------------------------------------------------------------
        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const uid = subscription.metadata?.firebaseUID;
          let resolvedUid = uid;

          const deletionDate = new Date();
          deletionDate.setDate(deletionDate.getDate() + 30);

          if (uid) {
            // #32 guard: purge kont kasuje klienta Stripe, co może wywołać to
            // zdarzenie już PO usunięciu dokumentu users. `update()` na
            // nieistniejącym dokumencie niczego nie tworzy (brak wskrzeszenia),
            // ale rzuca NOT_FOUND → 500 → Stripe ponawiałby dostawę dniami.
            // Konto już usunięte = potwierdzamy zdarzenie i nic nie robimy.
            const userRef = db.collection("users").doc(uid);
            const userSnap = await userRef.get();
            if (!userSnap.exists) {
              console.log(`ℹ️ customer.subscription.deleted dla ${uid} — konto już usunięte, pomijam.`);
              break;
            }
            console.log(`❌ Subskrypcja anulowana dla użytkownika: ${uid}. Planowane usunięcie danych: ${deletionDate.toISOString()}`);
            await userRef.update({
              status: "canceled",
              canceledAt: Timestamp.now(),
              scheduledDeletionAt: Timestamp.fromDate(deletionDate),
            });
            try {
              await mergeClaims(uid, { stripeStatus: "canceled" });
            } catch (claimsErr) {
              // Okno wyścigu z purge: login Auth kasowany PRZED dokumentem —
              // brak użytkownika nie jest błędem dostawy zdarzenia.
              if (claimsErr.code !== "auth/user-not-found") throw claimsErr;
              console.log(`ℹ️ Claims pominięte dla ${uid} — login Auth już usunięty.`);
            }
          } else {
            // Fallback: szukaj po stripeSubscriptionId
            const snapshot = await db
              .collection("users")
              .where("stripeSubscriptionId", "==", subscription.id)
              .limit(1)
              .get();

            if (!snapshot.empty) {
              const userDoc = snapshot.docs[0];
              resolvedUid = userDoc.id;
              console.log(`❌ Subskrypcja anulowana dla: ${resolvedUid}. Planowane usunięcie danych: ${deletionDate.toISOString()}`);
              await userDoc.ref.update({
                status: "canceled",
                canceledAt: Timestamp.now(),
                scheduledDeletionAt: Timestamp.fromDate(deletionDate),
              });
              try {
                await mergeClaims(resolvedUid, { stripeStatus: "canceled" });
              } catch (claimsErr) {
                // Ten sam guard, co na ścieżce głównej (wyżej) — brakowało go tutaj.
                // Ta gałąź obsługuje subskrypcje BEZ `firebaseUID` w metadanych, czyli
                // te sprzed dodania `subscription_data.metadata`. Jeśli purge skasował
                // login przed dokumentem, `mergeClaims` rzuca, webhook zwraca 500,
                // a Stripe ponawia dostawę dniami — dokładnie incydent opisany wyżej.
                if (claimsErr.code !== "auth/user-not-found") throw claimsErr;
                console.log(`ℹ️ Claims pominięte dla ${resolvedUid} — login Auth już usunięty.`);
              }
            }
          }
          break;
        }

        default:
          console.log(`ℹ️ Nieobsłużone zdarzenie Stripe: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error("❌ Błąd obsługi webhooka:", error);
      res.status(500).json({ error: "Błąd serwera" });
    }
  }
);

// =============================================================================
// 5. TRIGGER: USTAWIANIE CUSTOM CLAIMS PRZY REJESTRACJI (TRIAL)
// =============================================================================
exports.onUserDocumentCreated = onDocumentCreated("users/{userId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) return;
  const data = snapshot.data();
  const uid = event.params.userId;
  
  if (data.status === 'trialing' && data.trialEndsAt) {
    try {
      await mergeClaims(uid, {
        stripeStatus: "trialing",
        trialEndsAt: data.trialEndsAt.toMillis(),
      });
      console.log(`✅ Custom claim (trialing) ustawiony dla: ${uid}`);
    } catch (error) {
      console.error("❌ Błąd ustawiania custom claim:", error);
    }
  }
});

// =============================================================================
// 3. PANEL ZARZĄDZANIA SUBSKRYPCJĄ (Stripe Customer Portal)
// =============================================================================
exports.createBillingPortalSession = onCall(
  { secrets: [stripeSecretKey], enforceAppCheck: true, maxInstances: 5 },
  async (request) => {
    // Sprawdzenie uwierzytelnienia
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Musisz być zalogowany, aby zarządzać subskrypcją."
      );
    }

    // Sprawdzenie weryfikacji email
    if (!request.auth.token.email_verified) {
      throw new HttpsError(
        "permission-denied",
        "Musisz zweryfikować swój adres email."
      );
    }

    const uid = request.auth.uid;
    const stripe = require("stripe")(stripeSecretKey.value().trim());

    try {
      // Pobierz ID klienta Stripe z profilu użytkownika
      const userDoc = await db.collection("users").doc(uid).get();
      const userData = userDoc.data();

      if (!userData?.stripeCustomerId) {
        throw new HttpsError(
          "failed-precondition",
          "Nie znaleziono aktywnej subskrypcji do zarządzania."
        );
      }

      // Tworzymy sesję Billing Portal
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: userData.stripeCustomerId,
        return_url: request.data.returnUrl || "https://wynajempro.com/dashboard",
      });

      return { url: portalSession.url };
    } catch (error) {
      // Jeśli to już nasz HttpsError, rzuć go dalej
      if (error instanceof HttpsError) throw error;

      console.error("Błąd tworzenia sesji Billing Portal:", error);
      throw new HttpsError(
        "internal",
        "Nie udało się otworzyć panelu zarządzania subskrypcją."
      );
    }
  }
);

// =============================================================================
// 4. CYKLICZNE USUWANIE PRZEDAWNIONYCH DANYCH (Soft Delete Cleanup)
// Uruchamiane raz na dobę. Pobiera konta 'canceled', gdzie scheduledDeletionAt minęło
// i kasuje ich dane biznesowe.
// =============================================================================
// F2 (audyt N5): porzucone triale nie dostają scheduledDeletionAt (ustawia go
// wyłącznie webhook anulowania subskrypcji), więc ich dane — w tym powierzone
// dane gości — leżałyby bezterminowo. Decyzja właściciela (2026-07-16):
// pełne usunięcie po 90 dniach od końca okresu próbnego.
const TRIAL_RETENTION_DAYS = 90;

// Pełne, trwałe usunięcie konta (wspólne: canceled po karencji i porzucony trial):
// przewodniki z danymi gości (najbardziej wrażliwe publicznie) → dane biznesowe
// → login Auth PRZED dokumentem (guard user-not-found; odwrotna kolejność
// zostawiałaby osierocony login, a self-heal w useFirebaseData wskrzesiłby
// trial — finding 🟡A z re-review F1). Dokument users/{uid} NA KOŃCU — dopóki
// istnieje, konto kwalifikuje się do ponownego przebiegu, więc częściowa
// awaria zawsze zostaje dokończona (idempotencja).
// Fail-safe (residual 🟢C z re-review F2): przed nieodwracalną kasacją ŚWIEŻY
// odczyt dokumentu + double-check kwalifikacji (stillEligible) — zamyka okno
// wyścigu z webhookiem Stripe (płatność między zapytaniem a purge ustawia
// 'active'); jakakolwiek wątpliwość → warn-skip, BEZ usunięcia.
// #32 (art. 17): kasujemy też klienta Stripe (e-mail = dane osobowe). Krok
// wykonywany NA SAMYM KOŃCU, tuż przed dokumentem users: (1) awaria Stripe
// propaguje → dokument-tropiciel zostaje → kolejny przebieg dokończy,
// (2) zdarzenie `customer.subscription.deleted` wywołane kasacją klienta
// trafia (niemal zawsze) już PO skasowaniu dokumentu → guard w webhooku
// ignoruje je, zamiast przestawiać status i wypychać konto z kwalifikacji.
// `stripeCustomerId` czytamy ze świeżego odczytu SPRZED cleanupUserData
// (cleanup i tak nie kasuje tego pola — retry po częściowej awarii wciąż
// go widzi); `resource_missing` = klient już nie istnieje = sukces.
async function purgeAccountCompletely(docSnap, label, stillEligible, stripe) {
  const uid = docSnap.id;
  const freshSnap = await docSnap.ref.get();
  if (!freshSnap.exists || !stillEligible(freshSnap.data())) {
    console.warn(`⚠️ Pominięto ${uid} (${label}) — świeży odczyt nie potwierdza kwalifikacji do usunięcia.`);
    return;
  }
  const stripeCustomerId = freshSnap.data().stripeCustomerId;
  console.log(`🧹 Rozpoczynanie trwałego usuwania konta (${label}): ${uid}`);
  const guidesDeleted = await deleteUserGuides(uid);
  await cleanupUserData(uid);
  try {
    await getAuth().deleteUser(uid);
  } catch (authErr) {
    if (authErr.code !== "auth/user-not-found") throw authErr;
  }
  if (stripeCustomerId) {
    try {
      await stripe.customers.del(stripeCustomerId);
      console.log(`✅ Klient Stripe ${stripeCustomerId} usunięty (${uid}).`);
    } catch (stripeErr) {
      if (stripeErr?.code === "resource_missing" || stripeErr?.statusCode === 404) {
        console.log(`ℹ️ Klient Stripe ${stripeCustomerId} już nie istnieje (${uid}) — kontynuuję.`);
      } else {
        // NIE połykamy: dokument users zostaje, jutrzejszy przebieg ponowi.
        throw stripeErr;
      }
    }
  }
  await docSnap.ref.delete();
  console.log(`✅ Konto ${uid} trwale usunięte (${label}; przewodników: ${guidesDeleted}).`);
}

exports.deleteExpiredAccountsData = onSchedule(
  {
    schedule: "every day 02:00",
    timeZone: "Europe/Warsaw",
    maxInstances: 1,
    // #32: purge kasuje też klienta Stripe (pełny art. 17)
    secrets: [stripeSecretKey],
  },
  async (_event) => {
    const now = new Date();
    const stripe = require("stripe")(stripeSecretKey.value().trim());
    console.log(`🧹 Uruchomiono cykliczne czyszczenie bazy danych: ${now.toISOString()}`);

    // 1) Konta anulowane po 30-dniowej karencji (scheduledDeletionAt z webhooka).
    // Kwalifikacja (sprawdzana ponownie na świeżym odczycie w purge): status
    // wciąż 'canceled' i scheduledDeletionAt to Timestamp z przeszłości —
    // płatność w międzyczasie (webhook ustawia 'active' i kasuje
    // scheduledDeletionAt) wyklucza konto z kasacji; legacy stringi poza.
    const canceledStillEligible = (d) => d.status === "canceled"
      && d.scheduledDeletionAt && typeof d.scheduledDeletionAt.toDate === "function"
      && d.scheduledDeletionAt.toDate() <= now;
    try {
      const canceledSnap = await db
        .collection("users")
        .where("status", "==", "canceled")
        .where("scheduledDeletionAt", "<=", now)
        .get();
      console.log(`🧹 Konta canceled po karencji: ${canceledSnap.size}`);
      await Promise.allSettled(canceledSnap.docs.map(async (docSnap) => {
        try { await purgeAccountCompletely(docSnap, "canceled po karencji", canceledStillEligible, stripe); }
        catch (err) { console.error(`❌ Błąd usuwania konta ${docSnap.id}:`, err); }
      }));
    } catch (error) {
      console.error("❌ Błąd ścieżki kont canceled:", error);
    }

    // 2) F2: porzucone triale — status 'trialing', trialEndsAt (Timestamp) starszy
    // niż TRIAL_RETENTION_DAYS. Zapytanie zakresowe dopasuje wyłącznie wartości
    // typu Timestamp (legacy stringi bezpiecznie poza zakresem). Przed
    // nieodwracalnym usunięciem dodatkowa weryfikacja danych dokumentu (fail-safe).
    try {
      const trialCutoff = new Date(now);
      trialCutoff.setDate(trialCutoff.getDate() - TRIAL_RETENTION_DAYS);
      const trialStillEligible = (d) => d.status === "trialing"
        && d.trialEndsAt && typeof d.trialEndsAt.toDate === "function"
        && d.trialEndsAt.toDate() <= trialCutoff;
      const abandonedSnap = await db
        .collection("users")
        .where("status", "==", "trialing")
        .where("trialEndsAt", "<=", Timestamp.fromDate(trialCutoff))
        .get();
      console.log(`🧹 Porzucone triale (koniec > ${TRIAL_RETENTION_DAYS} dni temu): ${abandonedSnap.size}`);
      await Promise.allSettled(abandonedSnap.docs.map(async (docSnap) => {
        if (!trialStillEligible(docSnap.data())) {
          console.warn(`⚠️ Pominięto ${docSnap.id} — dane dokumentu nie potwierdzają kwalifikacji do usunięcia.`);
          return;
        }
        try { await purgeAccountCompletely(docSnap, `porzucony trial ${TRIAL_RETENTION_DAYS} dni`, trialStillEligible, stripe); }
        catch (err) { console.error(`❌ Błąd usuwania konta ${docSnap.id}:`, err); }
      }));
    } catch (error) {
      console.error("❌ Błąd ścieżki porzuconych triali:", error);
    }
  }
);

// =============================================================================
// 5. SYNCHRONIZACJA KALENDARZY iCAL (Booking, Airbnb itp.)
//
// X26 (2026-08-22): logika PRZENIESIONA do `functions/ical-sync.js`. Do tej pory
// żyła tu w dwóch niemal identycznych kopiach (ręczny przycisk + harmonogram),
// a kluczem tożsamości rezerwacji były DATY, nie `UID` ze zdarzenia — przez co
// anulowanie zostawiało zablokowany termin na zawsze, a zmiana dat tworzyła
// drugą rezerwację obok pierwszej. Pełne uzasadnienie w nagłówku modułu.
//
// Tutaj zostają wyłącznie BRAMKI: uwierzytelnienie, weryfikacja e-maila
// i subskrypcja. To one chronią funkcję przed użyciem jako proxy SSRF przez
// świeże konto (audyt N5 🟡3) i nie wolno ich osłabiać przy refaktorach.
// =============================================================================
exports.syncICalCalendars = onCall(
  { enforceAppCheck: true, maxInstances: 3 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Musisz być zalogowany, aby synchronizować kalendarze.");
    }

    // Bramka spójna z regułami rentals (audyt N5 🟡3): bez niej dowolne świeże
    // konto (niezweryfikowane, bez subskrypcji) mogło używać funkcji jako proxy SSRF.
    if (request.auth.token.email_verified !== true) {
      throw new HttpsError("permission-denied", "Zweryfikuj adres e-mail, aby synchronizować kalendarze.");
    }

    const uid = request.auth.uid;

    if (request.auth.token.stripeStatus !== "active") {
      const userSnap = await db.collection("users").doc(uid).get();
      const u = userSnap.exists ? userSnap.data() : {};
      const status = u.status || u.accountStatus || "none";
      const trialAlive = status === "trialing" && u.trialEndsAt &&
        typeof u.trialEndsAt.toDate === "function" && u.trialEndsAt.toDate() > new Date();
      if (status !== "active" && !trialAlive) {
        throw new HttpsError("permission-denied", "Synchronizacja wymaga aktywnej subskrypcji lub okresu próbnego.");
      }
    }

    const { syncLinks } = request.data;
    if (!syncLinks || typeof syncLinks !== "object" || Object.keys(syncLinks).length === 0) {
      throw new HttpsError("invalid-argument", "Brak linków synchronizacji. Podaj obiekt syncLinks.");
    }

    try {
      const wynik = await icalSync.syncUser(db, uid, syncLinks, console);
      console.log(`✅ Synchronizacja iCal dla ${uid}:`, JSON.stringify(wynik));
      // `newBookingsCount` zostaje dla zgodności ze starym frontem; reszta pól jest nowa.
      return {
        newBookingsCount: wynik.dodane,
        dodane: wynik.dodane,
        zmienione: wynik.zmienione,
        znikle: wynik.znikle,
        wrocone: wynik.wrocone,
        bledy: wynik.bledy,
      };
    } catch (error) {
      console.error("❌ Błąd synchronizacji iCal:", error);
      throw new HttpsError("internal", "Wystąpił błąd podczas synchronizacji kalendarzy.");
    }
  }
);

// =============================================================================
// 6. AUTOMATYCZNA SYNCHRONIZACJA iCAL — CO GODZINĘ (Scheduled Function)
//
// X26: było „raz na dobę 06:00". Portale odświeżają importowane kalendarze mniej
// więcej co 3 godziny, a nasza doba dokładała do tego opóźnienia do 24 godzin —
// byliśmy najsłabszym ogniwem łańcucha.
//
// ⚠️ CZĘSTOTLIWOŚĆ JEST BEZPIECZNA KOSZTOWO WYŁĄCZNIE DZIĘKI DOKUMENTOWI STANU
// w `ical-sync.js`. Przy starym wzorcu (osobne zapytanie na każde zdarzenie feedu)
// przejście na godzinę ścinało darmowy próg Firebase ze ~104 kont do ~10 —
// policzone w `docs/strategy/Rentownosc-symulacja-2026-08-22.md`. Niezmieniony feed
// kosztuje dziś JEDEN odczyt i zero zapisów.
//
// Współbieżność jest ograniczona: wcześniej wszyscy użytkownicy szli równolegle
// przez `Promise.allSettled` w jednym wywołaniu, co przy wzroście cicho przekraczało
// limit czasu i część kont przestawała się synchronizować bez żadnego sygnału.
// =============================================================================
const ROWNOLEGLE_KONTA = 5;

exports.dailyICalSync = onSchedule(
  {
    schedule: "every 1 hours",
    timeZone: "Europe/Warsaw",
    maxInstances: 1,
    timeoutSeconds: 540,
    memory: "512MiB",
  },
  async (_event) => {
    const logger = require("firebase-functions/logger");
    logger.info("🔄 Rozpoczęto automatyczną synchronizację iCal...");

    let kont = 0, dodane = 0, zmienione = 0, znikle = 0, bledy = 0;

    try {
      const aktywni = await db
        .collection("users")
        .where("status", "in", ["active", "trialing"])
        .get();

      if (aktywni.empty) {
        logger.info("🔄 Brak aktywnych użytkowników do synchronizacji.");
        return;
      }
      logger.info(`🔄 Znaleziono ${aktywni.size} aktywnych użytkowników.`);

      // Porcjami po ROWNOLEGLE_KONTA, nie wszyscy naraz.
      //
      // ⚠️ Same porcje bez budżetu czasu dają DETERMINISTYCZNE ZAGŁODZENIE: kolejność
      // `aktywni.docs` jest w każdym przebiegu ta sama, więc po wyczerpaniu limitu 540 s
      // ucinane byłyby zawsze TE SAME konta z końca listy — i to bez śladu w logu, bo
      // timeout funkcji nie przechodzi przez `catch`. Stąd twardy budżet i wpis o tym,
      // ile kont zostało nietkniętych. Rotacja punktu startu wyrównuje szanse między
      // przebiegami, żeby ogon listy też bywał obsłużony jako pierwszy.
      const START = Date.now();
      const BUDZET_MS = 450000;                       // 450 s z 540 s limitu
      const offset = (new Date().getHours() * ROWNOLEGLE_KONTA) % Math.max(1, aktywni.docs.length);
      const kolejka = [...aktywni.docs.slice(offset), ...aktywni.docs.slice(0, offset)];
      let pominietoZBraku = 0;

      for (let i = 0; i < kolejka.length; i += ROWNOLEGLE_KONTA) {
        if (Date.now() - START > BUDZET_MS) { pominietoZBraku = kolejka.length - i; break; }
        const porcja = kolejka.slice(i, i + ROWNOLEGLE_KONTA);
        const wyniki = await Promise.allSettled(porcja.map(async (userDoc) => {
          const uid = userDoc.id;
          // Ta sama bramka co w ścieżce ręcznej. `status: 'trialing'` utrzymuje się jeszcze
          // przez TRIAL_RETENTION_DAYS po wygaśnięciu okresu próbnego, więc bez sprawdzenia
          // `trialEndsAt` porzucone konto kazałoby nam odpytywać wskazane adresy co godzinę
          // przez ponad trzy miesiące — ryzyko „proxy SSRF przez świeże konto" z audytu
          // N5 🟡3, tylko pomnożone przez 24 i na ścieżce, która bramki nie miała.
          const u = userDoc.data() || {};
          const st = u.status || u.accountStatus || "none";
          if (st !== "active") {
            const trialAlive = st === "trialing" && u.trialEndsAt &&
              typeof u.trialEndsAt.toDate === "function" && u.trialEndsAt.toDate() > new Date();
            if (!trialAlive) return null;
          }

          const linksDoc = await db.collection("users").doc(uid)
            .collection("settings").doc("syncLinks").get();
          if (!linksDoc.exists) return null;
          const syncLinks = linksDoc.data()?.links;
          if (!syncLinks || typeof syncLinks !== "object" || Object.keys(syncLinks).length === 0) return null;
          return icalSync.syncUser(db, uid, syncLinks, logger);
        }));

        for (const w of wyniki) {
          if (w.status === "rejected") { bledy++; continue; }
          if (!w.value) continue;
          kont++;
          dodane += w.value.dodane;
          zmienione += w.value.zmienione;
          znikle += w.value.znikle;
          bledy += w.value.bledy;
        }
      }

      logger.info(
        `🔄 Synchronizacja zakończona: ${kont} kont, +${dodane} nowych, ` +
        `${zmienione} zaktualizowanych, ${znikle} znikłych z portalu, ${bledy} błędów.`
      );
      if (pominietoZBraku > 0) {
        logger.warn(`⏱️ Budżet czasu wyczerpany — ${pominietoZBraku} kont nietkniętych w tym przebiegu (obsłuży je kolejny).`);
      }
    } catch (error) {
      logger.error("❌ Błąd krytyczny automatycznej synchronizacji iCal:", error);
    }
  }
);


// =============================================================================
// 7. USUWANIE KONTA UŻYTKOWNIKA I DANYCH (Right to be forgotten)
// =============================================================================
exports.deleteUserAccount = onCall(
  { secrets: [stripeSecretKey], enforceAppCheck: true, maxInstances: 3 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Musisz być zalogowany, aby usunąć konto.");
    }
    const uid = request.auth.uid;
    const stripe = require("stripe")(stripeSecretKey.value().trim());

    try {
      // 1. Sprawdź, czy użytkownik ma Stripe Customer ID
      const userDoc = await db.collection("users").doc(uid).get();
      const userData = userDoc.data();

      if (userData?.stripeCustomerId) {
        // Anuluj wszystkie aktywne subskrypcje i usuń klienta
        try {
          await stripe.customers.del(userData.stripeCustomerId);
          console.log(`✅ Stripe Customer usunięty: ${userData.stripeCustomerId}`);
        } catch (stripeErr) {
          console.warn(`⚠️ Błąd usuwania Stripe Customer: ${stripeErr.message}`);
          // Nie rzucamy wyjątku, próbujemy kontynuować kasowanie
        }
      }

      // 2. Usuń przewodniki użytkownika (sekrety + podpisy gości + pliki Storage)
      //    — najpierw dane najbardziej wrażliwe publicznie, potem biznesowe
      //    (parytet kolejności 1:1 z purgeAccountCompletely, C.1)
      const guidesDeleted = await deleteUserGuides(uid);
      console.log(`✅ Usunięto ${guidesDeleted} przewodników użytkownika ${uid}.`);

      // 3. Wyczyść dane biznesowe użytkownika
      await cleanupUserData(uid);

      // 4. Usuń login Auth PRZED dokumentem (finding N5 🟡A, lustro fixu F1): przy
      // otwartej aplikacji skasowanie dokumentu przed Auth wyzwalało self-heal
      // w useFirebaseData, który wskrzeszał dokument z nowym 14-dniowym trialem.
      try {
        await getAuth().deleteUser(uid);
      } catch (authErr) {
        if (authErr.code !== "auth/user-not-found") throw authErr;
      }
      await userDoc.ref.delete();
      console.log(`✅ Użytkownik ${uid} został całkowicie usunięty z systemu.`);
      
      return { success: true };
    } catch (error) {
      console.error(`❌ Błąd usuwania konta ${uid}:`, error);
      throw new HttpsError("internal", "Wystąpił błąd podczas usuwania konta.");
    }
  }
);

// =============================================================================
// 7b. USUWANIE POJEDYNCZEGO PRZEWODNIKA (serwerowo — z subkolekcjami i Storage)
// Klient (deleteDoc) kasował tylko dokument główny; sekrety, podpisy gości i pliki
// Storage zostawały osierocone i nieusuwalne (audyt N5 🟡 F3). Tu kasujemy komplet
// po weryfikacji właściciela.
// =============================================================================
exports.deleteGuide = onCall(
  { enforceAppCheck: true, maxInstances: 5 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Musisz być zalogowany, aby usunąć przewodnik.");
    }
    const uid = request.auth.uid;
    const guideId = (request.data?.guideId || "").toString();
    if (!guideId || !/^[a-zA-Z0-9_-]+$/.test(guideId)) {
      throw new HttpsError("invalid-argument", "Nieprawidłowy identyfikator przewodnika.");
    }

    const guideRef = db.collection("guides").doc(guideId);
    const snap = await guideRef.get();
    if (!snap.exists) {
      return { success: true }; // już usunięty — idempotentnie
    }
    if (snap.data().ownerId !== uid) {
      throw new HttpsError("permission-denied", "To nie jest Twój przewodnik.");
    }

    try {
      const bucket = getStorage(app).bucket();
      await deleteGuideCompletely(guideRef, bucket);
      console.log(`✅ Przewodnik ${guideId} usunięty w całości przez właściciela ${uid}.`);
      return { success: true };
    } catch (error) {
      console.error(`❌ Błąd usuwania przewodnika ${guideId}:`, error);
      throw new HttpsError("internal", "Wystąpił błąd podczas usuwania przewodnika.");
    }
  }
);

// =============================================================================
// 8. EKSPORT KALENDARZA (iCal Channel Manager)
// Umożliwia pobranie kalendarza w formacie .ics dla konkretnego obiektu
// =============================================================================
// maxInstances domknięte przy przeglądzie taskIcs (2026-08-28): jedyne dwie funkcje
// bez capa to były oba publiczne endpointy — portale odpytują feed kilka razy dziennie
// per obiekt, więc 3 instancje wystarczają z zapasem, a zalew żądań nie skaluje kosztów.
exports.exportIcal = onRequest({ maxInstances: 3 }, async (req, res) => {
  const userId = (req.query.u || '').toString().slice(0, 128);
  const propertyId = (req.query.p || '').toString().slice(0, 200);
  const token = (req.query.token || '').toString().slice(0, 256);

  if (!userId || !propertyId || !token) {
    return res.status(400).send("Brak parametrów u (userId), p (propertyId) lub token.");
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
    return res.status(400).send("Nieprawidłowy format userId.");
  }

  try {
    const propsDoc = await db.collection('users').doc(userId).collection('settings').doc('properties').get();
    const propsData = propsDoc.data();
    if (!propsData || !propsData.items) {
      return res.status(403).send("Brak autoryzacji.");
    }

    // Parametr `p` bywa identyfikatorem ALBO nazwą. Nazwę przyjmujemy wyłącznie dla
    // zgodności wstecz: adresy wydane przed X26 zawierały nazwę obiektu, więc zmiana
    // nazwy w panelu ZABIJAŁA feed wklejony wcześniej do Booking.com — po cichu, bo
    // portal dostawał 403 i przestawał widzieć blokady. Panel wydaje dziś adresy z `id`.
    const property = propsData.items.find(p => p.id === propertyId || p.name === propertyId);
    if (!property || property.secretToken !== token) {
      return res.status(403).send("Nieprawidłowy token.");
    }

    // ⚠️ Rezerwacje trzymają w polu `property` NAZWĘ obiektu, nie identyfikator.
    // Odpytanie po `propertyId` zwróciłoby pusty kalendarz dla adresów z `id`.
    const propertyName = property.name;

    // Okno czasowe: portalowi potrzebne są terminy, które jeszcze blokują kalendarz.
    // Bez tego feed rósł bez końca — po kilku sezonach to setki zdarzeń wysyłanych
    // co kilka godzin do każdego portalu.
    const okno = new Date();
    okno.setDate(okno.getDate() - 30);
    const odDnia = okno.toISOString().slice(0, 10);

    const snapshot = await db.collection('users').doc(userId).collection('rentals')
      .where('type', '==', 'booking')
      .where('property', '==', propertyName)
      .get();

    // `\r` USUWAMY, nie escapujemy: reguły sprawdzają dla `properties` wyłącznie „to lista",
    // więc nazwa obiektu może zawierać cokolwiek wpisane przez API.
    const esc = (t) => String(t).replace(/\r/g, "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

    let ical = "BEGIN:VCALENDAR\r\n";
    ical += "VERSION:2.0\r\n";
    // PRODID mówił „ChannelManager". Nie jesteśmy channel managerem — iCal przenosi
    // samą zajętość, bez cen i wiadomości. Nazwa, którą sobie nadajesz w kodzie,
    // wycieka do myślenia o produkcie (X26).
    ical += "PRODID:-//WynajemPRO//Kalendarz obiektu//PL\r\n";
    ical += "CALSCALE:GREGORIAN\r\n";
    ical += "METHOD:PUBLISH\r\n";
    ical += `X-WR-CALNAME:${esc(propertyName)}\r\n`;

    const doIcal = (d) => (d ? d.split('-').join('') : null);
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + "Z";
    let wydane = 0;

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (!data.date) return;

      // Rezerwacja, która zniknęła z portalu źródłowego, nie blokuje już terminu
      // u nas — nie ma powodu blokować go w pozostałych portalach (X26).
      if (data.syncStatus === 'vanished') return;
      if (data.endDate && data.endDate < odDnia) return;
      if (!data.endDate && data.date < odDnia) return;

      const dtstart = doIcal(data.date);
      let dtend = doIcal(data.endDate);
      if (!dtend) {
        const d = new Date(data.date);
        d.setDate(d.getDate() + 1);
        dtend = d.toISOString().split('T')[0].replace(/-/g, '');
      }
      if (!dtstart || !dtend) return;

      ical += "BEGIN:VEVENT\r\n";
      ical += `UID:${docSnap.id}@wynajempro.pl\r\n`;
      ical += `DTSTAMP:${now}\r\n`;
      ical += `DTSTART;VALUE=DATE:${dtstart}\r\n`;
      ical += `DTEND;VALUE=DATE:${dtend}\r\n`;
      ical += "SUMMARY:Rezerwacja z WynajemPRO\r\n";
      ical += "STATUS:CONFIRMED\r\n";
      ical += "END:VEVENT\r\n";
      wydane++;
    });

    ical += "END:VCALENDAR\r\n";

    // Bez nazwy obiektu. Rozróżnienie względem logów silnika synchronizacji (te nazwę
    // podają, bo służą diagnostyce konkretnego konta): TEN endpoint jest publiczny,
    // nieuwierzytelniony i odpytywany przez portale kilka razy dziennie dla każdego
    // obiektu — nazwa bywa postaci „Apartament Kowalskich, Długa 5".
    console.log(`📅 exportIcal: ${wydane} zdarzeń, user ${userId}`);
    res.set('Content-Type', 'text/calendar; charset=utf-8');
    // `private`, nie `public`: token autoryzacyjny siedzi w query stringu, więc klucz cache
    // pośrednika zawierałby sekret. Zysk wydajnościowy ten sam.
    res.set('Cache-Control', 'private, max-age=900');
    const nazwaPliku = (propertyName || 'obiekt').replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 60);
    res.set('Content-Disposition', `attachment; filename="kalendarz_${nazwaPliku}.ics"`);
    res.status(200).send(ical);
  } catch (error) {
    console.error("Błąd generowania pliku iCal:", error);
    res.status(500).send("Wystąpił błąd serwera.");
  }
});

// =============================================================================
// 8a. ZADANIE JAKO WYDARZENIE KALENDARZA (E6, runda 3)
// Czysty formatter: parametry query → .ics z jednym wydarzeniem, podany INLINE,
// żeby nawigacja na iOS otwierała podgląd Safari „Dodaj wszystkie" zamiast pobierania.
// Logika i uzasadnienia w functions/task-ics.js; bez App Check (nawigacja nie niesie
// tokenu) i bez Firestore — endpoint publiczny z założenia, jak exportIcal.
// =============================================================================
// maxInstances: odpowiedź jest tania (~0,5 KB, zero odczytów), więc niski cap niczego
// nie psuje, a zalew żądań dusi ruch zamiast skalować rachunek (przegląd rundy 3).
exports.taskIcs = onRequest({ maxInstances: 3 }, (req, res) => {
  const wynik = taskIcsResponse(req.query);
  // Idiom exportIcal: endpoint publiczny nie loguje treści od użytkownika —
  // wyłącznie status i rozmiar odpowiedzi.
  console.log(`📅 taskIcs: ${wynik.status}, ${wynik.body.length} B`);
  if (wynik.headers) res.set(wynik.headers);
  // Endpoint odbija cudzy tekst w ciele odpowiedzi — nosniff to tani pas bezpieczeństwa.
  res.set('X-Content-Type-Options', 'nosniff');
  res.status(wynik.status).send(wynik.body);
});

// =============================================================================
// 12. PANEL ADMINISTRATORA (adminApi)
// Osobny moduł — bramka uprawnień, stopniowanie dostępu i dziennik są tam opisane.
// Wystawiane stąd, żeby `firebase deploy --only functions` widział je jak resztę.
// =============================================================================
exports.adminApi = require("./admin").adminApi;

// Retencja dziennika dostępu — `admin_audit` to zbiór danych osobowych i nie może
// rosnąć bez granicy. Okres zatwierdzony 2026-08-26 (12 mies. od zapisu); opis przy
// stałej AUDIT_RETENTION_MONTHS w admin.js.
exports.cleanupAdminAudit = require("./admin").cleanupAdminAudit;

// Retencja zgłoszeń z formularza kontaktowego — Polityka §2: 12 miesięcy od
// zakończenia korespondencji (decyzja B-5, 2026-08-26). Reguła i pełny opis przy
// funkcji w admin.js; operacjonalizacja końca korespondencji w admin-data.js.
exports.cleanupContactMessages = require("./admin").cleanupContactMessages;
