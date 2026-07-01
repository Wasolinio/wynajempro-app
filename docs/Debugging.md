# 🐛 Debugging Guide

Common problems and solutions for WynajemPRO development.

---

## Firebase Emulator Issues

### Problem: Emulator won't start

**Error**: `java: command not found` or `JAVA_HOME not set`

**Solution**:
```bash
# Install Java
brew install openjdk@11

# Set JAVA_HOME
export JAVA_HOME=$(/usr/libexec/java_home)

# Start emulator
firebase emulators:start
```

---

### Problem: Firestore data not persisting between runs

**Issue**: Emulator data resets every time

**Solution**:
```bash
# Export data on exit
firebase emulators:start --export-on-exit ./emulator-data

# Later, import data
firebase emulators:start --import ./emulator-data
```

---

### Problem: Cannot connect from app to emulator

**Error**: `Error: Could not determine the name of the plugin`

**Solution**: Check `src/firebase.js`:
```javascript
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

if (process.env.VITE_USE_EMULATORS === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080);
  // Also connect Auth, Storage
}
```

---

### Problem: Emulator UI not loading

**URL**: http://localhost:4000 shows blank page

**Solution**:
```bash
# Kill process on port 4000
lsof -i :4000 | grep -v PID | awk '{print $2}' | xargs kill -9

# Restart emulator
firebase emulators:start
```

---

## Authentication Issues

### Problem: Google Sign-in not working

**Error**: `Error: popup closed by user` or auth popup doesn't appear

**Solution**:
1. Check Firebase config in `.env.local`
2. Verify Google OAuth credentials in Firebase Console
3. Add localhost to authorized domains:
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add: `localhost`, `127.0.0.1`

---

### Problem: "401 Unauthorized" errors

**Error**: Functions return 401, user can't call Firestore

**Likely Cause**: User not authenticated

**Debug**:
```javascript
import { getAuth } from 'firebase/auth';
const auth = getAuth();
console.log('Current user:', auth.currentUser);
console.log('ID token:', await auth.currentUser?.getIdToken());
```

---

### Problem: Email verification not sending

**Error**: User signs up but doesn't get verification email

**Causes**:
1. Cloud Function not deployed
2. Firebase SendGrid not configured
3. Email address blacklisted

**Solution**:
```bash
# Check functions deployed
firebase functions:list

# Check logs
firebase functions:log
```

---

## Firestore Issues

### Problem: Firestore query returns empty

**Issue**: `getDocs()` returns 0 results

**Debugging**:
```javascript
// Check if data exists (entries are under the user, not a top-level collection)
const allDocs = await getDocs(collection(db, 'users', uid, 'rentals'));
console.log('Total entries:', allDocs.size);

// Check query conditions (rentals are filtered by `date`, not `ownerId`)
const q = query(
  collection(db, 'users', uid, 'rentals'),
  where('date', '>=', `${year}-01-01`),
  where('date', '<=', `${year}-12-31`)
);
const results = await getDocs(q);
console.log('Filtered results:', results.size);

// Check security rules allow read
// See: firestore.rules
```

---

### Problem: Real-time listener doesn't update

**Issue**: Data changes but UI doesn't reflect changes

**Debugging**:
```javascript
const unsubscribe = onSnapshot(q, (snapshot) => {
  console.log('Listener fired!', snapshot.size);
  // Verify this logs when data changes
});

// Check cleanup
useEffect(() => {
  return () => unsubscribe(); // Properly unsubscribe
}, []);
```

---

### Problem: "Permission denied" error

**Error**: `FirebaseError: Missing or insufficient permissions`

**Solution**: Check `firestore.rules`. Rentals/settings also require an **active subscription** — a common cause of "permission denied" is a lapsed trial, not an ownership problem:
```
// users/{uid}/rentals — owner + verified + active subscription
match /users/{userId}/rentals/{docId} {
  allow read: if isOwnerAndVerified(userId) && hasActiveSubscription(userId);
  allow create, update: if isOwnerAndVerified(userId) && hasActiveSubscription(userId)
                        && isValidRental(request.resource.data);
  allow delete: if isOwnerAndVerified(userId) && hasActiveSubscription(userId);
}
// guides/{guideId} — public read; owner-only write
match /guides/{guideId} { allow read: if true; /* write: owner + subscription */ }
```

---

## Storage Issues

### Problem: File upload fails

**Error**: `StorageError: "Unsupported bucket"`

