# 📖 Glossary

Terms, acronyms, and definitions used in WynajemPRO.

---

## Application Terms

### Property
A rental unit managed by an owner. The object is minimal: `{ id, name, color, secretToken }`. There is no address/capacity/codes on a property.

**Related**: item in the `users/{uid}/settings/properties.items[]` array (not a top-level collection)

### Guide (Guest Guide)
Public instructions for guests staying at a property. Includes WiFi password, entry codes, house rules.

**Related**: `guides/{guideId}` collection (public read), `/guide/:guideId` route

### Booking
A guest's reservation for specific dates. Stored as a calendar entry with `type: 'booking'` (date, property name, price). No card/payment data is stored on it.

**Related**: entry in the `users/{uid}/rentals` subcollection (shared with `type: 'utility'` and `'reminder'` entries)

### Owner
User who manages properties. Can create guides, set access codes, and holds the account subscription.

**Related**: `users/{uid}` document

### Guest
Someone renting a property. Receives guide link, must sign terms to see codes.

**Related**: Anonymous auth user accessing `/guide/:guideId`

### Access Code
Security credentials shared with guests (PIN, WiFi password, etc.). Held per guide, not per property, and revealed only after the guest signs.

**Related**: `guides/{guideId}/secrets/data` in Firestore

### Secret Token
Unique token that authenticates iCal export requests for a property.

**Related**: `secretToken` on each property in `users/{uid}/settings/properties.items[]`. Generated in `ManagerApp.jsx` via `crypto.randomUUID()`.

---

## Technical Terms

### Firestore
Google's real-time NoSQL database. Used for all data storage in WynajemPRO.

**Related**: `firestore.rules`, `src/firebase.js`

### Collection
A grouping of documents in Firestore (like a table in SQL).

**Examples**: `users`, `properties`, `guides`, `bookings`

### Document
A single record in a Firestore collection (like a row in SQL).

**Example**: `users/user123` is a document in the `users` collection

### Real-time Listener
A subscription to Firestore that updates automatically when data changes.

**Related**: `onSnapshot()` in `src/hooks/useFirebaseData.js`

### Cloud Function
A serverless function that runs on Firebase. Used for iCal export, account deletion, webhooks.

**Related**: `/functions` directory

### Authentication (Auth)
User login system. WynajemPRO uses Google OAuth2 + Firebase Auth.

**Related**: `src/firebase.js`, `GoogleAuthProvider`

### Security Rules
Rules that control who can read/write data in Firestore and Storage.

**Related**: `firestore.rules`, `storage.rules`

### App Check
Firebase security feature that prevents abuse from non-app clients.

**Status**: Re-enabled (commit 9f85a23)

### Webhook
An HTTP callback that gets triggered when an event occurs (e.g., Stripe payment).

**Example**: `/stripeWebhook` endpoint

---

## Architecture Terms

### SPA (Single Page Application)
Web app that loads once and updates dynamically without full page reloads.

**Related**: React routing, no server-side rendering

### Component
A reusable piece of UI code. React apps are built from components.

**Examples**: `GuestGuideView.jsx`, `PulpitView.jsx`

### Hook
A React feature for managing state and side effects.

**Examples**: `useState`, `useEffect`, `useFirebaseData` (custom)

### State
Data that can change and trigger UI updates when changed.

**Types**: Local state (component), Global state (React Context — `WynajemContext`), Server cache (TanStack React Query). No Redux.

### Props
Data passed from parent component to child component.

**Example**: `<PropertyCard property={data} />`

### Route
A URL path that maps to a component.

**Examples**: `/dashboard`, `/guide/:guideId`, `/login`

### Context
React feature for sharing state across components without prop drilling.

**Related**: `src/context/` directory

---

## Data Flow Terms

### Snapshot
A real-time capture of Firestore data at a moment in time.

**Related**: `onSnapshot()` listener

### Query
A request to fetch specific documents from Firestore.

**Example**: `where('ownerId', '==', uid)`

### Index
A database index that speeds up queries.

**Related**: Firestore requires indexes for compound queries

### Batch Write
Multiple write operations bundled into one atomic transaction.

**Related**: `batch()` method in Firebase SDK

---

## Testing Terms

### E2E (End-to-End) Test
Test that simulates real user behavior from start to finish.

**Tool**: Playwright

**Examples**: Full login → create property → publish guide flow

### Unit Test
Test of a single function or component in isolation.

**Tool**: Jest

### Integration Test
Test of multiple components working together.

**Related**: Tests that need Firebase Emulator

### Test Coverage
Percentage of code that is tested.

**Target**: > 80%

### CI/CD (Continuous Integration/Continuous Deployment)
Automated testing and deployment on every code push.

**Current**: TBD (GitHub Actions?)

---

## Performance Terms

### Bundle Size
Total size of JavaScript code sent to browser.

**Target**: < 300 KB

### First Contentful Paint (FCP)
Time until first content appears on screen.

**Target**: < 1.8 seconds

### Largest Contentful Paint (LCP)
Time until largest visible element loads.

**Target**: < 2.5 seconds

### Time to Interactive (TTI)
Time until page is fully interactive.

**Target**: < 3.8 seconds

### Lighthouse Score
Google's audit score (0-100). Measures performance, accessibility, etc.

**Target**: > 90

### Caching
Storing data locally to avoid re-fetching.

**Types**: Browser cache, React Query cache, Service Worker cache

---

## Security Terms

### OAuth2
Standard protocol for secure third-party login.

**Used For**: Google Sign-in

### Token
Credential that proves user identity.

**Types**: Auth token (login), API token (API access), Secret token (iCal)

### Encryption
Converting data to unreadable format for storage/transmission.

**Example**: User passwords, payment info

### Hashing
One-way conversion of data (can't be reversed).

**Example**: Password hashing

### HTTPS
Secure protocol for web communication.

**Status**: All endpoints use HTTPS

### CORS (Cross-Origin Resource Sharing)
Rules about which domains can access APIs.

**Related**: Firebase Hosting configuration

---

## Polish-Specific Terms

### Wynajęcie / Wynajem
Polish for "rental"

### Właściciel
Polish for "owner"

### Gość
Polish for "guest"

### Kod dostępu
Polish for "access code"

### Przewodnik
Polish for "guide"

---

## Acronyms

| Acronym | Meaning |
|---------|---------|
| API | Application Programming Interface |
| BaaS | Backend-as-a-Service |
| CI/CD | Continuous Integration/Continuous Deployment |
| CORS | Cross-Origin Resource Sharing |
| CSS | Cascading Style Sheets |
| E2E | End-to-End |
| FCP | First Contentful Paint |
| HMR | Hot Module Replacement |
| HTML | HyperText Markup Language |
| HTTP | HyperText Transfer Protocol |
| HTTPS | HTTP Secure |
| JSX | JavaScript XML |
| LCP | Largest Contentful Paint |
| MVP | Minimum Viable Product |
| NoSQL | Non-relational database |
| OAuth | Open Authentication |
| PII | Personally Identifiable Information |
| SPA | Single Page Application |
| SQL | Structured Query Language |
| TTI | Time to Interactive |
| UI | User Interface |
| UUID | Universally Unique Identifier |

---

**Last Updated**: 2026-06-29

**Related**: [[Architecture]], [[Features]], [[Tech-Stack]]

