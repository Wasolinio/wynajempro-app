/*
  Migracja LEGACY zadań jednorazowych (moduł Zadania, E3 partia 2, krok 8):
  users/{uid}/rentals z type:'reminder'  →  users/{uid}/tasks
  (mapowanie z design_handoff_zadania/IMPLEMENTACJA.md §1:
   text → text, date → date, isCompleted → done, property → propertyName).

  ⚠️ LOG ZAWIERA DANE OSOBOWE — treści zadań rutynowo niosą nazwiska gości
  („Sprzątanie po Kowalskich"). Nie wklejaj wyjścia agentom ani do zgłoszeń
  (CLAUDE.md: kanał supportu zawieszony dla danych osobowych do czasu DPA).
  Do przeglądu bez treści: --quiet.

  ZASADY:
  - DOMYŚLNIE DRY-RUN — wypisuje plan, niczego nie zapisuje. Zapis dopiero z --fix,
    ZA ZGODĄ WŁAŚCICIELA. Plan dry-runu jest IDENTYCZNY z tym, co zrobi --fix.
  - Dedup TYM SAMYM kluczem co odczyt zgodnościowy w useTasksBoard:
    text|date|propertyName (fallback 'Brak opisu' dla pustej treści).
    Duplikat = istnieje JUŻ dokument w `tasks` o tym kluczu (stan sprzed migracji);
    wtedy wpis legacy jest usuwany bez kopii, bo jego treść już żyje w kolekcji.
  - 🛑 Zbiór `existing` odzwierciedla WYŁĄCZNIE stan `tasks` sprzed migracji i NIE rośnie
    w trakcie przebiegu. Dopisywanie do niego przeniesionych kluczy kasowało drugi
    z dwóch identycznych wpisów legacy BEZ KOPII — a panel pokazuje dziś oba
    (dedup w useTasksBoard odsiewa legacy tylko względem `tasks`, nigdy legacy
    względem legacy). Znalezione przeglądem 2026-08-29, przed uruchomieniem na danych.
  - --fix PRZENOSI: kopia zapasowa → utworzenie dokumentu tasks (auto-id) → kasacja
    wpisu z rentals. Błąd zapisu zostawia oryginał nietknięty.
  - KAŻDY kasowany dokument ląduje najpierw w pliku kopii (JSONL) — bez tego operacja
    byłaby nieodwracalna, a treści zadań nie ma gdzie indziej (idiom gwardy fail-safe
    z cleanup-orphan-guide-files-n6.cjs).
  - Każdy tworzony dokument przechodzi przez lustro whyInvalidTask
    (validate-schema-n3.cjs) PRZED zapisem — to samo, co sprawdzą reguły.
  - Odczyt zgodnościowy w kodzie ZOSTAJE po migracji — jego usunięcie to osobna
    partia po przebiegu tego skryptu na produkcji.

  Uruchomienie (z katalogu functions/):
    node migrate-reminders-to-tasks.cjs [--key /ścieżka/klucz.json]          # dry-run
    node migrate-reminders-to-tasks.cjs --fix [--key=/ścieżka/klucz.json]    # przenosi
    node migrate-reminders-to-tasks.cjs --fix --uid=ABC                      # jedno konto (pilot)
  Bez --key używa GOOGLE_APPLICATION_CREDENTIALS ze środowiska.
*/
const fs = require('fs');
const path = require('path');
const { whyInvalidTask } = require('./validate-schema-n3.cjs');

const propName = (p) => (p && typeof p === 'object' ? p.name : p);
const dedupKey = (text, date, prop) => `${text || 'Brak opisu'}|${date || ''}|${prop || ''}`;

// Kształt dokumentu `tasks` z wpisu legacy — mapowanie z IMPLEMENTACJA.md §1.
function docelowy(data) {
  return {
    text: data.text || 'Brak opisu',
    propertyName: propName(data.property) ?? null,
    rentalId: null,
    templateId: null,
    date: data.date ?? null,
    time: '',
    priority: 'normalny',
    note: '',
    subtasks: [],
    recurrence: null,
    photos: [],
    done: !!data.isCompleted,
    doneAt: null,
  };
}

