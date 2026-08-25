// =============================================================================
// PODSUMOWANIE PODATKOWE — WynajemPRO (X25)
//
// PO CO. Silnik `taxCalculator.js` liczy podatek PER REZERWACJA i zapisuje go przy niej.
// Od commita `fb8a00e` nie było jednak żadnego widoku, który by to zsumował — liczby
// wychodziły wyłącznie jako pozycja kosztowa w Analityce. Testerka z drugiej tury feedbacku
// (2026-08-22) napisała wprost, że panel do rozliczeń jest niewystarczający, i miała rację
// w sposób dosłowny: panelu nie było. [[Decisions]] ADR-013 opisuje, jak zniknął.
//
// Ten moduł liczy PODSUMOWANIE ROCZNE i miesięczne z tych samych zasad co kalkulator
// per-rezerwacja, plus dwie rzeczy, których tam nie było:
//   • składka zdrowotna przy ryczałcie — PROGOWA wg przychodu, więc da się ją wyliczyć
//     zamiast pytać gospodarza (pole `zusHealth` istniało w ustawieniach i nie było
//     używane w żadnym wyliczeniu — martwy input, który sugerował, że coś robi);
//   • postęp do progu 100 000 zł pokazany jako liczba, nie jako obietnica z landingu.
//
// ⚖️ TO NIE JEST DEKLARACJA PODATKOWA ANI PORADA. To szacunek dla gospodarza i jego
// księgowego, liczony z danych, które sam wprowadził. Interfejs ma tak o tym mówić.
//
// Czysta logika — bez Reacta i bez Firebase, żeby dało się to przetestować bez atrapy.
// =============================================================================

import { STAWKI_PODATKOWE } from './constants';

/** Rezerwacje z danego roku, wyłącznie te, które liczą się do przychodu. */
function rezerwacjeRoku(rentals, rok) {
  return (rentals || []).filter((r) => {
    if (r.type !== 'booking') return false;
    if (!r.date) return false;
    if (r.syncStatus === 'vanished') return false;   // zniknęła z portalu — nie jest przychodem
    return new Date(r.date).getFullYear() === rok;
  });
}

/** Koszty (media, opłaty) z danego roku. */
function kosztyRoku(rentals, rok) {
  return (rentals || []).filter((r) =>
    r.type === 'utility' && r.date && new Date(r.date).getFullYear() === rok);
}

/** Prowizja rezerwacji — obsługuje starą liczbę i nowszy obiekt `{ amount }`. */
function prowizja(r) {
  if (r.commissionAmount !== undefined) return Number(r.commissionAmount) || 0;
  if (r.commission && typeof r.commission === 'object') return Number(r.commission.amount) || 0;
  return Number(r.commission) || 0;
}

/**
 * Miesięczna składka zdrowotna przy ryczałcie, wg progu PRZYCHODU ROCZNEGO.
 * @param {number} przychodRoczny — przychód narastająco (brutto pomniejszony o VAT należny)
 */
export function zdrowotnaRyczalt(przychodRoczny) {
  const prog = STAWKI_PODATKOWE.zdrowotnaRyczalt.progi
    .find((p) => przychodRoczny <= p.doPrzychodu);
  return prog ? prog.miesiecznie : 0;
}

/**
 * Widełki przychodu, w których mieści się gospodarz — do etykiety składki zdrowotnej.
 * Etykieta musi nazywać PRZEDZIAŁ od–do, a nie samą górną granicę: „próg do 300 000 zł"
 * przy przychodzie 84 600 zł czyta się jak pierwszy próg i ukrywa, że przekroczenie
 * 300 000 zł podnosi składkę o 80%.
 */
export function widelkiZdrowotnej(przychodRoczny) {
  const progi = STAWKI_PODATKOWE.zdrowotnaRyczalt.progi;
  const i = progi.findIndex((p) => przychodRoczny <= p.doPrzychodu);
  if (i < 0) return null;
  return {
    od: i === 0 ? 0 : progi[i - 1].doPrzychodu,
    do: Number.isFinite(progi[i].doPrzychodu) ? progi[i].doPrzychodu : null,
  };
}

