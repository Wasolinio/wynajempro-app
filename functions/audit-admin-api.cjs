/*
  LUSTRZANY TESTER PANELU ADMINISTRATORA — uruchomienie warstwy odczytu `adminApi`
  na danych produkcyjnych, PRZED wdrożeniem funkcji.

  PO CO: w tym środowisku nie ma Javy, więc nie ma emulatora Firestore, więc zapytań
  panelu nie da się przetestować lokalnie. Procedura z `.claude/skills/reguly` mówi, co
  wtedy robić: uruchomić lustrzany tester na produkcji. Ten skrypt NIE KOPIUJE logiki —
  woła dokładnie te funkcje, które wywoła wdrożona `adminApi` (`functions/admin-data.js`).
  Kopia rozjechałaby się z oryginałem przy pierwszej poprawce i przestałaby cokolwiek dowodzić.

  ⚠️ TYLKO DO ODCZYTU. Skrypt nie zapisuje ani jednego bajtu: warstwa, którą woła, nie
  zawiera żadnego zapisu (zapisy siedzą w `admin.js`, poza zasięgiem tego pliku).
  Nie tworzy też wpisu w `admin_audit` — dziennik dotyczy dostępu przez panel.

  ⚠️ Skrypt CZYTA dane osobowe (adresy e-mail, treści zgłoszeń). Na ekran wypisuje
  wyłącznie LICZBY i nazwy pól — żadnych adresów, żadnych treści. Jeśli potrzebujesz
  zobaczyć konkretne konto, użyj panelu, gdzie taki odczyt trafia do dziennika.

  URUCHOMIENIE (z katalogu functions/):
    GOOGLE_APPLICATION_CREDENTIALS=/ścieżka/klucz.json node audit-admin-api.cjs
  albo po `gcloud auth application-default login`.

  CO OZNACZA WYNIK:
    ✅ wszystkie sekcje przeszły  → zapytania działają na prawdziwych danych, można wdrażać
    ❌ którakolwiek padła         → NIE wdrażaj, przeczytaj komunikat błędu
    ⚠️  ostrzeżenie               → działa, ale coś wymaga uwagi (np. limit skanu)
*/
const admin = require('firebase-admin');

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'moje-domki-6c77d',
});

// UWAGA: require PO initializeApp — admin-data.js podłącza się do istniejącej aplikacji.
const data = require('./admin-data');

let bledy = 0;
let ostrzezenia = 0;

const ok = (msg) => console.log(`  ✅ ${msg}`);
const warn = (msg) => { ostrzezenia += 1; console.log(`  ⚠️  ${msg}`); };
const fail = (msg) => { bledy += 1; console.log(`  ❌ ${msg}`); };

const sekcja = (tytul) => console.log(`\n── ${tytul} ${'─'.repeat(Math.max(0, 60 - tytul.length))}`);

/** Uruchamia krok, mierzy czas i łapie błąd, żeby jeden padnięty krok nie ubił reszty. */
async function krok(nazwa, fn) {
  const start = Date.now();
  try {
    const wynik = await fn();
    console.log(`  ⏱  ${nazwa}: ${Date.now() - start} ms`);
    return wynik;
  } catch (err) {
    fail(`${nazwa} — ${err.message}`);
    if (err.code) console.log(`     kod: ${err.code}`);
    return null;
  }
}

