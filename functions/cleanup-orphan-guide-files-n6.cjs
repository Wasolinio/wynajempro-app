/*
  Czyszczenie N6.5 (🟡, tryb F2) — JEDNORAZOWE usunięcie OSIEROCONYCH plików
  Storage przewodników z przeszłości.

  Osierocony = obiekt pod prefiksem `guides/{guideId}/`, dla którego NIE istnieje
  dokument `guides/{guideId}` w Firestore. Dotyczy plików przewodników usuniętych
  PRZED wdrożeniem kaskady purge (N5 C.1) — nowe kasacje już czyszczą Storage
  (deleteGuideCompletely w functions/index.js), więc nowe sieroty nie powstają.

  Domyślnie DRY-RUN: tylko LISTUJE i liczy, NIC nie kasuje. Kasowanie wyłącznie
  po jawnej fladze --fix (jak w audit-guides-n5.cjs).

  ── Bezpieczeństwo (tryb F2 — przegląd code-reviewer przed uruchomieniem) ──
   • Plik jest kasowany TYLKO gdy dokument guides/{guideId} NIE istnieje.
     Istnienie sprawdzane RAZ na guideId (cache), nigdy raz na plik.
   • Fail-safe: gdy sprawdzenie istnienia dokumentu rzuci błędem — plik jest
     POMIJANY (nie kasujemy, gdy nie wiemy, czy rodzic żyje).
   • Gwarda wieku (--min-age-days=N, domyślnie 30): przy --fix pliki MŁODSZE niż
     N dni ORAZ pliki o NIEZNANYM wieku (brak/niepoprawny timeCreated) są
     pomijane. Fail-safe: nieznany wiek traktujemy jak „za świeży" i NIGDY nie
     kasujemy pliku, którego wieku nie znamy. Chroni świeży upload okładki
     wykonany w GuideBuilderze ZANIM powstał dokument — storage.rules dopuszcza
     zapis pod jeszcze niezapisanym guideId (gałąź `!exists`). Historyczne
     sieroty (sprzed kaskady N5 C.1) są miesiące stare, więc próg 30 dni ich nie
     dotyczy, a eliminuje ryzyko skasowania świeżo wgranej, jeszcze niezapisanej
     okładki szkicu.
     UWAGA (ograniczenie): z samego stanu Firestore nie da się odróżnić
     porzuconego, NIGDY niezapisanego szkicu (okładka wgrana, „Zapisz" nie
     kliknięty) od sieroty po usuniętym przewodniku — oba nie mają dokumentu.
     Dlatego pierwszą bramką jest ludzki przegląd DRY-RUN, a dopiero potem --fix.
   • Paginacja listowania (autoPaginate:false + pageToken) — odporne na duże buckety.
   • Idempotentne (delete z ignoreNotFound), log per-plik; błąd jednego pliku
     NIE przerywa całości; podsumowanie na końcu.
   • Obiekty o nietypowym kształcie ścieżki (bez segmentu guideId, np. plik wprost
     pod `guides/`) są POMIJANE, nigdy kasowane.

  ── Poświadczenia (jak audit-users-n2.cjs) — jedno z dwóch ──
    - GOOGLE_APPLICATION_CREDENTIALS=/ścieżka/klucz-serwisowy.json
      (Konsola Firebase → Ustawienia projektu → Konta usługi → Wygeneruj nowy klucz)
    - albo: gcloud auth application-default login

  ── Bucket ──
    Domyślnie `moje-domki-6c77d.firebasestorage.app` (realny bucket produkcyjny,
    VITE_FIREBASE_STORAGE_BUCKET). Nadpisz zmienną STORAGE_BUCKET lub flagą
    --bucket=NAZWA, jeśli projekt używa innego. Aktualny bucket jest wypisany w
    logu („Bucket: ...") — zły bucket = „0 przejrzanych obiektów" (skrypt to
    wykrzyczy), więc pomyłka jest widoczna, nie cicho fałszywa; kasowanie i tak
    wymaga osobnego --fix.

  ── Uruchomienie ──
    cd functions
    # 1) DRY-RUN (nic nie kasuje — materiał do przeglądu code-reviewer):
    GOOGLE_APPLICATION_CREDENTIALS=/ścieżka/klucz.json node cleanup-orphan-guide-files-n6.cjs
    # 2) DOPIERO po akceptacji przeglądu — realne kasowanie:
    GOOGLE_APPLICATION_CREDENTIALS=/ścieżka/klucz.json node cleanup-orphan-guide-files-n6.cjs --fix
    # opcje: --min-age-days=N (domyślnie 30)   --bucket=inny-bucket
*/
const admin = require('firebase-admin');

