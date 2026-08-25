# Analiza prawna — panel podatkowy WynajemPRO (X25)

**Data:** 2026-08-24 · **Stan prawny zweryfikowany:** 2026-08-24 · **Autor:** agent `legal`

> **NIE JEST TO OPINIA PRAWNA ANI PODATKOWA.** To analiza wewnętrzna przygotowana przez agenta zespołu, nie przez doradcę podatkowego ani radcę prawnego. Ustalenia dotyczące prawa podatkowego wymagają potwierdzenia przez doradcę podatkowego, a projekty zapisów regulaminowych — przez prawnika-człowieka, zanim zostaną użyte wiążąco. Część ustaleń oparto na źródłach branżowych (nie na tekście ustawy) — takie miejsca są wprost oznaczone.

---

## 1. Werdykt

**Panel NIE może iść do kodu w obecnym kształcie.** Nie z powodu układu ani zastrzeżenia prawnego — te są zaprojektowane rozsądnie — tylko dlatego, że **etykiety opisują wyliczenia, których silnik nie wykonuje, a silnik przyjmuje założenie, którego nikt użytkownikowi nie zadał.**

Sedno w jednym zdaniu: `taxSummary.js` traktuje `taxForm === 'lump_sum'` jako jednoznaczne, a to jest **dwie zupełnie różne sytuacje podatkowe** — najem prywatny (art. 6 ust. 1a ustawy o ryczałcie) i usługi zakwaterowania w działalności gospodarczej. Stawka i próg są w obu przypadkach identyczne (to dobra wiadomość — obawa z zamówienia okazała się nieuzasadniona), ale **składki i odliczenie już nie**. Panel dolicza dziś składkę zdrowotną każdemu ryczałtowcowi, w tym takiemu, który nie ma jej obowiązku w ogóle.

**Warunki dopuszczenia do implementacji** (wszystkie muszą być spełnione łącznie):

1. Rozstrzygnięcie w Ustawieniach: najem prywatny czy działalność gospodarcza — i uzależnienie od tego wiersza zdrowotnej oraz odliczenia 50% (B1).
2. Usunięcie z projektu form `unregistered` i `linear` albo ich prawidłowa implementacja — dziś obie liczą stawką, która nie ma podstawy prawnej (B2, B3).
3. Poprawienie ośmiu konkretnych etykiet wymienionych w blokerach (B4–B8).
4. Nowe brzmienie zastrzeżenia prawnego (§5) i zapis w Regulaminie (§6).
5. Mechanizm dowodowy dla aktualności stawek — pole `zweryfikowano` + bramka testowa (§7, D).

Punkty 1–3 to zmiany w `taxSummary.js`, `constants.js`, `SettingsModal.jsx` i w copy — nie w warstwie wizualnej. **Projekt graficzny jako taki nie jest zablokowany**; zablokowana jest treść, którą ma wyświetlać.

---

## 2. Ryzyko doradztwa podatkowego (A)

### Gdzie przebiega granica

Zastrzeżone ustawowo są wyłącznie czynności z **art. 2 ust. 1 pkt 1, 4 i 5 ustawy z dnia 5 lipca 1996 r. o doradztwie podatkowym** — udzielanie porad, opinii i wyjaśnień z zakresu obowiązków podatkowych, reprezentowanie przed organami i niezależny audyt funkcji podatkowej. Ich zawodowe wykonywanie bez uprawnień jest zagrożone **grzywną do 50 000 zł (art. 81 ust. 1 tej ustawy)**. Co istotne: **prowadzenie ksiąg (pkt 2) i sporządzanie deklaracji (pkt 3) nie są objęte sankcją z art. 81** — deregulacja z 2014 r. Sam więc fakt, że aplikacja liczy podatek i przygotowuje materiał do deklaracji, jest poza zakresem zastrzeżonym.

Granicę wyznaczają trzy pytania:

| Bezpieczne (kalkulator) | Ryzykowne (zbliża się do porady) |
|---|---|
| Aplikacja **stosuje parametry podane przez użytkownika** i publiczne stawki | Aplikacja **kwalifikuje sytuację prawną** użytkownika za niego |
| Wynik nazwany szacunkiem, z widocznymi założeniami | Wynik nazwany kwotą **wiążącą** albo „Twoim podatkiem" |
| Podaje arytmetykę | **Rekomenduje działanie** w oparciu o sytuację podatkową |

Panel przekracza tę granicę w trzech miejscach jednocześnie (B4, B5) i zbliża się do niej wszędzie tam, gdzie stwierdza coś o statusie gospodarza („nie jesteś płatnikiem", „próg 100 000 zł" bez zastrzeżenia, „Odliczenie 50%" jako fakt).

**Ocena ryzyka:** samo postępowanie z art. 81 jest mało prawdopodobne (żeby zaistniało, potrzeba zawiadomienia — najczęściej od konkurenta albo samorządu doradców). **Realniejsze jest ryzyko z ustawy z dnia 23 sierpnia 2007 r. o przeciwdziałaniu nieuczciwym praktykom rynkowym (art. 5 — praktyka wprowadzająca w błąd)** i postępowanie UOKiK, jeśli aplikacja twierdzi, że „liczy podatek", a liczy go dla części użytkowników źle. Ta druga droga jest tańsza dla skarżącego i głośniejsza dla marki.

**Rekomendacja systemowa:** nigdzie w aplikacji ani w materiałach marketingowych nie używać czasownika „rozliczamy" ani rzeczownika „rozliczenie" w odniesieniu do gospodarza. Poprawnie: „pokazujemy, ile odłożyć", „przygotowujemy materiał dla księgowej". To jest jednocześnie zgodne z językiem briefu.

---

## 3. Blokery — nie wolno implementować w obecnej formie

### B1 [BLOKER] Ryczałt bez rozróżnienia: najem prywatny vs działalność gospodarcza

**Stan faktyczny z kodu.** `src/utils/taxSummary.js:110-111`:
```js
const ryczalt = ustawienia.taxForm === 'lump_sum';
const zdrowotnaMies = ryczalt ? zdrowotnaRyczalt(przychod) : (Number(ustawienia.zusHealth) || 0);
```
oraz `:122`:
```js
podstawa = Math.max(0, przychod - zdrowotnaRok * S.zdrowotnaRyczalt.odliczenieOdPrzychodu);
```

**Co powinno być.**

- **Stawka i próg — kod ma rację.** Art. 12 ust. 1 pkt 4 ustawy z dnia 20 listopada 1998 r. o zryczałtowanym podatku dochodowym: „8,5% przychodów do kwoty 100 000 zł oraz 12,5% przychodów od nadwyżki ponad kwotę 100 000 zł z tytułu: a) o których mowa w art. 6 ust. 1a [najem prywatny], (…) c) świadczenia usług związanych z zakwaterowaniem (PKWiU dział 55)". **Obie sytuacje mają tę samą stawkę i ten sam próg** — obawa z zamówienia okazała się nieuzasadniona.
- **Składka zdrowotna — kod nie ma racji.** Najem prywatny nie jest tytułem do ubezpieczenia zdrowotnego; od przychodów z najmu prywatnego nie płaci się ani składki zdrowotnej, ani społecznych *(potwierdzone źródłami branżowymi; do zacytowania przepisu — art. 66 ustawy o świadczeniach opieki zdrowotnej finansowanych ze środków publicznych — przez doradcę)*.
- **Odliczenie 50% — kod nie ma racji.** Art. 11 ust. 1a ustawy o ryczałcie: „**Przychody, o których mowa w art. 6 ust. 1**, mogą być pomniejszone o 50% składek na ubezpieczenie zdrowotne zapłaconych w roku podatkowym" — przepis odsyła do art. 6 **ust. 1** (działalność gospodarcza), nie do ust. 1a (najem prywatny), i dotyczy składek „z tytułu pozarolniczej działalności gospodarczej". Dla najmu prywatnego odliczenie nie przysługuje, bo nie ma czego odliczać.

**Ryzyko — wymierne.** Gospodarz na najmie prywatnym z przychodem 84 600 zł zobaczy dziś:

- doliczoną składkę zdrowotną **830,58 × 12 = 9 966,96 zł rocznie**, której nie ma obowiązku płacić — panel zawyży „do odłożenia" o niemal 10 tys. zł;
- obniżoną podstawę o 4 983,48 zł, czyli **zaniżony podatek o ok. 424 zł** — i to jest błąd w kierunku, który kosztuje (niedopłata + odsetki, art. 53 Ordynacji podatkowej).

