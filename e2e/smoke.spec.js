import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/WynajemPRO/);
});

test('has logo text', async ({ page }) => {
  await page.goto('/');

  // Verify that the logo text "WynajemPro" is visible in the page.
  await expect(page.locator('text=WynajemPro').first()).toBeVisible();
});
