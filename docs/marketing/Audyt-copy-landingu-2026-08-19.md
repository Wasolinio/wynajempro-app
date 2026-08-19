# Audyt tekstów na landingu — 2026-08-19

> **Zakres:** `src/pages/landing/LandingPage.jsx` (cała treść widoczna), `src/pages/landing/LandingScrollDemo.jsx`
> (demo panelu, osadzone w landingu), `index.html` (`title`, `description`, Open Graph).
> **Podstawa merytoryczna:** [[strategy/X11-Plan-marketingowy-launchu]] §3 (co wolno obiecywać) i §4 (ICP),
> 9 artykułów z `docs/support/` (co produkt naprawdę robi), kod (`functions/index.js`, `ManagerApp.jsx`).
> **Metoda:** skill `humanizer` + kalibracja `PL.md` (polskie tellery AI), zasada dowodu z [[Team-Playbook]].
> **Status:** propozycje do decyzji właściciela. **Nic nie zostało wdrożone** — kodu nie ruszałem,
> wdrożenie po akceptacji robi `dev`.

---

## 1. Werdykt w trzech zdaniach

Największy problem tej strony nie polega na tym, że jest źle napisana, tylko na tym, że **obiecuje produkt,
którego nie mamy**: „dwukierunkowa synchronizacja w czasie rzeczywistym", „kod wysłany automatycznie w dniu
przyjazdu", „nasz zespół wsparcia" i „właściciele wybierają" to zdania o firmie i funkcjach, które nie istnieją,
a jednocześnie milczą o dwóch rzeczach, które naprawdę mamy i których konkurencja nie ma (dane dostępowe
odsłaniane po akceptacji regulaminu z zapisanym śladem oraz stała cena za konto).

Druga warstwa problemu to dokładnie to, co zgłosił właściciel: około **jedna trzecia zdań to wypełniacze** —
sekcja „Wartości" jest brand bookiem przepisanym na stronę dla klienta, zdanie „Wszystko, co musisz wiedzieć
przed startem" nie niesie żadnej informacji, a „nie wymaga instrukcji obsługi" pada dwa razy na jednym ekranie.

Trzecia warstwa to SEO: **H1 „Wynajem pod kontrolą" nie zawiera ani jednego słowa, którego ktokolwiek szuka**,
a żadna z trzech fraz long-tail z X11 §5 K2 nie występuje na stronie w żadnej postaci.

---

## 2. Sekcja po sekcji: obecne brzmienie, diagnoza, propozycja

Cytaty są 1:1 z pliku, numery linii z wersji z 2026-08-19 (commit `08083d6`).

### 2.1 Hero (linie 193–216)