**Solution**:
```javascript
import { getStorage, ref, uploadBytes } from 'firebase/storage';

const storage = getStorage(); // Gets default bucket
const fileRef = ref(storage, `properties/${propId}/photo.jpg`);
await uploadBytes(fileRef, file);
```

---

### Problem: Can't download file

**Error**: `401 Unauthorized` when accessing file URL

**Likely Cause**: Storage rules are too restrictive

**Solution**: Check `storage.rules`:
```
match /{allPaths=**} {
  // Allow authenticated users to read guides
  allow read: if request.auth != null;
}
```

---

## React Issues

### Problem: Component not re-rendering

**Issue**: State updates but UI doesn't change

**Debugging**:
```javascript
// Add console.log in render
console.log('Rendering with state:', state);

// Check if updating state correctly
// ❌ Wrong (mutating state)
state.properties.push(newProperty);

// ✅ Correct
setState([...state, newProperty]);
```

---

### Problem: Infinite loop in useEffect

**Issue**: Component keeps re-rendering

**Common Cause**: Missing dependency array

```javascript
// ❌ Infinite loop
useEffect(() => {
  setState(data); // Every render updates state, causing re-render
});

// ✅ Fixed
useEffect(() => {
  setState(data);
}, []); // Empty dependency array
```

---

### Problem: "Hook called conditionally"

**Error**: `Invalid hook call. Hooks can only be called inside function components`

**Causes**:
1. Hook called inside condition
2. Hook called after return
3. Hook called in class component

**Fix**: Move hooks to top level

```javascript
// ❌ Wrong
if (user) {
  const [data, setData] = useState(null);
}

// ✅ Correct
const [data, setData] = useState(null);
useEffect(() => {
  if (!user) return;
  // Load data
}, [user]);
```

---

## E2E Test Issues

### Problem: Playwright tests fail with timeout

**Error**: `Timeout while waiting for event "load"`

**Solution**:
```bash
# Increase timeout
npx playwright test --timeout=60000

# Or in playwright.config.js
timeout: 60 * 1000, // 60 seconds
```

---

### Problem: Test passes locally but fails in CI

**Common Causes**:
1. Race condition (test runs too fast)
2. Different emulator state
3. Missing environment variable

**Solution**: Add explicit waits

```javascript
// ❌ Flaky
await page.click('button');
await page.waitForNavigation();

// ✅ Reliable
await page.click('button');
await page.waitForFunction(() => {
  return window.location.pathname === '/dashboard';
});
```

---

### Problem: Can't interact with Firebase Emulator UI in test

**Issue**: Emulator starts but test can't connect

**Solution**: Ensure emulator is running on same ports:
```bash
firebase emulators:start --project=wynajempro-app
```

Then in test:
```javascript
process.env.VITE_USE_EMULATORS = 'true';
process.env.FIREBASE_EMULATOR_HOST = 'localhost:9099'; // Auth
```

---

## Performance Issues

### Problem: Slow page load

**Debug**:
```javascript
// Measure render time
console.time('render');
// ... component code ...
console.timeEnd('render');

// Check network tab
// - Images too large?
// - Too many API calls?
// - Slow Cloud Function?
```

**Solutions**:
- Lazy load images
- Paginate large lists
- Add Firestore indexes
- Optimize Cloud Functions

See: [[Performance]]

---

## Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| `ENOENT: no such file or directory` | File not found | Check path |
| `EACCES: permission denied` | No file permissions | `chmod +x file` |
| `EADDRINUSE: address already in use` | Port taken | `lsof -i :PORT \| kill` |
| `SyntaxError: Unexpected token` | JSON parse error | Check JSON validity |
| `TypeError: Cannot read property 'x' of undefined` | Accessing undefined | Add null checks |

---

## Developer Tools

### React DevTools
- Download browser extension
- Inspect component state, props
- Trace renders

### Firebase Console
- Local: http://localhost:4000
- Check data, security rules, logs

### Chrome DevTools
- Network tab: Check API calls
- Console: View errors, logs
- Performance: Profile slow renders

### VS Code Debugger

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

---

## Getting Help

1. **Check logs**:
   ```bash
   firebase functions:log
   ```

2. **Read Firebase docs**: https://firebase.google.com/docs

3. **Search StackOverflow**: https://stackoverflow.com/questions/tagged/firebase

4. **Check [[Known-Issues]]** for documented bugs

---

**Related**: [[Development]], [[Known-Issues]], [[Performance]]
