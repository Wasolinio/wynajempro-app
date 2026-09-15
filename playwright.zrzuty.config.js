import { defineConfig, devices } from '@playwright/test';
import base from './playwright.config.js';

/*
  Konfiguracja GENERATORA ZRZUTÓW PANELU na landing (`scripts/zrzuty/`).

  PO CO OSOBNA: `playwright.config.js` to suita testów (testDir ./e2e) i to ją puszcza CI
  gołym `npx playwright test`. Zrzuty nie są testem, tylko artefaktem regenerowanym
  świadomie — jak og-image.png (og:build) i banery (banery:build). Osobny config sprawia,
  że CI ich nie renderuje przy każdym pushu (rendering Linux ≠ macOS: hinting fontów,
  paski przewijania — wyszedłby inny obrazek niż ten, który właściciel widzi u siebie).

  Dev server i atrapy Firebase bierzemy 1:1 z bazowego configu (webServer + env) —
  atrapa działa WYŁĄCZNIE pod Vite dev ([[Known-Issues]] #18), nie na buildzie.

  Uruchomienie: npm run zrzuty:build
*/
export default defineConfig({
  testDir: './scripts/zrzuty',
  testMatch: '**/*.zrzut.js',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  timeout: 120000,
  use: {
    baseURL: base.use.baseURL,
    trace: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // kadr 1440×900 @2x: proporcja 1,6 wchodzi niemal 1:1 w okno scroll-demo (1160×720)
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2,
        // liczby w stanie końcowym od pierwszej klatki (useCountUp) i zero animacji wejścia
        reducedMotion: 'reduce',
        locale: 'pl-PL',
        timezoneId: 'Europe/Warsaw',
        colorScheme: 'light',
      },
    },
  ],
  webServer: base.webServer,
});
