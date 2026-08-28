# 🏗️ Architecture Decisions Log

Record of important decisions and their rationale.

## ADR-001: Use Firebase as Backend-as-a-Service

**Date**: 2025-01-15  
**Status**: ACCEPTED  
**Context**: Need scalable backend for rental management app without managing servers

**Decision**: Use Firebase (Firestore + Auth + Storage + Cloud Functions)

**Rationale**:
- ✅ No backend infrastructure to manage
- ✅ Real-time database for live updates
- ✅ Built-in authentication
- ✅ Scales automatically
- ✅ Free tier generous for development
- ❌ Vendor lock-in
- ❌ Limited query flexibility vs SQL

**Consequences**:
- Must use Firestore query language (no SQL)
- Need to design schema carefully (no joins)
- Limited by 500 concurrent connections per user
- Pricing scales with usage

**Alternatives Considered**:
- AWS DynamoDB (more complex setup)
- MongoDB + Node.js (need to manage servers)
- PostgreSQL (overkill for this use case)

---

## ADR-002: React + Vite for Frontend

**Date**: 2025-01-15  
**Status**: ACCEPTED  

**Decision**: Use React 18+ with Vite bundler

**Rationale**:
- ✅ Fast development (HMR)
- ✅ Large ecosystem
- ✅ Easy to hire React developers
- ✅ Vite faster than Webpack

**Alternatives Considered**:
- Vue.js (smaller ecosystem)
- Svelte (less community support)
- Next.js (overkill, adds complexity)

---

## ADR-003: Playwright for E2E Testing

**Date**: 2025-06-15  
**Status**: ACCEPTED  

**Decision**: Use Playwright instead of Cypress

**Rationale**:
- ✅ Better TypeScript support
- ✅ Supports multiple browsers (Chrome, Firefox, Safari)
- ✅ Mobile device emulation
- ✅ Faster execution
- ❌ Smaller community than Cypress

**Test Coverage Target**: 80% of user flows

---

## ADR-004: Firestore Security Rules Pattern

**Date**: 2025-02-01  
**Status**: ACCEPTED  

**Decision**: All reads/writes validated by Firestore rules, not app logic

