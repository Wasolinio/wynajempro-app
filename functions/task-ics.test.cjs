/*
  Testy formattera taskIcs (E6, runda 3) — zadanie jako wydarzenie .ics podawane
  z prawdziwego adresu https, INLINE (podgląd Safari na iOS zamiast pobierania).

  Endpoint jest publiczny i nieuwierzytelniony, więc testy pilnują dokładnie tego,
  co go chroni: twardej walidacji daty, capa długości tytułu i escapingu, przez
  który wstrzyknięte CRLF nie rozerwie struktury VEVENT.

  Uruchomienie (z katalogu functions/):  node --test
*/
const test = require('node:test');
const assert = require('node:assert');

const { taskIcsResponse } = require('./task-ics');

test('poprawne żądanie → 200, text/calendar, inline, DTSTART/DTEND zgodne z d', () => {
  const r = taskIcsResponse({ t: 'Umyć okna (Domek Morze)', d: '2026-09-05', uid: 'b-1-review@wynajempro.pl' });
  assert.equal(r.status, 200);
  assert.equal(r.headers['Content-Type'], 'text/calendar; charset=utf-8');
  // `inline` to sedno funkcji — `attachment` wymusiłby pobieranie jak w exportIcal
  assert.equal(r.headers['Content-Disposition'], 'inline; filename="zadanie.ics"');
  assert.equal(r.headers['Cache-Control'], 'private, max-age=300');
  assert.match(r.body, /DTSTART;VALUE=DATE:20260905\r\n/);
  assert.match(r.body, /DTEND;VALUE=DATE:20260906\r\n/); // dzień następny (koniec wyłączny)
  assert.match(r.body, /SUMMARY:Umyć okna \(Domek Morze\)\r\n/);
  assert.match(r.body, /UID:b-1-review@wynajempro\.pl\r\n/);
  assert.match(r.body, /PRODID:-\/\/WynajemPRO\/\/Zadania\/\/PL\r\n/);
  assert.match(r.body, /TRIGGER:PT9H\r\n/);
});

test('DTEND przechodzi poprawnie przez koniec miesiąca i roku', () => {
  assert.match(taskIcsResponse({ d: '2026-12-31' }).body, /DTEND;VALUE=DATE:20270101\r\n/);
  assert.match(taskIcsResponse({ d: '2026-02-28' }).body, /DTEND;VALUE=DATE:20260301\r\n/);
});

test('data spoza formatu YYYY-MM-DD → 400', () => {
  for (const d of ['2026-9-5', '05-09-2026', '20260905', '', 'jutro', '2026-09-05x']) {
    assert.equal(taskIcsResponse({ t: 'X', d }).status, 400, `d=${JSON.stringify(d)}`);
  }
});

test('data pasująca do wzorca, ale nieistniejąca w kalendarzu → 400', () => {
  for (const d of ['2026-13-01', '2026-02-30', '2026-00-10', '2026-04-31']) {
    assert.equal(taskIcsResponse({ t: 'X', d }).status, 400, `d=${d}`);
  }
});

test('tytuł ponad 300 znaków jest przycinany do 300', () => {
  const r = taskIcsResponse({ t: 'x'.repeat(400), d: '2026-09-05' });
  assert.equal(r.status, 200);
  assert.ok(r.body.includes(`SUMMARY:${'x'.repeat(300)}\r\n`));
  assert.ok(!r.body.includes('x'.repeat(301)));
});

test('wstrzyknięcie CRLF w tytule nie rozrywa linii VEVENT', () => {
  const r = taskIcsResponse({ t: 'Zadanie\r\nUID:zlosliwy@evil\r\nATTENDEE:mailto:x@evil', d: '2026-09-05' });
  assert.equal(r.status, 200);
  const linie = r.body.split('\r\n');
  // żadna wstrzyknięta właściwość nie stała się osobną linią kalendarza
  assert.ok(!linie.some((l) => l.startsWith('UID:zlosliwy')), 'wstrzyknięty UID stał się linią');
  assert.ok(!linie.some((l) => l.startsWith('ATTENDEE:')), 'wstrzyknięty ATTENDEE stał się linią');
  // \r usunięte, \n escapowane do literalnego \n — całość została w SUMMARY
  assert.ok(linie.some((l) => l === 'SUMMARY:Zadanie\\nUID:zlosliwy@evil\\nATTENDEE:mailto:x@evil'));
});

test('pusty tytuł → fallback „Zadanie"', () => {
  const r = taskIcsResponse({ t: '   ', d: '2026-09-05' });
  assert.match(r.body, /SUMMARY:Zadanie\r\n/);
});

test('brak lub niepoprawny uid → losowy w domenie wynajempro.pl', () => {
  for (const uid of [undefined, '', 'zły uid ze spacją', 'ąę', 'x'.repeat(121)]) {
    const r = taskIcsResponse({ t: 'X', d: '2026-09-05', uid });
    assert.match(r.body, /UID:zadanie-[a-z0-9-]+@wynajempro\.pl\r\n/, `uid=${JSON.stringify(uid)}`);
  }
});
