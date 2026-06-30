# ⚡ Agent Process Map

**CRITICAL**: High-density reference for fast agent navigation. Lists every core process with exact file paths and data flow. Read this BEFORE grepping or exploring code.

**Verified against source on 2026-06-29.** Firebase project id: `moje-domki-6c77d`. Frontend: React + Vite + React Router + TanStack Query. Backend: Firebase Auth, Firestore, Storage, Cloud Functions v2 (`functions/index.js`), Stripe.

> ⚠️ **AKTUALIZACJA STRUKTURY (2026-06-30):** UI przebudowane do identyfikacji WynajemPRO v2, a kod
> uporządkowany. **Logika biznesowa i model danych poniżej są nadal aktualne** (przeniesione 1:1),
> ale ŚCIEŻKI PLIKÓW UI się zmieniły. Mapowanie stare → nowe:
> - `src/ManagerApp.jsx` → **`src/pages/dashboard/ManagerApp.jsx`** (powłoka panelu)
> - `src/pages/LoginPanel.jsx` → **`src/pages/landing/LoginPanel.jsx`** (auth) ; landing → `src/pages/landing/LandingPage.jsx`
> - `src/components/GuideBuilder.jsx` → **`src/pages/dashboard/GuideBuilder.jsx`** (limit uploadu teraz 10 MB)
> - modale/widoki panelu → **`src/pages/dashboard/modals/` i `…/views/`** (styl .wpd)
> - Stare wersje (oryginał, prototypy, wersja Gemini) → przeniesione do **`/_legacy`** (poza buildem).
>
> Niezmienione i nadal kluczowe: `src/context/WynajemContext.jsx`, `src/hooks/useFirebaseData.js`,
> `src/firebase.js`, `src/utils/*`, `functions/index.js`, `firestore.rules`, `storage.rules`.
> Pełna mapa żywej struktury: `src/README.md`.

---

## 🗄️ Data Model (read this first)

Almost everything is a **subcollection under `users/{uid}`** — there is no top-level `properties` or `bookings` collection.

```
users/{uid}                         ← profile: status, trialEndsAt, stripeCustomerId, stripeSubscriptionId
  ├── rentals/{entryId}             ← ALL calendar entries. field `type`: 'booking' | 'utility' | 'reminder'.
  │                                    booking entries carry: date, property (name), price, etc.
  ├── settings/{docId}              ← config docs, each shaped `{ items: [...] }` (or object):
  │     ├── properties  → { items: [{ id, name, secretToken, ... }] }   ← THE property list
  │     ├── reminders   → { items: [...] }
  │     ├── sources     → { items: [...] }
  │     ├── categories  → { items: [...] }
  │     ├── tax         → { ...taxSettings }
  │     ├── hostProfile → { ...host info shown on guest guides }
  │     └── syncLinks   → { links: [...] }   ← external iCal URLs to import
  └── checkout_sessions/{docId}     ← Stripe checkout session bookkeeping

guides/{guideId}                    ← TOP-LEVEL, public read. field `ownerId` = creator uid.
  ├── secrets/data                  ← hidden codes (PIN, WiFi); revealed only after guest signs
  └── signatures/{guestUid}         ← guest signature records
Storage: guides/{guideId}/**        ← guide media files

newsletter_subscribers/{id}        ← landing-page newsletter opt-ins (source field)
```

"Properties" = objects in the `users/{uid}/settings/properties` `items` array. "Rentals" = entries in the `users/{uid}/rentals` subcollection. They are different things.

---

## User Authentication Flow

**Files**: `src/pages/LoginPanel.jsx` (real auth UI) · `src/firebase.js` (init) · `src/App.jsx` (route guard). The landing pages only link to `/login`.

**Process**:
1. User signs up / logs in via `LoginPanel.jsx` — email+password or Google (`signInWithPopup`, redirect fallback).
2. On **register**: `createUserWithEmailAndPassword` → `updateProfile` → write `users/{uid}` doc (`status: 'trialing'`, `trialEndsAt` = +14 days) → `sendEmailVerification` → `signOut` → show verification screen.
3. `onUserDocumentCreated` Cloud Function (trigger on `users/{userId}`) backstops trial setup / custom claims.
4. On **login**: password users must have `emailVerified` (blocked + signed out otherwise). Google users skip that.
5. `src/App.jsx` `ProtectedRoute` uses `onAuthStateChanged`; unverified password users are rejected. Authed → `/dashboard/*` → `ManagerApp.jsx`.

