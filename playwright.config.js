import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  // Domyślne 5 s było strojone pod ciepłą maszynę lokalną. Na runnerze `vite dev`
  // transformuje graf trasy przy pierwszym wejściu i pierwszy render potrafi się nie zmieścić
  // — to był objaw grupy A z [[Known-Issues]] #18 (pusty `#root` w snapshocie DOM).
  // Rozgrzewkę robi `server.warmup` w `vite.config.js`; to jest zapas na resztę.
  expect: { timeout: process.env.CI ? 15000 : 5000 },
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
      // Atrapa `measurementId` — BEZ NIEJ 6 testów `cookie-consent` pada w CI i nigdy
      // lokalnie ([[Known-Issues]] #18, grupa B). `src/firebase.js:99` i `:112` ustawiają
      // flagę opt-out `window['ga-disable-<id>']` tylko `if (measurementId)`, a identyfikator
      // pochodzi z `.env.local`, który jest w `.gitignore` i istnieje jedynie na maszynie
      // właściciela. Wartość jest atrapą i taka ma zostać: moduł analityki i tak jest
      // przechwytywany przez `firebase-mock.js`, liczy się wyłącznie to, że jest niepusta.
      VITE_FIREBASE_MEASUREMENT_ID: 'G-TESTTEST00',
    },
    timeout: 120000,
  },
});
