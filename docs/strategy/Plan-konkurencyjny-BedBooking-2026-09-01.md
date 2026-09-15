# Plan konkurencyjny: jak grać przeciw BedBookingowi

**Data:** 2026-09-01 · **Dla:** właściciel · **Status:** finalny
**Poprzedza:** [[strategy/Analiza-konkurencji-Smoobu-i-rynek-2026-08-31]] (tam pełny profil BedBookinga) i [[strategy/Analiza-konkurencji-IdoBooking-2026-08-31]]

Metoda: 2 badaczy (słabości BedBookinga wydobyte z recenzji Google Play/App Store i ich
własnego centrum pomocy; plan darmowy, eksport danych i lock-in), 2 niezależne plany
strategiczne (judo pozycjonowania / plan operacyjny), recenzja adwersaryjna. Werdykt
krytyka przyjęty jako rama całości — łącznie z korektą samego pytania.

---

## 0. Najpierw korekta pytania (werdykt krytyka, przyjęty)

**„Wygrana z BedBookingiem" to źle postawiony cel.** Nasz brief od zawsze mówi:
konkurent nr 1 to Excel — i liczby to potwierdzają: cel rzędu 100–150 płacących kont
nie wymaga odebrania BedBookingowi ani jednego klienta; wymaga wygrania z niekonsumpcją
(zeszyt, arkusz, „jakoś to liczę"). **BedBooking w tym planie pełni dwie role: jest pulą
dojrzałych leadów w konkretnych momentach podatności oraz ryzykiem odwetu — nie wrogiem,
którego trzeba pokonać.** Koegzystencja to stan wyjściowy rynku, nie porażka.

Co z tego wynika praktycznie: nie mierzymy „ilu klientów zabraliśmy BedBookingowi",
tylko „czy istnieje segment gotów płacić za papierologię" (mierniki bety niżej) —
a ruchy przeciw BedBookingowi ograniczamy do tych, które są tanie i celują w momenty,
gdy ich użytkownik i tak się rozgląda.

## 1. Amunicja — co badanie wydobyło z ich recenzji i pomocy

Kontekst uczciwości: 4,6★ przy 4,39 tys. opinii — ogół recenzji jest pozytywny; poniższe
to powtarzalne wyjątki, nie obraz całości. Ale wyjątki są wymowne:

1. **Synchronizacja to ich pięta achillesowa.** „Brak synchronizacji kalendarzy przez
   dosłownie 20 godzin, miałem tzw. overbooking […] Kara od Airbnb to 237 zł, więc nigdy
   w życiu Bedbooking" (Google Play, 1★). Ich architektura offline-first przy konflikcie
   **sama anuluje rezerwację** („błąd synchronizacji nr 5") — artykuł pomocy o tym problemie
   oceniło jako pomocny **0 z 28 czytających**. iCal importują co 10 min, ale przenosi
   tylko daty i etykietę; nowe rezerwacje Airbnb weryfikują **raz na dobę**; ich
   integracja z Airbnb wymusza model prowizji „tylko dla gospodarza" **15,5%**.
   📌 Wniosek dla nas: przewaga „prawdziwego API" nad naszym iCal bywa w praktyce
   mniejsza niż na papierze — i **nie wolno nam obiecywać niezawodności ponad stan**,
   bo dokładnie na tym oni się przejechali.
2. **Trauma podwyżki 2023.** Najpopularniejsza negatywna recenzja w ich Google Play
   (25 głosów „pomocna"): „Nagła zmiana ceny z 35 zł/mies na 215 zł/mies z miejsca
   zdyskwalifikowała…"; druga: „podwyżka o ponad 300% brzmi jak ponury żart".
   📌 To czyni z naszych founding members (cena gwarantowana 12 mies., zmiany
   z 30-dniowym uprzedzeniem) broń precyzyjną: **„Cena zapisana — nie obudzi cię
   podwyżka o 300%."**
3. **Lata obiecywania funkcji** („Panowie z IT obiecują już ponad rok" — o rolach
   pracowników, dowiezionych po latach), **changelog schowany za logowaniem**, nachalne
   prośby o 5★ w notkach wydań. 📌 Nasz publiczny changelog i szczerość granic produktu
   to tani kontrast.
4. **Drobne, ale bolesne:** zmiana liczby osób w pokoju **kasuje cały cennik** obiektu;
   brak osobnych cenników per portal (częściowo); „łóżka" tylko obejściem mimo nazwy
   BedBooking; web-panel latami okrojony względem aplikacji (redesign 6.0 z lipca 2026
   ma to ujednolicać — pierwsza recenzja po nim skarży się na zamrażanie i scroll).
5. **Plan darmowy = zamrażarka, nie narzędzie.** Po 30-dniowym trialu Maxa konto spada
   na Free: dane zostają, funkcje premium zablokowane; granicy funkcjonalnej Free sami
   publicznie nie opisują. Realny próg pracy: Lite 29 zł netto/pokój (bez żadnej
   synchronizacji!). Model per-pokój bez rabatów ilościowych do 50 jednostek;
   wg ich specyfikacji Pro to 79 zł + ~14 zł/kolejny pokój (cennik publiczny sugeruje
   ~28 zł — rozbieżność źródeł, obie wersje netto).
6. **Eksport danych jest przyzwoity** (CSV rezerwacji z kompletem danych; iCal out
   z samymi datami) — ich lock-in to dystrybucja (widżet na stronie, wpięte API),
   nie dane. ⚠️ Eksport CSV wisi w menu „Raporty i finanse", a raporty są od planu
   Plus — **czy działa na Free/Lite, nie wiadomo** [niepewne — do sprawdzenia na koncie
   testowym; to warunek całej ścieżki importu].

## 2. Plan — trzy fazy, w każdej jeden ruch

### Faza BETA (teraz): sfalsyfikować założenia, zanim wydamy czas na wojnę

**Jeden ruch: pomiar.** Cała strategia stoi na dwóch niezbadanych założeniach (gospodarz
sam rozlicza podatek; zapłaci za ślad dowodowy). Zanim zainwestujemy w jakikolwiek ruch
przeciw komukolwiek: każdy tester przechodzi wywiad „czego używałeś wcześniej i dlaczego"
+ mierniki: użycie modułu podatkowego w 1. sesji i powroty · „nas zamiast BedBookinga,
nie obok" · częstość próśb o prawdziwe API · użycie bramki regulaminowej · zgoda na
cytat z imieniem (surowiec fazy 2). Właściciel pomiaru: agent `feedback`.

Równolegle jedyna praca marketingowa tej fazy: **humanizacja landingu** (plan w analizie
Smoobu §7) — bo ich strona jest brzydka, ale masywnie ludzka, i dziś przegrywamy
z tęczowym kalendarzem na zaufanie, nie na estetykę. Plus pisanie treści podatkowych
(SEO potrzebuje miesięcy rozbiegu), ale **bez SEO-mesjanizmu**: w SERP-ach fraz
podatkowych konkurujemy z Infaktem i biurami rachunkowymi, nie z BedBookingiem —
treści traktujemy jako wsparcie odpowiedzi w grupach FB i long-tail, nie jako główny klin.

**Jeśli mierniki podatkowe wyjdą słabo** — plan B gotowy: przełączamy opowieść na cenę
flat vs per-pokój + stabilność cen (founding members); te argumenty działają niezależnie
od podatków.

### Faza LAUNCH (po decyzji o Stripe): zamienić betę w walutę zaufania w 30 dni

**Jeden ruch: social proof sprint.** Oni mają 4,6★ i odznakę pobrań; my — zero waluty
zaufania. Każdy tester = imię, zdjęcie obiektu, cytat, historia „przeszedłem z Excela/
BedBookinga, bo…". Founding members jako dźwignia dokładnie w ich traumę: „wejdź, zanim
podrożeje — cena zapisana na 12 miesięcy". Komunikaty kategorii (nie kalendarza):

- **„Kalendarz mówi, kiedy przyjedzie gość. My mówimy, ile z tego zostanie po podatku
  — i co gość podpisał."**
- **„U nich każdy domek podnosi rachunek. U nas rozwój jest w cenie."** (3 domki
  na ich Pro ≈ 1 300–1 675 zł brutto/rok wg wariantu cennika; u nas 359,88 zł)
- **„BedBooking ma 19 artykułów o podatkach. Żaden nie liczy twojego ryczałtu."**
  (fakt z ich pomocy — używać w treściach, nie w reklamie z nazwy)

### Faza PO LAUNCHU: przejęcia chirurgiczne, nie maszynowe

**Jeden ruch: „przeprowadzka w 10 minut" celowana w dwa momenty podatności:**
koniec ich triala Maxa (szok degradacji do Free) i dodanie 2.–3. obiektu (matematyka
per-pokój zaczyna boleć). Rozstrzygnięcia sporu między planami (za krytykiem):

- **Celujemy w płacących i świeżo zdegradowanych, nie w zadomowionych na Free** —
  kto rok siedzi na Free, udowodnił, że nie zapłaci 29 zł; porównujemy się wyłącznie
  **paid-vs-paid** (do ich Pro, bo dopiero on ma prawdziwą synchronizację).
- **Migracja techniczna jest tania** (ich lock-in to dystrybucja, nie dane): wpięcie
  linków iCal Booking/Airbnb na nowo + checklista ze zrzutami. **Importer ich CSV**
  to mocny pomysł (historia rezerwacji od razu zasila moduł podatkowy przychodem
  narastającym do progu 100 tys. — migracja staje się onboardingiem naszej głównej
  wartości), ale **budowa dopiero po zweryfikowaniu, że eksport działa na planach,
  z których ludzie realnie uciekają** [niepewne dziś].
- **Uczciwy odsiew w landingu przejęciowym:** „mamy iCal co godzinę z alarmem kolizji,
  nie API — jeśli żyjesz z Bookinga w czasie rzeczywistym, zostań tam". Kontrast
  z ich żebraniem o 5★; zaufania nie mamy skąd wziąć inaczej.
- **Strona porównawcza — legalna, jeśli rzetelna** (art. 16 ust. 3 u.z.n.k.): ceny
  z datą i źródłem, jawne netto/brutto, cytaty recenzji tylko z linkiem, zero epitetów,
  przegląd kwartalny (nieaktualna cena = wprowadzenie w błąd). Brzmienia do przeglądu
  `legal` przed publikacją.

## 3. Produkt pod ten plan (kolejność)

1. **Humanizacja landingu** — warunek wejścia; bez tego reszta nie działa.
2. **Tryb tylko-do-odczytu po trialu** — przy wstrzymanym Stripe to jedyny sposób,
   żeby konta z bety dożyły launchu (i nasza wersja ich „dane nie znikają").
3. **Auto-zadania z rezerwacji iCal** — pogłębia wiązkę „papierologia załatwiona"
   tam, gdzie oni z tych samych danych iCal nie robią nic.
4. **Widżet kalendarza na stronę gospodarza — wycięty z fazy 1** (rozstrzygnięcie
   krytyka: to wejście na ich boisko booking engine i nowy koszt utrzymania; wraca
   najwyżej po becie, razem z decyzją request-to-book).

## 4. Czego NIE robić

Wojna cenowa lub własny free (gramy w ich grę) · kopiowanie aplikacji natywnej
(4,6★ przy 4,4 tys. opinii to bitwa nie do wygrania solo) · budowa API Booking teraz
(decyzja dopiero po mierniku bety) · atakowanie z nazwy w reklamie (porównanie liczbowe
tak, dyskredytacja nie — ich recenzje 1★ robią robotę za nas) · **jakiekolwiek zdanie
otwierające od „kalendarza"** — pierwsze słowo zawsze: podatek, podpis, spokój.

## 5. Ślepe plamki, które krytyk słusznie wywlókł (sprawy dla właściciela)

1. **Matematyka działalności nierejestrowanej.** Limit miesięczny (75% minimalnego
   wynagrodzenia) przy 29,99 zł/konto wyczerpuje się w okolicy **~120 płacących kont**
   [orientacyjnie — zależnie od minimalnej 2026/2027; policzyć dokładnie]. Cel launchu
   wymusza przejście na JDG z ZUS-em, który zje istotną część MRR — **próg rentowności
   trzeba policzyć zanim ustalimy cele sprzedażowe launchu**. Spina się wprost
   z zaległym zleceniem **E2** (raport zasadności JDG) — to kolejny powód, żeby E2
   ruszyło.
2. **Utrzymanie obietnicy podatkowej.** „Śpij spokojnie przy urzędzie" = coroczna
   bieżnia zmian prawa (stawki, definicje, KSeF) + ryzyko roszczeń przy błędnym
   wyliczeniu. Mamy już rejestr stawek z datami weryfikacji i disclaimery — ale granicę
   odpowiedzialności (i granicę doradztwa podatkowego) musi ocenić `legal`, zanim
   komunikaty z §2 pójdą w świat.
3. **Support w szczycie podatkowym.** Luty–kwiecień (PIT-28) to nasz naturalny sezon
   kampanii i jednocześnie szczyt pytań — a kanał zgłoszeń działa w trybie zawieszenia
   dla danych osobowych (bez DPA). Obsłużysz to ręcznie sam — zaplanować, nie odkryć
   w lutym.
4. **Odwet nie musi być featurem.** Rabat sezonowy (robią: SUMMER26 −20%), tani „flat
   tier do 3 pokoi" albo pismo prawnicze o stronę porównawczą — solo founder bez budżetu
   prawnego mruga pierwszy. Mitygacja: porównania rzetelne jak w §2, zero prowokacji.
5. **Stripe bez daty.** Oba plany liczą czas „od odblokowania", ale nic go nie wymusza.
   Decyzja o warunku/terminie wznowienia ścieżki A jest Twoja — plan bez tego terminu
   pozostaje listą życzeń.

## 6. Mierniki (definicje, nie wróżby)

- **Beta:** 4 mierniki czarnego scenariusza + odsetek zgód na cytat z imieniem.
- **Launch:** konwersja trial→płatny · „skąd o nas wiesz" przy rejestracji · odsetek
  kont z historią w BedBookingu (ankieta wejściowa) · liczba opublikowanych testimoniali.
- **Po launchu:** retencja miesięczna · churn z powodem · wejścia organiczne na frazy
  podatkowe i przejęciowe („bedbooking alternatywa") · przejęcia z momentu degradacji.

---

## Metodologia i źródła

Recenzje: Google Play (com.rst.bedbooking, filtr 1★, cytaty z datami i liczbą głosów
„pomocna"), App Store PL (id 826280602). Centrum pomocy support.bed-booking.com
(iCal co 10 min i zakres danych, Booking co 1 min i znany problem restrykcji, Airbnb
15,5% host-only i weryfikacja raz na dobę, trial/Free, eksport CSV, usuwanie konta),
cennik + pricing.pl.md, strona enterprise, wtyczka WordPress. Plany strategiczne: dwa
niezależne + recenzja adwersaryjna; sprzeczności rozstrzygnięte wg werdyktu krytyka
(Free nie jest targetem; widżet kalendarza wycięty z fazy 1; migracja tylko dla
niezależnych od API). Szacunki i rzeczy niezweryfikowane oznaczone [niepewne]/[orientacyjnie].
