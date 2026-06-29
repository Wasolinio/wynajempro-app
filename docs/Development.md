# 🛠️ Development

## Local Setup

### Prerequisites
```bash
node >= 18
npm or yarn
Firebase CLI
Java (for Firestore Emulator)
```

### Installation
```bash
# Clone repo
git clone ...
cd WynajemPRO\ App

# Install dependencies
npm install

# Set up Firebase
firebase login
firebase init emulators
```

### Environment Variables
```bash
# .env.local
VITE_USE_EMULATORS=true
VITE_FIREBASE_CONFIG=...
VITE_API_KEY=...
```

### Start Development

**Terminal 1 - Firebase Emulator**:
```bash
firebase emulators:start
```

**Terminal 2 - React Dev Server**:
```bash
npm run dev
```

App runs on `http://localhost:5173`
Firestore Emulator on `http://localhost:4000`

---

## Testing

### Run E2E Tests
```bash
npm run test:e2e        # All tests
npm run test:e2e --ui   # Interactive mode
```

### Test Files
Located in `e2e/` directory:
- `auth.spec.js` - Login/signup flows
- `stripe-payment.spec.js` - Payment processing
- `guest-guide-taxes.spec.js` - Public guide access
- `links-buttons.spec.js` - Navigation
- `ui-scaling.spec.js` - Responsive design

### Playwright Setup
```bash
# Config: playwright.config.js
# Runs against: http://localhost:5173
```

---

## Common Tasks

### Add a new Property field
1. Update Firestore schema (docs/Data.md)
2. Update Property form component
3. Update useFirebaseData hook
4. Add E2E test for validation

### Fix a bug
1. Create a branch: `git checkout -b fix/issue-name`
2. Write failing E2E test
3. Fix the bug
4. Run tests to verify
5. Commit with message: `fix: description`

### Deploy to Production
```bash
# Build
npm run build

# Deploy
firebase deploy
```

---

## Debugging

### Firebase Emulator Issues
```bash
# Reset emulator data
firebase emulators:start --only firestore --export-on-exit ./emulator-data

# Check logs
tail -f ~/.firebase/emulator.log
```

### React DevTools
- Install React DevTools browser extension
- Inspect components, hooks, state

### Firebase Console
- Local: http://localhost:4000
- Production: https://console.firebase.google.com

---

## Project Structure

```
src/
├── App.jsx              # Root component
├── ManagerApp.jsx       # Protected manager view
├── firebase.js          # Firebase init + config
├── components/          # Reusable UI
│   ├── modals/
│   ├── forms/
│   └── ...
├── pages/               # Route pages
│   ├── LandingPage.jsx
│   ├── AuthPages/
│   └── ...
├── hooks/               # Custom hooks
│   ├── useFirebaseData.js  # KEY FILE
│   └── ...
├── context/             # State management
├── styles/              # CSS/tailwind
└── utils/               # Helpers

e2e/                    # Playwright tests
firebase.json           # Emulator config
firestore.rules         # Security rules
```

---

## Performance Tips

- Use React.memo for expensive components
- Lazy load guides (pagination)
- Optimize Firestore queries (add indexes)
- Remove unused listeners in useFirebaseData
- Profile with React DevTools Profiler

---

**Related**: [[Architecture]], [[Known-Issues]], [[Features]]
