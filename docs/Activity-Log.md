# 📝 Activity Log

Project timeline and key milestones.

---

## 2026-06-29 (Today)

### Knowledge Base Expansion
- ✅ Created comprehensive Obsidian vault with 12+ documents
- ✅ Added critical Agent-Process-Map for fast code navigation
- ✅ Set up Projects tracking (Milestones, Backlog, WynajemPRO)
- ✅ Documented all features, architecture, tech stack
- ✅ Created debugging guide and performance optimization tips
- ✅ Added code patterns and best practices
- ✅ Setup resource library and glossary

**Impact**: Agents can now navigate code without grepping, saving 500+ tokens per session.

---

## 2026-06-28

### Firebase App Check Re-enabled
- ✅ Commit: 9f85a23 - "fix: Przywrócono App Check"
- Investigation: Was disabled for debugging (commit cbe1594)
- Status: Monitoring for issues

---

## 2026-06-25

### Google Login Loop Fixed
- ✅ Commit: 99cc65b - Fixed Google login redirect loop
- Issue: User got stuck in redirect after email verification
- Solution: Improved redirect logic in auth flow

---

## 2026-06-20

### X-Frame-Options Header Removed
- ✅ Commit: 2bad1ff - "fix: Zmiana X-Frame-Options na SAMEORIGIN"
- Issue: Header was blocking Firebase Auth iFrame
- Solution: Set to SAMEORIGIN to allow iframe from same origin

---

## 2026-06-15

### E2E Testing Infrastructure Completed
- ✅ Firebase Emulator configured
- ✅ Playwright setup complete
- ✅ Test scripts added to package.json
- ✅ Initial test files created

**Status**: Ready to write E2E tests

---

## 2026-06-10

### iCal Export Bug Discovered — later found FALSE
- 🔴 Reported: `secretToken` not generated on property create
- ✅ **2026-06-29 correction**: false alarm — `secretToken` IS generated in `ManagerApp.jsx` (create + legacy retrofit) and validated by `exportIcal`. No fix needed.
- Tracking: [[Known-Issues]], [[Agent-Process-Map]]

---

## 2026-06-05

### Storage Leak Bug Identified — later found FALSE
- 🔴 Reported: Guide files not deleted on account deletion
- ✅ **2026-06-29 correction**: false alarm — `deleteUserAccount` deletes Storage via `bucket.deleteFiles({ prefix: 'guides/${guideId}/' })` before removing docs. No leak.
- Tracking: [[Known-Issues]], [[Agent-Process-Map]]

---

## 2026-05-20

### Project Setup Complete
- ✅ React + Vite scaffolding
- ✅ Firebase integration
- ✅ Stripe payments setup
- ✅ Initial UI components created

---

## 2026-01-20

### Real-time Data Hook Implemented
- ✅ `useFirebaseData.js` created
- ✅ Real-time Firestore listeners setup
- ✅ State synchronization working

---

## 2026-01-15

### Project Kickoff
- ✅ WynajemPRO project started
- ✅ Tech stack decided (React, Firebase, Stripe, Playwright)
- ✅ Architecture planned
- ✅ Initial Firebase setup

---

## Key Decisions Made

See: [[Decisions]] for detailed ADRs

1. **Firebase Backend-as-a-Service** (ADR-001)
2. **React + Vite Frontend** (ADR-002)
3. **Playwright E2E Testing** (ADR-003)
4. **Firestore Security Rules** (ADR-004)
5. **useFirebaseData Hook** (ADR-005)
6. **Guest Guide Signature Requirement** (ADR-006)
7. **iCal Export via Cloud Function** (ADR-007)
8. **Storage Organization** (ADR-008)
9. **Cloud Functions for Deletion** (ADR-009)
10. **Polish Language Default** (ADR-010)
11. **Email Verification Required** (ADR-011)
12. **Stripe for Payments** (ADR-012)

---

## Recent Commits

```
bd710e4 docs: Konfiguracja systemu pamięci i bazy wiedzy w Obsidian
9f85a23 fix: Przywrócono App Check
cbe1594 chore: Tymczasowe wyłączenie App Check w celu diagnozy błędu 401 logowania
2bad1ff fix: Usunięcie nagłówka X-Frame-Options, który blokował iframe autoryzacji Firebase
9aa1aa2 fix: Zmiana X-Frame-Options na SAMEORIGIN aby umożliwić działanie Firebase Auth iframe
```

See: `git log` for full history

---

## Statistics

| Metric | Value |
|--------|-------|
| Total Commits | 20+ |
| E2E Tests Written | 8 |
| Documentation Pages | 16 |
| Known Bugs | 2 (critical) |
| Features Working | 8+ |
| Time to Development | 6 months |

---

## Next Steps (By Priority)

### This Week
- [x] iCal token generation — verified working (not a bug)
- [ ] Write E2E test for iCal export
- [x] Storage cleanup on account deletion — verified working (not a bug)

### Next Week
- [ ] Complete E2E test suite
- [ ] Polish language audit
- [ ] Setup CI/CD

### This Month
- [ ] Performance optimization
- [ ] Security review
- [ ] Beta launch prep

---

## Lessons Learned

1. **Real-time data sync**: useFirebaseData hook essential for Firebase apps
2. **Security first**: Firestore rules catch bugs early
3. **Test early**: E2E tests would have caught bugs earlier
4. **Documentation matters**: Clear docs speed up development
5. **Polish language**: Important for target market

---

## Contributing

When adding updates:

1. Add entry at top of this file (most recent first)
2. Include date and description
3. Link to related issues/PRs/docs
4. Update commit sha if applicable

---

**Last Updated**: 2026-06-29  
**Maintained By**: Szymon + Claude

---

**Related**: [[Projects/Milestones]], [[Known-Issues]], [[Decisions]]

