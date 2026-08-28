// =============================================================================
// ZŁOTY ZESTAW — taxSummary.js
//
// PO CO. `STAWKI_PODATKOWE` to jedyna rzecz w module podatkowym, która zgnije sama,
// bez żadnego sygnału: wyliczenie policzone zeszłorocznymi stawkami wygląda dokładnie
// tak samo jak poprawne. Analiza prawna z 2026-08-24 postawiła te testy na PIERWSZYM
// miejscu wśród zabezpieczeń — przed bramką CI i przed rejestrem stawek.
//
// Kwoty poniżej są wyliczone RĘCZNIE z tekstów ustaw, nie skopiowane z wyjścia kodu.
// Test, którego oczekiwania pochodzą z tego, co kod właśnie zwrócił, potwierdza wyłącznie,
// że kod się nie zmienił — nie że liczy dobrze.
//
// Uruchomienie: npm run test:podatki
// =============================================================================

import test from 'node:test';
import assert from 'node:assert/strict';
import { podsumowaniePodatkowe, zdrowotnaRyczalt, widelkiZdrowotnej, domyslnyTryb } from './taxSummary.js';
import { STAWKI_PODATKOWE } from './constants.js';

/** Rok 2026 rozłożony na 12 równych rezerwacji — upraszcza rachunek ręczny. */
const rokPrzychodu = (suma) => Array.from({ length: 12 }, (_, i) => ({
  type: 'booking', date: new Date(2026, i, 5).toISOString(), income: suma / 12,
}));
const KONIEC_ROKU = new Date('2026-12-31');   // miesiecy = 12, bez ułamków okresu
const grosz = (a, b, opis) => assert.ok(Math.abs(a - b) < 0.01, `${opis}: ${a} ≠ ${b}`);

test('stawki i progi zgadzają się z ustawami — bramka na ciche zmiany w constants', () => {
  const S = STAWKI_PODATKOWE;
  assert.equal(S.rok, 2026, 'rok stawek');
  // art. 12 ust. 1 pkt 4 ustawy o ryczałcie
  assert.equal(S.ryczaltNajem.prog, 100000);
  assert.equal(S.ryczaltNajem.stawkaDoProgu, 0.085);
  assert.equal(S.ryczaltNajem.stawkaPowyzejProgu, 0.125);
  // art. 12 ust. 13 — małżonkowie z oświadczeniem z ust. 6
  assert.equal(S.ryczaltNajem.progMalzonkowieZOswiadczeniem, 200000);
  // art. 81 ust. 2e ustawy zdrowotnej — 60% / 100% / 180% przeciętnego wynagrodzenia
  // przy przeciętnym wynagrodzeniu za IV kw. 2025 = 9 228,64 zł
  assert.deepEqual(S.zdrowotnaRyczalt.progi.map((p) => p.miesiecznie), [498.35, 830.58, 1495.04]);
  assert.deepEqual(S.zdrowotnaRyczalt.progi.map((p) => p.doPrzychodu), [60000, 300000, Infinity]);
  // art. 27 ust. 1 PIT
  assert.equal(S.skala.kwotaWolna, 30000);
  assert.equal(S.skala.prog, 120000);
  assert.equal(S.skala.stawkaDoProgu, 0.12);
  assert.equal(S.skala.stawkaPowyzejProgu, 0.32);
  assert.equal(S.vatNoclegi, 0.08);
  // art. 113 ust. 1 ustawy o VAT w brzmieniu od 1.01.2026 — limit podniesiony
  // z 200 000 zł ustawą z 24.06.2025 (Dz.U. 2025 poz. 896)
  assert.equal(S.vatZwolnieniePodmiotowe.limit, 240000);
  assert.equal(S.vatZwolnieniePodmiotowe.progOstrzezenia, 0.8);
  assert.ok(S.zweryfikowano, 'brak daty weryfikacji stawek');
});

