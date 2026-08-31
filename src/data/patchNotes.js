// GENEROWANE z docs/marketing/patch-notes.md — NIE edytuj ręcznie.
// Zmiany treści: edytuj markdown i uruchom `npm run patchnotes:build`.
// Wpisy od najnowszego. Kontrakt pola: { id, date: 'RRRR-MM-DD', title, items[] }.

export const PATCH_NOTES = [
  {
    "id": "2026-08-29-modul-zadania",
    "date": "2026-08-29",
    "title": "Moduł Zadania",
    "items": [
      "Zadania mają własny widok w panelu. Lista dnia pokazuje zaległe, dzisiejsze i nadchodzące, z podziałem na obiekty.",
      "Zadanie przypisujesz przeciągnięciem na oś tygodnia albo przyciskiem, bez otwierania formularza.",
      "Zadania z szablonów (na przykład sprzątanie po wyjeździe) pojawiają się przy rezerwacjach same.",
      "Zadanie może się powtarzać co tydzień, co miesiąc albo po każdym wyjeździe."
    ]
  },
  {
    "id": "2026-08-28-zadanie-w-kalendarzu-telefonu",
    "date": "2026-08-28",
    "title": "Zadanie w kalendarzu telefonu",
    "items": [
      "Przy zadaniu jest przycisk „Dodaj do kalendarza\". Klik zapisuje je jako wydarzenie w kalendarzu telefonu, na iPhonie i na Androidzie.",
      "O terminie przypomina Ci telefon, nawet gdy panel jest zamknięty."
    ]
  },
  {
    "id": "2026-08-28-podatek-liniowy-19-i-limit-vat",
    "date": "2026-08-28",
    "title": "Podatek liniowy 19% i limit VAT",
    "items": [
      "Moduł podatkowy liczy teraz także podatek liniowy 19%, obok ryczałtu i skali.",
      "Nowa karta pilnuje limitu zwolnienia z VAT (240 000 zł rocznie) i progu ryczałtu 100 000 zł. Widzisz z wyprzedzeniem, ile zostało do granicy."
    ]
  },
  {
    "id": "2026-08-25-rozliczenia-podatkowe-w-finansach",
    "date": "2026-08-25",
    "title": "Rozliczenia podatkowe w Finansach",
    "items": [
      "W Finansach jest czwarta zakładka: Podatki. Tryb prosty pokazuje jedną kwotę do odłożenia, tryb szczegółowy pełne rozbicie.",
      "Wynik uwzględnia współwłasność małżeńską i sposób wynajmu, który ustawiasz raz.",
      "Przycisk „Pobierz dla księgowej\" eksportuje rozliczenie do pliku CSV."
    ]
  },
  {
    "id": "2026-08-24-synchronizacja-co-godzine",
    "date": "2026-08-24",
    "title": "Synchronizacja co godzinę",
    "items": [
      "Kalendarze z Booking i Airbnb uzgadniają się same co godzinę.",
      "Anulowana rezerwacja zwalnia termin, a zmiana dat nie tworzy dubla.",
      "Gdy dwie rezerwacje nachodzą na siebie, pulpit podnosi alarm."
    ]
  }
];
