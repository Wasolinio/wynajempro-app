# Kontrola liczb — mockup vs silnik

Data: 2026-08-24. Sprawdzone przez uruchomienie `podsumowaniePodatkowe()` na danych
odtwarzających przykład z projektu (przychód 84 600 zł, ryczałt, 8 miesięcy, bez VAT,
bez społecznych, prowizje 9 460 zł, media 5 620 zł).

## Wynik

| Pozycja | Silnik (`taxSummary.js`) | Mockup | Zgodność |
|---|---:|---:|---|
| Przychód | 84 600,00 | 84 600,00 | tak |
| Zdrowotna miesięcznie | **830,58** | **769,43** | **nie** |
| Zdrowotna narastająco (× 8) | 6 644,64 | 6 155,44 | nie |
| Podstawa | 81 277,68 | 81 524,00 | nie |
| Podatek 8,5% | 6 908,60 | 6 929,54 | nie |
| Łącznie do zapłaty | 13 553,24 | 13 082 / 13 084,98 | nie |
| Procent progu | 84,6% | 84,6% | tak |

README projektu zastrzega, że liczby w prototypie są zmyślone, więc same rozbieżności
nie są błędem projektu. Wynikają z nich jednak trzy rzeczy do rozstrzygnięcia w kodzie.

## 1. Hero i rachunek zaokrąglają inaczej

Mockup pokazuje w kwocie głównej **13 082 zł**, a w rachunku **13 084,98 zł**. Różnica bierze
się stąd, że hero zaokrągla składniki, a potem je sumuje (6 930 + 6 152), rachunek zaś sumuje,
a potem zaokrągla. Gospodarz zobaczy dwie różne kwoty tej samej rzeczy na dwóch zakładkach
tego samego panelu — dokładnie ten rodzaj rozjazdu, przed którym panel ma ostrzegać.

**Do wdrożenia:** jedna liczba źródłowa (`lacznieDoZaplaty`), zaokrąglana wyłącznie przy
wyświetlaniu. Suma nigdy nie jest liczona z zaokrąglonych składników.

Skutek uboczny w mockupie: „Zostaje Ci 56 438 zł" policzono od 13 082. Po naprawie
zaokrąglania ta kwota też się zmieni.

## 2. Etykieta progu zdrowotnej myli widełki

Mockup: `Zdrowotna — próg do 300 000 zł · 769,43 × 8`.

Progi w `constants.js` to: do 60 000 zł, 60 000–300 000 zł, powyżej 300 000 zł. Gospodarz
z przychodem 84 600 zł jest w środkowych widełkach, a etykieta „próg do 300 000 zł" czyta
się jak pierwszy próg. Formuła powinna nazywać widełki od–do, a nie samą górną granicę.
Ostateczne brzmienie po analizie legala.

## 3. Rozbicie po dwóch stawkach nie zgodzi się z silnikiem

RYS. 7 pokazuje `Do progu · 8,5% od 100 000 zł` i `Nadwyżka · 12,5% od 8 200 zł`.

Silnik dzieli po stawkach **podstawę** (przychód pomniejszony o 50% zdrowotnej), a nie surowy
przychód — patrz `podatekDochodowy()`. Przy przekroczonym progu „8,5% od 100 000 zł" będzie
więc nieprawdą: podstawa jest niższa od przychodu, a podział przebiega w innym miejscu.

**Do wdrożenia:** albo etykiety liczą się z faktycznego podziału podstawy, albo rozbicie
pokazujemy bez kwot bazowych. Nie wolno wpisać „od 100 000 zł" na sztywno.

## Co się zgadza

Arytmetyka wewnątrz mockupu jest spójna: 84 600 − 3 076 = 81 524, 8,5% z 81 524 = 6 929,54,
próg 84,6%, nadwyżka 8 200 zł przy 108 200 zł przychodu, skala 12% od 69 520 − 30 000 = 4 742,40.
Projektant liczył, a nie wpisywał liczb na oko — rozjazd dotyczy wyłącznie stawki zdrowotnej
i sposobu zaokrąglania.
