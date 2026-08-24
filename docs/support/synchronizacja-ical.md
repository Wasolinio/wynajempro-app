# Synchronizacja z Booking.com i Airbnb (iCal)

Dzięki synchronizacji iCal rezerwacje z portali same trafiają do WynajemPRO, a Twój kalendarz z WynajemPRO może blokować terminy w portalach. Terminy blokują się więc nawzajem — ale nie natychmiast, bo portale odświeżają importowane kalendarze co kilka godzin. Dlatego WynajemPRO robi jeszcze jedną rzecz: jako jedyne miejsce, w którym leżą rezerwacje ze wszystkich portali naraz, ostrzega Cię na pulpicie, gdy dwa terminy zaczną na siebie nachodzić.

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

- Ręcznie: na komputerze kliknij „Synchronizacja" w bocznym menu panelu (nad Twoim imieniem i nazwiskiem). Po chwili zobaczysz krótki komunikat z podsumowaniem — ile rezerwacji doszło, ile się zaktualizowało i ile zniknęło z portalu. Gdy nic się nie zmieniło, zobaczysz „Kalendarze aktualne — bez zmian".
- Automatycznie: WynajemPRO synchronizuje kalendarze co godzinę. Nie musisz nic klikać.

Nad Twoim imieniem w bocznym menu widnieje lista kanałów („Booking.com", „Airbnb") ze statusem: „OK" oznacza, że dla któregoś obiektu jest wklejony link do tego portalu, a „—" że nie ma żadnego. Najpewniejsze sprawdzenie, czy połączenie naprawdę działa, to i tak kliknięcie „Synchronizacja" i komunikat, który się wtedy pojawi. To, co jest wklejone przy każdym obiekcie, zobaczysz w „Ustawienia" → „Integracje". Na telefonie ręcznej synchronizacji nie ma — uruchamiasz ją z widoku na komputerze albo czekasz na automatyczną.

## Co się importuje

Każdy zajęty termin z portalu staje się wpisem typu rezerwacja z:

- datami przyjazdu i wyjazdu,
- przypisanym obiektem,
- źródłem (np. „Booking", „Airbnb"),
- nazwą z opisu wydarzenia w portalu — Booking.com czasem podaje nazwisko gościa, Airbnb zwykle wysyła tylko „Reserved".

Zaimportowane rezerwacje poznasz po oznaczeniu „iCal" w szczegółach rezerwacji.

WynajemPRO rozpoznaje każdą rezerwację po jej własnym identyfikatorze z portalu, nie po datach. Dzięki temu:

- kolejne synchronizacje nie tworzą duplikatów ani nie nadpisują Twoich zmian — możesz spokojnie dopisać kwotę, prowizję czy notatkę o gościu;
- gdy gość przesunie lub przedłuży pobyt, ta sama rezerwacja dostaje nowe daty, zamiast pojawić się drugi raz obok starej;
- gdy rezerwacja zniknie z portalu (zwykle znaczy to anulowanie), WynajemPRO oznacza ją i pokazuje na pulpicie — ale jej nie kasuje, bo mogą być przy niej Twoje kwoty i notatki. Decyzja należy do Ciebie.

## Czego NIE importujemy: blokad terminu

Terminy zablokowane przez Ciebie ręcznie w portalu (Airbnb pokazuje je jako „niedostępne", Booking.com jako zamknięte) nie trafiają do WynajemPRO. To świadoma decyzja, nie brak.

Powód: gospodarz korzystający z tej aplikacji ma zwykle Booking.com i Airbnb spięte kalendarzami bezpośrednio ze sobą, a WynajemPRO jest trzecim kalendarzem na wierzchu. Blokada założona w jednym portalu dociera więc do drugiego bez naszego pośrednictwa. Gdybyśmy ją dodatkowo wciągali, trafiłaby na listę przyjazdów i wygenerowała zadania w rodzaju „wyślij kod do skrytki" dla terminu, na który nikt nie przyjeżdża.

Co z tego wynika dla Ciebie: kalendarz w WynajemPRO pokaże jako wolne te terminy, które zablokowałeś w portalu. Jeśli chcesz je widzieć także tutaj — na przykład przerwę techniczną albo pobyt własny — dodaj je jako zwykłą rezerwację z kwotą 0 zł. Wtedy zablokują termin również w portalach, bo nasz kalendarz jest do nich wysyłany.

## Czego synchronizacja nie przenosi

Format iCal przenosi wyłącznie terminy. Z tego wynikają ograniczenia — po stronie portali, nie WynajemPRO:

- Kwoty: zaimportowane rezerwacje mają przychód 0 zł. Uzupełnij go, edytując wpis (pole „Przychód brutto" i „Prowizja portalu") — wtedy statystyki finansowe będą kompletne.
- Dane kontaktowe gościa: e-mail i telefon musisz przepisać z panelu portalu, jeśli ich potrzebujesz.
- Powód anulowania: portal podaje wyłącznie to, że termin zniknął z kalendarza. WynajemPRO oznaczy taką rezerwację jako zniknioną z portalu, ale nie dowie się, czy gość odwołał pobyt, czy gospodarz przesunął blokadę.
- Wiadomości i szczegóły pobytu (uwagi, skład osobowy) — pozostają w portalu. Zaimportowana rezerwacja nie ma więc żadnych danych o gościach; uzupełnisz je ręcznie przy edycji wpisu, w sekcji „Goście" (pola „Dorośli", „Dzieci" i „Zwierzęta").

