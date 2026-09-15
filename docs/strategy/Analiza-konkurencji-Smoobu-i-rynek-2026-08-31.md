# Analiza konkurencji: Smoobu, BedBooking i rynek mikro + frontend

**Data:** 2026-08-31 · **Dla:** właściciel · **Status:** finalna · **Siostrzana:** [[strategy/Analiza-konkurencji-IdoBooking-2026-08-31]]

Ta sama metoda co przy IdoBooking: odczyt cenników i stron na żywo (2026-08-31), 5 raportów
badawczych (oferta Smoobu, technologia, rynek i opinie, konkurenci polscy, konkurenci
globalni), 2 soczewki analityczne i recenzja adwersaryjna — jej poprawki naniesione.
Nowość względem poprzedniej analizy: **sekcja frontendowa** (wygląd ich stron i kalendarzy
vs nasz landing i panel — na zrzutach ekranu, w tym zrzutach naszego panelu z atrap)
z planem odpowiedzi na feedback „strona wygląda jak AI slop".

---

## Wnioski w 60 sekund

1. **Głównym rywalem o naszego klienta nie jest Smoobu — jest BedBooking.** Polski,
   mobile-first, 100 tys.+ pobrań i 4,6★ (4,4 tys. opinii) w Google Play, API
   Booking/Airbnb, plan darmowy po trialu. Smoobu to rywal „aspiracyjny" — zbiera
   gospodarzy, którzy chcą automatyzacji i direct bookingu w EUR.
2. **Nasz wyróżnik przewodnika się broni — i to rodzajowo, nie ilościowo.** Guest Guide
   Smoobu jest szerszy (mapa, pogoda, upsell), ale Wi-Fi i kody to u nich zwykły blok
   treści widoczny dla każdego z linkiem; podpis w ich check-inie to pole formularza,
   nigdzie niepowiązane z treścią warunków. Bramka „sekrety za udokumentowaną akceptacją
   regulaminu" pozostaje unikalna.
3. **„Liczymy polskie podatki" — potwierdzone wobec całej zbadanej stawki** (BedBooking,
   Hotres, KWHotel, 7 graczy globalnych): nikt nie liczy podatku dochodowego gospodarza.
   Bezpieczne brzmienie: „jedyny polski system dla wynajmujących, który sam wylicza
   podatek gospodarza" — bez absolutnego „jako jedyni na rynku".
4. **Feedback „AI slop" ma konkretną przyczynę i konkretny lek.** Nasza paleta (krem +
   szeryfowa kursywa + cynober) trafia w najbardziej rozpoznawalny klaster stylistyki
   generowanej, a na landingu nie ma ani jednego artefaktu rzeczywistości — zdjęcia,
   nazwiska, prawdziwej liczby, prawdziwego zrzutu. Plan uczłowieczenia: sekcja 7.
5. **Najczarniejszy scenariusz trzeba potraktować serio:** być może BedBooking już wygrał
   tego klienta, a nasz segment („sam rozlicza podatek" + „chce śladu dowodowego") stoi
   na dwóch niezweryfikowanych założeniach. Beta ma je sfalsyfikować — sekcja 10.

---

## 1. Smoobu z bliska

**Firma:** Smoobu GmbH, Berlin, zał. 2014; od 2021 w giełdowej grupie **HomeToGo**
(cena przejęcia ~20 mln EUR [szacunek z jednego źródła]). Liczby klientów nie publikują;
twarde jest tempo: ARR subskrypcji +30–41% r/r (raporty giełdowe HomeToGo). Certyfikaty
z górnej półki: **Booking.com Premier (Plus) Connectivity Partner** i **Airbnb Preferred
Software Partner** (badge 2026 na stronie). Realny target wg niezależnych recenzji:
**1–5 obiektów, sufit ~15**.

