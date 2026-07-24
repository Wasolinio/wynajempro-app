import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getAnalytics, setAnalyticsCollectionEnabled } from 'firebase/analytics';

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

// ─── Google Analytics (model opt-in, zgodny z RODO) ───
// GA inicjalizowane TYLKO gdy zgoda zapisana w localStorage('cookie_consent') === 'true'.
// Zgodę można wycofać w każdej chwili (RODO art. 7 ust. 3) — patrz disableAnalytics().
const measurementId = firebaseConfig.measurementId;

let analytics = null;
if (typeof window !== 'undefined' && localStorage.getItem('cookie_consent') === 'true') {
  analytics = getAnalytics(app);
}

// Leniwa inicjalizacja po udzieleniu zgody. Bez zgody NIE tworzy instancji GA —
// dzięki temu zdarzenia (np. logowanie w LoginPanel) nie lecą do GA przed akceptacją.
export const initAnalytics = () => {
  if (typeof window === 'undefined') return analytics;
  if (localStorage.getItem('cookie_consent') !== 'true') return analytics;
  if (!analytics) {
    analytics = getAnalytics(app);
  }
  return analytics;
};

// Kasuje ciasteczka GA (_ga, _ga_*, _gid, _gat) ze wszystkich pasujących domen.
const clearGaCookies = () => {
  if (typeof document === 'undefined') return;
  const host = window.location.hostname;
  const domains = ['', `; domain=${host}`, `; domain=.${host}`];
  const parts = host.split('.');
  if (parts.length > 2) domains.push(`; domain=.${parts.slice(-2).join('.')}`);
  document.cookie.split(';').forEach((entry) => {
    const name = entry.split('=')[0].trim();
    if (name === '_ga' || name === '_gid' || name === '_gat' || name.startsWith('_ga_')) {
      domains.forEach((d) => {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT${d}`;
      });
    }
  });
};

// Włączenie zbierania danych po (ponownym) udzieleniu zgody. Symetryczne do disableAnalytics().
export const enableAnalytics = () => {
  if (typeof window === 'undefined') return null;
  if (measurementId) window[`ga-disable-${measurementId}`] = false;
  const instance = initAnalytics();
  try {
    if (instance) setAnalyticsCollectionEnabled(instance, true);
  } catch { /* brak instancji — nic do włączenia */ }
  return instance;
};

// Wycofanie zgody (RODO art. 7 ust. 3): zatrzymuje zbieranie danych w czasie rzeczywistym,
// bez przeładowania strony. Ustawia standardową flagę opt-out gtag.js (blokuje wysyłkę hitów
// dla measurementId), wyłącza kolekcję po stronie Firebase i kasuje istniejące ciasteczka _ga*.
export const disableAnalytics = () => {
  if (typeof window === 'undefined') return;
  if (measurementId) window[`ga-disable-${measurementId}`] = true;
  try {
    if (analytics) setAnalyticsCollectionEnabled(analytics, false);
  } catch { /* brak instancji — nic nie zbieramy */ }
  clearGaCookies();
};

export { auth, db, functions, appCheck, storage, analytics };
