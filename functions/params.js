/**
 * Wspólne parametry sekretne funkcji.
 *
 * PO CO: `defineSecret` z tą samą nazwą wołane w dwóch modułach to dwie rejestracje tego
 * samego sekretu w manifeście wdrożenia. Działa, ale jest to zbieg okoliczności, nie
 * gwarancja — a `index.js` i `admin.js` potrzebują tego samego klucza Stripe (webhook
 * i checkout tam, odczyt ceny do MRR tutaj). Jedno miejsce definicji zamyka temat.
 *
 * Ustawianie wartości: firebase functions:secrets:set STRIPE_SECRET_KEY
 */
const { defineSecret } = require("firebase-functions/params");

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

/**
 * Identyfikator ceny subskrypcji w Stripe.
 *
 * ⚠️ IDENTYFIKATOR JEST ZWIĄZANY Z KONTEM. Stripe zaszywa w nim identyfikator konta,
 * więc cena z jednego konta **nie istnieje** na drugim. Przy przejściu z konta testowego
 * na docelowe trzeba go wymienić razem z obydwoma sekretami — inaczej `createCheckoutSession`
 * padnie na „No such price".
 *
 * Do 2026-08-21 ta wartość stała wpisana na sztywno w DWÓCH plikach (`index.js` przy
 * tworzeniu sesji płatności i `admin.js` przy liczeniu MRR). Przy pierwszej zmianie konta
 * jedno z tych miejsc na pewno zostałoby pominięte, a skutek byłby cichy: panel liczyłby
 * MRR z ceny, której nikt nie płaci. Stąd jedno źródło prawdy.
 */
// 2026-08-21: przejście z konta testowego na docelowe.
// Poprzednia wartość (konto sandbox `acct_1TZUH18D7fwsePNB`): price_1TZULu8D7fwsePNBa7aXaP92
const PRICE_ID = "price_1U6nf28N6OxIYfaZicTLgzpa";

module.exports = { stripeSecretKey, stripeWebhookSecret, PRICE_ID };