**Data**: Firebase Auth ↔ `users/{uid}`. Trial/subscription state also lives in custom claims (`stripeStatus`) set by Stripe webhook.

**Note**: A new brand-identity login prototype exists at `src/pages/landing_v4/LoginPanelV4.jsx` (route `/prototyp4-login`) — same auth logic, restyled.

---

## Property Management (the property list)

**Files**: `src/components/modals/SettingsModal.jsx` (UI) · `src/ManagerApp.jsx` (persistence + token gen).

**Process**:
1. Manager edits properties in Settings.
2. `ManagerApp.jsx` saves the whole array to `users/{uid}/settings/properties` as `{ items: [...] }` (see `ManagerApp.jsx:432`).
3. Each property gets a `secretToken` generated via `window.crypto.randomUUID()` (`ManagerApp.jsx:463`); legacy items are retrofitted with one (`ManagerApp.jsx:403-412`). The token authorizes iCal export.

**Data**: `users/{uid}/settings/properties.items[]`.

> Earlier map claimed `secretToken` was never generated — **false**. It is generated in `ManagerApp.jsx`.

---

## Rental / Calendar Entry Creation

**Files**: `src/components/AddRentalModal.jsx` and `src/components/modals/AddEditEntryModal.jsx` (forms) · `src/ManagerApp.jsx` (write).

**Process**:
1. Manager adds an entry; tab picks `type`: Rezerwacja (`booking`) / Koszty (`utility`) / Zadanie (`reminder`).
2. `ManagerApp.jsx` writes to `users/{uid}/rentals/{entryId}` (`entryId` = existing id or `Date.now()`), via `setDoc`/`updateDoc` (`ManagerApp.jsx:372-375`); delete via `deleteDoc` (`:387`).

**Data**: `users/{uid}/rentals/{entryId}` — booking entries have `date`, `property`, financials.

---

## Real-time Data Sync ⭐

**File**: `src/hooks/useFirebaseData.js` (TanStack Query cache fed by Firestore `onSnapshot`).

**Process**:
1. `useFirebaseData(user, selectedYear)` sets up listeners:
   - `onSnapshot(doc(db,'users',uid))` → profile (`status`, `trialEndsAt`, `scheduledDeletionAt`); self-heals missing doc.
   - `onSnapshot(collection(db,'users',uid,'settings'))` → all settings docs.
   - `onSnapshot(query(collection(db,'users',uid,'rentals'), where('date','>=',yearStart), where('date','<=',yearEnd)))` → year-scoped entries.
2. Results pushed into React Query cache (`queryClient.setQueryData`). Returns `{ rentals, settings, profile, loading }`.
3. Listeners cleaned up on unmount (returned `unsub*` functions).

**Consumers**: `src/ManagerApp.jsx` (main), child views in `src/components/views/`.

---

## Guest Guide Publishing

**Files**: `src/components/GuideBuilder.jsx` (editor) · `src/ManagerApp.jsx` / Firestore writes.

**Process**:
1. Manager builds guide content; publishes to `guides/{guideId}` with `ownerId == uid`.
2. Hidden codes (PIN/WiFi) stored separately in `guides/{guideId}/secrets/data`. Media in Storage `guides/{guideId}/`.
3. Public URL: `/guide/{guideId}`.

**Rules**: base guide doc is publicly readable; secrets are not. Create/update require owner + active subscription + `ownerId` match.

---

## Guest Guide Access (Public)

**File**: `src/pages/GuestGuideView.jsx`.

**Process**:
1. Guest opens `/guide/{guideId}`; `getDoc(guides/{guideId})` (no auth needed).
2. Host info pulled from `users/{ownerId}/settings/hostProfile`.
3. Existing signature checked at `guides/{guideId}/signatures/{guestUid}` (anonymous auth uid; legacy localStorage session migration handled).
4. To reveal codes, guest signs → record written to `guides/{guideId}/signatures/{authUid}`.
5. Codes read from `guides/{guideId}/secrets/data` after signing.

