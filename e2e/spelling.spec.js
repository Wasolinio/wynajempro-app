import { test, expect } from '@playwright/test';

test('Landing Page has spelling corrections', async ({ page }) => {
  await page.goto('/');

  // Verify 'przewodniki' is used instead of 'przewidniki'.
  // .first() bo od 2026-08-21 słowo pada dwa razy (lead w hero + lista w cenniku),
  // a luźny lokalizator wywracał się na trybie strict. Test pilnuje pisowni,
  // nie liczby wystąpień — zawężenie nie osłabia asercji.
  await expect(page.locator('text=przewodniki').first()).toBeVisible();
  
  // Verify 'liczby rezerwacji' is used instead of 'ilości rezerwacji'
  await expect(page.locator('text=niezależnie od liczby rezerwacji')).toBeVisible();

  // Verify 'Nielimitowana liczba…' is used instead of 'Nielimitowana ilość…' (treść po reorganizacji fb8a00e)
  await expect(page.locator('text=Nielimitowana liczba obiektów i rezerwacji')).toBeVisible();
});

test('Privacy Page has spelling corrections', async ({ page }) => {
  await page.goto('/prywatnosc');

  // Verify 'wyłącznie' is used instead of 'wyłacznie'
  await expect(page.locator('text=wyłącznie w minimalnym')).toBeVisible();
});

test('Contact Page has spelling corrections', async ({ page }) => {
  await page.goto('/kontakt');

  // Verify 'w ciągu' is used instead of 'w przeciągu' (treść po reorganizacji fb8a00e)
  await expect(page.locator('text=w ciągu 24–48 godzin roboczych')).toBeVisible();
});

test('Terms Page has spelling corrections', async ({ page }) => {
  await page.goto('/regulamin');

  // Verify 'Niewykorzystywania' is used instead of 'Nie wykorzystywania'
  await expect(page.locator('text=Niewykorzystywania Aplikacji')).toBeVisible();

  // Verify 'bez przerwy' is used instead of 'bezprzerwanie'
  await expect(page.locator('text=działała bez przerwy')).toBeVisible();
});
