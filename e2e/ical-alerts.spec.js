import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock';

/*
  X26 — alerty synchronizacji na pulpicie.

  Do 2026-08-22 w całym kodzie nie było ANI JEDNEJ linijki sprawdzającej, czy dwie
  rezerwacje nachodzą na te same noce — a strona obiecywała „koniec z overbookingiem"
  w sześciu miejscach. Te testy pilnują obu nowych zachowań: wykrywania kolizji oraz
  rezerwacji oznaczonej jako zniknięta z portalu (silnik jej NIE kasuje).

  Daty liczone względem dnia uruchomienia — lekcja z panel-v2.spec: sztywne daty
  cicho wypadają z filtrów i test przestaje czegokolwiek pilnować.
*/
const isoInDays = (n) => new Date(Date.now() + n * 86400000).toISOString().split('T')[0];

const mockUser = { uid: 'uid-test', email: 'test@example.com', displayName: 'Test User', emailVerified: true };

const baseDb = {
  'users/uid-test': { accountStatus: 'active', name: 'Test User', email: 'test@example.com' },
  // Bez hostProfile panel pokazuje ekran uzupełnienia profilu zamiast pulpitu
  // i żaden selektor pulpitu się nie znajdzie (ten sam zestaw co w tasks-calendar.spec).
  'users/uid-test/settings/hostProfile': {
    entityName: 'Test Company', identifierType: 'NIP', taxIdentifier: '1234567890',
    address: 'ul. Testowa 1', phone: '123456789', email: 'test@example.com',
  },
  'users/uid-test/settings/reminders': { items: [] },
  'users/uid-test/settings/properties': {
    items: [{ name: 'Domek Morze', color: 'blue', id: 'prop-1', secretToken: 'token1' }],
  },
  'users/uid-test/settings/sources': { items: ['Booking.com', 'Airbnb'] },
  'users/uid-test/settings/categories': { items: ['Media'] },
};

test('X26 Dwa portale na te same noce → alarm o kolizji na pulpicie', async ({ page }) => {
  await setupFirebaseMocks(page, {
    user: mockUser,
    dbData: {
      ...baseDb,
      'users/uid-test/rentals/b-booking': {
        id: 'b-booking', type: 'booking', property: 'Domek Morze', source: 'Booking.com',
        guest: 'Anna Nowak', date: isoInDays(10), endDate: isoInDays(15),
        income: 1200, syncUid: 'a@booking', syncStatus: 'active',
      },
      'users/uid-test/rentals/b-airbnb': {
        id: 'b-airbnb', type: 'booking', property: 'Domek Morze', source: 'Airbnb',
        guest: 'Piotr Zieliński', date: isoInDays(13), endDate: isoInDays(18),
        income: 900, syncUid: 'b@airbnb', syncStatus: 'active',
      },
    },
  });
  await page.goto('/dashboard');

  const alarm = page.locator('.wpd-alert--pilny');
  await expect(alarm).toBeVisible();
  await expect(alarm).toContainText('sprzedany dwa razy');
  await expect(alarm).toContainText('Domek Morze');
  await expect(alarm).toContainText('Anna Nowak');
  await expect(alarm).toContainText('Piotr Zieliński');
});

test('X26 Klik w rezerwację z alarmu OTWIERA jej szczegóły', async ({ page }) => {
  // Recenzja kodu 2026-08-22: przyciski w alertach przekazywały ID tam, gdzie
  // `openBookingDetail` oczekuje CAŁEGO OBIEKTU, więc nie robiły nic. Suita tego nie
  // klikała, więc 187/187 niczego w tym miejscu nie dowodziło — stąd ten test.
  await setupFirebaseMocks(page, {
    user: mockUser,
    dbData: {
      ...baseDb,
      'users/uid-test/rentals/b-booking': {
        id: 'b-booking', type: 'booking', property: 'Domek Morze', source: 'Booking.com',
        guest: 'Anna Nowak', date: isoInDays(10), endDate: isoInDays(15),
        income: 1200, syncUid: 'a@booking', syncStatus: 'active',
      },
      'users/uid-test/rentals/b-airbnb': {
        id: 'b-airbnb', type: 'booking', property: 'Domek Morze', source: 'Airbnb',
        guest: 'Piotr Zieliński', date: isoInDays(13), endDate: isoInDays(18),
        income: 900, syncUid: 'b@airbnb', syncStatus: 'active',
      },
    },
  });
  await page.goto('/dashboard');

  await page.locator('.wpd-alert--pilny .wpd-alert__act', { hasText: 'Anna Nowak' }).click();
  await expect(page.getByText('Anna Nowak').first()).toBeVisible();
  // Znacznik iCal musi być widoczny również dla rezerwacji z nowym `syncUid`.
  await expect(page.locator('.wpd-tag', { hasText: 'iCal' }).first()).toBeVisible();
});

