const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

// Inicjalizacja Firebase Admin
const app = initializeApp();
const db = getFirestore(app);

// Sekrety (ustaw przez: firebase functions:secrets:set STRIPE_SECRET_KEY)
const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

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
              console.log(`❌ Subskrypcja anulowana dla: ${userDoc.id}`);
              await userDoc.ref.update({
                status: "canceled",
                canceledAt: new Date().toISOString(),
              });
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
