/*
  Kroki scroll-demo panelu na landingu (sekcja #panel, LandingScrollDemo.jsx).

  Osobny plik danych, nie stała w komponencie: (1) spec e2e/landing-demo.spec.js liczy
  kroki i bierze ich tytuły STĄD, nigdy na sztywno (wzorzec help-center.spec ↔ helpArticles);
  (2) react-refresh/only-export-components — plik komponentu nie eksportuje danych.

  `key` = widok panelu i zarazem nazwa pliku zrzutu z generatora (scripts/zrzuty/panel.zrzut.js:
  src/assets/landing/panel-<key>.webp) oraz wartość data-view w DOM.

  Copy: każde twierdzenie ma pokrycie w kodzie (2026-09-03). Wycięte cztery nieprawdy
  z poprzedniej wersji: „synchronizacja pilnuje terminów za Ciebie" (iCal ma okno,
  produkt alarmuje), „Automatyczne wiadomości robią resztę" (aplikacja nie wysyła
  gościom niczego), „eksportujesz do PDF jednym kliknięciem" (PDF przez okno drukowania;
  jednym kliknięciem jest CSV) i ekran Obiekty z polami spoza modelu (adres, typ, zdjęcia).
  Zero emoji, zero kursyw w nagłówkach (identyfikacja v2; kursywa Newsreader tylko w H1 hero).
*/
export const DEMO_KROKI = [
  {
    key: 'pulpit', label: 'Pulpit',
    title: 'Cały wynajem na jednym ekranie.',
    body: 'Przychód, obłożenie i dzisiejsze przyjazdy witają Cię, zanim wystygnie kawa. Zero klikania po zakładkach.',
  },
  {
    key: 'kalendarz', label: 'Kalendarz',
    title: 'Booking, Airbnb i telefon w jednym kalendarzu.',
    body: 'Rezerwacje z Bookingu i Airbnb wpadają co godzinę, bezpośrednie wpisujesz sam. Gdy dwa terminy zaczną na siebie nachodzić, pulpit pokazuje alarm.',
  },
  {
    key: 'zadania', label: 'Zadania',
    title: 'Sprzątanie wpisuje się samo.',
    body: 'Zadania z szablonów pojawiają się przy rezerwacjach same, na przykład sprzątanie po wyjeździe. Resztę dopisujesz i przeciągasz na oś tygodnia.',
  },
  {
    key: 'finanse', label: 'Finanse',
    title: 'Wiesz co do złotówki.',
    body: 'Przychód, prowizje i zysk netto liczą się same. Zestawienie dla księgowej pobierasz jako CSV.',
  },
];
