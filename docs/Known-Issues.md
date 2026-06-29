# 🐛 Known Issues

## Critical Issues

### 1. iCal Token Not Generated
**Severity**: 🔴 HIGH  
**Status**: ⏳ PLANNED  
**Component**: Property Creation  
**Issue**: When new property is created, `secretToken` field is not initialized.

**Impact**:
- iCal export endpoint requires token
- Without token, export returns 403 Forbidden
- Guests cannot add calendar to their devices

**Fix Location**: `src/components/modals/AddEditEntryModal.jsx`

**Solution**:
```javascript
// On property create, generate token
const secretToken = generateRandomToken();
// Save with property data
properties[propId].secretToken = secretToken;
```

**Related**: [[Features]] → iCal Export

---

### 2. Storage Leak on Account Deletion
**Severity**: 🔴 HIGH  
**Status**: ⏳ PLANNED  
**Component**: Cloud Function `deleteUserAccount`  
**Issue**: When user deletes account, guide files in Storage are not deleted.

**Impact**:
- Orphaned files accumulate
- Increased storage costs
- Guides still accessible (security risk)

**Fix Location**: Cloud Function `functions/deleteUserAccount.js`

**Current Code** ❌:
```javascript
// Only deletes Firestore, not Storage
deleteDoc(userRef);
```

**Needed Fix** ✅:
```javascript
// 1. List all guides in guides/{guideId}/*
const guideBucket = admin.storage().bucket();
const files = await guideBucket.getFiles({ prefix: `guides/` });

// 2. Delete all guide files
await Promise.all(files[0].map(f => f.delete()));

// 3. Delete Firestore doc
await deleteDoc(userRef);
```

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
| iCal Token | ❌ MISSING | ⚠️ FAILING | NEEDS FIX |
| Storage Leak | ⚠️ PARTIAL | ⚠️ FAILING | NEEDS FIX |
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