Panel myli się więc w obie strony naraz, a użytkownik nie ma jak tego wykryć, bo nikt go nie zapytał o rozróżnienie.

**Rekomendacja (konkretna).**

1. `src/pages/dashboard/modals/SettingsModal.jsx`, zakładka „Podatki" — nad wyborem formy dodać rozstrzygnięcie:
   - „Najem prywatny — wynajmuję poza działalnością gospodarczą"
   - „Działalność gospodarcza — mam wpis w CEIDG"

   z podpowiedzią: *„Nie wiemy, która opcja jest Twoja — to zależy od tego, jak faktycznie wynajmujesz. Jeśli masz wątpliwości, zapytaj księgową; od tego zależy, czy dopisujemy do wyliczenia składkę zdrowotną."*
2. `src/utils/constants.js` — nowe pole w `defaultTaxSettings`, np. `rentalBasis: null` (świadomie bez wartości domyślnej — panel ma o to poprosić, a nie zgadywać).
3. `src/utils/taxSummary.js` — warunek `ryczalt` zastąpić `ryczalt && rentalBasis === 'business'` dla zdrowotnej i dla odliczenia; przy `rentalBasis === 'private'` zwracać `zdrowotnaMies = 0`, `podstawa = przychod`.
4. Dopóki `rentalBasis === null` — panel **nie pokazuje wiersza zdrowotnej ani odliczenia**, tylko kartę z pytaniem. Lepiej brak liczby niż liczba nieprawdziwa.

---

### B2 [BLOKER] Działalność nierejestrowana jako „obsługiwana forma"

**Stan faktyczny.** `README-projekt.md` deklaruje `unregistered` jako formę z domyślnym trybem „Podsumowanie" (`domyslnyTryb` w `taxSummary.js:202-205` zwraca dla niej `'prosty'`). Kod liczy ją w `podatekDochodowy` gałęzią domyślną: `podstawa * ((Number(settings.rate) || 8.5) / 100)` — czyli **8,5% od przychodu, bez kosztów**. `SettingsModal.jsx:128-137` w ogóle tej formy nie oferuje.

**Co powinno być.** Przychód z działalności nierejestrowanej to **przychód z innych źródeł (art. 20 ust. 1ba ustawy o PIT)**, opodatkowany **według skali (art. 27 ust. 1 PIT)**, z możliwością odliczenia kosztów, rozliczany w PIT-36. **Ryczałt 8,5% nie ma tu zastosowania w żadnym wariancie.** Każda liczba, którą panel pokaże dla tej formy, jest wymyślona.

Dwie dodatkowe rzeczy, o których panel milczy, a które są dla użytkownika krytyczne:

- **Limit od 1 stycznia 2026 jest kwartalny, nie miesięczny.** Art. 5 ust. 1 ustawy Prawo przedsiębiorców w brzmieniu nadanym ustawą z dnia 25 lipca 2025 r.: przychód nie może przekroczyć **225% minimalnego wynagrodzenia w żadnym kwartale** — przy minimalnym wynagrodzeniu 2026 = 4 806 zł daje to **10 813,50 zł na kwartał**, czyli ok. 43 254 zł rocznie. Przykładowe 84 600 zł z mockupu **dwukrotnie przekracza ten limit** — panel rysuje sytuację, w której użytkownik już od dawna powinien mieć wpis w CEIDG.
- **Najem krótkoterminowy z usługami prawdopodobnie w ogóle nie mieści się w działalności nierejestrowanej.** Najem prywatny to odrębne źródło (art. 10 ust. 1 pkt 6 PIT), które nie jest działalnością gospodarczą — art. 5 Prawa przedsiębiorców do niego nie sięga. Najem krótkoterminowy z usługami jest kwalifikowany jako usługi zakwaterowania, czyli działalność gospodarcza (art. 10 ust. 1 pkt 3 PIT) — tu art. 5 sięga, ale **kwalifikacja jest sporna** i zależy od zorganizowania i ciągłości. **To pytanie do doradcy (Q5).**

**Ryzyko.** Panel utwierdza użytkownika w statusie, którego prawdopodobnie nie ma, i podaje mu kwotę policzoną nieistniejącą stawką. Jeśli w oparciu o to nie zarejestruje działalności — konsekwencje sięgają dalej niż podatek (składki ZUS wstecz, art. 5 ust. 3 Prawa przedsiębiorców — obowiązek wniosku do CEIDG w 7 dni od przekroczenia).

**Rekomendacja.** Usunąć `unregistered` z zakresu tej tury: wykreślić z `README-projekt.md` (Overview i State Management), z `Brief-panel-podatkowy-2026-08-24.md` §4 oraz z `domyslnyTryb`. Wrócić do tematu jako osobne zadanie, po odpowiedzi na Q5, z własną ścieżką (skala + koszty + licznik limitu kwartalnego zamiast progu 100 000 zł). Koszt usunięcia jest zerowy — Ustawienia i tak tej formy nie oferują.

---

### B3 [BLOKER] Podatek liniowy liczony stawką 8,5%

Ten sam mechanizm co B2. `README-projekt.md` deklaruje `linear` jako formę z domyślnym trybem „Szczegóły dla księgowego"; `podatekDochodowy` przepuszcza ją do gałęzi domyślnej i liczy `podstawa × rate%`, gdzie `rate` domyślnie **8,5%**. Podatek liniowy wynosi **19% (art. 30c ust. 1 ustawy o PIT)** i liczy się od dochodu, a więc po odjęciu kosztów — czego kod dla tej gałęzi nie robi (`podstawa = przychod`, `taxSummary.js:127`).

Błąd rzędu **dziesięciu punktów procentowych podstawy**, w kierunku zaniżenia. Rekomendacja identyczna jak B2: usunąć `linear` z projektu do czasu prawidłowej implementacji.

---

### B4 [BLOKER] Tag „WIĄŻĄCA" przy kwocie policzonej przez aplikację

**Cytat z inwentarza:**
> „Z bieżących ustawień | **Wiążąca** | 6 930 zł"
> „**Wiążąca jest ta** z bieżących ustawień — najczęściej zmieniłeś formę opodatkowania w trakcie roku."

**Problem — trzy warstwy naraz.** (1) Zdanie jest **nieprawdziwe**: wiążące są deklaracja podatnika i decyzja organu, nie liczba w aplikacji. (2) To najbliższe granicy z **art. 2 ust. 1 pkt 1 ustawy o doradztwie podatkowym** sformułowanie w całym panelu — rozstrzyga o obowiązku podatkowym konkretnego podatnika. (3) W ewentualnym sporze o odszkodowanie (art. 471 KC) to jest gotowy dowód dla drugiej strony: „aplikacja powiedziała mi, że ta kwota jest wiążąca".

**Poprawka.** Tag: `WIĄŻĄCA` → `W PANELU`. Zdanie w alercie: *„W panelu pokazujemy tę policzoną z bieżących ustawień — liczymy ją raz, od całego roku."*

---

### B5 [BLOKER] Rekomendacja decyzji cenowej wywiedziona z sytuacji podatkowej

**Cytaty:**
> „Od nadwyżki płacisz 12,5% zamiast 8,5%. Każde kolejne 1 000 zł przychodu w tym roku to 125 zł podatku — **warto to wiedzieć, ustalając ceny na wrzesień**."
> „Do progu stawka wynosi 8,5%. Od nadwyżki powyżej 100 000 zł — 12,5%. **Przy 84 600 zł przychodu masz jeszcze cztery miesiące sezonu.**"

**Problem.** Pierwsze zdanie jest podręcznikowym „udzieleniem wyjaśnienia z zakresu obowiązków podatkowych połączonym z rekomendacją działania" — najdalszy punkt panelu w stronę art. 2 ust. 1 pkt 1. Drugie jest gorsze pod innym względem: **aplikacja nie wie, ile gospodarz ma jeszcze sezonu** — nie zna jego pipeline'u rezerwacji, obłożenia ani tego, czy „sezon" u niego w ogóle trwa cztery miesiące. To twierdzenie o faktach, którego nie da się poprzeć danymi, podane tonem pewności, i zachęcające do zwiększenia przychodu.

**Poprawka — zostawić arytmetykę, usunąć wezwanie:**
> Po progu: *„Od nadwyżki ponad 100 000 zł stawka wynosi 12,5% zamiast 8,5% — każde kolejne 1 000 zł przychodu to 125 zł podatku zamiast 85 zł."*
> Przed progiem: *„Do 100 000 zł stawka wynosi 8,5%, od nadwyżki — 12,5%. Liczymy tylko przychód z rezerwacji w tej aplikacji."*