**Security**: guide public; secrets gated behind signature; signature proof persisted.

---

## iCal Export (outbound — share your calendar)

**File**: `functions/index.js` → `exports.exportIcal` (onRequest, `:963`).

**Process**:
1. Frontend builds URL in `SettingsModal.jsx`: `https://us-central1-moje-domki-6c77d.cloudfunctions.net/exportIcal?u={uid}&p={propertyName}&token={secretToken}`.
2. Function loads `users/{uid}/settings/properties.items`, finds property by `id` or `name`, validates `secretToken` (403 on mismatch).
3. Queries `users/{uid}/rentals` where `type=='booking'` and `property==p`; emits a `.ics` (`BEGIN:VCALENDAR ...`).

**Status**: working (validates token). No known bug here.

---

## iCal Import / Sync (inbound — pull Booking/Airbnb)

**Files**: `functions/index.js` → `exports.syncICalCalendars` (onCall, manual, `:455`) and `exports.dailyICalSync` (onSchedule, `:617`).

**Process**: reads external iCal URLs from `users/{uid}/settings/syncLinks.links`, fetches via Node `fetch`, parses `VEVENT`s, writes/updates booking entries in `users/{uid}/rentals` to block dates and prevent overbooking.

---

## Subscription & Payments (Stripe — SaaS, not guest payments)

**Files**: `src/components/PaywallScreen.jsx` (+ Settings billing) · `functions/index.js`.

This is the **29,99 zł/mc account subscription**, not per-booking guest card payments (there is no guest checkout flow).

**Functions**:
- `createCheckoutSession` (onCall, `:69`) — creates Stripe Checkout for the plan (`price_1TZULu8D7fwsePNBa7aXaP92`); stores `stripeCustomerId` on `users/{uid}`.
- `stripeWebhook` (onRequest, `:151`) — verifies signature; on `checkout.session.completed` / invoice events / `customer.subscription.deleted` updates `users/{uid}` Stripe fields and sets Auth custom claim `stripeStatus` (`active`/`past_due`/`canceled`).
- `createBillingPortalSession` (onCall, `:344`) — Stripe Customer Portal link.

**Gate**: Firestore rules require `hasActiveSubscription(uid)` (claims/profile) to read/write `rentals` and `settings`.

---

## Account Deletion

**Files**: `functions/index.js` → `exports.deleteUserAccount` (onCall, `:902`) and `exports.deleteExpiredAccountsData` (onSchedule, `:403`).

**`deleteUserAccount` process**:
1. Delete `users/{uid}` doc (`:929`).
2. For each owned guide: delete Storage files `bucket.deleteFiles({ prefix: 'guides/${guideId}/' })` (`:933-937`), then delete the guide doc (`:944`).
3. Delete the Firebase Auth user.

**`deleteExpiredAccountsData`** purges data for accounts past `scheduledDeletionAt` (trial/cancellation grace period).

> Earlier map claimed guide Storage files leak on deletion — **false**. They are listed and deleted.

---

## Firestore Rules (actual model)

See `firestore.rules`. Helpers: `isOwnerAndVerified(userId)`, `hasActiveSubscription(userId)`, `isValidRental/Settings/Guide(...)`.

- `users/{userId}` — read/update by verified owner; `create` must set `status:'trialing'` and must NOT include Stripe fields (those are server-only via claims).
- `users/{userId}/rentals/{docId}` — owner + verified + **active subscription** + schema validation.
- `users/{userId}/settings/{docId}` — same; `hostProfile` has a public-read exception (for guest guides).
- `guides/{guideId}` — **public read**; create/update/delete require verified owner + active subscription + `ownerId` match. Secrets/signatures gated in subcollections.

`storage.rules` governs `guides/` media.

---

## File Organization Quick Reference

