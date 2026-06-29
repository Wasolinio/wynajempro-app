# 📅 Milestones & Roadmap

Project timeline and deliverables.

---

## Milestone 1: Test Setup & Emulator Integration

**Status**: ✅ COMPLETED  
**Completed**: 2026-06-15

**Tasks**:
- [x] Configure Firebase Emulator
- [x] Install Playwright
- [x] Setup test scripts in package.json
- [x] Create initial test structure

**Outcome**: Local testing environment fully functional

---

## Milestone 2: Content Audit & Polish Correction

**Status**: 📝 PLANNED  
**Target**: 2026-07-31

**Tasks**:
- [ ] Audit all UI text for typos/grammar
- [ ] Correct Polish language errors
- [ ] Update landing page copy
- [ ] Review guide templates
- [ ] Add missing translations

**Outcome**: Professional Polish copy throughout app

**Owner**: Szymon

---

## Milestone 3: Critical Bug Fixes

**Status**: 🔴 IN_PROGRESS  
**Target**: 2026-07-15

**Tasks**:
- [ ] Fix iCal token generation (HIGH PRIORITY)
  - File: `src/components/modals/AddEditEntryModal.jsx`
  - Generate `secretToken` on property create
  - Add test in E2E

- [ ] Fix storage leak on account deletion (HIGH PRIORITY)
  - File: Cloud Function `deleteUserAccount`
  - Delete guide files before Firestore docs
  - Add integration test

- [ ] Re-verify App Check configuration
  - File: `src/firebase.js`
  - Test with and without App Check

**Outcome**: Zero critical bugs, all tests passing

---

## Milestone 4: Comprehensive E2E Test Suite

**Status**: 🟡 IN_PROGRESS  
**Target**: 2026-08-15

**Tasks**:
- [ ] Auth tests (login, signup, logout)
- [ ] Property creation flow
- [ ] Guest guide publication
- [ ] iCal export (once fixed)
- [ ] Stripe payment processing
- [ ] UI scaling (responsive)
- [ ] Accessibility tests

**Target Coverage**: 80% of user journeys

**Files**:
- `e2e/auth.spec.js`
- `e2e/properties.spec.js` (create)
- `e2e/guides.spec.js`
- `e2e/ical_token.spec.js` (once fixed)
- `e2e/stripe-payment.spec.js`
- `e2e/ui-scaling.spec.js`

**Outcome**: 15+ E2E tests, all passing in CI

---

## Milestone 5: Performance Optimization

**Status**: 📋 PLANNED  
**Target**: 2026-09-01

**Tasks**:
- [ ] Analyze bundle size (target < 300 KB)
- [ ] Implement code splitting
- [ ] Add Firestore indexes
- [ ] Optimize images
- [ ] Setup monitoring

**Outcome**: Lighthouse score > 90, page load < 1s

---

## Milestone 6: Knowledge Base Completion

**Status**: 🟢 IN_PROGRESS (NOW!)  
**Target**: 2026-06-29

**Tasks**:
- [x] Architecture documentation
- [x] Feature specifications
- [x] Development guide
- [x] API reference
- [x] Known issues log
- [ ] Decision log (ADR)
- [ ] Agent process map
- [ ] Projects tracking
- [ ] Resource library
- [ ] Glossary

**Outcome**: Complete knowledge base in Obsidian + Memory system

---

## Milestone 7: Beta Launch Readiness

**Status**: 📋 PLANNED  
**Target**: 2026-10-01

**Tasks**:
- [ ] All milestones 1-5 complete
- [ ] Security audit passed
- [ ] Performance benchmarks met
- [ ] User documentation ready
- [ ] Support process defined

**Outcome**: Ready for beta user testing

---

## Timeline Gantt

```
2026-06:  ████ Test Setup      (Done)
2026-06:  ████ Knowledge Base  (Now)
2026-07:  ██░░ Content Audit   (Next)
2026-07:  ██░░ Bug Fixes       (Parallel)
2026-08:  ░░░░ E2E Tests       (Soon)
2026-09:  ░░░░ Performance     (Later)
2026-10:  ░░░░ Beta Ready      (Final)
```

---

## Next Immediate Actions

### Priority 1 (This Week)
1. Fix iCal token generation bug
2. Write E2E test for iCal export
3. Fix storage leak in Cloud Function

### Priority 2 (Next Week)
1. Complete E2E test suite
2. Polish language audit
3. Setup CI/CD pipeline

### Priority 3 (This Month)
1. Performance optimization
2. Security review
3. Beta launch prep

---

## Metrics to Track

| Metric | M1 | M2 | M3 | M4 | M5 | M6 | M7 |
|--------|----|----|----|----|----|----|-----|
| Bugs Found | 0 | 5 | 0 | 0 | 0 | 0 | 0 |
| E2E Tests | 0 | 5 | 8 | 15 | 15 | 15 | 15 |
| Docs Pages | 0 | 0 | 0 | 0 | 5 | 12 | 12 |
| Lighthouse | 75 | 75 | 75 | 80 | 92 | 92 | 92 |

---

## Related

- [[Projects/WynajemPRO]] - Main project overview
- [[Projects/Backlog]] - Feature backlog
- [[Known-Issues]] - Current bugs being tracked

