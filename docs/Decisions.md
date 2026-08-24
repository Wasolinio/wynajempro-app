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