const PROJECT_ID = 'moje-domki-6c77d';
const PREFIX = 'guides/';
const PAGE_SIZE = 1000;

// ── Parsowanie flag ──
const argv = process.argv.slice(2);
const FIX = argv.includes('--fix');
const getOpt = (name, fallback) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback; // +3 = "--" + "="
};
const MIN_AGE_DAYS = Number(getOpt('min-age-days', '30'));
const BUCKET_NAME = getOpt('bucket', process.env.STORAGE_BUCKET || `${PROJECT_ID}.firebasestorage.app`);

if (!Number.isFinite(MIN_AGE_DAYS) || MIN_AGE_DAYS < 0) {
  console.error(`✗ --min-age-days musi być liczbą >= 0 (podano: ${getOpt('min-age-days')})`);
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: PROJECT_ID,
  storageBucket: BUCKET_NAME,
});
const db = admin.firestore();
const bucket = admin.storage().bucket();

const MIN_AGE_MS = MIN_AGE_DAYS * 24 * 60 * 60 * 1000;
const NOW = Date.now();
const fmtSize = (b) => `${(Number(b || 0) / 1024).toFixed(1)} KB`;

// guideId → Promise<boolean> (istnienie dokumentu). Sprawdzane RAZ na guideId.
const docExistsCache = new Map();
function guideDocExists(guideId) {
  if (!docExistsCache.has(guideId)) {
    docExistsCache.set(guideId, db.collection('guides').doc(guideId).get().then((s) => s.exists));
  }
  return docExistsCache.get(guideId);
}

// "guides/{guideId}/{fileName...}" → guideId; null gdy nietypowy kształt (brak guideId).
function extractGuideId(objectName) {
  const rest = objectName.slice(PREFIX.length); // część po "guides/"
  const slash = rest.indexOf('/');
  if (slash <= 0) return null; // brak segmentu guideId albo pusty guideId
  return rest.slice(0, slash);
}

