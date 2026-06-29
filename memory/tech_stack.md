---
name: tech-stack
description: Technologie, wersje, key dependencies w WynajemPRO
metadata:
  type: reference
---

# Tech Stack - WynajemPRO

## Frontend
```
React 18+ (JSX)
Vite (bundler, HMR)
React Router (routing)
React Query (data fetching/caching)
TailwindCSS (styling) lub custom CSS
```

## Backend/Services
```
Firebase Authentication (Google login)
Firestore (real-time database)
Firebase Storage (guides, assets)
Cloud Functions (iCal export, user deletion)
Firebase Hosting (deployment)
```

## Testing
```
Playwright (E2E tests)
Firebase Emulator Suite (local testing)
jest (unit tests, jeśli są)
```

## Environment
```
VITE_USE_EMULATORS=true (local dev)
VITE_FIREBASE_CONFIG=... (Firebase config)
```

## Key Files Location
- `src/firebase.js` - Firebase initialization
- `src/hooks/useFirebaseData.js` - Real-time data syncing
- `firestore.rules` - Security rules
- `firebase.json` - Emulator config
- `.firebaserc` - Firebase project config
- `e2e/*.spec.js` - Playwright tests

## Known Issues to Fix
- **iCal Export** - secretToken not generated on property creation
- **Storage Leak** - deleteUserAccount doesn't purge guides/
- **App Check** - Recently re-enabled after debugging

## Performance Considerations
- Real-time listeners in useFirebaseData.js should be cleaned up
- Large guide data should be lazy-loaded
- Consider pagination for property lists
