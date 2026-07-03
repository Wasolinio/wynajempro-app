import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock';

/*
  Minimalny smoke ZALOGOWANEGO panelu v2 — zalążek suity pod X10 (roadmapa).
  Kontekst: testy ui-scaling celują w aplikację sprzed przepisania na v2
  (selektory Tailwinda, stare teksty) i nie weryfikują obecnego panelu.
  Ten spec wchodzi za paywall (konto `active` na mockach jak w stripe.spec)
  i sprawdza fundament + dostępność z partii 2 audytu UI (2026-07-03).
*/

const mockUser = { uid: 'uid-test', email: 'test@example.com', displayName: 'Test User', emailVerified: true };
// hostProfile jest niezbędny — bez entityName ManagerApp pokazuje CompleteProfileScreen zamiast panelu
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

test('Panel v2 renderuje się dla aktywnego konta (sidebar + widok)', async ({ page }) => {
  await setupFirebaseMocks(page, { user: mockUser, dbData: activeDb });
  await page.goto('/dashboard');

  await expect(page.locator('.wpd-side')).toBeVisible();
  await expect(page.locator('.wpd-nav__item').first()).toBeVisible();
  await expect(page.locator('.wpd-top__title h1')).toBeVisible();
});

test('Modal ustawień: semantyka dialogu i zamykanie Escape (audyt poz. 12)', async ({ page }) => {
  await setupFirebaseMocks(page, { user: mockUser, dbData: activeDb });
  await page.goto('/dashboard');

  await page.locator('button[title="Ustawienia"]').click();
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('Karta pulpitu aktywowana z klawiatury otwiera raport (audyt poz. 6)', async ({ page }) => {
  await setupFirebaseMocks(page, { user: mockUser, dbData: activeDb });
  await page.goto('/dashboard');

  const card = page.locator('.wpd-stat[role="button"]').first();
  await expect(card).toBeVisible();
  await card.focus();
  await page.keyboard.press('Enter');

  await expect(page.locator('[role="dialog"]')).toBeVisible();
});