/*
  CZYSTA decyzja per wpis — wydzielona po to, żeby dała się przetestować bez Firestore
  (functions/migrate-reminders-to-tasks.test.cjs). Skrypt kasuje dane klienta,
  a błąd „drugi identyczny reminder kasowany bez kopii" wyszedł dopiero w przeglądzie;
  jeden test na tej funkcji złapałby go przed uruchomieniem.

  `existing` to klucze dokumentów `tasks` SPRZED migracji i nie wolno go w trakcie
  rozszerzać o klucze wpisów właśnie przeniesionych — dwa identyczne remidnery legacy
  to dziś w panelu dwa osobne zadania i mają dać dwa dokumenty.
*/
function decide(data, existing) {
  const target = docelowy(data);
  const key = dedupKey(target.text, target.date, target.propertyName);
  if (existing.has(key)) return { akcja: 'dup', key, target };
  const why = whyInvalidTask(target);
  if (why) return { akcja: 'invalid', key, target, why };
  return { akcja: 'move', key, target };
}

module.exports = { dedupKey, docelowy, decide };

// Poniżej część wykonawcza — nie uruchamia się przy require z testu.
if (require.main !== module) return;

const args = process.argv.slice(2);

// Parser przyjmuje OBIE formy (--key ścieżka i --key=ścieżka — bratni skrypt
// cleanup-orphan-guide-files-n6.cjs używa drugiej) i twardo kończy na nierozpoznanej
// fladze: cicho zignorowana literówka w --key puszczała skrypt na przypadkowych
// poświadczeniach ze środowiska.
const ZNANE = ['--fix', '--quiet', '--key', '--uid'];
let keyPath = null;
let onlyUid = null;
for (let i = 0; i < args.length; i += 1) {
  const a = args[i];
  if (!a.startsWith('--')) { console.error(`Nierozpoznany argument: ${a}`); process.exit(1); }
  const [nazwa, wartoscZRownym] = a.split('=');
  if (!ZNANE.includes(nazwa)) { console.error(`Nierozpoznana flaga: ${nazwa}. Znane: ${ZNANE.join(', ')}`); process.exit(1); }
  if (nazwa === '--key' || nazwa === '--uid') {
    const wartosc = wartoscZRownym ?? args[i + 1];
    if (!wartosc || wartosc.startsWith('--')) { console.error(`${nazwa} wymaga wartości`); process.exit(1); }
    if (wartoscZRownym === undefined) i += 1;
    if (nazwa === '--key') keyPath = wartosc; else onlyUid = wartosc;
  }
}
const FIX = args.includes('--fix');
const QUIET = args.includes('--quiet');
if (keyPath) process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

const admin = require('firebase-admin');
admin.initializeApp({ credential: admin.credential.applicationDefault(), projectId: 'moje-domki-6c77d' });
const db = admin.firestore();
const { FieldValue } = admin.firestore;

// W trybie --quiet log nie niesie treści zadania ani nazwy obiektu — zostaje sama
// ścieżka dokumentu, żeby plan dało się przejrzeć bez danych osobowych na ekranie.
const opis = (t) => (QUIET ? '(treść ukryta: --quiet)' : `"${t.text}" (${t.date || 'bez daty'}, ${t.propertyName || 'bez obiektu'}${t.done ? ', zrobione' : ''})`);

const backupPath = path.join(__dirname, `migrate-reminders-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.jsonl`);
let backupUzyty = false;
function zapiszKopie(uid, docId, data) {
  fs.appendFileSync(backupPath, `${JSON.stringify({ uid, docId, data, ts: new Date().toISOString() })}\n`, 'utf8');
  backupUzyty = true;
}