**Cennik (odczyt live, EUR, bez VAT):** Professional Flex €29/mies + 0,9% od rezerwacji;
Professional Przedpłacony €35/mies (rocznie €31,50, 2 lata €28), 0% prowizji; Teams Pro+
€55/mies. **Każda dodatkowa jednostka +€9,60/mies**, dodatkowe konto edycyjne €12/mies
(inna ich podstrona mówi €15 — sami sobie przeczą). Dopłaty wtórnie raportowane: dynamic
pricing ~€12,99/obiekt, e-faktury ~€5,90/obiekt [źródła wtórne]. Trial 14 dni bez karty,
zero opłat startowych.

**Technologia — poziom, do którego warto się porównywać:**

- **API o dwie generacje nowocześniejsze niż IdoBooking:** REST, **webhooki** (push
  zamiast pollingu), autoryzacja HMAC-SHA256 z ochroną przed replay, OAuth 2.0 dla
  partnerów, jawny rate limit, publiczny changelog API; starą autoryzację aktywnie
  wygaszają (wrzesień 2026).
- **Ale pełna dwustronność tylko na 2 kanałach** (Airbnb, Booking.com — kalendarz, ceny,
  wiadomości). Expedia/Agoda i podobne: API bez wiadomości. **Vrbo i Google VR: tylko
  iCal** (źródło pierwotne: ich własny support). „100+ portali" = długi ogon iCal,
  ta sama sztuczka co u wszystkich. Synchronizacja cen wymaga ręcznego „Synchronize
  now" po edycji; treści ofert (zdjęcia, opisy) nie synchronizują wcale.
- **Mobile:** aplikacje świeże (nowa appka od ~2024, AI-odpowiedzi w wiadomościach),
  ale młode — App Store 4,7 przy zaledwie 26 ocenach. Mobile historycznie był ich słabością.

**Reputacja — nieoczywista:** Trustpilot **3,6/5 przy 475 recenzjach, aż 19% ocen 1★**
(skargi 2026: wolniejszy support, siedmiogodzinna przerwa serwisowa bez komunikatu,
błędy rozliczeniowe); Capterra 4,5/5 (~195 recenzji, 99% mali); niezależny test HostRadar:
**~28% recenzji wspomina bugi — „wyraźnie więcej niż u konkurencji"**. Skargi nr 1:
opóźnienia iCal na kanałach bez API (widmo double bookingu), podwyżka cen 2023.
**Polska:** strona przetłumaczona, support deklaruje polski wśród 8 języków, ale ceny
tylko w EUR, pomoc po angielsku, zero polskich case studies — lokalizacja językowa,
nie aktywna sprzedaż.

**Podatki/księgowość:** faktury PDF per rezerwacja (ręcznie), e-faktury jako płatny
dodatek (kontekst UE, **zero wzmianek o Polsce/KSeF**), brak integracji księgowych,
zero funkcji podatku dochodowego. Luka potwierdzona.

## 2. Zderzenie przewodników — nasz wyróżnik pod mikroskopem

Smoobu ma **Guest Guide**: stronę per rezerwacja (unikalny link/QR) z mapą, pogodą,
rekomendacjami GetYourGuide, upsellami, formularzem kontaktu i osadzonym check-inem;
własne bloki treści (Wi-Fi, zasady) z tłumaczeniami. Do tego **check-in online**: formularz
danych (dokument, adres, załącznik z kopią dokumentu, podpis gościa głównego), link
jednorazowy wygasający po 30 dniach.

Różnice, które robią z tego dwa różne produkty:

| | Smoobu | WynajemPRO |
|---|---|---|
| Wi-Fi / kody dostępu | zwykły blok treści — **widzi każdy z linkiem**; jedyne sterowanie to okna czasowe (przed/w trakcie/po pobycie) | odsłaniane **dopiero po akceptacji** regulaminu i instrukcji PPOŻ |
| Podpis gościa | pole formularza check-in, **niepowiązane z żadną treścią warunków** | akt akceptacji: zapis daty i **treści dokumentów z tego dnia** |
| Ślad na wypadek sporu | brak; danych z check-inu gość ani gospodarz nie poprawi, eksport tylko per rezerwacja (TXT/PDF) | zapis dowodowy przy rezerwacji |
| Formularz | jeden globalny na całe konto | per obiekt (przewodnik per obiekt) |
| Szablony wiadomości | 7 języków — **bez polskiego** | n/d (gospodarz wysyła sam) |

