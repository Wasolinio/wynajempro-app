import { test, expect } from '@playwright/test';

/*
  Interaktywne demo panelu na landingu (X2) — sekcja #panel.
  Kroki po lewej, przyklejony mockup po prawej; klik/scroll przełącza widoki.
*/

// baner cookie zasłania zrzuty i środek viewportu — zamykamy najoszczędniejszą opcją
async function dismissCookies(page) {
  const btn = page.getByRole('button', { name: 'Tylko niezbędne' });
  if (await btn.isVisible().catch(() => false)) await btn.click();
}

test('Demo panelu: kroki i mockup renderują się, start od Pulpitu (X2)', async ({ page }, testInfo) => {
  await page.goto('/');
  await dismissCookies(page);
  // pierwszy krok w środku viewportu → observer wskazuje Pulpit
  await page.locator('.wp4-demo__steps li[data-step="0"]').evaluate((el) => {
    el.scrollIntoView({ block: 'center' });
  });

  await expect(page.locator('.wp4-demo__step')).toHaveCount(4);
  await expect(page.locator('.wp4-demo__window')).toBeVisible();
  await expect(page.locator('.wp4-demo__views')).toHaveAttribute('data-view', 'pulpit');
  await expect(page.locator('.wp4-fig', { hasText: 'RYS. 2' })).toContainText('pulpit');

  // klatka viewportu (element-screenshot sam scrolluje i odpala observer w pół przejścia)
  await page.waitForTimeout(350);
  await page.screenshot({ path: testInfo.outputPath('demo-desktop.png') });
});

test('Klik w krok przełącza widok mockupu (Finanse)', async ({ page }, testInfo) => {
  await page.goto('/');
  await dismissCookies(page);
  // krok Finanse w środku viewportu — observer i klik wskazują ten sam widok,
  // więc późniejszy zrzut niczego nie przestawi
  await page.locator('.wp4-demo__steps li[data-step="2"]').evaluate((el) => {
    el.scrollIntoView({ block: 'center' });
  });

  await page.locator('.wp4-demo__step', { hasText: 'Zysk netto' }).click();
  await expect(page.locator('.wp4-demo__views')).toHaveAttribute('data-view', 'finance');
  await expect(page.locator('.wp4-demo__view[data-active]')).toContainText('8 940 zł');
  await expect(page.locator('.wp4-fig', { hasText: 'RYS. 2' })).toContainText('finanse');

  await page.waitForTimeout(350);
  await page.screenshot({ path: testInfo.outputPath('demo-finance.png') });
});

test('Scroll do ostatniego kroku przełącza na przewodnik gościa', async ({ page }) => {
  await page.goto('/');
  await dismissCookies(page);
  await page.locator('#panel').scrollIntoViewIfNeeded();

  // dojedź środkiem viewportu do ostatniego kroku (IntersectionObserver, pas -42%)
  await page.locator('.wp4-demo__steps li[data-step="3"]').evaluate((el) => {
    el.scrollIntoView({ block: 'center' });
  });
  await expect(page.locator('.wp4-demo__views')).toHaveAttribute('data-view', 'guide', { timeout: 5000 });
  await expect(page.locator('.wp4-demo__view[data-active]')).toContainText('Kod do drzwi');
});

test('Mobile: mockup nad krokami, nawigacja pozioma (375px)', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await dismissCookies(page);
  await page.locator('#panel').scrollIntoViewIfNeeded();

  await expect(page.locator('.wp4-demo__window')).toBeVisible();
  await page.locator('.wp4-demo__step', { hasText: 'Wi-Fi i kod do drzwi' }).click();
  await expect(page.locator('.wp4-demo__views')).toHaveAttribute('data-view', 'guide');

  // mockup jest sticky na górze — wycentruj go i zrób klatkę viewportu
  await page.locator('.wp4-demo__stage').scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);
  await page.screenshot({ path: testInfo.outputPath('demo-mobile.png') });
});
