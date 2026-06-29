# 🏗️ Architecture

**Agent Map**: ➡️ See [[Agent-Process-Map]] for step-by-step file & flow mapping.

## System Overview
| Layer | Tech Stack | Responsibility |
|-------|------------|----------------|
| **Frontend** | React + Vite | SPA, routing, UI rendering (`src/`) |
| **BaaS** | Firebase Suite | Auth, Firestore (Real-time), Storage (`firebase.json`) |
| **Backend** | Cloud Functions | iCal sync, Stripe webhooks, account cleanup (`functions/index.js`) |

## Data Flow & State
| Context | Mechanism | Implementation |
|---------|-----------|----------------|
| **Global State** | Firestore Snapshots | `src/hooks/useFirebaseData.js` handles real-time caching |
| **Auth** | Firebase Auth | Google OAuth + Email Verif -> updates local Context |
| **Public Flow** | Anonymous Read | `/guide/:guideId` fetches without Auth, requires terms signature |

## Component Hierarchy Map
- **App.jsx** (Router)
  - **LandingPage** (Public Marketing)
  - **Auth Pages** (Login, Signup, ResetPassword)
  - **ManagerApp.jsx** (Protected Dashboard -> `PropertyList`, `GuestGuideEditor`, `Settings`)
  - **GuestGuideView** (Public -> `SignatureForm`, `CodesReveal`)

## Security Model
| Component | Rules/Implementation |
|-----------|----------------------|
| **Firestore** | `firestore.rules`: Auth reads own data, Public guides readable anonymously |
| **Storage** | `storage.rules`: Images accessible public/auth based on path |
| **Functions** | Require Auth token / AppCheck enforcement |

---
**Related**: [[Schema]], [[Agent-Process-Map]]