(async () => {
  console.log('LUSTRZANY TESTER PANELU ADMINISTRATORA');
  console.log(`Projekt: moje-domki-6c77d · ${new Date().toISOString()}`);
  console.log('Tryb: wyłącznie odczyt\n');

  // ───────────────────────────────────────────────────────────────────────────
  sekcja('1. Zapytania źródłowe');

  const zrodlo = await krok('loadAccounts (users + Auth)', () => data.loadAccounts());
  const konta = zrodlo ? zrodlo.accounts : null;
  const rezerwacje = await krok('rentalCountsByUid (collectionGroup rentals)', () => data.rentalCountsByUid());
  const profile = await krok('profiledUids (collectionGroup settings)', () => data.profiledUids());
  const zgloszenia = await krok('loadMessages (contact_messages)', () => data.loadMessages());

  if (konta) {
    ok(`konta gospodarzy: ${konta.length}`);
    // Sesje gości to NIE konta — pomylenie ich zafałszowało wszystkie liczby przy
    // pierwszym uruchomieniu na produkcji (2026-08-20).
    ok(`sesje gości (anonimowe, z przewodników): ${zrodlo.guestSessions}`);
    if (zrodlo.staleGuestDocs.length) {
      warn(`${zrodlo.staleGuestDocs.length} dokumentów users/* na identyfikatorach sesji gości `
        + `(${zrodlo.staleGuestDocs.filter((d) => d.maEmail).length} z adresem e-mail) — dane bez właściciela`);
    }
    const bezDaty = konta.filter((k) => !k.createdAt).length;
    if (bezDaty) warn(`${bezDaty} kont bez daty rejestracji — nie wejdą na wykres 30 dni`);
    const sierotyAuth = konta.filter((k) => k.missingAuth).length;
    const sierotyDoc = konta.filter((k) => k.missingDoc).length;
    if (sierotyAuth || sierotyDoc) {
      warn(`rozjazd Auth ↔ baza: ${sierotyDoc} loginów bez dokumentu, ${sierotyAuth} dokumentów bez loginu`);
    }
  }
  if (rezerwacje) {
    ok(`rezerwacje: ${rezerwacje.total} na ${rezerwacje.map.size} kontach`);
    if (rezerwacje.truncated) fail(`SKAN OBCIĘTY na limicie ${data.SCAN_LIMIT} — liczby są zaniżone, panel to pokaże, ale trzeba przejść na liczniki agregujące`);
  }
  if (profile) {
    ok(`konta z uzupełnionym profilem gospodarza: ${profile.set.size}`);
    if (profile.truncated) fail(`SKAN USTAWIEŃ OBCIĘTY na limicie ${data.SCAN_LIMIT} — stopień „profil" w lejku będzie zaniżony`);
  }
  if (zgloszenia) {
    const testy = zgloszenia.filter((z) => z.isTest).length;
    ok(`zgłoszenia: ${zgloszenia.length} (w tym testowych: ${testy})`);
  }

  // ───────────────────────────────────────────────────────────────────────────
  sekcja('2. Przegląd — pełny payload pulpitu');

  // mrr: null — sekret Stripe nie jest tu dostępny i nie musi być.
  const przeglad = await krok('buildOverview', () => data.buildOverview({ mrr: null }));

  if (przeglad) {
    const { accounts, registrations, funnel, trials, content, messages, newsletter, risks } = przeglad;
    console.log(`\n  Konta ...................... ${accounts.total} (zweryfikowanych ${accounts.verified}, niezweryfikowanych ${accounts.unverified}, administratorów ${accounts.admins})`);
    console.log(`  Statusy .................... ${JSON.stringify(accounts.byStatus)}`);
    console.log(`  Rejestracje ................ dziś ${registrations.today} · 7 dni ${registrations.d7} · 30 dni ${registrations.d30} (poprz. 30: ${registrations.prev30})`);
    console.log(`  Lejek ...................... ${funnel.registered} → ${funnel.verified} → ${funnel.profiled} → ${funnel.withBookings} → ${funnel.paying}`);
    console.log(`  Triale ..................... trwających ${trials.active} · kończy się w 3 dni ${trials.endingIn3} · wygasłych ${trials.expired}`);
    console.log(`  Treść ...................... ${content.rentals} rezerwacji · ${content.guides} przewodników · ${content.signatures} podpisów`);
    console.log(`  Zgłoszenia ................. nowych ${messages.new} · w toku ${messages.open} · zamkniętych ${messages.closed} · testowych ${messages.tests}`);
    console.log(`  Newsletter ................. ${newsletter.total} (+${newsletter.d30} w 30 dni)`);
    console.log(`  Sesje gości ................ ${przeglad.guests.sessions} (dokumentów-widm: ${przeglad.guests.staleDocs})`);
    console.log(`  Wymaga uwagi ............... ${JSON.stringify(risks)}\n`);

    // ── Niezmienniki: rzeczy, które MUSZĄ się zgadzać, bo inaczej liczby kłamią ──
    const sumaStatusow = Object.values(accounts.byStatus).reduce((a, b) => a + b, 0);
    if (sumaStatusow === accounts.total) ok('statusy sumują się do liczby kont');
    else fail(`statusy sumują się do ${sumaStatusow}, a kont jest ${accounts.total}`);

    if (registrations.chart.length === 30) ok('wykres ma 30 słupków (dni bez rejestracji też)');
    else fail(`wykres ma ${registrations.chart.length} słupków zamiast 30`);

    const sumaWykresu = registrations.chart.reduce((a, p) => a + p.count, 0);
    if (sumaWykresu === registrations.d30) ok(`suma wykresu zgadza się z licznikiem 30 dni (${sumaWykresu})`);
    else warn(`suma wykresu ${sumaWykresu} ≠ licznik 30 dni ${registrations.d30} — sprawdź granicę doby (strefa ${data.TZ})`);

    if (funnel.registered === accounts.total) ok('podstawa lejka = liczba kont');
    else fail(`podstawa lejka ${funnel.registered} ≠ liczba kont ${accounts.total}`);

    const stopnie = [funnel.registered, funnel.verified, funnel.profiled, funnel.withBookings, funnel.paying];
    const rosnie = stopnie.findIndex((v, i) => i > 0 && v > stopnie[i - 1]);
    if (rosnie === -1) ok('lejek maleje na każdym stopniu');
    else warn(`stopień ${rosnie + 1} lejka jest większy od poprzedniego — to możliwe (np. konto płacące bez uzupełnionego profilu), ale wykres będzie wyglądał dziwnie`);

    if (content.rentals >= 0 && content.guides >= 0) ok('liczniki treści nieujemne');
    if (przeglad.revenue === null) ok('MRR pominięte (brak sekretu Stripe w skrypcie — na produkcji będzie liczone)');
  }

  // ───────────────────────────────────────────────────────────────────────────
  sekcja('3. Porządek — zobowiązania i rozjazdy');

  const porzadek = await krok('buildHealth', () => data.buildHealth());
  if (porzadek) {
    console.log(`\n  Zaplanowane usunięcia ...... ${porzadek.scheduledDeletion.length}`);
    console.log(`  Zaległości ................. ${porzadek.pastDue.length}`);
    console.log(`  Wygasłe triale ............. ${porzadek.expiredTrials.length}`);
    console.log(`  Adresy niepotwierdzone ..... ${porzadek.unverified.length}`);
    console.log(`  Login bez dokumentu ........ ${porzadek.missingDoc.length}`);
    console.log(`  Dokument bez loginu ........ ${porzadek.missingAuth.length}`);
    console.log(`  Przewodniki bez właściciela  ${porzadek.orphanGuides.length}`);
    console.log(`  Dokumenty-widma gości ...... ${(porzadek.staleGuestDocs || []).length}`);
    console.log(`  Zgłoszenia > ${porzadek.messagesOverRetention.months} mies. ...... ${porzadek.messagesOverRetention.count}\n`);

    if (porzadek.orphanGuides.length > 0) {
      warn('są przewodniki bez żywego właściciela — w środku mogą być podpisy gości i sekrety (WiFi, PIN), czyli dane osobowe bez administratora');
    } else {
      ok('każdy przewodnik ma właściciela');
    }
    ok('buildHealth wykonane bez błędu');
  }

  // ───────────────────────────────────────────────────────────────────────────
  sekcja('4. Maskowanie danych wrażliwych');

  const zamaskowany = data.maskIdentifier('90010112345');
  if (zamaskowany.endsWith('345') && !zamaskowany.includes('90010')) ok(`maskIdentifier zostawia trzy ostatnie znaki: ${zamaskowany}`);
  else fail(`maskIdentifier zwrócił "${zamaskowany}" — identyfikator nie jest zamaskowany`);

  const url = data.maskUrl('https://admin.booking.com/hotel/ical?token=SEKRETNY_TOKEN_1234');
  if (!url.includes('SEKRETNY_TOKEN')) ok(`maskUrl ukrywa token: ${url}`);
  else fail(`maskUrl przepuścił token: ${url}`);

  // ───────────────────────────────────────────────────────────────────────────
  sekcja('WYNIK');
  if (bledy === 0 && ostrzezenia === 0) console.log('  ✅ Wszystko przeszło. Zapytania panelu działają na prawdziwych danych.');
  else if (bledy === 0) console.log(`  ⚠️  Przeszło z ostrzeżeniami: ${ostrzezenia}. Przeczytaj je przed wdrożeniem.`);
  else console.log(`  ❌ Błędów: ${bledy}, ostrzeżeń: ${ostrzezenia}. NIE WDRAŻAJ, dopóki nie znikną.`);
  console.log('');
  process.exit(bledy === 0 ? 0 : 1);
})().catch((err) => {
  console.error('\n❌ Tester przerwany:', err.message);
  if (err.code) console.error('   kod:', err.code);
  console.error('\nNajczęstsza przyczyna: brak poświadczeń. Ustaw GOOGLE_APPLICATION_CREDENTIALS');
  console.error('albo uruchom `gcloud auth application-default login`.');
  process.exit(1);
});
