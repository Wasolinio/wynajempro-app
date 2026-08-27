# Project: WynajemPRO E2E Testing & Audit

## Architecture
- **Frontend**: React Single Page App (SPA) built with Vite.
- **Backend-as-a-Service**: Firebase suite (Auth, Firestore, Storage, Cloud Functions).
- **Data Flow**:
  - Main state is loaded via real-time snapshots in `src/hooks/useFirebaseData.js` synced to Redux or local context, cached via React Query.
  - Public guest guides `/guide/:guideId` retrieve anonymous sessions, signing regulations to unlock guide secrets (WiFi/entry PINs).
- **Local testing environment**:
  - Playwright E2E tests running against a local Firebase Emulator suite.
  - Controlled via `VITE_USE_EMULATORS=true` environment flag.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Test Setup & Emulator Integration | Configure `firebase.json` emulators, update `src/firebase.js` to connect to emulators, install Playwright, setup playwright config, add scripts to `package.json`. | none | DONE |
| 2 | Typo & Content Audit Correction | Correct Polish spelling/grammar/typo mistakes in frontend pages. | none | PLANNED |
| 3 | Core Bug Fixes (iCal & Storage Leak) | Update property creation to generate `secretToken` & update `deleteUserAccount` Cloud Function to purge Firebase Storage objects. | M1 | PLANNED |
| 4 | E2E Test Suite Implementation | Write Playwright E2E tests (UI scaling, Auth registration/login/verification, link validation, Stripe payment flow, guest guides). | M1 | IN_PROGRESS |
| 5 | Verification & Adversarial Auditing | Run full E2E test suites, execute Challenger tests, execute Forensic Auditor checks, publish audit_report.md. | M1, M2, M3, M4 | PLANNED |

## Interface Contracts
### Client ↔ Cloud Functions (iCal Export)
- Route: `/exportIcal`
- Parameters: `u` (user UID), `p` (property ID or name), `token` (secretToken)
- Response: standard iCal `.ics` content on success, `403 Forbidden` on token mismatch.

### Cloud Functions ↔ Storage (Account Deletion)
- When `deleteUserAccount` runs, it must programmatically fetch all files matching `guides/{guideId}/**` in the default storage bucket and delete them.