Drugie zdanie („masz jeszcze cztery miesiące sezonu") — wykreślić bez zastępnika.

---

### B6 [BLOKER] Etykieta „Zdrowotna — próg do 300 000 zł · 769,43 × 8"

**Trzy błędy w jednej etykiecie.**

1. **769,43 zł to stawka z 2025 roku, nie z 2026.** GUS podał (komunikat z 22 stycznia 2026) przeciętne wynagrodzenie w sektorze przedsiębiorstw wraz z wypłatami z zysku za IV kwartał 2025 = **9 228,64 zł**. Stąd składki dla ryczałtowców w 2026: **498,35 zł** (przychód do 60 000 zł), **830,58 zł** (60 000–300 000 zł), **1 495,04 zł** (powyżej 300 000 zł). **`constants.js` ma te wartości poprawnie** — to mockup jest z poprzedniego roku. Dla przedziału z przykładu powinno być `830,58 × 8 = 6 644,64 zł`, nie `6 155,44 zł`.
   *Ryzyko wtórne:* liczba wpisana w tekst wzorca zaprasza do zahardkodowania jej w JSX. Etykieta musi brać wartość **wyłącznie** z `podsumowanie.zdrowotnaMies`.
2. **„próg do 300 000 zł" wprowadza w błąd.** Gospodarz z przychodem 84 600 zł nie jest „w progu do 300 000 zł" — jest w **widełkach 60 000–300 000 zł**. Sformułowanie sugeruje pierwszy próg i utrudnia zauważenie, że przekroczenie 300 000 zł podniesie składkę o 80%.
3. **„769,43 × 8" opisuje kwotę, której gospodarz w tych miesiącach nie płacił.** ZUS ustala próg **narastająco od początku roku** — do momentu przekroczenia 60 000 zł przychodu gospodarz płacił 498,35 zł miesięcznie, a różnica wychodzi dopiero w rocznym rozliczeniu składki. Etykieta stwierdza nieprawdę o przeszłości. *(Sama kwota roczna po dopłacie będzie zgodna z wyliczeniem kodu — kierunek jest właściwy, opis nie.)*

**Poprawka.**
> „Składka zdrowotna za 8 mies. — przychód w przedziale 60 000–300 000 zł, 830,58 zł/mies."
> Wiersz podrzędny (mono, 11 px): *„Próg ustala się narastająco — różnicę dopłaca się w rocznym rozliczeniu składki."*

---

### B7 [BLOKER] „Do odłożenia" to kwota już w większości zapłacona

**Cytaty:**
> „Do odłożenia za 2026 | 13 082 zł"
> „Podatek za osiem minionych miesięcy plus składka zdrowotna. **Tyle powinno czekać na koncie, kiedy przyjdzie zapłacić.**"

**Problem.** `lacznieDoZaplaty = podatek + zdrowotnaRok + spoleczneRok` (`taxSummary.js:156`) to **suma narastająca za cały rok**, a nie kwota pozostająca do zapłaty. Gospodarz na działalności płaci ryczałt zaliczkowo co miesiąc lub kwartał (art. 21 ust. 1 i 1a ustawy o ryczałcie) i składkę zdrowotną co miesiąc. W sierpniu ma więc **większość tej kwoty już zapłaconą**. Zdanie „tyle powinno czekać na koncie" jest wtedy po prostu nieprawdziwe.

Szkoda idzie w dwie strony: mniejsza — zamrożenie kilkunastu tysięcy złotych bez potrzeby; większa — odczytanie „do odłożenia" jako „jeszcze nie zapłacone" i przekonanie, że termin jest dopiero przed nim.

**Poprawka — najtańsza wersja, jedno zdanie.** Zostawić etykietę „Do odłożenia za 2026" (jest dobra i odpowiada na pytanie z briefu), zmienić zdanie pod kwotą:
> *„Podatek i składka zdrowotna za 8 miesięcy 2026, liczone narastająco. Nie odejmujemy tego, co już zapłaciłeś w zaliczkach i składkach — to obciążenie za cały ten okres."*

---

### B8 [BLOKER] „Podatek 12% po kwocie wolnej 30 000 zł" przy skali

**Dwa problemy.**

1. **Kwota wolna jest jedna na podatnika i na wszystkie źródła** (art. 27 ust. 1 ustawy o PIT). Grupa docelowa WynajemPRO to — wprost z briefu — gospodarze wynajmujący **obok etatu**. U nich kwotę wolną konsumuje pracodawca (PIT-2), a `defaultTaxSettings.taxFreeAmount = 30000` odejmuje ją **drugi raz**. Panel zaniża podatek o **do 3 600 zł** i mówi to jako fakt, w wierszu rachunku, obok liczby z dwoma miejscami po przecinku.
2. **Etykieta jest prawdziwa tylko do 120 000 zł podstawy.** Powyżej wchodzi 32% — kod to liczy poprawnie (`taxSummary.js:76-81`), ale etykieta o tym nie mówi.

**Poprawka.**

- Etykieta z wartości, nie ze stałej: *„Podatek według skali (12% / 32%), kwota wolna z Twoich ustawień: {taxFreeAmount} zł"*.
- Podpowiedź w `SettingsModal.jsx` przy polu „Kwota wolna od podatku (rocznie)": *„Jeśli masz etat, kwotę wolną rozlicza pracodawca — wtedy wpisz tu 0, żeby nie odjąć jej dwa razy."*
- Rozważyć zmianę wartości domyślnej z 30 000 na 0. **To decyzja właściciela**: 0 jest bezpieczniejsze prawnie (błąd w stronę zawyżenia), 30 000 wygodniejsze dla gospodarza bez etatu. Rekomendacja legal: **0**, bo panel istnieje po to, żeby nie zabrakło.

---

## 4. Do poprawienia — nieblokujące, ale wymagające zmiany

### P1 [WAŻNE] „VAT należny 8% · nie jesteś płatnikiem"

- **Terminologia jest błędna.** „Płatnik" i „podatnik" to dwie różne role prawne (art. 8 Ordynacji podatkowej — płatnik oblicza i pobiera podatek od kogoś innego). Poprawnie: **„czynny podatnik VAT"**. Ta sama pomyłka jest w `SettingsModal.jsx:141` („Jestem czynnym płatnikiem VAT") — poprawić w obu miejscach.
- **Stawka 8% jest właściwa** dla usług związanych z zakwaterowaniem (PKWiU dział 55) — poz. 47 załącznika nr 3 do ustawy o VAT. Ale kod (`taxSummary.js:102`) stosuje ją do **każdej** rezerwacji, także takiej, która byłaby najmem na cele mieszkaniowe — a ten jest zwolniony (art. 43 ust. 1 pkt 36 ustawy o VAT). Dla profilu produktu to założenie jest do obrony, ale powinno być nazwane.
- **Pokazywanie wiersza „VAT należny 8%" komuś, kto nie jest podatnikiem VAT, to sugerowanie stawki bez podstawy.** README słusznie mówi „gdy `vatNalezny === 0` — wiersza nie ma", ale karta „Do rozmowy z księgową" ten wiersz zachowuje. Ujednolicić: **nie pokazywać wcale**.
- **Na przyszłość (poza tą turą):** od 1 stycznia 2026 limit zwolnienia podmiotowego wynosi **240 000 zł** (art. 113 ust. 1 ustawy o VAT). Panel ma już mechanikę paska progu — drugi pasek, „do limitu zwolnienia z VAT", byłby wart tyle samo co próg ryczałtu. Nowa funkcja, do Roadmapy.

### P2 [WAŻNE] Próg 100 000 zł liczony tylko z danych w aplikacji

Karta progu mówi „Zostało 15 400 zł przychodu" tonem pewności, ale `taxSummary.js` sumuje wyłącznie rezerwacje z tej aplikacji. Gospodarz, który wynajmuje jeszcze jedno mieszkanie poza WynajemPRO, zobaczy **fałszywy zapas** i przekroczy próg nieświadomie — a to jest dokładnie ta pomyłka, która kosztuje realne pieniądze (4 pkt proc. różnicy stawki).

**Poprawka:** w karcie progu, pod paskiem, mono 10 px: *„Liczymy tylko przychód z rezerwacji w tej aplikacji."*