/**
 * Współwłasność małżeńska przy najmie prywatnym — art. 12 ust. 5, 6 i 13 ustawy o ryczałcie.
 *
 * Zwraca dwie rzeczy naraz, bo są nierozłączne: jaką CZĘŚĆ przychodu rozlicza ten gospodarz
 * i JAKI PRÓG go obowiązuje. Ustawa daje trzy układy:
 *
 *   • sam(a) — cały przychód, próg 100 000 zł;
 *   • współwłasność bez oświadczenia — ust. 6 odsyła do ust. 5, więc przychód dzieli się
 *     proporcjonalnie do udziału (przy wspólności majątkowej po połowie), a każdy małżonek
 *     ma własny próg 100 000 zł;
 *   • oświadczenie z ust. 6 — całość rozlicza jedno z małżonków, a ust. 13 podnosi jego
 *     próg do 200 000 zł.
 *
 * Dotyczy WYŁĄCZNIE najmu prywatnego: ust. 6 mówi o przychodach z art. 6 ust. 1a. Przy
 * działalności gospodarczej każdy małżonek prowadzi własną firmę i ten mechanizm nie działa.
 */
function wspolwlasnosc(ustawienia) {
  const S = STAWKI_PODATKOWE.ryczaltNajem;
  const dotyczy = ustawienia.taxForm === 'lump_sum' && ustawienia.rentalBasis === 'private';
  if (!dotyczy) return { udzial: 1, prog: S.prog, wariant: 'brak' };

  if (ustawienia.spouseRental === 'polowa') return { udzial: 0.5, prog: S.prog, wariant: 'polowa' };
  if (ustawienia.spouseRental === 'calosc') {
    return { udzial: 1, prog: S.progMalzonkowieZOswiadczeniem, wariant: 'calosc' };
  }
  return { udzial: 1, prog: S.prog, wariant: 'brak' };
}

/**
 * Podatek dochodowy od podstawy, wg formy opodatkowania.
 * Te same reguły co `calculateTaxes()` per rezerwacja — liczone raz, od sumy roku,
 * zamiast sumować zaokrąglenia z pojedynczych rezerwacji.
 */
function podatekDochodowy(podstawa, przychodDoProgu, settings, prog = STAWKI_PODATKOWE.ryczaltNajem.prog) {
  const S = STAWKI_PODATKOWE;
  const forma = settings.taxForm;

  if (forma === 'lump_sum' && settings.autoThreshold) {
    const { stawkaDoProgu, stawkaPowyzejProgu } = S.ryczaltNajem;
    if (przychodDoProgu <= 0) return 0;

    // Przychód dzieli się na dwa pasma wg PROGU, a nie wg podstawy.
    const wPasmieNizszym = Math.min(przychodDoProgu, prog);
    const wPasmieWyzszym = Math.max(0, przychodDoProgu - prog);

    // ART. 11 UST. 3 USTAWY O RYCZAŁCIE — odliczenia rozdziela się MIĘDZY PASMA
    // proporcjonalnie: „odliczeń tych dokonuje w takim stosunku, w jakim w roku
    // podatkowym pozostają poszczególne przychody (…) w ogólnej kwocie przychodów".
    //
    // Wcześniej cała kwota odliczenia (50% zdrowotnej) zjeżdżała do pasma 8,5%,
    // bo podstawę pomniejszano przed podziałem. Kierunek błędu był konserwatywny —
    // podatek wychodził ZAWYŻONY — ale rachunek dla księgowej nie zgadzał się z ustawą.
    // Przeczytane z tekstu przepisu 2026-08-25, [[Rejestr-stawek-podatkowych]].
    //
    // `podstawa / przychód` to udział, jaki zostaje po odliczeniu. Mnożymy przez niego
    // oba pasma, więc każde traci tę samą część — dokładnie to, czego żąda przepis.
    const poOdliczeniu = podstawa / przychodDoProgu;

    return wPasmieNizszym * poOdliczeniu * stawkaDoProgu
         + wPasmieWyzszym * poOdliczeniu * stawkaPowyzejProgu;
  }

  if (forma === 'general') {
    const { kwotaWolna, prog, stawkaDoProgu, stawkaPowyzejProgu } = S.skala;
    // `??`, nie `||` — zero jest tu poprawną odpowiedzią („kwotę wolną rozlicza mi
    // pracodawca"), a `||` zamieniłoby ją z powrotem na 30 000 i zaniżyło podatek
    // dokładnie temu, kto świadomie wpisał 0.
    const podane = Number(settings.taxFreeAmount);
    const wolna = Number.isFinite(podane) ? podane : kwotaWolna;
    if (podstawa <= wolna) return 0;
    if (podstawa <= prog) return (podstawa - wolna) * stawkaDoProgu;
    return (prog - wolna) * stawkaDoProgu + (podstawa - prog) * stawkaPowyzejProgu;
  }

  // Ryczałt ze stałą stawką (gospodarz wyłączył automatyczny próg) — jedyny przypadek,
  // który tu dochodzi. Formy `linear` i `unregistered` liczyły się kiedyś tą samą gałęzią
  // i były przez to liczone stawką 8,5% bez podstawy prawnej: liniowy to 19% od DOCHODU
  // (art. 30c ust. 1 PIT), a działalność nierejestrowana rozlicza się według SKALI jako
  // przychód z innych źródeł (art. 20 ust. 1ba PIT). Usunięte 2026-08-25, [[Decisions]] ADR-020.
  if (forma === 'lump_sum') return podstawa * ((Number(settings.rate) || 8.5) / 100);

  // Nieznana forma opodatkowania. Nie zgadujemy stawki — liczba policzona „jakąś" stawką
  // wygląda tak samo wiarygodnie jak prawdziwa, a nią nie jest.
  return null;
}

