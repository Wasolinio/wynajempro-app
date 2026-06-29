# ⚡ Agent Process Map

**CRITICAL**: High-density reference for fast agent navigation. Lists every core process with exact file paths and data flow.

Use this BEFORE grepping or exploring code. Saves ~500 tokens per query.

---

## User Authentication Flow

**File Path**: `src/pages/LandingPage.jsx` + `src/firebase.js`

**Process**:
1. User clicks "Sign in with Google"
2. `src/firebase.js` → `signInWithPopup(auth, GoogleAuthProvider)`
3. Firebase Auth redirects to Google OAuth
4. On success → User object created in Firebase Auth
5. `src/App.jsx` checks `auth.currentUser` → routes to Dashboard
6. User doc auto-created in `users/{uid}` collection (via Firestore trigger or first-write)

**Key Files**:
- `src/firebase.js` - Firebase initialization
- `src/App.jsx` - Route protection based on currentUser
- `src/pages/LandingPage.jsx` - Sign-in buttons
- `src/context/` - User state management (Redux/Context)

**Data**: Firebase Auth ↔ Firestore users collection

---

## Property Creation

**File Path**: `src/components/modals/AddEditEntryModal.jsx`

**Process**:
1. Manager clicks "Add Property"
2. Modal opens with form fields
3. User enters: name, address, capacity, codes
4. Submit → calls Firebase function to create property
5. Property doc created in `properties/{propId}`
6. **⚠️ BUG**: `secretToken` NOT generated here (causes iCal export to fail)

**Key Files**:
- `src/components/modals/AddEditEntryModal.jsx` - Form component
- `src/hooks/useFirebaseData.js` - Firestore write operation
- `firebase.json` - Firestore collection schema reference

**Data Location**: `properties/{propId}` document

**Required Fix**: Generate `secretToken = generateRandomToken()` on create

---

## Real-time Property Sync

**File Path**: `src/hooks/useFirebaseData.js`

**Process**:
1. Component mounts and calls `useFirebaseData(userId)`
2. Hook sets up Firestore real-time listener on `properties` where `ownerId == userId`
3. `onSnapshot(query(...), snapshot => ...)` fires on data changes
4. Returns current state + setter
5. Component re-renders when data changes

**Key Files**:
- `src/hooks/useFirebaseData.js` - THE KEY FILE for data syncing
- `src/ManagerApp.jsx` - Main component using this hook
- `firestore.rules` - Security rules preventing unauthorized reads

**Performance Note**: Clean up listeners on unmount! Check for `unsubscribe()` in useEffect cleanup.

---

## Guest Guide Publishing

**File Path**: `src/components/modals/AddEditEntryModal.jsx` (or dedicated guide editor)

**Process**:
1. Manager creates guide content
2. Publishes to `guides/{guideId}`
3. Guide includes: title, sections, property reference
4. Public URL generated: `/guide/{guideId}`
5. Manager shares link with guests

**Key Files**:
- `src/components/` - Guide editor component
- `src/pages/GuestGuide.jsx` or similar - Public guide view
- `firestore.rules` - Allows anonymous read with signature

**Data**: `guides/{guideId}` collection

---

## Guest Guide Access (Public)

**File Path**: `src/pages/GuestGuide.jsx` (or similar)

**Process**:
1. Guest opens `/guide/{guideId}` from link
2. App fetches guide doc from Firestore (no auth required)
3. Displays: property info, guide content (codes hidden)
4. Guest clicks "Show Codes" → Signature form appears
5. Guest reads terms, signs (stores signature in Firestore)
6. `signedUsers` array updated: `{ email, signedAt, ipAddress }`
7. Codes revealed: PIN, WiFi, etc.

**Key Files**:
- `src/pages/GuestGuide.jsx` - Public guide view
- `src/components/` - Signature form
- `firestore.rules` - Allows anonymous read + write to signedUsers

**Security**: 
- Guide readable by anyone
- Codes only shown after signature
- Signature proof stored

---

## iCal Export

**File Path**: Cloud Function (likely `functions/exportIcal.js`)

**Process**:
1. User clicks "Export to Calendar"
2. Frontend generates URL: `/exportIcal?u={uid}&p={propId}&token={secretToken}`
3. POST request to Cloud Function
4. Function validates token against `properties/{propId}.secretToken`
5. Fetches property availability + bookings
6. Generates iCal format (.ics file)
7. Returns file for download

**Key Files**:
- Cloud Function file (location TBD in `functions/`)
- `src/components/` - Export button component
- `firestore.rules` - No direct access; function handles auth

**Data**: Reads `properties/{propId}` + `bookings/{bookingId}`

