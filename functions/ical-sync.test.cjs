/*
  Testy silnika uzgadniania iCal (X26).

  PO CO: to jest logika, w której da się pomylić bez awarii — nic nie rzuci, tylko
  gospodarz po cichu dostanie duplikat rezerwacji albo zablokowany na zawsze termin.
  Dokładnie tak zachowywał się kod sprzed 2026-08-22, przez pół roku, i nikt tego nie
  zauważył, bo żaden test nie sprawdzał, co się dzieje przy DRUGIM przebiegu.
  Każdy test poniżej odpowiada jednemu ze scenariuszy z tamtej regresji.

  Baza jest podrobiona (fake Firestore) — pełne uzgodnienie da się przejść bez
  poświadczeń i bez emulatora, którego w tym środowisku nie ma (brak Javy).

  Uruchomienie (z katalogu functions/):  node --test
*/
const test = require('node:test');
const assert = require('node:assert');

const { reconcileChannel, parseICalEvents, formatICalDate, guestFromSummary, channelKey, isBlokada } =
  require('./ical-sync');

// ── Podróbka Firestore: tyle, ile dotyka silnik ──────────────────────────────
function fakeDb() {
  const docs = new Map();          // ścieżka → dane
  let seq = 0;
  // `id` jest tu istotne, nie ozdobne: silnik zapamiętuje `ref.id` w mapie UID→dokument.
  // Bez tego pola atrapa cicho gubiła mapę (JSON.stringify zjada `undefined`), a testy
  // pokazywały duplikaty, których w prawdziwym Firestore nie ma.
  const ref = (path) => ({
    path,
    id: path.split('/').pop(),
    get: async () => ({ exists: docs.has(path), data: () => docs.get(path) }),
  });
  const kolekcja = (base) => ({
    doc: (id) => (id ? ref(`${base}/${id}`) : ref(`${base}/auto-${++seq}`)),
    where() { return this; },
    get: async () => {
      const prefix = base + '/';
      const wynik = [...docs.entries()]
        .filter(([k]) => k.startsWith(prefix) && !k.slice(prefix.length).includes('/'))
        .map(([k, v]) => ({ id: k.slice(prefix.length), data: () => v }));
      return { docs: wynik, empty: wynik.length === 0, forEach: (f) => wynik.forEach(f) };
    },
  });
  const db = {
    _docs: docs,
    collection: (name) => ({
      doc: (id) => ({
        collection: (sub) => kolekcja(`${name}/${id}/${sub}`),
      }),
    }),
    batch: () => {
      const ops = [];
      return {
        set: (r, data, opts) => ops.push([r.path, data, opts]),
        commit: async () => {
          for (const [path, data, opts] of ops) {
            docs.set(path, opts && opts.merge ? { ...(docs.get(path) || {}), ...data } : data);
          }
        },
      };
    },
  };
  return db;
}

const feed = (zdarzenia) => [
  'BEGIN:VCALENDAR', 'VERSION:2.0',
  ...zdarzenia.flatMap(([uid, od, do_, summary, status]) => [
    'BEGIN:VEVENT', `UID:${uid}`,
    `DTSTART;VALUE=DATE:${od}`, `DTEND;VALUE=DATE:${do_}`,
    `SUMMARY:${summary || 'Reserved'}`,
    ...(status ? [`STATUS:${status}`] : []),
    'END:VEVENT',
  ]),
  'END:VCALENDAR',
].join('\r\n');

/** Podmienia globalny fetch na feed z pamięci — silnik pobiera przez fetch. */
function zFeedem(tekst, fn) {
  const oryginal = global.fetch;
  global.fetch = async () => ({
    ok: true, status: 200,
    headers: { get: () => null },
    body: {
      getReader() {
        let wydane = false;
        return {
          read: async () => (wydane
            ? { done: true }
            : ((wydane = true), { done: false, value: Buffer.from(tekst, 'utf8') })),
          cancel() {},
        };
      },
    },
  });
  return fn().finally(() => { global.fetch = oryginal; });
}

const rezerwacje = (db) => [...db._docs.entries()]
  .filter(([k]) => k.startsWith('users/u1/rentals/'))
  .map(([k, v]) => ({ id: k.split('/').pop(), ...v }));