test('X26 Rezerwacja znikła ma widoczny stan w szczegółach', async ({ page }) => {
  await setupFirebaseMocks(page, {
    user: mockUser,
    dbData: {
      ...baseDb,
      'users/uid-test/rentals/b-znikla': {
        id: 'b-znikla', type: 'booking', property: 'Domek Morze', source: 'Booking.com',
        guest: 'Karol Anulowany', date: isoInDays(5), endDate: isoInDays(9),
        income: 800, syncUid: 'x@booking', syncStatus: 'vanished',
      },
    },
  });
  await page.goto('/dashboard');

  await page.locator('.wpd-alert--uwaga .wpd-alert__act', { hasText: 'Karol Anulowany' }).click();
  await expect(page.locator('.wpd-tag', { hasText: 'Zniknęła z portalu' })).toBeVisible();
});

test('X26 Wyjazd i przyjazd tego samego dnia to NIE kolizja', async ({ page }) => {
  // Liczymy noce, nie dni. Gdyby alarm liczył dni, odpalałby się przy każdej
  // normalnej rotacji gości i gospodarz nauczyłby się go ignorować.
  await setupFirebaseMocks(page, {
    user: mockUser,
    dbData: {
      ...baseDb,
      'users/uid-test/rentals/b-1': {
        id: 'b-1', type: 'booking', property: 'Domek Morze', source: 'Booking.com',
        guest: 'Anna Nowak', date: isoInDays(10), endDate: isoInDays(15), income: 1200,
      },
      'users/uid-test/rentals/b-2': {
        id: 'b-2', type: 'booking', property: 'Domek Morze', source: 'Airbnb',
        guest: 'Piotr Zieliński', date: isoInDays(15), endDate: isoInDays(20), income: 900,
      },
    },
  });
  await page.goto('/dashboard');

  await expect(page.locator('.wpd-stats')).toBeVisible();      // pulpit się wczytał
  await expect(page.locator('.wpd-alert--pilny')).toHaveCount(0);
});

test('X26 Ten sam termin w RÓŻNYCH obiektach nie jest kolizją', async ({ page }) => {
  await setupFirebaseMocks(page, {
    user: mockUser,
    dbData: {
      ...baseDb,
      'users/uid-test/settings/properties': {
        items: [
          { name: 'Domek Morze', color: 'blue', id: 'prop-1', secretToken: 't1' },
          { name: 'Domek Góry', color: 'amber', id: 'prop-2', secretToken: 't2' },
        ],
      },
      'users/uid-test/rentals/b-1': {
        id: 'b-1', type: 'booking', property: 'Domek Morze', source: 'Booking.com',
        guest: 'Anna', date: isoInDays(10), endDate: isoInDays(15), income: 1200,
      },
      'users/uid-test/rentals/b-2': {
        id: 'b-2', type: 'booking', property: 'Domek Góry', source: 'Airbnb',
        guest: 'Piotr', date: isoInDays(10), endDate: isoInDays(15), income: 900,
      },
    },
  });
  await page.goto('/dashboard');

  await expect(page.locator('.wpd-stats')).toBeVisible();
  await expect(page.locator('.wpd-alert--pilny')).toHaveCount(0);
});

