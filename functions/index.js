const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

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
    dataCleanedAt: new Date().toISOString(),
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
              paidAt: new Date().toISOString(),
            });
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
                lastPaymentAt: new Date().toISOString(),
                // Na wszelki wypadek (obsługa wyścigu), ustawiamy też subscription id jeśli to pierwsza płatność
                stripeSubscriptionId: invoice.subscription,
              });
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

          if (uid) {
            console.log(`❌ Subskrypcja anulowana dla użytkownika: ${uid}`);
            await db.collection("users").doc(uid).update({
              status: "canceled",
              canceledAt: new Date().toISOString(),
            });
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
              console.log(`❌ Subskrypcja anulowana dla: ${resolvedUid}`);
              await userDoc.ref.update({
                status: "canceled",
                canceledAt: new Date().toISOString(),
              });
            }
          }

          // Sprzątanie danych biznesowych użytkownika po rezygnacji
          if (resolvedUid) {
            try {
              const result = await cleanupUserData(resolvedUid);
              console.log(`🧹 Zakończono czyszczenie danych dla ${resolvedUid}:`, result);
            } catch (cleanupErr) {
              // Logujemy błąd, ale nie blokujemy odpowiedzi webhooka
              console.error(`⚠️ Błąd czyszczenia danych dla ${resolvedUid}:`, cleanupErr);
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
      res.status(500).json({ error: "Wewnętrzny błąd serwera" });
    }
  }
);

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
