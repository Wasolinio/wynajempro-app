/*
  Zestaw DANYCH PRZYKŁADOWYCH do zrzutów panelu na landing (generator: panel.zrzut.js).

  PO CO OSOBNY ZESTAW: fixture'y testów e2e mają „Test Company", jedną rezerwację
  i puste karty — na zrzut się nie nadają, a ruszanie ich pod obrazek łamałoby asercje.
  Ten plik żyje POZA testami: zmiana tu nie może zepsuć żadnego speca, a specy nie
  mogą z niego korzystać (kuszące, ale wtedy każda kosmetyka pod zrzut łamie testy).

  ZASADY ZESTAWU (analiza Smoobu §7, plan uczłowieczenia pkt 3):
  - wszystkie daty liczone WZGLĘDEM stałej TODAY — przesunięcie jednej stałej odświeża
    cały zestaw; zegar w przeglądarce przypina page.clock.setFixedTime(TODAY);
  - nazwy obiektów wiarygodne dla segmentu domków, ale oczywiście nieprzypisane do
    nikogo (nazwy od drzew); NIE prawdziwe domki właściciela obok wymyślonych gości;
  - goście: pospolite polskie imiona i nazwiska albo forma rodzinna — nigdy nazwiska
    testerów bety ani prawdziwych gości;
  - źródła tylko takie, które produkt obsługuje (Booking.com, Airbnb przez iCal +
    bezpośrednie z DEFAULT_SOURCES). Bez „Nocowanie.pl" — sugerowałoby integrację,
    której nie ma;
  - kwoty realistyczne (domek 6-os., 420–580 zł/noc), prowizja 15% dla portali,
    0 dla bezpośrednich, podatek = ryczałt 8,5% przychodu. UWAGA: panel sam liczy
    delty, obłożenie, zysk i średnie — każda liczba na zrzucie jest PRAWDZIWYM
    wynikiem kodu dla tych wejść, w odróżnieniu od makiety z ręcznie wpisanym „▲ 12%".
    Wrzesień po sierpniu wychodzi na minusie — to uczciwa sezonowość, nie błąd.
*/

import { DEFAULT_TEMPLATES } from '../../src/utils/constants.js';
import { PATCH_NOTES } from '../../src/data/patchNotes.js';

// czwartek 3 września 2026, 10:00 — jedna stała do przesuwania przy odświeżaniu zrzutów
export const TODAY = new Date('2026-09-03T10:00:00');

const pad = (n) => String(n).padStart(2, '0');
// data lokalna „TODAY + n dni" jako 'RRRR-MM-DD' (bez toISOString — strefa nie przesunie dnia)
export const d = (n) => {
  const x = new Date(TODAY);
  x.setDate(x.getDate() + n);
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
};

const UID = 'uid-demo';
// neutralna marka przykładowa (krótka — sidebar ucina po ~10 znakach); decyzja właściciela, czy zostaje
const NAZWA_GOSPODARZA = 'Trzy Sosny';

export const user = { uid: UID, email: 'demo@example.com', displayName: 'Gospodarz', emailVerified: true };

const CISOWY = 'Domek Cisowy';
const MODRZEWIOWY = 'Domek Modrzewiowy';
const JODLOWY = 'Domek Jodłowy';

const PROWIZJA = { 'Booking.com': 0.15, Airbnb: 0.15 };
const RYCZALT = 0.085;

