// =============================================================================
// TESTY EKSPORTU CSV
//
// Plik trafia do księgowej i tam żyje własnym życiem — bez interfejsu, który mógłby
// cokolwiek wyjaśnić. Te testy pilnują trzech rzeczy: żeby liczby zgadzały się z panelem,
// żeby zastrzeżenie prawne jechało razem z plikiem, i żeby dane gospodarza nie zamieniły
// się w formułę wykonywaną w cudzym arkuszu.
//
// Uruchomienie: npm run test:podatki
// =============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { zestawieniePodatkoweCSV, nazwaPliku } from './taxExport.js';
import { podsumowaniePodatkowe, podsumowanieMiesieczne } from './taxSummary.js';
import { monthNames } from './constants.js';

const DZIS = new Date('2026-12-31');
const REZERWACJE = [
  { type: 'booking', date: '2026-05-05', endDate: '2026-05-09', property: 'Apartament A', guest: 'Anna Nowak', source: 'Booking.com', income: 62000, commission: 6800 },
  { type: 'booking', date: '2026-07-12', endDate: '2026-07-19', property: 'Apartament A', guest: 'Jan Kowalski', source: 'Airbnb', income: 46200, commission: 4900 },
  { type: 'utility', date: '2026-06-30', property: 'Apartament A', category: 'Media', text: 'Prąd i woda', utilities: 5620 },
];
const USTAWIENIA = { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'business' };

function zrob(rentals = REZERWACJE, ustawienia = USTAWIENIA) {
  const p = podsumowaniePodatkowe(rentals, ustawienia, 2026, DZIS);
  const m = podsumowanieMiesieczne(rentals, ustawienia, 2026);
  return { csv: zestawieniePodatkoweCSV(p, rentals, m, monthNames, 2026, DZIS), p };
}

test('liczby w pliku zgadzają się z panelem', () => {
  const { csv, p } = zrob();
  const przecinek = (n) => n.toFixed(2).replace('.', ',');

  // Rozjazd między ekranem a plikiem byłby gorszy niż brak pliku — księgowa zobaczyłaby
  // liczby, których gospodarz nie umie wytłumaczyć.
  assert.ok(csv.includes(przecinek(p.brutto)), 'przychód brutto');
  assert.ok(csv.includes(przecinek(p.podstawa)), 'podstawa');
  assert.ok(csv.includes(przecinek(p.podatek)), 'podatek');
  assert.ok(csv.includes(przecinek(p.lacznieDoZaplaty)), 'razem do odłożenia');
  assert.ok(csv.includes(przecinek(p.zdrowotnaRok)), 'zdrowotna');
});

test('zastrzeżenie prawne jedzie razem z plikiem', () => {
  const { csv } = zrob();
  assert.ok(csv.includes('Nie jest deklaracją, wyliczeniem podatku ani poradą podatkową'));
  assert.ok(csv.includes('zapłaconych już zaliczek i składek'));
  // Odpowiedź na pytanie Q8 — mówimy wprost, czego NIE liczymy.
  assert.ok(csv.includes('VAT od prowizji portali (import usług) jest poza zakresem aplikacji'));
});

test('linia o limicie zwolnienia z VAT jedzie w pliku — ale nie u czynnego podatnika', () => {
  // Rachunek ręczny: brutto = 62 000 + 46 200 = 108 200 zł z limitu 240 000 zł (art. 113).
  const { csv } = zrob();
  assert.ok(csv.includes('Limit zwolnienia podmiotowego z VAT (art. 113): rezerwacje w aplikacji wykorzystały 108200,00 zł z 240000,00 zł'));
  assert.ok(csv.includes('pozostała sprzedaż gospodarza także zużywa ten limit'));

  // Czynnemu podatnikowi zwolnienie podmiotowe jest obojętne — linia znika.
  const { csv: vatowiec } = zrob(REZERWACJE, { ...USTAWIENIA, isVatPayer: true });
  assert.ok(!vatowiec.includes('Limit zwolnienia podmiotowego'), 'czynny podatnik bez linii o limicie');
});

test('skala: plik mówi, czego nie liczymy — zdrowotnej i kosztów spoza aplikacji', () => {
  const { csv } = zrob(REZERWACJE, { taxForm: 'general', taxFreeAmount: 0 });
  assert.ok(csv.includes('Składki zdrowotnej przy skali (9% dochodu z całej działalności) nie wyliczamy'));
  assert.ok(csv.includes('Podstawa obejmuje wyłącznie koszty zarejestrowane w aplikacji'));

  // Przy ryczałcie te zdania nie mają czego prostować — nie pokazujemy ich.
  const { csv: ryczalt } = zrob();
  assert.ok(!ryczalt.includes('Składki zdrowotnej przy skali'), 'zdania o skali tylko przy skali');
});