### P3 [WAŻNE] Rozbicie na dwie stawki nie zgadza się z tym, co liczy kod

**Cytat:**
> „Do progu · 8,5% od 100 000 zł | 8 500 zł · Nadwyżka · 12,5% od 8 200 zł | 1 025 zł · Podatek za rok | 9 525 zł"

Kod liczy inaczej (`taxSummary.js:69-72`): najpierw pomniejsza podstawę o odliczenie 50% zdrowotnej, a potem dzieli na pasma — więc pierwsze pasmo **nie wynosi 100 000 zł**, tylko `100 000 − odliczenie`. Karta pokazywałaby liczby, które nie sumują się do kwoty z rachunku obok.

Osobno: kod przypisuje **całe** odliczenie do pasma 8,5%, podczas gdy **art. 11 ust. 3 ustawy o ryczałcie** nakazuje rozdzielić odliczenia proporcjonalnie do udziału przychodów opodatkowanych różnymi stawkami. Kierunek błędu jest konserwatywny (kod zawyża podatek), ale rachunek dla księgowej powinien się zgadzać z ustawą.

**Poprawka:** wartości pasm liczyć z `podsumowanie.podstawa`, nie ze stałej `prog`; rozdzielić odliczenie proporcjonalnie w `podatekDochodowy`. Zadanie dla `dev`, do potwierdzenia przez doradcę (Q6).

### P4 [WAŻNE] Układ karty „Przychód i co go zjadło" przeczy własnej nocie

**Tekst jest wzorowy**, a rachunek w trybie szczegółów rzeczywiście trzyma prowizje i media poza podstawą, bez znaków minus. Ale w RYS. 1 pod wierszami „Prowizje portali" i „Media i eksploatacja" stoi, oddzielona kreską i wyróżniona zielenią:

> „Zostaje Ci po prowizjach, kosztach i odłożeniu podatków | **56 438 zł**"

`84 600 − 9 460 − 5 620 − 13 082 = 56 438`. To **jest** suma tej kolumny z odejmowaniem — czyli dokładnie ten układ, którego zakazuje brief §6 i README „Czego nie wolno naruszyć" pkt 1. Nota bursztynowa stoi pomiędzy, co ryzyko obniża, ale go nie usuwa: oko czyta kolumnę liczb i kreskę sumującą szybciej niż akapit.

**Poprawka (w kolejności preferencji):**

1. Przenieść „Zostaje Ci" do prawej kolumny hero, pod wiersze podatku i składek — tam jest wynikiem odłożenia, a nie sumą kolumny kosztów.
2. Zostawić w miejscu, ale zmienić etykietę na *„Twój wynik po wszystkim"* i dopisać mono 10 px: *„przychód minus prowizje, media i odłożone podatki"* — żeby suma miała nazwany wzór i nie udawała rachunku podatkowego.

### P5 [WAŻNE] Copy ostrzeżenia o starych stawkach — dobrze postawione, ale z jedną obietnicą na wyrost

**Ocena prawna: postawione dobrze w 80%.** Mówi wprost, że liczba jest nieprawdziwa, nie chowa tego w drobnym druku i siedzi nad kwotą. To właściwa konstrukcja.

Problem jest w „kierunek jest dobry". To obietnica, której nie da się dotrzymać — przy zmianie progu albo stawki kierunek również może być zły. Jeśli gospodarz odłoży według „dobrego kierunku" i się przeliczy, te półtora słowa będzie cytowane.

**Poprawka:**
> *„Kwoty podatku i składek zmieniają się co roku. Dopóki nie poznamy stawek na 2027, nie opieraj na tych liczbach decyzji o tym, ile odłożyć — zaktualizujemy je, gdy stawki wejdą w życie."*

**Dodatkowo — README, RYS. 5:** zapis „Kwota zostaje pełną wielkością — nie wyszarzamy jej" jest projektowo słuszny, ale prawnie ryzykowny: pokazujemy w 76 px liczbę, o której właśnie powiedzieliśmy, że jest nieprawdziwa, pod etykietą „Do odłożenia za 2027". **Rekomendacja tańsza niż wyszarzanie:** przy `stawkiAktualne === false` zmienić samą etykietę kwoty na **„Szacunek wstępny za 2027"**. Kwota zostaje w pełnej wielkości, obietnica znika.

### P6 [WAŻNE] Mechanizm `stawkiAktualne` ma lukę, która się w praktyce zdarzy

`stawkiAktualne: S.rok === rok` (`taxSummary.js:147`) wykrywa **tylko** sytuację „liczę rok przyszły starymi stawkami". Nie wykrywa sytuacji odwrotnej i bardziej prawdopodobnej: **jest luty 2027, nikt nie zaktualizował `constants.js`, użytkownik ogląda rok 2026 (`S.rok === 2026 === rok`) — alertu nie ma, a wartości składek na 2027 są już inne.** Jeśli przepisy zmienią się **w trakcie** roku, warunek nigdy nie zadziała.

**Rekomendacja — trzy zabezpieczenia, wszystkie tanie:**

1. `constants.js`: dodać `STAWKI_PODATKOWE.zweryfikowano = '2026-01-24'` i pokazywać ją w stopce zamiast dzisiejszej: **„STAWKI 2026 · ZWERYFIKOWANE 24.01.2026"**. Obecne „WYLICZONE 24.08.2026" to data renderu — sugeruje świeżość, której nie ma.
2. Drugi warunek alertu: `new Date().getFullYear() > S.rok` → alert wysokiej wagi **niezależnie** od wybranego roku, z treścią *„Stawki w aplikacji pochodzą z {S.rok} i nie zostały jeszcze zaktualizowane."*
3. Bramka testowa w CI, która nie przepuszcza builda, jeśli `zweryfikowano` jest starsze niż 12 miesięcy. Projekt zna już tę konwencję z bramki deployu reguł.

Do tego **złoty zestaw testów jednostkowych** dla `taxSummary.js`: cztery scenariusze z ręcznie wyliczonymi kwotami (najem prywatny, działalność przed progiem, działalność po progu, skala z etatem i kwotą wolną 0). Bez tego zmiana w `constants.js` przechodzi po cichu.

### P7 [WAŻNE] „Podatek za osiem minionych miesięcy" — sierpień nie minął

`miesiecyWRoku = dzisiaj.getMonth() + 1` liczy **z bieżącym miesiącem włącznie**. W sierpniu daje 8, ale sierpień się nie skończył. Drobiazg, ale to twierdzenie o faktach w zdaniu opisującym pieniądze.

**Poprawka:** *„Podatek i składka za 8 miesięcy 2026 (ze sierpniem włącznie)."*

### P8 [WAŻNE] `autoThreshold` odznaczone — pasek progu mówi co innego niż rachunek

Gdy użytkownik odznaczy „automatyczny próg" (`SettingsModal.jsx:160-161`), kod liczy `podstawa × rate%` bez progu. Ale karta progu renderuje się na warunku `forma === 'lump_sum'` — więc pasek dalej opowiada o 12,5% od nadwyżki, podczas gdy rachunek obok liczy płaskie 8,5%. Dwie sprzeczne informacje na jednym ekranie, obie podane jako fakt.

**Poprawka:** warunek renderowania karty progu zmienić na `forma === 'lump_sum' && autoThreshold`; przy `autoThreshold === false` w karcie „Do rozmowy z księgową" dopisać wiersz *„Stawka | stała {rate}% z Twoich ustawień, bez progu"*.

### P9 [WAŻNE] „Rozjazd" — hipoteza podana jako diagnoza

Aplikacja nie wie, dlaczego kwoty się rozjechały. Równie prawdopodobne są ręczna edycja pola przy rezerwacji i import. Podanie jednej przyczyny jako „najczęstszej" to twierdzenie bez pokrycia w danych.

**Poprawka:** *„Przyczyny bywają różne — zmiana formy opodatkowania w trakcie roku albo kwoty wpisane ręcznie przy starszych rezerwacjach."*

Osobno: **„Przelicz 12 rezerwacji" nadpisuje dane historyczne nieodwracalnie.** Jeśli gospodarz złożył już deklaracje w oparciu o stare wartości, nadpisanie kasuje ślad.

**Proponowana treść modala:**
> **Przeliczyć 12 rezerwacji?**
> Zastąpimy kwoty podatku zapisane przy tych rezerwacjach wyliczeniem z bieżących ustawień. Poprzednich wartości nie da się przywrócić.
> Jeśli te rezerwacje weszły już do złożonej deklaracji, zachowaj wcześniej ich zestawienie albo zapytaj księgową, zanim przeliczysz.
> [Przelicz] [Anuluj]

