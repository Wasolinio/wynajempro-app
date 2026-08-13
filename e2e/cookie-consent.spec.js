import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock.js';

/*
  N6.1 — wycofanie zgody na cookies (RODO art. 7 ust. 3).
  Efekty obserwowalne (GA zamockowane w firebase-mock.js):
    - localStorage('cookie_consent') zdejmowany przy wycofaniu / ustawiany przy zgodzie,
    - flaga opt-out gtag.js `window['ga-disable-<measurementId>']` ustawiana na true,
    - baner znów widoczny po otwarciu z linku „Ustawienia cookies" (stopka / Polityka),
    - symetria: użytkownik może ponownie wyrazić zgodę.
*/

const gaDisabled = () =>
  Object.keys(window).some((k) => k.startsWith('ga-disable-') && window[k] === true);

test('Wycofanie i ponowne udzielenie zgody ze stopki landingu', async ({ page }) => {
  // Start z udzieloną zgodą — baner nie pokazuje się sam.
  await setupFirebaseMocks(page, { consentCookies: true });
  await page.goto('/');

  await expect(page.locator('.wpc-bar')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('cookie_consent'))).toBe('true');

  // Otwórz panel z linku w stopce („równie łatwo jak udzielenie").
  await page.getByRole('button', { name: 'Ustawienia cookies' }).click();
  await expect(page.locator('.wpc-bar')).toBeVisible();
  await expect(page.locator('.wpc-status')).toContainText('zgoda na cookies analityczne udzielona');

  // Wycofaj zgodę.
  await page.getByRole('button', { name: 'Wycofaj zgodę' }).click();
  await expect(page.locator('.wpc-bar')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('cookie_consent'))).toBeNull();
  expect(await page.evaluate(gaDisabled)).toBe(true);

  // Ponownie otwórz — status „brak zgody", opcja „Tylko niezbędne".
  await page.getByRole('button', { name: 'Ustawienia cookies' }).click();
  await expect(page.locator('.wpc-status')).toContainText('tylko niezbędne cookies');
  await expect(page.getByRole('button', { name: 'Tylko niezbędne' })).toBeVisible();

  // Symetria — ponowna zgoda.
  await page.getByRole('button', { name: 'Akceptuję' }).click();
  await expect(page.locator('.wpc-bar')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('cookie_consent'))).toBe('true');
  expect(await page.evaluate(gaDisabled)).toBe(false);
});

test('Wejście z Polityki Prywatności otwiera panel wycofania', async ({ page }) => {
  await setupFirebaseMocks(page, { consentCookies: true });
  await page.goto('/prywatnosc');

  await page.getByRole('button', { name: 'Zmień lub wycofaj zgodę na cookies' }).click();
  const bar = page.locator('.wpc-bar');
  await expect(bar).toBeVisible();

  await bar.getByRole('button', { name: 'Wycofaj zgodę', exact: true }).click();
  await expect(page.locator('.wpc-bar')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('cookie_consent'))).toBeNull();
  expect(await page.evaluate(gaDisabled)).toBe(true);
});

/*
  Strony gościa (/guide/:id, /opinie/:id) renderują baner globalnie (App.jsx), więc gość
  może tam zgodę WYRAZIĆ — musi też móc ją stamtąd wycofać. Wejście „Ustawienia cookies"
  siedzi przy kredycie „Stworzono za pomocą WynajemPRO".
*/
const guideDoc = {
  ownerId: 'owner-uid-cookie',
  name: 'Informator — Domek Leśny',
  propertyId: 'Domek Leśny',
  hasSensitiveData: false,
  checkInInfo: 'Klucze odbierz w recepcji.',
  houseRules: 'Prosimy o utrzymanie porządku.',
  attractions: [],
};

const reviewDoc = {
  type: 'review',
  ownerId: 'owner-uid-cookie',
  title: 'Dziękujemy za pobyt',
  message: 'Będziemy wdzięczni za kilka słów opinii.',
  links: [{ label: 'Google', url: 'https://g.page/r/testxyz' }],
};

for (const [nazwa, path, dbData] of [
  ['przewodnik gościa', '/guide/guide_cookie_test', { 'guides/guide_cookie_test': guideDoc }],
  ['strona opinii', '/opinie/review_cookie_test', { 'guides/review_cookie_test': reviewDoc }],
]) {
  test(`Strona gościa (${nazwa}): wejście przy kredycie otwiera panel i wycofuje zgodę`, async ({ page }) => {
    // Gość ze zgodą udzieloną wcześniej — baner nie pokazuje się sam.
    await setupFirebaseMocks(page, { consentCookies: true, dbData });
    await page.goto(path);

    await expect(page.getByText('Stworzono za pomocą WynajemPRO')).toBeVisible();
    await expect(page.locator('.wpc-bar')).toHaveCount(0);

    await page.getByRole('button', { name: 'Ustawienia cookies' }).click();
    const bar = page.locator('.wpc-bar');
    await expect(bar).toBeVisible();
    await expect(page.locator('.wpc-status')).toContainText('zgoda na cookies analityczne udzielona');

    await bar.getByRole('button', { name: 'Wycofaj zgodę', exact: true }).click();
    await expect(page.locator('.wpc-bar')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('cookie_consent'))).toBeNull();
    expect(await page.evaluate(gaDisabled)).toBe(true);
  });
}

/*
  Ekran błędu obu widoków gościa (wygasły/nieistniejący link) renderuje panel BEZ kredytu,
  a baner zgody działa tam tak samo — bez osobnego wejścia gość, który kliknie „Akceptuję"
  na ślepej uliczce, nie ma jak zgody wycofać. Dlatego samo „Ustawienia cookies", bez kredytu.
*/
for (const [nazwa, path, naglowek] of [
  ['przewodnik gościa', '/guide/nie_istnieje_cookie', 'Brak dostępu'],
  ['strona opinii', '/opinie/nie_istnieje_cookie', 'Nie znaleziono strony'],
]) {
  test(`Ekran błędu (${nazwa}): wycofanie zgody możliwe mimo braku treści`, async ({ page }) => {
    // Pusta baza → getDoc.exists() === false → gałąź błędu widoku.
    await setupFirebaseMocks(page, { consentCookies: true, dbData: {} });
    await page.goto(path);

    await expect(page.getByRole('heading', { name: naglowek })).toBeVisible();
    await expect(page.getByText('Stworzono za pomocą WynajemPRO')).toHaveCount(0);

    await page.getByRole('button', { name: 'Ustawienia cookies' }).click();
    const bar = page.locator('.wpc-bar');
    await expect(bar).toBeVisible();

    await bar.getByRole('button', { name: 'Wycofaj zgodę', exact: true }).click();
    await expect(page.locator('.wpc-bar')).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('cookie_consent'))).toBeNull();
    expect(await page.evaluate(gaDisabled)).toBe(true);
  });
}

test('Pierwsza wizyta: baner sam się pokazuje, zgoda ustawia flagę', async ({ page }) => {
  // Brak zapisanej decyzji — baner opt-in widoczny od razu.
  await setupFirebaseMocks(page, { consentCookies: false });
  await page.goto('/');

  await expect(page.locator('.wpc-bar')).toBeVisible();
  await expect(page.locator('.wpc-status')).toContainText('tylko niezbędne cookies');

  await page.getByRole('button', { name: 'Akceptuję' }).click();
  await expect(page.locator('.wpc-bar')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('cookie_consent'))).toBe('true');
});
