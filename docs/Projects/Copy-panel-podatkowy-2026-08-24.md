# Copy panelu podatkowego (X25) — teksty finalne

**Data:** 2026-08-24 · **Autor:** agent `marketing` · **Status:** do wdrożenia po akceptacji właściciela i legala

Źródła: `docs/Projects/Brief-panel-podatkowy-2026-08-24.md`, `docs/Projects/handoff-panel-podatkowy/README-projekt.md`,
`docs/Projects/handoff-panel-podatkowy/copy-z-projektu.txt`, `docs/legal/Analiza-panel-podatkowy-2026-08-24.md`,
`docs/Projects/handoff-panel-podatkowy/Kontrola-liczb-2026-08-24.md`, `src/utils/taxSummary.js`, `src/utils/constants.js`.

---

## Jak czytać ten dokument

**Teksty są finalne.** Kolumna „Tekst" to dokładnie to, co ma trafić do JSX-a. Nic tu nie jest szkicem
do przeredagowania przy wdrożeniu — jeśli coś nie mieści się w układzie, wróć z tym do mnie zamiast skracać
samodzielnie. Kilka zdań jest prawnie nośnych i skrócenie ich kosztuje więcej niż złamany wiersz.

**Znaczniki przy tekstach:**

| Znacznik | Co znaczy |
|---|---|
| `[L]` | tekst pochodzi z analizy prawnej (§5 albo §7) i niesie twierdzenie, którego nie wolno usunąć ani osłabić |
| `[ZMIANA]` | odchodzę od dosłownego brzmienia legala; pozycja jest opisana na liście „Zmiany do akceptacji legala" |
| `[KOD]` | tekst zakłada zmianę w kodzie, której jeszcze nie ma (patrz kolumna „Warunek") |

**Placeholdery** `{nazwaPola}` to pola z `podsumowaniePodatkowe()` w `src/utils/taxSummary.js`
(`rok`, `rokStawek`, `stawkiAktualne`, `forma`, `brutto`, `vatNalezny`, `przychod`, `prowizje`, `media`,
`podstawa`, `podatek`, `zdrowotnaMies`, `zdrowotnaRok`, `spoleczneRok`, `miesiecy`, `lacznieDoZaplaty`,
`prog`, `doProgu`, `procentProgu`, `progPrzekroczony`, `rozjazd`, `liczbaRezerwacji`) oraz z ustawień
(`taxForm`, `rentalBasis`, `autoThreshold`, `rate`, `isVatPayer`, `zusHealth`, `zusSocial`, `taxFreeAmount`,
`includeZusInCosts`, `taxView`). **Żadnej z tych liczb nie wpisujemy w tekst na sztywno** — przykłady z mockupu
(769,43 zł, 6 155,44 zł) są z 2025 roku i są nieprawdziwe.

**Zaokrąglanie.** W trybie „Podsumowanie" kwoty bez groszy, w „Szczegółach" dwa miejsca po przecinku.
Suma nigdy nie powstaje z zaokrąglonych składników — jedno źródło (`lacznieDoZaplaty`), zaokrąglane wyłącznie
przy wyświetlaniu (`Kontrola-liczb-2026-08-24.md` §1).

**Zer nie pokazujemy.** Gdy wartość wynosi 0, wiersz albo znika, albo ma tekst opisowy. Zero w polu podatku
to zdanie „nie masz podatku", a tego nie twierdzimy.

**Odmiana liczebników** — implementacja musi ją obsłużyć, inaczej wyjdzie „2 rezerwacji":

- `rezerwacja`: 1 → rezerwacja · 2–4, 22–24, 32–34… → rezerwacje · reszta → rezerwacji
- `miesiąc`: 1 → miesiąc · 2–4 → miesiące · 5–21 → miesięcy (12 → miesięcy)
- w etykietach mono i w wierszach rachunku używamy skrótu `mies.`, który omija problem

**Czego w tym panelu nie piszemy nigdy** (lista kontrolna do code review):

- „rozliczamy", „rozliczenie", „rozliczony" o gospodarzu i o tym, co robi aplikacja. Aplikacja pokazuje,
  ile odłożyć, i przygotowuje materiał dla księgowej. W panelu i w artykule Pomocy tego słowa nie ma ani razu.
  Zostaje w dwóch miejscach, które opisują cudzy obowiązek, a nie usługę aplikacji: w nazwie procedury ZUS
  („roczne rozliczenie składki zdrowotnej", 2.2) i w tekście Regulaminu od legala.
- „wiążąca" o jakiejkolwiek kwocie z aplikacji (analiza §B4).
- podpowiedzi cenowych i wszystkiego, co brzmi jak „warto to wiedzieć, ustalając ceny" (§B5).
- „płatnik VAT" — poprawnie „czynny podatnik VAT" (§P1).
- „policzy się sam", „automatycznie rozliczysz" i innych obietnic automatu (§P10).
- zdań w rodzaju męskim skierowanych do gospodarza („zapłaciłeś", „podałeś", „sam"). Wzorce zastępcze
  są w sekcji „Wyjątki rodzajowe" na końcu.
- emoji. Markery to ikony lucide.

---

## 1. Tryb „Podsumowanie"

### 1.1 Pasek narzędzi panelu

| Miejsce | Tekst | Limit |
|---|---|---|
| Przełącznik, lewa strona | patrz sekcja 3 | — |
| Prawa strona, mono 11 px | `{liczbaRezerwacji} rezerwacji · stawki {rokStawek}` | jeden wiersz, ≤ 34 znaki |

Na 375 px pasek zawija się: przełącznik pełnej szerokości, licznik pod nim, wyrównany do lewej.

### 1.2 Hero — kwota główna

| Miejsce | Tekst |
|---|---|
| Etykieta mono 11 px uppercase | `DO ODŁOŻENIA ZA {rok}` |
| Kwota | `{lacznieDoZaplaty}` + sufiks `zł` |
| Etykieta przy starych stawkach | `SZACUNEK WSTĘPNY ZA {rok}` `[L]` — patrz 4.2 |

**Zdanie pod kwotą.** 15 px/1.6, `max-width: 380px` — budżet ok. 50 znaków w wierszu, cel: **do 170 znaków**
(trzy wiersze). Wariant wybiera się po tym, co faktycznie wchodzi do `lacznieDoZaplaty`:

| Warunek | Tekst |
|---|---|
| podatek + zdrowotna, rok bieżący | `[L]` `[ZMIANA]` Podatek i składka zdrowotna za {miesiecy} miesięcy {rok}, z tym miesiącem włącznie. Nie odejmujemy zapłaconych już zaliczek ani składek — to obciążenie za cały ten okres. |
| podatek + zdrowotna + społeczne | `[L]` `[ZMIANA]` Podatek i składki za {miesiecy} miesięcy {rok}, z tym miesiącem włącznie. Nie odejmujemy zapłaconych już zaliczek ani składek — to obciążenie za cały ten okres. |
| rok miniony (`miesiecy === 12`) | `[L]` `[ZMIANA]` Podatek i składki za cały {rok}. Nie odejmujemy zapłaconych już zaliczek ani składek — to suma obciążeń za ten rok. |
| najem prywatny (bez zdrowotnej) | `[L]` `[ZMIANA]` `[KOD]` Podatek za {miesiecy} miesięcy {rok}, z tym miesiącem włącznie. Nie odejmujemy zapłaconych już zaliczek — to obciążenie za cały ten okres. |
| `rentalBasis === null` | `[L]` `[ZMIANA]` `[KOD]` Podatek za {miesiecy} miesięcy {rok}, liczony narastająco, bez odjęcia zapłaconych już zaliczek. Składki zdrowotnej nie doliczamy, dopóki nie wiemy, czy wynajmujesz w ramach działalności. |

Warunek `[KOD]`: pole `rentalBasis` w ustawieniach i warunek na zdrowotną w `taxSummary.js` (analiza §B1).

**Wersja 375 px** (13 px/1.55, jedno zdanie w projekcie — tu dwa krótkie, bo twierdzenie o zaliczkach jest blokerem):

> Podatek {podatek} zł i zdrowotna {zdrowotnaRok} zł za {miesiecy} mies., liczone narastająco. Nie odejmujemy zapłaconych już zaliczek ani składek. `[L]` `[ZMIANA]`

### 1.3 Hero — wiersze rozbicia (prawa kolumna)

Klucz 13.5 px, wartość mono 14 px. Klucz ma ok. 30–34 znaków w wierszu.

| Warunek | Klucz | Wartość |
|---|---|---|
| ryczałt, `autoThreshold`, przed progiem | Podatek ryczałtowy 8,5% | `{podatek}` |
| ryczałt, `autoThreshold`, po progu | Podatek ryczałtowy 8,5% i 12,5% | `{podatek}` |
| ryczałt, `autoThreshold === false` | Podatek ryczałtowy {rate}% | `{podatek}` |
| zdrowotna liczona (działalność) | Zdrowotna {zdrowotnaMies} zł × {miesiecy} mies. `[L]` | `{zdrowotnaRok}` |
| najem prywatny `[KOD]` | Zdrowotna · najem prywatny | mono uppercase: nie doliczamy |
| `spoleczneRok === 0` | Składki społeczne | mono uppercase: nie masz ich w ustawieniach `[L]` |
| `spoleczneRok > 0` | Składki społeczne {zusSocial} zł × {miesiecy} mies. | `{spoleczneRok}` |

Wiersz „Składki społeczne — nie masz ich w ustawieniach" zostaje dosłownie (analiza §P12: mówi tylko o tym,
czego aplikacja nie wie, i nie twierdzi, że gospodarz nie ma obowiązku). **Nigdy „0 zł".**

Przy `rentalBasis === null` nie ma ani wiersza zdrowotnej, ani odliczenia — zamiast nich karta z 4.5.

### 1.4 Karta progu — przed przekroczeniem

| Miejsce | Tekst | Limit |
|---|---|---|
| Nagłówek mono 10 px uppercase | `PRÓG RYCZAŁTU · {prog} ZŁ` | jeden wiersz |
| Prawa strona, mono 11 px | `{procentProgu}% progu` | — |
| Zdanie główne 27 px/700 | Zostało **{doProgu} zł** przychodu | dwa wiersze maks. |
| Skala pod paskiem, mono 10 px | `0` · `50 000` · `100 000 zł` | — |
| Akapit 13.5 px | Do {prog} zł stawka wynosi 8,5%, od nadwyżki — 12,5%. `[L]` | jeden wiersz |
| Pod paskiem, mono 10 px | Liczymy tylko przychód z rezerwacji w tej aplikacji. `[L]` | jeden wiersz |

Zdania o sezonie i o ustalaniu cen nie wracają w żadnej postaci (§B5).

### 1.5 Karta progu — po przekroczeniu

| Miejsce | Tekst |
|---|---|
| Zdanie główne 27 px/700 | Powyżej progu o **{nadwyzka} zł** |
| Podpis pod pierwszym blokiem paska, mono 10 px | `{prog} zł` |
| Podpis pod drugim blokiem, mono 10 px, cynober | nadwyżka |
| Akapit 13.5 px | Od nadwyżki ponad {prog} zł stawka wynosi 12,5% zamiast 8,5%. Każde kolejne 1 000 zł przychodu to 125 zł podatku zamiast 85 zł. `[L]` `[ZMIANA]` |
| Pod paskiem, mono 10 px | Liczymy tylko przychód z rezerwacji w tej aplikacji. `[L]` |

`{nadwyzka}` = `przychod − prog`. Kwoty 125 zł i 85 zł liczymy z `STAWKI_PODATKOWE.ryczaltNajem`
(1 000 × stawka), nie wpisujemy ich jako tekst.

Kartę progu renderujemy tylko przy `forma === 'lump_sum' && autoThreshold` (§P8). Gdy `autoThreshold === false`,
karta znika w całości — pasek nie może opowiadać o progu, którego rachunek obok nie stosuje.

### 1.6 Karta „Przychód i co go zjadło"

| Miejsce | Tekst |
|---|---|
| Tytuł karty | Przychód i co go zjadło |
| Wiersz 1 | Przychód brutto → `{brutto}` |
| Wiersz 2, tylko gdy `vatNalezny > 0` | VAT należny 8% → `{vatNalezny}` |
| Wiersz 3 | Prowizje portali → `{prowizje}` |
| Wiersz 4 | Media i eksploatacja → `{media}` |
| Nota bursztynowa, 12.5 px | Przy ryczałcie płacisz od przychodu — prowizje i media nie obniżają podatku. Pokazujemy je, żeby było widać, ile zjadły. `[L]` `[ZMIANA]` |
| Etykieta wyniku, mono 10 px uppercase | `WYNIK PO PROWIZJACH, MEDIACH I PODATKU` `[ZMIANA]` |
| Pod etykietą, mono 10 px | przychód minus prowizje, media i odłożone podatki `[ZMIANA]` |
| Pod etykietą, mono 10 px, gdy `vatNalezny > 0` | przychód minus VAT, prowizje, media i odłożone podatki |
| Wartość 26 px/800, zieleń | `{przychod − prowizje − media − lacznieDoZaplaty}` |

Wiersze prowizji i mediów **bez znaków minus**. Nazwanie wzoru pod etykietą jest zabezpieczeniem, nie ozdobą:
bez niego kolumna z kreską sumującą czyta się jak rachunek podatkowy z odejmowaniem (§P4, brief §6).

### 1.7 Warianty na 375 px

Projekt skraca treść, nie usuwa twierdzeń. Zdania oznaczone `[L]` zostają w każdej szerokości — skraca się
to, co jest wyjaśnieniem, nigdy to, co jest zastrzeżeniem.

| Miejsce | Tekst na 375 px |
|---|---|
| Hero, zdanie pod kwotą | wersja z 1.2 (dwa krótkie zdania) |
| Hero, wiersze rozbicia | **nie renderujemy ich wcale** — kwoty podatku i zdrowotnej niesie zdanie pod kwotą |
| Karta progu, nagłówek mono | `PRÓG {prog} ZŁ` |
| Karta progu, procent | `{procentProgu}%` |
| Karta progu, zdanie główne 19 px/700 | Zostało **{doProgu} zł** |
| Karta progu, akapit | Do {prog} zł stawka wynosi 8,5%, powyżej — 12,5%. `[L]` `[ZMIANA]` |
| Karta progu po przekroczeniu, zdanie główne | Powyżej progu o **{nadwyzka} zł** |
| Karta progu po przekroczeniu, akapit | Od nadwyżki płacisz 12,5% zamiast 8,5%. `[L]` `[ZMIANA]` |
| Karta progu, mono pod paskiem | Liczymy tylko przychód z rezerwacji w tej aplikacji. `[L]` |
| Nota bursztynowa | Przy ryczałcie prowizje i media nie obniżają podatku. `[ZMIANA]` |
| Zastrzeżenie | wersja z 5.2 |

Wiersza wyniku („WYNIK PO PROWIZJACH…") mockup na 375 px nie pokazuje. Jeśli projektant go zostawi,
etykieta zostaje bez zmian i zawija się na dwa wiersze — skracanie jej odbiera sumie nazwany wzór,
czyli dokładnie to, po co ona tam jest.

### 1.8 Stopka

Patrz sekcja 5.

---

## 2. Tryb „Szczegóły dla księgowego"

### 2.1 Pasek czterech komórek KPI

Etykieta mono 10 px uppercase, wartość 24 px/800. Czwarta komórka na atramencie.

| Kolejność | Etykieta | Wartość |
|---|---|---|
| 1 | `PRZYCHÓD` | `{przychod}` |
| 2 | `PODSTAWA` | `{podstawa}` |
| 3 | `PODATEK` | `{podatek}` |
| 4 | `DO ODŁOŻENIA` `[ZMIANA]` | `{lacznieDoZaplaty}` |

Na 375 px zostają dwie komórki: `PODSTAWA` i `DO ODŁOŻENIA`.

### 2.2 Rachunek roku — ryczałt

Nagłówek sekcji: **Rachunek roku {rok}**. Wartości mono 14 px, dwa miejsca po przecinku, do prawej.

| Warunek | Klucz | Wartość |
|---|---|---|
| zawsze | Przychód brutto z {liczbaRezerwacji} rezerwacji | `{brutto}` |
| `vatNalezny > 0` | VAT należny 8% (usługi zakwaterowania) `[L]` | `− {vatNalezny}` |
| `vatNalezny > 0` | Przychód po VAT | `{przychod}` |
| `rentalBasis === 'business'` `[KOD]` | Odliczenie 50% zapłaconej składki zdrowotnej `[L]` | `− {odliczenie}` |
| ↳ wiersz podrzędny mono 10 px | art. 11 ust. 1a ustawy o ryczałcie · zakładamy, że składka za ten okres jest zapłacona `[ZMIANA]` | — |
| zawsze (klucz 600) | Podstawa opodatkowania | `{podstawa}` |
| `autoThreshold`, przed progiem | Ryczałt 8,5% od podstawy | `{podatek}` |
| `autoThreshold`, po progu | Ryczałt 8,5% i 12,5% od podstawy | `{podatek}` |
| `autoThreshold === false` | Ryczałt {rate}% od podstawy, bez progu `[L]` | `{podatek}` |
| zdrowotna liczona | Składka zdrowotna za {miesiecy} mies. · przychód {widelkiOd}–{widelkiDo} zł · {zdrowotnaMies} zł/mies. `[L]` `[ZMIANA]` | `{zdrowotnaRok}` |
| ↳ wiersz podrzędny mono 10 px | Próg ustala się narastająco — różnicę dopłaca się w rocznym rozliczeniu składki. `[L]` | — |
| najem prywatny `[KOD]` | Składka zdrowotna · najem prywatny | mono: nie doliczamy |
| `spoleczneRok === 0` | Składki społeczne — nie masz ich w ustawieniach `[L]` | mono: `POMIJAMY` |
| `spoleczneRok > 0` | Składki społeczne · {zusSocial} zł × {miesiecy} mies. | `{spoleczneRok}` |
| wiersz sumy (klucz 14 px/700) | Podatek i składki razem `[ZMIANA]` | `{lacznieDoZaplaty}` mono 17 px/700 |
| pod sumą, mono 10 px | Kwoty przed zaokrągleniem do pełnych złotych. `[L]` | — |

Widełki zdrowotnej biorą się z `STAWKI_PODATKOWE.zdrowotnaRyczalt.progi`, nie z tekstu. Trzy warianty klucza:

- pierwszy próg: `Składka zdrowotna za {miesiecy} mies. · przychód do 60 000 zł · {zdrowotnaMies} zł/mies.`
- środkowy: `Składka zdrowotna za {miesiecy} mies. · przychód 60 000–300 000 zł · {zdrowotnaMies} zł/mies.`
- najwyższy: `Składka zdrowotna za {miesiecy} mies. · przychód powyżej 300 000 zł · {zdrowotnaMies} zł/mies.`

Etykieta „próg do 300 000 zł" z mockupu nie wraca — myli widełki z progiem (§B6).

„Roczne rozliczenie składki" w wierszu podrzędnym to nazwa procedury ZUS, nie opis tego, co robi aplikacja
z podatkiem gospodarza. Jedyne miejsce w panelu, gdzie to słowo zostaje.

### 2.3 Karta „Do rozmowy z księgową"

Tytuł: **Do rozmowy z księgową**. Siatka klucz–wartość, `gap: 10px 16px`.

| Warunek | Klucz | Wartość |
|---|---|---|
| `[KOD]` | Podstawa wynajmu | najem prywatny · działalność gospodarcza |
| `autoThreshold` | Forma opodatkowania | Ryczałt 8,5% / 12,5% od nadwyżki |
| `autoThreshold === false` | Forma opodatkowania | Ryczałt, stała stawka {rate}% `[L]` |
| `autoThreshold` | Próg | {prog} zł |
| `autoThreshold === false` | Próg | mono: nie stosujemy `[L]` |
| `vatNalezny > 0` | VAT należny 8% | `{vatNalezny}` zł |
| zawsze | Rok stawek | `{rokStawek}` |
| zawsze | Miesięcy w wyliczeniu | {miesiecy} z 12 |

Wiersza VAT nie ma, gdy `vatNalezny === 0` — pokazywanie go komuś, kto nie jest czynnym podatnikiem VAT,
to sugerowanie stawki bez podstawy (§P1).

### 2.4 Karta „Prowizje i media"

| Miejsce | Tekst |
|---|---|
| Tytuł | Prowizje i media · poza rachunkiem ryczałtu |
| Wiersz 1 | Prowizje portali → `{prowizje}` |
| Wiersz 2 | Media i eksploatacja → `{media}` |
| Akapit 12.5 px | Nie wchodzą do podstawy — ryczałt liczy się od przychodu. Trzymamy je osobno, żeby rachunek powyżej się zgadzał. |

### 2.5 Rozkład miesięczny

| Miejsce | Tekst |
|---|---|
| Nagłówek panelu, mono 10 px uppercase | `ROZKŁAD MIESIĘCZNY · {rok}` |
| Prawa strona nagłówka, mono 10 px | miesiące bez ruchu pominięte |
| Nagłówki kolumn | Miesiąc · Rezerwacje · Brutto · Przychód · Prowizje · Media |
| Wiersz sumy | Razem |
| 375 px: nagłówek kolumn | Miesiąc · Brutto · Prowizje · Media |
| 375 px: podpowiedź, mono 9.5 px | przewiń w poziomie → |

Uwaga do wdrożenia (nie copy): gdy `vatNalezny === 0`, kolumny „Brutto" i „Przychód" mają identyczne wartości
we wszystkich wierszach. Warto wtedy zostawić jedną, podpisaną `Przychód` — dwie takie same kolumny obok siebie
w materiale dla księgowej wyglądają jak błąd. Decyzja projektanta.

---

## 3. Przełącznik trybów

### 3.1 W panelu

| Miejsce | Tekst |
|---|---|
| Przycisk 1 | Podsumowanie |
| Przycisk 2 | Szczegóły dla księgowego |
| Przycisk 2 na ≤ 600 px | Szczegóły |

### 3.2 Ustawienia konta → Podatki

| Miejsce | Tekst |
|---|---|
| Tytuł karty | Widok podatków |
| Podtytuł 12.5 px | Domyślnie wynika z Twojej formy opodatkowania. Możesz to zmienić na stałe. |
| Opcja 1, tytuł 14 px/600 | Podsumowanie |
| Opcja 1, opis 12.5 px | Jedna liczba: ile odłożyć. |
| Opcja 2, tytuł | Szczegóły dla księgowego |
| Opcja 2, opis | Rozbicie kwot i rozkład miesięczny. |
| Stopka karty, mono 10 px | Domyślnie: ryczałt → Podsumowanie, zasady ogólne → Szczegóły `[ZMIANA]` |

Z opisu domyślnych trybów znikają działalność nierejestrowana i podatek liniowy — obu form nie ma
w tej turze (analiza §B2, §B3), a `domyslnyTryb()` ma je stracić razem z resztą.

---

## 4. Stany wyjątkowe

### 4.1 Rok bez rezerwacji (`liczbaRezerwacji === 0`)

| Miejsce | Tekst |
|---|---|
| Nagłówek 22 px/700 | Za {rok} nie ma jeszcze żadnej rezerwacji |
| Akapit 14.5 px, `max-width: 440px` | Wyliczenie pojawi się, gdy dodasz pierwszą rezerwację albo podłączysz kalendarz Airbnb lub Booking. `[L]` |
| Przycisk primary | Dodaj rezerwację |
| Przycisk ghost | Podłącz kalendarz |
| Podpowiedź mono 11 px, tylko gdy poprzedni rok ma rezerwacje | Za {rok − 1} masz rezerwacje — przełącz rok nad zakładkami `[ZMIANA]` |

„Podatek policzy się sam" nie wraca (§P10). Zer, KPI ani pustej tabeli w tym stanie nie pokazujemy.

### 4.2 Stawki z innego roku

Dwa różne przypadki, dwa różne teksty. Oba w alercie wysokiej wagi (cynober), nad kwotą.

**A. `stawkiAktualne === false`** — gospodarz ogląda rok, dla którego nie znamy jeszcze stawek:

| Miejsce | Tekst |
|---|---|
| Tytuł alertu 14.5 px/700 | Rok {rok} liczymy stawkami z {rokStawek} `[ZMIANA]` |
| Treść 13.5 px/1.6 | Kwoty podatku i składek zmieniają się co roku. Dopóki nie poznamy stawek na {rok}, nie opieraj na tych liczbach decyzji o tym, ile odłożyć — zaktualizujemy je, gdy stawki wejdą w życie. `[L]` |
| Etykieta kwoty głównej | `SZACUNEK WSTĘPNY ZA {rok}` `[L]` |
| Znacznik w hero, mono 10.5 px uppercase, cynober | `STAWKI {rokStawek}` |

Kwota zostaje w pełnej wielkości — nie wyszarzamy jej. Obietnicę bierze na siebie zmieniona etykieta (§P5).

**B. `new Date().getFullYear() > rokStawek`** `[KOD]` — stawki w aplikacji są przeterminowane, niezależnie
od wybranego roku (§P6, luka „jest luty 2027 i nikt nie zaktualizował `constants.js`"):

| Miejsce | Tekst |
|---|---|
| Tytuł alertu | Stawki w aplikacji są z {rokStawek} |
| Treść | Nie zaktualizowaliśmy ich jeszcze na {biezacyRok}. Zanim odłożysz pieniądze według tych kwot, potwierdź je z księgową. `[ZMIANA]` |

Gdy oba warunki wypadną razem, pokazujemy wariant B — jest szerszy.

### 4.3 Rozjazd kwot (`rozjazd !== null`)

Alert uwagi (bursztyn), pod nim dwie karty.

| Miejsce | Tekst |
|---|---|
| Tytuł alertu | Dwie różne kwoty podatku za {rok} |
| Treść alertu | Przy {rozjazd.rezerwacji} rezerwacjach zapisano podatek policzony innymi ustawieniami. Przyczyny bywają różne: zmiana formy opodatkowania w trakcie roku albo kwoty wpisane ręcznie przy starszych rezerwacjach. `[L]` |
| Karta 1, tag mono 10 px/600 | `W PANELU` `[L]` |
| Karta 1, tytuł | Z bieżących ustawień |
| Karta 1, kwota 34 px/800 | `{rozjazd.wyliczony}` |
| Karta 1, opis 13 px | Liczymy raz, od całego roku — tę kwotę pokazujemy w panelu. `[L]` |
| Karta 2, tytuł | Zapisane przy rezerwacjach |
| Karta 2, kwota 34 px/800, `--faint` | `{rozjazd.zapisany}` |
| Karta 2, opis 13 px | Suma z {rozjazd.rezerwacji} rezerwacji, w tym starszych. Różnica: {roznica} zł. |
| Stopka, zdanie 13 px | Stare rezerwacje możesz przeliczyć bieżącymi ustawieniami — kwoty przy nich się wtedy zgodzą. |
| Stopka, link-akcja 600 | Przelicz {rozjazd.rezerwacji} rezerwacji → |

`{roznica}` = `Math.abs(rozjazd.wyliczony − rozjazd.zapisany)`. Tag `WIĄŻĄCA` nie wraca w żadnym miejscu
aplikacji (§B4).

### 4.4 Próg przekroczony

Karta progu — patrz 1.5. Obok karta rozbicia:

| Miejsce | Tekst |
|---|---|
| Tytuł karty | Podatek po dwóch stawkach |
| Wiersz 1 | Stawka do progu · 8,5% od {pasmoDoProgu} zł `[KOD]` |
| Wiersz 2 (wartość w cynobrze) | Nadwyżka · 12,5% od {pasmoNadwyzki} zł `[KOD]` |
| Wiersz sumy 17 px/700 | Podatek za rok → `{podatek}` |
| Pod wierszami, mono 10 px, gdy `podstawa < przychod` | Pasma liczymy od podstawy, czyli po odliczeniu składki zdrowotnej — dlatego pierwsze z nich nie równa się dokładnie {prog} zł. |

`[KOD]`: `{pasmoDoProgu}` i `{pasmoNadwyzki}` muszą pochodzić z faktycznego podziału `podstawa` w
`podatekDochodowy()`, a nie ze stałej `prog` (§P3, `Kontrola-liczb` §3). **Wartości „od 100 000 zł"
nie wolno wpisać na sztywno.** Dopóki dev tego nie policzy, kartę pokazujemy bez kwot bazowych:
wiersze „Stawka do progu · 8,5%" i „Nadwyżka · 12,5%" z samymi kwotami podatku po prawej.

### 4.5 Podstawa wynajmu nieuzupełniona (`rentalBasis === null`) `[KOD]`

Nie ma tego stanu w projekcie graficznym, a wynika wprost z §B1 pkt 4: dopóki nie wiemy, czy najem jest
prywatny, czy w działalności, nie pokazujemy wiersza zdrowotnej ani odliczenia — pokazujemy pytanie.
Miejsce: karta w rzędzie dwóch kart, w miejscu karty progu albo pod hero. Do rozstrzygnięcia z projektantem.

| Miejsce | Tekst |
|---|---|
| Tytuł karty 17 px/700 | Zanim doliczymy składkę zdrowotną |
| Akapit 13.5 px | Przy ryczałcie składka zdrowotna zależy od tego, czy wynajmujesz w ramach działalności gospodarczej, czy poza nią. Nie wiemy tego o Tobie, więc kwota powyżej jest bez niej. |
| Link-akcja 600 | Uzupełnij w ustawieniach → |

---

## 5. Zastrzeżenie prawne

Jedno miejsce w panelu, na końcu, oba tryby. Nie powtarzamy go przy liczbach.

### 5.1 Desktop — stopka `.wpd-note`

Lewa strona, 13 px/1.6, `max-width: 640px`:

> Szacunek policzony z Twoich danych i z ustawień podatkowych konta — nie jest deklaracją, wyliczeniem
> podatku ani poradą podatkową. Kwoty potwierdź z księgową, zanim zapłacisz podatek albo złożysz deklarację.
> `[L]` `[ZMIANA]`

Prawa strona, mono 10 px uppercase:

> `STAWKI {rokStawek} · ZWERYFIKOWANE {STAWKI_PODATKOWE.zweryfikowano}` `[L]` `[KOD]`

Osobny link obok, mono 10 px uppercase: `JAK LICZYMY →` (prowadzi do artykułu z 5.3).
Poniżej 900 px link schodzi do własnego wiersza pod znacznikiem stawek.

`[KOD]`: pola `zweryfikowano` **nie ma dziś w `STAWKI_PODATKOWE`**. Dopóki go nie ma, w stopce stoi samo
`STAWKI {rokStawek}`. Data renderu („WYLICZONE 24.08.2026") nie wraca — sugeruje świeżość, której nie ma (§P6).

### 5.2 375 px — bez ramki, na końcu, 12 px/1.6

> Szacunek z Twoich danych i ustawień — nie deklaracja ani porada. Kwoty potwierdź z księgową przed zapłatą. `[L]`

### 5.3 Wariant rozszerzony — Centrum pomocy

Nowy artykuł `docs/support/jak-liczymy-podatki.md` → `/pomoc/jak-liczymy-podatki` (`npm run help:build`).
Alternatywnie sekcja w `finanse-i-raporty.md`; osobny artykuł jest lepszy, bo stopka panelu linkuje wprost
do niego. Treść gotowa do wklejenia:

---

# Jak liczymy podatki w WynajemPRO

Panel podatkowy to kalkulator pomocniczy. Pokazuje szacunek tego, ile odłożyć na podatek i składki,
żeby nie zabrakło. Nie jest deklaracją podatkową, wyliczeniem podatku w rozumieniu przepisów podatkowych
ani poradą podatkową — WynajemPRO nie świadczy doradztwa podatkowego ani usług księgowych. `[L]`

## Co bierzemy pod uwagę

Rezerwacje, prowizje portali i koszty eksploatacyjne wprowadzone do aplikacji. Do tego ustawienia podatkowe
Twojego konta: podstawę wynajmu, formę opodatkowania, status VAT, kwotę wolną i składki podane w ustawieniach.
Stawki, progi i kwoty składek pochodzą z przepisów obowiązujących w roku, który pokazujemy w stopce panelu,
razem z datą ostatniej weryfikacji. `[L]` `[ZMIANA]`

## Czego nie bierzemy pod uwagę

Przychodów i kosztów spoza aplikacji. Ulg i odliczeń poza wskazanymi w rachunku. Wspólnego opodatkowania
małżonków. Zaliczek i składek już zapłaconych — kwota główna to obciążenie narastające za cały okres,
a nie kwota pozostała do zapłaty. Zaokrągleń do pełnych złotych, które wynikają z przepisów podatkowych. `[L]` `[ZMIANA]`

## Co rozstrzygasz samodzielnie

Czy wynajmujesz w ramach działalności gospodarczej, czy poza nią — od tego zależy, czy w ogóle płacisz
składkę zdrowotną. Jaką masz formę opodatkowania. Czy kwotę wolną uwzględnia już Twój pracodawca. Aplikacja
przyjmuje Twoje ustawienia bez ich sprawdzania i liczy zgodnie z nimi, także wtedy, gdy są nieprawidłowe. `[L]` `[ZMIANA]`

## Kto odpowiada za podatek

Za prawidłowe wykonanie zobowiązań podatkowych i składkowych odpowiadasz Ty. Zanim zapłacisz podatek
albo złożysz deklarację, potwierdź kwoty z księgową albo doradcą podatkowym. `[L]` `[ZMIANA]`

## Gdy stawki się zmienią

Aktualizujemy stawki i progi po ich wejściu w życie i pokazujemy datę weryfikacji w stopce panelu. Jeżeli
dla wybranego roku obowiązujących wartości jeszcze nie znamy, mówimy o tym wprost nad kwotą — i wtedy
nie opieraj na tych liczbach decyzji o tym, ile odłożyć. `[L]`

---

## 6. Modal „Przelicz N rezerwacji"

Akcja nieodwracalna — nadpisuje kwoty podatku zapisane przy rezerwacjach.

| Miejsce | Tekst |
|---|---|
| Tytuł | Przeliczyć {n} rezerwacji? `[L]` |
| Akapit 1 | Kwoty podatku zapisane przy tych rezerwacjach zastąpimy wyliczeniem z bieżących ustawień. Starych wartości nie da się przywrócić. `[L]` `[ZMIANA]` |
| Akapit 2 | Jeśli te rezerwacje weszły już do złożonej deklaracji, zapisz sobie wcześniej ich zestawienie albo zapytaj księgową. `[L]` `[ZMIANA]` |
| Przycisk primary (cynober) | Przelicz {n} rezerwacji |
| Przycisk ghost | Anuluj |

Fokus po otwarciu ustawiamy na „Anuluj", nie na przycisku nieodwracalnym. Modal nie ma trzeciej opcji
i nie zamyka się kliknięciem w tło.

---

## 7. Forma inna niż ryczałt — zasady ogólne (`taxForm === 'general'`)

Karta progu, automatyczna zdrowotna i karta „Prowizje i media" znikają. Rachunek liczy koszty ze znakiem minus.

### 7.1 Rachunek roku

Nagłówek: **Rachunek roku {rok} · skala podatkowa**

| Warunek | Klucz | Wartość |
|---|---|---|
| zawsze | Przychód z {liczbaRezerwacji} rezerwacji | `{przychod}` |
| zawsze | Prowizje portali | `− {prowizje}` |
| zawsze | Media i eksploatacja | `− {media}` |
| `includeZusInCosts && spoleczneRok > 0` | Składki społeczne w kosztach | `− {spoleczneRok}` |
| ↳ wiersz podrzędny mono 10 px | Odejmujemy je, bo w ustawieniach masz włączone „Uwzględniaj składki ZUS w kosztach". | — |
| zawsze (klucz 600) | Dochód · podstawa | `{podstawa}` |
| zawsze | Podatek według skali (12% / 32%) `[L]` `[ZMIANA]` | `{podatek}` |
| ↳ wiersz podrzędny mono 10 px | Kwota wolna z Twoich ustawień: {taxFreeAmount} zł. `[L]` `[ZMIANA]` | — |
| `zusHealth > 0` | Zdrowotna z Twoich ustawień · {zusHealth} zł × {miesiecy} mies. `[L]` | `{zdrowotnaRok}` |
| ↳ wiersz podrzędny mono 10 px | Przy skali zależy od dochodu — bierzemy kwotę z Twoich ustawień. `[L]` `[ZMIANA]` | — |
| `spoleczneRok > 0` | Składki społeczne · {zusSocial} zł × {miesiecy} mies. | `{spoleczneRok}` |
| `spoleczneRok === 0` | Składki społeczne — nie masz ich w ustawieniach `[L]` | mono: `POMIJAMY` |
| wiersz sumy | Podatek i składki razem `[ZMIANA]` | `{lacznieDoZaplaty}` |
| pod sumą, mono 10 px | Kwoty przed zaokrągleniem do pełnych złotych. `[L]` | — |

Wiersz składek społecznych w kosztach jest nowy wobec mockupu, a bez niego rachunek się nie zgadza:
`taxSummary.js:124-125` odejmuje je od podstawy, gdy `includeZusInCosts` jest włączone.

Wiersz kwoty wolnej pokazujemy **także wtedy, gdy `taxFreeAmount === 0`** — to jedyny wyjątek od zasady
„nie pokazujemy zer". Zero jest tu informacją o ustawieniu („nie odejmujemy kwoty wolnej"), a nie
twierdzeniem o obowiązku podatkowym, i bez niego rachunek nie daje się sprawdzić przez telefon.

### 7.2 Karta „Tu koszty obniżają podatek"

| Miejsce | Tekst |
|---|---|
| Tytuł (zieleń) | Tu koszty obniżają podatek |
| Akapit 13 px | Przy zasadach ogólnych prowizje i media wchodzą do rachunku i zmniejszają podstawę. Dlatego są w kolumnie z odejmowaniem, a przy ryczałcie stoją osobno. |

Karty „Czego tu nie ma" nie wdrażamy — README opisuje ją jako element dokumentacji projektu.

---

## 8. Ustawienia konta → Podatki

### 8.1 Podstawa wynajmu — nowe pole `rentalBasis` `[KOD]`

Nad wyborem formy opodatkowania. Bez wartości domyślnej: panel ma o to poprosić, a nie zgadywać (§B1).

| Miejsce | Tekst |
|---|---|
| Etykieta grupy | Jak wynajmujesz |
| Opcja 1 | Najem prywatny — wynajmuję poza działalnością gospodarczą `[L]` |
| Opcja 2 | Działalność gospodarcza — mam wpis w CEIDG `[L]` |
| Podpowiedź `.wpd-fhint` | Nie wiemy, która opcja jest Twoja — zależy to od tego, jak faktycznie wynajmujesz. Od tej odpowiedzi zależy, czy doliczamy do wyliczenia składkę zdrowotną. Jeśli masz wątpliwości, zapytaj księgową. `[L]` `[ZMIANA]` |

### 8.2 Kwota wolna od podatku (przy skali)

| Miejsce | Tekst |
|---|---|
| Etykieta pola | Kwota wolna od podatku (rocznie) |
| Podpowiedź `.wpd-fhint` | Jeśli masz etat, kwotę wolną uwzględnia już pracodawca — wtedy wpisz tu 0, żeby nie odjąć jej dwa razy. `[L]` `[ZMIANA]` |
| Zdanie opcjonalne, do decyzji | Kwota wolna jest jedna na wszystkie Twoje dochody, nie osobna dla wynajmu. `[ZMIANA]` |

Wartość domyślna `taxFreeAmount` (dziś 30 000, `constants.js:97`) to decyzja właściciela, nie copy.
Rekomendacja legala: 0.

### 8.3 VAT — poprawka terminologiczna i rodzajowa

„Płatnik" i „podatnik" to dwie różne role prawne (art. 8 Ordynacji podatkowej) — §P1. Przy okazji znika
pierwsza osoba: „Jestem czynnym podatnikiem VAT" wymusza rodzaj (kobieta powie „podatniczką"), a etykieta
statusu nie wymusza go wcale.

| Miejsce | Obecnie | Po poprawce |
|---|---|---|
| `SettingsModal.jsx:141`, nad checkboxem | (brak etykiety) | `Status VAT` `[ZMIANA]` |
| `SettingsModal.jsx:141`, checkbox | Jestem czynnym płatnikiem VAT (podatek liczony od kwoty netto) | Czynny podatnik VAT — podatek liczony od kwoty netto `[L]` `[ZMIANA]` |
| `helpArticles.js:754` | „Jeśli rozliczasz VAT, zaznacz „Jestem czynnym płatnikiem VAT (podatek liczony od kwoty netto)" — od przychodu z noclegów zostanie wydzielony VAT 8%…" | Jeśli masz status czynnego podatnika VAT, zaznacz „Czynny podatnik VAT" — od przychodu z noclegów wydzielimy VAT 8%, a podatek dochodowy policzymy od kwoty netto. `[ZMIANA]` |
| `helpArticles.js:753` | „…domyślnie 30 000 zł; system stosuje skalę 12% i 32% powyżej 120 000 zł dochodu." | …Jeśli kwotę wolną uwzględnia już Twój pracodawca, wpisz 0. System stosuje skalę 12% i 32% powyżej 120 000 zł dochodu. `[ZMIANA]` |

Artykuł Pomocy trzeba poprawić razem z panelem — inaczej instrukcja odsyła do checkboxa o nazwie, której
już nie ma, i utrwala „płatnika". Jeśli właściciel zmieni domyślną kwotę wolną na 0, w wierszu 753 znika
też słowo „domyślnie 30 000 zł".

---

## Zmiany do akceptacji legala

Każda pozycja zachowuje twierdzenie prawne z analizy. Zmienia się rytm, szyk albo rodzaj gramatyczny.
Lista jest do przejrzenia przez agenta `legal` przed wdrożeniem.

**1. Zdanie pod kwotą główną — usunięty rodzaj męski.**
§7: „Nie odejmujemy tego, co już **zapłaciłeś** w zaliczkach i składkach".
Po zmianie: „Nie odejmujemy zapłaconych już zaliczek ani składek".
Twierdzenie identyczne, imiesłów odnosi się do zaliczek i składek, nie do gospodarza.

**2. Zdanie pod kwotą główną — „ze sierpniem włącznie" → „z tym miesiącem włącznie".**
§P7 chciał nazwać bieżący miesiąc. Nazwa miesiąca wymaga tabeli odmiany („ze sierpniem", ale „z lutym"),
a zysk jest zerowy: „z tym miesiącem włącznie" mówi dokładnie to samo i działa w każdym miesiącu.
Dla lat minionych wariant „za cały {rok}" — wtedy zastrzeżenie o trwającym miesiącu jest bezprzedmiotowe.

**3. Zdanie pod kwotą główną — cztery warianty zamiast jednego.**
§7 zakłada, że kwota zawsze zawiera podatek i zdrowotną. Po wdrożeniu `rentalBasis` przestanie to być prawdą:
przy najmie prywatnym zdrowotnej nie ma, a przy `rentalBasis === null` nie ma jej i nie wiadomo, czy będzie.
Zdanie musi opisywać to, co faktycznie jest w kwocie, inaczej wraca ten sam błąd co w B7.

**4. Próg po przekroczeniu — myślnik zamieniony na kropkę.**
§7: „…12,5% zamiast 8,5% — każde kolejne 1 000 zł…". Po zmianie dwa zdania. Bez zmiany treści.

**5. Etykieta zdrowotnej w rachunku — myślnik i przecinek zamienione na kropki środkowe.**
§7: „Składka zdrowotna za {miesiecy} mies. — przychód 60 000–300 000 zł, {zdrowotnaMies} zł/mies."
Po zmianie: „Składka zdrowotna za {miesiecy} mies. · przychód 60 000–300 000 zł · {zdrowotnaMies} zł/mies."
Powód: wiersz podrzędny pod spodem też ma myślnik, dwa myślniki w sąsiadujących wierszach zlewają się;
kropka środkowa jest w tym panelu językiem etykiet mono. Dodatkowo trzy warianty widełek zamiast jednego,
bo progi są trzy.

**6. Odliczenie 50% — odsyłacz do przepisu zszedł do wiersza podrzędnego.**
§7 chciał „(art. 11 ust. 1a ustawy o ryczałcie)" w kluczu wiersza. Klucz robi się wtedy dwuwierszowy
i przestaje się skanować. Przepis stoi wiersz niżej, mono 10 px, w tej samej karcie. Nic nie znika.
**Dopisek do akceptacji:** „zakładamy, że składka za ten okres jest zapłacona" — art. 11 ust. 1a mówi
o składkach *zapłaconych*, a kod odlicza 50% składki *naliczonej*. To założenie aplikacji i lepiej je nazwać.

**7. Nota o prowizjach — usunięty rodzaj męski.**
Projekt: „Pokazujemy je, żebyś **wiedział**, ile zjadły". Po zmianie: „żeby było widać, ile zjadły".

**8. „Zostaje Ci po prowizjach, kosztach i odłożeniu podatków" → „Wynik po prowizjach, mediach i podatku".**
§P4 proponował „Twój wynik po wszystkim". „Po wszystkim" nie mówi po czym, a właśnie o to chodziło:
suma ma mieć nazwany wzór, żeby nie udawała rachunku podatkowego. Nazwy składników są w etykiecie,
wzór w wierszu mono pod nią. Wariant z VAT-em osobno.

**9. „Łącznie do zapłaty" → „Podatek i składki razem"** (KPI, wiersz sumy w obu rachunkach).
§7 tego nie ruszał, ale §B7 zakwestionował „do odłożenia" właśnie za sugerowanie kwoty pozostałej
do zapłaty — a „do zapłaty" mówi to wprost. To ta sama liczba i ten sam problem, jedno miejsce dalej.
W komórce KPI etykieta `DO ODŁOŻENIA`, spójna z hero.

**10. Rozjazd — zdanie karty skrócone.**
§7: „W panelu pokazujemy tę policzoną z bieżących ustawień — liczymy ją raz, od całego roku."
Po zmianie: „Liczymy raz, od całego roku — tę kwotę pokazujemy w panelu."
Karta ma nad tym zdaniem tytuł „Z bieżących ustawień" i tag „W PANELU", więc pierwsza połowa zdania
powtarzała podpis. Oba twierdzenia zostają.

**11. Alert starych stawek — tytuł bez słowa „rozliczenie".**
Projekt: „Rozliczenie 2027 liczymy stawkami z 2026". Po zmianie: „Rok {rok} liczymy stawkami z {rokStawek}".
Powód: rekomendacja systemowa z §2 — aplikacja nie „rozlicza" gospodarza.

**12. Nowy alert dla przeterminowanych stawek (wariant B w 4.2).**
§P6 podał treść „Stawki w aplikacji pochodzą z {S.rok} i nie zostały jeszcze zaktualizowane."
Rozbite na tytuł i treść, dopisane zdanie o potwierdzeniu z księgową — alert bez wskazania, co zrobić,
zostawia gospodarza z ostrzeżeniem i niczym więcej.

**13. Stan pusty — „2025 masz rozliczony" → „Za 2025 masz rezerwacje".**
Dwa powody: zakaz słowa „rozliczony" o gospodarzu (§2) i to, że aplikacja nie wie, czy rok jest rozliczony.
Wie tylko, że są w nim rezerwacje.

**14. Modal przeliczenia — dwie drobne zmiany rytmu.**
§P9: „Zastąpimy kwoty podatku zapisane przy tych rezerwacjach wyliczeniem z bieżących ustawień."
Po zmianie szyk: „Kwoty podatku zapisane przy tych rezerwacjach zastąpimy wyliczeniem z bieżących ustawień" —
podmiotem zdania jest to, co gospodarz straci. Oraz „zachowaj wcześniej ich zestawienie" → „zapisz sobie
wcześniej ich zestawienie", bo „zachowaj" przy nieodwracalnej akcji czyta się jak „nic nie rób".

**15. Stopka desktop — jedno „Twój" mniej.**
§5: „z Twoich danych i z ustawień podatkowych Twojego konta". Po zmianie: „…i z ustawień podatkowych konta".

**16. Pomoc — usunięty rodzaj męski w trzech miejscach.**
„składki, które sam **podałeś**" → „składki podane w ustawieniach"; „Zaliczek i składek, które już
**zapłaciłeś**" → „Zaliczek i składek już zapłaconych"; nagłówek „Co musisz rozstrzygnąć **sam**" →
„Co rozstrzygasz samodzielnie".

**17. Zdanie o zdrowotnej przy skali — usunięty rodzaj męski.**
§7: „liczymy z kwoty, którą **podałeś**". Po zmianie: „bierzemy kwotę z Twoich ustawień".

**18. Podpowiedź przy `rentalBasis` — rozbita na trzy zdania.**
§B1: „Nie wiemy, która opcja jest Twoja — to zależy od tego, jak faktycznie wynajmujesz. Jeśli masz
wątpliwości, zapytaj księgową; od tego zależy, czy dopisujemy do wyliczenia składkę zdrowotną."
Po zmianie ta sama treść w kolejności: czego nie wiemy → co z tego wynika → co zrobić. Średnik znika.

**19. Zdanie opcjonalne przy kwocie wolnej.**
„Kwota wolna jest jedna na wszystkie Twoje dochody, nie osobna dla wynajmu." §B8 stwierdza to w analizie
(art. 27 ust. 1 PIT), ale nie umieścił w podpowiedzi. Bez tego zdania gospodarz nie wie, *dlaczego*
ma wpisać 0. **Do decyzji legala — czy to już nie jest wyjaśnienie z zakresu obowiązków podatkowych.**

**20. Nowe teksty, których legal nie widział** (nie zmieniają niczego z §5/§7, ale niosą treść prawną):
karta „Zanim doliczymy składkę zdrowotną" (4.5), wiersz „Zdrowotna · najem prywatny — nie doliczamy" (1.3),
wiersz „Podstawa wynajmu" w karcie dla księgowej (2.3), nota o pasmach podstawy (4.4), wiersz „Składki
społeczne w kosztach" z wyjaśnieniem (7.1). Wszystkie mówią o tym, **co robi aplikacja**, a nie o tym,
**co gospodarz ma obowiązek** — to jest granica z §2, którą świadomie trzymam.

**21. Pomoc — „Kto odpowiada za rozliczenie" → „Kto odpowiada za podatek".**
§5: „Za prawidłowe rozliczenie podatkowe odpowiadasz Ty jako podatnik."
Po zmianie: „Za prawidłowe wykonanie zobowiązań podatkowych i składkowych odpowiadasz Ty."
Brzmienie jest przepisane z projektu Regulaminu (§6, §4 ust. 4 pkt 6 — „Odpowiedzialność za prawidłowe
wykonanie zobowiązań podatkowych i składkowych ponosi Gospodarz"), więc nie osłabia przypisania
odpowiedzialności, a przy okazji rozwiązuje dwa problemy naraz: znika słowo „rozliczenie" o gospodarzu
(zakaz z §2) i rzeczownik „podatnik" w zdaniu skierowanym wprost do adresata.

**22. Pomoc — „Wspólnego rozliczenia z małżonkiem" → „Wspólnego opodatkowania małżonków".**
To samo wyłączenie, nazwane terminem ustawowym (art. 6 ust. 2 PIT), bez zakazanego słowa.

**23. „Kwotę wolną rozlicza pracodawca" → „uwzględnia już pracodawca"** (podpowiedź 8.2, Pomoc, artykuł 753).
§B8 użył „rozlicza". Czynność jest ta sama, a czasownik nie wchodzi na listę z §2.

**24. Checkbox VAT — status zamiast pierwszej osoby.**
§P1 poprawiał wyłącznie „płatnika" na „podatnika", zostawiając „Jestem czynnym podatnikiem VAT".
Ta konstrukcja wymusza rodzaj gramatyczny na użytkowniczce. Po zmianie pole ma etykietę „Status VAT",
a checkbox brzmi „Czynny podatnik VAT — podatek liczony od kwoty netto". Znaczenie identyczne,
zdanie nie mówi już nic o osobie. Ta sama poprawka w `helpArticles.js:754`.

**25. Skala — kwota wolna zeszła do wiersza podrzędnego.**
§7: „Podatek według skali (12% / 32%), kwota wolna z Twoich ustawień: {taxFreeAmount} zł" jako jeden klucz.
Klucz robi się wtedy najdłuższy w całym rachunku i łamie kolumnę z liczbami. Po zmianie: klucz
„Podatek według skali (12% / 32%)", pod nim mono „Kwota wolna z Twoich ustawień: {taxFreeAmount} zł."
Ten sam zabieg co w poz. 6. Oba twierdzenia zostają w tej samej karcie.

**26. Skróty na 375 px (1.7).**
Karta progu: „Do {prog} zł stawka wynosi 8,5%, powyżej — 12,5%." i „Od nadwyżki płacisz 12,5% zamiast 8,5%."
Nota o prowizjach: „Przy ryczałcie prowizje i media nie obniżają podatku."
Ubywa wyłącznie warstwa wyjaśniająca (przykład 125 zł zamiast 85 zł, zdanie o tym, po co pokazujemy prowizje).
Twierdzenia z listy blokerów — obie stawki, brak wpływu kosztów na podatek przy ryczałcie, zakres danych
(„tylko przychód z rezerwacji w tej aplikacji") i całe zastrzeżenie z 5.2 — zostają na telefonie w całości.

---

## Wyjątki rodzajowe

Panel po tych poprawkach **nie zwraca się do gospodarza w żadnym rodzaju gramatycznym**. Sprawdzone zdanie
po zdaniu: wszystkie czasowniki są w drugiej osobie czasu teraźniejszego („masz", „możesz", „potwierdź",
„wpisz", „zapytaj", „przełącz") albo w formie bezosobowej, a imiesłowy odnoszą się do rzeczy, nie do osoby
(„zapłaconych zaliczek", „kwoty wpisane ręcznie", „składki podane w ustawieniach"). Ukośników typu
„zapłaciłeś/aś" nie ma nigdzie.

Trzy wzorce, którymi to zrobione — do użycia przy każdym następnym tekście w panelu:

1. Czas przeszły w drugiej osobie → imiesłów przy rzeczy: „co już zapłaciłeś" → „zapłaconych już zaliczek".
2. Zdanie o osobie → zdanie o czynności: „zmieniłeś formę opodatkowania" → „zmiana formy opodatkowania
   w trakcie roku".
3. Pierwsza osoba w deklaracji ustawień → nazwa statusu: „Jestem czynnym podatnikiem VAT" → „Czynny
   podatnik VAT".

Zostają dwie rzeczy do świadomej decyzji, obie **nie dotyczą rodzaju gospodarza**:

**1. „Księgowa" — rodzaj żeński osoby trzeciej.** Występuje w ośmiu miejscach: „Kwoty potwierdź z księgową",
„Do rozmowy z księgową", „zapytaj księgową", „Szczegóły dla księgowego" (tryb), „materiał dla księgowej".
Brief, analiza prawna i mockup używają obu form wymiennie i nikt tego nie kwestionował.
**Rekomendacja: zostawić.** „Zapytaj księgową" brzmi jak zdanie, które ktoś naprawdę mówi; „zapytaj osobę
prowadzącą księgowość" nie brzmi jak nic. Ujednolicić warto tylko nazwę trybu — „Szczegóły dla księgowego"
zostaje w rodzaju męskim, bo jest etykietą przycisku od pierwszej wersji projektu i zmiana kosztuje
rozjazd z README, testami e2e i ustawieniami konta. Jeśli właściciel zechce ujednolicić, jedyna sensowna
para to „Szczegóły dla księgowej" wszędzie — nie mieszać.

**2. „Podatnik" i „Gospodarz" — rodzaj męski w nazwach ról prawnych.** Po poprawkach 21 i 24 nie ma ich
w panelu ani w artykule Pomocy: zdanie o odpowiedzialności mówi „odpowiadasz Ty", a checkbox opisuje status,
nie osobę. Zostają wyłącznie w Regulaminie, gdzie „Gospodarz" jest zdefiniowaną stroną umowy. Tam rodzaj
gramatyczny nazwy roli jest normą języka prawnego i nie ruszamy go — zamiana osłabiłaby przypisanie
odpowiedzialności, czyli to, po co ten zapis powstał.

---

## Czego świadomie nie napisałem

**1. Kwot bazowych w rozbiciu na dwie stawki.** „8,5% od 100 000 zł" jest nieprawdą wszędzie tam, gdzie
podstawa jest niższa od przychodu (czyli u każdego, kto ma odliczenie zdrowotnej). Silnik dzieli po stawkach
`podstawa`, nie `przychod`, i dodatkowo przypisuje całe odliczenie do pasma 8,5% wbrew art. 11 ust. 3 ustawy
o ryczałcie (§P3, pytanie Q6 do doradcy). Do czasu poprawki w `podatekDochodowy()` karta idzie bez kwot
bazowych. Napisanie tam liczby byłoby wymyślaniem rachunku, który się nie zgadza z sąsiednim.

**2. Copy dla działalności nierejestrowanej i podatku liniowego.** Obie formy wypadły z zakresu tury
(§B2, §B3) — liczone są stawką bez podstawy prawnej. Teksty dla nich powstaną razem z prawidłową
implementacją, po odpowiedzi na Q5. Z opisu domyślnych trybów w Ustawieniach też muszą zniknąć,
inaczej panel obiecuje obsługę formy, której nie ma.

**3. Zdania, że gospodarz nie ma obowiązku płacić składki zdrowotnej.** Przy najmie prywatnym panel mówi
wyłącznie „nie doliczamy" — o tym, co robi aplikacja. Zdanie „nie płacisz składki zdrowotnej" byłoby
kwalifikacją sytuacji prawnej konkretnego podatnika, czyli tym, przed czym ostrzega §2 analizy. Ta sama
zasada dotyczy składek społecznych i dlatego wiersz „nie masz ich w ustawieniach" zostaje dosłownie.

**4. Zastrzeżenia o kompletności VAT.** Panel pokazuje VAT należny od noclegów, ale nie dotyka VAT-u
od prowizji portali (import usług, VAT-UE) — czyli realnego obowiązku części gospodarzy. Pytanie Q8
do prawnika brzmi, czy przez to nie sprawiamy wrażenia kompletności. Zdanie, które by to domykało,
mam gotowe: *„Liczymy VAT należny od noclegów. VAT od prowizji portali jest poza aplikacją."*
**Nie wstawiam go do panelu przed odpowiedzią na Q8** — jeśli odpowiedź brzmi „potrzebne", jest to jeden
wiersz mono w karcie dla księgowej; jeśli „niepotrzebne", oszczędzamy zdanie w miejscu, gdzie każde kosztuje.

**5. Daty weryfikacji stawek w stopce.** Tekst jest gotowy, ale pola `zweryfikowano` nie ma dziś
w `STAWKI_PODATKOWE`. Dopóki go nie ma, w stopce stoi samo „STAWKI 2026". Wpisanie tam daty ręcznie albo
podstawienie daty renderu byłoby dokładnie tym, co §P6 nazywa sugerowaniem świeżości, której nie ma.

**6. Komunikatu po przeliczeniu rezerwacji.** Projekt nie przewiduje toastów w tym module i nie wiem,
czy panel ma do dyspozycji ten wzorzec. Zdanie „Przeliczono {n} rezerwacji" jest oczywiste i napiszę je
w pięć sekund, ale dopisywanie do specyfikacji komunikatu dla mechanizmu, którego może nie być,
robi zamęt przy wdrożeniu. Do rozstrzygnięcia z devem.

**7. Mikrorachunku podatkowego, tytułów przelewu i eksportu CSV.** Poza zakresem tury (brief §7). Projekt
zostawia na nie miejsce, ale pusty pasek nie dostaje etykiety „wkrótce" ani żadnej innej zapowiedzi.

**8. Tekstu do Regulaminu.** §6 analizy ma gotowe brzmienie §4 ust. 4 i §12 ust. 5 i to jest treść wiążąca
prawnie — nie przepuszczam jej przez redakcję marketingową. Idzie do prawnika w brzmieniu od legala.
