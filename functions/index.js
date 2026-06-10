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

      const promises = snapshot.docs.map(async (docSnap) => {
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
      });
      await Promise.allSettled(promises);
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

          if (!isSafeUrl(url)) {
            console.warn(`⚠️ Odrzucono niebezpieczny URL: ${url}`);
            continue;
          }

          // Pobieranie pliku iCal za pomocą wbudowanego fetch (Node 20+)
          // Zabezpieczenie przed atakiem OOM (Out Of Memory) DoS - limit 5MB
          const MAX_ICAL_SIZE_BYTES = 5 * 1024 * 1024;
          let icalText = "";
          try {
            const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
            if (!response.ok) {
              console.warn(`⚠️ Nie udało się pobrać iCal dla ${propertyName}/${sourceName}: HTTP ${response.status}`);
              continue;
            }
            
            // Opcjonalne wczesne odrzucenie na podstawie nagłówka Content-Length
            const contentLength = response.headers.get("content-length");
            if (contentLength && parseInt(contentLength, 10) > MAX_ICAL_SIZE_BYTES) {
              console.warn(`⚠️ Odrzucono iCal dla ${propertyName}/${sourceName}: Plik za duży (Content-Length > 5MB)`);
              continue;
            }

            // Strumieniowe odczytywanie z limitem wielkości (aby zablokować złośliwy streaming bez Content-Length)
            const reader = response.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let bytesRead = 0;
            
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              bytesRead += value.length;
              if (bytesRead > MAX_ICAL_SIZE_BYTES) {
                // Przerywamy połączenie
                reader.cancel("Osiągnięto limit wielkości pliku (5MB)");
                throw new Error("Plik iCal przekracza dozwolony limit wielkości (5MB)");
              }
              icalText += decoder.decode(value, { stream: true });
            }
            // Zdekodowanie reszty
            icalText += decoder.decode();

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
// 6. AUTOMATYCZNA SYNCHRONIZACJA iCAL — RAZ NA DOBĘ (Scheduled Function)
// Iteruje po wszystkich aktywnych użytkownikach, pobiera ich syncLinks
// i wykonuje tę samą logikę synchronizacji co ręczny przycisk.
// =============================================================================
exports.dailyICalSync = onSchedule(
  {
    schedule: "every day 06:00",
    timeZone: "Europe/Warsaw",
    maxInstances: 1,
  },
  async (event) => {
    const logger = require("firebase-functions/logger");
    logger.info("🔄 Rozpoczęto automatyczną synchronizację iCal...");

    let totalUsersProcessed = 0;
    let totalNewBookings = 0;
    let totalErrors = 0;

    try {
      // Pobierz wszystkich użytkowników z aktywną subskrypcją
      const activeSnapshot = await db
        .collection("users")
        .where("status", "in", ["active", "trialing"])
        .get();

      if (activeSnapshot.empty) {
        logger.info("🔄 Brak aktywnych użytkowników do synchronizacji.");
        return;
      }

      logger.info(`🔄 Znaleziono ${activeSnapshot.size} aktywnych użytkowników.`);

      const processPromises = activeSnapshot.docs.map(async (userDoc) => {
        const uid = userDoc.id;

        try {
          // Pobierz syncLinks z ustawień użytkownika
          const syncLinksDoc = await db
            .collection("users")
            .doc(uid)
            .collection("settings")
            .doc("syncLinks")
            .get();

          if (!syncLinksDoc.exists) return null;

          const syncLinks = syncLinksDoc.data()?.links;
          if (!syncLinks || typeof syncLinks !== "object" || Object.keys(syncLinks).length === 0) {
            return null;
          }

          // Wykonaj synchronizację — ta sama logika co w ręcznym syncICalCalendars
          let userNewBookings = 0;

          for (const [propertyName, links] of Object.entries(syncLinks)) {
            for (const [sourceName, url] of Object.entries(links)) {
              if (!url || typeof url !== "string") continue;

              if (!isSafeUrl(url)) continue;

              // Pobieranie pliku iCal za pomocą wbudowanego fetch (Node 20+) z limitem 5MB
              const MAX_ICAL_SIZE_BYTES = 5 * 1024 * 1024;
              let icalText = "";
              try {
                const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
                if (!response.ok) {
                  logger.warn(`⚠️ [${uid}] HTTP ${response.status} dla ${propertyName}/${sourceName}`);
                  continue;
                }
                
                const contentLength = response.headers.get("content-length");
                if (contentLength && parseInt(contentLength, 10) > MAX_ICAL_SIZE_BYTES) {
                  logger.warn(`⚠️ [${uid}] Odrzucono iCal dla ${propertyName}/${sourceName}: Plik za duży (Content-Length > 5MB)`);
                  continue;
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder("utf-8");
                let bytesRead = 0;
                
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  
                  bytesRead += value.length;
                  if (bytesRead > MAX_ICAL_SIZE_BYTES) {
                    reader.cancel("Osiągnięto limit wielkości pliku (5MB)");
                    throw new Error("Plik iCal przekracza dozwolony limit wielkości (5MB)");
                  }
                  icalText += decoder.decode(value, { stream: true });
                }
                icalText += decoder.decode();

              } catch (fetchErr) {
                logger.warn(`⚠️ [${uid}] Błąd pobierania ${propertyName}/${sourceName}: ${fetchErr.message}`);
                continue;
              }

              const events = parseICalEvents(icalText);

              for (const evt of events) {
                const startDate = formatICalDate(evt.dtstart);
                const endDate = formatICalDate(evt.dtend);
                if (!startDate || !endDate) continue;

                const normalizedSource = sourceName.charAt(0).toUpperCase() + sourceName.slice(1);
                const syncId = `sync_${sourceName}_${propertyName}_${startDate}_${endDate}`;

                // Sprawdź duplikaty
                const duplicateSnapshot = await db
                  .collection("users")
                  .doc(uid)
                  .collection("rentals")
                  .where("syncId", "==", syncId)
                  .limit(1)
                  .get();

                if (!duplicateSnapshot.empty) continue;

                // Ustal nazwę gościa
                const summary = (evt.summary || "").trim();
                const lowerSummary = summary.toLowerCase();
                let guest;
                if (lowerSummary.includes("blocked") || lowerSummary.includes("niedostępne")) {
                  guest = `Blokada (${normalizedSource})`;
                } else {
                  guest = summary || `Gość ${normalizedSource}`;
                }

                // Dodaj rezerwację
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

                userNewBookings++;
              }
            }
          }

          if (userNewBookings > 0) {
            logger.info(`✅ [${uid}] Dodano ${userNewBookings} nowych rezerwacji.`);
          }

          return { userNewBookings };
        } catch (userErr) {
          logger.error(`❌ [${uid}] Błąd synchronizacji: ${userErr.message}`);
          throw userErr;
        }
      });

      const results = await Promise.allSettled(processPromises);
      
      for (const result of results) {
        if (result.status === 'fulfilled') {
          if (result.value !== null) {
            totalUsersProcessed++;
            totalNewBookings += result.value.userNewBookings;
          }
        } else {
          totalUsersProcessed++;
          totalErrors++;
        }
      }

      logger.info(
        `🔄 Synchronizacja zakończona: ${totalUsersProcessed} użytkowników, ` +
        `${totalNewBookings} nowych rezerwacji, ${totalErrors} błędów.`
      );
    } catch (error) {
      logger.error("❌ Błąd krytyczny automatycznej synchronizacji iCal:", error);
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

// =============================================================================
// HELPER: Walidacja URL pod kątem SSRF (Server-Side Request Forgery)
// Blokuje prywatne IP, localhost, IPv6 loopback, Cloud Metadata endpoints
// =============================================================================
function isSafeUrl(url) {
  if (!url || typeof url !== 'string') return false;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
  
  try {
    const urlObj = new URL(url);
    const hn = urlObj.hostname.toLowerCase();
    
    // Blokada prywatnych zakresów IPv4
    if (hn.startsWith('10.') || hn.startsWith('192.168.') || hn.startsWith('127.')) return false;
    // Blokada 172.16.0.0/12
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hn)) return false;
    // Blokada link-local IPv4
    if (hn.startsWith('169.254.')) return false;
    // Blokada specjalnych adresów
    if (hn === 'localhost' || hn === '0.0.0.0' || hn === '[::]') return false;
    // Blokada IPv6 loopback i prywatnych zakresów
    if (hn === '::1' || hn === '[::1]') return false;
    if (hn.startsWith('fc') || hn.startsWith('fd')) return false;
    if (hn.startsWith('fe80')) return false;
    // Blokada Cloud Metadata (GCP, AWS, Azure)
    if (hn === 'metadata.google.internal' || hn === 'metadata.internal') return false;
    
    return true;
  } catch {
    return false;
  }
}

// =============================================================================
// 7. EKSPORT KALENDARZA (iCal Channel Manager)
// Umożliwia pobranie kalendarza w formacie .ics dla konkretnego obiektu
// =============================================================================
exports.exportIcal = onRequest(async (req, res) => {
  const userId = (req.query.u || '').toString().slice(0, 128);
  const propertyId = (req.query.p || '').toString().slice(0, 200);
  const token = (req.query.token || '').toString().slice(0, 256);

  if (!userId || !propertyId || !token) {
    return res.status(400).send("Brak parametrów u (userId), p (propertyId) lub token.");
  }

  // Walidacja formatu userId (Firebase UID: alfanumeryczny, max 128 znaków)
  if (!/^[a-zA-Z0-9_-]+$/.test(userId)) {
    return res.status(400).send("Nieprawidłowy format userId.");
  }

  try {
    const propsDoc = await db.collection('users').doc(userId).collection('settings').doc('properties').get();
    const propsData = propsDoc.data();
    if (!propsData || !propsData.items) {
      return res.status(403).send("Brak autoryzacji.");
    }

    const property = propsData.items.find(p => p.id === propertyId || p.name === propertyId);
    if (!property || property.secretToken !== token) {
      return res.status(403).send("Nieprawidłowy token.");
    }

    const rentalsRef = db.collection('users').doc(userId).collection('rentals');
    const snapshot = await rentalsRef
      .where('type', '==', 'booking')
      .where('property', '==', propertyId)
      .get();

    let icalContent = "BEGIN:VCALENDAR\r\n";
    icalContent += "VERSION:2.0\r\n";
    icalContent += "PRODID:-//WynajemPRO//ChannelManager//PL\r\n";
    icalContent += "CALSCALE:GREGORIAN\r\n";
    icalContent += "METHOD:PUBLISH\r\n";

    const formatDateToICal = (dateStr) => {
      if (!dateStr) return null;
      const parts = dateStr.split('-');
      if (parts.length !== 3) return null;
      return `${parts[0]}${parts[1]}${parts[2]}`;
    };

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (!data.date) return;
      
      const dtstart = formatDateToICal(data.date);
      let dtend = formatDateToICal(data.endDate);
      if (!dtend) {
        const startDateObj = new Date(data.date);
        startDateObj.setDate(startDateObj.getDate() + 1);
        dtend = startDateObj.toISOString().split('T')[0].replace(/-/g, '');
      }

      if (dtstart && dtend) {
        icalContent += "BEGIN:VEVENT\r\n";
        icalContent += `UID:${docSnap.id}@wynajempro.pl\r\n`;
        const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + "Z";
        icalContent += `DTSTAMP:${now}\r\n`;
        icalContent += `DTSTART;VALUE=DATE:${dtstart}\r\n`;
        icalContent += `DTEND;VALUE=DATE:${dtend}\r\n`;
        icalContent += "SUMMARY:Rezerwacja z WynajemPRO\r\n";
        icalContent += "STATUS:CONFIRMED\r\n";
        icalContent += "END:VEVENT\r\n";
      }
    });

    icalContent += "END:VCALENDAR\r\n";

    res.set('Content-Type', 'text/calendar; charset=utf-8');
    res.set('Content-Disposition', `attachment; filename="kalendarz_${propertyId}.ics"`);
    res.status(200).send(icalContent);
  } catch (error) {
    console.error("Błąd generowania pliku iCal:", error);
    res.status(500).send("Wystąpił błąd serwera.");
  }
});
