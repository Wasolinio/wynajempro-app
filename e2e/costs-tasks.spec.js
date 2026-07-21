import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock';

/*
  Regresja dla [[Known-Issues]] #10 i #11 (sygnały z odświeżania bazy wiedzy X1):
  #10 — wpisów typu „Koszty" (`type: 'utility'`) i jednorazowych zadań (`type: 'reminder'`)
       nie dało się edytować ani usunąć: `utilitiesList` był liczony, ale nieodebrany,
       a „Ostatnie koszty" renderowały wiersze bez akcji.
  #11 — sygnalizator synchronizacji przeszukiwał KLUCZE `syncLinks` (nazwy obiektów)
       zamiast wartości (portale), więc przy wpiętych linkach zawsze świecił „—".
*/

const mockUser = { uid: 'uid-test', email: 'test@example.com', displayName: 'Test User', emailVerified: true };

const baseDb = {
  'users/uid-test': { accountStatus: 'active', name: 'Test User', email: 'test@example.com' },
  'users/uid-test/settings/hostProfile': {
    entityName: 'Test Company', identifierType: 'NIP', taxIdentifier: '1234567890',
    address: 'ul. Testowa 1', phone: '123456789', email: 'test@example.com',
  },
  'users/uid-test/settings/properties': { items: [{ name: 'Apartament A', color: 'blue', id: 'prop-1', secretToken: 'token1' }] },
  'users/uid-test/settings/sources': { items: ['Booking.com'] },
  'users/uid-test/settings/categories': { items: ['Media'] },
  'users/uid-test/rentals/cost-1': {
    id: 'cost-1', type: 'utility', property: 'Apartament A', category: 'Media',
    guest: 'Faktura PGE 12/2026', date: '2026-03-10', utilities: 480, isPaid: false, isCompleted: false,
  },
  'users/uid-test/rentals/task-1': {
    id: 'task-1', type: 'reminder', property: 'Apartament A',
    text: 'Wymienić żarówkę w salonie', date: '2026-03-12', isCompleted: false,
  },
};

const withSyncLinks = {
  ...baseDb,
  // Kluczem jest NAZWA OBIEKTU, portale siedzą w wartościach — dokładnie tak zapisuje SettingsModal.
  'users/uid-test/settings/syncLinks': { links: { 'Apartament A': { booking: 'https://admin.booking.com/x.ics', airbnb: '' } } },
};

async function openCosts(page) {
  await page.locator('.wpd-nav__item', { hasText: 'Finanse' }).first().click();
  await page.getByRole('tab', { name: 'Koszty i opłaty' }).click();
}

test('#10 Koszt jednorazowy ma akcje i otwiera się do edycji', async ({ page }, testInfo) => {
  await setupFirebaseMocks(page, { user: mockUser, dbData: baseDb });
  await page.goto('/dashboard');
  await openCosts(page);

  const row = page.locator('.wpd-ctable__row', { hasText: 'Faktura PGE 12/2026' });
  await expect(row).toBeVisible();
  await row.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500); // panele wjeżdżają animacją .wpd-rise — zrzut po jej końcu
  await page.locator('.wpd-panel', { hasText: 'Ostatnie koszty' }).screenshot({ path: testInfo.outputPath('koszty-z-akcjami.png') });

  await row.getByTitle('Edytuj koszt').click();
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible();
  // Modal wchodzi w tryb kosztu z wypełnioną kwotą — czyli edytujemy TEN wpis, nie pusty formularz
  await expect(dialog).toContainText('Aktualizacja');
  await expect(dialog.locator('input[value="480"], input[type="number"]').first()).toHaveValue('480');
});

test('#10 Koszt jednorazowy da się usunąć', async ({ page }) => {
  await setupFirebaseMocks(page, { user: mockUser, dbData: baseDb });
  await page.goto('/dashboard');
  await openCosts(page);

  const row = page.locator('.wpd-ctable__row', { hasText: 'Faktura PGE 12/2026' });
  await row.getByTitle('Usuń koszt').click();

  // Potwierdzenie usunięcia to dialog panelu (nie window.confirm — audyt UI)
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: /Usuń|Tak/ }).click();
  await expect(page.locator('.wpd-ctable__row', { hasText: 'Faktura PGE 12/2026' })).toHaveCount(0);
});

test('#10 Zadania jednorazowe mają własną zakładkę z edycją i usuwaniem', async ({ page }, testInfo) => {
  await setupFirebaseMocks(page, { user: mockUser, dbData: baseDb });
  await page.goto('/dashboard');

  await page.locator('.wpd-nav__item', { hasText: 'Rezerwacje' }).first().click();
  await page.getByRole('button', { name: /Zadania/ }).click();

  const row = page.locator('tr', { hasText: 'Wymienić żarówkę w salonie' });
  await expect(row).toBeVisible();
  await expect(row.getByTitle('Edytuj')).toBeVisible();
  await expect(row.getByTitle('Usuń')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('zakladka-zadania.png') });

  await row.getByTitle('Oznacz jako zrobione').click();
  await expect(row.getByTitle('Zrobione')).toBeVisible();
});

test('#11 Sygnalizator świeci OK dla wpiętego portalu (klucz = nazwa obiektu)', async ({ page }) => {
  await setupFirebaseMocks(page, { user: mockUser, dbData: withSyncLinks });
  await page.goto('/dashboard');

  const booking = page.locator('.wpd-sync__row', { hasText: 'Booking.com' });
  await expect(booking).toBeVisible();
  await expect(booking.locator('.wpd-sync__time')).toHaveText('OK');

  // Airbnb ma pusty link → nadal „—"; brak fałszywego pozytywu
  const airbnb = page.locator('.wpd-sync__row', { hasText: 'Airbnb' });
  await expect(airbnb.locator('.wpd-sync__time')).toHaveText('—');
});

test('#11 Bez linków wszystkie kanały pokazują „—"', async ({ page }) => {
  await setupFirebaseMocks(page, { user: mockUser, dbData: baseDb });
  await page.goto('/dashboard');

  const rows = page.locator('.wpd-side .wpd-sync__row');
  await expect(rows).toHaveCount(2); // Booking.com + Airbnb (Nocowanie nie ma pola w Ustawieniach)
  await expect(rows.first().locator('.wpd-sync__time')).toHaveText('—');
});
