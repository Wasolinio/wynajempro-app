# Synchronizacja z Booking.com i Airbnb (iCal)

Dzięki synchronizacji iCal rezerwacje z portali same trafiają do WynajemPRO, a Twój kalendarz z WynajemPRO może blokować terminy w portalach. To podstawowa ochrona przed overbookingiem, czyli podwójną rezerwacją tego samego terminu.

## Jak to działa

Portale rezerwacyjne udostępniają kalendarz obiektu w postaci specjalnego linku (format iCal). WynajemPRO regularnie pobiera z tego linku zajęte terminy i tworzy z nich wpisy rezerwacji. Działa to też w drugą stronę: WynajemPRO generuje własny link iCal, który możesz wkleić w Booking.com i Airbnb, żeby portale widziały Twoje rezerwacje bezpośrednie.

## Krok 1. Skopiuj link iCal z Booking.com

1. Zaloguj się do panelu partnera Booking.com (extranet, admin.booking.com).
2. Otwórz sekcję „Ceny i dostępność", a w niej „Kalendarz".
3. Wybierz opcję „Synchronizacja kalendarzy" (w niektórych widokach: „Synchronizuj kalendarze").
4. Przy eksporcie kalendarza kliknij „Skopiuj link". Poprawny link zaczyna się od adresu admin.booking.com/hotel/hoteladmin/ical.html.

Booking.com co jakiś czas zmienia układ panelu — jeśli powyższa ścieżka się nie zgadza, wpisz „synchronizacja kalendarzy" w wyszukiwarkę pomocy na partner.booking.com.

## Krok 2. Skopiuj link iCal z Airbnb

1. Zaloguj się na airbnb.pl jako gospodarz i otwórz „Kalendarz".
2. Wybierz ogłoszenie, które chcesz zsynchronizować.
3. W ustawieniach dostępności znajdź „Połącz kalendarze" (Airbnb nazywa to też „Połączenia kalendarza").
4. Wybierz „Eksportuj kalendarz" i skopiuj wyświetlony link (zaczyna się od airbnb.pl/calendar/ical).

Aktualną instrukcję znajdziesz też w centrum pomocy Airbnb (airbnb.pl/help), hasło: „synchronizacja kalendarza".

## Krok 3. Wklej linki w WynajemPRO

