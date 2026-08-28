// =============================================================================
// WSPÓLNE STAŁE APLIKACJI WynajemPRO
// Jedno źródło prawdy — importowane przez ManagerApp, useFirebaseData i inne moduły.
// =============================================================================

export const propColors = {
  blue: { bg: 'bg-blue-500', solid: 'bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-500/20', advance: 'bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-blue-800 dark:text-blue-300 border-[2px] border-solid font-bold', dashed: 'bg-blue-50 dark:bg-transparent border-blue-400 dark:border-blue-500/50 text-blue-700 dark:text-blue-400 border-2 border-dashed' },
  emerald: { bg: 'bg-emerald-500', solid: 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/20', advance: 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 border-[2px] border-solid font-bold', dashed: 'bg-emerald-50 dark:bg-transparent border-emerald-400 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-400 border-2 border-dashed' },
  violet: { bg: 'bg-violet-500', solid: 'bg-violet-500 border-violet-500 text-white shadow-md shadow-violet-500/20', advance: 'bg-violet-50 dark:bg-violet-500/20 border-violet-500 text-violet-800 dark:text-violet-300 border-[2px] border-solid font-bold', dashed: 'bg-violet-50 dark:bg-transparent border-violet-400 dark:border-violet-500/50 text-violet-700 dark:text-violet-400 border-2 border-dashed' },
  amber: { bg: 'bg-amber-500', solid: 'bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-500/20', advance: 'bg-amber-50 dark:bg-amber-500/20 border-amber-500 text-amber-900 dark:text-amber-300 border-[2px] border-solid font-bold', dashed: 'bg-amber-50 dark:bg-transparent border-amber-400 dark:border-amber-500/50 text-amber-700 dark:text-amber-400 border-2 border-dashed' },
  rose: { bg: 'bg-rose-500', solid: 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/20', advance: 'bg-rose-50 dark:bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-300 border-[2px] border-solid font-bold', dashed: 'bg-rose-50 dark:bg-transparent border-rose-400 dark:border-rose-500/50 text-rose-700 dark:text-rose-400 border-2 border-dashed' },
  cyan: { bg: 'bg-cyan-500', solid: 'bg-cyan-500 border-cyan-500 text-white shadow-md shadow-cyan-500/20', advance: 'bg-cyan-50 dark:bg-cyan-500/20 border-cyan-500 text-cyan-800 dark:text-cyan-300 border-[2px] border-solid font-bold', dashed: 'bg-cyan-50 dark:bg-transparent border-cyan-400 dark:border-cyan-500/50 text-cyan-700 dark:text-cyan-400 border-2 border-dashed' },
  pink: { bg: 'bg-pink-500', solid: 'bg-pink-500 border-pink-500 text-white shadow-md shadow-pink-500/20', advance: 'bg-pink-50 dark:bg-pink-500/20 border-pink-500 text-pink-800 dark:text-pink-300 border-[2px] border-solid font-bold', dashed: 'bg-pink-50 dark:bg-transparent border-pink-400 dark:border-pink-500/50 text-pink-700 dark:text-pink-400 border-2 border-dashed' },
  slate: { bg: 'bg-slate-500', solid: 'bg-slate-600 border-slate-600 text-white shadow-md shadow-slate-500/20', advance: 'bg-slate-50 dark:bg-slate-500/20 border-slate-500 text-slate-800 dark:text-slate-300 border-[2px] border-solid font-bold', dashed: 'bg-slate-50 dark:bg-transparent border-slate-400 dark:border-slate-500/50 text-slate-700 dark:text-slate-400 border-2 border-dashed' },
};

export const availableColors = Object.keys(propColors);

export const DEFAULT_PROPERTIES = [
  { name: 'Domek nad Jeziorem', color: 'blue' },
  { name: 'Apartament Centrum', color: 'emerald' },
  { name: 'Domek w Górach', color: 'amber' }
];

export const DEFAULT_SOURCES = ['Booking.com', 'Airbnb', 'Facebook', 'Strona www', 'Z polecenia', 'Inne'];

export const DEFAULT_CATEGORIES = ['Prąd', 'Woda', 'Sprzątanie', 'Środki czystości', 'Naprawy', 'Gaz', 'Internet', 'Inne'];

// X20: `anchor` mówi, OD CZEGO liczymy termin ('arrival' | 'departure'); `daysBefore`
// zachowuje znak (dodatni = przed kotwicą, ujemny = po). Brak `anchor` = przyjazd,
// więc szablony zapisane przed X20 działają bez migracji. Logika: `src/utils/taskSchedule.js`.
// Zestaw poniżej dostają WYŁĄCZNIE nowe konta — zapisanych szablonów nie ruszamy.
export const DEFAULT_TEMPLATES = [
  { id: 'directions', text: 'Wyślij wskazówki dojazdu', shortName: 'Dojazd', anchor: 'arrival', daysBefore: 3, icon: 'Mail' },
  { id: 'keycode', text: 'Wyślij kod do drzwi', shortName: 'Kod', anchor: 'arrival', daysBefore: 1, icon: 'Key' },
  // sprzątanie po gościu, nie w dniu jego przyjazdu (uwaga testera 2026-08-21)
  { id: 'cleaning', text: 'Zleć sprzątanie', shortName: 'Sprzątanie', anchor: 'departure', daysBefore: 0, icon: 'CheckSquare' },
  // spina się z modułem Opinie (X13) — pierwszy domyślny szablon PO pobycie
  { id: 'review', text: 'Wyślij prośbę o opinię', shortName: 'Opinia', anchor: 'departure', daysBefore: -1, icon: 'MessageSquare' }
];

// =============================================================================
// STAWKI PODATKOWE I SKŁADKI — STAN PRAWNY NA ROK 2026
//
// ⚠️ TE KWOTY ZMIENIAJĄ SIĘ CO ROKU. Wpisane na sztywno zgniją w styczniu i to
// BEZ ŻADNEGO SYGNAŁU — wyliczenia dalej będą wychodzić, tylko będą nieprawdziwe.
// Dlatego rok jest polem, a nie komentarzem: widok podatkowy pokazuje go gospodarzowi
// i ostrzega, gdy `rok` nie zgadza się z bieżącym. Aktualizacja stawek to pozycja
// w [[Projects/Roadmap]] na grudzień.
//
// ŹRÓDŁA (sprawdzone 2026-08-24):
//   • zdrowotna przy ryczałcie — progi 60 tys. / 300 tys. przychodu rocznie, podstawa
//     liczona od przeciętnego wynagrodzenia 9 228,64 zł (obwieszczenie GUS 22.01.2026)
//   • od 2026 ryczałtowiec odlicza 50% ZAPŁACONEJ zdrowotnej od przychodu
//   • ryczałt od najmu: 8,5% do 100 000 zł przychodu, 12,5% od nadwyżki
//
// ⚖️ To są dane do wyliczenia SZACUNKU dla gospodarza i jego księgowego, nie deklaracja
// podatkowa. Tak też ma o tym mówić interfejs.
// =============================================================================
export const STAWKI_PODATKOWE = {
  rok: 2026,

  // Data, na którą stawki sprawdzono U ŹRÓDŁA — nie data renderu i nie data builda.
  // Panel pokazuje ją w stopce, żeby „STAWKI 2026" nie sugerowało świeżości, której nie ma.
  // Rejestr weryfikacji z linkami: docs/legal/Rejestr-stawek-podatkowych.md.
  // ⚠️ Aktualizować DO 31 STYCZNIA każdego roku, razem z wartościami poniżej.
  zweryfikowano: '2026-08-25',

  // Art. 12 ust. 1 pkt 4 ustawy o ryczałcie. Ta sama stawka i ten sam próg obejmują
  // lit. a (najem prywatny, przez art. 6 ust. 1a) ORAZ lit. c (usługi związane
  // z zakwaterowaniem, PKWiU dział 55) — dlatego jedna gałąź obsługuje obie podstawy
  // wynajmu z ADR-018. Odczytane z tekstu ustawy 2026-08-25.
  //
  // ⚠️ CZEGO TU JESZCZE NIE MA: art. 12 ust. 13 podnosi próg do **200 000 zł** dla
  // małżonków ze wspólnością majątkową, którzy złożyli oświadczenie z ust. 6
  // (opodatkowanie całości przychodu przez jednego z nich). Bez oświadczenia przychód
  // dzieli się między małżonków po połowie i każde ma własne 100 000 zł. W obu układach
  // nasz sztywny próg ostrzega WCZEŚNIEJ, niż powinien. Kierunek bezpieczny, ale
  // nieprawdziwy — wymaga pola w ustawieniach, patrz [[Rejestr-stawek-podatkowych]].
  ryczaltNajem: {
    prog: 100000,
    // Art. 12 ust. 13: małżonkowie, którzy złożyli oświadczenie z ust. 6 (całość przychodu
    // rozlicza jedno z nich), mają próg podwójny. Bez oświadczenia działa ust. 5 przez ust. 6 —
    // przychód dzieli się proporcjonalnie i każde ma własne 100 000 zł.
    progMalzonkowieZOswiadczeniem: 200000,
    stawkaDoProgu: 0.085,
    stawkaPowyzejProgu: 0.125,
  },

  // Składka zdrowotna przy ryczałcie — progowa wg PRZYCHODU ROCZNEGO.
  // Aplikacja zna przychód narastająco, więc nie musi o nią pytać gospodarza.
  zdrowotnaRyczalt: {
    progi: [
      { doPrzychodu: 60000, miesiecznie: 498.35 },
      { doPrzychodu: 300000, miesiecznie: 830.58 },
      { doPrzychodu: Infinity, miesiecznie: 1495.04 },
    ],
    odliczenieOdPrzychodu: 0.5,   // od 2026: 50% zapłaconej składki
  },

  skala: {
    kwotaWolna: 30000,
    prog: 120000,
    stawkaDoProgu: 0.12,
    stawkaPowyzejProgu: 0.32,
  },

  // Podatek liniowy — art. 30c ust. 1 PIT: 19% podstawy, płasko, bez kwoty wolnej.
  // Limit odliczenia zapłaconej składki zdrowotnej od dochodu (art. 30c ust. 2 pkt 2,
  // wspólny z zaliczeniem do kosztów z art. 23 ust. 1 pkt 58): ogłaszany CO ROKU
  // obwieszczeniem Ministra Finansów — na 2026 r. 14 100 zł (obwieszczenie MF
  // z 17.12.2025, M.P.). To najbardziej „psująca się" stała tej formy — obwieszczenie
  // wychodzi w grudniu, wchodzi do rytmu rejestru „do 31 stycznia".
  // ⚠️ NIE mylić z ryczałtem: tam odlicza się 50% składki OD PRZYCHODU (art. 11
  // ust. 1a ustawy o ryczałcie), tu kwotę do limitu OD DOCHODU. Dwie różne mechaniki.
  // Zweryfikowano u źródła 2026-08-28 (analiza legal, [[Rejestr-stawek-podatkowych]]).
  liniowy: {
    stawka: 0.19,
    limitOdliczeniaZdrowotnej: 14100,
  },

  vatNoclegi: 0.08,

  // Zwolnienie podmiotowe z VAT — art. 113 ust. 1 ustawy o VAT w brzmieniu od 1.01.2026:
  // limit podniesiony z 200 000 zł ustawą z 24.06.2025 (Dz.U. 2025 poz. 896).
  // Licznik = pełna wartość sprzedaży z aplikacji (pole `brutto`), BEZ podziału
  // małżeńskiego — oświadczenie ryczałtowe to mechanika PIT, na VAT się nie przenosi.
  // Kwota roczna, zmienna ustawowo — objęta rytmem rejestru „do 31 stycznia".
  // Zweryfikowano u źródła 2026-08-28 (analiza legal, [[Rejestr-stawek-podatkowych]]).
  vatZwolnieniePodmiotowe: {
    limit: 240000,
    // Od tej części limitu karta w panelu przechodzi w stan ostrzegawczy —
    // spójnie z ostrzeganiem przy progu ryczałtu.
    progOstrzezenia: 0.8,
  },
};

export const defaultTaxSettings = {
  taxForm: 'lump_sum',

  // Najem prywatny czy działalność gospodarcza. Ryczałt ma dla obu tę samą stawkę
  // i ten sam próg, ale SKŁADKI już nie: przy najmie prywatnym nie ma zdrowotnej
  // i nie ma odliczenia 50% (art. 11 ust. 1a odsyła do art. 6 ust. 1, czyli do
  // działalności). Wcześniej aplikacja doliczała jedno i drugie każdemu ryczałtowcowi.
  //
  // ŚWIADOMIE BEZ WARTOŚCI DOMYŚLNEJ. Każde domyślne jest zgadywaniem cudzego
  // statusu podatkowego, a pomyłka kosztuje ~10 tys. zł zawyżenia albo ~424 zł
  // niedopłaty rocznie. `null` znaczy „nie wiemy" i panel ma o to zapytać.
  rentalBasis: null,     // null | 'private' | 'business'

  // Współwłasność małżeńska przy najmie prywatnym (art. 12 ust. 5, 6 i 13 ustawy o ryczałcie).
  //   'brak'    — wynajem na własny rachunek, cały przychód i próg 100 000 zł
  //   'polowa'  — współwłasność BEZ oświadczenia: przychód dzieli się proporcjonalnie,
  //               więc rozliczasz połowę, a próg pozostaje 100 000 zł
  //   'calosc'  — złożone oświadczenie z ust. 6: rozliczasz całość za oboje,
  //               a próg rośnie do 200 000 zł
  // Domyślnie 'brak', bo to sytuacja większości i jedyna, której wybór niczego nie zmienia
  // wobec stanu sprzed tej opcji — nikomu nie przestawiamy wyliczenia bez jego wiedzy.
  spouseRental: 'brak',

  autoThreshold: true,
  rate: 8.5,
  isVatPayer: false,
  zusHealth: 0,
  zusSocial: 0,

  // Kwota wolna jest JEDNA na podatnika i na wszystkie źródła (art. 27 ust. 1 PIT).
  // Grupa docelowa wynajmuje obok etatu, więc kwotę wolną konsumuje im pracodawca —
  // domyślne 30 000 odejmowało ją drugi raz i zaniżało podatek nawet o 3 600 zł.
  // Zero myli się w stronę zawyżenia, a panel istnieje po to, żeby nie zabrakło.
  taxFreeAmount: 0,

  includeZusInCosts: true,
};

export const defaultHostProfile = {
  entityName: '',
  identifierType: 'NIP',
  taxIdentifier: '',
  address: '',
  phone: '',
  email: '',
  publicEmail: '',        // osobny e-mail widoczny gościom (NIE adres logowania) — RODO F4
  showPublicContact: true // czy pokazywać kontakt na publicznej stronie przewodnika
};

export const monthNames = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

export const ITEMS_PER_PAGE = 15;