test('najem prywatny: bez składki zdrowotnej i bez odliczenia', () => {
  // art. 66 ust. 1 ustawy zdrowotnej nie wymienia najmu prywatnego jako tytułu
  // do ubezpieczenia; art. 11 ust. 1a odsyła do art. 6 ust. 1, czyli do działalności.
  const p = podsumowaniePodatkowe(rokPrzychodu(80000),
    { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'private' }, 2026, KONIEC_ROKU);

  assert.equal(p.zdrowotnaMies, 0);
  assert.equal(p.zdrowotnaRok, 0);
  assert.equal(p.zdrowotnaLiczona, false);
  grosz(p.podstawa, 80000, 'podstawa = przychód, bez odliczenia');
  grosz(p.podatek, 80000 * 0.085, 'podatek');            // 6 800,00
  grosz(p.lacznieDoZaplaty, 6800, 'łącznie');
});

test('działalność przed progiem: zdrowotna z progu i odliczenie 50%', () => {
  const p = podsumowaniePodatkowe(rokPrzychodu(80000),
    { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'business' }, 2026, KONIEC_ROKU);

  // przychód 80 000 → widełki 60 000–300 000 → 830,58 zł/mies × 12
  grosz(p.zdrowotnaMies, 830.58, 'zdrowotna miesięcznie');
  grosz(p.zdrowotnaRok, 9966.96, 'zdrowotna rocznie');
  grosz(p.podstawa, 80000 - 4983.48, 'podstawa po odliczeniu 50%');   // 75 016,52
  grosz(p.podatek, 75016.52 * 0.085, 'podatek');                      // 6 376,40
  grosz(p.lacznieDoZaplaty, 6376.4045 + 9966.96, 'łącznie');
});

test('działalność po progu: odliczenie rozdzielone proporcjonalnie (art. 11 ust. 3)', () => {
  const p = podsumowaniePodatkowe(rokPrzychodu(150000),
    { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'business' }, 2026, KONIEC_ROKU);

  // Rachunek ręczny: zdrowotna 830,58 × 12 = 9 966,96; odliczenie 4 983,48.
  // Podstawa 145 016,52. Współczynnik 145 016,52 / 150 000 = 0,9667768.
  // Pasmo 8,5%: 100 000 × 0,9667768 = 96 677,68 → 8 217,60
  // Pasmo 12,5%: 50 000 × 0,9667768 = 48 338,84 → 6 042,35
  grosz(p.podstawa, 145016.52, 'podstawa');
  grosz(p.pasma.doProgu.podstawa, 96677.68, 'pasmo do progu');
  grosz(p.pasma.nadwyzka.podstawa, 48338.84, 'pasmo nadwyżki');
  grosz(p.podatek, 8217.60 + 6042.35, 'podatek');

  // Pasma MUSZĄ sumować się do podatku — inaczej karta „Podatek po dwóch stawkach"
  // pokazuje liczby, które nie zgadzają się z rachunkiem obok.
  grosz(p.pasma.doProgu.podatek + p.pasma.nadwyzka.podatek, p.podatek, 'suma pasm');
  // …a podstawy pasm do całej podstawy.
  grosz(p.pasma.doProgu.podstawa + p.pasma.nadwyzka.podstawa, p.podstawa, 'suma podstaw pasm');
});

test('skala z etatem: kwota wolna 0 nie wraca do 30 000', () => {
  // Zero jest w JavaScripcie fałszywe — `Number(x) || domyślna` cofałoby świadomy wybór
  // gospodarza, który ma kwotę wolną rozliczaną przez pracodawcę.
  const ustawienia = { taxForm: 'general', taxFreeAmount: 0, zusSocial: 0, includeZusInCosts: true };
  const p = podsumowaniePodatkowe(rokPrzychodu(90000), ustawienia, 2026, KONIEC_ROKU);

  grosz(p.podstawa, 90000, 'podstawa bez kosztów');
  grosz(p.podatek, 90000 * 0.12, 'podatek 12% bez kwoty wolnej');     // 10 800,00

  // Kontrola w drugą stronę: z kwotą wolną 30 000 podatek jest o 3 600 zł niższy.
  const zWolna = podsumowaniePodatkowe(rokPrzychodu(90000),
    { ...ustawienia, taxFreeAmount: 30000 }, 2026, KONIEC_ROKU);
  grosz(p.podatek - zWolna.podatek, 3600, 'różnica = kwota zmniejszająca podatek');
});

