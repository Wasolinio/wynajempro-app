/*
  Testy warstwy odczytu panelu administratora — części, które NIE dotykają bazy.

  PO CO: maskowanie i przeliczanie dat to jedyne miejsca w tym module, gdzie da się
  pomylić bez awarii — funkcja nie rzuci, tylko po cichu pokaże PESEL zamiast gwiazdek
  albo policzy rejestracje wg innej doby niż polska. Zapytania do Firestore pokrywa
  lustrzany tester `audit-admin-api.cjs` (wymaga klucza serwisowego); tutaj jest to,
  co można sprawdzić bez żadnych poświadczeń i przy każdej zmianie.

  Uruchomienie (z katalogu functions/):  node --test
*/
const test = require('node:test');
const assert = require('node:assert');

const { maskIdentifier, maskUrl, toMillis, dayKey, daysAgo } = require('./admin-data');

test('maskIdentifier zostawia wyłącznie trzy ostatnie znaki', () => {
  // PESEL ma 11 cyfr — z tego widoczne mogą być trzy, reszta to gwiazdki.
  assert.strictEqual(maskIdentifier('90010112345'), '••••••••345');
  assert.strictEqual(maskIdentifier('1234567890'), '•••••••890');
});

test('maskIdentifier nie odsłania krótkiego identyfikatora przez zaokrąglenie', () => {
  assert.strictEqual(maskIdentifier('ab'), '••');
  assert.strictEqual(maskIdentifier('abc'), '•••');
});

test('maskIdentifier na pustej wartości zwraca null, nie gwiazdki', () => {
  assert.strictEqual(maskIdentifier(null), null);
  assert.strictEqual(maskIdentifier(''), null);
});

test('maskUrl nie przepuszcza tokenu z adresu iCal', () => {
  // Adres iCal Booking.com niesie token w query — to sekret, nie metadana.
  const zamaskowany = maskUrl('https://admin.booking.com/hotel/ical?t=SEKRETNY_TOKEN_1234');
  assert.ok(!zamaskowany.includes('SEKRETNY_TOKEN_1234'), 'token wyciekł do odpowiedzi');
  assert.ok(zamaskowany.startsWith('admin.booking.com/'), 'host powinien zostać — po nim rozpoznaje się kanał');
});

test('maskUrl na niepoprawnym adresie nie rzuca i nie ujawnia treści', () => {
  const wynik = maskUrl('to-nie-jest-url-tylko-jakis-smiec');
  assert.ok(!wynik.includes('smiec'));
  assert.ok(wynik.includes('zn.'), 'zostaje sama długość, żeby dało się zdiagnozować puste pole');
});

test('toMillis rozumie Timestamp, Date i string, a śmieć zwraca jako null', () => {
  assert.strictEqual(toMillis({ toMillis: () => 42 }), 42);
  assert.strictEqual(toMillis(new Date(1000)), 1000);
  assert.strictEqual(toMillis('2026-08-19T00:00:00.000Z'), Date.parse('2026-08-19T00:00:00.000Z'));
  // Legacy stringi w bazie bywają nieparsowalne — muszą wypaść, a nie stać się NaN.
  assert.strictEqual(toMillis('nie-data'), null);
  assert.strictEqual(toMillis(null), null);
  assert.strictEqual(toMillis(undefined), null);
});

test('dayKey liczy dobę wg strefy Europe/Warsaw, nie UTC', () => {
  // 22:30 UTC w sierpniu to 00:30 następnego dnia w Polsce (UTC+2).
  // Gdyby wykres liczył doby po UTC, rejestracje z późnego wieczora lądowałyby
  // na poprzednim słupku — i tempo wzrostu byłoby rozmazane o jeden dzień.
  assert.strictEqual(dayKey(new Date('2026-08-19T22:30:00Z')), '2026-08-20');
  assert.strictEqual(dayKey(new Date('2026-08-19T10:00:00Z')), '2026-08-19');
  // Zima: UTC+1, więc 23:30 UTC to wciąż ten sam dzień w Polsce.
  assert.strictEqual(dayKey(new Date('2026-01-15T23:30:00Z')), '2026-01-16');
  assert.strictEqual(dayKey(new Date('2026-01-15T22:30:00Z')), '2026-01-15');
});

test('dayKey zwraca format sortowalny leksykograficznie', () => {
  assert.match(dayKey(new Date()), /^\d{4}-\d{2}-\d{2}$/);
});

test('daysAgo cofa o zadaną liczbę dni', () => {
  assert.strictEqual(Math.round((Date.now() - daysAgo(7).getTime()) / 86400000), 7);
  assert.strictEqual(Math.round((Date.now() - daysAgo(0).getTime()) / 86400000), 0);
});
