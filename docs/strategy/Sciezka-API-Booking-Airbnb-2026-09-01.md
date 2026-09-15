# Ścieżka do API Booking.com i Airbnb — buy, build czy czekać

**Data:** 2026-09-01 · **Dla:** właściciel · **Status:** finalny
**Kontekst:** domyka pytanie otwarte w trzech analizach konkurencji ([[strategy/Analiza-konkurencji-IdoBooking-2026-08-31]], [[strategy/Analiza-konkurencji-Smoobu-i-rynek-2026-08-31]], [[strategy/Plan-konkurencyjny-BedBooking-2026-09-01]]): tam „nie buduj teraz, wróć po sygnale z bety" — tutaj pełna ścieżka wykonania na dzień, w którym sygnał przyjdzie.

Metoda: 4 raporty badawcze (program partnerski Booking.com, dostęp do API Airbnb,
agregatory connectivity, architektura na naszym stacku — agent czytał nasz kod),
rekomendacja strategiczna, recenzja adwersaryjna. Poprawki recenzji naniesione
(m.in. rachunek z VAT od importu usług, odchudzenie listy „na teraz").

---

## Wnioski w 60 sekund

1. **Bezpośrednia droga jest dziś zamknięta — i to nie przez nas.** Booking.com
   **wstrzymał nabór nowych partnerów connectivity do odwołania**; Airbnb **w ogóle nie
   przyjmuje wniosków** (partnerów zapraszają sami, kryterium to wolumen podaży —
   klienci 1–6 obiektów to zero „supply opportunity"). Pytanie „jak zbudować własne API"
   ma więc odpowiedź: **teraz się nie da, a gdyby się dało — nie warto** (wymagany
   zarejestrowany podmiot, próg wnoszonych obiektów, certyfikacja liczona w miesiącach,
   utrzymanie na lata).
2. **Realna ścieżka to „wynajmij connectivity":** agregator white-label, który sam jest
   certyfikowanym partnerem obu portali. Najlepszy kandydat: **Channex.io** (Airbnb
   Preferred+ 2024, publiczny cennik, webhooki, restrykcje, chat, 200+ PMS-ów na
   pokładzie). Nasz klient dostaje prawdziwą dwukierunkową synchronizację, my nie
   przechodzimy żadnej certyfikacji OTA — tylko techniczną certyfikację u agregatora.
3. **Ekonomia wymusza drugi plan cenowy.** Koszt Channex z VAT od importu usług:
   ~590 zł/mies. opłaty platformowej + ~2,30 zł/obiekt. Rekomendacja: **drugi płaski plan
   „Sync" 59,99 zł/mies bez limitu obiektów** (baza 29,99 nietknięta) — próg opłacalności
   ~36 klientów Sync. Dwa płaskie plany to nie grzech modułowy IdoBooking — ale zapis
   do konstytucji cennika: **żadnych dopłat wewnątrz planów, nigdy**.
4. **Niewygodna prawda o Airbnb:** podpięcie gospodarza przez API przenosi go
   **przymusowo na prowizję host-only 15,5%** (zamiast ~3% przy split-fee). Dla naszego
   mikro-gospodarza to setki złotych miesięcznie — **połowa obiecywanej wartości syncu
   jest dla niego antywartością**. Realna wartość API to głównie Booking.com.
5. **Bramki z poprzednich analiz zostają w mocy.** Start budowy dopiero po: sygnale
   z bety (miernik nr 3) + odwieszeniu Stripe + ~40–50 płacących kontach. Jedyna praca
   „na teraz": naprawa tożsamości obiektu (`propertyId` zamiast nazwy — to bug niezależny
   od OTA) i projekt pól pod reguły (papier, nie kod).

## 1. Booking.com — jak wygląda droga bezpośrednia (gdy wróci nabór)

- **Stan:** portal connect.booking.com komunikuje wstrzymanie integracji z nowymi
  dostawcami do odwołania (aktualizacja regulaminu; bez daty powrotu). Jedyne, co można
  zrobić dziś: napisać na connectivity@booking.com i obserwować reopening.
- **Wymagania formalne (wg zasad sprzed pauzy):** umowa connectivity (LEID) —
  w praktyce **zarejestrowany podmiot** (kolizja z działalnością nierejestrowaną),
  zgodność PCI DSS/RODO, software chmurowy, zarządzanie ARI w czasie rzeczywistym
  i **zobowiązanie do wniesienia minimalnej liczby obiektów** (progi niepubliczne).
  Program bezpłatny — barierą jest inżynieria i wolumen, nie opłata.
- **Minimum techniczne:** Rates & Availability (ARI) + Reservations (model pull
  z obowiązkowym acknowledge — bez potwierdzenia rezerwacja wraca w kolejnych
  odpytaniach); Content opcjonalny (treść może zostać w extranecie). Formaty XML
  (OTA 2003B / B.XML) i nowsze JSON. Wymóg: rok danych ARI załadowany z góry.
- **Certyfikacja:** test property, testowe rezerwacje, samocertyfikacja z wysyłką
  RUID-ów z firmowej domeny. Czas: oficjalnie brak; szacunki branżowe mówią
  o miesiącach, a budowę klasy produkcyjnej jedno źródło wycenia na 12–18 miesięcy
  [jedno źródło, traktować jako rząd wielkości].
- **Utrzymanie:** twarde KPI (rezerwacje <5% fallbacków/mies., ARI <10% błędów/mies.)
  i **regularne deprecacje** — realnie 1–2 obowiązkowe migracje rocznie (przykłady:
  sunset logowania hasłem 31.12.2025, starego Content API 31.12.2026). Wcześniejszy
  szacunek „0,25–0,5 etatu na zawsze" pozostaje założeniem, ale kierunkowo się broni.
- **Tiery** (Certified → Premier → Premier Plus) zależą od punktów za jakość łącza,
  liczbę produktów i wolumen — dla mikro-dostawcy Certified wystarcza operacyjnie;
  odznaki Premier to gra dla graczy z tysiącami obiektów.

## 2. Airbnb — dlaczego drzwi są zamknięte i co z tego wynika

- **Nie ma formularza aplikacyjnego.** Airbnb samo wyszukuje i zaprasza partnerów;
  kryteria: wnoszona podaż, siła technologii, zdolność obsługi. Krążący próg
  „~1000 listingów" jest plotką — ale miękkie kryterium podaży działa jak próg.
  BedBooking dostęp **ma** (prawdopodobnie zdobyty przed zamknięciem naboru) —
  to przewaga zaszłości, której nie odtworzymy wprost.
- **Model prowizji — kluczowy fakt:** od 27.10.2025 hosty podłączone przez
  API/PMS są przenoszone na **host-only fee, od 1.12.2025 podniesioną do 15,5%**
  (poza kilkoma krajami; Polska bez wyjątku). BedBooking potwierdza to wprost
  w swojej pomocy. **Wniosek strategiczny: dla gospodarza 1–3 obiektów API Airbnb
  bywa gorsze niż iCal** — 15,5% z jego kieszeni to często więcej niż wartość
  szybszej synchronizacji. Oficjalny iCal Airbnb: odświeżanie ~3 h, przenosi samą
  dostępność — i dla mikro-skali to akceptowalny standard rynkowy.
- **Konsekwencja dla produktu:** nawet po wdrożeniu agregatora podpięcie Airbnb
  przez API musi być **świadomym wyborem klienta** (API albo iCal, per portal),
  z ostrzeżeniem o prowizji **przed** podpięciem — w UI i na landingu. Inaczej
  pierwsza fala klientów uzna, że „sync ich okradł".

## 3. Agregatory — ścieżka „buy": porównanie

| Dostawca | Kanały API 2-kier. | Cena / obiekt VR / mies. | Próg wejścia | White-label |
|---|---|---|---|---|
| **Channex.io** | 62 (ARI+rezerwacje+chat+recenzje, webhooki) | 0,50 USD + **130 USD/mies platforma** | 0 obiektów, bez setup fee | pełny w produkcie; w extranecie Booking widać „Channex.io" |
| Zodomus | Booking, Airbnb, Expedia, Agoda | 0,50 €/listing/kanał + 0,10 €/rezerwację, **bez platformy** | 0; darmowy sandbox | API-only |
| Rentals United | ~90+ | niepubliczna | min. 10 obiektów, ~3 mies. integracji, obowiązkowy Content | pełny, szczelny |
| NextPax | 150+ | niepubliczna (enterprise) | negocjacje | tak |
| Beds24 (backend) | Booking, Airbnb, Expedia, Vrbo | od ~8,40 €/obiekt detal | niski | tak, ale **konkuruje o naszego klienta** |

**Werdykt: Channex.** Najlepszy stosunek zakresu do ryzyka wykonania (publiczna
dokumentacja z samodzielną certyfikacją, webhooki, restrykcje, Airbnb Preferred+,
jawny cennik). **Zodomus** = darmowy sandbox do prototypu i dźwignia negocjacyjna;
przy bardzo małej skali mógłby być tańszym startem, ale mniejsza firma i węższy zakres
to wyższe ryzyko zależności. Rentals United/NextPax — enterprise, odpad na tę skalę.

**Ograniczenie uczciwości:** certyfikaty należą do agregatora. Wolno mówić
„synchronizacja przez certyfikowaną infrastrukturę partnera connectivity";
**nie wolno** „jesteśmy certyfikowanym partnerem Booking.com/Airbnb".
Marka Channex i tak jest widoczna w extranecie Booking — nie ukrywamy jej.

## 4. Architektura na naszym stacku (z kodu, nie z powietrza)

Agent architektury przeczytał `functions/index.js`, `functions/ical-sync.js`,
`firestore.rules` i model danych. Najważniejsze ustalenia:

- **Blok zerowy: w modelu nie ma cennika ani restrykcji.** `settings/properties.items[]`
  to `{id, name, secretToken}`; `rentals.income` to kwota rezerwacji, nie plan cen.
  Bez cennika per noc żaden agregator nie przyjmie rate planu. Proponowany model:
  `users/{uid}/rates/{propertyId_YYYY-MM}` (dokument na obiekt-miesiąc, mapa
  dzień → {cena, minStay, closed}) — ten sam tani wzorzec co `syncState`.
- **Bug niezależny od OTA:** rezerwacje wiążą się z obiektem **po nazwie**
  (`rentals.property`), nie po `id` — zmiana nazwy obiektu w panelu zrywa dziś
  mapowanie eksportu iCal. Migracja na `propertyId` to naprawa kruchości, warta
  zrobienia bez względu na decyzję o sync.
- **Webhook pisze przez Admin SDK z pominięciem reguł** → walidację trzeba zdublować
  wspólnym walidatorem (wzorzec lustrzanego testera ze skilla `reguly`), a nowe pola
  (`otaId`, `channel`, `otaStatus`) **muszą wejść do allowlisty `isValidRental`** —
  reguła waliduje dokument po merge'u, więc bez tego gospodarz nie zapisze edycji
  zsynchronizowanej rezerwacji (dokładnie pułapka X26 z `syncStatus`).
- **Przepływ wariantu Channex (~9 bloków):** model cennika → migracja `propertyId` →
  panel mapowania kanałów (klucz API tylko serwerowo) → webhook z idempotencją po
  `ota_reservation_id` i deduplikacją z iCal (okno przejściowe, potem wygaszenie linku
  iCal dla podpiętego portalu) → trigger na `rentals` + kolejka z koalescencją → push
  cen/restrykcji → feature flag `otaEnabled` (tanie wyjście — konta bez sync nie płacą
  ani odczytem) → monitoring (dead-letter, alert wieku kolejki, alert 401).
  Alarm kolizji **zostaje** jako siatka bezpieczeństwa; anulacje mapowane na istniejącą
  semantykę `vanished` (nigdy nie kasujemy automatycznie).
- **Wariant własnego API Booking (~13 bloków)**: wszystko powyższe plus serwerowe
  endpointy w ich kontrakcie, certyfikacja zewnętrzna, coroczne migracje wersji
  i wymóg podmiotu rejestrowego — **za jeden portal**, bo Airbnb i tak zamknięte.
  Odrzucony.

## 5. Ekonomia i cennik (po korekcie krytyka: z VAT od importu usług)

Przy zwolnieniu z VAT (art. 113) import usług oznacza +23% bez prawa odliczenia
[mechanikę potwierdzić z księgową]:

- obiekt: 0,50 USD ≈ **2,30 zł/mies** · klient z 6 obiektami ≈ **13,70 zł** (46% z 29,99)
- opłata platformowa: 130 USD ≈ **590 zł/mies** — 20 abonamentów, zanim ktokolwiek
  cokolwiek zsynchronizuje. To ona jest bramką, nie koszt per obiekt.

**Warianty cennika:**

- W1 — sync w cenie + podwyżka bazy: ❌ każe wszystkim dotować mniejszość i łamie
  obietnicę founding members.
- **W2 — drugi płaski plan „Sync" 59,99 zł/mies bez limitu obiektów: ✅ rekomendowany.**
  Nadwyżka ~30 zł pokrywa koszt krańcowy nawet klienta 6-obiektowego; platforma spina
  się przy **~36 klientach Sync**. Oba plany pozostają „i to cała cena". Kontrast:
  BedBooking Pro = 79 zł + 14–28 zł netto za każdy kolejny pokój — nasz flat 59,99
  przy 3 obiektach jest o połowę tańszy.
- W3 — dopłata per obiekt: ❌ mechanika BedBookinga i grzech modułowy IdoBooking.

⚠️ Dwie konsekwencje dla spraw właścicielskich: plan 59,99 **przyspiesza wyczerpanie
limitu działalności nierejestrowanej** (konto Sync liczy się podwójnie do przychodu) —
kolejny argument, żeby E2/rachunek JDG zrobić przed launchem; a pokusa dokupowania
modułów Channex (chat +0,50 USD, karty) musi się odbić od zasady:
**żadnych modułów wewnątrz planów**.

## 6. Bramki i sekwencja — co kiedy

**Bramki startu budowy (wszystkie trzy, bez zmian z poprzednich analiz):**

1. Miernik bety nr 3: powtarzalne prośby testerów o prawdziwą synchronizację.
2. Stripe odwieszony decyzją właściciela — bez płatności nie ma komu sprzedać planu Sync.
3. ~40–50 płacących kont (żeby ~590 zł platformy nie zjadało MRR; próg pełnej
   rentowności ~36 kont Sync).

**Na teraz (odchudzone przez krytyka do rzeczy naprawdę bezwarunkowych):**

- **Migracja `rentals.property` → `propertyId`** — naprawa realnego buga (zmiana nazwy
  obiektu zrywa eksport iCal), użyteczna niezależnie od OTA. Zadanie dla `dev`.
- **Projekt pól pod allowlistę** (`otaId`, `channel`, `otaStatus`, model `rates/`) —
  papier, nie kod; żeby w dniu otwarcia bramek nie projektować pod presją.
- **Mail na connectivity@booking.com** (monitoring reopeningu naboru) — pięć minut,
  zero zobowiązań.
- ❌ Za bramkami zostają (krytyk słusznie wyciął z „teraz"): edytor cennika per noc
  (tygodnie UI bez konsumenta — projektować dopiero pod kontrakt Channexa),
  sandbox/prototyp (to już start budowy).

**Po otwarciu bramek:** Channex WhiteLabel (Zodomus jako dźwignia negocjacyjna),
budowa wg bloków z sekcji 4, plan Sync 59,99, odmrożenie słowa „channel manager"
**dopiero gdy działa na produkcji** — z precyzyjnym zakresem („dwukierunkowa
synchronizacja z Booking.com i Airbnb; pozostałe portale przez iCal") i obowiązkowym
ostrzeżeniem o 15,5% przy Airbnb.

## 7. Alternatywa zerowa — kiedy nie robić nic (steelman krytyka)

Dla klienta 1–4 obiektów okno iCal to pojedyncze potencjalne kolizje rocznie, łapane
alarmem; na Airbnb uczciwa rada dla mikro brzmi wręcz „nie podpinaj API — 15,5% zamiast
~3% to setki złotych miesięcznie". Zostaje sam Booking, za ~590 zł/mies. kosztu stałego.
Smoobu z pełnym API ma 28% recenzji o bugach — „uczciwie nazwana granica" jest fosą,
nie wstydem. **Opcja zerowa wygrywa, dopóki miernik 3 milczy, klienci nie odchodzą przy
5+ obiektach, a MRR < ~2 000 zł.** Przegra kiedyś — ale dziś przegrywa tylko
z niecierpliwością.

---

## Metodologia i źródła

Badanie 2026-09-01: developers.booking.com + connectivity.booking.com (docs, KPI,
deprecacje, samocertyfikacja), connect.booking.com (pauza naboru — cytowana także
z opracowań wtórnych), materiały o programie partnerskim Airbnb (news.airbnb.com,
Hospitable, Hostfully — 15,5% host-only; Airbnb Help art. 99 — iCal ~3 h), cenniki
i dokumentacja agregatorów (channex.io/pricing, docs.channex.io, zodomus.com,
rentalsunited.com, nextpax.com, wiki.beds24.com, developer.siteminder.com), architektura
z odczytu naszego kodu (`functions/`, `firestore.rules`). Szacunki miękkie oznaczone
w tekście ([jedno źródło]/[założenie]); kursy USD/EUR i mechanika VAT od importu usług
do potwierdzenia z księgową. Poprawki recenzji adwersaryjnej naniesione.
