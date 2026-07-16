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

test('Konto: profil i subskrypcja otwierają się z imienia gospodarza (X6)', async ({ page }) => {
  await setupFirebaseMocks(page, { user: mockUser, dbData: activeDb });
  await page.goto('/dashboard');

  await page.locator('.wpd-user__btn').click();
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('Twoje konto')).toBeVisible();

  // profil zaczytany z hostProfile (seed przy otwarciu)
  await expect(dialog.locator('input.wpd-input').first()).toHaveValue('Test Company');

  // zakładka subskrypcji pokazuje status i cenę
  await dialog.getByRole('button', { name: 'Subskrypcja' }).click();
  await expect(dialog.getByText('29,99')).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('Mobile: dolny pasek zastępuje sidebar, arkusz „Więcej" działa (X12)', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await setupFirebaseMocks(page, { user: mockUser, dbData: activeDb });
  await page.goto('/dashboard');

  await expect(page.locator('.wpd-bottombar')).toBeVisible();
  await expect(page.locator('.wpd-side')).toBeHidden();

  // przełączenie widoku z paska
  await page.locator('.wpd-bottombar__item', { hasText: 'Kalendarz' }).click();
  await expect(page.locator('.wpd-cal__head')).toBeVisible();

  // arkusz „Więcej": pozycje spoza paska + wylogowanie; Escape zamyka
  await page.locator('.wpd-bottombar__item', { hasText: 'Więcej' }).click();
  const sheet = page.locator('.wpd-sheet');
  await expect(sheet).toBeVisible();
  // Przewodniki jest poza paskiem mobilnym (MOBILE_BAR), więc żyje w arkuszu „Więcej".
  // (Analityka wchłonięta przez Finanse w X4 — dawniej sprawdzano tu jej obecność.)
  await expect(sheet.locator('text=Przewodniki')).toBeVisible();
  await expect(sheet.locator('text=Wyloguj')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
});

test('Dodanie rezerwacji zapisuje czysty dokument — bez sentineli i pustych kwot (fix N3)', async ({ page }) => {
  await setupFirebaseMocks(page, { user: mockUser, dbData: activeDb });
  await page.goto('/dashboard');

  // „+ Rezerwacja" w nagłówku panelu
  await page.locator('.wpd-top .wpd-btn--primary').click();
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible();

  // minimalny komplet: property/source/date są prefillowane; uzupełniamy resztę wymaganych
  await dialog.getByPlaceholder('np. Jan Kowalski').fill('Tester E2E');
  await dialog.locator('input[type="date"]').nth(1).fill('2026-08-15'); // wyjazd
  await dialog.getByPlaceholder('np. 2').fill('3'); // liczba gości (X14)
  await dialog.getByPlaceholder('0,00').first().fill('1200'); // przychód
  await dialog.locator('button[type="submit"]').click();

  await expect(page.getByText('Dodano pomyślnie!')).toBeVisible();

  // Asercja regresyjna (bloker z przeglądu N3): dokument create nie może zawierać
  // sentineli deleteField ({_deleteField:true} w mocku) ani '' w polach liczbowych
  const saved = await page.evaluate(() => {
    const entries = Object.entries(window.__mockDbData || {}).filter(([k]) => k.includes('/rentals/'));
    return entries.length ? entries[entries.length - 1][1] : null;
  });
  expect(saved).toBeTruthy();
  expect(saved.guest).toBe('Tester E2E');
  expect(saved.income).toBe(1200);
  expect(saved.guests).toBe(3); // X14: liczba gości zapisana jako liczba
  for (const k of ['income', 'advancePayment', 'commission', 'tax', 'vat', 'utilities', 'guests']) {
    expect(saved[k] === undefined || typeof saved[k] === 'number').toBe(true);
  }
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