const URL_TESTOWY = 'https://example.com/kalendarz.ics';

test('pierwszy przebieg dodaje rezerwacje z feedu', async () => {
  const db = fakeDb();
  const r = await zFeedem(feed([['a@x', '20260701', '20260705']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  assert.strictEqual(r.dodane, 1);
  const [rez] = rezerwacje(db);
  assert.strictEqual(rez.date, '2026-07-01');
  assert.strictEqual(rez.endDate, '2026-07-05');
  assert.strictEqual(rez.syncUid, 'a@x');
  assert.strictEqual(rez.syncStatus, 'active');
});

test('drugi przebieg na niezmienionym feedzie NIE tworzy duplikatu', async () => {
  const db = fakeDb();
  const f = feed([['a@x', '20260701', '20260705']]);
  await zFeedem(f, () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  const r2 = await zFeedem(f, () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  assert.strictEqual(r2.pominiete, true, 'niezmieniony feed powinien zostać pominięty po sumie kontrolnej');
  assert.strictEqual(r2.dodane, 0);
  assert.strictEqual(rezerwacje(db).length, 1);
});

test('ZMIANA DAT aktualizuje tę samą rezerwację, zamiast dodawać drugą', async () => {
  // To jest regresja, dla której powstał cały moduł: stary klucz zawierał daty,
  // więc przedłużenie pobytu tworzyło DRUGĄ rezerwację obok pierwszej.
  const db = fakeDb();
  await zFeedem(feed([['a@x', '20260701', '20260705']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  const r2 = await zFeedem(feed([['a@x', '20260701', '20260708']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));

  assert.strictEqual(r2.dodane, 0, 'nie wolno dodać drugiej rezerwacji');
  assert.strictEqual(r2.zmienione, 1);
  const lista = rezerwacje(db);
  assert.strictEqual(lista.length, 1, 'nadal jedna rezerwacja');
  assert.strictEqual(lista[0].endDate, '2026-07-08');
});

test('ZNIKNIĘCIE z feedu oznacza rezerwację, ale jej NIE KASUJE', async () => {
  // Realny scenariusz anulowania: JEDNA rezerwacja wypada, reszta feedu zostaje.
  // Wcześniej ten test używał pustego feedu i przez to utrwalał zachowanie,
  // które recenzja wskazała jako groźne — patrz test o masowym zniknięciu niżej.
  const db = fakeDb();
  await zFeedem(feed([['a@x', '20261001', '20261005'], ['b@x', '20261101', '20261103']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  const r2 = await zFeedem(feed([['b@x', '20261101', '20261103']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));

  assert.strictEqual(r2.znikle, 1);
  const lista = rezerwacje(db);
  assert.strictEqual(lista.length, 2, 'rezerwacja MUSI zostać — mogą przy niej być kwoty gospodarza');
  const znikla = lista.find((r) => r.syncUid === 'a@x');
  assert.strictEqual(znikla.syncStatus, 'vanished');
  // Patch musi nieść pola tożsamości, żeby dokument odtworzony po skasowaniu był poprawny.
  assert.strictEqual(znikla.type, 'booking');
  assert.strictEqual(znikla.property, 'Domek');
});

test('PUSTY feed przy znanych rezerwacjach NIE oznacza wszystkiego jako znikłe', async () => {
  // Portal w awarii potrafi oddać poprawny, ale pusty kalendarz. Gdyby silnik uznał
  // to za odwołanie wszystkiego, rezerwacje wypadłyby z eksportu i pozostałe portale
  // dostałyby wolne noce, które ktoś już kupił — czyli overbooking wywołany czkawką.
  const db = fakeDb();
  await zFeedem(feed([['a@x', '20261001', '20261005'], ['b@x', '20261101', '20261103']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  const cichy = { warn: () => {}, info: () => {}, error: () => {} };
  const r2 = await zFeedem(feed([]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY, cichy));

  assert.strictEqual(r2.znikle, 0, 'pusty feed nie może masowo oznaczać');
  assert.ok(rezerwacje(db).every((r) => r.syncStatus !== 'vanished'));
});

test('odpowiedź, która NIE jest kalendarzem, jest odrzucana', async () => {
  // Strona logowania albo HTML błędu z HTTP 200 — parsuje się do zera zdarzeń.
  const db = fakeDb();
  await zFeedem(feed([['a@x', '20261001', '20261005']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  await assert.rejects(
    () => zFeedem('<!doctype html><html><body>Zaloguj się</body></html>',
      () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY)),
    /BEGIN:VCALENDAR/,
  );
  assert.ok(rezerwacje(db).every((r) => r.syncStatus !== 'vanished'));
});

test('zakończony pobyt wypada z feedu bez oznaczania go jako anulowany', async () => {
  // Portale eksportują okno terminów — stara rezerwacja znika w normalnym trybie.
  const db = fakeDb();
  const dawno = new Date(Date.now() - 120 * 86400000).toISOString().slice(0, 10).replace(/-/g, '');
  await zFeedem(feed([[ 'stary@x', dawno, dawno ], ['b@x', '20261101', '20261103']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  const r2 = await zFeedem(feed([['b@x', '20261101', '20261103']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));

  assert.strictEqual(r2.znikle, 0, 'zamknięty pobyt to nie anulowanie');
  const stary = rezerwacje(db).find((r) => r.syncUid === 'stary@x');
  assert.notStrictEqual(stary.syncStatus, 'vanished');
});

test('pusty feed wstrzymuje oznaczanie na CZAS, nie na liczbę przebiegów', async () => {
  // Dwie regresje w jednym teście.
  // (1) Pierwsza wersja bramki zapisywała sumę kontrolną pustego feedu, więc kolejne przebiegi
  //     wychodziły wcześnie i oznaczenie nie następowało NIGDY.
  // (2) Druga wersja liczyła PRZEBIEGI — a ręczny przycisk „Synchronizacja" idzie tą samą
  //     ścieżką, więc gospodarz, któremu „nie działa", trzema kliknięciami zwijał bezpiecznik
  //     do kilkunastu sekund i zwalniał sobie terminy w portalach.
  const db = fakeDb();
  const cichy = { warn: () => {}, info: () => {}, error: () => {} };
  await zFeedem(feed([['a@x', '20261001', '20261005']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));

  // Trzy przebiegi pod rząd, bez upływu czasu — bezpiecznik MUSI trzymać.
  for (let i = 0; i < 3; i++) {
    const r = await zFeedem(feed([]), () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY, cichy));
    assert.strictEqual(r.znikle, 0, `klikanie nie może zwijać bezpiecznika (przebieg ${i + 1})`);
  }
  assert.notStrictEqual(rezerwacje(db)[0].syncStatus, 'vanished');

  // Cofamy znacznik o cztery godziny — portal jest pusty naprawdę długo.
  const kluczStanu = [...db._docs.keys()].find((k) => k.startsWith('users/u1/syncState/'));
  const stan = db._docs.get(kluczStanu);
  db._docs.set(kluczStanu, {
    ...stan, pierwszyPustyOd: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
  });

  const r = await zFeedem(feed([]), () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY, cichy));
  assert.strictEqual(r.znikle, 1, 'po przekroczeniu progu czasu oznaczenie MUSI nastąpić');
  assert.strictEqual(rezerwacje(db)[0].syncStatus, 'vanished');
});

test('rezerwacja oznaczona WRACA do active nawet po utracie dokumentu stanu', async () => {
  // Recenzja, tura trzecia: poprawka seedująca `odtworzoneDane` nie niosła `syncStatus`,
  // więc po utracie stanu wracająca do feedu rezerwacja nie dostawała żadnego patcha
  // (daty się zgadzały, `bylaZnikla` było fałszywe) i zostawała `vanished` NA ZAWSZE —
  // wypadając z eksportu, czyli zwalniając w portalach termin, który jest sprzedany.
  const db = fakeDb();
  const pelny = feed([['a@x', '20261001', '20261005'], ['b@x', '20261101', '20261103']]);
  const bezA = feed([['b@x', '20261101', '20261103']]);

  await zFeedem(pelny, () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  await zFeedem(bezA, () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  assert.strictEqual(rezerwacje(db).find((r) => r.syncUid === 'a@x').syncStatus, 'vanished');

  // stan przepada (nieudany commit ostatniej porcji, diagnostyka)
  const kluczStanu = [...db._docs.keys()].find((k) => k.startsWith('users/u1/syncState/'));
  db._docs.delete(kluczStanu);

  const r = await zFeedem(pelny, () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  assert.strictEqual(r.wrocone, 1, 'powrót musi zostać rozpoznany mimo utraty stanu');
  assert.strictEqual(rezerwacje(db).find((x) => x.syncUid === 'a@x').syncStatus, 'active');
  assert.strictEqual(rezerwacje(db).length, 2, 'i bez zakładania duplikatu');
});

test('stary pobyt wracający do feedu NIE zakłada drugiego dokumentu', async () => {
  // Przycinanie mapy usuwało UID z `map`, więc jego powrót trafiał w gałąź „nowa rezerwacja".
  // Wystarczyła jednorazowa czkawka portalu przy pobycie starszym niż próg.
  const db = fakeDb();
  const dawno = new Date(Date.now() - 70 * 86400000).toISOString().slice(0, 10).replace(/-/g, '');
  const pelny = feed([[`stary@x`, dawno, dawno], ['zywy@x', '20261101', '20261103']]);
  const bezStarego = feed([['zywy@x', '20261101', '20261103']]);

  await zFeedem(pelny, () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  await zFeedem(bezStarego, () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  const r3 = await zFeedem(pelny, () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));

  assert.strictEqual(r3.dodane, 0, 'powrót starego UID nie może zakładać nowego dokumentu');
  assert.strictEqual(rezerwacje(db).length, 2, 'nadal dwie rezerwacje, nie trzy');
  assert.strictEqual(rezerwacje(db).filter((x) => x.syncUid === 'stary@x').length, 1);
});

test('przycięty pobyt NIE dostaje fałszywego oznaczenia przy kolejnej zmianie feedu', async () => {
  // Recenzja, tura czwarta. Przycinanie usuwało daty z `dane`, zostawiając UID w `map`.
  // Przy następnym PEŁNYM przebiegu pętla oznaczania nie miała daty, bramka PROG nie
  // odpalała (pusty napis jest falsy) i zakończony pobyt dostawał `vanished` — a wraz
  // z nim toast „zniknęły z portalu: N" o rezerwacjach, które nigdy nie zniknęły.
  const db = fakeDb();
  const dawno = new Date(Date.now() - 70 * 86400000).toISOString().slice(0, 10).replace(/-/g, '');

  await zFeedem(feed([['stary@x', dawno, dawno], ['zywy@x', '20261101', '20261103']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  await zFeedem(feed([['zywy@x', '20261101', '20261103']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));

  // zwykła zmiana dat żywej rezerwacji — pełny przebieg, feed nadal bez starego pobytu
  const r3 = await zFeedem(feed([['zywy@x', '20261101', '20261105']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));

  assert.strictEqual(r3.znikle, 0, 'zamknięty pobyt nie może dostać fałszywego oznaczenia');
  const stary = rezerwacje(db).find((x) => x.syncUid === 'stary@x');
  assert.notStrictEqual(stary.syncStatus, 'vanished');
});

test('przycięty pobyt skasowany przez gospodarza NIE jest wskrzeszany', async () => {
  // Wariant (b) tego samego blokera i właściwy powód, dla którego był blokerem:
  // `set(..., {merge:true})` na skasowanym dokumencie TWORZY go od nowa. Bez daty powstawał
  // wpis łamiący `isValidRental` w firestore.rules — panel go nie widzi (kwerenda filtruje
  // po zakresie `date`), a reguła odrzuca każdą jego edycję. Bramka reguł („wszystkie
  // dokumenty produkcji przechodzą walidację") przestałaby być prawdziwa.
  // Ścieżka jest udokumentowana: baza wiedzy każe kasować potwierdzone anulowania koszem.
  const db = fakeDb();
  const dawno = new Date(Date.now() - 70 * 86400000).toISOString().slice(0, 10).replace(/-/g, '');

  await zFeedem(feed([['stary@x', dawno, dawno], ['zywy@x', '20261101', '20261103']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  await zFeedem(feed([['zywy@x', '20261101', '20261103']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));

  // gospodarz kasuje zakończoną rezerwację koszem
  const stary = rezerwacje(db).find((x) => x.syncUid === 'stary@x');
  db._docs.delete('users/u1/rentals/' + stary.id);
  assert.strictEqual(rezerwacje(db).length, 1);

  await zFeedem(feed([['zywy@x', '20261101', '20261105']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));

  assert.strictEqual(rezerwacje(db).length, 1, 'skasowany dokument NIE może zostać wskrzeszony');
  // Każdy dokument w bazie musi mieć `date` — inaczej łamie isValidRental.
  for (const r of rezerwacje(db)) {
    assert.ok(typeof r.date === 'string' && r.date.length > 0, `dokument ${r.id} bez daty`);
  }
});

test('wszystkie zdarzenia CANCELLED to jawne anulowanie — oznacza od razu', async () => {
  // Plik NIE jest pusty (zdarzenia są), portal wprost mówi „odwołane". Ufamy mu,
  // bo to nie jest wzorzec awarii — w odróżnieniu od kalendarza bez ani jednego zdarzenia.
  const db = fakeDb();
  await zFeedem(feed([['a@x', '20261001', '20261005']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  const r2 = await zFeedem(feed([['a@x', '20261001', '20261005', 'Reserved', 'CANCELLED']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));

  assert.strictEqual(r2.znikle, 1, 'jawne anulowanie nie czeka trzech przebiegów');
  assert.strictEqual(rezerwacje(db)[0].syncStatus, 'vanished');
});

test('nazwisko wpisane przez gospodarza PRZEŻYWA zmianę dat w portalu', async () => {
  // Airbnb wysyła w SUMMARY zawsze „Reserved". Dopisywanie go przy każdej aktualizacji
  // kasowałoby pracę gospodarza — a baza wiedzy obiecuje, że synchronizacja nie nadpisuje
  // jego zmian.
  const db = fakeDb();
  await zFeedem(feed([['a@x', '20261001', '20261005']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'airbnb', URL_TESTOWY));
  const id = rezerwacje(db)[0].id;
  // gospodarz uzupełnia dane ręcznie
  db._docs.set('users/u1/rentals/' + id, {
    ...db._docs.get('users/u1/rentals/' + id), guest: 'Jan Kowalski', income: 1800,
  });

  await zFeedem(feed([['a@x', '20261001', '20261008']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'airbnb', URL_TESTOWY));

  const rez = rezerwacje(db)[0];
  assert.strictEqual(rez.endDate, '2026-10-08', 'nowe daty muszą wejść');
  assert.strictEqual(rez.guest, 'Jan Kowalski', 'nazwisko gospodarza NIE może zostać nadpisane');
  assert.strictEqual(rez.income, 1800, 'kwota gospodarza też zostaje');
});

test('po utracie stanu stary pobyt NIE jest oznaczany jako znikły', async () => {
  // Odbudowa mapy musi seedować także DATY z bazy — bez nich próg „pobyt zakończony ponad
  // 60 dni temu" nie ma na czym pracować i wszystko, czego nie ma w bieżącym feedzie,
  // dostaje `vanished`, łącznie z pobytami sprzed roku.
  const db = fakeDb();
  const dawno = new Date(Date.now() - 200 * 86400000).toISOString().slice(0, 10).replace(/-/g, '');
  await zFeedem(feed([['stary@x', dawno, dawno], ['b@x', '20261101', '20261103']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));

  const kluczStanu = [...db._docs.keys()].find((k) => k.startsWith('users/u1/syncState/'));
  db._docs.delete(kluczStanu);

  const r = await zFeedem(feed([['b@x', '20261101', '20261103']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));

  assert.strictEqual(r.znikle, 0, 'zamknięty pobyt to nie anulowanie, nawet po utracie stanu');
  const stary = rezerwacje(db).find((x) => x.syncUid === 'stary@x');
  assert.notStrictEqual(stary.syncStatus, 'vanished');
});

test('POWRÓT rezerwacji do feedu zdejmuje oznaczenie', async () => {
  // Recenzja 2026-08-22: poprzednia wersja używała pustego feedu, więc po wprowadzeniu
  // bramki „podejrzanie pusty kalendarz" nic nie było oznaczane, a `wrocone: 1` brało się
  // ze znacznika w stanie, nie z realnego oznaczenia. Test przechodził PRÓŻNO.
  // Teraz znikanie i powrót idą przez realny scenariusz: druga rezerwacja zostaje w feedzie.
  const db = fakeDb();
  const pelny = feed([['a@x', '20261001', '20261005'], ['b@x', '20261101', '20261103']]);
  const bezA = feed([['b@x', '20261101', '20261103']]);

  await zFeedem(pelny, () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  const r2 = await zFeedem(bezA, () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  assert.strictEqual(r2.znikle, 1, 'najpierw MUSI dojść do realnego oznaczenia');
  assert.strictEqual(rezerwacje(db).find((r) => r.syncUid === 'a@x').syncStatus, 'vanished');

  const r3 = await zFeedem(pelny, () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  assert.strictEqual(r3.wrocone, 1);
  assert.strictEqual(rezerwacje(db).find((r) => r.syncUid === 'a@x').syncStatus, 'active');
  assert.strictEqual(rezerwacje(db).length, 2);
});

test('zdarzenie STATUS:CANCELLED nie tworzy rezerwacji', async () => {
  const db = fakeDb();
  const r = await zFeedem(feed([['a@x', '20260701', '20260705', 'Reserved', 'CANCELLED']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  assert.strictEqual(r.dodane, 0);
  assert.strictEqual(rezerwacje(db).length, 0);
});

test('rezerwacja sprzed X26 zostaje PRZYGARNIĘTA, a nie zdublowana', async () => {
  // Migracja bez skryptu: przy pierwszym przebiegu dopasowujemy po datach
  // istniejące rezerwacje kanału i dopisujemy im UID.
  const db = fakeDb();
  db._docs.set('users/u1/rentals/stara', {
    type: 'booking', property: 'Domek', source: 'Booking',
    date: '2026-07-01', endDate: '2026-07-05', guest: 'Jan', income: 1200,
    syncId: 'sync_booking_Domek_2026-07-01_2026-07-05',
  });

  const r = await zFeedem(feed([['a@x', '20260701', '20260705']]),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));

  assert.strictEqual(r.dodane, 0, 'nie wolno dodać kopii istniejącej rezerwacji');
  const lista = rezerwacje(db);
  assert.strictEqual(lista.length, 1);
  assert.strictEqual(lista[0].id, 'stara');
  assert.strictEqual(lista[0].syncUid, 'a@x');
  assert.strictEqual(lista[0].income, 1200, 'kwota gospodarza nie może zniknąć');
});

test('UTRATA dokumentu stanu NIE duplikuje rezerwacji', async () => {
  // Regresja wprowadzona i złapana przy autoprzeglądzie 2026-08-22. Dokument stanu
  // może zniknąć (nieudany commit ostatniej porcji zapisów, diagnostyka, czyszczenie po awarii). Gdy mapa
  // tożsamości startowała wtedy pusta, silnik dublował CAŁY kanał — czyli popełniał
  // dokładnie ten błąd, dla którego naprawy powstał. Źródłem prawdy jest `syncUid`
  // na rezerwacji; dokument stanu to wyłącznie optymalizacja kosztu odczytów.
  const db = fakeDb();
  const f = feed([['a@x', '20260701', '20260705'], ['b@x', '20260801', '20260803']]);
  await zFeedem(f, () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  assert.strictEqual(rezerwacje(db).length, 2);

  // kasujemy stan — tak jak zrobiłby nieudany commit ostatniej porcji albo diagnostyka
  const kluczStanu = [...db._docs.keys()].find((k) => k.startsWith('users/u1/syncState/'));
  db._docs.delete(kluczStanu);

  const r = await zFeedem(f, () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  assert.strictEqual(r.dodane, 0, 'po utracie stanu nie wolno dodać niczego od nowa');
  assert.strictEqual(rezerwacje(db).length, 2, 'nadal dwie rezerwacje, nie cztery');
});

test('duży feed przechodzi mimo limitu 500 operacji na batch', async () => {
  const db = fakeDb();
  const zdarzenia = [];
  for (let i = 0; i < 600; i++) {
    const d = String(i % 28 + 1).padStart(2, '0');
    const m = String(Math.floor(i / 28) + 1).padStart(2, '0');
    zdarzenia.push([`u${i}@x`, `2027${m}${d}`, `2027${m}${d}`]);
  }
  const r = await zFeedem(feed(zdarzenia),
    () => reconcileChannel(db, 'u1', 'Domek', 'booking', URL_TESTOWY));
  assert.strictEqual(r.dodane, 600);
  assert.strictEqual(rezerwacje(db).length, 600);
});

test('BLOKADA terminu nie jest importowana', async () => {
  // Decyzja właściciela 2026-08-24 (X29): blokad nie wciągamy. Gospodarz ma zwykle portale
  // spięte bezpośrednio, a u nas blokada zapisywała się jako `type: 'booking'`, więc wchodziła
  // do listy przyjazdów i generowała zadania dla gościa, który nie przyjeżdża.
  const db = fakeDb();
  const r = await zFeedem(feed([
    ['gosc@x', '20261001', '20261005', 'Reserved'],
    ['blok1@x', '20261010', '20261012', 'Airbnb (Not available)'],
    ['blok2@x', '20261020', '20261022', 'CLOSED - Not available'],
  ]), () => reconcileChannel(db, 'u1', 'Domek', 'airbnb', URL_TESTOWY));

  assert.strictEqual(r.dodane, 1, 'wchodzi wyłącznie prawdziwa rezerwacja');
  const lista = rezerwacje(db);
  assert.strictEqual(lista.length, 1);
  assert.strictEqual(lista[0].syncUid, 'gosc@x');
});

test('blokada zaimportowana PRZED zmianą jest porzucana po cichu, bez oznaczania', async () => {
  // Przy wdrożeniu tej zmiany gospodarz ma już blokady w bazie. Oznaczenie ich jako
  // „zniknęły z portalu" byłoby nieprawdą (nic nie zniknęło) i zasypałoby go alertami.
  const db = fakeDb();
  const przed = feed([['gosc@x', '20261001', '20261005', 'Reserved']]);
  // stan sprzed zmiany: blokada była śledzona
  await zFeedem(przed, () => reconcileChannel(db, 'u1', 'Domek', 'airbnb', URL_TESTOWY));
  const kluczStanu = [...db._docs.keys()].find((k) => k.startsWith('users/u1/syncState/'));
  const stan = db._docs.get(kluczStanu);
  db._docs.set('users/u1/rentals/stara-blokada', {
    type: 'booking', property: 'Domek', source: 'Airbnb', guest: 'Blokada (Airbnb)',
    date: '2026-10-10', endDate: '2026-10-12', income: 0,
    syncUid: 'blok@x', syncStatus: 'active',
  });
  db._docs.set(kluczStanu, {
    ...stan,
    map: { ...stan.map, 'blok@x': 'stara-blokada' },
    dane: { ...stan.dane, 'blok@x': { date: '2026-10-10', endDate: '2026-10-12' } },
    hash: 'wymuszam-pelny-przebieg',
  });

  const r = await zFeedem(feed([
    ['gosc@x', '20261001', '20261005', 'Reserved'],
    ['blok@x', '20261010', '20261012', 'Airbnb (Not available)'],
  ]), () => reconcileChannel(db, 'u1', 'Domek', 'airbnb', URL_TESTOWY));

  assert.strictEqual(r.znikle, 0, 'blokada nie może zostać oznaczona jako znikła z portalu');
  const blokada = rezerwacje(db).find((x) => x.syncUid === 'blok@x');
  assert.notStrictEqual(blokada.syncStatus, 'vanished', 'wpis zostaje bez fałszywego oznaczenia');
  const nowyStan = db._docs.get(kluczStanu);
  assert.ok(!('blok@x' in nowyStan.map), 'ale przestajemy ją śledzić');
});

test('zmiana samej blokady nie wywołuje pełnego przebiegu', async () => {
  // Suma kontrolna liczona bez blokad — inaczej każde przestawienie blokady w portalu
  // kosztowałoby pełne uzgodnienie i zapis stanu, mimo że nic nas nie obchodzi.
  const db = fakeDb();
  const a = feed([['gosc@x', '20261001', '20261005', 'Reserved'], ['b@x', '20261010', '20261012', 'Airbnb (Not available)']]);
  const b = feed([['gosc@x', '20261001', '20261005', 'Reserved'], ['b@x', '20261111', '20261113', 'Airbnb (Not available)']]);
  await zFeedem(a, () => reconcileChannel(db, 'u1', 'Domek', 'airbnb', URL_TESTOWY));
  const r2 = await zFeedem(b, () => reconcileChannel(db, 'u1', 'Domek', 'airbnb', URL_TESTOWY));
  assert.strictEqual(r2.pominiete, true, 'sama zmiana blokady ma być pominięta po sumie kontrolnej');
});

test('rozpoznawanie blokady obejmuje warianty obu portali', () => {
  // Zmierzone na żywych feedach 2026-08-24.
  assert.ok(isBlokada('Airbnb (Not available)'));
  assert.ok(isBlokada('CLOSED - Not available'));
  assert.ok(isBlokada('Blocked'));
  assert.ok(isBlokada('Niedostępne'));
  assert.ok(!isBlokada('Reserved'));
  assert.ok(!isBlokada('Jan Kowalski'));
  assert.ok(!isBlokada(''));
});

test('parser: rozwija złamane linie (RFC 5545) i czyta pola', () => {
  // Rozwijanie kontynuacji sprawdzamy na SUMMARY, bo DESCRIPTION świadomie nie jest
  // już parsowane (martwe pole + dane osobowe gościa — patrz nagłówek parsera).
  const tekst = ['BEGIN:VCALENDAR', 'BEGIN:VEVENT', 'UID:x@y',
    'DTSTART;VALUE=DATE:20260714', 'DTEND;VALUE=DATE:20260721',
    'SUMMARY:Rezerwacja bardzo dlugiego pobytu w domku nad je',
    ' ziorem', 'STATUS:CONFIRMED', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const [e] = parseICalEvents(tekst);
  assert.strictEqual(e.uid, 'x@y');
  assert.strictEqual(e.status, 'CONFIRMED');
  assert.match(e.summary, /domku nad jeziorem$/);
  assert.strictEqual(e.description, undefined, 'DESCRIPTION nie jest parsowane');
});

test('formatICalDate obsługuje oba formaty i odrzuca śmieci', () => {
  assert.strictEqual(formatICalDate('20260615'), '2026-06-15');
  assert.strictEqual(formatICalDate('20260615T140000Z'), '2026-06-15');
  assert.strictEqual(formatICalDate('abc'), null);
  assert.strictEqual(formatICalDate(''), null);
});

test('blokady portalu są nazwane wprost, nie udają gościa', () => {
  assert.strictEqual(guestFromSummary('CLOSED - Not available', 'Booking'), 'Blokada (Booking)');
  assert.strictEqual(guestFromSummary('Blocked', 'Airbnb'), 'Blokada (Airbnb)');
  assert.strictEqual(guestFromSummary('Jan Kowalski', 'Booking'), 'Jan Kowalski');
  assert.strictEqual(guestFromSummary('', 'Airbnb'), 'Gość Airbnb');
});

test('klucz kanału nie rozbija ścieżki i nie skleja różnych obiektów', () => {
  assert.ok(!channelKey('Domek/nad jeziorem', 'booking').includes('/'));
  assert.ok(!channelKey('a.b#c[d]', 'x').match(/[./#[\]]/));
  // Bez skrótu obie nazwy dawały ten sam klucz i wspólny stan synchronizacji.
  assert.notStrictEqual(channelKey('Domek/A', 'b'), channelKey('Domek_A', 'b'));
});