// rezerwacja: [id, obiekt, źródło, gość, przyjazd (dni od TODAY), noce, przychód]
const REZERWACJE = [
  // ── Domek Cisowy ──
  ['c01', CISOWY, 'Booking.com', 'Rodzina Kowalczyków', -41, 7, 3900],
  ['c02', CISOWY, 'Airbnb', 'Marta i Piotr Lisowscy', -33, 7, 3900],
  ['c03', CISOWY, 'Booking.com', 'Rodzina Nowickich', -25, 7, 3900],
  ['c04', CISOWY, 'Strona www', 'Katarzyna Mazur', -17, 5, 2650],
  ['c05', CISOWY, 'Airbnb', 'Jakub Wiśniewski', -10, 5, 2750],
  ['c06', CISOWY, 'Booking.com', 'Anna i Tomasz Krawczyk', -3, 3, 1410],   // wyjazd DZIŚ → sprzątanie
  ['c07', CISOWY, 'Airbnb', 'Rodzina Zielińskich', 0, 4, 2080],            // przyjazd DZIŚ
  ['c08', CISOWY, 'Booking.com', 'Agnieszka Dąbrowska', 6, 4, 1960],
  ['c09', CISOWY, 'Z polecenia', 'Michał Pawlak', 12, 5, 2400],
  ['c10', CISOWY, 'Booking.com', 'Ewa Sikora', 21, 3, 1380],
  ['c11', CISOWY, 'Booking.com', 'Rodzina Głowackich', 25, 4, 1900],
  ['c12', CISOWY, 'Airbnb', 'Rodzina Szymańskich', 32, 3, 1260],
  // ── Domek Modrzewiowy ──
  ['m01', MODRZEWIOWY, 'Airbnb', 'Rodzina Wróblewskich', -40, 7, 3900],
  ['m02', MODRZEWIOWY, 'Booking.com', 'Joanna Kaczmarek', -32, 7, 3990],
  ['m03', MODRZEWIOWY, 'Booking.com', 'Rodzina Adamczyków', -24, 5, 2800],
  ['m04', MODRZEWIOWY, 'Airbnb', 'Paweł Grabowski', -18, 7, 3920],
  ['m05', MODRZEWIOWY, 'Strona www', 'Magdalena Ostrowska', -9, 5, 2600],
  ['m06', MODRZEWIOWY, 'Booking.com', 'Rodzina Jabłońskich', -4, 3, 1440],
  ['m07', MODRZEWIOWY, 'Airbnb', 'Rodzina Kozłowskich', 1, 7, 3500],        // przyjazd JUTRO
  ['m08', MODRZEWIOWY, 'Booking.com', 'Barbara Wojciechowska', 9, 4, 1920],
  ['m09', MODRZEWIOWY, 'Z polecenia', 'Krzysztof Piotrowski', 15, 4, 1880],
  ['m10', MODRZEWIOWY, 'Airbnb', 'Sylwia Rutkowska', 19, 3, 1440],
  ['m11', MODRZEWIOWY, 'Airbnb', 'Rodzina Michalskich', 22, 5, 2350],
  ['m12', MODRZEWIOWY, 'Booking.com', 'Dorota Kamińska', 36, 3, 1200],
  // ── Domek Jodłowy ──
  ['j01', JODLOWY, 'Booking.com', 'Rodzina Pietrzaków', -38, 7, 3850],
  ['j02', JODLOWY, 'Airbnb', 'Rafał Zając', -30, 7, 3850],
  ['j03', JODLOWY, 'Booking.com', 'Rodzina Włodarczyków', -22, 7, 3920],
  ['j04', JODLOWY, 'Strona www', 'Monika Stępień', -14, 7, 3640],
  ['j05', JODLOWY, 'Airbnb', 'Łukasz Borkowski', -6, 4, 1800],
  ['j06', JODLOWY, 'Booking.com', 'Rodzina Malinowskich', -1, 4, 2000],
  ['j07', JODLOWY, 'Airbnb', 'Iwona Czarnecka', 5, 4, 1960],
  ['j08', JODLOWY, 'Booking.com', 'Rodzina Sadowskich', 11, 5, 2450],
  ['j09', JODLOWY, 'Strona www', 'Grzegorz Lewandowski', 18, 4, 1840],
  ['j10', JODLOWY, 'Booking.com', 'Rodzina Wysockich', 23, 5, 2300],
  ['j11', JODLOWY, 'Airbnb', 'Aleksandra Bąk', 30, 3, 1230],
];

// koszty: [id, opis, kategoria, obiekt (albo ''), dzień od TODAY, kwota]
const KOSZTY = [
  ['k01', 'Prąd — faktura za lipiec', 'Prąd', CISOWY, -29, 486],
  ['k02', 'Wywóz nieczystości', 'Inne', '', -22, 240],
  ['k03', 'Sprzątanie — sierpień', 'Sprzątanie', '', -14, 900],
  ['k04', 'Naprawa pompy wody', 'Naprawy', JODLOWY, -6, 350],
  ['k05', 'Środki czystości', 'Środki czystości', '', -2, 96],
  ['k06', 'Prąd — faktura za sierpień', 'Prąd', MODRZEWIOWY, -1, 512],
];

// zadanie z kolekcji tasks — pełny kształt dokumentu jak w tasks-module.spec
const zadanie = (over) => ({
  text: '', propertyName: null, rentalId: null, templateId: null,
  date: null, time: '', priority: 'normalny', note: '', subtasks: [],
  recurrence: null, photos: [], done: false, doneAt: null, ...over,
});

/*
  Zadania z szablonów, które sumienny gospodarz ma już odhaczone — inaczej raport dzienny
  zbiera zaległe „sprzątanie" i „prośba o opinię" z całego lata (63 pozycje, „Do posprzątania: 3"
  przy jednym wyjeździe). Zostają otwarte tylko zadania na DZIŚ: sprzątanie po dzisiejszym
  wyjeździe i kod do drzwi dla jutrzejszego przyjazdu.
*/
const odhaczone = (start, nights) => {
  const koniec = start + nights;
  const done = {};
  if (koniec < 0) return { directions: true, keycode: true, cleaning: true, review: true }; // pobyt zakończony
  if (start <= 0) { done.directions = true; done.keycode = true; }   // gość już jest albo przyjeżdża dziś
  if (start === 1) done.directions = true;                          // przyjazd jutro: dojazd wysłany, kod DZIŚ
  return done;
};