test('skala powyżej progu: 12% do 120 000, 32% od nadwyżki', () => {
  const p = podsumowaniePodatkowe(rokPrzychodu(200000),
    { taxForm: 'general', taxFreeAmount: 30000, zusSocial: 0 }, 2026, KONIEC_ROKU);
  // (120 000 − 30 000) × 12% + (200 000 − 120 000) × 32% = 10 800 + 25 600
  grosz(p.podatek, 36400, 'podatek według skali');
});

test('współwłasność małżeńska — trzy układy z art. 12 ust. 5, 6 i 13', () => {
  const baza = { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'private' };
  const dla = (spouseRental) => podsumowaniePodatkowe(rokPrzychodu(150000),
    { ...baza, spouseRental }, 2026, KONIEC_ROKU);

  const sam = dla('brak');
  grosz(sam.przychod, 150000, 'sam: cały przychód');
  assert.equal(sam.prog, 100000);
  grosz(sam.podatek, 100000 * 0.085 + 50000 * 0.125, 'sam');          // 14 750,00

  const polowa = dla('polowa');
  grosz(polowa.przychod, 75000, 'bez oświadczenia: połowa przychodu');
  assert.equal(polowa.prog, 100000, 'próg zostaje — drugie 100 000 ma małżonek');
  grosz(polowa.podatek, 75000 * 0.085, 'połowa');                     // 6 375,00

  const calosc = dla('calosc');
  grosz(calosc.przychod, 150000, 'z oświadczeniem: całość za oboje');
  assert.equal(calosc.prog, 200000, 'art. 12 ust. 13');
  grosz(calosc.podatek, 150000 * 0.085, 'całość, w całości poniżej progu');  // 12 750,00
});

test('współwłasność nie działa poza ryczałtem i najmem prywatnym', () => {
  const wDzialalnosci = podsumowaniePodatkowe(rokPrzychodu(150000),
    { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'business', spouseRental: 'calosc' },
    2026, KONIEC_ROKU);
  assert.equal(wDzialalnosci.prog, 100000, 'ust. 6 mówi o przychodach z art. 6 ust. 1a');
  grosz(wDzialalnosci.przychod, 150000, 'bez podziału');

  const naSkali = podsumowaniePodatkowe(rokPrzychodu(150000),
    { taxForm: 'general', taxFreeAmount: 0, spouseRental: 'polowa' }, 2026, KONIEC_ROKU);
  grosz(naSkali.przychod, 150000, 'skala nie dzieli');
});

test('nieznana forma nie dostaje liczby', () => {
  // Formy `linear` i `unregistered` usunięte (ADR-020) — obie były liczone stawką
  // ryczałtu bez podstawy prawnej. Liczba policzona „jakąś" stawką wygląda tak samo
  // wiarygodnie jak prawdziwa.
  for (const forma of ['linear', 'unregistered', 'cokolwiek']) {
    const p = podsumowaniePodatkowe(rokPrzychodu(80000),
      { taxForm: forma, autoThreshold: true }, 2026, KONIEC_ROKU);
    assert.equal(p.podatek, null, `${forma}: podatek`);
    assert.equal(p.lacznieDoZaplaty, null, `${forma}: łącznie`);
    assert.equal(p.formaZnana, false, `${forma}: flaga`);
  }
});

test('VAT 8% wydzielany tylko czynnemu podatnikowi', () => {
  const bez = podsumowaniePodatkowe(rokPrzychodu(108000),
    { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'private' }, 2026, KONIEC_ROKU);
  assert.equal(bez.vatNalezny, 0);
  grosz(bez.przychod, 108000, 'bez VAT przychód = brutto');

  const zVat = podsumowaniePodatkowe(rokPrzychodu(108000),
    { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'private', isVatPayer: true },
    2026, KONIEC_ROKU);
  grosz(zVat.przychod, 108000 / 1.08, 'przychód netto');   // 100 000,00
  grosz(zVat.vatNalezny, 8000, 'VAT należny');
});

