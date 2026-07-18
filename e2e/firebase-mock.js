export async function setupFirebaseMocks(page, options = {}) {
  const {
    user = null,
    dbData = {},
    functions = {},
    consentCookies = true
  } = options;

  // Set up route interceptions for firebase files
  await page.route('**/node_modules/.vite/deps/firebase_app.js*', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        export const initializeApp = () => ({});
        export const getApps = () => [];
        export const getApp = () => ({});
      `
    });
  });

  await page.route('**/node_modules/.vite/deps/firebase_auth.js*', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        export const getAuth = () => {
          if (!window.__mockAuth) {
            window.__mockAuth = {
              currentUser: ${user ? JSON.stringify(user) : 'null'},
              listeners: [],
              users: {
                'test@example.com': { uid: 'uid-test', email: 'test@example.com', displayName: 'Test User', emailVerified: true },
                'unverified@example.com': { uid: 'uid-unverified', email: 'unverified@example.com', displayName: 'Test User', emailVerified: false },
                'existing@example.com': { uid: 'uid-existing', email: 'existing@example.com', displayName: 'Existing User', emailVerified: true }
              }
            };
            if (window.__mockAuth.currentUser) {
              window.__mockAuth.currentUser.reload = async () => {};
              window.__mockAuth.currentUser.getIdToken = async () => 'mock-token';
              window.__mockAuth.currentUser.providerData = [{ providerId: 'password' }];
            }
          }
          return window.__mockAuth;
        };
        export const connectAuthEmulator = () => {};
        export const onAuthStateChanged = (auth, callback) => {
          const mockAuth = getAuth();
          mockAuth.listeners.push(callback);
          setTimeout(() => callback(mockAuth.currentUser), 0);
          return () => {
            mockAuth.listeners = mockAuth.listeners.filter(l => l !== callback);
          };
        };
        export const signOut = async (auth) => {
          const mockAuth = getAuth();
          mockAuth.currentUser = null;
          mockAuth.listeners.forEach(callback => callback(null));
        };
        export const signInWithEmailAndPassword = async (auth, email, password) => {
          const mockAuth = getAuth();
          if (!email || email === 'invalidemail') {
            throw { code: 'auth/invalid-email' };
          }
          if (password === 'wrong') {
            throw { code: 'auth/invalid-credential' };
          }
          const matchedUser = mockAuth.users[email];
          if (!matchedUser) {
            throw { code: 'auth/invalid-credential' };
          }
          mockAuth.currentUser = {
            ...matchedUser,
            reload: async () => {},
            providerData: [{ providerId: 'password' }]
          };
          mockAuth.listeners.forEach(callback => callback(mockAuth.currentUser));
          return { user: mockAuth.currentUser };
        };
        export const createUserWithEmailAndPassword = async (auth, email, password) => {
          const mockAuth = getAuth();
          if (password && password.length < 6) {
            throw { code: 'auth/weak-password' };
          }
          if (email === 'existing@example.com') {
            throw { code: 'auth/email-already-in-use' };
          }
          const newUser = { uid: 'uid-' + Math.random(), email, displayName: 'New User', emailVerified: false };
          mockAuth.users[email] = newUser;
          mockAuth.currentUser = {
            ...newUser,
            reload: async () => {},
            providerData: [{ providerId: 'password' }]
          };
          return { user: mockAuth.currentUser };
        };
        export const signInAnonymously = async (auth) => {
          const mockAuth = getAuth();
          const anonUser = { uid: 'anon-' + Math.random(), email: null, displayName: 'Guest', emailVerified: false, isAnonymous: true };
          mockAuth.currentUser = anonUser;
          mockAuth.listeners.forEach(callback => callback(mockAuth.currentUser));
          return { user: mockAuth.currentUser };
        };
        export const GoogleAuthProvider = class {};
        export const signInWithPopup = async (auth, provider) => {
          const mockAuth = getAuth();
          const user = { uid: 'uid-google', email: 'google@example.com', displayName: 'Google User', emailVerified: true };
          mockAuth.currentUser = {
            ...user,
            reload: async () => {},
            providerData: [{ providerId: 'google.com' }]
          };
          mockAuth.listeners.forEach(callback => callback(mockAuth.currentUser));
          return { user: mockAuth.currentUser };
        };
        export const signInWithRedirect = async (auth, provider) => {
          // Mock redirects don't actually navigate, just return
          return Promise.resolve();
        };
        export const getRedirectResult = async (auth) => {
          // Return null by default in tests (meaning no redirect result)
          return Promise.resolve(null);
        };
        export const updateProfile = async (user, { displayName }) => {
          if (user) {
            user.displayName = displayName;
          }
        };
        export const sendEmailVerification = async (user) => {};
        export const EmailAuthProvider = {
          credential: (email, password) => ({ email, password })
        };
        export const reauthenticateWithCredential = async (user, credential) => {};
        export const reauthenticateWithPopup = async (user, provider) => ({ user });
        // Trwałość sesji ("Zapamiętaj mnie") + reset hasła — no-op na mockach.
        // Bez tych eksportów import ESM w LoginPanel.jsx pada i /login renderuje pustą stronę.
        export const browserLocalPersistence = { type: 'LOCAL' };
        export const browserSessionPersistence = { type: 'SESSION' };
        export const setPersistence = async (auth, persistence) => {};
        export const sendPasswordResetEmail = async (auth, email) => {};
      `
    });
  });

  await page.route('**/node_modules/.vite/deps/firebase_firestore.js*', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        export const Timestamp = {
          fromDate: (date) => ({
            toDate: () => new Date(date),
            seconds: Math.floor(new Date(date).getTime() / 1000),
            nanoseconds: 0
          }),
          now: () => {
            const date = new Date();
            return {
              toDate: () => date,
              seconds: Math.floor(date.getTime() / 1000),
              nanoseconds: 0
            };
          }
        };
        
        export const persistentLocalCache = () => ({});
        export const persistentMultipleTabManager = () => ({});
        export const initializeFirestore = () => ({});
        export const connectFirestoreEmulator = () => {};
        export const serverTimestamp = () => Timestamp.now();
        export const deleteField = () => ({ _deleteField: true });
        
        export const doc = (db, ...paths) => {
          return { type: 'doc', path: paths.join('/') };
        };
        
        export const collection = (db, ...paths) => {
          return { type: 'collection', path: paths.join('/') };
        };
        
        export const query = (col, ...clauses) => {
          return { type: 'query', collection: col };
        };
        
        export const where = (field, op, val) => {
          return { type: 'where', field, op, val };
        };
        
        export const getDoc = async (docRef) => {
          const dbData = window.__mockDbData || {};
          const data = dbData[docRef.path];
          return {
            exists: () => data !== undefined,
            data: () => data
          };
        };
        
        export const getDocs = async (queryOrCol) => {
          const dbData = window.__mockDbData || {};
          const path = queryOrCol.path || (queryOrCol.collection && queryOrCol.collection.path);
          const docs = [];
          Object.keys(dbData).forEach(key => {
            if (key.startsWith(path + '/')) {
              const id = key.substring(path.length + 1);
              if (!id.includes('/')) {
                docs.push({
                  id,
                  data: () => dbData[key]
                });
              }
            }
          });
          return {
            empty: docs.length === 0,
            docs
          };
        };
        
        export const addDoc = async (colRef, data) => {
          const id = 'mock-id-' + Math.random().toString(36).substring(2, 9);
          const path = colRef.path + '/' + id;
          if (!window.__mockDbData) window.__mockDbData = {};
          window.__mockDbData[path] = data;
          triggerListeners(colRef.path);
          return { id, path };
        };
        
        export const setDoc = async (docRef, data) => {
          if (!window.__mockDbData) window.__mockDbData = {};
          window.__mockDbData[docRef.path] = data;
          triggerListeners(docRef.path);
        };
        
        export const updateDoc = async (docRef, updates) => {
          if (!window.__mockDbData) window.__mockDbData = {};
          const current = window.__mockDbData[docRef.path] || {};
          window.__mockDbData[docRef.path] = { ...current, ...updates };
          triggerListeners(docRef.path);
        };
        
        export const deleteDoc = async (docRef) => {
          if (window.__mockDbData) {
            delete window.__mockDbData[docRef.path];
          }
          triggerListeners(docRef.path);
        };
        
        const listeners = {};
        export const onSnapshot = (refOrQuery, callback, errorCallback) => {
          const path = refOrQuery.path || (refOrQuery.collection && refOrQuery.collection.path);
          if (!listeners[path]) listeners[path] = [];
          
          const trigger = () => {
            const dbData = window.__mockDbData || {};
            if (refOrQuery.type === 'doc') {
              const data = dbData[path];
              callback({
                exists: () => data !== undefined,
                data: () => data
              });
            } else {
              const docs = [];
              Object.keys(dbData).forEach(key => {
                if (key.startsWith(path + '/')) {
                  const id = key.substring(path.length + 1);
                  if (!id.includes('/')) {
                    docs.push({
                      id,
                      data: () => dbData[key]
                    });
                  }
                }
              });
              callback({
                empty: docs.length === 0,
                docs
              });
            }
          };
        
          listeners[path].push(trigger);
          setTimeout(trigger, 0);
        
          return () => {
            listeners[path] = listeners[path].filter(l => l !== trigger);
          };
        };
        
        function triggerListeners(path) {
          if (listeners[path]) {
            listeners[path].forEach(l => l());
          }
          const parts = path.split('/');
          if (parts.length > 1) {
            const parentPath = parts.slice(0, -1).join('/');
            if (listeners[parentPath]) {
              listeners[parentPath].forEach(l => l());
            }
          }
        }
      `
    });
  });

  await page.route('**/node_modules/.vite/deps/firebase_functions.js*', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        export const getFunctions = () => ({});
        export const connectFunctionsEmulator = () => {};
        export const httpsCallable = (functions, name) => {
          return async (data) => {
            if (window.__mockFunctions && window.__mockFunctions[name]) {
              return { data: await window.__mockFunctions[name](data) };
            }
            if (name === 'createCheckoutSession') {
              return { data: { url: 'https://checkout.stripe.com/pay/mock_session_123' } };
            }
            if (name === 'createBillingPortalSession') {
              return { data: { url: 'https://billing.stripe.com/p/mock_portal_123' } };
            }
            if (name === 'syncICalCalendars') {
              return { data: { newBookingsCount: 1 } };
            }
            return { data: {} };
          };
        };
      `
    });
  });

  await page.route('**/node_modules/.vite/deps/firebase_analytics.js*', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        export const getAnalytics = () => ({});
        export const logEvent = () => {};
      `
    });
  });

  await page.route('**/node_modules/.vite/deps/firebase_app-check.js*', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        export const initializeAppCheck = () => ({});
        export const ReCaptchaV3Provider = class {};
      `
    });
  });

  await page.route('**/node_modules/.vite/deps/firebase_storage.js*', async (route) => {
    await route.fulfill({
      contentType: 'application/javascript',
      body: `
        export const getStorage = () => ({});
        export const connectStorageEmulator = () => {};
        export const ref = () => ({});
        export const uploadBytes = async () => ({});
        export const getDownloadURL = async () => '';
      `
    });
  });

  // Inject initial state/data into window object before loading page
  await page.addInitScript(({ initialDbData, initialFunctions, consentCookies }) => {
    window.__mockDbData = initialDbData;
    window.__mockFunctions = initialFunctions || {};
    if (consentCookies) {
      localStorage.setItem('cookie_consent', 'true');
    }
  }, { initialDbData: dbData, initialFunctions: functions, consentCookies });
}