1. W panelu kliknij ikonę zębatki („Ustawienia") i przejdź do zakładki „Integracje".
2. Odszukaj sekcję właściwego obiektu — każdy obiekt ma osobne pola.
3. Wklej skopiowane adresy w pola „Link iCal Booking.com" i „Link iCal Airbnb".
4. Kliknij „Zapisz ustawienia".

Pilnuj, żeby link z portalu trafił do sekcji tego samego obiektu, którego dotyczy ogłoszenie — to najczęstsza przyczyna „znikających" rezerwacji.

## Krok 4. Uruchom synchronizację

- Ręcznie: na komputerze kliknij „Synchronizacja" w bocznym menu panelu (nad Twoim imieniem i nazwiskiem). Po chwili zobaczysz okienko z komunikatem „Synchronizacja zakończona!" i liczbą dodanych rezerwacji.
- Automatycznie: WynajemPRO synchronizuje kalendarze raz na dobę, wcześnie rano. Nie musisz nic klikać.

Nad Twoim imieniem w bocznym menu widnieje lista kanałów („Booking.com", „Airbnb") ze statusem: „OK" oznacza, że dla któregoś obiektu jest wklejony link do tego portalu, a „—" że nie ma żadnego. Najpewniejsze sprawdzenie, czy połączenie naprawdę działa, to i tak kliknięcie „Synchronizacja" i komunikat, który się wtedy pojawi. To, co jest wklejone przy każdym obiekcie, zobaczysz w „Ustawienia" → „Integracje". Na telefonie ręcznej synchronizacji nie ma — uruchamiasz ją z widoku na komputerze albo czekasz na poranną automatyczną.

## Co się importuje

Każdy zajęty termin z portalu staje się wpisem typu rezerwacja z:

- datami przyjazdu i wyjazdu,
- przypisanym obiektem,
- źródłem (np. „Booking", „Airbnb"),
- nazwą z opisu wydarzenia w portalu — Booking.com czasem podaje nazwisko gościa, Airbnb zwykle wysyła tylko „Reserved"; terminy zablokowane ręcznie w portalu pojawiają się jako „Blokada (Booking)" lub „Blokada (Airbnb)".

Zaimportowane rezerwacje poznasz po oznaczeniu „iCal" w szczegółach rezerwacji.

WynajemPRO pamięta, co już zaimportował — kolejne synchronizacje nie tworzą duplikatów i nie nadpisują Twoich zmian. Możesz więc spokojnie dopisać do zaimportowanej rezerwacji kwotę, prowizję czy notatkę o gościu.

## Czego synchronizacja nie przenosi

Format iCal przenosi wyłącznie terminy. Z tego wynikają ograniczenia — po stronie portali, nie WynajemPRO:

- Kwoty: zaimportowane rezerwacje mają przychód 0 zł. Uzupełnij go, edytując wpis (pole „Przychód brutto" i „Prowizja portalu") — wtedy statystyki finansowe będą kompletne.
- Dane kontaktowe gościa: e-mail i telefon musisz przepisać z panelu portalu, jeśli ich potrzebujesz.
- Anulacje: gdy gość odwoła rezerwację w portalu, wpis w WynajemPRO nie znika sam. Usuń go ręcznie (ikona kosza w widoku „Rezerwacje").
- Wiadomości i szczegóły pobytu (uwagi, liczba osób) — pozostają w portalu. Liczbę gości możesz dopisać ręcznie w polu „Liczba gości" przy edycji rezerwacji.

## Eksport: pokaż portalom swoje rezerwacje

Żeby rezerwacje bezpośrednie (telefon, strona www) blokowały terminy w portalach:

1. Otwórz „Ustawienia" → „Integracje".
2. Przy obiekcie znajdź pole „Eksportuj kalendarz (iCal)" i kliknij „Kopiuj". Zobaczysz komunikat „Link iCal skopiowany!".
3. Wklej ten link w Booking.com (w „Synchronizacji kalendarzy" jako dodanie/import kalendarza) oraz w Airbnb („Połącz kalendarze" → „Importuj kalendarz").

Link eksportu traktuj jak hasło — każdy, kto go zna, może podejrzeć zajętość Twojego kalendarza.

## Najczęstsze pytania

**Jak często odświeżają się rezerwacje?**
W WynajemPRO: przy każdym kliknięciu „Synchronizacja" oraz automatycznie raz na dobę, wcześnie rano. W drugą stronę (import Twojego kalendarza przez portale) odświeżanie zależy od portalu i trwa zwykle od kilku do kilkunastu godzin — dlatego przy rezerwacji z ostatniej chwili warto zablokować termin w portalu ręcznie.

**Dlaczego zaimportowana rezerwacja ma 0 zł?**
Bo iCal nie przenosi cen — żaden system nie odczyta kwoty z tego formatu. Kliknij rezerwację, wybierz „Edytuj" i wpisz kwotę oraz prowizję portalu.

**Dlaczego zamiast nazwiska gościa widzę „Reserved"?**
Tak Airbnb opisuje rezerwacje w swoim kalendarzu iCal. Nazwisko możesz dopisać ręcznie, edytując wpis.

**Gość odwołał pobyt na Booking.com, a rezerwacja dalej widnieje w panelu. Czemu?**
Synchronizacja tylko dodaje nowe terminy — nie usuwa istniejących wpisów. Odwołaną rezerwację usuń ręcznie ikoną kosza.

**Kliknąłem „Synchronizacja" i widzę prośbę o dodanie linków iCal. Dlaczego?**
Taki komunikat („Najpierw dodaj linki iCal w Ustawieniach…") pojawia się, gdy w „Ustawieniach" → „Integracje" nie ma jeszcze zapisanego żadnego linku. Wklej adres z portalu i kliknij „Zapisz ustawienia", potem spróbuj ponownie.
