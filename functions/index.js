const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

// Inicjalizacja Firebase Admin
const app = initializeApp();
const db = getFirestore(app);

// Sekrety (ustaw przez: firebase functions:secrets:set STRIPE_SECRET_KEY)
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

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

  console.log(
    `🧹 Dane użytkownika ${uid} wyczyszczone: ` +
    `${rentalsDeleted} rezerwacji, ${settingsDeleted} ustawień, ${checkoutDeleted} sesji checkout`
  );

  // Czyścimy pola Stripe z profilu, ale zostawiamy sam dokument
  await userRef.update({
    stripeSubscriptionId: FieldValue.delete(),
    paidAt: FieldValue.delete(),
    lastPaymentAt: FieldValue.delete(),
    dataCleanedAt: Timestamp.now(),
  });

  return { rentalsDeleted, settingsDeleted, checkoutDeleted };
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
    const stripe = require("stripe")(stripeSecretKey.value());

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
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: "price_1TZULu8D7fwsePNBa7aXaP92", // Twój Price ID ze Stripe
            quantity: 1,
          },
        ],
        success_url: request.data.successUrl || "https://wynajempro.pl/dashboard",
        cancel_url: request.data.cancelUrl || "https://wynajempro.pl/dashboard",
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

    const stripe = require("stripe")(stripeSecretKey.value());
    const sig = req.headers["stripe-signature"];

    let event;

    // Weryfikacja podpisu webhooka
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        sig,
        stripeWebhookSecret.value()
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
            await getAuth().setCustomUserClaims(uid, { stripeStatus: 'active' });
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
              await getAuth().setCustomUserClaims(userDoc.id, { stripeStatus: 'active' });
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
              await getAuth().setCustomUserClaims(userDoc.id, { stripeStatus: 'past_due' });
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
            console.log(`❌ Subskrypcja anulowana dla użytkownika: ${uid}. Planowane usunięcie danych: ${deletionDate.toISOString()}`);
            await db.collection("users").doc(uid).update({
              status: "canceled",
              canceledAt: Timestamp.now(),
              scheduledDeletionAt: Timestamp.fromDate(deletionDate),
            });
            await getAuth().setCustomUserClaims(uid, { stripeStatus: 'canceled' });
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
              await getAuth().setCustomUserClaims(resolvedUid, { stripeStatus: 'canceled' });
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
      await getAuth().setCustomUserClaims(uid, { 
        stripeStatus: 'trialing',
        trialEndsAt: data.trialEndsAt.toMillis()
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
    const stripe = require("stripe")(stripeSecretKey.value());

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
        return_url: request.data.returnUrl || "https://wynajempro.pl/dashboard",
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
exports.deleteExpiredAccountsData = onSchedule(
  {
    schedule: "every day 02:00",
    timeZone: "Europe/Warsaw",
    maxInstances: 1,
  },
  async (event) => {
    const now = new Date();
    console.log(`🧹 Uruchomiono cykliczne czyszczenie bazy danych: ${now.toISOString()}`);

    try {
      const snapshot = await db
        .collection("users")
        .where("status", "==", "canceled")
        .where("scheduledDeletionAt", "<=", now)
        .get();

      if (snapshot.empty) {
        console.log("🧹 Brak kont kwalifikujących się do usunięcia danych.");
        return;
      }

      console.log(`🧹 Znaleziono ${snapshot.size} kont do wyczyszczenia.`);

      for (const docSnap of snapshot.docs) {
        const uid = docSnap.id;
        try {
          console.log(`🧹 Rozpoczynanie usuwania danych dla użytkownika: ${uid}`);
          const result = await cleanupUserData(uid);
          
          // Usuwamy również pole scheduledDeletionAt, aby zapobiec ponownemu czyszczeniu
          await docSnap.ref.update({
            scheduledDeletionAt: FieldValue.delete(),
          });
          
          console.log(`✅ Pomyślnie wyczyszczono dane dla ${uid}:`, result);
        } catch (err) {
          console.error(`❌ Błąd czyszczenia danych dla użytkownika ${uid}:`, err);
        }
      }
    } catch (error) {
      console.error("❌ Błąd krytyczny podczas cyklicznego czyszczenia baz danych:", error);
    }
  }
);

// =============================================================================
// 5. SYNCHRONIZACJA KALENDARZY iCAL (Booking, Airbnb itp.)
// Pobiera pliki iCal z podanych linków, parsuje zdarzenia VEVENT,
// sprawdza duplikaty po syncId i dodaje nowe rezerwacje do Firestore.
// =============================================================================
exports.syncICalCalendars = onCall(
  { enforceAppCheck: true, maxInstances: 3 },
  async (request) => {
    // Sprawdzenie uwierzytelnienia
    if (!request.auth) {
      throw new HttpsError(
        "unauthenticated",
        "Musisz być zalogowany, aby synchronizować kalendarze."
      );
    }

    const uid = request.auth.uid;
    const { syncLinks } = request.data;

    // Walidacja danych wejściowych
    if (!syncLinks || typeof syncLinks !== "object" || Object.keys(syncLinks).length === 0) {
      throw new HttpsError(
        "invalid-argument",
        "Brak linków synchronizacji. Podaj obiekt syncLinks."
      );
    }

    let newBookingsCount = 0;

    try {
      // Iteracja po nieruchomościach i ich linkach
      for (const [propertyName, links] of Object.entries(syncLinks)) {
        // Każda nieruchomość może mieć linki: booking, airbnb itp.
        for (const [sourceName, url] of Object.entries(links)) {
          if (!url || typeof url !== "string") continue;

          // Pobieranie pliku iCal za pomocą wbudowanego fetch (Node 20+)
          let icalText;
          try {
            const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
            if (!response.ok) {
              console.warn(`⚠️ Nie udało się pobrać iCal dla ${propertyName}/${sourceName}: HTTP ${response.status}`);
              continue;
            }
            icalText = await response.text();
          } catch (fetchErr) {
            console.warn(`⚠️ Błąd pobierania iCal dla ${propertyName}/${sourceName}:`, fetchErr.message);
            continue;
          }

          // Parsowanie bloków VEVENT z pliku iCal
          const events = parseICalEvents(icalText);

          for (const event of events) {
            // Formatowanie dat do YYYY-MM-DD
            const startDate = formatICalDate(event.dtstart);
            const endDate = formatICalDate(event.dtend);
            if (!startDate || !endDate) continue;

            // Normalizacja nazwy źródła (pierwsza litera wielka)
            const normalizedSource = sourceName.charAt(0).toUpperCase() + sourceName.slice(1);

            // Generowanie unikalnego identyfikatora synchronizacji
            const syncId = `sync_${sourceName}_${propertyName}_${startDate}_${endDate}`;

            // Sprawdzenie duplikatów — szukamy dokumentu z takim samym syncId
            const duplicateSnapshot = await db
              .collection("users")
              .doc(uid)
              .collection("rentals")
              .where("syncId", "==", syncId)
              .limit(1)
              .get();

            if (!duplicateSnapshot.empty) continue; // Już istnieje — pomijamy

            // Ustalenie nazwy gościa na podstawie SUMMARY
            const summary = (event.summary || "").trim();
            let guest;
            const lowerSummary = summary.toLowerCase();
            if (lowerSummary.includes("blocked") || lowerSummary.includes("niedostępne")) {
              guest = `Blokada (${normalizedSource})`;
            } else {
              guest = summary || `Gość ${normalizedSource}`;
            }

            // Tworzenie nowego dokumentu rezerwacji w Firestore
            await db
              .collection("users")
              .doc(uid)
              .collection("rentals")
              .add({
                type: "booking",
                property: propertyName,
                source: normalizedSource,
                guest: guest,
                date: startDate,
                endDate: endDate,
                income: 0,
                advancePayment: 0,
                isAdvancePaid: false,
                commission: 0,
                tax: 0,
                vat: 0,
                utilities: 0,
                isPaid: false,
                completedTasks: {},
                guestNote: "",
                syncId: syncId,
              });

            newBookingsCount++;
          }
        }
      }

      console.log(`✅ Synchronizacja iCal dla ${uid}: dodano ${newBookingsCount} nowych rezerwacji.`);
      return { newBookingsCount };
    } catch (error) {
      console.error("❌ Błąd synchronizacji iCal:", error);
      throw new HttpsError(
        "internal",
        "Wystąpił błąd podczas synchronizacji kalendarzy."
      );
    }
  }
);

// =============================================================================
// HELPER: Parsowanie zdarzeń VEVENT z tekstu iCal
// Wyodrębnia DTSTART, DTEND, SUMMARY i UID z każdego bloku VEVENT.
// =============================================================================
function parseICalEvents(icalText) {
  const events = [];
  // Normalizacja łamania linii (unfold kontynuacji RFC 5545)
  const normalized = icalText.replace(/\r\n[ \t]/g, "").replace(/\r/g, "");
  const blocks = normalized.split("BEGIN:VEVENT");

  for (let i = 1; i < blocks.length; i++) {
    const block = blocks[i].split("END:VEVENT")[0];
    const event = {};

    // Wyciąganie wartości z pól iCal (ignorowanie parametrów po średniku)
    const lines = block.split("\n");
    for (const line of lines) {
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;

      const key = line.substring(0, colonIdx).split(";")[0].trim().toUpperCase();
      const value = line.substring(colonIdx + 1).trim();

      switch (key) {
        case "DTSTART":
          event.dtstart = value;
          break;
        case "DTEND":
          event.dtend = value;
          break;
        case "SUMMARY":
          event.summary = value;
          break;
        case "UID":
          event.uid = value;
          break;
      }
    }

    // Dodajemy tylko zdarzenia z datą rozpoczęcia
    if (event.dtstart) {
      events.push(event);
    }
  }

  return events;
}

// =============================================================================
// HELPER: Konwersja daty iCal (np. 20250615 lub 20250615T140000Z) na YYYY-MM-DD
// =============================================================================
function formatICalDate(dateStr) {
  if (!dateStr || dateStr.length < 8) return null;
  // Wyciągamy pierwsze 8 znaków (YYYYMMDD) niezależnie od formatu
  const raw = dateStr.replace(/[^\d]/g, "").substring(0, 8);
  if (raw.length < 8) return null;
  return `${raw.substring(0, 4)}-${raw.substring(4, 6)}-${raw.substring(6, 8)}`;
}
