import { test, expect } from '@playwright/test';
import { helpArticles } from '../src/data/helpArticles.js';
import { setupFirebaseMocks } from './firebase-mock';

/*
  Centrum pomocy (X1) — publiczne trasy /pomoc i /pomoc/:slug.
  Treść jest GENEROWANA z docs/support/*.md (npm run help:build), dlatego spec
  czyta ten sam plik danych: test pilnuje kompletności i renderu, a nie brzmienia,
  które zmienia się przy każdej korekcie artykułu.
*/

async function dismissCookies(page) {
  const btn = page.getByRole('button', { name: 'Tylko niezbędne' });
  if (await btn.isVisible().catch(() => false)) await btn.click();
}

test('Lista: wszystkie artykuły z kafelkiem i linkiem', async ({ page }, testInfo) => {
  await page.goto('/pomoc');
  await dismissCookies(page);

  await expect(page.getByRole('heading', { name: 'Centrum pomocy', level: 1 })).toBeVisible();
  await expect(page.locator('.wpb-post')).toHaveCount(helpArticles.length);

  for (const article of helpArticles) {
    await expect(page.locator(`a[href="/pomoc/${article.slug}"]`)).toBeVisible();
  }

  await page.screenshot({ path: testInfo.outputPath('pomoc-lista.png'), fullPage: true });
});

test('Artykuł: lead, sekcje, FAQ i powrót do listy', async ({ page }) => {
  const article = helpArticles[0];
  await page.goto(`/pomoc/${article.slug}`);
  await dismissCookies(page);

  await expect(page.getByRole('heading', { name: article.title, level: 1 })).toBeVisible();

  // Nagłówki sekcji z markdownu muszą trafić na stronę.
  const headings = article.blocks.filter((b) => b.type === 'h2');
  expect(headings.length).toBeGreaterThan(0);
  for (const h of headings) {
    await expect(page.locator('.wpb-prose h2', { hasText: h.content }).first()).toBeVisible();
  }

  // Każdy artykuł kończy się sekcją pytań — to obietnica z indeksu pomocy.
  const faq = article.blocks.find((b) => b.type === 'faq');
  expect(faq, 'artykuł bez sekcji FAQ').toBeTruthy();
  await expect(page.locator('.wpb-prose h3', { hasText: faq.items[0].q }).first()).toBeVisible();

  await page.locator('.wpb-back').click();
  await expect(page).toHaveURL(/\/pomoc$/);
});

test('Kroki renderują się jako lista numerowana (nie gołe akapity)', async ({ page }) => {
  // Preflight Tailwinda zerował list-style — numeracja instrukcji znikała.
  const withSteps = helpArticles.find((a) => a.blocks.some((b) => b.type === 'steps'));
  expect(withSteps, 'żaden artykuł nie ma kroków').toBeTruthy();

  await page.goto(`/pomoc/${withSteps.slug}`);
  await dismissCookies(page);

  const ol = page.locator('.wpb-prose ol').first();
  await expect(ol).toBeVisible();
  await expect(ol).toHaveCSS('list-style-type', 'decimal');
  await expect(page.locator('.wpb-prose ul').first()).toHaveCSS('list-style-type', 'disc');
});

test('Nieznany slug wraca na listę pomocy', async ({ page }) => {
  await page.goto('/pomoc/nie-ma-takiego-artykulu');
  await dismissCookies(page);
  await expect(page).toHaveURL(/\/pomoc$/);
  await expect(page.getByRole('heading', { name: 'Centrum pomocy', level: 1 })).toBeVisible();
});

test('Wejście z landingu: stopka prowadzi do pomocy', async ({ page }) => {
  await page.goto('/');
  await dismissCookies(page);

  const link = page.locator('.wp4-footer a[href="/pomoc"]');
  await link.scrollIntoViewIfNeeded();
  await link.click();
  await expect(page).toHaveURL(/\/pomoc$/);
});

// Wejście z panelu — celowo w nowej karcie, żeby nie wybijać gospodarza z pracy.
const mockUser = { uid: 'uid-test', email: 'test@example.com', displayName: 'Test User', emailVerified: true };
const activeDb = {
  'users/uid-test': { accountStatus: 'active', name: 'Test User', email: 'test@example.com' },
  'users/uid-test/settings/hostProfile': {
    entityName: 'Test Company', identifierType: 'NIP', taxIdentifier: '1234567890',
    address: 'ul. Testowa 1', phone: '123456789', email: 'test@example.com',
  },
  'users/uid-test/settings/properties': { items: [{ name: 'Apartament A', color: 'blue', id: 'prop-1', secretToken: 'token1' }] },
  'users/uid-test/settings/sources': { items: ['Booking.com'] },
  'users/uid-test/settings/categories': { items: ['Wynajem'] },
};

test('Panel: pomoc dostępna z sidebara i z arkusza „Więcej"', async ({ page }) => {
  await setupFirebaseMocks(page, { user: mockUser, dbData: activeDb });
  await page.goto('/dashboard');

  const sidebarLink = page.locator('.wpd-user a[href="/pomoc"]');
  await expect(sidebarLink).toBeVisible();
  await expect(sidebarLink).toHaveAttribute('target', '_blank');
  await expect(sidebarLink).toHaveAttribute('rel', /noopener/);

  await page.setViewportSize({ width: 375, height: 812 });
  await page.getByRole('button', { name: 'Więcej' }).click();
  await expect(page.locator('.wpd-sheet a[href="/pomoc"]')).toBeVisible();
});

test('Mobile: kafelki i artykuł czytelne na 375px', async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/pomoc');
  await dismissCookies(page);

  await expect(page.locator('.wpb-post')).toHaveCount(helpArticles.length);
  await page.screenshot({ path: testInfo.outputPath('pomoc-mobile.png'), fullPage: true });

  await page.locator(`a[href="/pomoc/${helpArticles[0].slug}"]`).click();
  await expect(page.getByRole('heading', { name: helpArticles[0].title, level: 1 })).toBeVisible();
});
