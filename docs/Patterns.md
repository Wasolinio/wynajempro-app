# 🎯 Code Patterns & Best Practices

Recommended patterns and solutions for common problems in WynajemPRO.

---

## React Patterns

### Custom Hook for Data Fetching

**Pattern**: useFirebaseData hook (key pattern!)

```javascript
// Simplified illustration. The real src/hooks/useFirebaseData.js feeds a
// TanStack Query cache and listens to the user's subcollections (no top-level
// `properties` collection; entries are scoped under users/{uid}).
export function useFirebaseData(uid, year) {
  const [rentals, setRentals] = useState([]);

  useEffect(() => {
    if (!uid) return;
    const q = query(
      collection(db, 'users', uid, 'rentals'),
      where('date', '>=', `${year}-01-01`),
      where('date', '<=', `${year}-12-31`)
    );
    const unsub = onSnapshot(q, snap =>
      setRentals(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return () => unsub(); // Cleanup!
  }, [uid, year]);

  return rentals;
}
```

**Usage**:
```javascript
const rentals = useFirebaseData(userId, 2026);
```

**Why**: Centralizes real-time logic, prevents listener leaks

---

### Protected Routes

**Pattern**: Check auth before rendering

```javascript
// src/App.jsx
function App() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);
  
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/dashboard" 
        element={user ? <ManagerApp /> : <Navigate to="/" />} 
      />
      <Route path="/guide/:id" element={<GuestGuide />} />
    </Routes>
  );
}
```

---

### Component Memoization

**Pattern**: Prevent unnecessary re-renders

```javascript
const PropertyCard = React.memo(({ property, onEdit }) => {
  return (
    <div>
      <h2>{property.name}</h2>
      <button onClick={() => onEdit(property.id)}>Edit</button>
    </div>
  );
});
```

**When to use**: Components that receive same props frequently

---

## Firestore Patterns

### Real-time Listener with Cleanup

**✅ Correct**:
```javascript
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'guides'), snapshot => {
    // Handle data
  });
  
  return () => unsubscribe(); // Important!
}, []);
```

**❌ Wrong**:
```javascript
useEffect(() => {
  onSnapshot(collection(db, 'guides'), snapshot => {
    // Memory leak - listener never cleaned up!
  });
}, []);
```

---

### Optimized Query Pattern

**Pattern**: Only fetch what you need

```javascript
const q = query(
  collection(db, 'users', userId, 'rentals'),
  where('date', '>=', yearStart),
  where('date', '<=', yearEnd),
  orderBy('date', 'desc'),
  limit(20)
);

onSnapshot(q, snapshot => {
  // Process only changed documents
  snapshot.docChanges().forEach(change => {
    if (change.type === 'added') {
      console.log('New property:', change.doc.data());
    }
    if (change.type === 'modified') {
      console.log('Updated property:', change.doc.data());
    }
  });
});
```

---

### Batch Operations

**Pattern**: Multiple writes as one atomic operation

```javascript
const batch = writeBatch(db);

// Add multiple documents
batch.set(doc(db, 'users', userId, 'rentals', entryId), entryData);
batch.set(doc(db, 'guides', guideId), guideData);
batch.set(doc(db, 'users', userId, 'settings', 'properties'), { items });

await batch.commit(); // All or nothing
```

---

## Security Patterns

### Field Validation Pattern

**Pattern**: Validate on both client and server

```javascript
// Client-side validation (UX)
function validateEntry(data) {
  if (!data.date) throw new Error('Date required');
  if (!data.property) throw new Error('Property required');
}

// Server-side validation (Firestore rules) — real model
match /users/{userId}/rentals/{docId} {
  allow read:          if isOwnerAndVerified(userId) && hasActiveSubscription(userId);
  allow create, update: if isOwnerAndVerified(userId) && hasActiveSubscription(userId)
                        && isValidRental(request.resource.data);
  allow delete:        if isOwnerAndVerified(userId) && hasActiveSubscription(userId);
}
```

---

### Authentication Pattern

**Pattern**: Check auth in Cloud Functions