(async () => {
  console.log(FIX ? '⚠ TRYB --fix: przenoszę wpisy.' : 'DRY-RUN: tylko plan, bez zapisu (--fix żeby przenieść).');
  if (!QUIET) console.log('⚠ Log zawiera treści zadań (mogą nieść nazwiska gości) — nie wklejaj go agentom. Tryb bez treści: --quiet.\n');
  let usersWith = 0; let toMove = 0; let dups = 0; let moved = 0; let removedDups = 0; let invalid = 0;
  let bezProfilu = 0; let errors = 0;

  // listDocuments zamiast get(): zwraca też referencje kont BEZ dokumentu users/{uid}
  // (Firestore „missing document"). Takie konta w tym projekcie istniały — świadczy
  // o tym samonaprawa w src/hooks/useFirebaseData.js; przy .get() ich zadania
  // zostałyby po cichu pominięte i zniknęły dopiero przy usuwaniu odczytu legacy.
  const userRefs = onlyUid
    ? [db.collection('users').doc(onlyUid)]
    : await db.collection('users').listDocuments();

  for (const userRef of userRefs) {
    const remindersSnap = await userRef.collection('rentals').where('type', '==', 'reminder').get();
    if (remindersSnap.empty) continue;
    usersWith += 1;
    if (!(await userRef.get()).exists) bezProfilu += 1;

    const tasksSnap = await userRef.collection('tasks').get();
    const kluczeTasks = new Set(tasksSnap.docs.map((d) => {
      const t = d.data();
      return dedupKey(t.text, t.date, t.propertyName);
    }));
    // Stan SPRZED migracji podajemy jako obiekt BEZ metody `add` — żeby przywrócenie
    // błędu „dopisz przeniesiony klucz" (kasacja drugiego identycznego wpisu bez kopii)
    // wywaliło się natychmiast, zamiast po cichu usuwać dane. Kontrakt decide pilnuje
    // test migrate-reminders-to-tasks.test.cjs.
    const existing = { has: (k) => kluczeTasks.has(k) };

    for (const r of remindersSnap.docs) {
      const data = r.data();
      // Decyzja w czystej funkcji (testowanej w migrate-reminders-to-tasks.test.cjs) —
      // tu zostaje samo wykonanie.
      const { akcja, key, target, why } = decide(data, existing);
      const path_ = `users/${userRef.id}/rentals/${r.id}`;

      if (akcja === 'dup') {
        dups += 1;
        console.log(`  DUP  ${path_} — dokument tasks o tym kluczu już istnieje${QUIET ? '' : ` (${key})`}`);
        if (FIX) {
          try {
            zapiszKopie(userRef.id, r.id, data);
            await r.ref.delete();
            removedDups += 1;
          } catch (e) {
            errors += 1;
            console.error(`  ! BŁĄD kasowania duplikatu ${path_}: ${e.code || e.message} — wpis ZOSTAJE`);
          }
        }
        continue;
      }

      // walidacja lustrem (w decide) — timestampy dokłada zapis, lustro sprawdza kształt
      if (akcja === 'invalid') {
        invalid += 1;
        console.log(`  ✗ NIEPRAWIDŁOWY ${path_} — ${why}; wpis zostaje w rentals do ręcznego obejrzenia`);
        continue;
      }

      toMove += 1;
      console.log(`  → ${path_} — ${opis(target)}`);
      if (FIX) {
        // Błąd JEDNEGO dokumentu nie może kłaść całego przebiegu: bez tego pojedynczy
        // DEADLINE_EXCEEDED przerywał migrację i kasował podsumowanie, więc operator
        // nie wiedział, ile kont przeszło (idiom z cleanup-orphan-guide-files-n6.cjs).
        try {
          zapiszKopie(userRef.id, r.id, data);
          await userRef.collection('tasks').add({
            ...target,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
          });
          await r.ref.delete();
          moved += 1;
        } catch (e) {
          errors += 1;
          console.error(`  ! BŁĄD przenoszenia ${path_}: ${e.code || e.message} — oryginał ZOSTAJE, powtórz przebieg`);
        }
      }
    }
  }

  console.log(`\nUżytkowników z legacy-zadaniami: ${usersWith}${bezProfilu ? ` (w tym ${bezProfilu} bez dokumentu profilu)` : ''}.`);
  console.log(`Do przeniesienia: ${toMove}, duplikatów do skasowania: ${dups}, nieprawidłowych (zostają): ${invalid}.`);
  if (FIX) {
    console.log(`Przeniesiono: ${moved}, usunięto duplikatów: ${removedDups}, błędów: ${errors}.`);
    if (backupUzyty) console.log(`Kopia zapasowa kasowanych wpisów: ${backupPath}`);
  } else {
    console.log('Nic nie zapisano (dry-run). Ten sam plan wykona --fix.');
  }
  process.exit(errors > 0 ? 3 : (invalid > 0 ? 2 : 0));
})().catch((e) => { console.error(e); process.exit(1); });
