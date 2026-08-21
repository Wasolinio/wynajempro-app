/*
  Nadanie (albo odebranie) uprawnień do PANELU ADMINISTRATORA — custom claim `admin`.

  DLACZEGO SKRYPT, A NIE PRZYCISK W PANELU: uprawnienie administratora musi wymagać
  klucza serwisowego. Gdyby dało się je nadać z panelu, przejęcie jednego konta
  administratora dawałoby napastnikowi możliwość rozsiania kolejnych i utrzymania
  dostępu po odebraniu pierwszego. Klucz serwisowy trzyma właściciel, poza aplikacją.

  DLACZEGO CLAIM, A NIE POLE `isAdmin` W FIRESTORE: pole trzeba by odczytać regułą albo
  funkcją, a każda luka w regułach zapisu na `users/{uid}` staje się wtedy drogą do
  eskalacji uprawnień. Claim żyje w tokenie podpisanym przez Google i z klienta jest
  niezapisywalny.

  Uruchomienie (z katalogu functions/):
    GOOGLE_APPLICATION_CREDENTIALS=/ścieżka/klucz.json node set-admin-claim.cjs <e-mail|uid>
    GOOGLE_APPLICATION_CREDENTIALS=/ścieżka/klucz.json node set-admin-claim.cjs <e-mail|uid> --remove
    GOOGLE_APPLICATION_CREDENTIALS=/ścieżka/klucz.json node set-admin-claim.cjs --list

  Klucz: Konsola Firebase → Ustawienia projektu → Konta usługi → Wygeneruj nowy klucz.
  Alternatywnie: gcloud auth application-default login

  PO NADANIU: administrator musi się wylogować i zalogować ponownie (albo panel wymusi
  odświeżenie tokenu) — claimy wchodzą do tokenu dopiero przy jego wydaniu.
*/
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'moje-domki-6c77d',
});
const auth = admin.auth();

const arg = process.argv[2];
const remove = process.argv.includes('--remove');

async function listAdmins() {
  const found = [];
  let pageToken;
  do {
    const res = await auth.listUsers(1000, pageToken);
    res.users.forEach((u) => {
      if (u.customClaims && u.customClaims.admin === true) {
        found.push(`  ${u.uid}  ${u.email || '(bez adresu)'}`);
      }
    });
    pageToken = res.pageToken;
  } while (pageToken);

  if (found.length === 0) console.log('Brak kont z uprawnieniem administratora.');
  else console.log(`Konta z uprawnieniem administratora (${found.length}):\n${found.join('\n')}`);
}

(async () => {
  if (!arg || arg === '--help') {
    console.log('Użycie: node set-admin-claim.cjs <e-mail|uid> [--remove]  |  node set-admin-claim.cjs --list');
    process.exit(1);
  }
  if (arg === '--list') {
    await listAdmins();
    process.exit(0);
  }

  const user = arg.includes('@') ? await auth.getUserByEmail(arg) : await auth.getUser(arg);

  // SCALANIE, nie nadpisanie: `setCustomUserClaims` kasuje wszystko, czego nie poda się
  // w obiekcie. Nadpisanie odebrałoby koncie `stripeStatus` i wypchnęło je na paywall.
  const claims = { ...(user.customClaims || {}) };
  if (remove) delete claims.admin;
  else claims.admin = true;

  await auth.setCustomUserClaims(user.uid, claims);

  if (remove) {
    // Sam claim to za mało. ID token żyje do GODZINY od wydania, a `onCall` nie
    // sprawdza unieważnienia — przez ten czas ktoś z wykradzionym tokenem dalej
    // przechodziłby przez `requireAdmin`, mimo że uprawnienie już nie istnieje.
    // (Panel pokazałby „Brak uprawnień", bo front wymusza świeży token — ale
    // panel nie jest jedyną drogą do funkcji.) Unieważnienie tokenów odświeżania
    // zamyka to okno natychmiast.
    await auth.revokeRefreshTokens(user.uid);
    console.log(`🔒 Odebrano uprawnienie administratora: ${user.email || user.uid}`);
    console.log('   Tokeny unieważnione — dostęp zamknięty natychmiast, bez czekania na wygaśnięcie.');
  } else {
    console.log(`🔑 Nadano uprawnienie administratora: ${user.email || user.uid}`);
    console.log('   Wymagane ponowne zalogowanie (token odświeża się przy wydaniu).');
  }
  console.log(`   claims: ${JSON.stringify(claims)}`);

  // Potwierdzenie odczytem, nie założeniem: `setCustomUserClaims` to zapis
  // read-modify-write, a równoległy webhook Stripe teoretycznie mógł nadpisać
  // claimy między odczytem a zapisem. Sprawdzamy, co faktycznie stoi w bazie.
  const po = await auth.getUser(user.uid);
  const faktyczne = po.customClaims || {};
  const zgodne = remove ? faktyczne.admin === undefined : faktyczne.admin === true;
  if (zgodne) {
    console.log(`   ✅ Potwierdzone odczytem: ${JSON.stringify(faktyczne)}`);
  } else {
    console.log(`   ⚠️  ROZJAZD — w bazie stoi: ${JSON.stringify(faktyczne)}`);
    console.log('      Prawdopodobnie równoległy zapis (webhook Stripe). Uruchom polecenie ponownie.');
    process.exit(1);
  }
  process.exit(0);
})().catch((err) => {
  console.error('❌', err.message);
  process.exit(1);
});