/**
 * Pełne podsumowanie podatkowe roku.
 *
 * ⚠️ Liczy Z BIEŻĄCYCH USTAWIEŃ, a nie z wartości zapisanych przy rezerwacjach.
 * Świadomie: gospodarz mógł zmienić formę opodatkowania w trakcie roku, a wtedy stare
 * zapisane kwoty są nieaktualne. Rozjazd między jednym a drugim raportujemy w `rozjazd`,
 * żeby nie udawać, że go nie ma.
 */
export function podsumowaniePodatkowe(rentals, settings, rokWejscie = new Date().getFullYear(), dzisiaj = new Date()) {
  const S = STAWKI_PODATKOWE;
  const ustawienia = settings || {};
  // Rok przychodzi z panelu jako NAPIS (`setSelectedYear(String(...))`). Porównania niżej
  // idą przez `===`, więc bez konwersji filtr nie trafiłby nigdy — a stan pusty wygląda
  // dokładnie tak samo jak „rzeczywiście nie ma rezerwacji". Konwertujemy u wejścia,
  // żeby żaden nowy wywołujący nie musiał o tym pamiętać.
  const rok = Number(rokWejscie) || new Date().getFullYear();
  const bookings = rezerwacjeRoku(rentals, rok);
  const media = kosztyRoku(rentals, rok);

  const brutto = bookings.reduce((s, r) => s + (Number(r.income) || 0), 0);
  const vatNalezny = ustawienia.isVatPayer ? brutto - (brutto / (1 + S.vatNoclegi)) : 0;
  const przychodCalosc = brutto - vatNalezny;

  // Przy współwłasności małżeńskiej bez oświadczenia rozliczasz POŁOWĘ tego, co wpłynęło
  // — reszta jest przychodem małżonka. `przychod` to od tej pory kwota, od której liczy
  // się TWÓJ podatek; `brutto` zostaje pełne, bo tyle faktycznie zapłacili goście.
  const { udzial, prog: progRyczaltu, wariant: wariantMalzenski } = wspolwlasnosc(ustawienia);
  const przychod = przychodCalosc * udzial;

  const sumaProwizji = bookings.reduce((s, r) => s + prowizja(r), 0);
  const sumaMediow = media.reduce((s, r) => s + (Number(r.utilities) || 0), 0);

  // PODSTAWA WYNAJMU. Ryczałt to dwie różne sytuacje podatkowe pod jedną nazwą:
  // najem prywatny (art. 6 ust. 1a) i usługi zakwaterowania w działalności (art. 6 ust. 1).
  // Stawka i próg są dla obu identyczne, ale składki nie — najem prywatny nie jest
  // tytułem do ubezpieczenia zdrowotnego, a odliczenie 50% z art. 11 ust. 1a odsyła
  // wprost do ust. 1, czyli do działalności.
  //
  // `null` znaczy „gospodarz jeszcze nie odpowiedział" i jest traktowane jak najem
  // prywatny: nie doliczamy składki, której może nie płacić. Kwota wyjdzie zaniżona
  // zamiast zawyżonej, a panel mówi wprost, czego nie policzył — to jest uczciwsze
  // niż dopisanie 10 tys. zł komuś, kto nie ma takiego obowiązku.
  const ryczalt = ustawienia.taxForm === 'lump_sum';
  const wDzialalnosci = ustawienia.rentalBasis === 'business';
  const zdrowotnaZProgu = ryczalt && wDzialalnosci;

  const zdrowotnaMies = ryczalt
    ? (zdrowotnaZProgu ? zdrowotnaRyczalt(przychod) : 0)
    : (Number(ustawienia.zusHealth) || 0);
  const miesiecyWRoku = rok < dzisiaj.getFullYear() ? 12
    : rok > dzisiaj.getFullYear() ? 0 : dzisiaj.getMonth() + 1;
  const zdrowotnaRok = zdrowotnaMies * miesiecyWRoku;
  const spoleczneRok = (Number(ustawienia.zusSocial) || 0) * miesiecyWRoku;

  // Podstawa opodatkowania
  let podstawa;
  if (ryczalt) {
    // Ryczałt liczy się od PRZYCHODU — kosztów się nie odlicza. Jedyne odliczenie
    // to 50% zapłaconej składki zdrowotnej (od 2026), i tylko w działalności:
    // przy najmie prywatnym nie ma czego odliczać, bo nie ma składki.
    podstawa = zdrowotnaZProgu
      ? Math.max(0, przychod - zdrowotnaRok * S.zdrowotnaRyczalt.odliczenieOdPrzychodu)
      : przychod;
  } else if (ustawienia.taxForm === 'general') {
    podstawa = Math.max(0, przychod - sumaProwizji - sumaMediow
      - (ustawienia.includeZusInCosts ? spoleczneRok : 0));
  } else {
    podstawa = przychod;
  }

  // `null`, gdy forma opodatkowania jest nieznana. Wtedy NIE podajemy też sumy —
  // `null + liczba` daje w JavaScripcie liczbę, więc brak podatku przeszedłby po cichu
  // jako „0 zł podatku" i gospodarz zobaczyłby zaniżoną kwotę do odłożenia.
  const podatek = podatekDochodowy(podstawa, przychod, ustawienia, progRyczaltu);
  const formaZnana = podatek !== null;

  // Rozjazd wobec kwot zapisanych przy rezerwacjach (mogły powstać przy innych ustawieniach).
  //
  // ⚠️ Liczymy go WYŁĄCZNIE wtedy, gdy choć jedna rezerwacja ma zapisany podatek. Bez tego
  // warunku ostrzeżenie odpalałoby się u każdego, kto po prostu nie wypełnił pola podatku
  // przy rezerwacjach — czyli u większości nowych kont — i mówiłoby o rozjeździe tam,
  // gdzie jest zwykłe puste pole. Ostrzeżenie, które krzyczy zawsze, przestaje znaczyć.
  const zRozliczonym = bookings.filter((r) => Number(r.tax) > 0);
  const zapisanyPodatek = zRozliczonym.reduce((s, r) => s + (Number(r.tax) || 0), 0);

  const doProgu = Math.max(0, progRyczaltu - przychod);
  const procentProgu = Math.min(100, (przychod / progRyczaltu) * 100);

  // FAKTYCZNY podział na pasma — do karty „Podatek po dwóch stawkach". Liczony z tego
  // samego współczynnika co podatek, więc kwoty w karcie sumują się do kwoty w rachunku.
  // Wpisanie tam „8,5% od 100 000 zł" na sztywno byłoby nieprawdą u każdego, kto ma
  // odliczenie zdrowotnej: podstawa jest niższa od przychodu, więc podział wypada gdzie indziej.
  const dzieliNaPasma = ustawienia.taxForm === 'lump_sum' && ustawienia.autoThreshold
    && przychod > progRyczaltu;
  const wspolczynnik = przychod > 0 ? podstawa / przychod : 0;
  const pasma = dzieliNaPasma ? {
    doProgu: {
      podstawa: progRyczaltu * wspolczynnik,
      podatek: progRyczaltu * wspolczynnik * S.ryczaltNajem.stawkaDoProgu,
    },
    nadwyzka: {
      podstawa: (przychod - progRyczaltu) * wspolczynnik,
      podatek: (przychod - progRyczaltu) * wspolczynnik * S.ryczaltNajem.stawkaPowyzejProgu,
    },
  } : null;

  return {
    rok,
    rokStawek: S.rok,
    stawkiAktualne: S.rok === rok,
    forma: ustawienia.taxForm || 'lump_sum',

    // `null` → panel pokazuje kartę z pytaniem zamiast wiersza zdrowotnej (RYS. 4.5).
    podstawaWynajmu: ustawienia.rentalBasis ?? null,
    zdrowotnaLiczona: zdrowotnaZProgu,

    brutto, vatNalezny, przychod,
    prowizje: sumaProwizji, media: sumaMediow,
    podstawa, podatek,
    formaZnana,

    zdrowotnaMies, zdrowotnaRok, spoleczneRok,
    miesiecy: miesiecyWRoku,
    lacznieDoZaplaty: formaZnana ? podatek + zdrowotnaRok + spoleczneRok : null,

    prog: progRyczaltu,
    doProgu, procentProgu,
    progPrzekroczony: przychod > progRyczaltu,

    // Współwłasność małżeńska — panel musi umieć powiedzieć, dlaczego liczby są inne
    // niż suma rezerwacji, bo inaczej wygląda to na błąd aplikacji.
    wariantMalzenski,
    udzialPodatkowy: udzial,
    przychodCalosc,

    pasma,
    widelki: zdrowotnaZProgu ? widelkiZdrowotnej(przychod) : null,

    // Stawki w aplikacji są przeterminowane — niezależnie od oglądanego roku.
    // `stawkiAktualne` łapie tylko „liczę rok przyszły starymi stawkami"; ten warunek
    // łapie częstszy przypadek: jest luty następnego roku i nikt nie zaktualizował stałych.
    stawkiPrzeterminowane: dzisiaj.getFullYear() > S.rok,

    rozjazd: (zRozliczonym.length > 0 && Math.abs(podatek - zapisanyPodatek) > 1)
      ? { wyliczony: podatek, zapisany: zapisanyPodatek, rezerwacji: zRozliczonym.length }
      : null,
    liczbaRezerwacji: bookings.length,
  };
}