(async () => {
  console.log('══════════════════════════════════════════════════════════════');
  console.log(' N6.5 — czyszczenie osieroconych plików Storage przewodników');
  console.log('══════════════════════════════════════════════════════════════');
  console.log(`Tryb:         ${FIX ? '🔴 KASOWANIE (--fix)' : '🟢 DRY-RUN (tylko odczyt)'}`);
  console.log(`Bucket:       ${BUCKET_NAME}`);
  console.log(`Prefiks:      ${PREFIX}`);
  console.log(`Gwarda wieku: pomijam pliki młodsze niż ${MIN_AGE_DAYS} dni oraz o nieznanym wieku (dotyczy tylko --fix)`);
  console.log('──────────────────────────────────────────────────────────────\n');

  let scanned = 0; // wszystkie obiekty pod guides/
  let skippedShape = 0; // nietypowy kształt ścieżki (bez guideId)
  let kept = 0; // dokument-rodzic istnieje → nietykane
  let orphanFiles = 0; // osierocone (wylistowane / do usunięcia)
  let orphanBytes = 0;
  let ageSkipped = 0; // osierocone pominięte przez gwardę wieku (za świeże LUB nieznany wiek); liczone też w DRY-RUN
  let deleted = 0;
  let errors = 0;
  const orphanByGuide = new Map(); // guideId → { files, bytes }

  let pageToken;
  do {
    const [files, nextQuery] = await bucket.getFiles({
      prefix: PREFIX,
      maxResults: PAGE_SIZE,
      autoPaginate: false,
      pageToken,
    });

    for (const file of files) {
      scanned++;
      const guideId = extractGuideId(file.name);
      if (!guideId) {
        skippedShape++;
        console.log(`?  POMIJAM (brak guideId w ścieżce): ${file.name}`);
        continue;
      }

      let exists;
      try {
        exists = await guideDocExists(guideId);
      } catch (e) {
        errors++;
        console.log(`✗  BŁĄD sprawdzania guides/${guideId} — POMIJAM plik ${file.name}: ${e.message}`);
        continue; // fail-safe: bez pewności co do rodzica NIE kasujemy
      }

      if (exists) {
        kept++;
        continue;
      }

      // ── osierocony ──
      const size = Number(file.metadata && file.metadata.size) || 0;
      const createdMs = file.metadata && file.metadata.timeCreated
        ? Date.parse(file.metadata.timeCreated) : NaN;
      const ageMs = NOW - createdMs; // NaN, gdy timeCreated puste/nieparsowalne
      const ageUnknown = !Number.isFinite(ageMs);
      const ageLabel = ageUnknown ? '?' : `${(ageMs / 86400000).toFixed(1)}d`;

      orphanFiles++;
      orphanBytes += size;
      const agg = orphanByGuide.get(guideId) || { files: 0, bytes: 0 };
      agg.files++;
      agg.bytes += size;
      orphanByGuide.set(guideId, agg);

      // Fail-safe: NIEZNANY wiek ⇒ traktuj jak młodszy niż gwarda ⇒ POMIŃ przy --fix.
      // Liczone niezależnie od trybu, żeby DRY-RUN pokazał realny wpływ gwardy.
      const ageGuarded = ageUnknown || ageMs < MIN_AGE_MS;
      if (ageGuarded) ageSkipped++;

      const tag = `[wiek ${ageLabel}, ${fmtSize(size)}]`;

      if (!FIX) {
        const mark = ageGuarded ? ' — gwarda wieku POMINIE przy --fix' : '';
        console.log(`•  OSIEROCONY ${tag}${mark}: ${file.name}`);
      } else if (ageGuarded) {
        const guardReason = ageUnknown
          ? 'nieznany wiek — fail-safe, nie kasujemy'
          : `młodszy niż ${MIN_AGE_DAYS}d — możliwy upload przed zapisem`;
        console.log(`⏭  POMIJAM (${guardReason}) ${tag}: ${file.name}`);
      } else {
        try {
          await file.delete({ ignoreNotFound: true });
          deleted++;
          console.log(`🗑  USUNIĘTO ${tag}: ${file.name}`);
        } catch (e) {
          errors++;
          console.log(`✗  BŁĄD usuwania ${file.name}: ${e.message}`);
        }
      }
    }

    pageToken = nextQuery && nextQuery.pageToken;
  } while (pageToken);

  // ── Podsumowanie ──
  const wouldDelete = orphanFiles - ageSkipped; // ile realnie skasowałby --fix (bez pominiętych przez gwardę wieku)
  console.log('\n──────────────────────────────────────────────────────────────');
  console.log('PODSUMOWANIE');
  console.log(`  Przejrzane obiekty:        ${scanned}`);
  console.log(`  Z istniejącym rodzicem:    ${kept} (nietykane)`);
  console.log(`  Pominięte (zły kształt):   ${skippedShape}`);
  console.log(`  Osierocone (pliki):        ${orphanFiles} w ${orphanByGuide.size} guideId (${fmtSize(orphanBytes)})`);
  if (orphanByGuide.size > 0) {
    console.log('  Osierocone wg guideId:');
    for (const [gid, a] of orphanByGuide) {
      console.log(`    - ${gid}: ${a.files} plik(ów), ${fmtSize(a.bytes)}`);
    }
  }
  if (FIX) {
    console.log(`  Usunięte:                  ${deleted}`);
    console.log(`  Pominięte (gwarda wieku):  ${ageSkipped} (za świeże / nieznany wiek)`);
  } else {
    console.log(`  Realnie do usunięcia (--fix): ${wouldDelete}`);
    console.log(`  Gwarda wieku POMINIE:      ${ageSkipped} (za świeże / nieznany wiek)`);
  }
  console.log(`  Błędy:                     ${errors}`);
  console.log('──────────────────────────────────────────────────────────────');

  if (scanned === 0) {
    console.log(`⚠  Zero obiektów pod prefiksem — sprawdź, czy BUCKET jest poprawny `
      + `(użyto: ${BUCKET_NAME}; nadpisz przez STORAGE_BUCKET lub --bucket=...).`);
  }
  if (!FIX) {
    console.log(orphanFiles === 0
      ? '✓ DRY-RUN: brak osieroconych plików — nic do zrobienia. Nic nie usunięto.'
      : `🟢 DRY-RUN: NIC NIE USUNIĘTO. Osieroconych: ${orphanFiles} — realnie do usunięcia przy --fix: `
        + `${wouldDelete}, gwarda wieku pominie: ${ageSkipped}. `
        + 'Po przeglądzie code-reviewer uruchom ponownie z --fix.');
  } else {
    console.log(errors === 0
      ? `✅ USUNIĘTO ${deleted} plików (pominięto ${ageSkipped} przez gwardę wieku).`
      : `⚠ USUNIĘTO ${deleted} plików, ale wystąpiło ${errors} błędów — przejrzyj log i uruchom ponownie (idempotentne).`);
  }

  process.exit(errors > 0 ? 2 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