**Jak o tym mówić:** nie „mamy przewodnik" (na liczbę sekcji przegrywamy — u nich pogoda,
mapy, upsell). Mówić o transakcji: **„Gość nie dostanie kodu do drzwi, zanim nie
zaakceptuje regulaminu — a Ty masz na to dowód z datą i treścią."** To narzędzie ochrony
gospodarza, nie strona informacyjna. ⚠️ Uczciwe zastrzeżenie krytyka: **nie mamy ani
jednego dowodu, że klient za tę bramkę zapłaci** — to założenie do przetestowania w becie,
nie pewnik.

## 3. Polski rynek: BedBooking, Hotres, KWHotel

**BedBooking — jedyny bezpośredni konkurent.** Cennik netto, **per pokój** (rośnie
liniowo): Lite (sam kalendarz, bez synchronizacji) 29 zł/pokój/mies; Plus (booking engine)
49 zł; **Pro (bestseller): 79 zł za pierwszy pokój + ~28 zł za kolejny — API Booking.com
i Airbnb + Google Hotels + iCal**; Max (faktury, ewidencja przychodów, API) 129 zł.
Rok −16%, 2 lata −20%. **Trial 30 dni pełnego Maxa bez karty, potem plan darmowy
(okrojony — dane nie znikają).** Skala zweryfikowana w Google Play: 4,6★ przy 4,39 tys.
opinii, odznaka „100 tys.+ pobrań" (deklarowane 644 tys. to suma z lat i platform,
niefalsyfikowalna); deklarują 3 mln rezerwacji w systemie. Skargi użytkowników: problemy
z synchronizacją i wydajnością aplikacji, braki personalizacji. **Podatki: NIE** —
19 artykułów pomocy o „podatku" dotyczy wyłącznie opłaty miejscowej i stawek VAT na
fakturach; Max ma ewidencję przychodów (surowiec dla księgowej), niczego nie wylicza.

**Hotres** — klasa wyżej: PMS z booking engine dla pensjonatów i mniejszych hoteli
(2000+ obiektów), **cennik ukryty** (wycena indywidualna, umowa roczna, każdy kanał OTA
jako osobny abonament, SMS 0,10 zł). Ma fiskalizację i **wysyłkę faktur do KSeF** —
to compliance sprzedażowy firmy, nie podatek dochodowy gospodarza. Dla mikro-gospodarza
bariera wejścia (kontakt handlowy, wdrożenie) czyni go nieistotnym.

**KWHotel** — desktop „starej szkoły" od 2009, sprzedaż przez resellerów, wersja Pro
dla obiektu ~1 800–2 000 zł/rok [szacunek rynkowy, nie cennik]; ich strona cennika
w chwili odczytu wyświetlała błędy PHP i ceny w EUR. Free = atrapa (2 pokoje, bez sync).
**Podatki: NIE.** Ciekawostka z Google Play BedBookinga: „Przeszłam z kw i jestem mile
zaskoczona" — migracja idzie w stronę mobile.

**Werdykt tezy podatkowej:** wobec zbadanej stawki (PL + globalni) potwierdzona. Nikt
nie liczy ryczałtu 8,5/12,5% z progiem, skali, liniowego ani limitu VAT 240 tys.
Najbliżej jest Beds24 — ale to podatki pobierane OD GOŚCIA (city tax, VAT na fakturze),
nie rozliczenie dochodu gospodarza. **Dozwolone brzmienie:** „jedyny polski system dla
wynajmujących, który sam wylicza podatek gospodarza — ryczałt z progiem, skalę, liniowy
i pilnuje limitu VAT". W miejscach wrażliwych prawnie: „żaden znany nam polski system…".

