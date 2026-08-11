import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock';

/*
  Minimalny smoke ZALOGOWANEGO panelu v2 — zalążek suity pod X10 (roadmapa).
  Kontekst: testy ui-scaling celują w aplikację sprzed przepisania na v2
  (selektory Tailwinda, stare teksty) i nie weryfikują obecnego panelu.
  Ten spec wchodzi za paywall (konto `active` na mockach jak w stripe.spec)
  i sprawdza fundament + dostępność z partii 2 audytu UI (2026-07-03).
*/

/*
  Daty fixture'ów liczymy WZGLĘDEM DNIA URUCHOMIENIA, nigdy na sztywno.
  Powód: lista rezerwacji domyślnie filtruje `upcoming` (ManagerApp: `endDate >= dziś`),
  więc wpisana na sztywno rezerwacja 01–05.08.2026 po 10.08 wpadła do „Archiwum",
  test przestał znajdować przycisk „Edytuj" i przestał czegokolwiek pilnować —
  cicho, bo commit X17 zdał go jeszcze 25.07 („e2e 39/39") i nikt nie zaglądał.
*/
const isoInDays = (n) => new Date(Date.now() + n * 86400000).toISOString().split('T')[0];

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
  await dialog.locator('input[type="date"]').nth(1).fill(isoInDays(5)); // wyjazd
  await dialog.getByLabel('Dorośli').fill('2'); // X14: rozbicie liczby gości
  await dialog.getByLabel('Dzieci').fill('2');
  await dialog.getByLabel('Zwierzęta').fill('1');
  await dialog.getByPlaceholder('0,00').first().fill('1200'); // przychód

  // podgląd sumy osób pod polami (zwierzęta poza sumą)
  await expect(dialog.locator('.wpd-fhint')).toContainText('Łącznie osób: 4');

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
  // X14: rozbicie zapisane jako liczby, `guests` = dorośli + dzieci (bez zwierząt)
  expect(saved.adults).toBe(2);
  expect(saved.children).toBe(2);
  expect(saved.pets).toBe(1);
  expect(saved.guests).toBe(4);
  for (const k of ['income', 'advancePayment', 'commission', 'tax', 'vat', 'utilities', 'guests', 'adults', 'children', 'pets']) {
    expect(saved[k] === undefined || typeof saved[k] === 'number').toBe(true);
  }
});

test('Edycja starej rezerwacji (samo `guests`) nie gubi liczby osób (X14)', async ({ page }) => {
  // Rekord sprzed rozbicia: ma `guests`, nie ma adults/children/pets
  const legacyDb = {
    ...activeDb,
    'users/uid-test/rentals/legacy-1': {
      type: 'booking', property: 'Apartament A', source: 'Booking.com', guest: 'Stary Gość',
      date: isoInDays(2), endDate: isoInDays(6), income: 1000, guests: 3,
    },
  };
  await setupFirebaseMocks(page, { user: mockUser, dbData: legacyDb });
  await page.goto('/dashboard');

  await page.locator('.wpd-nav__item', { hasText: 'Rezerwacje' }).click();
  await page.locator('button[title="Edytuj"]').first().click();

  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible();
  // migracja przy wczytaniu: `guests` przepisane na dorosłych, suma bez zmian
  await expect(dialog.getByLabel('Dorośli')).toHaveValue('3');
  await expect(dialog.getByLabel('Dzieci')).toHaveValue('');
  await expect(dialog.locator('.wpd-fhint')).toContainText('Łącznie osób: 3');

  await dialog.locator('button[type="submit"]').click();
  await expect(page.getByText('Zaktualizowano pomyślnie!')).toBeVisible();

  const saved = await page.evaluate(() => (window.__mockDbData || {})['users/uid-test/rentals/legacy-1']);
  expect(saved.guests).toBe(3); // liczba osób zachowana, nie wyzerowana
  expect(saved.adults).toBe(3);
  // niewypełnione pola przy edycji kasujemy sentinelem deleteField (mock: {_deleteField:true})
  for (const k of ['children', 'pets']) {
    expect(saved[k]).toEqual({ _deleteField: true });
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
