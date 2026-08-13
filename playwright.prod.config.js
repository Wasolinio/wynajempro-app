import { defineConfig, devices } from '@playwright/test';

/*
  Konfiguracja dla testów chodzących po ŻYWEJ produkcji (`e2e-prod/`).

  PO CO OSOBNA: `playwright.config.js` startuje lokalny dev server i mockuje Firebase
  (`e2e/firebase-mock.js`). To dobre do testowania kodu, ale przez to suita świeci
  zielono niezależnie od stanu produkcji — 2026-08-13 połowa produktu (strony gościa)
  była martwa przy 133/133 na zielono ([[Known-Issues]] #16). Tu nie ma mocków ani
  dev servera: jest prawdziwy adres i prawdziwy backend.

  Uruchomienie: npm run test:prod
*/
export default defineConfig({
  testDir: './e2e-prod',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Produkcja bywa chwilowo wolna (zimny start, sieć) — jedna powtórka odsiewa
  // migotanie, ale dwie zaczęłyby ukrywać realne problemy.
  retries: 1,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  timeout: 45000,
  use: {
    baseURL: process.env.PROD_URL || 'https://wynajempro.com',
    trace: 'retain-on-failure',
    // Bez tego pierwsze wejście na PWA potrafi trwać dłużej niż domyślny limit akcji.
    navigationTimeout: 30000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
});
