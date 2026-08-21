/**
 * Custom claims — zapis Z ZACHOWANIEM istniejących kluczy.
 *
 * PO CO OSOBNY PLIK: `setCustomUserClaims` NADPISUJE cały obiekt claimów, nie scala.
 * Do 2026-08-19 każde wywołanie w webhooku Stripe (`{ stripeStatus: 'active' }`)
 * kasowało wszystkie pozostałe klucze tego użytkownika. Dopóki jedynym claimem był
 * `stripeStatus`, nie było tego widać. Z chwilą dodania claimu `admin` (panel
 * administratora) pierwsza płatność albo odnowienie subskrypcji na koncie właściciela
 * odbierałyby mu dostęp do panelu — po cichu, bez żadnego błędu.
 *
 * Dlatego KAŻDY zapis claimów w tym projekcie idzie przez `mergeClaims`.
 */
const { getAuth } = require("firebase-admin/auth");

/**
 * Scala `patch` z dotychczasowymi claimami użytkownika.
 * Wartość `null` w patchu USUWA klucz (pozwala sprzątać nieaktualne, np. trialEndsAt).
 */
async function mergeClaims(uid, patch) {
  const user = await getAuth().getUser(uid);
  const next = { ...(user.customClaims || {}) };
  for (const [key, value] of Object.entries(patch)) {
    if (value === null) delete next[key];
    else next[key] = value;
  }
  await getAuth().setCustomUserClaims(uid, next);
  return next;
}

module.exports = { mergeClaims };
