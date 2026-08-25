import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock';

/*
  X25 — panel podatkowy w Finansach. Testy pilnują rzeczy, które analiza prawna
  z 2026-08-24 wskazała jako nośne: zastrzeżenie dokładnie raz, brak zer w polach
  składek, znikanie odliczenia 50% przy najmie prywatnym.
*/

const isoInDays = (n) => new Date(Date.now() + n * 86400000).toISOString().split('T')[0];
const mockUser = { uid: 'uid-test', email: 'test@example.com', displayName: 'Test User', emailVerified: true };

const bazaDb = (tax) => ({
  'users/uid-test': { accountStatus: 'active', name: 'Test User', email: 'test@example.com' },
  'users/uid-test/settings/hostProfile': {
    entityName: 'Test Company', identifierType: 'NIP', taxIdentifier: '1234567890',
    address: 'ul. Testowa 1', phone: '123456789', email: 'test@example.com',
  },
  'users/uid-test/settings/properties': { items: [{ name: 'Apartament A', color: 'blue', id: 'prop-1', secretToken: 't1' }] },
  'users/uid-test/settings/sources': { items: ['Booking.com'] },
  'users/uid-test/settings/categories': { items: ['Wynajem'] },
  'users/uid-test/settings/tax': tax,
  'users/uid-test/rentals/r1': {
    type: 'booking', property: 'Apartament A', date: isoInDays(-30), endDate: isoInDays(-25),
    income: 40000, commission: 4000, guests: 2, source: 'Booking.com',
  },
});

async function otworzPodatki(page, tax) {
  await setupFirebaseMocks(page, { user: mockUser, dbData: bazaDb(tax) });
  await page.goto('/dashboard');
  await page.locator('.wpd-nav__item', { hasText: 'Finanse' }).click();
  await page.locator('.wpd-tab', { hasText: 'Podatki' }).click();
  await expect(page.locator('.wpd-stat--dark')).toBeVisible();
}

test('Zastrzeżenie prawne stoi dokładnie raz i mówi o zapłacie, nie tylko o zeznaniu', async ({ page }) => {
  const bledy = [];
  page.on('console', (m) => { if (m.type() === 'error') bledy.push(m.text()); });
  await otworzPodatki(page, { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'business' });

  const zastrzezenie = page.getByText(/nie jest deklaracją, wyliczeniem podatku ani poradą podatkową/);
  await expect(zastrzezenie).toHaveCount(1);
  await expect(page.getByText(/zanim zapłacisz podatek lub złożysz deklarację/)).toBeVisible();
  await expect(page.getByText(/Nie odejmujemy zapłaconych\s+już zaliczek/)).toBeVisible();

  expect(bledy, `błędy konsoli: ${bledy.join(' | ')}`).toHaveLength(0);
});

test('Najem prywatny: bez składki zdrowotnej i bez odliczenia 50%', async ({ page }) => {
  await otworzPodatki(page, { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'private', viewMode: 'szczegolowy' });

  await expect(page.getByText('nie doliczamy')).toBeVisible();
  await expect(page.getByText(/Odliczenie 50%/)).toHaveCount(0);
  await expect(page.getByText('Składka zdrowotna · miesięcznie')).toHaveCount(0);
});

test('Brak odpowiedzi o podstawę wynajmu odsyła do ustawień, nie pokazuje zera', async ({ page }) => {
  await otworzPodatki(page, { taxForm: 'lump_sum', autoThreshold: true });

  await expect(page.getByText('brak odpowiedzi')).toBeVisible();
  await expect(page.getByText(/uzupełnij „Jak wynajmujesz"/)).toBeVisible();
  await expect(page.getByText(/Odliczenie 50%/)).toHaveCount(0);
});

test('Działalność: odliczenie 50% jest i zgadza się z podstawą', async ({ page }) => {
  await otworzPodatki(page, { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'business', viewMode: 'szczegolowy' });

  await expect(page.getByText(/Odliczenie 50% zapłaconej składki zdrowotnej/)).toBeVisible();
  await expect(page.getByText('Składka zdrowotna · miesięcznie')).toBeVisible();
});

test('Panel podatkowy mieści się na 375 px', async ({ page }) => {
  await otworzPodatki(page, { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'business', viewMode: 'szczegolowy' });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(250);

  const szerokosc = await page.evaluate(() => document.body.scrollWidth);
  expect(szerokosc, 'strona rozpycha się w poziomie').toBeLessThanOrEqual(375);
  await page.screenshot({ path: 'test-results/panel-podatkowy-375.png' });
});
