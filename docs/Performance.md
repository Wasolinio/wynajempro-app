# ⚡ Performance Guide

Optimization tips and patterns for WynajemPRO.

---

## Frontend Performance

### Code Splitting

**Problem**: Large bundle size

**Solution**: Lazy load components per route

```javascript
// src/App.jsx
import { lazy, Suspense } from 'react';

const ManagerApp = lazy(() => import('./ManagerApp'));
const GuestGuide = lazy(() => import('./pages/GuestGuide'));

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/dashboard" element={<ManagerApp />} />
        <Route path="/guide/:id" element={<GuestGuide />} />
      </Routes>
    </Suspense>
  );
}
```

**Result**: ✅ Faster initial load, code only loaded when needed

---

## Firestore Performance

### Query Optimization

**Solution**: Add Firestore indexes and pagination

```javascript
const PAGE_SIZE = 20;

let q = query(
  collection(db, 'properties'),
  where('ownerId', '==', uid),
  orderBy('createdAt', 'desc'),
  limit(PAGE_SIZE)
);
```

**Real-time Listener Performance**: 
- Clean up listeners when done
- Use `docChanges()` to detect only changes

```javascript
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, 'guides'), snapshot => {
    snapshot.docChanges().forEach(change => {
      // Handle only changes
    });
  });
  
  return () => unsubscribe();
}, []);
```

---

## Cloud Functions Performance

### Execution Time Optimization

```javascript
// Run async operations in parallel
const [users, properties] = await Promise.all([
  getAllUsers(),
  getAllProperties()
]);
```

### Cold Start Reduction
- Keep functions warm with scheduled pings
- Minimize dependencies
- Increase memory if needed (costs more but runs faster)

---

## Caching Strategy

### React Query
```javascript
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['properties', uid],
  queryFn: () => fetchProperties(),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

---

## Performance Checklist

- [ ] Bundle size < 300 KB
- [ ] Images lazy-loaded
- [ ] Firestore indexes created
- [ ] Real-time listeners cleaned up
- [ ] Cloud Functions < 6 seconds
- [ ] Lighthouse score > 90
- [ ] Caching implemented

---

**Related**: [[Development]], [[Architecture]], [[Debugging]]