**⚠️ CRITICAL BUG**: `secretToken` not generated in AddEditEntryModal.jsx
- **Where to fix**: Generate token on property create
- **Fix**: `const secretToken = generateRandomToken();`
- **Impact**: High (iCal export completely broken without token)

---

## Account Deletion

**File Path**: Cloud Function (likely `functions/deleteUserAccount.js`)

**Process**:
1. User requests account deletion
2. Calls Cloud Function `deleteUserAccount(uid)`
3. Function:
   - Deletes `users/{uid}` doc
   - Deletes all `properties` where `ownerId == uid`
   - Deletes all `guides` where `ownerId == uid`
   - Deletes all `bookings` where `ownerId == uid`
   - ❌ **BUG**: Does NOT delete `guides/{guideId}/**` files in Storage
   - Deletes Firebase Auth user

**Key Files**:
- Cloud Function file (location TBD)
- `src/components/` - Delete account button
- `storage.rules` - Security rules for guides

**⚠️ CRITICAL BUG**: Storage leak
- Orphaned guide files not deleted
- **Where to fix**: Cloud Function needs to:
  1. List files in `guides/` prefix
  2. Delete all matched files
  3. Then delete Firestore docs
- **Impact**: High (storage costs + privacy risk)

---

## Stripe Payment Flow

**File Path**: `src/components/` (payment form) + Cloud Function webhook

**Process**:
1. Guest enters booking dates + payment info
2. Component calls Stripe API → creates payment intent
3. User sees Stripe checkout modal
4. User confirms payment
5. Stripe charges card
6. Webhook fires: `/stripeWebhook`
7. Cloud Function updates `bookings/{bookingId}.paymentStatus = 'completed'`
8. Guest sees confirmation

**Key Files**:
- `src/components/` - Payment form
- Cloud Function `stripeWebhook` - Webhook handler
- `bookings/{bookingId}` - Payment status stored here

**Webhook Events Handled**:
- `charge.succeeded` - Mark as paid
- `charge.failed` - Notify guest
- `charge.refunded` - Update status

---

## Admin Operations (if any)

**Location**: Check `src/context/` for role-based access

**If exists, typical flow**:
1. Check user role in `users/{uid}.role`
2. Cloud Functions check auth token claims
3. Only admins can perform destructive operations

---

## Key Firestore Rules Pattern

See `firestore.rules`:

```
match /properties/{propId} {
  allow read, write: if request.auth.uid == resource.data.ownerId;
}

match /guides/{guideId} {
  allow read: if true; // Public
  allow write: if request.auth.uid == resource.data.ownerId;
}
```

**Pattern**: Users can only access own data. Exceptions for public guides.

---

## File Organization Quick Reference

```
src/
├── App.jsx ..................... Root router
├── ManagerApp.jsx .............. Manager dashboard (protected)
├── firebase.js ................. Firebase init + config
├── hooks/
│   └── useFirebaseData.js ....... ⭐ CRITICAL: Real-time data syncing
├── pages/
│   ├── LandingPage.jsx ......... Public landing + auth
│   ├── GuestGuide.jsx .......... Public guide view (⭐ fix this)
│   └── ResetPassword.jsx ....... Password reset
├── components/
│   ├── modals/
│   │   └── AddEditEntryModal.jsx ... ⚠️ MUST FIX: Generate secretToken
│   └── ... other UI components
└── context/ .................... State management (Redux/Context)

firebase.json ................... Firestore/Storage schemas + emulator config
firestore.rules ................. Security rules
storage.rules ................... Storage security rules
```

---

## 🔴 Critical Bugs to Fix

1. **iCal Token Not Generated** → `AddEditEntryModal.jsx`
   - Add: `secretToken = generateRandomToken()`
   - On: Property create
   - Impact: iCal export 403 Forbidden

2. **Storage Leak on Deletion** → Cloud Function `deleteUserAccount`
   - Add: List + delete `guides/` files before doc deletion
   - Impact: Orphaned files cost money + security risk

---

## Process Lookup Quick Index

- **Auth** → `src/firebase.js` + `src/pages/LandingPage.jsx`
- **Real-time Data** → `src/hooks/useFirebaseData.js` ⭐
- **Properties** → `src/components/modals/AddEditEntryModal.jsx` + `properties/{propId}`
- **Guest Guide** → `src/pages/GuestGuide.jsx` + `guides/{guideId}`
- **iCal Export** → Cloud Function + `secretToken` bug ⚠️
- **Payments** → Stripe webhook + `bookings/{bookingId}`
- **Deletion** → Cloud Function + storage leak bug ⚠️
- **Security** → `firestore.rules` + `storage.rules`

---

**Last Updated**: 2026-06-29  
**Maintained By**: Agent-AI (Auto-update when architecture changes)

---

**Related**: [[Architecture]], [[Development]], [[Debugging]]
