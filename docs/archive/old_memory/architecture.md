---
name: architecture
description: Architektura aplikacji, data flow, komponenty, struktura kodu
metadata:
  type: project
---

# Architektura WynajemPRO

## Data Flow

```
User (Frontend/React)
    ↓
Firebase Auth (Google Sign-in)
    ↓
Firestore (real-time snapshots via useFirebaseData)
    ↓
React State/Redux/Context
    ↓
Components (UI render)
```

## Ścieżki dostępu

### Dla właściciela (zalogowany)
1. Login via Google → Firebase Auth
2. Firestore snapshot loaded → useFirebaseData hook
3. Manager view → list/edit properties
4. Cloud Functions → iCal export, account deletion

### Dla gościa (public)
1. Public link `/guide/:guideId`
2. Anonymous session created
3. Firestore read rules check
4. Show guide → require signature
5. Unlock WiFi/PIN codes

## Security Model
- **Firestore Rules** - control who reads/writes
- **Cloud Functions** - server-side logic (export iCal, delete account)
- **App Check** - prevent abuse
- **Secret Tokens** - iCal export auth

## State Management
- Redux? Context API? (check useFirebaseData.js)
- Real-time listeners managed by hooks
- React Query for caching

## Component Structure
```
App.jsx (root)
├── LandingPage.jsx
├── ManagerApp.jsx (protected)
│   ├── PropertyList
│   ├── PropertyEdit
│   ├── GuestGuideEditor
│   └── ...
├── GuestGuide (public)
│   ├── GuideHeader
│   ├── SignatureForm
│   └── CodesDisplay
└── AuthPages
    ├── Login
    ├── Signup
    └── ResetPassword
```

## Key Hooks
- `useFirebaseData.js` - real-time Firestore syncing
- Custom auth hooks (if any)
- Custom payment hooks (Stripe)

## Cloud Functions
- `exportIcal` - POST `/exportIcal` → returns .ics file
- `deleteUserAccount` - cleanup guides + storage
- Account verification? (email verify)

## Why this approach
- Firebase → no backend maintenance, scales automatically
- Real-time updates → guests see PIN changes instantly
- Cloud Functions → secure server-side operations (token validation)
- Public guides → no authentication needed, signature-based access control
