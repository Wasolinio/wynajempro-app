import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock';

/*
  Regresja czterech uwag testera z 21.08.2026 (docs/Projects/Feedback-testera-2026-08-21.md):
  X20 — zadanie z kotwicą w wyjeździe („kilka dni PO rezerwacji", koniec z ujemnym „Dni przed"),
  X21 — kafel „Do posprzątania" liczy sprzątania, nie wyjazdy (na zdjęciu: 0 przy zadaniu na dziś),
  X22 — rezerwacja prosto z kalendarza (klik = noc, przeciągnięcie = zakres),
  X23 — filtr obiektu w kalendarzu.

  Daty liczymy WZGLĘDEM DNIA URUCHOMIENIA (lekcja z panel-v2.spec: sztywne daty cicho
  wypadają z filtrów i test przestaje czegokolwiek pilnować).
*/
const isoInDays = (n) => new Date(Date.now() + n * 86400000).toISOString().split('T')[0];
const dayOfMonth = (d) => `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

const mockUser = { uid: 'uid-test', email: 'test@example.com', displayName: 'Test User', emailVerified: true };

const baseDb = {
  'users/uid-test': { accountStatus: 'active', name: 'Test User', email: 'test@example.com' },
  'users/uid-test/settings/hostProfile': {
    entityName: 'Test Company', identifierType: 'NIP', taxIdentifier: '1234567890',
    address: 'ul. Testowa 1', phone: '123456789', email: 'test@example.com',
  },
  'users/uid-test/settings/properties': {
    items: [
      { name: 'Domek Morze', color: 'blue', id: 'prop-1', secretToken: 'token1' },
      { name: 'Domek Góry', color: 'amber', id: 'prop-2', secretToken: 'token2' },
    ],
  },
  'users/uid-test/settings/sources': { items: ['Booking.com'] },
  'users/uid-test/settings/categories': { items: ['Media'] },
};

const openCalendar = async (page) => {
  await page.locator('.wpd-nav__item', { hasText: 'Kalendarz' }).first().click();
  await expect(page.locator('.wpd-cal__title')).toBeVisible();
};

test('X21 Kafel „Do posprzątania" liczy sprzątanie z listy zadań, nie same wyjazdy', async ({ page }) => {
  // Układ dokładnie ze zdjęcia testera: przyjazd dziś, ZERO wyjazdów, zadanie sprzątania na dziś.
  // Przed poprawką kafel pokazywał 0, choć niżej wisiało „Zleć sprzątanie".
  await setupFirebaseMocks(page, {
    user: mockUser,
    dbData: {
      ...baseDb,
      'users/uid-test/settings/reminders': {
        items: [{ id: 'cleaning', text: 'Zleć sprzątanie', shortName: 'Sprzątanie', anchor: 'arrival', daysBefore: 0, icon: 'CheckSquare' }],
      },
      'users/uid-test/rentals/b-1': {
        id: 'b-1', type: 'booking', property: 'Domek Morze', source: 'Booking.com',
        guest: 'Kuba Woj', date: isoInDays(0), endDate: isoInDays(3), income: 1200,
      },
    },
  });
  await page.goto('/dashboard');

  const kafel = page.locator('.wpd-stat', { hasText: 'Do posprzątania' });
  await expect(kafel.locator('.wpd-stat__value')).toHaveText('1');
  await expect(kafel).toContainText('DOMEK MORZE');

  // kliknięcie prowadzi do raportu dziennego — tam widać, co konkretnie do posprzątania
  await kafel.click();
  await expect(page.locator('[role="dialog"]')).toContainText('Zleć sprzątanie');
});

test('X20 Zadanie „po wyjeździe" czeka na koniec pobytu, nie odpala się w trakcie', async ({ page }) => {
  await setupFirebaseMocks(page, {
    user: mockUser,
    dbData: {
      ...baseDb,
      'users/uid-test/settings/reminders': {
        items: [{ id: 'review', text: 'Wyślij prośbę o opinię', shortName: 'Opinia', anchor: 'departure', daysBefore: -2, icon: 'MessageSquare' }],
      },
      // gość WYJECHAŁ 2 dni temu → prośba o opinię należy się dziś
      'users/uid-test/rentals/b-po': {
        id: 'b-po', type: 'booking', property: 'Domek Morze', source: 'Booking.com',
        guest: 'Anna Wyjechala', date: isoInDays(-9), endDate: isoInDays(-2), income: 900,
      },
      // gość WCIĄŻ MIESZKA (przyjazd 5 dni temu) → przed X20 kotwica w przyjeździe wypchnęłaby
      // mu prośbę o opinię w środek pobytu; to jest właśnie uwaga testera
      'users/uid-test/rentals/b-trwa': {
        id: 'b-trwa', type: 'booking', property: 'Domek Góry', source: 'Booking.com',
        guest: 'Kuba Mieszka', date: isoInDays(-5), endDate: isoInDays(3), income: 1500,
      },
    },
  });
  await page.goto('/dashboard');

  const zadania = page.locator('.wpd-panel', { hasText: 'Zadania na dziś' });
  await expect(zadania).toContainText('Anna Wyjechala');
  await expect(zadania).not.toContainText('Kuba Mieszka');
});

test('X20 Ustawienia: termin składa się z listy i liczby dni, bez wartości ujemnych', async ({ page }) => {
  await setupFirebaseMocks(page, {
    user: mockUser,
    dbData: {
      ...baseDb,
      'users/uid-test/settings/reminders': {
        items: [{ id: 'review', text: 'Wyślij prośbę o opinię', shortName: 'Opinia', daysBefore: 0, icon: 'Bell' }],
      },
    },
  });
  await page.goto('/dashboard');

  await page.locator('button[title="Ustawienia"]').click();
  await page.locator('.wpd-tab', { hasText: 'Powiadomienia' }).click();

  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toContainText('Zadanie pojawi się w dniu przyjazdu gościa.');

  await dialog.locator('select').first().selectOption('departure-after');
  await dialog.locator('input[type="number"]').first().fill('2');
  // zdanie kontrolne — to jest odpowiedź na pytanie testera „czym są minus 2?"
  await expect(dialog).toContainText('Zadanie pojawi się 2 dni po wyjeździe gościa.');

  await dialog.locator('button', { hasText: 'Zapisz ustawienia' }).click();
  await expect(dialog).toBeHidden();

  const zapisane = await page.evaluate(() => window.__mockDbData['users/uid-test/settings/reminders']);
  expect(zapisane.items[0].anchor).toBe('departure');
  expect(zapisane.items[0].daysBefore).toBe(-2);
});

test('X22 Klik w wolną komórkę kalendarza otwiera rezerwację z obiektem i datami', async ({ page }) => {
  await setupFirebaseMocks(page, { user: mockUser, dbData: baseDb });
  await page.goto('/dashboard');
  await openCalendar(page);

  await page.locator(`[title="Nowa rezerwacja — Domek Góry, ${dayOfMonth(10)}"]`).click();

  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Dodawanie');
  await expect(dialog.locator('select').first()).toHaveValue('Domek Góry');
  // jedna noc: wyjazd nazajutrz (tak samo, jak kalendarz rysuje paski)
  await expect(dialog.locator('input[type="date"]').first()).toHaveValue(dayOfMonth(10));
  await expect(dialog.locator('input[type="date"]').nth(1)).toHaveValue(dayOfMonth(11));
});

test('X22 Przeciągnięcie po kalendarzu zakłada rezerwację na cały zaznaczony zakres', async ({ page }) => {
  await setupFirebaseMocks(page, { user: mockUser, dbData: baseDb });
  await page.goto('/dashboard');
  await openCalendar(page);

  const od = page.locator(`[title="Nowa rezerwacja — Domek Morze, ${dayOfMonth(10)}"]`);
  const doo = page.locator(`[title="Nowa rezerwacja — Domek Morze, ${dayOfMonth(12)}"]`);
  const a = await od.boundingBox(); const b = await doo.boundingBox();
  await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 8 });
  await page.mouse.up();

  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('select').first()).toHaveValue('Domek Morze');
  await expect(dialog.locator('input[type="date"]').first()).toHaveValue(dayOfMonth(10));
  await expect(dialog.locator('input[type="date"]').nth(1)).toHaveValue(dayOfMonth(13));
});

test('X22 Zajęta noc nie zakłada dubla — klik w pasek otwiera istniejącą rezerwację', async ({ page }) => {
  await setupFirebaseMocks(page, {
    user: mockUser,
    dbData: {
      ...baseDb,
      'users/uid-test/rentals/b-zajete': {
        id: 'b-zajete', type: 'booking', property: 'Domek Morze', source: 'Booking.com',
        guest: 'Jan Zajęty', date: dayOfMonth(10), endDate: dayOfMonth(14), income: 800,
      },
    },
  });
  await page.goto('/dashboard');
  await openCalendar(page);

  // zajęte noce nie dostają tytułu „Nowa rezerwacja" i nie są klikalne
  await expect(page.locator(`[title="Nowa rezerwacja — Domek Morze, ${dayOfMonth(11)}"]`)).toHaveCount(0);
  // dzień wyjazdu zostaje wolny pod przyjazd back-to-back
  await expect(page.locator(`[title="Nowa rezerwacja — Domek Morze, ${dayOfMonth(14)}"]`)).toHaveCount(1);
});

test('X23 Filtr obiektu zawęża wiersze kalendarza', async ({ page }) => {
  await setupFirebaseMocks(page, { user: mockUser, dbData: baseDb });
  await page.goto('/dashboard');
  await openCalendar(page);

  await expect(page.locator('.wpd-cal__row')).toHaveCount(2);
  await page.locator('select[aria-label="Filtruj po obiekcie"]').selectOption('Domek Góry');
  await expect(page.locator('.wpd-cal__row')).toHaveCount(1);
  await expect(page.locator('.wpd-cal__objname')).toHaveText('Domek Góry');
});
