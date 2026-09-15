import { test, expect } from '@playwright/test';
import { DEMO_KROKI } from '../src/data/landingDemo.js';

/*
  Apple-scroll demo panelu na landingu (X2 v3, 2026-09-03) — sekcja #panel (.wp4-sd).
  Desktop: sticky 520vh, indeks sterowany scrollem + klikalne kropki szyny.
  Mobile (≤860px): sticky wyłączony, kroki klikalne przełączają widok.

  Od 2026-09-03 ekrany to ZRZUTY prawdziwego panelu (generator scripts/zrzuty/,
  src/assets/landing/panel-<key>.webp), nie makiety HTML — dlatego asercje sprawdzają
  aktywny <img> (data-active) i jego src, a nie tekst wewnątrz okna. Kroki i ich
  tytuły bierzemy z src/data/landingDemo.js, nigdy na sztywno.
*/

async function dismissCookies(page) {
  const btn = page.getByRole('button', { name: 'Tylko niezbędne' });
  if (await btn.isVisible().catch(() => false)) await btn.click();
}

// kontener #panel to 520vh — ustaw jego GÓRĘ na górze viewportu (progress 0 → pierwszy krok).
// Najpierw czekamy na element: landing to leniwy chunk i goto() wraca, zanim się zamontuje
// (wyścig złapany 2026-09-03 — getElementById zwracał null).
async function scrollToPanelTop(page) {
  await page.locator('#panel').waitFor();
  await page.evaluate(() => {
    const el = document.getElementById('panel');
    window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top + 4, behavior: 'instant' });
  });
}

const okno = (page) => page.locator('.wp4-sd [role="img"]');
const aktywny = (page) => page.locator('.wp4-sd [role="img"] img[data-active="true"]');

test('Demo: zrzuty panelu, tyle kropek szyny, ile kroków, start od pierwszego', async ({ page }, testInfo) => {
  await page.goto('/');
  await dismissCookies(page);
  await scrollToPanelTop(page);

  await expect(okno(page)).toBeVisible();
  await expect(okno(page)).toHaveAttribute('data-view', DEMO_KROKI[0].key);
  await expect(page.locator('.wp4-sd button[aria-label^="Przejdź do"]')).toHaveCount(DEMO_KROKI.length);
  // każdy krok ma swój zrzut w oknie; aktywny jest dokładnie jeden i pokazuje właściwy plik
  await expect(okno(page).locator('img')).toHaveCount(DEMO_KROKI.length);
  await expect(aktywny(page)).toHaveCount(1);
  await expect(aktywny(page)).toHaveAttribute('src', new RegExp(`panel-${DEMO_KROKI[0].key}`));
  // obraz naprawdę się załadował (nie 404 z podmienionej ścieżki assetu)
  await expect.poll(() => aktywny(page).evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);

  await page.waitForTimeout(300);
  await page.screenshot({ path: testInfo.outputPath('scroll-desktop.png') });
});

test('Uczciwe oznaczenie: podpis „dane przykładowe", adres produktu, zero cieni', async ({ page }) => {
  await page.goto('/');
  await dismissCookies(page);
  await scrollToPanelTop(page);

  await expect(page.locator('.wp4-sd__caption')).toContainText('przykładowe');
  await expect(okno(page)).toContainText('wynajempro.com/dashboard');
  await expect(okno(page)).toContainText('dane przykładowe');
  // identyfikacja v2: zero cieni — okno z projektu Claude Design miało box-shadow
  const cien = await okno(page).evaluate((el) => getComputedStyle(el).boxShadow);
  expect(cien).toBe('none');
});

test('Scroll przez sekcję przełącza widoki (pierwszy → ostatni)', async ({ page }, testInfo) => {
  await page.goto('/');
  await dismissCookies(page);
  await scrollToPanelTop(page);

  await expect(okno(page)).toHaveAttribute('data-view', DEMO_KROKI[0].key);

  // przewiń do ~90% wysokości kontenera → ostatni krok
  await page.evaluate(() => {
    const el = document.getElementById('panel');
    const rect = el.getBoundingClientRect();
    const total = rect.height - window.innerHeight;
    window.scrollTo({ top: window.scrollY + rect.top + total * 0.92, behavior: 'instant' });
  });
  const ostatni = DEMO_KROKI[DEMO_KROKI.length - 1];
  await expect(okno(page)).toHaveAttribute('data-view', ostatni.key, { timeout: 4000 });
  await expect(aktywny(page)).toHaveAttribute('src', new RegExp(`panel-${ostatni.key}`));

  await page.waitForTimeout(300);
  await page.screenshot({ path: testInfo.outputPath('scroll-last.png') });
});

test('Klik w kropkę szyny przewija do kroku', async ({ page }) => {
  await page.goto('/');
  await dismissCookies(page);
  await page.locator('#panel').scrollIntoViewIfNeeded();

  const krok = DEMO_KROKI[2];
  await page.locator(`.wp4-sd button[aria-label="Przejdź do: ${krok.label}"]`).click();
  await expect(okno(page)).toHaveAttribute('data-view', krok.key, { timeout: 4000 });
  await expect(aktywny(page)).toHaveAttribute('src', new RegExp(`panel-${krok.key}`));
});

test('Mobile: kroki klikalne przełączają widok (375px)', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await dismissCookies(page);
  await page.locator('#panel').scrollIntoViewIfNeeded();

  await expect(okno(page)).toBeVisible();
  const ostatni = DEMO_KROKI[DEMO_KROKI.length - 1];
  await page.locator('.wp4-sd button', { hasText: ostatni.title }).click();
  await expect(okno(page)).toHaveAttribute('data-view', ostatni.key);

  await page.locator('#panel').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await page.screenshot({ path: testInfo.outputPath('scroll-mobile.png') });
});
