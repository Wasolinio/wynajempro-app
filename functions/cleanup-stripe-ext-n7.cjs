/*
  Sprzątanie po rozszerzeniu `stripe/firestore-stripe-payments` (odinstalowanym 2026-08-20).

  CO ROBIŁO ROZSZERZENIE: miało `CUSTOMERS_COLLECTION=users` i `SYNC_USERS_ON_CREATE=Sync`,
  więc przy KAŻDYM utworzeniu użytkownika Auth — łącznie z anonimową sesją gościa
  z `/guide/:id` — zakładało klienta w Stripe i dopisywało `stripeId`/`stripeLink`
  do dokumentu `users/{uid}`. Zostało po tym 15 dokumentów: 14 na identyfikatorach sesji
  gości (nie są kontami i nigdy nie będą) oraz 2 pola na jednym prawdziwym koncie.

  Wszyscy utworzeni klienci Stripe byli w trybie TESTOWYM (`dashboard.stripe.com/test/…`),
  więc po stronie Stripe nie ma czego sprzątać w produkcji. Ten skrypt Stripe NIE DOTYKA.

  CO ROBI:
   1. dokument `users/{uid}` na identyfikatorze sesji gościa → USUWA, ale wyłącznie gdy
      nie ma podkolekcji i nie zawiera żadnego pola spoza schematu rozszerzenia,
   2. prawdziwe konto → USUWA SAME POLA `stripeId` i `stripeLink`, dokumentu nie rusza.

  Każdy warunek jest sprawdzany osobno na świeżym odczycie. Cokolwiek nie pasuje —
  jest pomijane z powodem wypisanym na ekran, a nie kasowane „na wszelki wypadek".

  Uruchomienie (z katalogu functions/):
    GOOGLE_APPLICATION_CREDENTIALS=/ścieżka/klucz.json node cleanup-stripe-ext-n7.cjs
        → PRÓBA NA SUCHO, niczego nie zmienia
    GOOGLE_APPLICATION_CREDENTIALS=/ścieżka/klucz.json node cleanup-stripe-ext-n7.cjs --wykonaj
        → wykonuje zmiany
*/
const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: 'moje-domki-6c77d' });
const db = admin.firestore();
const auth = admin.auth();

const WYKONAJ = process.argv.includes('--wykonaj');

// Pola, które zapisywało rozszerzenie. Dokument sesji gościa nie może zawierać nic poza nimi.
const POLA_ROZSZERZENIA = new Set(['stripeId', 'stripeLink', 'email']);

(async () => {
  console.log(WYKONAJ ? '⚠️  TRYB WYKONANIA — zmiany będą zapisane\n' : '🔍 PRÓBA NA SUCHO — nic nie zostanie zmienione\n');

  // Identyfikatory sesji gości: brak dostawcy i brak adresu.
  const anonimowi = new Set();
  let token;
  do {
    const r = await auth.listUsers(1000, token);
    r.users.forEach((u) => { if ((!u.providerData || !u.providerData.length) && !u.email) anonimowi.add(u.uid); });
    token = r.pageToken;
  } while (token);
  console.log(`Sesji gości w Auth: ${anonimowi.size}`);

  const snap = await db.collection('users').get();
  console.log(`Dokumentów w users: ${snap.size}\n`);

  let doUsuniecia = 0, doWyczyszczenia = 0, pominietych = 0;

  for (const d of snap.docs) {
    const dane = d.data() || {};
    const pola = Object.keys(dane);
    const maPolaRozszerzenia = pola.includes('stripeId') || pola.includes('stripeLink');

    if (anonimowi.has(d.id)) {
      // Warunek 1: żadnych podkolekcji (dane biznesowe = to nie jest śmieć).
      const podkolekcje = await d.ref.listCollections();
      if (podkolekcje.length) {
        console.log(`  POMIJAM ${d.id} — sesja gościa, ale MA podkolekcje: ${podkolekcje.map((c) => c.id).join(', ')}`);
        pominietych++; continue;
      }
      // Warunek 2: nic spoza schematu rozszerzenia.
      const obce = pola.filter((p) => !POLA_ROZSZERZENIA.has(p));
      if (obce.length) {
        console.log(`  POMIJAM ${d.id} — sesja gościa, ale ma pola spoza rozszerzenia: ${obce.join(', ')}`);
        pominietych++; continue;
      }
      console.log(`  USUŃ    ${d.id} — sesja gościa, pola: ${pola.join(', ') || '(brak)'}`);
      if (WYKONAJ) await d.ref.delete();
      doUsuniecia++;
      continue;
    }

    if (maPolaRozszerzenia) {
      console.log(`  WYCZYŚĆ ${d.id} — prawdziwe konto, zdejmuję stripeId/stripeLink (reszta bez zmian)`);
      if (WYKONAJ) {
        await d.ref.update({
          stripeId: admin.firestore.FieldValue.delete(),
          stripeLink: admin.firestore.FieldValue.delete(),
        });
      }
      doWyczyszczenia++;
    }
  }

  console.log(`\nPodsumowanie: do usunięcia ${doUsuniecia}, do wyczyszczenia ${doWyczyszczenia}, pominiętych ${pominietych}`);
  if (!WYKONAJ) console.log('Nic nie zmieniono. Uruchom z --wykonaj, żeby zastosować.');
  process.exit(0);
})().catch((e) => { console.error('BŁĄD:', e.message); process.exit(1); });
