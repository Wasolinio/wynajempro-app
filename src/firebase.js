import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAnalytics } from 'firebase/analytics';

// Konfiguracja pobierana bezpiecznie ze zmiennych środowiskowych (.env.local)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Zapobiega podwójnej inicjalizacji w środowisku deweloperskim
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const isEmulator = import.meta.env.VITE_USE_EMULATORS === 'true';

// ===== APP CHECK — OCHRONA PRZED BOTAMI =====
// W trybie deweloperskim włączamy debug token (ustawiony w konsoli Firebase)
let appCheck = null;
if (!isEmulator) {
  if (import.meta.env.DEV) {
    self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  appCheck = initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true,
  });
}

const auth = getAuth(app);

// Firestore z trwałym cache w IndexedDB (wyłączonym w trybie emulatora)
// Powracający użytkownicy czytają dane z cache, nie z serwera
const db = isEmulator
  ? initializeFirestore(app, {})
  : initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });

const functions = getFunctions(app); // Instancja Cloud Functions do wywołań httpsCallable
const storage = getStorage(app);

if (isEmulator) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}

// Inicjalizacja Google Analytics TYLKO po akceptacji cookies
let analytics = null;
if (typeof window !== 'undefined' && localStorage.getItem('cookie_consent') === 'true') {
  analytics = getAnalytics(app);
}

export const initAnalytics = () => {
  if (!analytics && typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
  return analytics;
};

export { auth, db, functions, appCheck, storage, analytics };
