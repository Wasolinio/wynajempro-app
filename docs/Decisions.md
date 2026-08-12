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

## Decision Template

```markdown
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