test('próg zwolnienia z VAT: trzy stany karty, licznik z brutto (art. 113 ust. 1)', () => {
  const ustawienia = { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'private' };

  // Rachunek ręczny: 120 000 z limitu 240 000 → zostaje 120 000, czyli 50% — spokojnie.
  const spokojny = podsumowaniePodatkowe(rokPrzychodu(120000), ustawienia, 2026, KONIEC_ROKU);
  assert.equal(spokojny.vatLimit, 240000);
  grosz(spokojny.vatDoLimitu, 120000, 'zostało do limitu');
  grosz(spokojny.vatProcentLimitu, 50, 'procent limitu');
  assert.equal(spokojny.vatLimitPrzekroczony, false);
  assert.equal(spokojny.vatStan, 'spokojny');

  // Dokładnie 80%: 240 000 × 0,8 = 192 000 — granica należy już do ostrzeżenia,
  // spójnie z ostrzeganiem „od 80%" przy progu ryczałtu.
  const naGranicy = podsumowaniePodatkowe(rokPrzychodu(192000), ustawienia, 2026, KONIEC_ROKU);
  grosz(naGranicy.vatProcentLimitu, 80, 'dokładnie 80%');
  grosz(naGranicy.vatDoLimitu, 48000, 'zostało 48 000');
  assert.equal(naGranicy.vatLimitPrzekroczony, false);
  assert.equal(naGranicy.vatStan, 'ostrzezenie');

  // Przekroczenie: 252 000 → nadwyżka 12 000 (karta liczy ją jako brutto − limit),
  // „zostało" wynosi 0, a procent jest ścięty do 100 jak przy progu ryczałtu.
  const ponad = podsumowaniePodatkowe(rokPrzychodu(252000), ustawienia, 2026, KONIEC_ROKU);
  assert.equal(ponad.vatLimitPrzekroczony, true);
  assert.equal(ponad.vatStan, 'przekroczony');
  grosz(ponad.vatDoLimitu, 0, 'nic nie zostało');
  grosz(ponad.vatProcentLimitu, 100, 'procent ścięty do 100');
  grosz(ponad.brutto - ponad.vatLimit, 12000, 'nadwyżka ponad limit');
});

test('próg zwolnienia z VAT: czynny podatnik dostaje flagę, na której widok chowa kartę', () => {
  // Czynnemu podatnikowi zwolnienie podmiotowe jest obojętne — karta się nie renderuje.
  // Pola liczymy mimo to (z brutto, nie z przychodu po VAT), żeby jedno źródło prawdy
  // nie miało dwóch gałęzi.
  const zVat = podsumowaniePodatkowe(rokPrzychodu(216000),
    { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'private', isVatPayer: true },
    2026, KONIEC_ROKU);
  assert.equal(zVat.vatPlatnik, true, 'flaga do ukrycia karty');
  // Licznik z brutto 216 000 (90%), NIE z przychodu netto 200 000 (216 000 / 1,08).
  grosz(zVat.przychod, 200000, 'przychód po VAT');
  grosz(zVat.vatProcentLimitu, 90, 'licznik biegnie od brutto');

  const bezVat = podsumowaniePodatkowe(rokPrzychodu(216000),
    { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'private' }, 2026, KONIEC_ROKU);
  assert.equal(bezVat.vatPlatnik, false, 'domyślnie karta widoczna');
});