**Rationale**:
- ✅ Database-level security (can't bypass)
- ✅ No duplicate permission checks
- ✅ Scales with data
- ❌ Rules can be complex

**Pattern**:
```
- Users read/write only own documents
- Public guides readable anonymously
- Admin operations via Cloud Functions
```

---

## ADR-005: Real-time Listeners via useFirebaseData Hook

**Date**: 2025-01-20  
**Status**: ACCEPTED  

**Decision**: Centralize Firestore listeners in custom hook

**Rationale**:
- ✅ Single source of truth
- ✅ Easier to manage subscriptions
- ✅ Reduces boilerplate

**Implementation**: `src/hooks/useFirebaseData.js`

**Impact**: All components subscribe to this hook, reduces listener count

---

## ADR-006: Public Guest Guides Require Signature

**Date**: 2025-02-10  
**Status**: ACCEPTED  

**Decision**: Guests must digitally sign terms before seeing access codes

**Rationale**:
- ✅ Legal protection
- ✅ Terms acceptance logged
- ✅ Proof of authorization
- ❌ Slight UX friction

**Implementation**:
- Guide shows content
- Signature form before code reveal
- Signature stored in Firestore

---

## ADR-007: iCal Export via Cloud Function

**Date**: 2025-03-01  
**Status**: ACCEPTED (BUT BUGGY)  

**Decision**: Export calendar as iCal format via Cloud Function with token auth

**Rationale**:
- ✅ No app backend needed
- ✅ Standard iCal format works with any calendar
- ✅ Token auth without user login

**Status**: working — `secretToken` is generated on property create/retrofit in `ManagerApp.jsx` and validated by the `exportIcal` function. (An earlier "not generated" bug note was false; verified 2026-06-29.)

---

## ADR-008: Storage Organization by Resource

**Date**: 2025-02-15  
**Status**: ACCEPTED  

**Decision**: Organize Firebase Storage by resource type and ID

**Pattern** (actual usage):
```
gs://bucket/
└── guides/{guideId}/          ← guest-guide media (only Storage path in active use)
```
Deleted together with the guide by `deleteUserAccount` (`bucket.deleteFiles({ prefix: 'guides/${guideId}/' })`).

**Rationale**:
- ✅ Clear structure
- ✅ Easy to delete by resource
- ✅ Supports multi-tenant security rules

---

## ADR-009: Cloud Functions for Account Deletion

**Date**: 2025-03-15  
**Status**: ACCEPTED (BUT INCOMPLETE)  

**Decision**: Use Cloud Function to delete all user data atomically

**Rationale**:
- ✅ Can delete across multiple collections
- ✅ Atomic operation
- ✅ Audit trail via logs

**Known Bug**: Storage files not fully deleted ⚠️

---

## ADR-010: Polish Language Default

**Date**: 2025-01-01  
**Status**: ACCEPTED  

**Decision**: Primary language is Polish, with i18n support planned

**Rationale**:
- Target market is Poland
- Easier to build MVP in one language
- Can add i18n later

---

## ADR-011: Email Verification Required

**Date**: 2025-02-01  
**Status**: ACCEPTED  

**Decision**: Users must verify email before using app fully

**Rationale**:
- ✅ Reduces spam
- ✅ Ensures valid contact
- ✅ Legal compliance

**UX**: Send verification email on signup, allow limited access until verified

---

## ADR-012: Stripe for Payments

**Date**: 2025-04-01  
**Status**: ACCEPTED  

**Decision**: Use Stripe for payment processing

**Rationale**:
- ✅ Secure PCI compliance
- ✅ Multiple payment methods
- ✅ Webhook support for confirmations
- ✅ Industry standard

**Webhook**: POST `/stripeWebhook` via Cloud Function

---

## ADR-013: Rezygnacja z panelu podsumowania podatkowego

**Date**: 2026-08-12
**Status**: ACCEPTED
**Context**: Commit `41383e7` (8.06) dodał `TaxSummaryPanel` — mikrorachunek, VAT-UE, próg
ryczałtu, tytuły przelewów. Commit `fb8a00e` („porządek struktury repo") przeniósł go do
`_legacy/` razem z wariantem V4, a produkcyjny panel v2 nigdy nie dostał zastępnika.
**Usunięcie nie zostało nigdzie odnotowane** — ani w [[Activity-Log]], ani w [[Known-Issues]],
ani tutaj. Wyszło dopiero przy naprawie e2e 12.08: `taxCalculator.js` eksportował cztery
funkcje, z czego trzy nie były wywoływane przez żaden komponent. Przy życiu trzymał je
wyłącznie import w teście.

**Decision**: Panel nie wraca. Usunięte: `calculateMonthlyTaxes()`, `generateMicroAccount()`,
`generateTransferTitle()` (246 linii) plus 8 osieroconych helperów, oraz 5 testów e2e,
które go sprawdzały.

**Rationale**:
- ✅ Martwy kod przez dwa miesiące — nikt nie zgłosił braku
- ✅ `calculateTaxes()` zostaje i **dalej pilnuje progu 100 000 zł**, więc obietnica
  z landingu („system sam przełącza stawkę") pozostaje prawdziwa
- ✅ `taxCalculator.js`: 462 → 166 linii, jeden eksport zamiast czterech
- ❌ Gospodarz nie zobaczy w aplikacji numeru mikrorachunku ani kwoty VAT-UE
- ❌ Kod da się odzyskać tylko z historii gita (`git show 41383e7`) albo z `_legacy/`

**Consequences**:
- Rozliczenie miesięczne gospodarz robi poza aplikacją; zostaje mu eksport CSV
  dla księgowego z Raportów (X4 partia 3)
- Gdyby panel miał wrócić: `_legacy/dashboard-original/components/TaxSummaryPanel.jsx`
  jest punktem wyjścia, ale wymaga portu na identyfikację `wpd-*` i podzakładkę w Finansach
- **Wniosek procesowy**: to zniknęło niezauważone, bo przy X4 przepuszczano tylko część
  suity („e2e 30/30" przy 133 testach). Deklaracja „e2e zielony" bez pełnego przebiegu
  nie jest dowodem.

---

## ADR-014: Nowa wersja aplikacji wchodzi na klik, nie automatem

**Date**: 2026-08-13
**Status**: ACCEPTED
**Context**: Aplikacja jest PWA z service workerem (`vite-plugin-pwa`). Przy
`registerType:'autoUpdate'` nowa powłoka instalowała się w tle i przejmowała stronę dopiero
przy kolejnym wejściu — po deployu użytkownik przez nieokreślony czas pracował na starym
kodzie, bez żadnej informacji ([[Known-Issues]] #15, zaobserwowane 2026-08-10). Decyzja
należała do właściciela, bo to kompromis między szybkością dotarcia poprawki a ryzykiem
przerwania pracy.

**Decision**: `registerType: 'prompt'` + pasek „Dostępna nowa wersja aplikacji. Odśwież,
żeby z niej korzystać." (`src/components/UpdatePrompt.jsx`). Przeładowanie następuje
wyłącznie po kliknięciu użytkownika. Do tego `registration.update()` co godzinę.

**Rationale**:
- ✅ Użytkownik wie, że jest nowa wersja — dziś nie wiedział
- ✅ Moment przeładowania wybiera on, nie deploy: nic nie wypada z formularza w połowie
- ✅ Pasek daje się zamknąć — to komunikat, nie blokada
- ❌ Poprawka dociera wolniej niż przy automacie: ktoś, kto zignoruje pasek, zostaje na starym
- ❌ Jeden komunikat systemowy więcej na ekranie (obok banera zgody i toastów)

**Consequences**:
- Pierwszy deploy po tej zmianie jeszcze niczego nie pokaże użytkownikom z aktywnym starym
  SW — pasek zacznie u nich działać od kolejnego wydania
- Weryfikacja PWA musi sprawdzać `navigator.serviceWorker.controller`: na **niekontrolowanej**
  karcie (pierwsze wejście) nowa wersja aktywuje się od razu i test wychodzi fałszywie zielony
- `curl` nadal nie weryfikuje deployu aplikacji — to się nie zmienia

**Alternatives Considered**:
- `skipWaiting` + automatyczne przeładowanie — odrzucone: mogłoby wypaść w środku
  wypełniania rezerwacji i skasować niezapisane dane
- Zostawić `autoUpdate` bez komunikatu — odrzucone: problem realny, koszt naprawy mały

**Related ADRs**: —

---

## ADR-015: Termin zadania = kotwica + dni ze znakiem (a nie osobne pole „dni po")

**Date**: 2026-08-21
**Status**: ACCEPTED
**Context**: Szablony zadań (`users/{uid}/settings/reminders.items[]`) miały jedno pole terminu —
`daysBefore` — liczone zawsze od daty przyjazdu. Jedynym sposobem na zadanie po pobycie była
wartość ujemna, która i tak odliczała od przyjazdu, więc prośba o opinię trafiała w środek
pobytu gościa. Tester zapytał wprost „czym są minus 2?" (2026-08-21,
[[Projects/Feedback-testera-2026-08-21]]). Trzeba było wybrać model danych, który doda drugą
kotwicę **bez migracji zapisanych szablonów** — te żyją na kontach testowych i produkcyjnych.

**Decision**: opcjonalne pole `anchor: 'arrival' | 'departure'` (brak = `'arrival'`) plus
dotychczasowe `daysBefore` **ze znakiem**: dodatni = przed kotwicą, ujemny = po. Interfejs
nie pokazuje znaku — składa go z listy „Kiedy" (przed/po × przyjazd/wyjazd) i liczby dni bez
znaku, a pod spodem wypisuje zdanie kontrolne („Zadanie pojawi się 2 dni po wyjeździe gościa").
Cała arytmetyka i cały opis słowny w jednym module `src/utils/taskSchedule.js`.

**Rationale**:
- ✅ Zero migracji: każdy zapisany szablon czyta się dalej tak samo, także ten z „-2"
- ✅ Zero zmian w regułach — `isValidSettings` wymaga od `reminders` tylko listy `items`
- ✅ Znak ma jedno znaczenie w całym systemie, a gospodarz go nie widzi
- ✅ Jedno źródło prawdy terminu — pulpit, szczegóły rezerwacji i ustawienia nie mogą się rozjechać
- ❌ Dwa pola opisują jedną rzecz: da się zapisać `anchor` bez sensownego `daysBefore` i odwrotnie
- ❌ Przy „0 dni" strony kotwicy są w danych nieodróżnialne (0 przed = 0 po = ten sam dzień)

**Consequences**:
- Formularz musi pamiętać wybraną stronę kotwicy **lokalnie** — inaczej przy „0 dni" lista
  wyboru wraca do „Przed…" i gubi wybór gospodarza w trakcie ustawiania (złapane testem e2e)
- `templateTiming()` normalizuje `-0` do `0`; do bazy nie trafia ujemne zero
- Każdy nowy widok zadań bierze termin z `taskSchedule.js`, nigdy nie liczy go u siebie

**Alternatives Considered**:
- Osobne pole `daysAfter` — odrzucone: dwa pola na tę samą oś, natychmiastowe pytanie,
  co znaczy wypełnienie obu
- Jedno pole `offset` z kotwicą zaszytą w `id` szablonu — odrzucone: kotwica przestałaby być
  edytowalna dla własnych zadań gospodarza
- Migracja zapisanych szablonów na nowy kształt — odrzucone: ryzyko bez zysku, skoro brak
  `anchor` daje dokładnie dotychczasowe zachowanie

**Related ADRs**: —

---

## Decision Template

```markdown
## ADR-016: Founding members — cena startowa gwarantowana na 12 miesięcy

**Data**: 2026-08-22
**Status**: ACCEPTED (decyzja właściciela)
**Kontekst**: Plan właściciela zakłada rok 1 na możliwie niskiej cenie kosztem zarobku, żeby
pozyskać maksymalnie wielu klientów, a następnie podwyżkę powiązaną z nowymi funkcjami. Symulacja
rentowności ([[strategy/Rentownosc-symulacja-2026-08-22]]) pokazała, że plan ma pokrycie
(podwyżka 29,99 → 49 zł znosi utratę 38,8% klientów bez spadku przychodu), ale że **wieczysta
gwarancja starej ceny dla pierwszej kohorty kosztuje 27 374 zł rocznie przy 120 klientach,
bezterminowo**. Regulamin §6 ust. 5 czekał na te warunki jako `[DO UZUPEŁNIENIA]` — bez nich
nie wolno wysłać pierwszego zaproszenia, bo to zobowiązanie wobec konsumenta.

**Decyzja**: Oferta founding members ma cztery parametry:

| Parametr | Wartość |
|---|---|
| **Okres gwarancji** | **12 miesięcy** (nie wieczyście) |
| **Kto się kwalifikuje** | każdy, kto rozpocznie płatną Subskrypcję do dnia zakończenia naboru |
| **Start okresu** | od **pierwszej płatności danego klienta** (każdy ma własne 12 miesięcy) |
| **Po okresie** | przejście na cenę bieżącą, z **uprzedzeniem 30 dni** |
| **Data zakończenia naboru** | ⏳ **jedyna nieustalona** — pochodna daty launchu (N4, prawnik) |

**Uzasadnienie**:
- ✅ Zachowuje obietnicę wobec pierwszych klientów, nie zabijając planu podwyżki.
- ✅ Odcięcie po 12 miesiącach zamyast wieczystego zamrożenia oszczędza ok. 27 tys. zł rocznie
  przy 120 klientach — i dotyczyłoby to dokładnie tych osób, które zostaną najdłużej.
- ✅ Liczenie od pierwszej płatności jest sprawiedliwe wobec późnych klientów; kosztem jest to,
  że podwyżki wchodzą falami przez cały rok, a nie jednego dnia.
- ✅ 30 dni uprzedzenia jest spójne z §6 ust. 7 Regulaminu (zmiana ceny w trybie zmiany Regulaminu).
- ❌ Fale podwyżek utrudniają komunikację „jedno wydanie, jedna nowa cena".

**Konsekwencje**:
- 🔴 **Komunikacja nie może nazywać tego rabatem.** Jeżeli oferta jest prezentowana jako obniżka,
  włącza się obowiązek podania najniższej ceny z 30 dni przed obniżką (dyrektywa Omnibus, §6 ust. 5).
  **Rekomendacja do potwierdzenia u prawnika: mówić „cena startowa gwarantowana na 12 miesięcy",
  a nie „rabat X%"** — jeśli 29,99 zł nigdy nie było poprzedzone wyższą ceną, nie ma obniżki,
  od której liczy się obowiązek.
- Stripe musi umieć utrzymać starą cenę dla istniejących subskrypcji przy zmianie cennika
  (w Stripe to osobny `Price` w tym samym `Product`) — do sprawdzenia przy wdrożeniu podwyżki.
- Potrzebny ślad w danych: data pierwszej płatności i znacznik founding membera, żeby po roku
  dało się wyliczyć, komu i kiedy wysłać uprzedzenie.

**Alternatywy rozważone**:
- **Cena wieczysta** — odrzucona: 27 374 zł/rok bezterminowo przy 120 klientach.
- **Stały rabat lojalnościowy po okresie** (np. −20% na zawsze) — odrzucona: łagodniejsza, ale
  nadal bezterminowa (ok. 14 tys. zł/rok przy 120 klientach i cenie 49 zł).
- **Oferta tylko dla uczestników bety** (5–10 osób) — odrzucona: marnuje ofertę jako mechanizm
  pozyskania na cały rok 1.
- **Limit liczbowy zamiast daty** („pierwszych 100") — odrzucona: buduje pilność, ale wymaga
  publicznego licznika i zamyka nabór w nieprzewidywalnym momencie.

---

## ADR-017: Blokad terminu z portali NIE importujemy

**Data**: 2026-08-24
**Status**: ACCEPTED (decyzja właściciela)
**Kontekst**: Przy pierwszym prawdziwym imporcie X26 na koncie właściciela weszły cztery
blokady terminu z Airbnb („Airbnb (Not available)"). Zapisują się jako `type: 'booking'`,
bo muszą blokować kalendarz i trafiać do eksportu — ale przez to **wchodzą do listy
najbliższych przyjazdów i generują zadania dla gości**: „wyślij instrukcję dojazdu",
„wyślij kod do skrytki z kluczami" dla terminu, na który nikt nie przyjeżdża. Stary silnik
zapisywał je tak samo, ale nie zaimportował ani jednej, więc problem nigdy się nie ujawnił.

**Decyzja**: zdarzenia rozpoznane jako blokada terminu są **pomijane przy imporcie**.
Rozpoznanie po treści `SUMMARY` (`isBlokada`), warianty zmierzone na żywych feedach 2026-08-24:
Airbnb „Airbnb (Not available)", Booking.com „CLOSED - Not available".

**Uzasadnienie właściciela**: gospodarz korzystający z WynajemPRO ma zwykle Booking.com
i Airbnb spięte kalendarzami **bezpośrednio ze sobą**, a nasza aplikacja jest trzecim
kalendarzem na wierzchu. Blokada dociera więc do drugiego portalu bez naszego pośrednictwa —
wciąganie jej do nas nie dodaje ochrony, tylko hałas.

**Konsekwencje**:
- ✅ Znika zaśmiecanie listy zadań i przyjazdów pozycjami bez gościa.
- ✅ Suma kontrolna feedu liczona jest bez blokad, więc przestawienie blokady w portalu
  nie wywołuje pełnego uzgodnienia i zapisu stanu.
- ⚖️ **Cena, zapisana świadomie: nasz kalendarz pokazuje jako wolne terminy zablokowane
  w portalu.** Kto polega WYŁĄCZNIE na WynajemPRO, zobaczy nieprawdziwą dostępność —
  np. pięciomiesięczna blokada zimowa będzie u nas wyglądać na wolną. Obejście podane
  w bazie wiedzy: dodać taki termin jako zwykłą rezerwację z kwotą 0 zł (wtedy zablokuje
  się też w portalach, bo nasz kalendarz jest do nich wysyłany).
- 🛡️ Blokady zaimportowane PRZED tą zmianą są **porzucane ze stanu po cichu**, bez
  oznaczania „zniknęła z portalu" — nic nie zniknęło, a alerty byłyby nieprawdą. Same wpisy
  zostają w bazie do decyzji gospodarza; zasady „nie kasujemy automatycznie" nie łamiemy.

**Alternatywy rozważone**:
- **Importować, ale oznaczyć nowym polem** (`isBlock`) i pomijać w zadaniach, przyjazdach
  i szczegółach — poprawne, ale wymaga kolejnej zmiany reguł i dotyka czterech widoków;
  odrzucone jako droższe od korzyści przy założeniu, że portale i tak są spięte.
- **Zostawić jak było** — odrzucone: zadania „wyślij kod do skrytki" dla blokady to defekt,
  który gospodarz zobaczy pierwszego dnia.

---

## ADR-NNN: [Title]

**Date**: YYYY-MM-DD  
**Status**: PROPOSED | ACCEPTED | DEPRECATED  

**Context**: Why is this decision needed?

**Decision**: What did we decide?

**Rationale**:
- ✅ Pros
- ❌ Cons

**Consequences**: What changes as a result?

**Alternatives Considered**:
- Option A
- Option B

**Related ADRs**: ADR-001, ADR-002
```

---

**Related**: [[Architecture]], [[Tech-Stack]]

---

## ADR-018: Podstawa wynajmu jest pytaniem, nie domyślną wartością

**Data**: 2026-08-25
**Status**: ACCEPTED (decyzja właściciela)
**Kontekst**: Analiza prawna panelu podatkowego ([[Analiza-panel-podatkowy-2026-08-24]] §B1)
wykazała, że `taxSummary.js` traktował `taxForm === 'lump_sum'` jako jedną sytuację, podczas
gdy ryczałt obejmuje **dwie różne sytuacje podatkowe**: najem prywatny (art. 6 ust. 1a ustawy
o ryczałcie) i usługi zakwaterowania w działalności gospodarczej (art. 6 ust. 1). Stawka
i próg 100 000 zł są dla obu identyczne — ale składki nie. Najem prywatny nie jest tytułem
do ubezpieczenia zdrowotnego, a odliczenie 50% składki z art. 11 ust. 1a odsyła wprost
do ust. 1, czyli wyłącznie do działalności.

Aplikacja doliczała jedno i drugie każdemu ryczałtowcowi. Przy przychodzie 84 600 zł oznaczało
to **9 966,96 zł zawyżenia rocznie** u gospodarza na najmie prywatnym i jednocześnie **ok. 424 zł
zaniżenia samego podatku** fałszywym odliczeniem — pomyłkę w obie strony naraz, niewykrywalną
dla użytkownika, bo nikt go o rozróżnienie nie pytał.

**Decyzja**: nowe pole `rentalBasis` (`null | 'private' | 'business'`) w ustawieniach
podatkowych, **świadomie bez wartości domyślnej**. Każda wartość domyślna byłaby zgadywaniem
cudzego statusu podatkowego, a koszt pomyłki jest wymierny w obie strony.

Dopóki `rentalBasis === null`, składki zdrowotnej **nie doliczamy i nie stosujemy odliczenia**.
Wynik jest wtedy zaniżony zamiast zawyżonego, a panel mówi wprost, czego nie policzył
i dlaczego. Lepszy brak liczby niż liczba nieprawdziwa.

**Czego świadomie NIE robimy**: nie twierdzimy, że gospodarz „nie płaci składki zdrowotnej".
Panel mówi wyłącznie „nie doliczamy" — o tym, co robi aplikacja. Zdanie o obowiązku byłoby
kwalifikacją sytuacji prawnej konkretnego podatnika, czyli czynnością z art. 2 ust. 1 pkt 1
ustawy o doradztwie podatkowym.

**Konsekwencje**: istniejące konta mają `rentalBasis` puste i przy pierwszym wejściu w panel
zobaczą pytanie zamiast wiersza zdrowotnej. To jest zamierzone — dotychczasowa liczba była
dla części z nich nieprawdziwa.

---

## ADR-019: Domyślna kwota wolna wynosi 0

**Data**: 2026-08-25
**Status**: ACCEPTED (decyzja właściciela, zgodna z rekomendacją legala)
**Kontekst**: `defaultTaxSettings.taxFreeAmount` wynosiło 30 000 zł. Kwota wolna jest jednak
**jedna na podatnika i na wszystkie źródła przychodu** (art. 27 ust. 1 ustawy o PIT), a grupa
docelowa WynajemPRO — wprost z briefu produktu — wynajmuje **obok etatu**. U takiego gospodarza
kwotę wolną konsumuje pracodawca przez PIT-2, więc aplikacja odejmowała ją **drugi raz**
i zaniżała podatek o **3 600 zł** (zmierzone na przykładzie, nie oszacowane).

**Decyzja**: wartość domyślna 0. Zero myli się w stronę zawyżenia, a panel istnieje po to,
żeby gospodarzowi nie zabrakło. Pole zostaje edytowalne — gospodarz bez etatu wpisuje 30 000
i dostaje wynik jak wcześniej. Przy polu stoi podpowiedź wyjaśniająca, kiedy zostawić zero.

**Pułapka, którą to ujawniło**: `podatekDochodowy()` czytał wartość przez
`Number(settings.taxFreeAmount) || kwotaWolna`. Zero jest w JavaScripcie fałszywe, więc
**świadomie wpisane 0 wracało do 30 000**. Sama zmiana wartości domyślnej nie zrobiłaby nic —
gospodarz z etatem dalej miałby zaniżony podatek, a pole sugerowałoby, że zadziałało.
Zamienione na sprawdzenie `Number.isFinite`. Zapis obowiązuje wszędzie, gdzie zero jest
poprawną odpowiedzią użytkownika, a nie brakiem odpowiedzi.

---

## ADR-020: Podatek liniowy i działalność nierejestrowana usunięte z aplikacji

**Data**: 2026-08-25
**Status**: ACCEPTED (decyzja właściciela)
**Kontekst**: Obie formy były zadeklarowane w projekcie panelu podatkowego i obsługiwane
w kodzie, ale **żadna nie była liczona zgodnie z prawem**. `podatekDochodowy()` przepuszczał
je do gałęzi domyślnej, która liczyła `podstawa × rate%`, gdzie `rate` wynosi domyślnie 8,5% —
czyli stawkę ryczałtu.

- **Podatek liniowy** to **19% od DOCHODU** (art. 30c ust. 1 ustawy o PIT), a więc po odjęciu
  kosztów — czego ta gałąź nie robiła (`podstawa = przychod`). Błąd rzędu dziesięciu punktów
  procentowych podstawy, w kierunku zaniżenia.
- **Działalność nierejestrowana** to **przychód z innych źródeł** (art. 20 ust. 1ba PIT),
  opodatkowany **według skali** (art. 27 ust. 1 PIT), z możliwością odliczenia kosztów,
  rozliczany w PIT-36. Ryczałt 8,5% nie ma tu zastosowania w żadnym wariancie.

Do tego panel milczał o dwóch rzeczach krytycznych dla użytkownika nierejestrowanego:
limit od 1 stycznia 2026 jest **kwartalny** (225% minimalnego wynagrodzenia = **10 813,50 zł**),
a najem krótkoterminowy z usługami prawdopodobnie w ogóle się w tej formie nie mieści.

**Decyzja**: obie formy usunięte z `taxSummary.js`, `taxCalculator.js`, `TaxesView.jsx`
oraz z dokumentów projektowych. Aplikacja obsługuje **dwie formy**: ryczałt i zasady ogólne.

**Koszt usunięcia był zerowy** — `SettingsModal.jsx` nigdy tych form nie oferował, więc żadne
konto nie mogło ich wybrać. Istniały wyłącznie jako martwe gałęzie kodu i obietnice
w dokumentacji.

**Zmiana zachowania przy nieznanej formie**: `podatekDochodowy()` zwraca teraz `null` zamiast
liczby policzonej stawką z ustawień, a `podsumowaniePodatkowe()` wystawia `formaZnana: false`
i `lacznieDoZaplaty: null`. `calculateTaxes()` zostawia pole podatku puste. Uzasadnienie:
liczba policzona „jakąś" stawką wygląda tak samo wiarygodnie jak prawdziwa. Puste pole
gospodarz zauważy; błędna kwota wygląda dobrze.

⚠️ **Pułapka przy tej zmianie**: `null + liczba` daje w JavaScripcie liczbę, więc brak podatku
przeszedłby po cichu jako „0 zł podatku" w sumie `lacznieDoZaplaty`. Stąd jawna flaga
`formaZnana` zamiast polegania na arytmetyce.

**Powrót do tematu**: obie formy mogą wrócić jako osobne zadania, po odpowiedzi na pytanie Q5
do doradcy podatkowego (czy najem krótkoterminowy z usługami mieści się w działalności
nierejestrowanej) i z własną ścieżką liczenia — dla nierejestrowanej: skala plus koszty plus
licznik limitu kwartalnego zamiast progu 100 000 zł.

---

## ADR-021: Współwłasność małżeńska ma trzy stany, nie jeden przełącznik

**Data**: 2026-08-25
**Status**: ACCEPTED (decyzja właściciela)
**Kontekst**: Lektura tekstu ustawy (2026-08-25) ujawniła **art. 12 ust. 13**: małżonkowie,
którzy złożyli oświadczenie z ust. 6, mają próg ryczałtu **200 000 zł**, nie 100 000 zł.
Żaden z wcześniejszych przeglądów tego nie miał. Dotyczy wprost grupy docelowej, bo
mieszkania na wynajem bywają wspólną własnością małżeńską.

Przy okazji okazało się, że układów jest **trzy, nie dwa**. Art. 12 ust. 6 odsyła do ust. 5:
przy współwłasności przychód dzieli się proporcjonalnie, *„chyba że złożą sporządzone na piśmie
oświadczenie o opodatkowaniu całości przychodu przez jednego z nich"*. Czyli:

| Sytuacja | Co rozlicza gospodarz | Próg |
|---|---|---|
| Wynajem na własny rachunek | całość | 100 000 zł |
| Współwłasność, bez oświadczenia | **połowę** | 100 000 zł |
| Współwłasność, z oświadczeniem (ust. 6) | całość za oboje | **200 000 zł** |

**Decyzja**: pole `spouseRental` o trzech wartościach (`'brak' | 'polowa' | 'calosc'`),
widoczne **wyłącznie przy ryczałcie i najmie prywatnym** — ust. 6 mówi o przychodach
z art. 6 ust. 1a, a przy działalności każdy małżonek prowadzi własną firmę i mechanizm
nie działa. Wartość domyślna `'brak'`, bo to sytuacja większości i jedyna, która nie zmienia
niczyjego wyliczenia wobec stanu sprzed tej opcji.

**Dlaczego nie jednym checkboxem „rozliczenie małżeńskie"**, o co pierwotnie poproszono:

1. **Nazwa myliłaby z czymś innym.** „Rozliczenie małżeńskie" brzmi jak wspólne zeznanie
   roczne — a to przy ryczałcie **nie istnieje** w ogóle. Gospodarz zaznaczyłby to w dobrej
   wierze i dostał zawyżony o 100 000 zł próg bez żadnej podstawy.
2. **Dwa stany zgubiłyby przypadek częstszy.** Oświadczenie z ust. 6 trzeba złożyć w terminie
   z ust. 7 (do 20. dnia miesiąca po pierwszym przychodzie). Kto go nie złożył — a to domyślny
   stan rzeczy — rozlicza połowę. Bez tej opcji aplikacja liczyłaby mu **podwójny przychód**
   i fałszywie alarmowała przekroczeniem progu.

**Konsekwencja dla interfejsu**: przy wariancie `'polowa'` rachunek pokazuje osobny wiersz
„Część małżonka · rozlicza ją u siebie", a „Przychód netto" zmienia nazwę na „Twój przychód
do opodatkowania". Bez tego zestawienie „brutto 150 000, netto 75 000" wygląda jak błąd
aplikacji. Karta progu dopisuje, z którego wariantu wynika jej liczba.

⚠️ **Czego to nie rozstrzyga**: czy dana nieruchomość faktycznie jest współwłasnością i czy
oświadczenie zostało skutecznie złożone — to wie tylko gospodarz. Aplikacja liczy zgodnie
z odpowiedzią, nie sprawdza jej. Tak samo jak przy `rentalBasis` (ADR-018).

---

## ADR-022: Mikrorachunek i tytuły przelewów skreślone, nie odłożone

**Data**: 2026-08-25
**Status**: ACCEPTED (decyzja właściciela)
**Kontekst**: Mikrorachunek podatkowy i generator tytułów przelewu istniały w panelu
usuniętym commitem `fb8a00e` i od ADR-013 wisiały w planach jako „wrócą później".
Kod zniknął rok temu, obietnica została.

**Decyzja**: **skreślamy je z planu**, zamiast przenosić na kolejną turę.

Uzasadnienie właściciela jest metodyczne, nie oszczędnościowe: **niech odezwie się popyt.**
Funkcja, o którą przez całą betę nikt nie zapytał, jest kandydatem na pracę wykonaną
dla samego domknięcia listy. Numer mikrorachunku gospodarz i tak zna — generuje go raz
na stronie podatki.gov.pl i wkleja do bankowości, gdzie zostaje na stałe. Tytuł przelewu
przy ryczałcie to „PIT-28" i rok. Obie rzeczy są jednorazowe, a my planowaliśmy je jako
funkcję cykliczną.

**To jest hipoteza do sprawdzenia, nie porzucenie.** Jeśli któryś z testerów o nie zapyta,
wracają — i wtedy będziemy wiedzieć, że są potrzebne, zamiast zgadywać. Jeśli nikt nie
zapyta przez całą betę, to jest odpowiedź.

**Zapisane, żeby nie wróciło z rozpędu**: brak tych funkcji nie jest zaległością do
odhaczenia przy najbliższym sprzątaniu backlogu. Ich powrót wymaga sygnału od użytkownika.

**Co zostaje w module poza tym**: VAT-UE / import usług od prowizji portali. To jedyna
rzecz, której nie da się rozstrzygnąć samodzielnie z tekstu ustawy — patrz ADR-023.

---

## ADR-023: VAT od prowizji portali — mówimy, czego nie liczymy

**Data**: 2026-08-25
**Status**: ACCEPTED
**Kontekst**: Pytanie Q8 z analizy prawnej brzmiało: czy pokazywanie w panelu wiersza
„VAT należny 8%" bez słowa o prowizjach nie tworzy wrażenia, że obraz VAT-u jest kompletny.

Sedno sprawy: Booking i Airbnb to spółki z siedzibą w innych państwach UE. Prowizja jest
usługą nabytą od podatnika unijnego, a to u polskiego gospodarza stanowi **import usług** —
podatek rozlicza nabywca, odwrotnym obciążeniem, **także wtedy, gdy korzysta ze zwolnienia
podmiotowego**. Pociąga to za sobą rejestrację VAT-UE i comiesięczne deklaracje. Nasz panel
liczy VAT wyłącznie od noclegów i o prowizjach milczy.

**Decyzja**: **nie liczymy tego, ale mówimy wprost, że tego nie liczymy.**

Zdanie „VAT od prowizji portali (import usług) jest poza zakresem aplikacji" trafia
do nagłówka eksportu CSV — czyli tam, gdzie plik ogląda księgowa, która potrafi z tego
zdania zrobić użytek. To była najtańsza część odpowiedzi na Q8 i nie wymagała doradcy:
powiedzenie, czego narzędzie nie robi, jest stwierdzeniem faktu o narzędziu, a nie
kwalifikacją sytuacji podatkowej użytkownika.

**Czego świadomie NIE robimy**: nie liczymy kwoty tego VAT-u i nie mówimy gospodarzowi,
że ma obowiązek rejestracji VAT-UE. Pierwsze jest funkcją do zbudowania, drugie byłoby
kwalifikacją jego sytuacji prawnej — czyli tym, przed czym ostrzega §2 analizy.

**Kiedy wrócić**: gdy tester zapyta albo gdy pojawi się gospodarz, u którego prowizje
są na tyle duże, że kwota ma znaczenie. Wtedy potrzebna jest interpretacja indywidualna
KIS (ORD-IN, 40 zł), bo pytanie dotyczy praktyki, nie brzmienia przepisu.

## ADR-024: Nie budujemy własnej wysyłki poczty przed launchem

**Data**: 2026-08-25
**Status**: ACCEPTED
**Kontekst**: Google zablokował temu projektowi edycję szablonów e-mail Auth
(`EMAIL_TEMPLATE_UPDATE_NOT_ALLOWED`, [[Activity-Log]] 2026-08-18), przez co link
weryfikacyjny prowadził na `moje-domki-6c77d.firebaseapp.com` — domenę, która nie ma nic
wspólnego z produktem, do którego klient przed chwilą się zapisał. Nasza markowa strona
`/auth/action` działała od 1 lipca i nigdy się nie pokazywała.

Wsparcie Firebase odpowiedziało 2026-08-25 dwiema ścieżkami: (1) Admin SDK generuje link
akcji, my wysyłamy własny mail własnym SMTP-em — pełna kontrola nad treścią; (2) **support
ustawia nam Action URL ręcznie**, blokada szablonów zostaje.

**Decyzja**: **bierzemy ręczne ustawienie Action URL. Własna wysyłka poczty (X19) zostaje
po launchu.** Odpowiedź do Google wysłana przez właściciela 2026-08-25.

Powód jest kosztowy, nie techniczny. Admin SDK to nie „to samo, tylko ładniej" — to **nowy
podprocesor danych osobowych**, a za nim aktualizacja Polityki prywatności, DPA, konfiguracja
SPF/DKIM/DMARC i własne ryzyko dostarczalności: świeży nadawca domenowy trafia do spamu
łatwiej niż Google. Wzięcie tego na siebie na tydzień przed startem zamieniłoby problem
„link wygląda podejrzanie" na problem „mail w ogóle nie dochodzi" — drugi jest gorszy,
bo cichy. Ręczny Action URL rozwiązuje sedno za zero linijek kodu i zero pracy `legal`.

**Czego świadomie NIE załatwiamy**: treść maila i nadawca `noreply@moje-domki-6c77d.firebaseapp.com`
zostają z szablonu Google. Zmienia się wyłącznie to, dokąd prowadzi link. Literówkę marki
w podpisie obeszliśmy inaczej — `%APP_NAME%` bierze się z *Nazwy publicznej* projektu,
pola spoza zablokowanego edytora (poprawione przez właściciela 2026-08-25).

⚠️ **Warunek na przyszłość**: Action URL jest ustawieniem **na cały projekt**, wspólnym dla
wszystkich szablonów. `AuthActionHandler` nie obsługuje dziś trybu `recoverEmail`
(odpowiada „funkcja niedostępna") ani `verifyAndChangeEmail`. Dziś nikt tam nie trafi, bo
aplikacja nie ma ekranu zmiany adresu e-mail — ale **ta funkcja nie może powstać wcześniej
niż obsługa obu trybów**, inaczej zmiana adresu poprowadzi klienta w ślepy zaułek.

**Kiedy wrócić**: przy X19 — po launchu, gdy dojdą powiadomienia e-mail i automatyczne
wiadomości do gości. Wtedy własna wysyłka nadpisze Action URL i te ścieżki się zejdą.
Kolejność wejścia bez zmian: najpierw `legal` (podprocesor, DPA), potem SPF/DKIM/DMARC,
dopiero potem kod.

## ADR-025: Pytania prawne bramki publikacji domykamy własną analizą

**Data**: 2026-08-26
**Status**: ACCEPTED
**Kontekst**: Prawnik ocenił dokumenty 2026-08-25 „bez zastrzeżeń", ale 9 pytań oznaczonych
„do potwierdzenia przez prawnika" (grupa D bramki publikacji) zostawił bez odpowiedzi.
Właściciel ocenił, że kolejna runda u prawnika nie wnosi wartości („wziął kasę i powiedział,
że dokumenty są super") i polecił: przeprowadzić analizę ustaw samodzielnie, przedstawić
odpowiedzi do akceptacji i nanieść.

**Decyzja**: pytania D-1…D-9 oraz ustalenia E-1…E-6 rozstrzyga analiza własna
(`docs/legal/Analiza-prawna-2026-08-26.md`) z podaniem źródła i daty odczytu przy każdym
ustaleniu oraz jawnym poziomem pewności ([PEWNE]/[MOCNE]/[OCENA]). Ryzyko rezydualne pozycji
[OCENA] przyjmuje właściciel świadomie. Analiza nie jest poradą prawną; brzmienia w dokumentach
noszą odnośnik do analizy zamiast do opinii prawnika.

**Konsekwencje**: bramka publikacji spadła z 21 do 3 luk (zostały wyłącznie pozycje księgowego
i data naboru founding members). Jedyny warunek blokujący z analizy: plan Anthropic — oferta
konsumencka nie ma DPA, więc wpisy o Anthropic w Polityce §5 i DPA §7 są oznaczone jako
warunkowe do czasu potwierdzenia planu przez właściciela. Rewizja dokumentów przez prawnika
przy przeskalowaniu biznesu (zalecenie z 2026-08-25, Backlog) obejmie także tę analizę.

---

## ADR-026: Próg zwolnienia podmiotowego VAT — licznik z aplikacji, granice zapisane

**Data**: 2026-08-28
**Status**: ACCEPTED (decyzja właściciela)
**Kontekst**: Prześwietlenie panelu podatkowego z 2026-08-28 wskazało jako lukę nr 1 brak
pilnowania limitu zwolnienia podmiotowego z VAT (art. 113 ustawy o VAT). Analiza legal
z tego samego dnia ([[legal/Formy-opodatkowania-wynajmu-2026-08-28]], część II, P1–P8)
dostarczyła parametry — w tym korektę na wejściu: **limit od 1.01.2026 wynosi 240 000 zł**
(podwyższony z 200 000 zł ustawą z 24.06.2025, Dz.U. 2025 poz. 896), nie 200 000 zł
z pierwotnego sformułowania zadania.

**Decyzja — co liczymy**:
- **Licznik = pole `brutto`** z `podsumowaniePodatkowe()`: pełna wartość sprzedaży
  z rezerwacji w aplikacji (`type: 'booking'`, bez `vanished`), **bez** pomniejszania
  o prowizje (to zakup, limit liczy sprzedaż), **bez** podziału małżeńskiego
  (`spouseRental` to mechanika PIT — na VAT się nie przenosi, P6) i **bez** odejmowania
  VAT (u zwolnionego w cenie go nie ma). Świadomie NIE pole `przychod` — ono jest po
  podziale małżeńskim i po VAT.
- **Stała `vatZwolnieniePodmiotowe: { limit: 240000, progOstrzezenia: 0.8 }`**
  w `STAWKI_PODATKOWE`, objęta rytmem rejestru stawek „do 31 stycznia"
  ([[legal/Rejestr-stawek-podatkowych]], wpis 2026-08-28).
- **Trzy stany karty**: spokojny / ostrzegawczy od 80% limitu (spójnie z ostrzeganiem
  przy progu ryczałtu) / przekroczony. Teksty z P5 analizy — mówią, co stanowi przepis
  i co widzą dane aplikacji; mechanika przekroczenia opisana po VAT-owsku (opodatkowana
  cała czynność, którą przekroczono limit — art. 113 ust. 5), **nie** wzorem ryczałtu
  („od nadwyżki inna stawka" byłoby tu nieprawdą).
- **Karta i linia eksportu tylko dla `isVatPayer === false`** (także przy ustawieniach
  domyślnych) — czynnemu podatnikowi zwolnienie podmiotowe jest obojętne, pasek byłby
  szumem. Logika w `taxSummary.js` (pola `vatLimit`, `vatDoLimitu`, `vatProcentLimitu`,
  `vatLimitPrzekroczony`, `vatStan`, `vatPlatnik`); widok i eksport niczego nie liczą.
- **Dwa zdania obowiązkowe w karcie**: licznik obejmuje wyłącznie rezerwacje w aplikacji
  (pozostała sprzedaż gospodarza także zużywa limit — licznik jest dolnym oszacowaniem)
  oraz informacja o proporcjonalnym limicie pierwszego roku (art. 113 ust. 9).

**Czego świadomie NIE robimy** (granice zapisane, żeby nie były domyślne):
- **Proporcji pierwszego roku (art. 113 ust. 9) nie liczymy** — panel nie zna daty
  rozpoczęcia wykonywania czynności; pytanie o nią w ustawieniach odradzone przez legal
  (pole o niejasnej definicji, mała wartość). Zostaje zdanie informacyjne w karcie,
  bo bez niego pasek u gospodarza z pierwszego roku pokazuje więcej zapasu, niż istnieje.
- **Powrotu do zwolnienia (art. 113 ust. 11) nie modelujemy** — wymaga historii utraty,
  której panel nie ma; scenariusz jednostkowy.
- **Wyłączeń z art. 113 ust. 13 nie obsługujemy i o nie nie pytamy** — usług
  zakwaterowania katalog nie obejmuje, a ankieta o inne czynności gospodarza byłaby
  kwalifikowaniem jego sytuacji prawnej. Pokrywa to odesłanie do księgowego w karcie.
- **Nie kwalifikujemy obowiązku**: żadnego „musisz się zarejestrować", „straciłeś
  zwolnienie", „jesteś podatnikiem VAT" (granica z art. 2 ust. 1 pkt 1 ustawy
  o doradztwie podatkowym, §2 analizy prawnej panelu). Panel mówi, co pokazują jego
  dane, co stanowi przepis i do kogo iść.
- **Wariantu odrębnych limitów małżonków nie obsługujemy** — licznik z pełnego brutto
  to kierunek konserwatywny (ostrzeżenie najwcześniej, jak się da); rozstrzygnięcie,
  czy limity biegną osobno, należy do księgowego (P6).

**Przy okazji (ta sama analiza, poz. 3 tabeli)**: przy formie SKALA panel i eksport mówią
teraz wprost, czego nie liczą — zdrowotnej 9% (od dochodu z całej działalności, której
aplikacja nie zna) i kosztów spoza aplikacji (podstawa może być zawyżona). Wzorzec ADR-023;
automatu zdrowotnej dla skali świadomie nie budujemy.

**Kiedy wracamy**: proporcja pierwszego roku i pole daty rozpoczęcia — przy sygnale popytu
z bety (wzorzec ADR-022/023); ust. 11 — gdyby zgłosił się gospodarz wracający do zwolnienia;
kwota limitu — co roku w rytmie rejestru stawek. Treści karty przed launchem powinien
przejrzeć prawnik lub doradca podatkowy (zastrzeżenie z analizy legal).

**Weryfikacja**: złote testy z kwotami liczonymi ręcznie w `taxSummary.test.mjs`
(stany 50% / dokładnie 80% / przekroczenie, flaga czynnego podatnika, pełne brutto przy
`spouseRental: 'polowa'`) + testy eksportu + e2e w `tax-panel.spec.js`.

**Related ADRs**: ADR-018 (podstawa wynajmu), ADR-021 (współwłasność małżeńska),
ADR-023 (mówimy, czego nie liczymy).

---

## ADR-027: Podatek liniowy wraca — z poprawną mechaniką, nierejestrowana usunięta na stałe

**Data**: 2026-08-28
**Status**: ACCEPTED (decyzja właściciela) — następca ADR-020 w części dotyczącej liniowego
**Kontekst**: ADR-020 usunął liniowy z aplikacji, bo liczył się błędną gałęzią 8,5% od
przychodu zamiast 19% od dochodu — i słusznie: lepszy brak liczby niż liczba nieprawdziwa.
Analiza legal z 2026-08-28 ([[legal/Formy-opodatkowania-wynajmu-2026-08-28]], część I pkt 4)
wskazała liniowy jako właściwe pierwsze rozszerzenie, gdy przyjdzie sygnał — silnik skali
liczy już dochód, więc różnice są małe. Właściciel zdecydował: wdrażamy od razu, w jednym
wydaniu z progiem VAT (ADR-026), wg parametrów L1–L9 (część III analizy).

**Decyzja — co liczymy**:
- **19% od dochodu** (art. 30c ust. 1 PIT): `podstawa = max(0, przychod − prowizje −
  media − spoleczneRok − zdrowotnaOdliczana)`. Od `przychod` (netto u vatowca, art. 14
  ust. 1 PIT) — kontrast z licznikiem limitu VAT z ADR-026, który idzie z `brutto`.
- **Bez kwoty wolnej i progów** — `taxFreeAmount` nieczytane w liczeniu i ukryte w UI;
  karta progu ryczałtu nie renderuje się; **karta limitu VAT renderuje się nadal**
  (limit z art. 113 jest niezależny od formy dochodowej).
- **Odliczenie wpisanej zdrowotnej od dochodu do limitu** (art. 30c ust. 2 pkt 2):
  `min(zusHealth × miesiące, 14 100 zł)`; limit z obwieszczenia MF, **co roku inny** —
  nowa stała `liniowy.limitOdliczeniaZdrowotnej` w rytmie rejestru stawek. Ścieżki
  „odliczenie" i „koszt" mają wspólny limit i przy płaskiej stawce ten sam wynik —
  liczymy jedną, bez pytania. ⚠️ Inna mechanika niż ryczałtowe 50% od przychodu.
- **Składki społeczne odejmowane zawsze, raz** — przełącznik `includeZusInCosts` przy
  liniowym niczego nie zmienia (koszt albo odliczenie to ta sama kwota), więc w UI jest
  ukryty (zasada martwego inputu z X25), a formuła go nie czyta.
- **Liniowy = wyłącznie działalność gospodarcza** (art. 9a ust. 2 PIT): pytanie
  o `rentalBasis` i pole `spouseRental` ukryte; `domyslnyTryb()` → szczegółowy.
- **Gałąź per rezerwacja w `taxCalculator.js`** (przyrostowa, jak przy skali), żeby pola
  `tax` przy rezerwacjach się wypełniały i ostrzeżenie `rozjazd` działało jak przy
  pozostałych formach. `SettingsModal` po raz pierwszy OFERUJE tę formę — poprzednio
  gałąź była martwa, bo nie dało się jej wybrać.

**Czego świadomie NIE robimy** (granice z L3/L6/L7 analizy):
- **Automatu zdrowotnej 4,9% nie budujemy** — liczy się od dochodu z całej działalności
  gospodarza, a panel widzi tylko wynajem; automat z niepełnych danych wyglądałby
  wiarygodnie i byłby nieprawdziwy (dokładnie błąd, który ADR-020 usuwał). Pole ręczne;
  minimalnej 432,54 zł nie podpowiadamy — to byłoby zgadywanie cudzej sytuacji.
- **Daniny solidarnościowej nie liczymy** (art. 30h PIT, 4% od nadwyżki sumy dochodów
  ponad 1 000 000 zł) — dotyczy tak samo skali; suma dochodów z wielu źródeł jest poza
  wiedzą aplikacji, a komunikat przy dochodzie 80 000 zł byłby szumem. Bez wzmianki w UI.
- **Strat z lat ubiegłych nie przenosimy** (dochód ujemny → podatek 0, `max(0, …)`),
  **IKZE i ulgi B+R nie odliczamy** — dane spoza aplikacji i spoza bieżącego roku.
  Pokrywa to dopisek granic (L8) w karcie wyniku i eksporcie.
- **Nie kwalifikujemy obowiązku**: żadnego „Twoja składka wynosi…", „musisz płacić co
  najmniej 432,54 zł" (granica z §2 analizy prawnej panelu).
- **Działalność nierejestrowana zostaje usunięta NA STAŁE** — potwierdzenie ADR-020
  w tej części: limit kwartalny 10 813,50 zł czyni formę bezużyteczną dla ICP,
  a kwalifikacja jest sporna. Nieznana forma nadal nie dostaje liczby.

**Konsekwencja przybliżenia, zapisana świadomie**: mnożenie `zusHealth × miesiące`
zakłada składkę płaconą co miesiąc w tej samej kwocie — to przybliżenie tej samej natury
co `spoleczneRok`; odliczeniu podlegają składki zapłacone, stąd opis pola „którą
faktycznie płacisz". Per-rezerwacja liczy przyrostowo z numeru miesiąca rezerwacji, więc
suma zapisanych kwot może się minimalnie różnić od rocznej — od tego jest alert `rozjazd`.

**Kiedy wracamy**: limit odliczenia — co roku w rytmie rejestru (obwieszczenie MF
w grudniu); danina/straty/IKZE — przy sygnale popytu z bety (wzorzec ADR-022/023).
Treści dopisków przed launchem powinien przejrzeć prawnik lub doradca (zastrzeżenie legal).

**Weryfikacja**: złote testy z kwotami ręcznymi w `taxSummary.test.mjs` (19% płasko
i kwota wolna nieczytana; ucięcie odliczenia na 14 100 zł; społeczne raz; dochód ujemny
→ 0; vatowiec od netto z licznikiem VAT z brutto) + test eksportu + e2e panelu i ustawień.

**Related ADRs**: ADR-020 (poprzednik — usunięcie), ADR-023 (mówimy, czego nie liczymy),
ADR-026 (próg VAT — wspólne wydanie).
