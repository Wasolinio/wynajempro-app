import { test, expect } from '@playwright/test';
import { PATCH_NOTES } from '../src/data/patchNotes.js';

/*
  /co-nowego — publiczny dziennik zmian (humanizacja landingu, 2026-09-03).
  Treść bierze się z TEGO SAMEGO pliku co popup w panelu (src/data/patchNotes.js,
  generowany z docs/marketing/patch-notes.md), więc asercje liczą wpisy z importu,
  nigdy na sztywno — plik rośnie z każdym wydaniem (wzorzec help-center.spec).
*/

async function dismissCookies(page) {
  const btn = page.getByRole('button', { name: 'Tylko niezbędne' });
  if (await btn.isVisible().catch(() => false)) await btn.click();
}

test('Co nowego: komplet wpisów z patch notes, od najnowszego, z rokiem w dacie', async ({ page }) => {
  await page.goto('/co-nowego');
  await dismissCookies(page);

  await expect(page.getByRole('heading', { level: 1, name: /co nowego/i })).toBeVisible();
  const wpisy = page.locator('.wpb-pn');
  await expect(wpisy).toHaveCount(PATCH_NOTES.length);
  await expect(wpisy.first()).toContainText(PATCH_NOTES[0].title);
  await expect(wpisy.first()).toContainText(PATCH_NOTES[0].items[0]);
  // data publiczna zawsze z rokiem — czytelnik z zewnątrz nie zna kontekstu
  await expect(wpisy.first().locator('.wpb-meta')).toContainText(PATCH_NOTES[0].date.slice(0, 4));
  // pogrubienia markdownu nie mają prawa renderować się dosłownie (lekcja /pomoc)
  await expect(page.locator('main')).not.toContainText('**');
});

test('Co nowego: adres kanoniczny i brak noindex', async ({ page }) => {
  await page.goto('/co-nowego');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://wynajempro.com/co-nowego');
  await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
});

test('Wejście z landingu: stopka prowadzi do „Co nowego"', async ({ page }) => {
  await page.goto('/');
  await dismissCookies(page);

  // stopka ma dwa wejścia (kolumna „Zasoby" i linia dat z ostatnią zmianą) — klikamy pierwsze
  const link = page.locator('.wp4-footer a[href="/co-nowego"]').first();
  await link.scrollIntoViewIfNeeded();
  await link.click();
  await expect(page).toHaveURL(/\/co-nowego$/);
  await expect(page.getByRole('heading', { level: 1, name: /co nowego/i })).toBeVisible();
});