## Eksport: pokaż portalom swoje rezerwacje

Żeby rezerwacje bezpośrednie (telefon, strona www) blokowały terminy w portalach:

1. Otwórz „Ustawienia" → „Integracje".
2. Przy obiekcie znajdź pole „Eksportuj kalendarz (iCal)" i kliknij „Kopiuj". Zobaczysz komunikat „Link iCal skopiowany!".
3. Wklej ten link w Booking.com (w „Synchronizacji kalendarzy" jako dodanie/import kalendarza) oraz w Airbnb („Połącz kalendarze" → „Importuj kalendarz").

Link eksportu traktuj jak hasło — każdy, kto go zna, może podejrzeć zajętość Twojego kalendarza.

## Najczęstsze pytania

**Jak często odświeżają się rezerwacje?**
W WynajemPRO: przy każdym kliknięciu „Synchronizacja" oraz automatycznie co godzinę. W drugą stronę (import Twojego kalendarza przez portale) odświeżanie zależy od portalu i trwa zwykle kilka godzin — tego opóźnienia nie da się obejść żadnym programem, bo leży ono po stronie portalu. Dlatego przy rezerwacji z ostatniej chwili warto zablokować termin w portalu ręcznie.

**Dlaczego zaimportowana rezerwacja ma 0 zł?**
Bo iCal nie przenosi cen — żaden system nie odczyta kwoty z tego formatu. Kliknij rezerwację, wybierz „Edytuj" i wpisz kwotę oraz prowizję portalu.

**Dlaczego zamiast nazwiska gościa widzę „Reserved"?**
Tak Airbnb opisuje rezerwacje w swoim kalendarzu iCal. Nazwisko możesz dopisać ręcznie, edytując wpis.

**Przy rezerwacji z portalu nie widzę komórki „Goście". Dlaczego?**
Bo iCal nie przenosi składu osobowego — z portalu przychodzi sam termin. Otwórz rezerwację, kliknij „Edytuj" i wpisz liczby w sekcji „Goście" („Dorośli", „Dzieci", „Zwierzęta"). Po zapisaniu komórka „Goście" pojawi się w szczegółach rezerwacji.

**Gość odwołał pobyt na Booking.com. Co się stanie z rezerwacją w panelu?**
Przy najbliższej synchronizacji WynajemPRO zauważy, że portal przestał ją podawać, oznaczy ją jako zniknioną z portalu i pokaże na pulpicie w sekcji do sprawdzenia. Od tej chwili nie wysyłamy już tego terminu do pozostałych portali, więc zwalnia się on w Booking.com i Airbnb. W Twoim kalendarzu rezerwacja zostaje — widoczna, z oznaczeniem „Zniknęła z portalu" — dopóki sam nie zdecydujesz, co z nią zrobić. Samej rezerwacji nie kasujemy za Ciebie — mogłaby mieć wpisaną zaliczkę, prowizję albo notatkę, których nie da się odzyskać. Jeśli anulowanie potwierdzasz, usuń ją ikoną kosza w widoku „Rezerwacje".

**Gość zmienił daty pobytu. Czy rezerwacja się zaktualizuje?**
Zależy od portalu i tego, jak zapisze zmianę. Jeśli poda ją jako tę samą rezerwację, WynajemPRO tylko poprawi daty i wszystko, co przy niej wpisałeś, zostaje. Jeśli portal potraktuje zmianę jako skasowanie starej i założenie nowej — a tak działa Airbnb przy blokadach terminów — zobaczysz dwie pozycje: starą oznaczoną „Zniknęła z portalu" i nową z właściwymi datami. Wtedy przepisz kwoty do nowej i skasuj starą. Celowo nie zgadujemy za Ciebie, że to ta sama rezerwacja: gdybyśmy się pomylili, przenieślibyśmy kwoty i nazwisko poprzedniego gościa na pobyt kogoś zupełnie innego.

**Co znaczy alarm „Termin sprzedany dwa razy" na pulpicie?**
Że dwie rezerwacje na ten sam obiekt zachodzą na te same noce — najczęściej jedna z Booking.com, druga z Airbnb. WynajemPRO nie potrafi temu zapobiec, bo portale dowiadują się o blokadzie z kilkugodzinnym opóźnieniem, ale potrafi to wychwycić. Alarm liczy się przy każdym otwarciu pulpitu — nie wysyłamy powiadomień na telefon ani mailem, więc trzeba zajrzeć do panelu. Kliknij którąkolwiek z wymienionych rezerwacji, żeby otworzyć jej szczegóły. Wyjazd i przyjazd tego samego dnia to nie kolizja — alarm liczy noce, nie dni.

**Kliknąłem „Synchronizacja" i widzę prośbę o dodanie linków iCal. Dlaczego?**
Taki komunikat („Najpierw dodaj linki iCal w Ustawieniach…") pojawia się, gdy w „Ustawieniach" → „Integracje" nie ma jeszcze zapisanego żadnego linku. Wklej adres z portalu i kliknij „Zapisz ustawienia", potem spróbuj ponownie.