test('X26 Rezerwacja znikła z portalu jest pokazana, ale nie skasowana', async ({ page }) => {
  await setupFirebaseMocks(page, {
    user: mockUser,
    dbData: {
      ...baseDb,
      'users/uid-test/rentals/b-znikla': {
        id: 'b-znikla', type: 'booking', property: 'Domek Morze', source: 'Booking.com',
        guest: 'Karol Anulowany', date: isoInDays(5), endDate: isoInDays(9),
        income: 800, syncUid: 'x@booking', syncStatus: 'vanished',
      },
    },
  });
  await page.goto('/dashboard');

  const uwaga = page.locator('.wpd-alert--uwaga');
  await expect(uwaga).toBeVisible();
  await expect(uwaga).toContainText('zniknęła z portalu');
  await expect(uwaga).toContainText('Karol Anulowany');
  // Kwota gospodarza to powód, dla którego nie kasujemy takiej rezerwacji sami.
  await expect(uwaga).toContainText('mogą być przy niej Twoje kwoty');
});

test('X26 Rezerwacja znikła nie wywołuje fałszywej kolizji', async ({ page }) => {
  await setupFirebaseMocks(page, {
    user: mockUser,
    dbData: {
      ...baseDb,
      'users/uid-test/rentals/b-zywa': {
        id: 'b-zywa', type: 'booking', property: 'Domek Morze', source: 'Airbnb',
        guest: 'Anna Nowak', date: isoInDays(10), endDate: isoInDays(15), income: 1200,
      },
      'users/uid-test/rentals/b-znikla': {
        id: 'b-znikla', type: 'booking', property: 'Domek Morze', source: 'Booking.com',
        guest: 'Karol Anulowany', date: isoInDays(11), endDate: isoInDays(14),
        income: 800, syncUid: 'x@booking', syncStatus: 'vanished',
      },
    },
  });
  await page.goto('/dashboard');

  await expect(page.locator('.wpd-alert--uwaga')).toBeVisible();
  await expect(page.locator('.wpd-alert--pilny')).toHaveCount(0);
});

test('X26 Otwarcie Ustawień przy niewczytanych ustawieniach NIE nadpisuje listy obiektów', async ({ page }) => {
  // Recenzja kodu, tura druga: utrwalanie retrofitu `id`/`secretToken` przy otwarciu modalu
  // mogło zapisać DEFAULT_PROPERTIES (trzy obiekty demo) na miejsce prawdziwej listy
  // gospodarza — bo `settings.properties` startuje właśnie od nich, a nasłuch ustawień ma
  // własny cykl. Skutkiem byłoby skasowanie nazw i kolorów obiektów oraz unieważnienie
  // linków eksportu wklejonych do portali, czyli dokładnie ta awaria, którą X26 likwiduje.
  await setupFirebaseMocks(page, {
    user: mockUser,
    dbData: {
      'users/uid-test': { accountStatus: 'active', name: 'Test User', email: 'test@example.com' },
      'users/uid-test/settings/hostProfile': {
        entityName: 'Test Company', identifierType: 'NIP', taxIdentifier: '1234567890',
        address: 'ul. Testowa 1', phone: '123456789', email: 'test@example.com',
      },
      // CELOWO brak `settings/properties` — panel pokazuje wtedy obiekty domyślne.
    },
  });
  await page.goto('/dashboard');
  await expect(page.locator('.wpd-stats')).toBeVisible();

  await page.locator('button:has(svg.lucide-settings)').first().click();
  await page.waitForTimeout(600);

  const zapisane = await page.evaluate(() => window.__mockDbData['users/uid-test/settings/properties']);
  expect(zapisane).toBeUndefined();
});

test('X26 Czysty kalendarz nie pokazuje żadnych alertów', async ({ page }) => {
  await setupFirebaseMocks(page, {
    user: mockUser,
    dbData: {
      ...baseDb,
      'users/uid-test/rentals/b-1': {
        id: 'b-1', type: 'booking', property: 'Domek Morze', source: 'Booking.com',
        guest: 'Anna', date: isoInDays(10), endDate: isoInDays(15), income: 1200,
      },
    },
  });
  await page.goto('/dashboard');

  await expect(page.locator('.wpd-stats')).toBeVisible();
  await expect(page.locator('.wpd-alerts')).toHaveCount(0);
});
