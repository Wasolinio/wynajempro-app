/*
  Testy decyzji migracji legacy-zadań (E3 partia 2, krok 8).

  PO CO: skrypt `migrate-reminders-to-tasks.cjs` KASUJE dokumenty na danych klienta,
  a jego reguła decyzyjna miała błąd, który zauważył dopiero przegląd: dopisywanie
  przeniesionych kluczy do zbioru `existing` sprawiało, że DRUGI z dwóch identycznych
  wpisów legacy był kasowany bez kopii (panel pokazuje dziś oba — dedup w useTasksBoard
  odsiewa legacy wyłącznie względem kolekcji `tasks`). Ten zestaw pilnuje, żeby taka
  pomyłka padła tutaj, a nie na danych gospodarza.

  Testujemy CZYSTĄ funkcję `decide` — bez Firestore i bez Admin SDK.
*/
const test = require('node:test');
const assert = require('node:assert');
const { decide, dedupKey, docelowy } = require('./migrate-reminders-to-tasks.cjs');

const reminder = (over = {}) => ({
  type: 'reminder', text: 'Wymiana pościeli', date: '2026-09-01',
  property: 'Domek A', isCompleted: false, ...over,
});

test('wpis bez odpowiednika w tasks jest przenoszony', () => {
  const d = decide(reminder(), new Set());
  assert.equal(d.akcja, 'move');
  assert.equal(d.target.text, 'Wymiana pościeli');
  assert.equal(d.target.propertyName, 'Domek A');
  assert.equal(d.target.date, '2026-09-01');
  assert.equal(d.target.done, false);
});

test('mapowanie pól wg IMPLEMENTACJA §1: isCompleted → done, property → propertyName', () => {
  const t = docelowy(reminder({ isCompleted: true, property: { name: 'Willa Bryza' } }));
  assert.equal(t.done, true, 'isCompleted przechodzi na done');
  assert.equal(t.propertyName, 'Willa Bryza', 'property jako obiekt daje samą nazwę');
  assert.equal(t.rentalId, null);
  assert.equal(t.templateId, null);
  assert.deepEqual(t.subtasks, []);
  assert.deepEqual(t.photos, []);
});

test('wpis, którego kopia JUŻ jest w tasks, to duplikat do skasowania', () => {
  const existing = new Set([dedupKey('Wymiana pościeli', '2026-09-01', 'Domek A')]);
  assert.equal(decide(reminder(), existing).akcja, 'dup');
});

test('🛑 DWA IDENTYCZNE wpisy legacy dają DWA przeniesienia, nie przeniesienie i kasację', () => {
  // Regresja na błąd znaleziony w przeglądzie 2026-08-29. Gdyby wykonawca skryptu
  // dopisywał klucz przeniesionego wpisu do `existing`, drugie wywołanie zwróciłoby
  // 'dup' — czyli kasację BEZ kopii. Zbiór `existing` reprezentuje stan `tasks`
  // sprzed migracji i w trakcie przebiegu NIE rośnie.
  const existing = new Set();
  const pierwszy = decide(reminder({ isCompleted: true }), existing);
  const drugi = decide(reminder({ isCompleted: false }), existing);
  assert.equal(pierwszy.akcja, 'move');
  assert.equal(drugi.akcja, 'move', 'drugi identyczny reminder NIE MOŻE być kasowany jako duplikat');
  assert.equal(existing.size, 0, 'decide nie może modyfikować stanu sprzed migracji');
});

test('klucz dedup zgodny z odczytem zgodnościowym w panelu (text|date|propertyName)', () => {
  // Ten sam kształt co useTasksBoard.js i dailyReport w ManagerApp.jsx — rozjazd
  // oznaczałby albo duplikaty na ekranie, albo kasację wpisu, którego kopii nie ma.
  assert.equal(dedupKey('Sprzątanie', '2026-09-01', 'Domek A'), 'Sprzątanie|2026-09-01|Domek A');
  assert.equal(dedupKey('', null, null), 'Brak opisu||', 'puste pola: fallback treści, reszta pusta');
});

test('wpis bez treści dostaje fallback i przechodzi walidację lustra', () => {
  const d = decide(reminder({ text: '' }), new Set());
  assert.equal(d.akcja, 'move');
  assert.equal(d.target.text, 'Brak opisu', 'pusty text nie może wywrócić walidacji reguł');
});

test('wpis odrzucony przez lustro reguł ZOSTAJE w rentals (nigdy nie jest kasowany)', () => {
  // Realny kształt starych danych: `date` zapisana jako Timestamp, a nie 'YYYY-MM-DD'
  // (wpisy sprzed walidacji schematu N3). Reguły odrzuciłyby taki dokument, więc
  // lustro musi to złapać PRZED zapisem — a wpis ma zostać w rentals do obejrzenia.
  const d = decide(reminder({ date: { seconds: 1756684800, nanoseconds: 0 } }), new Set());
  assert.equal(d.akcja, 'invalid');
  assert.ok(d.why, 'powód odrzucenia trafia do raportu, żeby dało się to obejrzeć ręcznie');

  // Druga granica: treść ponad limit 5000 znaków z isValidTask.
  const dlugi = decide(reminder({ text: 'x'.repeat(5001) }), new Set());
  assert.equal(dlugi.akcja, 'invalid');
});

test('zadanie bez daty (skrzynka) migruje się z date: null', () => {
  const d = decide(reminder({ date: null }), new Set());
  assert.equal(d.akcja, 'move');
  assert.equal(d.target.date, null);
});
