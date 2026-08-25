import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    // ⚠️ NIE zamieniać tego na produkcyjny build ([[Known-Issues]] #18, próba z 2026-08-25).
    // Kusi, bo testowałoby się to, co dostaje klient — ale CAŁA atrapa Firebase'a
    // (`e2e/firebase-mock.js`) przechwytuje adresy `**/node_modules/.vite/deps/firebase_*.js`,
    // które istnieją WYŁĄCZNIE pod serwerem deweloperskim. W buildzie moduły siedzą
    // w paczkach z haszem, żadna z tych tras nie łapie, rusza prawdziwy SDK i testy lądują
    // na ekranie logowania. Sprawdzone: `admin-panel` posypał się natychmiast.
    // Przejście na build wymaga wcześniejszego przepisania atrapy tak, żeby nie zależała
    // od adresów Vite — to osobne zadanie, nie poprawka przy okazji.
    command: 'npm run dev -- --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    env: {
      VITE_USE_EMULATORS: 'true',
      // ATRAPY KONFIGURACJI FIREBASE — bez nich CI bylo czerwone od 13.08 ([[Known-Issues]] #18).
      //
      // Prawdziwe wartosci mieszkaja w `.env.local`, ktory jest w `.gitignore` i istnieje
      // WYLACZNIE na maszynie wlasciciela; `ci.yml` nie ustawia zadnej zmiennej. Na runnerze
      // `apiKey` bylo wiec `undefined`, `getAuth(app)` rzucalo
      //     Firebase: Error (auth/invalid-api-key)
      // juz przy wykonywaniu modulu `src/firebase.js`, wiec `main.jsx` nigdy nie dochodzil do
      // `createRoot().render()` i test widzial PUSTY `#root`. Dowod: slad z przebiegu #36.
      //
      // Dotyczylo to DOKLADNIE tych testow, ktore nie wolaja `setupFirebaseMocks` — atrapa
      // podmienia moduly firebase'a, wiec mockowane testy klucza nie potrzebowaly. Korelacja
      // byla co do sztuki: 22 czerwone = 22 testy bez atrapy.
      //
      // Wartosci sa FALSZYWE i takie maja zostac. Nie moga trafic w prawdziwy projekt, bo
      // VITE_USE_EMULATORS kieruje SDK na localhost, a testy stron publicznych i tak nie
      // wykonuja zadnego zapytania do Firebase — potrzebuja tylko tego, zeby inicjalizacja
      // nie rzucila wyjatkiem.
      VITE_FIREBASE_API_KEY: 'AIzaSyE2E-ATRAPA-NIE-JEST-PRAWDZIWYM-KLUCZEM',
      VITE_FIREBASE_AUTH_DOMAIN: 'e2e-atrapa.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'e2e-atrapa',
      VITE_FIREBASE_STORAGE_BUCKET: 'e2e-atrapa.appspot.com',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '000000000000',
      VITE_FIREBASE_APP_ID: '1:000000000000:web:0000000000000000000000',
      // Flaga opt-out GA (`window['ga-disable-<id>']`) ustawia sie tylko `if (measurementId)`
      // — `src/firebase.js:99` i `:112`. Bez tego 6 testow `cookie-consent` padalo w CI
      // i nigdy lokalnie. Naprawa potwierdzona na runnerze w przebiegu #36.
      VITE_FIREBASE_MEASUREMENT_ID: 'G-TESTTEST00',
    },
    timeout: 120000,
  },
});