### P10 [PORZĄDKOWE] „Podatek policzy się sam"

Buduje zaufanie do automatu ponad to, co automat robi — przy liczbie przyjętych założeń (forma, kwalifikacja źródła, kwota wolna, ZUS, VAT) to zdanie jest na wyrost.

**Poprawka:** *„Wyliczenie pojawi się, gdy dodasz pierwszą rezerwację albo podłączysz kalendarz Airbnb lub Booking."*

### P11 [PORZĄDKOWE] Zaokrąglenia

„Łącznie do zapłaty 13 084,98" nigdy nie będzie kwotą przelewu — podstawy i kwoty podatków zaokrągla się do pełnych złotych (**art. 63 § 1 Ordynacji podatkowej**). W trybie „Szczegóły dla księgowego", pod wierszem sumy, mono 10 px: *„Kwoty przed zaokrągleniem do pełnych złotych."*

### P12 [PORZĄDKOWE] Co jest dobrze i należy zostawić bez zmian

Żeby nie zgubić się w liście poprawek — te rzeczy są zrobione właściwie i nie wolno ich „przy okazji" zmienić:

- **„Składki społeczne — nie masz ich w ustawieniach / pomijamy"** — wzorowe. Nie twierdzi, że gospodarz nie ma obowiązku; mówi tylko, czego aplikacja nie wie. Zostawić dosłownie.
- **Zasada „nie pokazujemy zer"** — jest zabezpieczeniem prawnym, nie tylko estetycznym. Zero w polu podatku to twierdzenie „nie masz podatku"; brak wiersza to brak twierdzenia.
- **Rachunek przy skali** (RYS. 8) ze znakami minus i wierszem „Dochód · podstawa" — poprawny; koszty przy skali rzeczywiście obniżają podstawę.
- **Karta „Tu koszty obniżają podatek"** — dobra, bo tłumaczy różnicę wobec ryczałtu zamiast ją ukrywać.
- **Alerty nad kwotą, nie przy każdej liczbie** — właściwa konstrukcja. Przy sporze „było napisane wszędzie" broni gorzej niż „było napisane raz, w widocznym miejscu".

---

## 5. Gotowe treści — zastrzeżenie prawne (C)

### Ocena obecnej propozycji

> „To szacunek z Twoich danych — nie deklaracja podatkowa ani porada. Kwoty potwierdź z księgową, zanim złożysz zeznanie."

**Miejsce i forma: wystarczające.** Jedno miejsce, na końcu, czytelne, niedominujące — prawidłowa konstrukcja, nie ma powodu jej zmieniać.

**Treść: niewystarczająca w trzech punktach.**

1. Nie mówi, **na czym oparte jest wyliczenie** — a błąd powstaje najczęściej w ustawieniach (forma opodatkowania, kwota wolna, kwalifikacja źródła), nie w arytmetyce. Zastrzeżenie, które nie wskazuje źródła ryzyka, nie ostrzega.
2. „**zanim złożysz zeznanie**" zawęża do rozliczenia rocznego. Przy ryczałcie z działalności podatek płaci się co miesiąc lub kwartał, a składkę zdrowotną co miesiąc. Zdanie sugeruje, że moment weryfikacji jest raz w roku — nieprawda i to nieprawda kosztowna.
3. Nie odróżnia **szacunku** od **wyliczenia podatku** — a to jest różnica, na której opiera się cała obrona przed zarzutem z art. 2 ust. 1 pkt 1 ustawy o doradztwie podatkowym.

### Wariant panelowy (desktop — stopka, jedno miejsce)

> Szacunek policzony z Twoich danych i z ustawień podatkowych Twojego konta — nie jest deklaracją, wyliczeniem podatku ani poradą podatkową. Kwoty potwierdź z księgową, zanim zapłacisz podatek lub złożysz deklarację.

Obok, mono 10 px uppercase: `STAWKI 2026 · ZWERYFIKOWANE 24.01.2026 · JAK LICZYMY →`

### Wariant 375 px (skrócony, bez ramki, na końcu)

> Szacunek z Twoich danych i ustawień — nie deklaracja ani porada. Kwoty potwierdź z księgową przed zapłatą.

### Wariant rozszerzony — Pomoc → „Jak liczymy podatki"

> **Jak liczymy podatki w WynajemPRO**
>
> Panel podatkowy jest **kalkulatorem pomocniczym**. Pokazuje szacunek tego, ile odłożyć na podatek i składki, żeby nie zabrakło. Nie jest deklaracją podatkową, wyliczeniem podatku w rozumieniu przepisów podatkowych ani poradą podatkową — WynajemPRO nie świadczy doradztwa podatkowego ani usług księgowych.
>
> **Co bierzemy pod uwagę**
> Rezerwacje, prowizje portali i koszty eksploatacyjne wprowadzone do aplikacji, oraz ustawienia podatkowe Twojego konta: formę opodatkowania, status VAT, kwotę wolną i składki, które sam podałeś. Stawki, progi i kwoty składek pochodzą z przepisów obowiązujących w roku, który pokazujemy w stopce panelu, wraz z datą ich ostatniej weryfikacji.
>
> **Czego nie bierzemy pod uwagę**
> Przychodów i kosztów spoza aplikacji. Ulg i odliczeń poza wskazanymi w rachunku. Wspólnego rozliczenia z małżonkiem. Zaliczek i składek, które już zapłaciłeś — kwota główna to obciążenie narastające za cały okres, a nie kwota pozostała do zapłaty. Zaokrągleń do pełnych złotych, które wynikają z przepisów podatkowych.
>
> **Co musisz rozstrzygnąć sam**
> Czy wynajmujesz w ramach działalności gospodarczej, czy poza nią — od tego zależy, czy w ogóle płacisz składkę zdrowotną. Jaką masz formę opodatkowania. Czy kwotę wolną rozlicza już Twój pracodawca. Aplikacja przyjmuje Twoje ustawienia bez ich sprawdzania i liczy zgodnie z nimi, także wtedy, gdy są nieprawidłowe.
>
> **Kto odpowiada za rozliczenie**
> Za prawidłowe rozliczenie podatkowe odpowiadasz Ty jako podatnik. Zanim zapłacisz podatek lub złożysz deklarację, potwierdź kwoty z księgową albo doradcą podatkowym.
>
> **Gdy stawki się zmienią**
> Aktualizujemy stawki i progi po ich wejściu w życie i pokazujemy datę weryfikacji w stopce panelu. Jeżeli dla wybranego roku obowiązujących wartości jeszcze nie znamy, mówimy o tym wprost nad kwotą — i wtedy nie opieraj na tych liczbach decyzji o tym, ile odłożyć.

---

## 6. Gotowe treści — Regulamin

**Tak, zapis w Regulaminie jest potrzebny.** Dziś §4 ust. 1 wymienia „prowadzenie prostych rozliczeń podatkowych i eksportów księgowych" **bez żadnego zastrzeżenia**, a §12 (Odpowiedzialność) w ogóle nie dotyka wyliczeń. Dla porównania: generator umów najmu — funkcja o porównywalnym profilu ryzyka — ma w §4 ust. 1 rozbudowany disclaimer. Panel podatkowy powinien mieć swój, i to mocniejszy, bo w odróżnieniu od generatora jest **włączony**.

### Poprawka 1 — §4 ust. 1, tiret o rozliczeniach

Zastąpić:
> — prowadzenie prostych rozliczeń podatkowych i eksportów księgowych,

nowym brzmieniem:
> — pomocnicze zestawienia podatkowe (szacunek podatku i składek na podstawie danych i ustawień wprowadzonych przez Gospodarza) oraz eksporty na potrzeby księgowości — na zasadach określonych w ust. 4,

### Poprawka 2 — nowy §4 ust. 4