test('konwencje polskiego Excela', () => {
  const { csv } = zrob();
  assert.ok(csv.includes(';'), 'separator średnik');
  assert.ok(/\d,\d\d/.test(csv), 'przecinek dziesiętny');
  assert.ok(!/\d+\.\d\d(?![\d])/.test(csv.replace(/\d{4}-\d\d-\d\d/g, '')), 'brak kropek dziesiętnych');
  assert.ok(csv.includes('\r\n'), 'końce wierszy CRLF');
});

test('dane gospodarza nie zamieniają się w formułę arkusza', () => {
  // CSV injection: pole zaczynające się od =, +, - lub @ arkusz traktuje jak formułę.
  // Nazwa obiektu albo nazwisko gościa może się tak zacząć zupełnie niewinnie.
  const zlosliwe = [{
    type: 'booking', date: '2026-03-01', endDate: '2026-03-03',
    property: '=HYPERLINK("http://zly.example","klik")', guest: '-Kowalski',
    source: '+Booking', income: 1000, commission: 100,
  }];
  const { csv } = zrob(zlosliwe);
  assert.ok(csv.includes("'=HYPERLINK"), 'formuła unieszkodliwiona apostrofem');
  assert.ok(csv.includes("'-Kowalski"), 'minus na początku pola');
  assert.ok(csv.includes("'+Booking"), 'plus na początku pola');
  assert.ok(!/(^|;)=HYPERLINK/m.test(csv), 'żadne pole nie zaczyna się od = bez apostrofu');
});

test('średnik i cudzysłów w danych nie rozwalają kolumn', () => {
  const zProblemem = [{
    type: 'booking', date: '2026-03-01', endDate: '2026-03-03',
    property: 'Dom "Pod Lipą"; parter', guest: 'Nowak', source: 'Booking.com',
    income: 1000, commission: 100,
  }];
  const { csv } = zrob(zProblemem);
  assert.ok(csv.includes('"Dom ""Pod Lipą""; parter"'), 'pole ujęte w cudzysłów i podwojone znaki');
});

test('najem prywatny: plik nie pokazuje zera w wierszu składki', () => {
  const { csv } = zrob(REZERWACJE, { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'private' });
  assert.ok(csv.includes('nie doliczamy — najem prywatny'));
  assert.ok(!csv.includes('Składka zdrowotna;0,00'), 'zero czytałoby się jak twierdzenie o obowiązku');
  assert.ok(csv.includes('najem prywatny (poza działalnością gospodarczą)'), 'podstawa wynajmu w nagłówku');
});

test('współwłasność małżeńska jest nazwana, a nie ukryta w liczbach', () => {
  const { csv } = zrob(REZERWACJE,
    { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'private', spouseRental: 'polowa' });
  assert.ok(csv.includes('rozliczana jest połowa przychodu'));
  assert.ok(csv.includes('Część małżonka'), 'skok z brutto do podstawy musi być wytłumaczony');
});

test('prowizje i media stoją poza rachunkiem ryczałtu, z ostrzeżeniem', () => {
  const { csv } = zrob();
  assert.ok(csv.includes('POZA RACHUNKIEM RYCZAŁTU'));
  assert.ok(csv.includes('NIE obniżają podatku'));
  // W sekcji podsumowania nie może być wiersza, który je odejmuje od podstawy.
  const podsumowanie = csv.slice(csv.indexOf('PODSUMOWANIE ROKU'), csv.indexOf('POZA RACHUNKIEM'));
  assert.ok(!podsumowanie.includes('Prowizje portali'), 'prowizje nie wchodzą do rachunku ryczałtu');
});

test('rok bez rezerwacji daje plik, który mówi o pustce, a nie zmyśla', () => {
  const { csv } = zrob([]);
  assert.ok(csv.includes('REZERWACJE (0)'));
  assert.ok(!csv.includes('KOSZTY EKSPLOATACYJNE'), 'pustej sekcji kosztów nie wypisujemy');
});

test('nazwa pliku niesie rok i datę', () => {
  assert.equal(nazwaPliku(2026, DZIS), 'wynajempro-podatki-2026-2026-12-31.csv');
});