| Obecnie (linia) | Diagnoza | Propozycja |
|---|---|---|
| `System dla mikro-gospodarzy` (193) | „Mikro-gospodarz" to nasze słowo, nie ich. Nikt się tak o sobie nie mówi i nikt tego nie wpisuje w wyszukiwarkę. Etykieta zajmuje najlepsze miejsce na stronie i nie robi nic. | `Program do zarządzania wynajmem krótkoterminowym` — **dlaczego lepiej:** to dokładna fraza z X11 §5 K2, wpada w H1-kontekst naturalnie i od pierwszej sekundy mówi, czym to jest. |
| `Wynajem <em>pod kontrolą</em>.` (194–196) | Nagłówek pasuje do banku, siłowni i firmy ochroniarskiej. Zero konkretu, zero frazy wyszukiwania, zero bólu ICP. Najdroższa linijka na stronie zużyta na slogan. | `Wynajem krótkoterminowy bez arkusza <em>Excela</em>.` — **dlaczego lepiej:** nazywa realnego konkurenta numer jeden (X11 §2 kategoria E: Excel i kalendarz), zawiera frazę „wynajem krótkoterminowy" i zachowuje układ marki (kursywa Newsreader + kropka cynobrowa). |
| `Zautomatyzuj kalendarz, finanse i komunikację z gośćmi w jednym precyzyjnym panelu, który nie wymaga instrukcji obsługi.` (197–200) | Trzy tellery naraz: reguła trzech (PL.md §10), pusty wzmacniacz „precyzyjnym" (nic nie znaczy przy panelu), oraz „nie wymaga instrukcji obsługi" powtórzone dosłownie 80 linii niżej (279–280). Do tego „komunikacja z gośćmi" sugeruje moduł wiadomości, którego nie ma. | `Jeden panel na wszystkie domki i apartamenty: kalendarz rezerwacji, rozliczenia i przewodnik dla gościa. Stała cena za konto, nie za obiekt.` — **dlaczego lepiej:** wylicza realne moduły zamiast czasowników marketingowych i od razu stawia klin cenowy z X11 §3.1, zamiast chować go do cennika. |
| `Karta kredytowa nie jest wymagana` (210–211) | Poprawne, ale sformułowane od strony tego, czego nie ma. Strona bierna i konstrukcja przecząca zamiast faktu. | `14 dni testów bez podawania karty` — **dlaczego lepiej:** ta sama informacja jako fakt, plus liczba, której nie ma nigdzie indziej w zasięgu wzroku. |
| `<span className="wp4-label wp4-label--faint">Synchronizacja</span>` + `Airbnb` + `Booking.com` (213–215) | Ten pasek wygląda dokładnie jak sekcja „zaufali nam / partnerzy". Czytelnik odczyta go jako partnerstwo z Booking i Airbnb, a my tylko czytamy ich publiczne linki iCal. To najcichsze, ale realne wprowadzenie w błąd. | Etykieta: `Import kalendarza (iCal)` — **dlaczego lepiej:** jedno słowo („import") zdejmuje sugestię partnerstwa i mówi prawdę o mechanizmie, nie tracąc rozpoznawalności logotypów słownych. |
| `▲ 12% VS 2025`, `69 520 zł`, `Apartament Centrum … 33 280 zł` (224–253) oraz podpis `RYS. 1 — Panel zysku netto` (257) | Liczby są wymyślone i to jest w porządku w makiecie — **pod warunkiem że makieta jest podpisana jako makieta**. Dziś nie jest, a 20 linii niżej ta sama kwota („Zysk 33 280 zł") jest cytowana jako przykład „konkretów i liczb". W tym zestawieniu wygląda to jak wynik klienta, którego nie mamy. | Podpis: `RYS. 1 — Panel zysku netto (dane przykładowe)`. **Docelowo:** podmienić na realne liczby z Domków Letniskowych Ruś, na co właściciel wyraził zgodę (X11 §5). — **dlaczego lepiej:** koszt zerowy, a znika jedyny fragment strony, który da się odczytać jako fałszywy dowód. |

### 2.2 Sekcja „Wartości" (linie 263–292) — do usunięcia albo do przepisania od zera

To najsłabsza sekcja na stronie i **dokładnie ten przypadek, o którym mówił właściciel**. Powód jest prosty:
to jest rozdział „ton głosu" z brand booka opublikowany dla klienta. Gospodarz z dwoma domkami nie kupuje
narzędzia dlatego, że jego producent pisze krótkimi zdaniami.

| Obecnie (linia) | Diagnoza | Propozycja |
|---|---|---|
| `01 · Rzeczowy` / `Konkrety i liczby zamiast obietnic` / `„Zysk 33 280 zł", nie „rosnące przychody". Każda decyzja oparta na realnych danych z Twoich obiektów.` (267–272) | Cytuje wymyśloną liczbę z makiety jako dowód rzeczowości. Zdanie „Każda decyzja oparta na realnych danych" jest bezpodmiotowe i nie mówi, czyja to decyzja ani na czym polega. | `01 · Skąd to się wzięło` / `Napisane przez gospodarza, nie przez software house` / `Prowadzę Domki Letniskowe Ruś i sam obsługuję gości. Aplikacja powstała, bo arkusz w Excelu przestał nadążać za rezerwacjami z trzech kanałów.` — **dlaczego lepiej:** to jedyny dowód, jaki naprawdę mamy (X11 §4), jest niepodrabialny i inni gospodarze go rozpoznają. |
| `02 · Spokojny` / `Ton narzędzia, nie sprzedawcy` / `Krótkie zdania, bez wykrzykników i żargonu. Interfejs, który nie wymaga instrukcji obsługi.` (276–280) | Deklaracja o własnym stylu pisania na stronie sprzedażowej. Poza tym: „Interfejs, który nie wymaga instrukcji obsługi" to dosłowne powtórzenie z hero (199) i twierdzenie podważone przez fakt, że mamy centrum pomocy z 9 artykułami. | `02 · Dla kogo` / `Jeden człowiek, kilka obiektów` / `Bez recepcji i bez działu operacyjnego. Panel zakładasz sam i obsługujesz go między jednym przyjazdem a drugim.` — **dlaczego lepiej:** zamienia autokomplement na opis sytuacji czytelnika, po którym on się rozpozna albo odrzuci ofertę (obie odpowiedzi są dla nas dobre). |
| `03 · Po imieniu` / `Jeden człowiek, kilka obiektów` / `Mówimy do Ciebie wprost. Zbudowany dla gospodarza, nie dla korporacji z działem operacyjnym.` (284–288) | Trzeci raz z rzędu konstrukcja „X, nie Y" (negatywny paralelizm, humanizer §9). „Mówimy do Ciebie wprost" to zapowiedź mówienia zamiast mówienia (PL.md §28). | `03 · Za ile` / `Stała cena za konto, nie za obiekt` / `29,99 zł miesięcznie niezależnie od tego, czy masz jeden domek, czy pięć. Bez prowizji od rezerwacji.` — **dlaczego lepiej:** najostrzejsza i najłatwiejsza do sprawdzenia różnica wobec konkurencji (X11 §3.1) pada w pierwszej trzeciej strony, a nie dopiero w cenniku. |

**Wariant tańszy:** skasować całą sekcję (266–289). Strona nic nie traci, bo żadna z tych trzech kart nie
niesie informacji o produkcie.

### 2.3 Nagłówek sekcji „Funkcje" (linie 297–303)

| Obecnie (linia) | Diagnoza | Propozycja |
|---|---|---|
| `Wszystko, co składa się na spokojny wynajem` (299) | „Wszystko, co składa się na" to pusta rama. Nagłówek nie mówi, co jest niżej, i nie zawiera żadnej frazy. | `Cztery rzeczy, które przestajesz robić ręcznie` — **dlaczego lepiej:** zapowiada konkretnie liczbę i charakter tego, co następuje, i mówi o czynności czytelnika, nie o abstrakcji. |
| `Funkcje, które zdejmują z Twoich barków najwięcej powtarzalnej pracy — bez zbędnych opcji rodem z systemów hotelowych.` (300–303) | Frazes reklamowy („zdejmują z barków"), myślnik użyty tylko dla rytmu (PL.md §14), a druga połowa zdania powtarza to, co sekcja „Dla kogo" mówi 200 linii niżej całą tabelą porównawczą. | **Do skasowania** albo: `Kalendarz, finanse, podatki i przewodnik dla gościa. Bez modułów, których nigdy nie otworzysz.` — **dlaczego lepiej:** wymienia to, co faktycznie jest w panelu, zamiast opisywać uczucie ulgi. |

### 2.4 Karta „Kalendarz" (linie 308–320) — **najpoważniejsza nieprawda na stronie**

| Obecnie (linia) | Diagnoza | Propozycja |
|---|---|---|
| `Koniec z podwójnymi rezerwacjami` (309) | Dobry nagłówek. Ból w języku klienta, bez żargonu. **Zostawić.** | (bez zmian) |
| `Dwukierunkowa synchronizacja iCal w czasie rzeczywistym. Rezerwacja na Booking natychmiast blokuje termin na Airbnb i w panelu.` (310–314) | **Nieprawda w trzech miejscach.** Automatyczna synchronizacja chodzi **raz na dobę o 06:00** (`functions/index.js:769–772`), poza tym tylko ręcznym przyciskiem. W drugą stronę portale odświeżają nasz link „od kilku do kilkunastu godzin" (`docs/support/synchronizacja-ical.md`, sekcja FAQ). „W czasie rzeczywistym" i „natychmiast" to obietnica channel managera, której X11 §3 zabrania wprost. To jest zdanie, które wraca jako zwrot pieniędzy w drugim miesiącu. | `Wklejasz linki iCal z Booking.com i Airbnb. Rezerwacje z portali wpadają do kalendarza automatycznie co rano, a poza tym w każdej chwili przyciskiem „Synchronizacja". Ten sam mechanizm działa w drugą stronę: rezerwacje bezpośrednie blokują terminy w portalach.` — **dlaczego lepiej:** opisuje dokładnie to, co robi kod, i nadal brzmi jak rozwiązanie problemu, bo dla gospodarza z Excelem „co rano samo" to ogromna zmiana. |
| `BOOKING ⇄ WYNAJEM PRO ⇄ AIRBNB` (316–320) | Strzałka `⇄` wzmacnia nieprawdziwą sugestię dwukierunkowości w czasie rzeczywistym. Dodatkowo to znak Unicode w roli ikony, co łamie zasadę identyfikacji (markery = ikony lucide). | `IMPORT CO RANO` + `EKSPORT LINKIEM iCal` jako dwa tagi, bez strzałek Unicode. — **dlaczego lepiej:** ta sama informacja wizualna, bez obietnicy, której nie dowozimy, i zgodnie z systemem ikon. |

### 2.5 Karta „Finanse" (linie 326–333)

| Obecnie (linia) | Diagnoza | Propozycja |
|---|---|---|
| `Zysk na czysto liczony automatycznie` (326) | Poprawne, ale pomija to, co odróżnia nas od zagranicznej konkurencji: podatek. | `Widzisz, ile zostaje po prowizjach i podatku` — **dlaczego lepiej:** wprowadza podatek do obietnicy, a to jedyna rzecz, której kategoria A (Smoobu, Lodgify) nie zna w polskich realiach. |
| `Przychód, koszty i prowizje portali w jednym miejscu. Widzisz, ile naprawdę zostaje w kieszeni po odliczeniu Booking i Airbnb.` (327–330) | To jest najbliższe językowi klienta zdanie na całej stronie. Wymaga tylko uzupełnienia o realne funkcje: koszty stałe, raport roczny, CSV dla księgowego (`docs/support/finanse-i-raporty.md`). | `Przychód, prowizje portali, koszty stałe i podatek w jednym zestawieniu. Raport roczny drukujesz do PDF, a plik CSV wysyłasz księgowemu.` — **dlaczego lepiej:** dokłada dwie rzeczy, które realnie zamykają miesiąc, i pierwszy raz na stronie pada słowo „księgowy", którego szuka nasze ICP. |
| `+33 280 zł` / `zysk / obiekt` (332–333) | Wymyślona liczba w miejscu, które wygląda na wynik. | `RAPORT ROCZNY` + `PDF I CSV` — **dlaczego lepiej:** zamienia fałszywy dowód na prawdziwą funkcję. |

### 2.6 Karta „Goście" (linie 339–346) — **najbardziej zmarnowana szansa na stronie**

| Obecnie (linia) | Diagnoza | Propozycja |
|---|---|---|
| `Cyfrowy przewodnik gościa premium` (339) | „Premium" to pusty przymiotnik promocyjny (humanizer §4, PL.md §4). Nie ma planu premium, więc słowo nie znaczy nic. | `Kod do drzwi dopiero po akceptacji regulaminu` — **dlaczego lepiej:** nagłówek przestaje chwalić, a zaczyna opisywać mechanizm, który jest naszą realną przewagą (X11 §3.2) i którego dziś nie ma na stronie ani w jednym zdaniu. |
| `Koniec z drukowanymi kartkami. Wi-Fi, kod do drzwi i instrukcje trafiają na telefon gościa automatycznie — przed przyjazdem.` (340–343) | **Nieprawda.** Aplikacja **niczego nie wysyła**. Gospodarz kopiuje link albo drukuje kod QR i wysyła go sam (`docs/support/przewodnik-goscia.md`, sekcja „Udostępnianie"). Nie ma harmonogramu, nie ma wysyłki, nie ma powiązania z datą przyjazdu. Do tego pierwsze zdanie jest powtórzone dosłownie w sekcji niżej (377). | `Wysyłasz gościowi jeden link albo wieszasz kod QR w obiekcie. Dojazd, zasady i instrukcje widzi od razu, a hasło do Wi-Fi i kod do drzwi odsłaniają się dopiero, gdy potwierdzi regulamin i instrukcję PPOŻ.` — **dlaczego lepiej:** opisuje realny przepływ i przy okazji sprzedaje funkcję, której nie ma ani MójWynajem, ani nikt w tej cenie. |
| `KOD WYSŁANY` + `auto · w dniu przyjazdu` (345–346) | Dwie nieprawdy w pięciu słowach: nic nie jest wysyłane i nic nie jest powiązane z dniem przyjazdu. | `REGULAMIN ZAAKCEPTOWANY` + `zapisano z datą` — **dlaczego lepiej:** pokazuje to, co system naprawdę robi, i podnosi to, co dla gospodarza ma wartość przy sporze z gościem. |
| *(brak)* | Na stronie **nigdzie** nie pada informacja, że akceptacja regulaminu zapisuje się z datą i treścią obowiązującą w tym momencie. To jest ochrona prawna gospodarza i najmocniejszy argument, jakim dysponujemy. | Dopisać zdanie: `Potwierdzenie zapisuje się razem z datą i treścią regulaminu z tego dnia, więc przy sporze masz ślad, że gość znał zasady, zanim dostał kod.` — **dlaczego lepiej:** X11 §3.2 nazywa to naszym klinem; dziś jest zakopane w artykule pomocy, do którego nikt nie dotrze przed rejestracją. |

### 2.7 Karta „Podatki" (linie 352–357)

| Obecnie (linia) | Diagnoza | Propozycja |
|---|---|---|
| `Ryczałt rozliczony bez stresu` (352) | „Bez stresu" nic nie mierzy i nic nie obiecuje. | `Ryczałt, skala i VAT liczone przy rezerwacji` — **dlaczego lepiej:** wymienia trzy realne tryby z ustawień podatkowych zamiast obiecywać stan emocjonalny. |
| `System pilnuje progu 100 000 zł i sam przełącza stawkę z 8,5% na 12,5%.` (353–356, zdanie 1) | **Prawda**, potwierdzone w `docs/support/finanse-i-raporty.md` („Automatyczny próg (8,5% do 100k, 12,5% powyżej)"). Zostawić. | (bez zmian, wpleść w nowy akapit) |
| `Koniec z ręcznym liczeniem i strachem przed kontrolą.` (356–357) | **Do skasowania bez dyskusji.** Sugeruje, że aplikacja chroni przed kontrolą skarbową. Nie chroni. X11 §3 zabrania wprost twierdzenia, że zastępujemy księgowego; sam artykuł pomocy mówi „Wyliczenia mają charakter pomocniczy i nie zastępują księgowości". To jest zdanie z największym potencjałem na reklamację. | Zastąpić uczciwym zastrzeżeniem: `To zestawienie dla Ciebie i dla księgowego, nie deklaracja podatkowa.` — **dlaczego lepiej:** przy tej grupie odbiorców przyznanie się do granicy produktu buduje więcej zaufania niż obietnica spokoju, a przy okazji zamyka drogę do sporu. |
| *(cały akapit — brzmienie docelowe)* | — | `Rozliczenie najmu krótkoterminowego ryczałtem liczy się przy każdej rezerwacji. Ustawiasz stawkę raz, a system pilnuje progu 100 000 zł i sam przechodzi z 8,5% na 12,5%. Obsłuży też skalę podatkową i VAT 8%. To zestawienie dla Ciebie i dla księgowego, nie deklaracja podatkowa.` — **dlaczego lepiej:** wnosi dokładną frazę long-tail z X11 §5 K2 („rozliczenie najmu krótkoterminowego ryczałt") w zdaniu, które i tak trzeba było napisać. |

### 2.8 Sekcja „Przewodnik gościa" (linie 372–388)

| Obecnie (linia) | Diagnoza | Propozycja |
|---|---|---|
| `Wszystko, czego gość potrzebuje — <em>zanim zapyta</em>` (373–375) | Nagłówek jest zgrabny, ale mówi o gościu, a płaci gospodarz. Nie ma w nim ani jednej informacji. | `Gość dostaje link i przestaje dzwonić z tymi samymi pytaniami` — **dlaczego lepiej:** przenosi korzyść na osobę, która podejmuje decyzję o zakupie, i nazywa konkretną stratę (wieczorne telefony), którą ICP zna. |
| `Koniec z drukowanymi kartkami i powtarzanymi w kółko pytaniami. Wi-Fi, kod do drzwi, zasady i dojazd trafiają na telefon gościa automatycznie, jeszcze przed przyjazdem.` (376–380) | Powtórzenie karty z sekcji „Funkcje" (340–343) z tą samą nieprawdą o automatycznej wysyłce. Dwa akapity o tym samym w odległości jednego ekranu to definicja wypełniacza. | `Jedna strona z dojazdem, zasadami, instrukcją PPOŻ i poleconymi miejscami. Wysyłasz link SMS-em albo wieszasz kod QR w domku. Gość otwiera go w przeglądarce, bez zakładania konta i bez instalowania czegokolwiek.` — **dlaczego lepiej:** nie duplikuje karty wyżej, tylko dokłada to, czego tam nie było (PPOŻ, polecane miejsca, QR, brak instalacji). |
| `Kod do zamka wysłany w dniu przyjazdu` (382) | **Nieprawda.** Nie ma wysyłki ani harmonogramu. | `Hasło Wi-Fi i kod do drzwi odsłaniają się po akceptacji regulaminu` |
| `Instrukcje i regulamin w jednym miejscu` (383) | Prawda, ale najsłabszy punkt z trzech. | `Akceptacja zapisuje się z datą i treścią regulaminu z tego dnia` |
| `Mniej telefonów „o której kończy się doba?"` (384) | Najlepsze zdanie w tej sekcji. Konkretne, w cudzysłowie, w języku gospodarza. **Zostawić bez zmian.** | (bez zmian) |
| *(brak czwartego punktu)* | — | `Zmieniasz hasło Wi-Fi bez wysyłania nowego linku` — **dlaczego lepiej:** to realna funkcja z FAQ artykułu pomocy i odpowiada na obiekcję, którą gospodarz ma od razu. |

### 2.9 Demo panelu — `LandingScrollDemo.jsx` (osobny plik, ta sama strona)

Właściciel prosił o audyt tekstu na stronie, więc odnotowuję: demo panelu to również tekst widoczny dla klienta
i zawiera **cztery twierdzenia niezgodne z produktem**.

| Obecnie (plik: linia) | Diagnoza | Propozycja |
|---|---|---|
| `Dane pobytu, przewodnik i kod do skrytki w jednym miejscu. Automatyczne wiadomości robią resztę.` (`LandingScrollDemo.jsx:33`) | „Automatyczne wiadomości" nie istnieją. Aplikacja nie wysyła gościom niczego. | `Dane pobytu, przewodnik i kod do skrytki w jednym miejscu. Link do przewodnika wysyłasz jednym kliknięciem.` |
| Tag `WYSŁANY` przy przewodniku oraz `WIDOCZNY OD 9 LIP, 13:00` (`:175`, `:180`) | Sugeruje wysyłkę i harmonogram odsłaniania kodu według daty. Odsłonięcie następuje po akceptacji regulaminu, nie o godzinie. | `ZAAKCEPTOWANY` oraz `ODBLOKOWANY 9 LIP, 13:04` |
| Pozycja `Nocowanie` na liście „SYNCHRONIZACJA" w sidebarze makiety (`:448`) | W Ustawieniach istnieją pola iCal **tylko dla Booking.com i Airbnb** (`ManagerApp.jsx:506`). „Nocowanie" jest źródłem rezerwacji wpisywanym ręcznie, nie integracją. Makieta obiecuje trzecią integrację. | Usunąć wiersz albo zastąpić realnym stanem („Booking.com", „Airbnb"). |
| Znaczniki `2 MIN` / `5 MIN` przy kanałach (`:446–447`) | Sugerują synchronizację sprzed kilku minut, czyli znów „czas rzeczywisty". W realnym panelu widnieje `OK` albo `—`. | `OK` przy obu kanałach, zgodnie z tym, co użytkownik zobaczy po zalogowaniu. |
| `app.wynajempro.pl` i `wynajempro.pl/g/centrum-md48` (`:420`, `:176`) | Domena kanoniczna to **wynajempro.com** (decyzja z 2026-07-21, `SeoTags.jsx:20`). Makieta pokazuje nieistniejący adres. | `app.wynajempro.com` / `wynajempro.com/guide/...` |
| `Gotowy raport eksportujesz do PDF jednym kliknięciem.` (`:38`) | Realny przepływ: przycisk „Drukuj / PDF" otwiera okno drukowania przeglądarki, w którym wybiera się zapis do PDF. Jedno kliknięcie to nadużycie, ale drobne. | `Raport roczny drukujesz do PDF, a zestawienie pobierasz w CSV dla księgowego.` |

### 2.10 „Jak to działa" (linie 461–488)

| Obecnie (linia) | Diagnoza | Propozycja |
|---|---|---|
| `Od rejestracji do pierwszej rezerwacji w 2 minuty` (462) | Liczba jest nie do obrony przy rejestracji e-mailem: trzeba odebrać wiadomość i kliknąć link weryfikacyjny (`docs/support/pierwsze-kroki.md`, krok 1). Artykuł pomocy mówi ostrożniej: „kilka minut". Obietnica, która pęka w pierwszej minucie kontaktu z produktem, jest gorsza niż brak obietnicy. | `Od rejestracji do pierwszej rezerwacji w kilka minut` — **dlaczego lepiej:** ta sama korzyść, bez liczby, którą produkt natychmiast podważa. |
| `Podaj e-mail i hasło. Bez podpinania karty i ukrytych haczyków — dostajesz 14 dni na pełne testy.` (468–471) | „Ukryte haczyki" to język sprzedawcy używanych aut. Myślnik dla rytmu. Pominięta rejestracja przez Google i pominięta weryfikacja adresu. | `Rejestrujesz się e-mailem albo kontem Google. Karty nie podajesz. Przy rejestracji e-mailem potwierdzasz adres linkiem ze skrzynki i masz 14 dni pełnego dostępu.` — **dlaczego lepiej:** uprzedza jedyny moment, w którym nowy użytkownik może odpaść (mail w SPAM-ie), zamiast go ukrywać. |
| `W ustawieniach wpisz nazwy domków lub apartamentów i nadaj im własne kolory na kalendarzu.` (477–478) | **Prawda i dobrze napisane.** Zostawić. Ewentualnie dodać, że konto startuje z przykładowymi obiektami do podmiany. | `W ustawieniach podmieniasz przykładowe obiekty na swoje i nadajesz im kolory na kalendarzu.` |
| `Zaznacz daty. System od razu wyliczy zysk na czysto i zaplanuje wysyłkę kodu PIN dla gościa.` (485–486) | **Nieprawda.** Nie ma planowania wysyłki i nie ma wysyłki kodu PIN. Trzeci raz na stronie ta sama zmyślona funkcja. | `Wybierz obiekt, daty i kwotę. Prowizja i podatek policzą się same, a rezerwacja wejdzie do kalendarza i do raportu.` — **dlaczego lepiej:** opisuje to, co faktycznie dzieje się po zapisaniu wpisu, i zamyka pętlę „dodałem rezerwację, mam liczby". |

### 2.11 „Dla kogo" i porównanie (linie 498–527)

| Obecnie (linia) | Diagnoza | Propozycja |
|---|---|---|
| `System szyty na miarę, <em>nie skomplikowany moloch</em>` (498–500) | „Szyty na miarę" to frazes, „moloch" to wyzwisko wobec konkurencji, które nic nie mówi o nas. Zero frazy wyszukiwania w najważniejszym H2 na stronie. | `Program do zarządzania wynajmem krótkoterminowym dla 1–15 obiektów` — **dlaczego lepiej:** dokładna fraza z X11 §5 K2 w H2, plus liczba, po której czytelnik natychmiast wie, czy to o nim. |
| `Obsługujesz wynajem po godzinach? Zobacz, dlaczego właściciele 1–20 obiektów wybierają lekkie narzędzie zamiast oprogramowania hotelowego.` (501–505) | **To zdanie musi zniknąć w całości.** „Zobacz, dlaczego właściciele wybierają" to twierdzenie o istniejącej bazie klientów. **Nie mamy ani jednego klienta.** To nie jest kwestia stylu, tylko nieprawdziwej informacji handlowej. Osobno: „1–20" kłóci się z ICP 1–15 z X11 §4. | `Prowadzisz domki albo apartamenty obok pracy, bez recepcji i bez asystentki. Systemy hotelowe liczą sobie za pokój i mają moduły, których nigdy nie otworzysz.` — **dlaczego lepiej:** opisuje czytelnika i konkurencję zamiast powoływać się na nieistniejący dowód społeczny. |
| `Przeładowany interfejs pełen opcji, których nigdy nie użyjesz` (512) | Opinia bez pokrycia, powtarzająca to, co mówi już lead sekcji. | **Do skasowania.** |
| `Koszty od kilkuset do kilku tysięcy złotych rocznie` (513) | Fałszywy zakres (humanizer §12): „od kilkuset do kilku tysięcy" to rozpiętość, która nie mierzy niczego. A mamy **prawdziwe, źródłowe liczby** w X11 §2 i ich nie używamy. | `Cennik liczony za obiekt: przy pięciu domkach płacisz pięć razy` + drugi punkt z konkretem: `Smoobu: od 26,10 € miesięcznie za jeden obiekt plus 0,9% prowizji od rezerwacji (cennik smoobu.com, odczyt 18.08.2026)` — **dlaczego lepiej:** liczba z datą odczytu i źródłem jest sprawdzalna, a „pięć razy" robi robotę, której nie zrobi żaden przymiotnik. **Uwaga: użycie nazwy konkurenta z ceną to reklama porównawcza — wymaga opinii `legal` przed publikacją. Wariant bezpieczny bez nazwy: `Cenniki liczone za obiekt zaczynają się od ok. 110 zł miesięcznie za jeden obiekt (cenniki producentów, odczyt 18.08.2026)`.** |
| `Skomplikowane generowanie raportów „hotelowych"` (514) | Wypełniacz. Nikt nie wybiera systemu, myśląc o trudności generowania raportów. | **Do skasowania.** |
| `Brak polskiego ryczałtu i funkcji pod mały wynajem` (515) | Prawda i mocny punkt, tylko rozmyty przez „funkcje pod mały wynajem". | `Ryczałt, PIT i VAT po polsku: brak` + `Interfejs i wsparcie po angielsku albo w tłumaczeniu` — **dlaczego lepiej:** dwa sprawdzalne fakty zamiast jednego półfaktu. |
| `Automatyczne przewodniki dla gości na każdy obiekt` (524) | Znowu „automatyczne". Przewodnik tworzy i wysyła gospodarz. | `Przewodnik gościa dla każdego obiektu, z linkiem i kodem QR` |
| `Zautomatyzowane podatki i podsumowanie miesiąca jednym kliknięciem` (525) | „Zautomatyzowane podatki" brzmi jak rozliczenie z urzędem. Liczymy podatek przy rezerwacji, nie rozliczamy. | `Podatek liczony przy rezerwacji, raport roczny w PDF i CSV` |
| `Stała, niska cena niezależnie od liczby rezerwacji` (526) | „Niska" to ocena, nie fakt — a przy 29,99 zł obok MójWynajem za 26–29 zł (X11 §2) nawet nieprawdziwa. Poza tym różnicą jest liczba **obiektów**, nie rezerwacji. | `29,99 zł za konto, niezależnie od liczby obiektów i rezerwacji` — **dlaczego lepiej:** podaje liczbę zamiast przymiotnika i trafia w prawdziwą oś różnicy. |
| *(brak)* | Moduł **„Opinie"** (pozycja 07 w panelu, `docs/support/strona-opinii.md`) nie występuje na landingu ani razu. To gotowa funkcja, która pomaga gospodarzowi zdobywać opinie na Google i Booking. | Dodać punkt: `Strona z podziękowaniem i prośbą o opinię po pobycie (Google, Booking.com, Airbnb)` |

### 2.12 Cennik (linie 538–583)

| Obecnie (linia) | Diagnoza | Propozycja |
|---|---|---|
| `Zwraca się szybciej niż jedna doba najmu` (538) | Arytmetycznie broni się prawie zawsze, ale to sprzedażowa rama, która **zakrywa klin**. X11 §3.1 mówi wprost: model „za konto, nie za obiekt" powinien stać w cenniku wprost. Dziś stoi tam slogan. | `Jedna cena za konto, niezależnie od liczby obiektów` — **dlaczego lepiej:** stawia w nagłówku cennika dokładnie tę różnicę, którą klient sprawdzi u konkurencji w dwie minuty i którą zapamięta. |
| `Zero prowizji od rezerwacji. Stała opłata, bez limitów obiektów i rezerwacji.` (539–542) | Dobre, tylko bezosobowe i bez liczby. | `29,99 zł miesięcznie za całe konto. Bez prowizji od rezerwacji i bez opłaty za każdy obiekt.` |
| `OFERTA NA START` (549) | **Do usunięcia.** Etykieta sugeruje ofertę ograniczoną w czasie, za którą nie stoją żadne warunki — a warunki oferty founding members są dziś `[DO UZUPEŁNIENIA]` w Regulaminie §6 (X11 §7a.2). Sugerowanie promocji bez podania warunków to zobowiązanie wobec konsumenta bez treści. | **Do skasowania** do czasu ustalenia warunków przez właściciela i opisania ich przez `legal`. |
| `Wszystkie funkcje bez żadnych limitów. 1 domek czy 20 apartamentów — ta sama, stała cena.` (554–557) | Prawda i dobrze brzmi. Do poprawki tylko myślnik i „bez żadnych". | `Wszystkie funkcje bez limitów. Jeden domek czy dwadzieścia apartamentów: ta sama cena.` |
| `Automatyczne raporty i podatki (ryczałt)` (560) | „Automatyczne raporty" nie znaczy nic konkretnego. | `Podatek i VAT liczone przy rezerwacji, raport roczny w PDF i CSV` |
| `Interaktywny kalendarz z synchronizacją iCal` (561) | „Interaktywny" to wypełniacz z 2010 roku. | `Kalendarz wszystkich obiektów z importem iCal z Booking.com i Airbnb` |
| `Cyfrowy przewodnik gościa premium` (562) | Znowu „premium". | `Przewodnik gościa z kodem QR i danymi dostępowymi po akceptacji regulaminu` |
| `Szyfrowana baza w chmurze, bez ukrytych prowizji` (563) | Dwie niepowiązane rzeczy zszyte w jeden punkt, przy czym „bez ukrytych prowizji" powtarza punkt z sąsiedniej kolumny (579). Twierdzenie o szyfrowaniu jest prawdziwe (Firestore szyfruje dane spoczynkowe), ale zapisane tak, że zaprasza do pytań, na które dziś nie mamy pełnej odpowiedzi (kopie zapasowe są otwartą pozycją N6 w Roadmapie). | Zastąpić realną, niewymienioną dotąd funkcją: `Strona z prośbą o opinię po pobycie` — **dlaczego lepiej:** nie wchodzimy w obietnice bezpieczeństwa, których nie domknęliśmy, a dokładamy funkcję, która istnieje. |
| `Bez danych karty. Anulujesz jednym kliknięciem.` (566–568) | „Jednym kliknięciem" jest nieprawdą: anulowanie idzie przez panel Stripe (trzy kroki, `docs/support/konto-i-subskrypcja.md`). Drobiazg, ale to obietnica dotycząca rezygnacji, więc akurat ta musi być precyzyjna. | `Bez danych karty przy rejestracji. Subskrypcję anulujesz w panelu Stripe w dowolnym momencie.` |
| `Rozwijasz biznes bez kary za sukces` (573) | Formuła aforystyczna (humanizer §32): brzmi mądrze, nie mówi nic. | `Piąty domek nie kosztuje pięć razy więcej` — **dlaczego lepiej:** to samo zdanie w liczbach, sprawdzalne u konkurencji. |
| `Inni każą Ci płacić za każdy pokój lub pobierają prowizję od obrotu. U nas dodajesz kolejne obiekty bez dodatkowych kosztów.` (574–577) | Zgodne z X11 §2, dobre. Warto tylko doprecyzować „inni". | `Systemy rozliczane za obiekt mnożą abonament przez liczbę domków, a część dolicza prowizję od rezerwacji. Tu dodajesz obiekty bez zmiany rachunku.` |
| `Brak prowizji od rezerwacji` / `Brak opłat za obiekt` / `Brak długoterminowych umów` (579–581) | Trójka „Brak, brak, brak" (reguła trzech, PL.md §10), przy czym dwa pierwsze punkty mówią to samo, co nagłówek i akapit nad nimi. | Zostawić dwa: `Bez prowizji od rezerwacji` i `Bez umowy na czas określony, płatność miesięczna` — **dlaczego lepiej:** znika powtórzenie, a drugi punkt wnosi informację, której nie było. |

### 2.13 FAQ (linie 594–621)

| Obecnie (linia) | Diagnoza | Propozycja |
|---|---|---|
| `Wszystko, co musisz wiedzieć przed startem.` (595) | Podręcznikowy przykład zdania-wypełniacza: nagłówek „Często zadawane pytania", a pod nim zdanie, które powtarza nagłówek innymi słowami (humanizer §29). | **Do skasowania bez zastępowania.** |
| `Nie. Rejestrujesz się podając tylko e-mail i hasło… Decyzję o płatności podejmujesz dopiero, gdy upewnisz się, że system realnie oszczędza Twój czas.` (600) | Pierwsza połowa dobra. Druga wkłada czytelnikowi w usta wniosek („upewnisz się, że oszczędza") i używa wypełniacza „realnie". | `Nie. Rejestrujesz się e-mailem albo kontem Google i masz 14 dni pełnego dostępu. Decyzję o płatności podejmujesz po tym okresie.` |
| `Tak. Obsługujemy synchronizację kalendarzy w standardzie iCal. Rezerwacje z popularnych portali automatycznie blokują terminy w Twoim kalendarzu, zapobiegając podwójnym rezerwacjom.` (604) | Doklejony imiesłów „zapobiegając" (PL.md §3). Brak informacji o częstotliwości, czyli o jedynej rzeczy, która w tym pytaniu ma znaczenie. „Popularnych portali" ukrywa fakt, że pola są dwa: Booking i Airbnb. | `Częściowo i warto wiedzieć jak. WynajemPRO pobiera kalendarze iCal z Booking.com i Airbnb raz na dobę wcześnie rano, a poza tym w każdej chwili przyciskiem „Synchronizacja". W drugą stronę portale odświeżają Twój link zwykle od kilku do kilkunastu godzin, więc przy rezerwacji z ostatniej chwili termin i tak zablokuj w portalu ręcznie. To nie jest channel manager z dwustronnym API.` — **dlaczego lepiej:** to jest odpowiedź, po której nikt nie zażąda zwrotu w drugim miesiącu, a ostatnie zdanie realizuje dosłownie zakaz z X11 §3. |
| `Tak. Aplikacja powstała z myślą o polskich realiach. Wspiera m.in. automatyczne wyliczanie ryczałtu…` (608) | „Wspiera m.in." to korpomowa i asekuracja. Brakuje zastrzeżenia o charakterze pomocniczym, które jest w artykule pomocy. | `Tak. Ustawiasz ryczałt albo skalę, opcjonalnie VAT 8% i składki ZUS, a podatek liczy się przy każdej rezerwacji. Przy ryczałcie system pilnuje progu 100 000 zł i sam przechodzi z 8,5% na 12,5%. To wyliczenie pomocnicze i zestawienie dla księgowego, nie deklaracja podatkowa.` |
| `Możesz dodać 1, 5, a nawet 20 obiektów…` (612) | „A nawet" to sprzedażowy ozdobnik. | `Dodasz jeden obiekt albo dwadzieścia w tej samej cenie.` |
| `Tak, WynajemPRO jest w pełni responsywny. Z powodzeniem dodasz rezerwację… będąc w drodze.` (616) | „W pełni responsywny" to żargon deweloperski. „Z powodzeniem… będąc w drodze" to wata. Pominięte realne ograniczenie: ręcznej synchronizacji **nie ma na telefonie** (`docs/support/synchronizacja-ical.md`). | `Tak. Panel otwierasz w przeglądarce telefonu: na dolnym pasku masz Pulpit, Kalendarz, Rezerwacje i Finanse, reszta jest pod „Więcej". Jedno ograniczenie: ręcznej synchronizacji iCal nie uruchomisz z telefonu, robi to poranny import albo widok na komputerze.` — **dlaczego lepiej:** przyznanie się do jednego ograniczenia uwiarygodnia całą resztę odpowiedzi. |
| `…nasz polskojęzyczny zespół wsparcia odpowie po ludzku — nie bot.` (620) | **Zespołu nie ma.** WynajemPRO prowadzi jedna osoba. To jest nieprawdziwa informacja o przedsiębiorcy, nie kwestia stylu. Do tego „nie bot" to doklejona negacja (humanizer §9), a „Aplikacja jest zaprojektowana tak, by nie wymagać szkoleń" powtarza hasło z hero po raz trzeci. | `Masz centrum pomocy z instrukcjami krok po kroku i formularz kontaktowy. Odpisuję osobiście, po polsku. WynajemPRO prowadzę sam, więc odpowiedź potrafi przyjść po kilku godzinach, a nie po minucie.` — **dlaczego lepiej:** zamienia kłamstwo w atut, bo dla gospodarza-jednoosobowca „pisze do mnie właściciel" jest przewagą nad zagraniczną infolinią. **Wariant neutralny, jeśli właściciel nie chce ujawniać, że działa sam:** `Masz centrum pomocy z instrukcjami krok po kroku i formularz kontaktowy. Odpowiadamy po polsku, mailem, bez bota.` |
| *(brak)* | FAQ to najlepsze miejsce na frazy long-tail i na rozbrojenie obiekcji, a mamy tylko 6 pytań, z których żadne nie dotyczy danych, kwot z iCal ani eksportu. | Dodać cztery pytania (odpowiedzi wprost z artykułów pomocy): `Co się stanie z moimi danymi, jeśli po 14 dniach nie wykupię subskrypcji?` · `Czy rezerwacje pobrane z Booking.com mają kwoty?` · `Czy gość musi instalować aplikację, żeby otworzyć przewodnik?` · `Czy mogę wyeksportować dane dla księgowego?` |

### 2.14 CTA i newsletter (linie 660–691) oraz komunikat po zapisie (linia 120)

| Obecnie (linia) | Diagnoza | Propozycja |
|---|---|---|
| `Mniej chaosu.<br />Więcej wynajmu.` (660–662) | Druga połowa obiecuje **więcej rezerwacji**. Nie generujemy rezerwacji, nie mamy silnika dystrybucji ani strony rezerwacyjnej. To obietnica poza produktem, postawiona w najmocniejszym miejscu strony. | `Wypróbuj przez 14 dni, bez karty` — **dlaczego lepiej:** CTA ma prowadzić do jednej czynności, a nie obiecywać efekt biznesowy, którego nie dowozimy. |
| `Raz w miesiącu wyślemy Ci konkretne triki na więcej rezerwacji bezpośrednich i niższe koszty. Zero spamu.` (663–666) | Trzy problemy. (1) Obiecujemy comiesięczną wysyłkę treści, których jeszcze nie piszemy. (2) „Triki na więcej rezerwacji bezpośrednich" to znowu obietnica spoza produktu. (3) „Zero spamu" to doklejona negacja, ale ważniejsze jest to, co obok: **formularz nie ma pola zgody ani klauzuli informacyjnej**, a zapisuje adres do `newsletter_subscribers`. To pytanie do `legal` (RODO art. 13, UŚUDE art. 10), nie do copywritera. | Do decyzji: (a) usunąć blok newslettera do czasu, aż będzie newsletter i zgodny z prawem mechanizm zapisu, albo (b) zostawić z checkboxem zgody i linkiem do polityki prywatności, z treścią: `Raz w miesiącu jedna wiadomość: co zmieniło się w przepisach dla najmu krótkoterminowego i co doszło w aplikacji. Wypisujesz się linkiem w stopce każdej wiadomości.` **Decyzja i treść zgody: `legal`.** |
| `Dziękujemy — otrzymasz nasze poradniki.` (120) | Obiecuje „poradniki" w liczbie mnogiej, których nie ma. | `Dziękujemy. Adres zapisany.` |
| `Karta nie jest wymagana` (691) | Powtórzenie z hero (210). W stopce CTA to już trzecia wzmianka o karcie na jednej stronie. | **Do skasowania** — informacja jest 15 pikseli wyżej, w przycisku „Rozpocznij 14-dniowy test". |

### 2.15 Blog i stopka (linie 632, 701–705, 735)

| Obecnie (linia) | Diagnoza | Propozycja |
|---|---|---|
| `Ucz się od praktyków` (632) | Liczba mnoga sugeruje grono autorów. Autor jest jeden. Poza tym nagłówek nie mówi, o czym są teksty. | `Poradniki dla gospodarzy` — **dlaczego lepiej:** opisuje zawartość, nie obiecuje redakcji, i zawiera słowo, którego ludzie faktycznie szukają. |
| `Narzędzie dla właścicieli nieruchomości na wynajem krótkoterminowy. Automatyzuj, unikaj overbookingu i odzyskaj czas każdego dnia.` (701–705) | Trójka trybów rozkazujących (PL.md §10). „Odzyskaj czas każdego dnia" to slogan. „Overbooking" to żargon, a strona w innych miejscach mówi „podwójne rezerwacje" — dwie nazwy tego samego problemu w jednym dokumencie. | `Panel do zarządzania wynajmem krótkoterminowym: kalendarz obiektów, rozliczenia i przewodnik dla gości. Dla gospodarzy, którzy prowadzą domki i apartamenty sami.` — **dlaczego lepiej:** stopka jest czytana przez roboty i przez ludzi szukających „co to właściwie jest", więc powinna być definicją, nie hasłem. |
| `Identyfikacja v1.0 · 2026` (735) | Wewnętrzna notatka z systemu projektowego opublikowana dla klientów. Nikt z zewnątrz nie wie, co to znaczy, a dodatkowo jest niezgodna ze stanem faktycznym (pracujemy na identyfikacji v2). | **Do skasowania.** |

### 2.16 Czego na stronie brakuje, a mamy to w produkcie

| Funkcja | Gdzie potwierdzona | Uwaga |
|---|---|---|
| Zapis akceptacji regulaminu z datą i treścią (ślad przy sporze) | `docs/support/przewodnik-goscia.md` | Klin nr 2 z X11 §3. **Nie pada na landingu ani razu.** Największa strata sprzedażowa na tej stronie. |
| Moduł „Opinie" — strona z prośbą o opinię po pobycie | `docs/support/strona-opinii.md`, `ManagerApp.jsx:67` | Gotowe, działające, nieobecne na landingu. |
| Koszty stałe (cykliczne) i raport rentowności rok do roku | `docs/support/finanse-i-raporty.md` | Landing mówi ogólnie „raporty", nie mówi, co w nich jest. |
| Eksport CSV dla księgowego | `docs/support/finanse-i-raporty.md` | Argument wprost pod ICP. Nieobecny. |
| **Generator umów najmu** | `ManagerApp.jsx:64–66` | **Uwaga, ważne:** moduł jest **wyłączony z menu decyzją właściciela z 2026-07-15** do czasu akceptacji wzorców przez prawnika (N4). **Nie wolno go umieszczać na landingu** przed odblokowaniem. Odnotowuję, bo w opisie produktu, który dostałem, figuruje jako funkcja istniejąca. |

---

## 3. Zdania do skasowania bez zastępowania

Te fragmenty nie wymagają nowej wersji. Istnieją, żeby zapełnić miejsce, a ich usunięcie nie zabiera stronie
żadnej informacji.

1. **linia 595** — `Wszystko, co musisz wiedzieć przed startem.` Powtórzenie nagłówka „Często zadawane pytania" innymi słowami.
2. **linie 300–303** — `Funkcje, które zdejmują z Twoich barków najwięcej powtarzalnej pracy — bez zbędnych opcji rodem z systemów hotelowych.` Frazes plus zapowiedź sekcji „Dla kogo", która jest 200 linii niżej.
3. **linia 199** (fragment) — `który nie wymaga instrukcji obsługi`. To samo zdanie stoi w sekcji Wartości (279–280) i po raz trzeci w FAQ (620, „nie wymagać szkoleń").
4. **linie 266–289** — cała sekcja „Wartości", jeśli właściciel nie zdecyduje się na przepisanie z §2.2. To jest brand book, nie oferta.
5. **linia 512** — `Przeładowany interfejs pełen opcji, których nigdy nie użyjesz`. Opinia bez pokrycia, powtórzona w leadzie sekcji.
6. **linia 514** — `Skomplikowane generowanie raportów „hotelowych"`. Nikt nie wybiera systemu na podstawie tego kryterium.
7. **linia 549** — tag `OFERTA NA START`. Sugestia promocji bez warunków; do czasu ustalenia founding members to zobowiązanie bez treści.
8. **linia 691** — `Karta nie jest wymagana`. Trzecia wzmianka o karcie na jednym ekranie.
9. **linia 735** — `Identyfikacja v1.0 · 2026`. Wewnętrzna notatka projektowa na widoku klienta.
10. **linie 356–357** — `Koniec z ręcznym liczeniem i strachem przed kontrolą.` Kasować niezależnie od tego, czy reszta karty „Podatki" zostanie przepisana.
11. **linia 665** — `Zero spamu.` Doklejona negacja; jeśli blok newslettera zostaje, zastępuje ją zdanie o wypisaniu się.

---

## 4. `title` i `meta description` dla strony głównej

**Stan obecny** (`index.html:13–14`):

```
<title>WynajemPRO - Prosty system do zarządzania najmem krótkoterminowym</title>
<meta name="description" content="Zapanuj nad chaosem w wynajmie. Kalendarz, finanse, przypomnienia i synchronizacja w jednym miejscu. Testuj za darmo!" />
```

Co jest nie tak: `title` jest przyzwoity, ale gubi słowo „program" (którym ludzie szukają narzędzi) i używa
formy „najmem" zamiast „wynajmem" z naszej frazy docelowej. `description` obiecuje **„przypomnienia"**, których
w produkcie w tej postaci nie ma, kończy się wykrzyknikiem (identyfikacja v2 mówi: bez wykrzykników) i nie
zawiera ani ceny, ani modelu, czyli dwóch rzeczy, które decydują o kliknięciu w wynikach.

**Propozycja podstawowa:**

```
<title>Program do zarządzania wynajmem krótkoterminowym | WynajemPRO</title>
<meta name="description" content="Kalendarz rezerwacji dla domków i apartamentów, rozliczenie ryczałtu i przewodnik dla gości. 29,99 zł za konto, nie za obiekt. 14 dni testów bez karty." />
```

Dlaczego tak: `title` (61 znaków) zawiera pełną frazę z X11 §5 K2 na początku, gdzie waży najwięcej.
`description` (150 znaków, mieści się bez ucięcia) upycha drugą frazę long-tail („kalendarz rezerwacji dla domków")
w naturalnym zdaniu i podaje cenę — w wynikach wyszukiwania jawna cena odsiewa klikających „za darmo", co przy
budżecie 500 zł/mc na Google Ads (X11 §5 K2) ma bezpośrednie przełożenie na koszt rejestracji.

**Wariant alternatywny do testu A/B, jeśli właściciel woli zacząć od problemu, a nie od kategorii:**

```
<title>WynajemPRO — kalendarz i rozliczenia najmu krótkoterminowego</title>
<meta name="description" content="Wszystkie domki w jednym kalendarzu, ryczałt liczony przy każdej rezerwacji, przewodnik dla gościa z kodem po akceptacji regulaminu. Stała cena za konto." />
```

**Open Graph** (`index.html:21`) — obecnie: `Koniec z overbookingiem. Banalne podatki. Jasna rentowność każdego
obiektu. Poczuj ulgę i zapanuj nad chaosem w swoim mikro-biznesie.` Trzy urwane zdania pod rząd budujące sztuczne
napięcie (humanizer §31), „banalne podatki" jako obietnica ponad stan i „mikro-biznes", którego nikt o sobie nie
mówi. Propozycja: `Kalendarz wszystkich obiektów, rozliczenie ryczałtu i przewodnik dla gościa w jednym panelu.
Stała cena za konto, nie za obiekt. 14 dni testów bez karty.`

**`meta name="keywords"`** (`index.html:15`) — Google ignoruje ten tag od 2009 roku, więc sam z siebie nie szkodzi
ani nie pomaga. Ale zawiera wpis **„channel manager"**, czyli dokładnie to, czym X11 §3 zabrania się nazywać.
Minimum: usunąć tę jedną frazę. Optymalnie: usunąć cały tag jako martwy kod.

### Warstwa nagłówków — co znalazłem

- **H1 jest jeden i jest we właściwym miejscu** (`LandingPage.jsx:194`). To dobrze i tak ma zostać.
- **Na stronie jest około 13 znaczników H2**, z czego **pięć pochodzi z demo panelu** (`LandingScrollDemo.jsx:368`).
  Wszystkie pięć są w DOM jednocześnie (cztery ukryte przez `opacity`), więc robot widzi listę nagłówków
  „Cały wynajem na jednym ekranie", „Koniec z podwójną rezerwacją", „Każdy obiekt pod pełną kontrolą",
  „Gość obsłużony, zanim zapyta", „Wiesz co do złotówki" jako równorzędne z nagłówkami sekcji. **Rekomendacja
  dla `dev`:** sekcja demo powinna mieć jeden H2 („Panel od środka"), a pięć kroków powinno być H3 albo zwykłym
  tekstem. To zabieg czysto strukturalny, bez zmiany treści.
- **Numeracja sekcji jest połamana.** Etykiety idą: `01`, `02`, `03` (karty Wartości), potem `Funkcje · 04`,
  `Przewodnik gościa · 05`, demo panelu **bez numeru**, `Szybki start · 07`, `Dla kogo · 08`, `Cennik · 09`,
  `FAQ · 10`, `Baza wiedzy · 11`. Brakuje `06`, a `01–03` to co innego niż reszta. Czytelnik, który to zauważy,
  dostaje dokładnie ten sygnał, o którym mówił właściciel: że ktoś zapychał miejsce. Do przenumerowania po
  ustaleniu ostatecznego składu sekcji.
- **FAQ warto opisać schematem `FAQPage` (JSON-LD)** — treść jest w `<details>`, czyli w DOM, więc nadaje się
  do rozszerzonych wyników. Zadanie dla `dev`, nie zmiana copy.
- **Indeksowalność SPA** (X9) — odnotowuję zgodnie z poleceniem i **nie rozwiązuję**. `SeoTags.jsx:14–16` sam
  opisuje ograniczenie: tagi wstrzykuje JavaScript. Dopóki `title` i `description` z `index.html` są statyczne,
  strona główna jest bezpieczna; podstrony już nie.

---

## 5. Czego świadomie nie zmieniałem

1. **Kodu.** Nie mam do tego narzędzi i tak ma zostać. Wszystko powyżej to propozycje do akceptacji; wdroży `dev`.
2. **Klas `wp4-*`, identyfikatorów sekcji (`#funkcje`, `#cennik`, `#faq`, `#panel`) i struktury komponentów.**
   Zmiana kotwic zepsułaby nawigację, menu mobilne i wszystkie linki, które ktoś już zapisał.
3. **Nagłówka `Koniec z podwójnymi rezerwacjami` (309) i punktu `Mniej telefonów „o której kończy się doba?"` (384).**
   To dwa najlepsze zdania na stronie: ból w języku klienta, bez żargonu, bez przymiotnika. Poprawianie ich byłoby
   psuciem.
4. **Treści makiety telefonu** (PIN `4921`, hasło `Wiosna2026!`, „Domki Letniskowe", linie 396–439). Czyta się jako
   ilustracja i tak wygląda. Ruszyłbym tylko podpis, gdyby właściciel chciał być tu maksymalnie ostrożny.
5. **Wpisów bloga** (`src/data/blogPosts.js`). To osobne źródło i osobny temat — plan treści należy do `seo` (X11 §5 K3).
6. **Ceny 29,99 zł, okresu 14 dni i modelu „za konto, nie za obiekt".** Potwierdzone, więc używam bez zmian
   i częściej niż dotąd.
7. **Warunków oferty founding members.** Nie napisałem ani jednego zdania o rabacie, jego wysokości ani czasie
   trwania. Przeciwnie: rekomenduję usunięcie tagu `OFERTA NA START`, bo dziś sugeruje ofertę bez warunków.
8. **Kwestii zgód przy newsletterze.** Odnotowałem brak checkboxa i klauzuli, ale rozstrzygnięcie należy do `legal`,
   nie do marketingu.
9. **Porównania z cenami konkurencji** — przygotowałem dwa warianty (z nazwą i bez), ale nie rozstrzygam, który
   wchodzi. Reklama porównawcza z nazwą konkurenta wymaga opinii `legal`.
10. **Indeksowalności SPA** — otwarta pozycja X9, poza zakresem audytu copy.

---

## 6. Kolejność wdrożenia, gdyby budżet czasu był jeden wieczór

Uszeregowane według stosunku ryzyka do kosztu, nie według miejsca na stronie.

**Najpierw (nieprawdy — ryzyko reklamacji i churnu):** linie 310–314 (synchronizacja w czasie rzeczywistym),
340–343 i 345–346 (automatyczna wysyłka kodu), 356–357 (strach przed kontrolą), 485–486 (planowanie wysyłki PIN),
501–505 (klienci, których nie ma), 620 (zespół wsparcia), plus cztery poprawki w `LandingScrollDemo.jsx` z §2.9.

**Potem (wypełniacze — to, na co skarżył się właściciel):** sekcja Wartości (266–289), 595, 300–303, 691, 735,
512, 514.

**Na końcu (SEO i klin):** H1 i lead (194–200), H2 „Dla kogo" (498), H2 Cennik (538), `title` i `description`
w `index.html`, cztery nowe pytania w FAQ.

---

## 7. Założenia wymagające potwierdzenia przez właściciela

1. **Historia założycielska w pierwszej osobie.** Propozycja dla sekcji Wartości mówi „Prowadzę Domki Letniskowe Ruś".
   Reszta strony mówi „my". Trzeba wybrać jedną osobę gramatyczną na całej stronie. Rekomendacja: „ja" w bloku
   o pochodzeniu produktu, neutralnie w opisach funkcji.
2. **Ujawnienie, że firmę prowadzi jedna osoba** (propozycja do FAQ o wsparciu). Uważam, że to atut, ale to decyzja
   wizerunkowa właściciela. Wariant neutralny jest w tabeli.
3. **Liczby z Domków Letniskowych Ruś do panelu KPI w hero.** X11 §5 mówi o zgodzie na case study z liczbami;
   potrzebuję konkretnych kwot, żeby cokolwiek napisać. Do tego czasu proponuję wyłącznie dopisek „dane przykładowe".
4. **Zakres ICP na stronie: 1–15 czy 1–20 obiektów.** X11 §4 mówi 1–15, cennik i FAQ mówią 20. Produkt nie ma limitu,
   więc to decyzja o celowaniu, nie o funkcji.
5. **Czy cena 29,99 zł ma paść w hero, czy dopiero w cenniku.** Proponuję model bez liczby w hero („stała cena za konto,
   nie za obiekt") i liczbę w cenniku, zgodnie z pre-mortem z X11 §7 punkt 2 („nie komunikujemy tanio").
6. **Czy newsletter zostaje.** Jeśli nie ma planu comiesięcznej wysyłki, blok obiecuje coś, czego nie dowieziemy.

## 8. Decyzje zastrzeżone dla właściciela

- **Publikacja czegokolwiek z tego dokumentu.** Nic nie idzie na stronę bez akceptacji.
- **Nazwa i cena konkurenta w tabeli porównawczej** (§2.11) — po opinii `legal`.
- **Formularz newslettera: zgoda, klauzula informacyjna, ewentualne usunięcie bloku** — po opinii `legal`.
- **Usunięcie tagu „OFERTA NA START"** i moment, w którym pojawi się komunikat o founding members (po ustaleniu
  trzech liczb z X11 §8).
- **Wybór wariantu `title` i `description`** oraz to, czy w ogóle robimy test A/B.

---

**Related:** [[strategy/X11-Plan-marketingowy-launchu]] · [[Team-Playbook]] · [[Projects/Roadmap]]