test('próg zwolnienia z VAT: przy współwłasności „polowa" licznik liczy pełne brutto', () => {
  // Oświadczenie ryczałtowe i podział przychodu to mechanika PIT — na VAT się nie
  // przenosi (P6 analizy legal). Rachunek ręczny: brutto 200 000, przychód do PIT
  // 100 000 (połowa), ale licznik VAT: 200 000 / 240 000 = 83,33%, zostało 40 000.
  const p = podsumowaniePodatkowe(rokPrzychodu(200000),
    { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'private', spouseRental: 'polowa' },
    2026, KONIEC_ROKU);
  grosz(p.przychod, 100000, 'PIT: połowa przychodu');
  grosz(p.vatDoLimitu, 40000, 'VAT: zostało z pełnego brutto, nie 140 000 z połowy');
  grosz(p.vatProcentLimitu, 83.3333, 'VAT: procent z pełnego brutto');
  assert.equal(p.vatStan, 'ostrzezenie', '83% ≥ 80% — ostrzeżenie mimo połowy w PIT');
  assert.equal(p.vatLimitPrzekroczony, false);
});

test('rok bez rezerwacji nie produkuje zer udających wyliczenie', () => {
  const p = podsumowaniePodatkowe([], { taxForm: 'lump_sum', rentalBasis: 'private' }, 2026, KONIEC_ROKU);
  assert.equal(p.liczbaRezerwacji, 0);
  assert.equal(p.rozjazd, null, 'bez rezerwacji nie ma o czym mówić');
});

test('rozjazd milczy, dopóki żadna rezerwacja nie ma zapisanego podatku', () => {
  const bezPodatku = rokPrzychodu(80000);
  const p = podsumowaniePodatkowe(bezPodatku,
    { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'private' }, 2026, KONIEC_ROKU);
  assert.equal(p.rozjazd, null, 'puste pole podatku to nie rozjazd');

  const zPodatkiem = bezPodatku.map((r, i) => (i === 0 ? { ...r, tax: 9999 } : r));
  const q = podsumowaniePodatkowe(zPodatkiem,
    { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'private' }, 2026, KONIEC_ROKU);
  assert.ok(q.rozjazd, 'przy zapisanym podatku rozjazd ma się odezwać');
  assert.equal(q.rozjazd.rezerwacji, 1);
});

test('rok jako napis — panel podaje go tak i musi trafiać', () => {
  // `setSelectedYear(String(...))` w całym panelu. Porównanie przez `===` bez konwersji
  // nie trafiałoby nigdy, a stan pusty wygląda tak samo jak brak rezerwacji.
  const p = podsumowaniePodatkowe(rokPrzychodu(80000),
    { taxForm: 'lump_sum', rentalBasis: 'private' }, '2026', KONIEC_ROKU);
  assert.equal(p.liczbaRezerwacji, 12, 'napis „2026" musi filtrować tak samo jak liczba');
});

test('stawki przeterminowane wykrywane niezależnie od oglądanego roku', () => {
  const wLutym2027 = podsumowaniePodatkowe(rokPrzychodu(80000),
    { taxForm: 'lump_sum', rentalBasis: 'private' }, 2026, new Date('2027-02-10'));
  assert.equal(wLutym2027.stawkiAktualne, true, 'rok wybrany zgadza się z rokiem stawek');
  assert.equal(wLutym2027.stawkiPrzeterminowane, true, 'ale stawki są już z zeszłego roku');
});

test('progi i widełki składki zdrowotnej', () => {
  assert.equal(zdrowotnaRyczalt(59999), 498.35);
  assert.equal(zdrowotnaRyczalt(60000), 498.35, 'granica należy do niższego progu');
  assert.equal(zdrowotnaRyczalt(60001), 830.58);
  assert.equal(zdrowotnaRyczalt(300000), 830.58);
  assert.equal(zdrowotnaRyczalt(300001), 1495.04);

  assert.deepEqual(widelkiZdrowotnej(50000), { od: 0, do: 60000 });
  assert.deepEqual(widelkiZdrowotnej(84600), { od: 60000, do: 300000 });
  assert.deepEqual(widelkiZdrowotnej(400000), { od: 300000, do: null });
});

test('domyślny tryb wynika z formy opodatkowania', () => {
  assert.equal(domyslnyTryb({ taxForm: 'general' }), 'szczegolowy');
  assert.equal(domyslnyTryb({ taxForm: 'lump_sum' }), 'prosty');
  assert.equal(domyslnyTryb(null), 'prosty', 'brak ustawień nie może wysypać panelu');
});
