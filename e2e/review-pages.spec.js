import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock';

/*
  X13 — „przewodnik opinii": publiczna strona /opinie/{id} + edytor w panelu (nawigacja 09).
  Strony opinii żyją w kolekcji `guides` z polem type:'review' (reużycie reguł publicznego
  odczytu). Suita pisana pod v2, na wspólnych mockach firebase-mock.js.
*/

const mockUser = { uid: 'uid-test', email: 'test@example.com', displayName: 'Test User', emailVerified: true };

// hostProfile wymagany, żeby ManagerApp nie pokazał CompleteProfileScreen (por. panel-v2.spec)
const activeDb = {
  'users/uid-test': { accountStatus: 'active', name: 'Test User', email: 'test@example.com' },
  'users/uid-test/settings/hostProfile': {
    entityName: 'Test Company', identifierType: 'NIP', taxIdentifier: '1234567890',
    address: 'ul. Testowa 1', phone: '123456789', email: 'test@example.com',
  },
  'users/uid-test/settings/properties': { items: [{ name: 'Domek Leśny', color: 'blue', id: 'prop-1', secretToken: 'token1' }] },
  'users/uid-test/settings/sources': { items: ['Booking.com'] },
  'users/uid-test/settings/categories': { items: ['Wynajem'] },
};

const reviewDoc = {
  type: 'review',
  ownerId: 'uid-test',
  property: 'Domek Leśny',
  title: 'Dziękujemy za pobyt',
  message: 'Będziemy wdzięczni za kilka słów opinii.',
  links: [
    { label: 'Google', url: 'https://g.page/r/testxyz' },
    { label: 'Booking.com', url: 'https://www.booking.com/hotel/pl/domek.html' },
  ],
};

test('Publiczna strona opinii renderuje podziękowanie i łącza (bez logowania)', async ({ page }) => {
  await setupFirebaseMocks(page, { dbData: { 'guides/review_test1': reviewDoc } });
  await page.goto('/opinie/review_test1');

  await expect(page.getByText('Dziękujemy za pobyt')).toBeVisible();
  await expect(page.getByText('Będziemy wdzięczni za kilka słów opinii.')).toBeVisible();

  const google = page.getByRole('link', { name: /Google/ });
  await expect(google).toBeVisible();
  await expect(google).toHaveAttribute('href', 'https://g.page/r/testxyz');
  await expect(google).toHaveAttribute('target', '_blank');
  await expect(page.getByRole('link', { name: /Booking\.com/ })).toBeVisible();
});

test('Nieistniejąca strona opinii pokazuje czytelny błąd', async ({ page }) => {
  await setupFirebaseMocks(page, { dbData: {} });
  await page.goto('/opinie/nie-ma-takiej-strony');
  await expect(page.getByText('Nie znaleziono strony')).toBeVisible();
});

test('Zwykły przewodnik nie otwiera się jako strona opinii (rozdzielenie typów)', async ({ page }) => {
  await setupFirebaseMocks(page, {
    dbData: { 'guides/guide_zwykly': { ownerId: 'uid-test', name: 'Informator — Domek' } },
  });
  await page.goto('/opinie/guide_zwykly');
  await expect(page.getByText('Nie znaleziono strony')).toBeVisible();
});

test('Panel: nawigacja 09 „Opinie" pokazuje listę; Przewodniki nie widzą stron opinii', async ({ page }) => {
  await setupFirebaseMocks(page, {
    user: mockUser,
    dbData: {
      ...activeDb,
      'guides/review_test1': reviewDoc,
      'guides/guide_test1': { ownerId: 'uid-test', name: 'Informator — Domek Leśny', propertyId: 'Domek Leśny', attractions: [] },
    },
  });
  await page.goto('/dashboard');

  // 09 Opinie → lista z istniejącą stroną i jej publicznym linkiem
  await page.locator('.wpd-nav__item', { hasText: 'Opinie' }).click();
  await expect(page.locator('.wpd-top__title h1')).toHaveText('Opinie');
  await expect(page.getByText('/opinie/review_test1')).toBeVisible();

  // 07 Przewodniki → widzi przewodnik, NIE widzi strony opinii (filtr type)
  await page.locator('.wpd-nav__item', { hasText: 'Przewodniki' }).click();
  await expect(page.getByText('Informator — Domek Leśny')).toBeVisible();
  await expect(page.getByText('review_test1')).toBeHidden();
});

test('Panel: nowa strona opinii startuje z szablonem podziękowania', async ({ page }) => {
  await setupFirebaseMocks(page, { user: mockUser, dbData: activeDb });
  await page.goto('/dashboard');

  await page.locator('.wpd-nav__item', { hasText: 'Opinie' }).click();
  await page.getByRole('button', { name: 'Nowa strona' }).first().click();

  await expect(page.getByText('Nowa strona opinii')).toBeVisible();
  // domyślna treść nieinwazyjnego podziękowania w textarea
  await expect(page.locator('textarea.wpd-textarea')).toHaveValue(/kilka słów opinii/);
  // publiczny link i QR widoczne od razu
  await expect(page.getByText(/\/opinie\/review_/)).toBeVisible();
  await expect(page.getByRole('button', { name: /Kopiuj link/ })).toBeVisible();
});