```javascript
exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User not logged in');
  }
  
  const uid = context.auth.uid;
  
  // User can only delete their own account
  if (data.uid !== uid) {
    throw new functions.https.HttpsError('permission-denied', 'Cannot delete another user');
  }
  
  // Proceed with deletion
  await admin.firestore().collection('users').doc(uid).delete();
});
```

---

## Error Handling Patterns

### Try-Catch Pattern

```javascript
async function fetchRentals(userId, year) {
  try {
    const q = query(
      collection(db, 'users', userId, 'rentals'),
      where('date', '>=', `${year}-01-01`),
      where('date', '<=', `${year}-12-31`)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Failed to fetch rentals:', error);
    throw new Error('Could not load data. Please try again.');
  }
}
```

### User-Friendly Error Messages

```javascript
// ❌ Don't expose technical errors
console.log('Firestore: Missing OR clause');

// ✅ Show user-friendly messages
alert('Unable to load properties. Please refresh and try again.');

// Log technical details for debugging
console.error('[DEBUG]', error);
```

---

## Performance Patterns

### Lazy Loading Images

**Pattern**: Load images only when visible

```javascript
<img 
  src={photoUrl} 
  loading="lazy" 
  alt="Property photo"
/>
```

---

### Pagination Pattern

**Pattern**: Load data in chunks

```javascript
const [lastDoc, setLastDoc] = useState(null);
const PAGE_SIZE = 20;

async function loadMore() {
  let q = query(
    collection(db, 'users', uid, 'rentals'),
    orderBy('date', 'desc'),
    limit(PAGE_SIZE)
  );
  
  if (lastDoc) {
    q = query(...constraints, startAfter(lastDoc));
  }
  
  const snapshot = await getDocs(q);
  const newDocs = snapshot.docs;
  
  setLastDoc(newDocs[newDocs.length - 1]);
  // Add to list...
}
```

---

### Debouncing Searches

**Pattern**: Don't query on every keystroke

```javascript
import { useCallback, useState } from 'react';

function SearchEntries() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const debouncedSearch = useCallback(
    debounce(async (searchTerm) => {
      const q = query(
        collection(db, 'users', uid, 'rentals'),
        where('property', '>=', searchTerm),
        where('name', '<', searchTerm + ''),
        limit(10)
      );
      const snapshot = await getDocs(q);
      setResults(snapshot.docs);
    }, 500),
    []
  );
  
  return (
    <input 
      onChange={(e) => {
        setQuery(e.target.value);
        debouncedSearch(e.target.value);
      }}
      placeholder="Search properties..."
    />
  );
}

function debounce(fn, ms) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
}
```

---

## Testing Patterns

### Test Setup Pattern

```javascript
// e2e/example.spec.js
import { test, expect } from '@playwright/test';

test.describe('Property Creation', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('http://localhost:5173/dashboard');
    await page.click('text=Add Property');
  });
  
  test('should create new property', async ({ page }) => {
    await page.fill('input[name="name"]', 'Test Property');
    await page.fill('input[name="address"]', '123 Main St');
    await page.click('button:has-text("Create")');
    
    await expect(page).toHaveTitle(/Dashboard/);
    await expect(page.locator('text=Test Property')).toBeVisible();
  });
});
```

---

## File Organization Patterns

### Component Structure

```
src/components/
├── PropertyCard.jsx           # Presentational
├── PropertyForm.jsx           # Form logic
├── modals/
│   └── AddEditEntryModal.jsx  # Modal wrapper
└── layouts/
    └── DashboardLayout.jsx    # Layout wrapper
```

### Naming Conventions

- Components: PascalCase (PropertyCard.jsx)
- Functions: camelCase (fetchProperties)
- Constants: UPPER_SNAKE_CASE (API_ENDPOINT)
- Variables: camelCase (userId)

---

## Documentation Patterns

### Function Documentation

```javascript
/**
 * Fetch user's properties from Firestore
 * @param {string} userId - The user's Firebase UID
 * @returns {Promise<Array>} Array of property objects
 * @throws {Error} If Firestore read fails
 */
async function fetchProperties(userId) {
  // Implementation
}
```

---

**Related**: [[Architecture]], [[Development]], [[Debugging]]

