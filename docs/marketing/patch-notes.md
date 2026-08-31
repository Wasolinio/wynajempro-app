# Co nowego w panelu — źródło treści

> **To jest źródło prawdy dla okienka „Co nowego" w panelu** (E4 w [[Projects/Roadmap]]).
> Plik czyta generator `scripts/build-patch-notes.mjs` (`npm run patchnotes:build`),
> który zapisuje `src/data/patchNotes.js` — tamtego pliku nie edytuje się ręcznie.
> Po każdej zmianie tutaj: przebuduj i wydaj z najbliższym deployem `hosting:app`.
>
> Konwencja wpisu: `## RRRR-MM-DD — Tytuł` (najnowszy NA GÓRZE), pod spodem 1–6 punktów
> (najlepiej 2–4). ⚠️ Wpis dodawany PO deployu, który tego dnia już wyszedł, dostaje
> **datę następnego dnia** — kto zamknął popup rano, ma zapisany dzień jako „widziany"
> i wpisu z tą samą datą nie zobaczy już nigdy (filtr jest ostry, ziarnistość dnia).
> Tytuł to rzeczownik, nie tryb rozkazujący. Piszemy do gospodarza per „Ty", krótkimi
> zdaniami, konkret zamiast przymiotnika. Zero emoji. Bez „intuicyjny", „nowoczesny",
> „innowacyjny". Wpis opisuje to, co gospodarz zobaczy w panelu, nie naszą pracę.

## 2026-08-29 — Moduł Zadania

- Zadania mają własny widok w panelu. Lista dnia pokazuje zaległe, dzisiejsze i nadchodzące, z podziałem na obiekty.
- Zadanie przypisujesz przeciągnięciem na oś tygodnia albo przyciskiem, bez otwierania formularza.
- Zadania z szablonów (na przykład sprzątanie po wyjeździe) pojawiają się przy rezerwacjach same.
- Zadanie może się powtarzać co tydzień, co miesiąc albo po każdym wyjeździe.

## 2026-08-28 — Zadanie w kalendarzu telefonu

- Przy zadaniu jest przycisk „Dodaj do kalendarza". Klik zapisuje je jako wydarzenie w kalendarzu telefonu, na iPhonie i na Androidzie.
- O terminie przypomina Ci telefon, nawet gdy panel jest zamknięty.

## 2026-08-28 — Podatek liniowy 19% i limit VAT

- Moduł podatkowy liczy teraz także podatek liniowy 19%, obok ryczałtu i skali.
- Nowa karta pilnuje limitu zwolnienia z VAT (240 000 zł rocznie) i progu ryczałtu 100 000 zł. Widzisz z wyprzedzeniem, ile zostało do granicy.

## 2026-08-25 — Rozliczenia podatkowe w Finansach

- W Finansach jest czwarta zakładka: Podatki. Tryb prosty pokazuje jedną kwotę do odłożenia, tryb szczegółowy pełne rozbicie.
- Wynik uwzględnia współwłasność małżeńską i sposób wynajmu, który ustawiasz raz.
- Przycisk „Pobierz dla księgowej" eksportuje rozliczenie do pliku CSV.

## 2026-08-24 — Synchronizacja co godzinę

- Kalendarze z Booking i Airbnb uzgadniają się same co godzinę.
- Anulowana rezerwacja zwalnia termin, a zmiana dat nie tworzy dubla.
- Gdy dwie rezerwacje nachodzą na siebie, pulpit podnosi alarm.
