// =============================================================================
// EKSPORT ZESTAWIENIA PODATKOWEGO DO CSV — WynajemPRO (X25)
//
// PO CO. Gospodarz rozlicza się z księgową, a księgowa pracuje w arkuszu. Zrzut ekranu
// panelu jest do niczego: nie da się go zsumować ani wkleić do ewidencji. Ten moduł
// zamienia to samo podsumowanie, które widać na ekranie, w plik do otwarcia w Excelu.
//
// ⚖️ ZASADA: eksport pokazuje TO SAMO, co panel. Nie liczy niczego po swojemu — bierze
// gotowe `podsumowaniePodatkowe()`. Rozjazd między ekranem a plikiem byłby gorszy niż
// brak pliku, bo księgowa zobaczyłaby liczby, których gospodarz nie umie wytłumaczyć.
//
// ⚖️ ZASTRZEŻENIE PRAWNE JEDZIE W PLIKU. Plik opuszcza aplikację i trafia do osoby
// trzeciej — od tego momentu nie ma wokół niego żadnego interfejsu, który mógłby
// wyjaśnić, czym te liczby są. Nagłówek musi to nieść sam.
//
// Czysta logika, bez Reacta i bez DOM — żeby dało się to przetestować bez przeglądarki.
// =============================================================================

import { STAWKI_PODATKOWE } from './constants.js';

/**
 * Konwencje polskiego Excela, wszystkie trzy konieczne naraz:
 *   • separator ŚREDNIK — polski Excel dzieli po przecinku tylko przy ustawieniach
 *     regionalnych z kropką dziesiętną; przy polskich przecinek jest znakiem dziesiętnym;
 *   • przecinek dziesiętny w liczbach — inaczej Excel czyta „1234.50" jako tekst;
 *   • BOM na początku pliku — bez niego polskie znaki rozsypują się w Excelu,
 *     mimo poprawnego UTF-8. Numbers i LibreOffice radzą sobie bez, Excel nie.
 */
const SEP = ';';
export const BOM = '﻿';

/** Liczba w formacie, który polski Excel rozpozna jako liczbę, nie jako tekst. */
function kwota(n) {
  const v = Math.round((Number(n) || 0) * 100) / 100;
  return v.toFixed(2).replace('.', ',');
}

/**
 * Pole CSV. Cudzysłowy tylko tam, gdzie są potrzebne — plik ma być czytelny
 * także w edytorze tekstu, nie tylko w arkuszu.
 *
 * ⚠️ Pole zaczynające się od `=`, `+`, `-` lub `@` poprzedzamy apostrofem. Arkusze
 * traktują takie wartości jako FORMUŁĘ, a nazwa obiektu albo nazwisko gościa może się
 * tak zacząć (choćby „-Apartament"). To jest znane nadużycie (CSV injection): plik
 * otwierany u księgowej wykonałby wtedy coś, czego nikt nie wpisywał.
 */