> **4. Zestawienia podatkowe (moduł „Podatki").**
>
> 1) Aplikacja udostępnia narzędzie obliczeniowe, które na podstawie danych wprowadzonych przez Gospodarza (rezerwacje, prowizje, koszty) oraz zadeklarowanych przez niego ustawień podatkowych (w szczególności: podstawa wynajmu, forma opodatkowania, status podatnika VAT, wysokość składek, kwota wolna) przedstawia **szacunkową** wysokość podatku dochodowego i składek.
>
> 2) Zestawienia te **nie stanowią**: deklaracji ani zeznania podatkowego, wyliczenia podatku w rozumieniu przepisów prawa podatkowego, ani porady, opinii lub wyjaśnienia w rozumieniu art. 2 ust. 1 pkt 1 ustawy z dnia 5 lipca 1996 r. o doradztwie podatkowym. Operator nie świadczy doradztwa podatkowego ani usług księgowych.
>
> 3) Kwalifikacja źródła przychodu — w szczególności rozstrzygnięcie, czy najem jest wykonywany w ramach pozarolniczej działalności gospodarczej, czy poza nią — wybór formy opodatkowania oraz prawidłowość i kompletność danych wprowadzonych do Aplikacji należą wyłącznie do Gospodarza. Aplikacja przyjmuje zadeklarowane ustawienia bez ich weryfikacji i wykonuje obliczenia zgodnie z nimi.
>
> 4) Zestawienia obejmują wyłącznie dane wprowadzone do Aplikacji. Nie uwzględniają w szczególności: przychodów i kosztów osiąganych poza Aplikacją, ulg i odliczeń innych niż wprost wskazane w zestawieniu, wspólnego rozliczenia z małżonkiem, zaliczek na podatek i składek już zapłaconych, a także zaokrągleń wynikających z przepisów podatkowych.
>
> 5) Operator aktualizuje stawki, progi i kwoty składek stosowane w Aplikacji po ich wejściu w życie i wskazuje w module rok, z którego pochodzą, oraz datę ich ostatniej weryfikacji. Jeżeli dla wybranego roku obowiązujące wartości nie zostały jeszcze wprowadzone, Aplikacja informuje o tym w sposób widoczny przed prezentacją kwot.
>
> 6) Odpowiedzialność za prawidłowe wykonanie zobowiązań podatkowych i składkowych ponosi Gospodarz jako podatnik i płatnik składek. Postanowienie to nie ogranicza odpowiedzialności Operatora w zakresie, w jakim ograniczenie takie byłoby niedopuszczalne wobec Konsumenta lub przedsiębiorcy na prawach konsumenta (§12 ust. 2).

### Poprawka 3 — nowy §12 ust. 5

> 5. Operator odpowiada za działanie narzędzi obliczeniowych Aplikacji na zasadach ogólnych. Operator nie odpowiada za skutki rozliczeń dokonanych przez Gospodarza na podstawie szacunków, o których mowa w §4 ust. 4, w szczególności za skutki wynikające z nieprawidłowych lub niekompletnych danych albo ustawień wprowadzonych przez Gospodarza, ani za skutki niepotwierdzenia kwot z osobą uprawnioną do świadczenia usług doradztwa podatkowego lub prowadzenia ksiąg. Ust. 2 stosuje się.

**Zastrzeżenie do poprawki 3.** Skuteczność tego wyłączenia wobec gospodarza będącego **konsumentem albo przedsiębiorcą na prawach konsumenta** jest **wątpliwa i wymaga oceny prawnika**. Art. 385³ pkt 2 KC ustanawia domniemanie niedozwolonego charakteru postanowienia wyłączającego lub istotnie ograniczającego odpowiedzialność wobec konsumenta; dodatkowo do usługi cyfrowej stosuje się reżim zgodności z umową z rozdziału 5b ustawy o prawach konsumenta (art. 43h i nast.). Klauzula jest świadomie zawężona do **skutków danych i ustawień użytkownika** (a nie do błędów po stronie Operatora) właśnie po to, żeby przejść ten test — ale to jest interpretacja, nie pewność. **Q3 w pakiecie dla prawnika.**

Uwaga dodatkowa: gospodarz na **najmie prywatnym** nie prowadzi działalności gospodarczej — jest wobec WynajemPRO najprawdopodobniej **konsumentem w pełnym znaczeniu** (art. 22¹ KC), nie tylko przedsiębiorcą na prawach konsumenta. To jest istotne dla całego Regulaminu, nie tylko dla tego paragrafu.

---

## 7. Gotowe treści — poprawione etykiety podatkowe

| Miejsce | Obecnie | Po poprawce |
|---|---|---|
| Kwota główna, zdanie pod | „Podatek za osiem minionych miesięcy plus składka zdrowotna. Tyle powinno czekać na koncie, kiedy przyjdzie zapłacić." | „Podatek i składka zdrowotna za 8 miesięcy 2026, liczone narastająco. Nie odejmujemy tego, co już zapłaciłeś w zaliczkach i składkach — to obciążenie za cały ten okres." |
| Zdrowotna (hero) | „Zdrowotna 769 zł × 8 miesięcy" | „Zdrowotna {zdrowotnaMies} zł × {miesiecy} mies." — wartość wyłącznie z `podsumowanie.zdrowotnaMies` |
| Zdrowotna (rachunek) | „Zdrowotna — próg do 300 000 zł · 769,43 × 8" | „Składka zdrowotna za {miesiecy} mies. — przychód 60 000–300 000 zł, {zdrowotnaMies} zł/mies." + wiersz mono: „Próg ustala się narastająco — różnicę dopłaca się w rocznym rozliczeniu składki." |
| Odliczenie | „Odliczenie 50% składki zdrowotnej" | „Odliczenie 50% zapłaconej składki zdrowotnej (art. 11 ust. 1a ustawy o ryczałcie)" — **wiersz wyłącznie przy `rentalBasis === 'business'`** |
| Próg, przed | „Do progu stawka wynosi 8,5%… masz jeszcze cztery miesiące sezonu." | „Do 100 000 zł stawka wynosi 8,5%, od nadwyżki — 12,5%." + mono: „Liczymy tylko przychód z rezerwacji w tej aplikacji." |
| Próg, po | „…warto to wiedzieć, ustalając ceny na wrzesień." | „Od nadwyżki ponad 100 000 zł stawka wynosi 12,5% zamiast 8,5% — każde kolejne 1 000 zł przychodu to 125 zł podatku zamiast 85 zł." |
| Skala, podatek | „Podatek 12% po kwocie wolnej 30 000 zł" | „Podatek według skali (12% / 32%), kwota wolna z Twoich ustawień: {taxFreeAmount} zł" |
| Skala, zdrowotna | „Zdrowotna z Twoich ustawień · 314,10 × 8" | „Zdrowotna z Twoich ustawień · {zusHealth} × {miesiecy}" + mono: „Przy skali zależy od dochodu — liczymy z kwoty, którą podałeś." |
| VAT | „VAT należny 8% \| nie jesteś płatnikiem" | wiersz **usunąć**, gdy `vatNalezny === 0`; gdy > 0: „VAT należny 8% (usługi zakwaterowania)". W Ustawieniach: „płatnikiem" → **„podatnikiem"** |
| Rozjazd, tag | „WIĄŻĄCA" | „W PANELU" |
| Rozjazd, zdanie | „Wiążąca jest ta z bieżących ustawień — najczęściej zmieniłeś formę opodatkowania w trakcie roku." | „W panelu pokazujemy tę policzoną z bieżących ustawień — liczymy ją raz, od całego roku. Przyczyny rozjazdu bywają różne: zmiana formy opodatkowania w trakcie roku albo kwoty wpisane ręcznie przy starszych rezerwacjach." |
| Stare stawki | „…kierunek jest dobry, kwota nie." | „…nie opieraj na tych liczbach decyzji o tym, ile odłożyć — zaktualizujemy je, gdy stawki wejdą w życie." |
| Etykieta kwoty przy starych stawkach | „Do odłożenia za 2027" | „Szacunek wstępny za 2027" |
| Stan pusty | „Podatek policzy się sam, gdy dodasz…" | „Wyliczenie pojawi się, gdy dodasz…" |
| Stopka, znacznik | „STAWKI 2026 · WYLICZONE 24.08.2026" | „STAWKI 2026 · ZWERYFIKOWANE {STAWKI_PODATKOWE.zweryfikowano}" |

---

## 8. RODO (F)

**Krótka odpowiedź: panel nie tworzy nowego celu przetwarzania i nie wymaga zmian w Polityce Prywatności.** Trzy ustalenia:

1. **Brak nowych kategorii danych.** Panel czyta wyłącznie dane, które aplikacja już ma: `rentals` (kwoty, prowizje, koszty), `settings` (forma, składki, VAT). Nie dotyka danych Gości — agreguje kwoty, nie osoby. Nowe jest jedno pole preferencji `settings.taxView` — bez znaczenia z punktu widzenia RODO.
2. **Cel jest już opisany.** `docs/legal/Polityka-prywatnosci.md:88` wymienia „Dane biznesowe Gospodarza: (…) **ustawienia podatkowe**" z celem „Świadczenie funkcji zarządzania wynajmem" i podstawą art. 6 ust. 1 lit. b RODO. **Rekomendacja porządkowa:** doprecyzować cel w wierszu 88 na „Świadczenie funkcji zarządzania wynajmem, w tym pomocniczych zestawień podatkowych".
3. **Art. 22 RODO (zautomatyzowane decyzje) nie ma zastosowania.** Wyliczenie nie jest decyzją administratora wywołującą skutki prawne wobec osoby, której dane dotyczą — to narzędzie obliczeniowe działające na rzecz samego użytkownika, na jego własnych danych, bez profilowania. **Warto to zapisać w rejestrze czynności przetwarzania**, żeby pytanie nie wracało przy każdym audycie.

**Jedna rzecz do odnotowania na przyszłość.** Zbiór `settings.taxForm` + `zusHealth` + `zusSocial` + `hostProfile.taxIdentifier` (który może być PESEL) tworzy razem dość szczegółowy obraz sytuacji finansowej zidentyfikowanej osoby fizycznej. To **nie są** dane szczególnej kategorii (art. 9 RODO), ale podnoszą wrażliwość zbioru w rozumieniu art. 32 RODO. Procedura supportowa z `CLAUDE.md` już to obejmuje — nie wymaga zmian, wymaga świadomości.

**Planowany eksport CSV dla księgowej** (poza tą turą) to inna sytuacja — gospodarz udostępnia dane podmiotowi trzeciemu poza aplikacją. Eksport powinien nieść własne zastrzeżenie w nagłówku pliku (wersja skrócona z §5).

---

## 9. Odpowiedzialność za błąd wyliczenia — synteza (D)

**Podstawa roszczenia.** Art. 471 KC (nienależyte wykonanie zobowiązania), a wobec konsumenta — reżim zgodności usługi cyfrowej z umową (rozdz. 5b ustawy o prawach konsumenta). **Wysokość szkody jest ograniczona i policzalna**: odsetki za zwłokę (art. 53 Ordynacji podatkowej) plus koszt korekty. Odpowiedzialność karnoskarbowa podatnika (KKS) jest osobista i nie przechodzi na dostawcę oprogramowania. **To nie jest ryzyko egzystencjalne dla firmy** — rzędu setek do kilku tysięcy złotych na przypadek.

**Realniejszy jest inny wektor.** Postępowanie UOKiK z tytułu praktyki wprowadzającej w błąd (art. 5 ustawy o przeciwdziałaniu nieuczciwym praktykom rynkowym) jest tańsze dla skarżącego, nie wymaga wykazania szkody i uderza w markę mocniej niż pojedyncze roszczenie. Dlatego **poprawność etykiet ma większe znaczenie niż siła klauzuli wyłączającej**.

**Zabezpieczenia poza tekstem — kolejność wdrożenia:**

1. **Testy złotego zestawu** dla `taxSummary.js` (cztery scenariusze z ręcznie wyliczonymi kwotami). Najtańsze i najskuteczniejsze.
2. **`STAWKI_PODATKOWE.zweryfikowano`** + widoczna data w stopce + bramka CI blokująca build po 12 miesiącach.
3. **Drugi warunek alertu** (`new Date().getFullYear() > S.rok`) — łata lukę z P6.
4. **Rejestr zmian stawek** w `docs/legal/` — data, źródło, kto weryfikował. Dokumentacja należytej staranności, przydatna dokładnie raz: w sporze.
5. **Zadanie cykliczne w Roadmapie**: „aktualizacja stawek podatkowych do 31 stycznia" — z odnośnikiem do tej analizy jako listy rzeczy do sprawdzenia (przeciętne wynagrodzenie za IV kw., minimalne wynagrodzenie, progi ryczałtu, limit VAT, limit działalności nierejestrowanej).

---

## 10. Tabela ustaleń

| Obszar | Stan obecny | Ryzyko | Priorytet | Rekomendacja | Podstawa prawna |
|---|---|---|---|---|---|
| Ryczałt — brak rozróżnienia najem prywatny / działalność | `taxForm === 'lump_sum'` → zawsze doliczana zdrowotna i odliczenie 50% | Zawyżenie „do odłożenia" o ~10 tys. zł/rok; zaniżenie podatku o ~424 zł | BLOKER | Pole `rentalBasis` w Ustawieniach; warunek na zdrowotną i odliczenie | art. 6 ust. 1 i 1a, art. 11 ust. 1a ustawy o ryczałcie; art. 53 Ordynacji |
| Stawka i próg ryczałtu 8,5/12,5% od 100 000 zł | Poprawne dla obu tytułów | brak | — | Bez zmian | art. 12 ust. 1 pkt 4 lit. a i c ustawy o ryczałcie |
| Kwoty składki zdrowotnej 2026 w `constants.js` | 498,35 / 830,58 / 1 495,04 — **poprawne** | brak | — | Bez zmian; mockup ma stawki 2025 | GUS, komunikat z 22.01.2026 |
| Działalność nierejestrowana | Deklarowana w projekcie; liczona stawką 8,5%; Ustawienia jej nie oferują | Utwierdzenie w błędnym statusie; kwoty bez podstawy prawnej | BLOKER | Usunąć z zakresu tury | art. 20 ust. 1ba, art. 27 ust. 1 PIT; art. 5 ust. 1 Prawa przedsiębiorców |
| Podatek liniowy | Liczony stawką 8,5% od przychodu, bez kosztów | Błąd rzędu 10 pkt proc.; zaniżenie | BLOKER | Usunąć z zakresu tury | art. 30c ust. 1 PIT |
| Tag „WIĄŻĄCA" | Kwota z aplikacji nazwana wiążącą | Nieprawda; najbliżej porady; dowód w sporze | BLOKER | „W PANELU" | art. 2 ust. 1 pkt 1 i art. 81 ust. 1 ustawy o doradztwie podatkowym; art. 471 KC |
| „warto to wiedzieć, ustalając ceny" / „cztery miesiące sezonu" | Rekomendacja biznesowa i twierdzenie bez pokrycia | Ryzyko kwalifikacji jako porada; wprowadzenie w błąd | BLOKER | Zostawić arytmetykę, usunąć wezwanie | jw.; art. 5 ustawy o przeciwdziałaniu nieuczciwym praktykom rynkowym |
| Etykieta zdrowotnej | Stawka 2025 + „próg do 300 000 zł" + opis kwoty, której nie zapłacono | Trzy nieprawdziwe twierdzenia w jednym wierszu | BLOKER | Nowe brzmienie (§7) | jw. |
| „Do odłożenia" = kwota już zapłacona | Suma narastająca podana jako „powinno czekać na koncie" | Zamrożenie środków albo pominięcie terminów | BLOKER | Jedno zdanie doprecyzowujące | art. 21 ust. 1 i 1a ustawy o ryczałcie |
| Kwota wolna 30 000 zł przy skali | Domyślnie odejmowana, także gospodarzom z etatem | Zaniżenie podatku do 3 600 zł | BLOKER | Etykieta z pola; podpowiedź; domyślna 0 | art. 27 ust. 1 PIT |
| VAT — „płatnik", stawka 8% dla wszystkich, wiersz dla niepodatników | Błędna terminologia; założenie o kwalifikacji usługi | Mylenie ról; sugerowanie stawki bez podstawy | WAŻNE | „podatnik"; ukryć wiersz przy `vatNalezny === 0` | art. 8 Ordynacji; poz. 47 zał. nr 3 i art. 43 ust. 1 pkt 36 ustawy o VAT |
| Próg 100 000 zł liczony tylko z aplikacji | Brak zastrzeżenia | Fałszywy zapas → nieświadome przekroczenie progu | WAŻNE | Dopisek mono w karcie progu | art. 12 ust. 1 pkt 4 ustawy o ryczałcie |
| Rozbicie na dwie stawki | Liczone od `prog`, nie od `podstawa`; odliczenie w całości do pasma 8,5% | Rachunek się nie zgadza; metoda niezgodna z ustawą | WAŻNE | Liczyć z `podstawa`; rozdzielić proporcjonalnie | art. 11 ust. 3 ustawy o ryczałcie |
| Karta „Przychód i co go zjadło" | „Zostaje Ci" czyta się jako suma kolumny z odejmowaniem | Sugestia, że koszty obniżają ryczałt — wprost zakazana w briefie | WAŻNE | Przenieść do hero albo przemianować i opisać wzór | brief §6 |
| `stawkiAktualne` | Wykrywa tylko rok przyszły | Nieaktualne stawki bez alertu | WAŻNE | `zweryfikowano` + drugi warunek + bramka CI + testy | należyta staranność, art. 471 KC |
| `autoThreshold === false` | Pasek progu mówi co innego niż rachunek | Dwie sprzeczne informacje jako fakt | WAŻNE | Warunek renderowania karty progu | — |
| „Przelicz N rezerwacji" | Nadpisuje dane historyczne, brak treści modala | Utrata śladu pod złożone deklaracje | WAŻNE | Treść modala (P9) | art. 5 ust. 1 lit. d RODO |
| Zastrzeżenie prawne | Jedno zdanie, właściwe miejsce, niepełna treść | Nie wskazuje źródła ryzyka; zawęża do zeznania rocznego | BLOKER (treść) | Nowe brzmienie (§5) | art. 2 ust. 1 pkt 1 ustawy o doradztwie podatkowym |
| Regulamin | §4 ust. 1 bez zastrzeżenia; §12 nie dotyka wyliczeń | Brak umownego rozgraniczenia ról | BLOKER | §4 ust. 4 + §12 ust. 5 (§6) | art. 385¹, 385³ pkt 2 KC; rozdz. 5b ustawy o prawach konsumenta |
| Zaokrąglenia | Kwoty z groszami jako „do zapłaty" | Drobne; mylące dla przelewu | PORZĄDKOWE | Dopisek mono | art. 63 § 1 Ordynacji |
| RODO | Brak nowych kategorii i celów | Znikome | PORZĄDKOWE | Doprecyzować cel w Polityce, wiersz 88 | art. 5 ust. 1 lit. b, art. 22, art. 32 RODO |