## 4. Rynek globalny — wzorce, nie ceny

⚠️ Ceny globalne w większości z recenzji i suwaków, nie z cenników (Lodgify zwracał 403)
— **tabela orientacyjna, nie do cytowania jako fakt.**

| Produkt | Wejście, 1 obiekt/mies | Model |
|---|---|---|
| Hostex | ~4,90 USD | abonament/obiekt; AI we wszystkich planach |
| Beds24 | od €15,50 | modułowy (dopłata za każde połączenie z kanałem) |
| Lodgify | ~16 USD + **1,9% od rezerwacji direct** | hybryda; najlepszy kreator stron |
| Hospitable | **0 USD** (Essentials) / 29 USD | free tier + AI-komunikacja klasy premium |
| iGMS | 38–48 USD albo **1 USD/noc** | abonament lub per-noc |
| Uplisting | ~£40 (do 4 obiektów) albo **0 + 3%** | abonament LUB prowizja — klient wybiera |
| Your.Rentals | **0 + 7,5%** service fee | czysta prowizja („płacisz za wynik") |

Cztery wzorce przekrojowe:

1. **Monetyzacja dryfuje do „zera ryzyka na starcie":** 4 z 7 graczy oferuje wejście bez
   abonamentu (free tier, prowizja, per-noc). Czysty abonament od pierwszego dnia
   przestaje być standardem segmentu mikro — a to jest dokładnie nasz model. Zderzenie
   nazwane wprost w sekcji 10.
2. **Onboarding = trial bez karty + natychmiastowy „aha moment".** U nas „aha" powinno
   być jedno: **wyliczony podatek w pierwszej sesji** — jedyna rzecz, której gospodarz
   nie widział nigdzie indziej.
3. **AI w komunikacji z gośćmi stało się stawką stołową** (Hospitable, iGMS, Hostex,
   Smoobu w appce) — nas to nie dotyczy, dopóki świadomie nie wysyłamy wiadomości,
   ale trzeba wiedzieć, że rynek to ma.
4. **Ukryte prowizje wracają bokiem** (Lodgify 1,9% od direct; Your.Rentals realnie
   ~22,5% łącznie z prowizją kanału) — przewaga komunikacyjna uczciwej ceny płaskiej
   jest systemowa, nie tylko lokalna.

## 5. Ceny — trzy persony, wszystko w PLN brutto

Założenia: kurs 4,3 zł/EUR [założenie], ceny konkurencji netto +23% VAT, płatność roczna
z rabatami; nasza cena jest ceną końcową (zwolnienie z VAT art. 113).

| Persona | WynajemPRO | BedBooking Pro | Smoobu Professional | KWHotel |
|---|---|---|---|---|
| 1 domek | **359,88 zł** | ~980 zł | ~2 000 zł* | ~1 800–2 000 zł [szacunek] |
| 3 apartamenty | **359,88 zł** | ~1 675 zł | ~3 210 zł* | jw. |
| 6 obiektów | **359,88 zł** | ~2 715 zł** | ~5 045 zł* | jw. |

\* dopłata €9,60/mies za każdą jednostkę ponad pierwszą; niepewne, czy rabat roczny
obejmuje jednostki dodatkowe.
\** ekstrapolacja modelu per-pokój poza opublikowany cennik.

Dwie uczciwe gwiazdki: **BedBooking Lite** (sam kalendarz, zero synchronizacji) dla
1 pokoju kosztuje rocznie ~359 zł brutto — tyle co my; a **plan darmowy BedBookinga
jest poniżej nas z definicji**. Z zerem nie wygrywa się ceną — wygrywa się tym, co
w cenie: synchronizacja + podatki + bramka regulaminowa w jednej kwocie. Doostrzone
hasło cennika: **„29,99 zł i to cała cena. Drugi domek? Nadal 29,99. Szósty? Nadal."**
— atak na model per-pokój/per-jednostkę całej konkurencji, nie na plan darmowy.

📌 IdoBooking celowo poza tabelą — to system dla zarządców z opłatami startowymi
i modułami (pełna analiza: [[strategy/Analiza-konkurencji-IdoBooking-2026-08-31]]);
dla porównania: jego plan płaski to ~3 000+ zł brutto rocznie.

## 6. Technologia — co z tego wynika dla nas

- **Poziom odniesienia API to Smoobu, nie IdoBooking:** REST + webhooki + HMAC.
  Jeśli kiedyś wystawimy własne API (Backlog daleki), projektować od razu na tym poziomie.
- **Nawet lider mikro ma iCal w długim ogonie** (Vrbo/Google u Smoobu!) i skargi na
  double booking. Nasza uczciwa komunikacja granic iCal („co godzinę + alarm kolizji")
  jest zbieżna z tym, na co ich klienci realnie narzekają — różnica w tym, że oni
  obiecują więcej, niż długi ogon dowozi.
- **BedBooking ma API Booking/Airbnb jako partner oficjalny** — w polskiej stawce mikro
  to on dyktuje techniczny standard synchronizacji, nie my. Świadomie akceptujemy
  tę przegraną (iCal) do czasu sygnału z bety; wtedy wraca decyzja z analizy IdoBooking
  (Connectivity Partner tylko przy MRR unoszącym utrzymanie).
- **Mobile:** BedBooking żyje ze sklepów (4,6★), Smoobu odświeżyło appki. Nasza PWA
  funkcjonalnie wystarcza, ale **nie produkuje waluty zaufania** (ocen i odznak) —
  to realny koszt strategiczny braku aplikacji, nazwany wprost, nie „cnota prostoty".

## 7. Frontend i „AI slop" — ich strony, ich kalendarze, nasz landing

*Sekcja na podstawie zrzutów ekranu z 2026-08-31: smoobu.com (strona główna PL, cennik,
channel manager), bed-booking.com, wynajempro.com oraz zrzutów naszego panelu (Pulpit
i Kalendarz) wykonanych na atrapach danych przez Playwright.*

### Jak wyglądają oni

**Smoobu:** podręcznikowy „bezpieczny SaaS 2025" — biel, granatowy tekst, jeden królewski
błękit, mocno zaokrąglone karty na pastelowych płytkach, duży przyjazny grotesk.
Zamiast surowych zrzutów — **wystylizowane mockupy produktu** (piguły rezerwacji z logo
portali, popover edycji ceny, statusy synchronizacji per portal). Cennik to konfigurator
w 3 krokach (liczba jednostek → plan → waluta) ze środkowym planem „najczęściej
wybieranym". I kluczowe: **strona jest gęsta od artefaktów rzeczywistości** — odznaki
Booking Premier Plus / Airbnb Preferred / Expedia w hero, plakietki serwisów
recenzenckich, sekcja „historie gospodarzy" ze zdjęciami, czat z twarzą człowieka.
Szablonowa estetyka NIE czyta się jako AI slop, bo co drugi element jest dowodem,
że za produktem stoją ludzie i klienci.

**BedBooking:** wizualnie przestarzały (bootstrapowe siatki, cienie, zielone gradienty,
tęczowy kalendarz w hero), ale **masywnie ludzki**: liczby (644 tys. pobrań, 4,6★),
karuzela prawdziwych recenzji z imionami i nazwiskami z Google Play, wideo produktowe,
prawdziwe zrzuty aplikacji, sezonowa promocja z kodem i datą. Lekcja: **zaufanie bije
urodę** — brzydka strona z dowodami wygrywa z piękną stroną bez dowodów.

### Kalendarze — porównanie

- **Smoobu (mockupy marketingowe):** poziomy multikalendarz, piguły z logo portalu,
  edycja ceny z poziomu kalendarza, statusy synchronizacji per portal. Przyjazny, zaokrąglony.
- **BedBooking:** mobilna siatka z wielokolorowymi blokami — czytelność przeciętna,
  estetyka żadna, ale krzyczy „prawdziwy, używany produkt".
- **Nasz (zrzut z panelu):** poziomy timeline per obiekt na papierze, piguły w kolorze
  kanału, legenda źródeł, pod spodem kafle (rezerwacje w mies. / wolne noce / śr. długość
  pobytu) w IBM Plex Mono. **Typograficznie najczystszy z całej trójki**; paradygmat ten
  sam co u Smoobu. Braki wobec nich: brak logo portalu na pigule, brak akcji z poziomu
  kalendarza (u nas świadomie). Werdykt: **problem „AI slop" nie dotyczy panelu — panel
  pokazujmy śmiało. Dotyczy landingu.**

### Dlaczego landing czyta się jako „AI slop" — diagnoza

1. **Paleta i typografia trafiają w najbardziej rozpoznawalny klaster stylu generowanego:**
   ciepły krem + szeryfowa kursywa w nagłówkach + terakotowy/cynobrowy akcent to od 2024
   estetyka tysięcy stron generowanych przez AI. Nasza identyfikacja v2 jest autorska
   i konsekwentna (1px linie, zero cieni, mono na liczbach — to akurat NIE jest typowy
   slop), ale pattern-matching odbiorcy działa na skróty: widzi krem+serif+terakotę
   i klasyfikuje.
2. **Tiki strukturalne kojarzone z generatorami:** mono-etykiety „01 · Z PRAKTYKI",
   „FUNKCJE · 04", podpis „RYS. 1 — PANEL ZYSKU NETTO", kursywa wtrącana w nagłówki
   („pod kontrolą", „— *zanim* zapyta"), idealnie równe siatki kart 3× i 2×2.
3. **Najważniejsze: zero artefaktów rzeczywistości.** Na całej stronie nie ma ani jednego
   zdjęcia (domków, człowieka), ani jednego nazwiska, ani jednej liczby ze świata, ani
   jednego prawdziwego zrzutu produktu — wszystko jest wystylizowaną makietą z wymyślonymi
   danymi („69 520 zł ▲12%"). **Strona, na której wszystko mogło zostać wygenerowane,
   czyta się jako wygenerowana — nawet jeśli nie była.** To jest sedno feedbacku.
4. Copy jest paradoksalnie najbardziej ludzkim elementem („Wklejasz linki iCal…
   co godzinę", „Mniej telefonów «o której kończy się doba?»") — **copy nie ruszać.**

### Plan uczłowieczenia (kolejność wg efekt/koszt)

1. **Prawdziwe zdjęcia domków właściciela** przy karcie „Zbudowane przy własnych domkach"
   — telefonowe, niedoskonałe, z podpisem miejsca. Jedno prawdziwe zdjęcie robi więcej
   niż jakikolwiek redesign. *(Potrzebne od właściciela: 3–5 zdjęć.)*
2. **Blok założyciela:** imię, zdjęcie, dwa zdania „dlaczego to zbudowałem". Imię
   i nazwisko Operatora i tak jest publiczne w Regulaminie — twarz przy nim to czysty
   zysk zaufania. *(Decyzja właściciela — czy chce być twarzą.)*
3. **Prawdziwe zrzuty panelu zamiast (lub obok) stylizowanych makiet** — panel wygląda
   dobrze (patrz wyżej); pokazujmy produkt, nie ilustrację produktu. Makietę „69 520 zł"
   podpisać jawnie „dane przykładowe" albo zastąpić zrzutem.
4. **Social proof z bety, gdy tylko powstanie:** licznik („X gospodarzy, Y obiektów
   w becie"), 2–3 cytaty z imieniem i miejscowością; do tego publiczny changelog
   (kandydat z analizy IdoBooking) jako dowód życia. **To jest deliverable bety równie
   ważny jak bugfixy** — Smoobu ma odznaki OTA, BedBooking ma Google Play, my nie mamy
   żadnej waluty zaufania i beta jest jedyną mennicą.
5. **Redukcja tików:** kursywa szeryfowa w nagłówkach maksymalnie w jednym miejscu (hero);
   numerowane etykiety tylko tam, gdzie numer coś znaczy (kroki „jak to działa" — tak,
   dekoracja sekcji — nie); jedna sekcja łamiąca równą siatkę kart.
6. **Czego NIE robić:** nie wymieniać palety ani fontów (identyfikacja v2 jest spójna
   z produktem i dokumentami — wymiana byłaby kapitulacją wobec pattern-matchingu,
   a nowa „bezpieczna" paleta wpadłaby w inny klaster slopu); nie wstawiać stockowych
   zdjęć ludzi przy laptopach (stock pogarsza sprawę bardziej niż abstrakcja); nie
   kopiować estetyki Smoobu.

## 8. Co przejąć, czego nie

**Przejąć (wersje mikro; pierwsze trzy spójne z listą z analizy IdoBooking):**

1. **Szablony wiadomości do kopiowania** (Smoobu i BedBooking mają) — gotowe treści
   PL/EN z linkiem przewodnika, gospodarz wkleja sam. Bonus odkryty w badaniu: szablony
   Smoobu istnieją w 7 językach, **polskiego wśród nich nie ma**. *Ryzyko: budowa
   automatu wysyłki — łamie zasadę „zero wysyłki".*
2. **Auto-zadania z rezerwacji** (wzorzec przypomnień BedBookinga): nowa rezerwacja
   z iCal sama tworzy zadania (sprzątanie po wyjeździe, wysłanie przewodnika przed
   przyjazdem) w istniejącym module Zadań. *Ryzyko: silnik reguł à la Smoobu zamiast
   trzech domyślnych szablonów.*
3. **Łagodne lądowanie po trialu** (BedBooking: dane nie znikają): po 14 dniach tryb
   tylko-do-odczytu zamiast twardej blokady — obniża próg powrotu i temperaturę decyzji.
   *Ryzyko: pełny freemium kanibalizujący abonament. Uwaga: wymaga przemyślenia względem
   retencji porzuconych triali (Polityka §2).*
4. **Kalendarz zajętości do osadzenia na własnej stronie gospodarza** (BedBooking) —
   czysty widok wolne/zajęte z naszych danych, bez rezerwowania i płatności. Naturalny
   pomost do decyzji „request-to-book po becie" z analizy IdoBooking. *Ryzyko: booking
   engine tylnymi drzwiami przy wstrzymanym Stripe.*
5. **Konfigurator uczciwej ceny na cenniku** (odwrócony wzorzec Smoobu): suwak liczby
   obiektów pokazujący „u nas zawsze 29,99 — u konkurencji per pokój rośnie tak:".
   Ich model wzrostu jako nasza amunicja.

**Nie kopiować:** unified inbox i automaty komunikacji (wciągają w deliverability
i RODO), AI-odpowiedzi (nie wysyłamy wiadomości), kreator stron www, dynamic pricing,
aplikacje natywne na siłę (PWA wystarcza funkcjonalnie — braki nadrabiamy inną walutą
zaufania), model per-jednostka (nasza cena płaska to tożsamość).

## 9. Pozycjonowanie i mapa segmentów

**Oddajemy Smoobu:** gospodarza na 3+ portalach z potrzebą sync cen, booking engine
i check-inu online. **Oddajemy BedBookingowi:** tego, kto chce darmowej appki ze sklepu
do odhaczania rezerwacji i nic więcej. ⚠️ Krytyk słusznie zauważa, że „ten drugi" może
być większością segmentu — dlatego granice trzeba zweryfikować betą, nie deklaracją.

**Nasz klient (hipoteza do potwierdzenia):** polski gospodarz 1–6 obiektów, sam rozlicza
najem, sprzedaje direct + 1–2 portale, chce śladu dowodowego. Dwa pytania rozpoznawcze:
„Rozliczasz ryczałt/PIT z najmu samodzielnie?" oraz „Wystarczy ci synchronizacja
co godzinę?". Dwa razy „tak" = nasz. 

**Komunikaty (po korektach z tej analizy):**

1. **„29,99 zł i to cała cena. Drugi domek? Nadal 29,99."** — atak na per-pokój, nie
   licytacja z planami darmowymi.
2. **„Gość nie dostanie kodu, zanim nie zaakceptuje regulaminu — a Ty masz dowód."**
3. **„Jedyny polski system dla wynajmujących, który sam wylicza podatek gospodarza."**
   (nie: „jedyni na rynku")

## 10. Czarny scenariusz i co go falsyfikuje

Recenzja adwersaryjna sformułowała scenariusz ostrzejszy niż „BedBooking doda podatki" —
i właściciel powinien go przeczytać w oryginalnym brzmieniu: **być może BedBooking już
wygrał tego klienta.** Kalendarz w telefonie bez podwójnych rezerwacji domyka darmowy/tani
plan + księgowa, która podatek i tak policzy; Smoobu zbiera ambitnych; darmowe tiery —
wrażliwych cenowo. My wchodzimy z iCal co godzinę, bez sklepu, bez social proof i bez
działającego pobierania płatności. Segment „sam rozlicza + chce śladu dowodowego" stoi
na dwóch niezbadanych założeniach — może być mniejszy, niż zakładamy.

**Co go falsyfikuje (mierniki do wpięcia w betę):**

1. Czy testerzy **realnie używają modułu podatkowego** (dotarcie w pierwszej sesji,
   powroty do zakładki)? Jeśli nie — „aha moment" nie działa albo klin jest urojony.
2. Czy ktokolwiek wybrał nas **zamiast** BedBookinga (a nie obok)? Pytanie wprost
   w rozmowach z testerami: „czego używałeś wcześniej i dlaczego to porzuciłeś?"
3. Jak często pada prośba o „prawdziwą synchronizację"/API? (miernik sufitu iCal)
4. Czy bramka regulaminowa przewodnika jest używana i chwalona, czy ignorowana?

Dodatkowe luki do domknięcia poza betą: **plan darmowy BedBookinga od środka** (co dokładnie
zawiera — konto testowe), wycena Hotres (mystery shopping), **ryzyko prawne modułu
podatkowego** (granica doradztwa podatkowego — pytanie do `legal`), kanały sprzedaży
polskiego mikro-gospodarza (czy żyje z Booking/Airbnb, czy z Nocowanie.pl i Facebooka).

---

## Metodologia i źródła

Odczyt live 2026-08-31: smoobu.com/pl (strona główna, cennik, channel manager — także
zrzuty ekranu), bed-booking.com (+ cennik i specyfikacja pricing.pl.md), hotres.pl,
kwhotel.com, docs.smoobu.com, support.smoobu.com, Google Play / App Store. Zewnętrzne:
Trustpilot, Capterra, HostRadar, raporty giełdowe HomeToGo, cenniki graczy globalnych
(część przez recenzje — oznaczone jako orientacyjne). Zrzuty naszego panelu: atrapy
danych przez istniejącą infrastrukturę e2e (Playwright + firebase-mock), tymczasowy
spec usunięty po użyciu. Rozbieżności rozstrzygane na rzecz odczytu live; szacunki
oznaczone [założenie]/[szacunek]. Poprawki recenzji adwersaryjnej naniesione (m.in.
Vrbo=iCal wg supportu Smoobu, rok założenia 2014, konto edycyjne €12, usunięta obietnica
„płać za sezon" — billing jeszcze nie działa).