function pole(v) {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const wiersz = (...pola) => pola.map(pole).join(SEP);

const OPIS_FORMY = {
  lump_sum: 'Ryczałt od przychodów ewidencjonowanych',
  general: 'Zasady ogólne (skala podatkowa)',
  linear: 'Podatek liniowy 19%',
};
const OPIS_PODSTAWY = {
  private: 'najem prywatny (poza działalnością gospodarczą)',
  business: 'działalność gospodarcza',
};
const OPIS_WSPOLWLASNOSCI = {
  polowa: 'współwłasność małżeńska — rozliczana jest połowa przychodu',
  calosc: 'współwłasność małżeńska — całość rozlicza jeden z małżonków (oświadczenie)',
};

/**
 * Buduje zawartość pliku CSV.
 *
 * @param {Object}   podsumowanie  wynik `podsumowaniePodatkowe()` — bez przeliczania
 * @param {Array}    rentals       wszystkie wpisy (rezerwacje i koszty)
 * @param {Array}    miesiace      wynik `podsumowanieMiesieczne()`
 * @param {Array}    nazwyMiesiecy `monthNames` ze stałych
 * @param {number}   rok
 * @param {Date}     dzisiaj       data wygenerowania, wstrzykiwana dla testów
 * @returns {string} treść pliku, bez BOM-u (dokleja go `pobierzZestawienieCSV`)
 */
export function zestawieniePodatkoweCSV(podsumowanie, rentals, miesiace, nazwyMiesiecy, rok, dzisiaj = new Date()) {
  const p = podsumowanie;
  const L = [];
  const data = (d) => new Date(d).toISOString().split('T')[0];

  const wRoku = (r) => r.date && new Date(r.date).getFullYear() === Number(rok);
  const rezerwacje = (rentals || [])
    .filter((r) => r.type === 'booking' && wRoku(r) && r.syncStatus !== 'vanished')
    .sort((a, b) => a.date.localeCompare(b.date));
  const koszty = (rentals || [])
    .filter((r) => r.type === 'utility' && wRoku(r))
    .sort((a, b) => a.date.localeCompare(b.date));

  // ── NAGŁÓWEK ──────────────────────────────────────────────────────────────
  L.push(wiersz(`WynajemPRO — zestawienie podatkowe za ${rok}`));
  L.push(wiersz('Wygenerowano', data(dzisiaj)));
  L.push(wiersz('Forma opodatkowania', OPIS_FORMY[p.forma] || p.forma));
  if (p.forma === 'lump_sum') {
    L.push(wiersz('Podstawa wynajmu', OPIS_PODSTAWY[p.podstawaWynajmu] || 'nieuzupełniona w ustawieniach'));
    if (OPIS_WSPOLWLASNOSCI[p.wariantMalzenski]) {
      L.push(wiersz('Współwłasność', OPIS_WSPOLWLASNOSCI[p.wariantMalzenski]));
    }
    L.push(wiersz('Próg ryczałtu', kwota(p.prog)));
  }
  L.push(wiersz('Stawki z roku', `${p.rokStawek} (zweryfikowane ${STAWKI_PODATKOWE.zweryfikowano})`));
  L.push(wiersz('Miesięcy w wyliczeniu', `${p.miesiecy} z 12`));
  L.push('');

  // Zastrzeżenie jedzie z plikiem, bo plik trafia do księgowej bez naszego interfejsu.
  L.push(wiersz('UWAGA'));
  L.push(wiersz('Szacunek policzony z danych i ustawień wprowadzonych przez gospodarza.'));
  L.push(wiersz('Nie jest deklaracją, wyliczeniem podatku ani poradą podatkową.'));
  L.push(wiersz('Nie uwzględnia przychodów i kosztów spoza aplikacji ani zapłaconych już zaliczek i składek.'));
  L.push(wiersz('VAT od prowizji portali (import usług) jest poza zakresem aplikacji.'));
  // Licznik limitu z art. 113 — tylko u gospodarza bez statusu czynnego podatnika
  // (czynnemu zwolnienie podmiotowe jest obojętne). Kwota z pełnego `brutto`,
  // bez podziału małżeńskiego — jak w karcie panelu (ADR-026).
  if (!p.vatPlatnik) {
    L.push(wiersz(`Limit zwolnienia podmiotowego z VAT (art. 113): rezerwacje w aplikacji wykorzystały ${kwota(p.brutto)} zł z ${kwota(p.vatLimit)} zł — pozostała sprzedaż gospodarza także zużywa ten limit.`));
  }
  // Skala: mówimy, czego nie liczymy (wzorzec ADR-023) — zdrowotna 9% liczy się
  // od dochodu z całej działalności, którego aplikacja nie zna, a podstawa
  // obejmuje wyłącznie koszty zarejestrowane w aplikacji.
  if (p.forma === 'general') {
    L.push(wiersz('Składki zdrowotnej przy skali (9% dochodu z całej działalności) nie wyliczamy — aplikacja zna tylko wynajem.'));
    L.push(wiersz('Podstawa obejmuje wyłącznie koszty zarejestrowane w aplikacji (prowizje, media, opcjonalnie składki społeczne) — bez kosztów spoza niej.'));
  }
  // Liniowy: dopisek granic z L8 analizy legal (ADR-027) — bez końcowego zdania
  // o szacunku, bo blok UWAGA mówi to dwa wiersze wyżej.
  if (p.forma === 'linear') {
    L.push(wiersz('Szacunek dla podatku liniowego liczy 19% od dochodu z danych w tej aplikacji: przychody z rezerwacji minus prowizje, zarejestrowane koszty i wpisane składki.'));
    L.push(wiersz('Nie uwzględniamy kosztów spoza aplikacji (np. amortyzacja, wyposażenie, odsetki), strat z lat ubiegłych, wpłat na IKZE ani daniny solidarnościowej.'));
    L.push(wiersz(`Składki zdrowotnej nie wyliczamy — zależy od dochodu z całej działalności; wpisaną kwotę odliczamy od dochodu do rocznego limitu ${kwota(STAWKI_PODATKOWE.liniowy.limitOdliczeniaZdrowotnej)} zł.`));
  }
  L.push('');

  // ── REZERWACJE ────────────────────────────────────────────────────────────
  L.push(wiersz(`REZERWACJE (${rezerwacje.length})`));
  const kolumnyVat = p.vatNalezny > 0;
  L.push(wiersz('Data', 'Obiekt', 'Gość', 'Źródło', 'Przychód brutto',
    ...(kolumnyVat ? ['VAT należny', 'Przychód netto'] : []), 'Prowizja portalu'));

  for (const r of rezerwacje) {
    const brutto = Number(r.income) || 0;
    const vat = kolumnyVat ? brutto - brutto / (1 + STAWKI_PODATKOWE.vatNoclegi) : 0;
    const prowizja = r.commissionAmount !== undefined ? Number(r.commissionAmount) || 0
      : (r.commission && typeof r.commission === 'object') ? Number(r.commission.amount) || 0
        : Number(r.commission) || 0;
    L.push(wiersz(data(r.date), r.property || '', r.guest || '', r.source || '', kwota(brutto),
      ...(kolumnyVat ? [kwota(vat), kwota(brutto - vat)] : []), kwota(prowizja)));
  }
  L.push(wiersz('Razem', '', '', '', kwota(p.brutto),
    ...(kolumnyVat ? [kwota(p.vatNalezny), kwota(p.przychodCalosc)] : []), kwota(p.prowizje)));
  L.push('');

  // ── KOSZTY ────────────────────────────────────────────────────────────────
  if (koszty.length > 0) {
    L.push(wiersz(`KOSZTY EKSPLOATACYJNE (${koszty.length})`));
    L.push(wiersz('Data', 'Obiekt', 'Kategoria', 'Opis', 'Kwota'));
    for (const r of koszty) {
      L.push(wiersz(data(r.date), r.property || '', r.category || '', r.text || '', kwota(r.utilities)));
    }
    L.push(wiersz('Razem', '', '', '', kwota(p.media)));
    L.push('');
  }

  // ── ROZKŁAD MIESIĘCZNY ────────────────────────────────────────────────────
  L.push(wiersz(`ROZKŁAD MIESIĘCZNY ${rok}`));
  L.push(wiersz('Miesiąc', 'Rezerwacje', 'Brutto', 'Przychód', 'Prowizje', 'Media'));
  for (const m of (miesiace || [])) {
    // Miesiące bez ruchu pomijamy — pusty wiersz nic nie mówi, a wydłuża arkusz.
    if (!m.brutto && !m.media && !m.rezerwacje) continue;
    L.push(wiersz(nazwyMiesiecy[m.miesiac], m.rezerwacje, kwota(m.brutto),
      kwota(m.przychod), kwota(m.prowizje), kwota(m.media)));
  }
  L.push('');

  // ── PODSUMOWANIE ──────────────────────────────────────────────────────────
  L.push(wiersz('PODSUMOWANIE ROKU'));
  L.push(wiersz('Pozycja', 'Kwota'));
  L.push(wiersz('Przychód brutto', kwota(p.brutto)));
  if (p.vatNalezny > 0) {
    L.push(wiersz('VAT należny 8% (usługi zakwaterowania)', kwota(p.vatNalezny)));
    L.push(wiersz('Przychód po VAT', kwota(p.przychodCalosc)));
  }
  if (p.wariantMalzenski === 'polowa') {
    L.push(wiersz('Część małżonka (rozliczana u niego)', kwota(p.przychodCalosc - p.przychod)));
    L.push(wiersz('Przychód do opodatkowania', kwota(p.przychod)));
  }
  if (p.zdrowotnaLiczona) {
    L.push(wiersz('Odliczenie 50% składki zdrowotnej (art. 11 ust. 1a)', kwota(p.przychod - p.podstawa)));
  }
  // Liniowy: odliczenie wpisanej zdrowotnej od dochodu, z ucięciem na rocznym limicie
  // (art. 30c ust. 2 pkt 2) — bez tego wiersza księgowa nie zobaczy, skąd podstawa.
  if (p.forma === 'linear' && p.zdrowotnaOdliczana > 0) {
    L.push(wiersz(`Odliczenie zapłaconej składki zdrowotnej (art. 30c ust. 2, do limitu ${kwota(STAWKI_PODATKOWE.liniowy.limitOdliczeniaZdrowotnej)} zł)`, kwota(p.zdrowotnaOdliczana)));
  }
  L.push(wiersz('Podstawa opodatkowania', kwota(p.podstawa)));
  L.push(wiersz('Podatek dochodowy', p.formaZnana ? kwota(p.podatek) : 'nie policzono'));

  // Nigdy „0,00" w wierszu składki — zero czytałoby się jak twierdzenie o braku obowiązku.
  if (p.zdrowotnaLiczona) {
    L.push(wiersz(`Składka zdrowotna (${kwota(p.zdrowotnaMies)} x ${p.miesiecy} mies.)`, kwota(p.zdrowotnaRok)));
  } else if (p.forma === 'lump_sum') {
    L.push(wiersz('Składka zdrowotna', p.podstawaWynajmu === 'private'
      ? 'nie doliczamy — najem prywatny' : 'nie doliczamy — brak odpowiedzi w ustawieniach'));
  } else if (p.zdrowotnaRok > 0) {
    // Skala i liniowy: kwota z ręcznego pola — bez tego wiersza suma „RAZEM" zawierałaby
    // składnik, którego nie widać w żadnej pozycji pliku.
    L.push(wiersz(`Składka zdrowotna z ustawień (${kwota(p.zdrowotnaMies)} x ${p.miesiecy} mies.)`, kwota(p.zdrowotnaRok)));
  }
  L.push(wiersz('Składki społeczne', p.spoleczneRok > 0
    ? kwota(p.spoleczneRok) : 'nie podano w ustawieniach'));
  L.push(wiersz('RAZEM DO ODŁOŻENIA', p.formaZnana ? kwota(p.lacznieDoZaplaty) : 'nie policzono'));
  L.push('');
  L.push(wiersz('Kwoty przed zaokrągleniem do pełnych złotych (art. 63 § 1 Ordynacji podatkowej).'));

  // Poza rachunkiem ryczałtu — osobno i wyraźnie, żeby nikt ich nie odjął od podstawy.
  if (p.forma === 'lump_sum' && (p.prowizje > 0 || p.media > 0)) {
    L.push('');
    L.push(wiersz('POZA RACHUNKIEM RYCZAŁTU'));
    L.push(wiersz('Przy ryczałcie te kwoty NIE obniżają podatku — podatek liczy się od przychodu.'));
    L.push(wiersz('Prowizje portali', kwota(p.prowizje)));
    L.push(wiersz('Media i eksploatacja', kwota(p.media)));
  }

  return L.join('\r\n');
}

/** Nazwa pliku — rok w nazwie, żeby kolejne eksporty nie nadpisywały się w Pobranych. */
export function nazwaPliku(rok, dzisiaj = new Date()) {
  return `wynajempro-podatki-${rok}-${dzisiaj.toISOString().split('T')[0]}.csv`;
}