const rentals = {};
for (const [id, property, source, guest, start, nights, income] of REZERWACJE) {
  const commission = Math.round(income * (PROWIZJA[source] || 0));
  const rodzina = guest.startsWith('Rodzina');
  rentals[`users/${UID}/rentals/${id}`] = {
    type: 'booking', property, source, guest,
    date: d(start), endDate: d(start + nights),
    income, commission, tax: Math.round(income * RYCZALT),
    adults: 2, children: rodzina ? 2 : 0,
    isPaid: start < 0, isCompleted: start + nights < 0, completedTasks: odhaczone(start, nights),
  };
}
for (const [id, guest, category, property, day, amount] of KOSZTY) {
  rentals[`users/${UID}/rentals/${id}`] = {
    type: 'utility', property, category, guest, date: d(day), utilities: amount,
    isPaid: true, isCompleted: false,
  };
}

// suma przychodu z rezerwacji przyjeżdżających w miesiącu TODAY — Pulpit i Finanse liczą
// przychód miesiąca po dacie przyjazdu; generator pilnuje, żeby zrzut złapał liczbę KOŃCOWĄ,
// a nie klatkę animacji wjazdu (useCountUp, 700 ms)
export const PRZYCHOD_MIESIACA = REZERWACJE
  .filter(([, , , , start]) => d(start).slice(0, 7) === d(0).slice(0, 7))
  .reduce((suma, [, , , , , , income]) => suma + income, 0);

const linkICal = (obiekt) => ({
  booking: `https://ical.booking.com/v1/export?t=${obiekt}`,
  airbnb: `https://www.airbnb.pl/calendar/ical/${obiekt}.ics`,
});

export const dbData = {
  // lastSeenPatchNote = najnowszy wpis → popup „Co nowego" nie ma czego pokazać
  [`users/${UID}`]: { accountStatus: 'active', name: 'Gospodarz', email: user.email, lastSeenPatchNote: PATCH_NOTES[0].id },
  [`users/${UID}/settings/hostProfile`]: {
    entityName: NAZWA_GOSPODARZA, identifierType: 'NIP', taxIdentifier: '0000000000',
    address: 'ul. Przykładowa 1, 00-000 Miejscowość', phone: '000000000', email: user.email,
  },
  [`users/${UID}/settings/properties`]: {
    items: [
      { id: 'p-cisowy', name: CISOWY, color: 'blue', secretToken: 'demo-1' },
      { id: 'p-modrzewiowy', name: MODRZEWIOWY, color: 'emerald', secretToken: 'demo-2' },
      { id: 'p-jodlowy', name: JODLOWY, color: 'amber', secretToken: 'demo-3' },
    ],
  },
  [`users/${UID}/settings/sources`]: { items: ['Booking.com', 'Airbnb', 'Strona www', 'Z polecenia'] },
  [`users/${UID}/settings/categories`]: { items: ['Prąd', 'Woda', 'Sprzątanie', 'Środki czystości', 'Naprawy', 'Internet', 'Inne'] },
  // szablony zadań jak u nowego konta — sprzątanie po wyjeździe, kod dzień przed przyjazdem itd.
  [`users/${UID}/settings/reminders`]: { items: DEFAULT_TEMPLATES.map((t) => ({ ...t })) },
  [`users/${UID}/settings/syncLinks`]: {
    links: { [CISOWY]: linkICal('cisowy'), [MODRZEWIOWY]: linkICal('modrzewiowy'), [JODLOWY]: linkICal('jodlowy') },
  },
  [`users/${UID}/settings/tax`]: {
    taxForm: 'lump_sum', autoThreshold: true, rate: 8.5, isVatPayer: false,
    zusHealth: 0, zusSocial: 0, taxFreeAmount: 30000, includeZusInCosts: true,
  },
  ...rentals,
  // kolekcja tasks: skrzynka ×2, zaległe, dziś (z podzadaniami), jutro, za trzy dni
  [`users/${UID}/tasks/t-inbox1`]: zadanie({ text: 'Zamówić drewno do kominka na jesień', priority: 'normalny' }),
  [`users/${UID}/tasks/t-inbox2`]: zadanie({ text: 'Wymienić uszczelkę w prysznicu', propertyName: JODLOWY, priority: 'niski' }),
  [`users/${UID}/tasks/t-overdue`]: zadanie({ text: 'Przegląd gaśnic', propertyName: CISOWY, date: d(-2), priority: 'wysoki', note: 'Serwis dzwonił, że mogą przyjechać w tym tygodniu.' }),
  [`users/${UID}/tasks/t-today`]: zadanie({
    text: 'Odczyt liczników prądu', date: d(0), time: '17:00', priority: 'normalny',
    subtasks: [{ text: CISOWY, done: true }, { text: MODRZEWIOWY, done: false }, { text: JODLOWY, done: false }],
  }),
  [`users/${UID}/tasks/t-tomorrow`]: zadanie({ text: 'Przygotować kosz powitalny', propertyName: MODRZEWIOWY, date: d(1), time: '14:00', priority: 'normalny' }),
  [`users/${UID}/tasks/t-later`]: zadanie({ text: 'Skosić trawę przy pomoście', date: d(3), priority: 'niski' }),
};
