/*
  Testy lustra walidacji `tasks` (moduł Zadania, E3) — bez bazy i bez poświadczeń.

  PO CO: reguła isValidTask w firestore.rules nie ma emulatora (brak Javy — skill
  `reguly`), a jej lustro whyInvalidTask w validate-schema-n3.cjs pełny przebieg robi
  tylko na produkcji z kluczem serwisowym. Ten plik utrwala przebieg „na sucho":
  każdy kształt dokumentu, który pisze moduł Zadania, MUSI przejść, a każde znane
  naruszenie modelu MUSI upaść z powodem. Zmiana reguły bez zmiany lustra (albo
  odwrotnie) wywraca tę suitę przy zwykłym `npm test`.

  Uruchomienie (z katalogu functions/):  node --test
*/
const test = require('node:test');
const assert = require('node:assert');

const { whyInvalidTask } = require('./validate-schema-n3.cjs');

// atrapa Timestampa Admin SDK — lustro rozpoznaje go po metodzie toDate (jak isMap)
const ts = { toDate: () => new Date(), seconds: 0, nanoseconds: 0 };

/* ── dokumenty, które moduł Zadania faktycznie zapisuje — MUSZĄ przejść ── */
const MUSZA_PRZEJSC = [
  ['pełny model ze spec (IMPLEMENTACJA.md §1)', {
    text: 'Dowieźć ręczniki', propertyName: 'Domek nad jeziorem', rentalId: '1755900000000',
    templateId: null, date: '2026-08-25', time: '11:00', priority: 'wysoki',
    note: 'Ciepła barwa, E27.', subtasks: [{ text: 'Pościel i ręczniki', done: true }],
    recurrence: null, photos: [], done: false, doneAt: null, createdAt: ts, updatedAt: ts,
  }],
  ['skrzynka „do przypisania": date=null, rentalId=null', {
    text: 'Serwis kosiarki', propertyName: null, rentalId: null, templateId: null,
    date: null, time: '', priority: 'niski', note: '', subtasks: [], recurrence: null,
    photos: [], done: false, doneAt: null, createdAt: ts, updatedAt: ts,
  }],
  ['minimalny (sam text + done)', { text: 'Zadanie', done: false }],
  ['aktualizacja po merge: done + doneAt jako Timestamp', {
    text: 'Zadanie', date: '2026-08-23', priority: 'normalny', done: true, doneAt: ts,
    createdAt: ts, updatedAt: ts,
  }],
  ['recurrence jako mapa (partia 2, ale schemat już ją dopuszcza)', {
    text: 'Odczyt licznika', recurrence: { kind: 'monthly', label: 'co miesiąc' }, done: false,
  }],
  ['limit graniczny: 50 podzadań i 10 zdjęć', {
    text: 'Duże zadanie', done: false,
    subtasks: Array.from({ length: 50 }, (_, i) => ({ text: `krok ${i}`, done: false })),
    photos: Array.from({ length: 10 }, (_, i) => ({ path: `p${i}`, url: `u${i}` })),
  }],
];

/* ── znane naruszenia modelu — MUSZĄ upaść, z powodem ── */
const MUSZA_UPASC = [
  ['nieznane pole', { text: 'X', zlePole: 1 }],
  ['brak text', { done: false }],
  ['text pusty', { text: '', done: false }],
  ['51 podzadań (limit 50)', { text: 'X', subtasks: Array.from({ length: 51 }, () => ({})) }],
  ['11 zdjęć (limit 10)', { text: 'X', photos: Array.from({ length: 11 }, () => ({})) }],
  ['priorytet spoza słownika', { text: 'X', priority: 'urgent' }],
  ['date jako liczba', { text: 'X', date: 20260825 }],
  ['done jako string', { text: 'X', done: 'tak' }],
  ['doneAt jako string', { text: 'X', doneAt: '2026-08-23' }],
  ['recurrence jako string', { text: 'X', recurrence: 'co miesiąc' }],
];

for (const [nazwa, doc] of MUSZA_PRZEJSC) {
  test(`isValidTask przepuszcza: ${nazwa}`, () => {
    assert.strictEqual(whyInvalidTask(doc), null);
  });
}

for (const [nazwa, doc] of MUSZA_UPASC) {
  test(`isValidTask odrzuca: ${nazwa}`, () => {
    const why = whyInvalidTask(doc);
    // powód jest częścią kontraktu testera — samo `false` byłoby bezużyteczne (skill reguly)
    assert.strictEqual(typeof why, 'string');
    assert.ok(why.length > 0, 'odrzucenie musi nieść powód');
  });
}
