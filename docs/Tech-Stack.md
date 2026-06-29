# 💻 Tech Stack

Complete technology overview for WynajemPRO.

## Frontend

### Core Framework
```
React 18+
- Component-based architecture
- Hooks for state management
- JSX syntax
```

### Build & Dev
```
Vite
- Fast bundler
- Hot Module Replacement (HMR)
- Optimized production builds
```

### Routing
```
React Router v6
- Client-side navigation
- Protected routes
- Route parameters (/guide/:guideId)
```

### State Management
```
Options:
- Redux (if configured)
- Context API (native React)
- React Query (data fetching)
- Zustand (lightweight)

Current: Check src/context/ and hooks/
```

### Styling
```
TailwindCSS (likely)
- Utility-first CSS
- Responsive design
- Dark mode support
- Custom components
```

### HTTP Client
```
Firebase SDK (built-in)
- Real-time listeners
- Automatic auth handling
- No need for axios/fetch wrapper
```

---

## Backend / Services

### Authentication
```
Firebase Authentication
- Google OAuth2 sign-in
- Email/password support (check implementation)
- Email verification
- Session management via JWT
- User metadata in Firestore
```

### Database
```
Cloud Firestore
- NoSQL real-time database
- Collections: users, properties, guides
- Real-time snapshots
- Offline persistence
- Security rules (firestore.rules)
```

### File Storage
```
Firebase Storage
- Store guide PDFs/images
- Property photos
- User avatars
- Storage rules (storage.rules)
- Public/private buckets
```

### Serverless Functions
```
Cloud Functions for Firebase
- Language: Node.js (18+)
- Trigger: HTTPS, Firestore events
- Key functions:
  * exportIcal - Calendar export
  * deleteUserAccount - Account cleanup
  * emailVerification - Send emails
  * stripeWebhook - Payment processing
```

### Hosting
```
Firebase Hosting
- Static site hosting
- CDN for assets
- Automatic HTTPS
- Staging versions
```

---

## Payments

### Stripe Integration
```
Stripe API
- Create charges/payments
- Handle webhooks
- Issue receipts
- Manage subscriptions (future)

Implementation:
- Frontend: Stripe.js SDK
- Backend: Cloud Function webhook handler
```

---

## Testing

### E2E Testing
```
Playwright
- Browser automation
- Tests in: e2e/*.spec.js
- Languages: JavaScript
- Runs against: http://localhost:5173
- Headless or headed mode
```

### Local Testing Environment
```
Firebase Emulator Suite
- Emulate: Auth, Firestore, Storage, Functions
- Config: firebase.json
- Start: firebase emulators:start
- UI available at: http://localhost:4000
```

### Unit Testing (optional)
```
Jest
- Test .js/.jsx files
- Mocking Firebase
- Coverage reports
- Config: jest.config.js (if exists)
```

---

## Development Tools

### Version Control
```
Git
- Repository: GitHub
- Remote: https://github.com/Wasolinio/wynajempro-app
- Branch strategy: feature branches, PR-based
```

### Environment Management
```
.env.local
- VITE_USE_EMULATORS=true (local dev)
- VITE_FIREBASE_CONFIG={...}
- VITE_STRIPE_PUBLIC_KEY={...}
```

### Package Management
```
npm or yarn
- package.json for dependencies
- package-lock.json for reproducible builds
```

### IDE/Editor
```
Recommended:
- VS Code (most popular)
- Extensions:
  * Prettier (code formatting)
  * ESLint (linting)
  * Firebase extension
  * Tailwind CSS IntelliSense
```

---

## Dependencies Summary

| Package | Purpose | Version |
|---------|---------|---------|
| react | UI framework | 18+ |
| react-router-dom | Routing | 6+ |
| vite | Bundler | Latest |
| firebase | Backend SDK | Latest |
| stripe | Payments | Latest |
| tailwindcss | Styling | Latest |
| playwright | E2E tests | Latest |

📝 See `package.json` for exact versions

---

## Architecture Decisions

### Why Firebase?
- ✅ Real-time database
- ✅ No backend server needed
- ✅ Built-in auth
- ✅ Easy scaling
- ✅ Free tier generous
- ❌ Vendor lock-in
- ❌ Limited querying

### Why Playwright?
- ✅ Fast and reliable
- ✅ Supports multiple browsers
- ✅ Good debugging
- ✅ Mobile testing support
- ❌ High resource usage

### Why React + Vite?
- ✅ Fast development
- ✅ Large ecosystem
- ✅ Easy to hire developers
- ✅ HMR for instant feedback
- ❌ JavaScript fatigue

---

## Performance Considerations

### Frontend
- Lazy load components (React.lazy)
- Code splitting per route
- Minification + compression
- CDN for static assets (via Firebase Hosting)

### Backend
- Firestore indexes for queries
- Pagination for large lists
- Caching with React Query
- Batch operations

### Database
- Collection groups indexing
- Field masking for security
- Optimize Firestore rules

---

## Security Stack

### Auth
- Google OAuth2 (industry standard)
- Firebase Session tokens (secure)
- App Check (prevent abuse)

### Data Protection
- Firestore security rules (database-level)
- Storage rules (file-level)
- HTTPS everywhere
- Secrets in .env (not in git)

### Compliance
- User data stored only in Firestore
- Storage cleanup on deletion (bug: not fully implemented)
- GDPR compliance (right to be forgotten)

---

## Monitoring & Analytics

### Current Setup
- Firebase Console (basic analytics)
- Error logging (check if set up)
- Performance monitoring (check if set up)

### Recommended
- Sentry (error tracking)
- Datadog (infrastructure)
- Google Analytics (user behavior)

---

## Deployment Pipeline

```
Local Development
    ↓
git push origin feature-branch
    ↓
GitHub PR (review)
    ↓
Merge to main
    ↓
firebase deploy (auto or manual)
    ↓
Production (Firebase Hosting + Functions)
```

---

**Related**: [[Architecture]], [[Development]], [[Performance]]
