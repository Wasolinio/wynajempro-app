# 🐛 Known Issues

## Critical Issues

> **None outstanding.** The two "critical bugs" previously listed here were investigated on 2026-06-29 and found to be **false** — both behaviours are already implemented in the code. Kept below as RESOLVED/NOT-A-BUG so nobody re-opens them.

### 1. iCal Token Not Generated — ❌ NOT A BUG (verified 2026-06-29)
**Status**: ✅ RESOLVED (was never broken)  
**Claim**: `secretToken` not initialized on property create → iCal export 403.

**Reality**: `secretToken` **is** generated with `window.crypto.randomUUID()` in `src/ManagerApp.jsx` — on create (`ManagerApp.jsx:463-475`) and as a retrofit for legacy properties lacking one (`ManagerApp.jsx:403-412`). Properties live in `users/{uid}/settings/properties.items`, not a top-level `properties` collection. `functions/index.js` `exportIcal` validates the token (`:985`). Export works.

---

### 2. Storage Leak on Account Deletion — ❌ NOT A BUG (verified 2026-06-29)
**Status**: ✅ RESOLVED (was never broken)  
**Claim**: `deleteUserAccount` leaves guide files in Storage.

**Reality**: `functions/index.js` `exports.deleteUserAccount` (`:902`) deletes, per owned guide, the Storage files via `bucket.deleteFiles({ prefix: 'guides/${guideId}/' })` (`:933-937`), then the guide doc (`:944`), then the Auth user. No leak. (`exports.deleteExpiredAccountsData` handles scheduled cleanup of expired accounts.)

---

### 3. App Check Issue
**Severity**: 🟡 MEDIUM  
**Status**: ✅ FIXED (commit 9f85a23)  
**Issue**: App Check was disabled for debugging, now re-enabled.

**Status**: Monitoring for issues.

---

## Minor Issues

### 4. Firebase Auth iFrame Blocking
**Severity**: 🟡 MEDIUM  
**Status**: ✅ FIXED (commit 2bad1ff)  
**Issue**: X-Frame-Options header was blocking Firebase Auth iFrame.

**Fix Applied**: Removed restrictive header, now allows SAMEORIGIN.

---

### 5. Google Login Loop
**Severity**: 🟡 MEDIUM  
**Status**: ✅ FIXED (commit 99cc65b)  
**Issue**: Google login redirect loop on email verification.

**Fix Applied**: Improved redirect logic post-verification.

---

## Future Improvements (Not Bugs)

- [ ] Add dark mode
- [ ] Implement guide versioning
- [ ] Add email notifications
- [ ] Optimize Firestore queries
- [ ] Add analytics
- [ ] Improve mobile UX
- [ ] Add property photos/gallery

---

## Testing Status

| Issue | E2E Test | Manual Test | Fix Status |
|-------|----------|-------------|-----------|
| iCal Token | n/a | ✅ OK | NOT A BUG (generated in ManagerApp.jsx) |
| Storage Leak | n/a | ✅ OK | NOT A BUG (deleteUserAccount clears Storage) |
| App Check | ✅ PASS | ✅ OK | FIXED |
| Auth iFrame | ✅ PASS | ✅ OK | FIXED |
| Google Loop | ✅ PASS | ✅ OK | FIXED |

---

## How to Report Issues

1. Create failing E2E test in `e2e/` folder
2. Run test to confirm bug
3. Document in this file
4. Create branch: `fix/issue-name`
5. Fix + test + commit
6. Push PR

---

**Related**: [[Development]], [[Features]], [[Architecture]]