```
src/
├── App.jsx ......................... Router + ProtectedRoute (/dashboard → ManagerApp)
├── ManagerApp.jsx .................. ⭐ Main dashboard + central Firestore writes (rentals, settings, secretToken)
├── firebase.js ..................... Firebase init (auth, db, storage, analytics, App Check)
├── hooks/useFirebaseData.js ........ ⭐ Real-time sync (onSnapshot → TanStack Query)
├── context/WynajemContext.jsx ...... React Context (UI/app state) — NOT Redux
├── pages/
│   ├── LandingPage.jsx ............. Production landing (links to /login)
│   ├── LoginPanel.jsx .............. ⭐ Auth (email/Google/verify/trial)
│   ├── GuestGuideView.jsx .......... Public guide view + signature gate
│   ├── ResetPassword.jsx ........... Password reset
│   ├── AuthActionHandler.jsx ....... Firebase email-action handler
│   └── landing_v4/ ................. New brand-identity prototype (LandingPageV4, LoginPanelV4)
├── components/
│   ├── AddRentalModal.jsx .......... Add calendar entry (booking/utility/reminder)
│   ├── GuideBuilder.jsx ............ Guest-guide editor
│   ├── PaywallScreen.jsx ........... Subscription gate / Stripe checkout entry
│   ├── modals/
│   │   ├── AddEditEntryModal.jsx ... Add/edit entry (takes `properties` prop)
│   │   └── SettingsModal.jsx ....... Manage properties, tax, host profile, sync links, iCal export URL
│   └── views/ ...................... Desktop/Mobile bookings, reminders, utilities tables
└── utils/ .......................... taxCalculator, accountingExport, constants

functions/index.js ................. ALL Cloud Functions (Stripe, iCal export+import, account deletion, user trigger)
firestore.rules / storage.rules .... Security rules
firebase.json ...................... Emulator + hosting config
```

---

## ✅ Corrections vs prior map (2026-06-29 rewrite)

The previous version was largely speculative. Fixed:
- **No top-level `properties`/`bookings` collections** — data is subcollections under `users/{uid}` (`rentals`, `settings/*`). Properties live in `settings/properties.items`.
- **Auth UI is `LoginPanel.jsx`**, not `LandingPage.jsx`. State is React Context + TanStack Query, not Redux.
- **Guest guide file is `GuestGuideView.jsx`** (not `GuestGuide.jsx`); codes in `guides/{id}/secrets/data`, signatures in `guides/{id}/signatures/{uid}`.
- **Stripe = SaaS subscription** (createCheckoutSession / webhook / billing portal), not guest booking payments.
- **iCal**: both export (`exportIcal`) and import (`syncICalCalendars`, `dailyICalSync`) exist.
- **Both prior "critical bugs" were false**: `secretToken` IS generated (`ManagerApp.jsx`); `deleteUserAccount` DOES delete guide Storage files.

No verified critical bugs at this time. Log real ones in [[Known-Issues]].

---

## Process Lookup Quick Index

- **Auth** → `src/pages/LoginPanel.jsx` + `src/firebase.js` + `src/App.jsx`
- **Real-time data** → `src/hooks/useFirebaseData.js` ⭐
- **Writes (rentals/settings)** → `src/ManagerApp.jsx` ⭐
- **Property list** → `src/components/modals/SettingsModal.jsx` → `users/{uid}/settings/properties`
- **Calendar entries** → `AddRentalModal.jsx` / `AddEditEntryModal.jsx` → `users/{uid}/rentals`
- **Guest guide (build)** → `src/components/GuideBuilder.jsx` → `guides/{guideId}`
- **Guest guide (view)** → `src/pages/GuestGuideView.jsx`
- **iCal export** → `functions/index.js` `exportIcal`
- **iCal import** → `functions/index.js` `syncICalCalendars` / `dailyICalSync`
- **Payments/subscription** → `functions/index.js` `createCheckoutSession` / `stripeWebhook` / `createBillingPortalSession`
- **Account deletion** → `functions/index.js` `deleteUserAccount` / `deleteExpiredAccountsData`
- **Security** → `firestore.rules` + `storage.rules`

---

**Last Updated**: 2026-06-29 (full verification rewrite)
**Maintained By**: keep in sync with `functions/index.js`, `src/ManagerApp.jsx`, `src/hooks/useFirebaseData.js`, `firestore.rules` when they change.

**Related**: [[Architecture]], [[Schema]], [[Tech-Stack]], [[Debugging]], [[Known-Issues]]
