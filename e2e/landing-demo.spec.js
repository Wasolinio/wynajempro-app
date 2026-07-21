import { test, expect } from '@playwright/test';

/*
  Apple-scroll demo panelu na landingu (X2 v2) — sekcja #panel (.wp4-sd).
  Desktop: sticky 520vh, indeks sterowany scrollem + klikalne kropki szyny.
  Mobile (≤860px): sticky wyłączony, kroki klikalne przełączają widok.
  Import projektu: „Wynajem Landing Scroll.dc.html" (Claude Design).
*/

async function dismissCookies(page) {
  const btn = page.getByRole('button', { name: 'Tylko niezbędne' });
  if (await btn.isVisible().catch(() => false)) await btn.click();
}

// kontener #panel to 520vh — ustaw jego GÓRĘ na górze viewportu (progress 0 → Pulpit)
async function scrollToPanelTop(page) {
  await page.evaluate(() => {
    const el = document.getElementById('panel');
    window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top + 4, behavior: 'instant' });
  });
}

test('Demo: mockup + 5 pozycji nawigacji, start od Pulpitu (X2 v2)', async ({ page }, testInfo) => {
  await page.goto('/');
  await dismissCookies(page);
  await scrollToPanelTop(page);

  await expect(page.locator('.wp4-sd [role="img"]')).toBeVisible();
  await expect(page.locator('.wp4-sd [role="img"]')).toHaveAttribute('data-view', 'pulpit');
  // 5 kropek szyny (desktop) + 5 pozycji sidebara mockupu
  await expect(page.locator('.wp4-sd button[aria-label^="Przejdź do"]')).toHaveCount(5);

  await page.waitForTimeout(300);
  await page.screenshot({ path: testInfo.outputPath('scroll-desktop.png') });
});

test('Scroll przez sekcję przełącza widoki (Pulpit → Finanse)', async ({ page }, testInfo) => {
  await page.goto('/');
  await dismissCookies(page);
  await scrollToPanelTop(page);

  // wejście w sekcję: pierwszy widok
  await expect(page.locator('.wp4-sd [role="img"]')).toHaveAttribute('data-view', 'pulpit');

  // przewiń do ~90% wysokości kontenera → ostatni etap (Finanse)
  await page.evaluate(() => {
    const el = document.getElementById('panel');
    const rect = el.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    window.scrollTo({ top: window.scrollY + rect.top + total * 0.92, behavior: 'instant' });
  });
  await expect(page.locator('.wp4-sd [role="img"]')).toHaveAttribute('data-view', 'finanse', { timeout: 4000 });
  await expect(page.locator('.wp4-sd [role="img"]')).toContainText('Zysk netto');

  await page.waitForTimeout(300);
  await page.screenshot({ path: testInfo.outputPath('scroll-finance.png') });
});

test('Klik w kropkę szyny przewija do etapu (Rezerwacja)', async ({ page }) => {
  await page.goto('/');
  await dismissCookies(page);
  await page.locator('#panel').scrollIntoViewIfNeeded();

  await page.locator('.wp4-sd button[aria-label="Przejdź do: Rezerwacja #A-2048"]').click();
  await expect(page.locator('.wp4-sd [role="img"]')).toHaveAttribute('data-view', 'rezerwacje', { timeout: 4000 });
  await expect(page.locator('.wp4-sd [role="img"]')).toContainText('Do wypłaty');
});

test('Mobile: kroki klikalne przełączają widok mockupu (375px)', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await dismissCookies(page);
  await page.locator('#panel').scrollIntoViewIfNeeded();

  await expect(page.locator('.wp4-sd [role="img"]')).toBeVisible();
  // krok „Finanse" jako przycisk
  await page.locator('.wp4-sd button', { hasText: 'złotówki' }).click();
  await expect(page.locator('.wp4-sd [role="img"]')).toHaveAttribute('data-view', 'finanse');

  await page.locator('#panel').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: testInfo.outputPath('scroll-mobile.png') });
});
