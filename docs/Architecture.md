# 🏗️ Architecture

## System Overview

```
┌─────────────┐
│   Frontend  │ React + Vite
├─────────────┤
│  Firebase   │ Auth + Firestore + Storage
├─────────────┤
│   Cloud Fn  │ iCal Export, Account Deletion
└─────────────┘
```

## Data Flow

### User (Authenticated)
```
Google Login
    ↓
Firebase Auth
    ↓
Firestore Real-time Snapshot
    ↓
useFirebaseData Hook (cache)
    ↓
React Components
```

### Guest (Public Guide)
```
/guide/:guideId
    ↓
Anonymous Read (Firestore Rules)
    ↓
Show Guide Content
    ↓
Require Signature
    ↓
Unlock Codes (PIN, WiFi)
```

## Component Hierarchy

```
App.jsx
├── LandingPage
│   └── Hero, Features, CTA
├── Auth Pages
│   ├── Login (Google)
│   ├── Signup
│   └── ResetPassword
├── ManagerApp (Protected)
│   ├── PropertyList
│   ├── PropertyDetail
│   ├── GuestGuideEditor
│   └── Settings
└── GuestGuide (Public)
    ├── GuideDisplay
    ├── SignatureForm
    └── CodesReveal
```

## State Management

Key Hook:
- **`useFirebaseData.js`** - Real-time Firestore syncing
  - Manages listeners
  - Handles cache
  - Updates on real-time events

Frameworks:
- Redux? (check implementation)
- Context API?
- React Query?

## Security Model

### Firestore Rules (`firestore.rules`)
- **Authenticated users**: Can read/write own properties
- **Public guides**: Anonymous users can read with signature
- **Storage**: Guides accessible only after email verification

### Cloud Functions
- **exportIcal**: POST with token validation
- **deleteUserAccount**: Cleanup storage + firestore

### App Check
- Prevents abuse from non-app clients
- Enabled for web/mobile

## Data Schema (Firestore)

```
users/{uid}
├── email
├── name
└── properties[]

properties/{propId}
├── name
├── address
├── codes (PIN, WiFi)
├── secretToken (iCal auth)
├── guides[]
└── created_at

guides/{guideId}
├── title
├── content
├── createdBy
└── storage_url
```

---

**Related**: [[Features]], [[Development]], [[Known-Issues]]