---

## 11. Otwarte pytania do prawnika i doradcy podatkowego

*(do dołączenia do `docs/legal/Raport-dla-prawnika-2026-07-22.md` jako sekcja 4.4)*

**Priorytet — bez tego nie uruchamiamy panelu:**

**Q1.** Gdzie w praktyce przebiega granica między narzędziem obliczeniowym a czynnością z art. 2 ust. 1 pkt 1 ustawy o doradztwie podatkowym, gdy aplikacja SaaS prezentuje wyliczenie podatku wraz ze zdaniami kwalifikującymi sytuację użytkownika? Prosimy o **listę sformułowań, których nie wolno użyć** w interfejsie — będzie służyć jako lista kontrolna dla copy.

**Q2.** Czy dopuszczalne jest, by aplikacja pytała użytkownika o rozstrzygnięcie „najem prywatny czy działalność gospodarcza" i liczyła zgodnie z odpowiedzią, czy takie pytanie samo w sobie zbliża nas do doradztwa? Czy podpowiedź o treści zaproponowanej w B1 jest bezpieczna?

**Q3.** Czy projektowany §4 ust. 4 i §12 ust. 5 Regulaminu obronią się wobec gospodarza będącego **konsumentem** albo **przedsiębiorcą na prawach konsumenta** w świetle art. 385³ pkt 2 KC i rozdziału 5b ustawy o prawach konsumenta? Jeśli nie — prosimy o brzmienie, które przejdzie ten test.

**Q4.** Gospodarz prowadzący **najem prywatny** nie jest przedsiębiorcą. Czy wobec niego WynajemPRO zawiera umowę **B2C w pełnym znaczeniu** (art. 22¹ KC)? Jeśli tak, ma to konsekwencje dla całego Regulaminu — w szczególności dla §7 (odstąpienie) i §12.

**Ważne, ale niepilne:**

**Q5.** Czy najem krótkoterminowy z usługami może być prowadzony jako **działalność nierejestrowana** w rozumieniu art. 5 Prawa przedsiębiorców (w brzmieniu od 1.01.2026, limit kwartalny)? Jeżeli nie — czy usunięcie tej formy z aplikacji nie wprowadzi w błąd użytkowników, którzy tak się dziś rozliczają?

**Q6.** Próg 100 000 zł z art. 12 ust. 1 pkt 4 ustawy o ryczałcie: (a) czy sumuje się przychód z art. 6 ust. 1a z przychodem z usług zakwaterowania w działalności, jeżeli podatnik osiąga oba? (b) czy przy małżonkach rozliczających najem wspólnie limit wynosi 200 000 zł i który przepis to reguluje? (c) czy proporcjonalne rozdzielenie odliczenia z art. 11 ust. 3 stosuje się także do odliczenia 50% składki zdrowotnej z art. 11 ust. 1a?

**Q7.** Funkcja „Przelicz N rezerwacji" nadpisuje kwoty podatku zapisane przy rezerwacjach z okresów, za które gospodarz mógł już złożyć deklaracje. Czy powinniśmy zachowywać poprzednie wartości, czy wystarczy ostrzeżenie w modalu? Czy po stronie Operatora powstaje z tego tytułu jakikolwiek obowiązek?

**Q8.** VAT-UE / import usług od prowizji portali jest świadomie poza zakresem. Czy jednoczesne pokazywanie w panelu wiersza „VAT należny 8%" nie tworzy wrażenia, że rozliczenie VAT jest kompletne? Czy potrzebne jest wyraźne zastrzeżenie o zakresie?

**Q9.** Czy stopka „STAWKI 2026 · ZWERYFIKOWANE 24.01.2026" wraz z rejestrem zmian stawek w repozytorium wystarczy jako dowód należytej staranności w ewentualnym sporze o błędne wyliczenie, czy potrzebujemy czegoś więcej (np. wersjonowanego zapisu, którą wersją stawek policzono daną rezerwację)?

---

## Źródła

- [Art. 12 ustawy o zryczałtowanym podatku dochodowym (lexlege)](https://lexlege.pl/zryczl-pod-os-fiz/art-12/)
- [Art. 11 ustawy o zryczałtowanym podatku dochodowym (lexlege)](https://lexlege.pl/zryczl-pod-os-fiz/art-11/)
- [Art. 2 ustawy o doradztwie podatkowym (arslege)](https://arslege.pl/czynnosci-doradztwa-podatkowego/k178/a17159/)
- [Art. 81 ustawy o doradztwie podatkowym (arslege)](https://arslege.pl/bezprawne-poslugiwanie-sie-tytulem-doradcy-podatkowego-lub-wykonywanie-czynnosci-doradztwa-bez-uprawnienia/k178/a17248/)
- [Składka zdrowotna ryczałtowców w 2026 r. (gofin.pl)](https://www.gofin.pl/skladki-zasilki-emerytury/skladki-zus/45278/skladka-zdrowotna-ryczaltowcow-w-2026-r)
- [Składka zdrowotna na ryczałcie w 2026 r. — nowe stawki (infor.pl)](https://ksiegowosc.infor.pl/podatki/ryczalt/stawki-i-rozliczenia/7508332,skladka-zdrowotna-na-ryczalcie-w-2026-r-znamy-juz-nowe-stawki.html)
- [Działalność nierejestrowa — nowy limit w 2026 r. (prawo.pl)](https://www.prawo.pl/biznes/dzialalnosc-nierejestrowa-nowy-limit-w-2026-r,533527.html)
- [Opodatkowanie najmu prywatnego w 2026 r. (poradnikprzedsiebiorcy.pl)](https://poradnikprzedsiebiorcy.pl/-opodatkowanie-najmu-prywatnego)
- [Najem prywatny a składka zdrowotna (poradnikprzedsiebiorcy.pl)](https://poradnikprzedsiebiorcy.pl/-najem-prywatny-a-skladka-zdrowotna)
- [Od 2026 r. wyższy limit zwolnienia podmiotowego z VAT (TPA Poland)](https://www.tpa-group.pl/pl/news/od-2026-r-wyzszy-limit-zwolnienia-podmiotowego-z-vat-kto-skorzysta-i-co-sie-zmieni/)
- [Usługi zakwaterowania w świetle ustawy o VAT (gofin.pl)](https://www.gofin.pl/podatki/17,1,62,271378,uslugi-zakwaterowania-w-swietle-ustawy-o-vat.html)
- [Najem krótkoterminowy a działalność gospodarcza (poradnikprzedsiebiorcy.pl)](https://poradnikprzedsiebiorcy.pl/-najem-krotkoterminowy-a-dzialalnosc-na-zasadach-ogolnych)
