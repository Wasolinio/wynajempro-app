import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock.js';

/*
  Pasek „dostępna nowa wersja" ([[Known-Issues]] #15).

  Czego ten test NIE robi: nie symuluje instalacji nowego service workera — w trybie
  deweloperskim SW nie jest w ogóle rejestrowany, więc `needRefresh` nigdy tu nie zapali się
  samo. Pokrywamy to, co da się pokryć bez produkcyjnego buildu: że pasek NIE pokazuje się
  bez powodu, że po wymuszeniu (`wpu:show`) ma komunikat i akcję, i że da się go zamknąć.
  Zachowanie samego SW (prompt zamiast autoUpdate) weryfikuje się na produkcji po deployu.
*/

test('Pasek aktualizacji nie pokazuje się bez nowej wersji', async ({ page }) => {
  await setupFirebaseMocks(page, { consentCookies: true });
  await page.goto('/');

  await expect(page.locator('.wpu-bar')).toHaveCount(0);
});

test('Pasek aktualizacji: komunikat, akcja „Odśwież" i zamknięcie', async ({ page }) => {
  await setupFirebaseMocks(page, { consentCookies: true });
  await page.goto('/');

  await page.evaluate(() => window.dispatchEvent(new Event('wpu:show')));

  const bar = page.locator('.wpu-bar');
  await expect(bar).toBeVisible();
  await expect(bar).toContainText('Dostępna nowa wersja aplikacji');
  await expect(bar.getByRole('button', { name: 'Odśwież' })).toBeVisible();

  // Pasek jest komunikatem, nie blokadą — użytkownik może pracować dalej na starej wersji.
  await bar.getByRole('button', { name: 'Zamknij' }).click();
  await expect(page.locator('.wpu-bar')).toHaveCount(0);
});

test('Pasek aktualizacji nie zasłania banera zgody ani jego przycisków', async ({ page }) => {
  // Baner zgody siedzi przy DOLNEJ krawędzi, pasek przy górnej — obie rzeczy mogą
  // wisieć naraz (pierwsza wizyta zaraz po deployu) i nie mogą się przykrywać.
  await setupFirebaseMocks(page, { consentCookies: false });
  await page.goto('/');
  await page.evaluate(() => window.dispatchEvent(new Event('wpu:show')));

  const update = await page.locator('.wpu-bar').boundingBox();
  const consent = await page.locator('.wpc-bar').boundingBox();
  expect(update.y + update.height).toBeLessThan(consent.y);

  // Przycisk zgody nadal klikalny (nie przechwycony przez kontener paska).
  await page.getByRole('button', { name: 'Akceptuję' }).click();
  await expect(page.locator('.wpc-bar')).toHaveCount(0);
});