/** Rozbicie miesięczne — do tabeli w trybie szczegółowym. */
export function podsumowanieMiesieczne(rentals, settings, rokWejscie = new Date().getFullYear()) {
  const S = STAWKI_PODATKOWE;
  const ustawienia = settings || {};
  const rok = Number(rokWejscie) || new Date().getFullYear();   // patrz uwaga wyżej
  const bookings = rezerwacjeRoku(rentals, rok);
  const media = kosztyRoku(rentals, rok);

  const miesiace = Array.from({ length: 12 }, (_, i) => ({
    miesiac: i, brutto: 0, przychod: 0, prowizje: 0, media: 0, rezerwacje: 0,
  }));

  for (const r of bookings) {
    const m = new Date(r.date).getMonth();
    const brutto = Number(r.income) || 0;
    const vat = ustawienia.isVatPayer ? brutto - (brutto / (1 + S.vatNoclegi)) : 0;
    miesiace[m].brutto += brutto;
    miesiace[m].przychod += brutto - vat;
    miesiace[m].prowizje += prowizja(r);
    miesiace[m].rezerwacje += 1;
  }
  for (const r of media) {
    miesiace[new Date(r.date).getMonth()].media += Number(r.utilities) || 0;
  }
  return miesiace;
}

/**
 * Domyślny tryb widoku wynika z FORMY OPODATKOWANIA, a nie z pytania zadanego przy
 * pierwszym uruchomieniu (decyzja właściciela 2026-08-24). Uzasadnienie: w momencie
 * zakładania konta gospodarz nie widział żadnego z trybów, więc nie ma jak wybrać —
 * a formę opodatkowania i tak podaje, i to jest ta sama informacja podana w kontekście.
 * Wybór jest odwracalny jednym kliknięciem, więc zły domyślny tryb nic nie kosztuje.
 */
export function domyslnyTryb(settings) {
  // `linear` wypadło stąd razem z resztą podatku liniowego (ADR-020) — aplikacja
  // obsługuje dwie formy: ryczałt i zasady ogólne.
  return ((settings || {}).taxForm === 'general') ? 'szczegolowy' : 'prosty';
}
