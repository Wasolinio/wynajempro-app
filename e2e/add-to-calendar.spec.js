import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import { setupFirebaseMocks } from './firebase-mock';

/*
  E6: „Dodaj do kalendarza" przy zadaniu (wzorzec Booksy) — decyzja właściciela 2026-08-28.
  Klik odsłania dwie opcje: Google Calendar (szablon w nowej karcie) i Apple / plik .ics
  (pobranie). Testy kotwiczą asercje w źródle prawdy: termin zadania liczy taskSchedule
  (X20), a treść wydarzenia składa src/utils/addToCalendar.js.

  Daty WZGLĘDEM DNIA URUCHOMIENIA i LOKALNIE (nie toISOString — UTC przesuwa dzień
  wieczorem czasu PL, a dokładnie tak samo liczy je aplikacja).
*/
const isoInDays = (n) => {
  const d = new Date(); d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const compact = (iso) => iso.replace(/-/g, '');

const mockUser = { uid: 'uid-test', email: 'test@example.com', displayName: 'Test User', emailVerified: true };

const baseDb = {
  'users/uid-test': { accountStatus: 'active', name: 'Test User', email: 'test@example.com' },
  'users/uid-test/settings/hostProfile': {
    entityName: 'Test Company', identifierType: 'NIP', taxIdentifier: '1234567890',
    address: 'ul. Testowa 1', phone: '123456789', email: 'test@example.com',
  },
  'users/uid-test/settings/properties': { items: [{ name: 'Domek Morze', color: 'blue', id: 'prop-1', secretToken: 'token1' }] },
  'users/uid-test/settings/sources': { items: ['Booking.com'] },
  'users/uid-test/settings/categories': { items: ['Media'] },
};

// przecinek w treści pilnuje escapingu (.ics: `\,`) i kodowania parametrów URL
const wlasneZadanie = {
  ...baseDb,
  'users/uid-test/rentals/task-cal': {
    id: 'task-cal', type: 'reminder', text: 'Kupić żarówki, bezpieczniki',
    date: isoInDays(0), isCompleted: false,
  },
};

// wiersz „Zadania na dziś" dla zadania własnego; .first(), bo zadanie na dziś pojawia się
// też na liście tygodnia tego samego panelu (istniejące zachowanie pulpitu)
const wierszZadania = (page, tekst) =>
  page.locator('.wpd-panel', { hasText: 'Zadania na dziś' }).locator('.wpd-row', { hasText: tekst }).first();

test('E6 Klik odsłania dwie opcje, a link Google niesie termin i treść zadania', async ({ page }) => {
  await setupFirebaseMocks(page, { user: mockUser, dbData: wlasneZadanie });
  await page.goto('/dashboard');

  const row = wierszZadania(page, 'Kupić żarówki');
  await row.getByTitle('Dodaj do kalendarza').click();

  const menu = page.getByRole('menu', { name: 'Dodaj do kalendarza' });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: 'Google Calendar' })).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: 'Apple / plik .ics' })).toBeVisible();

  const href = await menu.getByRole('menuitem', { name: 'Google Calendar' }).getAttribute('href');
  const url = new URL(href);
  expect(url.origin + url.pathname).toBe('https://calendar.google.com/calendar/render');
  expect(url.searchParams.get('action')).toBe('TEMPLATE');
  // wydarzenie całodniowe: termin zadania / dzień następny (koniec wyłączny)
  expect(url.searchParams.get('dates')).toBe(`${compact(isoInDays(0))}/${compact(isoInDays(1))}`);
  expect(url.searchParams.get('text')).toBe('Kupić żarówki, bezpieczniki');

  // Escape zamyka menu
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
});

test('E6 Opcja Apple pobiera .ics z DTSTART terminu, SUMMARY z treścią i stabilnym UID', async ({ page }) => {
  await setupFirebaseMocks(page, { user: mockUser, dbData: wlasneZadanie });
  await page.goto('/dashboard');

  await wierszZadania(page, 'Kupić żarówki').getByTitle('Dodaj do kalendarza').click();
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('menuitem', { name: 'Apple / plik .ics' }).click(),
  ]);

  expect(download.suggestedFilename()).toBe(`zadanie_${isoInDays(0)}.ics`);
  const ics = fs.readFileSync(await download.path(), 'utf8');
  expect(ics).toContain(`DTSTART;VALUE=DATE:${compact(isoInDays(0))}`);
  expect(ics).toContain(`DTEND;VALUE=DATE:${compact(isoInDays(1))}`);
  // przecinek w .ics musi wyjechać escapowany — jak `esc` w functions/index.js
  expect(ics).toContain('SUMMARY:Kupić żarówki\\, bezpieczniki');
  // stabilny UID pozwala klientom rozpoznać duplikat przy ponownym imporcie
  // (czy nadpisze, czy zdubluje — zależy od aplikacji kalendarza)
  expect(ics).toContain('UID:task-cal-manual@wynajempro.pl');
  expect(ics).toContain('PRODID:-//WynajemPRO//Zadania//PL');
  // przypomnienie o 9:00 w dniu zadania — start całodniowego to północ
  expect(ics).toContain('TRIGGER:PT9H');
});

test('E6 Zadanie szablonowe: termin w linku liczy taskSchedule (kotwica wyjazd), treść niesie obiekt i gościa', async ({ page }) => {
  await setupFirebaseMocks(page, {
    user: mockUser,
    dbData: {
      ...baseDb,
      'users/uid-test/settings/reminders': {
        items: [{ id: 'review', text: 'Wyślij prośbę o opinię', shortName: 'Opinia', anchor: 'departure', daysBefore: 2, icon: 'MessageSquare' }],
      },
      // wyjazd za 2 dni, zadanie „2 dni przed wyjazdem" → termin DZIŚ
      'users/uid-test/rentals/b-1': {
        id: 'b-1', type: 'booking', property: 'Domek Morze', source: 'Booking.com',
        guest: 'Jan Testowy', date: isoInDays(-3), endDate: isoInDays(2), income: 900,
      },
    },
  });
  await page.goto('/dashboard');

  await wierszZadania(page, 'Wyślij prośbę o opinię').getByTitle('Dodaj do kalendarza').click();
  const href = await page.getByRole('menuitem', { name: 'Google Calendar' }).getAttribute('href');
  const url = new URL(href);
  expect(url.searchParams.get('dates')).toBe(`${compact(isoInDays(0))}/${compact(isoInDays(1))}`);
  expect(url.searchParams.get('text')).toBe('Wyślij prośbę o opinię (Domek Morze, Jan Testowy)');
});

test('E6 Szczegóły rezerwacji: przycisk przy zadaniu otwartym, brak przy ukończonym', async ({ page }) => {
  await setupFirebaseMocks(page, {
    user: mockUser,
    dbData: {
      ...baseDb,
      'users/uid-test/settings/reminders': {
        items: [
          { id: 'keys', text: 'Wyślij kod do kluczy', shortName: 'Kod', anchor: 'arrival', daysBefore: 3, icon: 'Key' },
          { id: 'welcome', text: 'Napisz wiadomość powitalną', shortName: 'Powitanie', anchor: 'arrival', daysBefore: 5, icon: 'Mail' },
        ],
      },
      'users/uid-test/rentals/b-det': {
        id: 'b-det', type: 'booking', property: 'Domek Morze', source: 'Booking.com',
        guest: 'Ola Detal', date: isoInDays(10), endDate: isoInDays(12), income: 1100,
        completedTasks: { welcome: true },
      },
    },
  });
  await page.goto('/dashboard');

  await page.locator('.wpd-nav__item', { hasText: 'Rezerwacje' }).first().click();
  await page.locator('tr', { hasText: 'Ola Detal' }).click();

  const panel = page.locator('.wpd-panel', { hasText: 'Zadania i przypomnienia' });
  const otwarte = panel.locator('.wpd-row', { hasText: 'Wyślij kod do kluczy' });
  const zrobione = panel.locator('.wpd-row', { hasText: 'Napisz wiadomość powitalną' });
  await expect(otwarte.getByTitle('Dodaj do kalendarza')).toBeVisible();
  await expect(zrobione.getByTitle('Dodaj do kalendarza')).toHaveCount(0);

  // termin z taskSchedule: 3 dni przed przyjazdem za 10 dni → +7 dni
  await otwarte.getByTitle('Dodaj do kalendarza').click();
  const href = await page.getByRole('menuitem', { name: 'Google Calendar' }).getAttribute('href');
  expect(new URL(href).searchParams.get('dates')).toBe(`${compact(isoInDays(7))}/${compact(isoInDays(8))}`);
});

test('E6 Zakładka Zadania: przycisk tylko przy nieukończonych', async ({ page }) => {
  await setupFirebaseMocks(page, {
    user: mockUser,
    dbData: {
      ...baseDb,
      'users/uid-test/rentals/task-open': {
        id: 'task-open', type: 'reminder', text: 'Przegląd kotła', date: isoInDays(0), isCompleted: false,
      },
      'users/uid-test/rentals/task-done': {
        id: 'task-done', type: 'reminder', text: 'Wymienić baterie w zamku', date: isoInDays(0), isCompleted: true,
      },
    },
  });
  await page.goto('/dashboard');

  await page.locator('.wpd-nav__item', { hasText: 'Rezerwacje' }).first().click();
  // celuj w zakładkę segmentu — samo /Zadania/ łapie też pigułkę „Zadania na dziś"
  await page.locator('.wpd-seg__btn', { hasText: 'Zadania' }).click();

  const otwarty = page.locator('tr', { hasText: 'Przegląd kotła' });
  const zrobiony = page.locator('tr', { hasText: 'Wymienić baterie w zamku' });
  await expect(otwarty.getByTitle('Dodaj do kalendarza')).toBeVisible();
  await expect(zrobiony.getByTitle('Edytuj')).toBeVisible(); // wiersz żyje…
  await expect(zrobiony.getByTitle('Dodaj do kalendarza')).toHaveCount(0); // …ale bez przycisku
});

test('E6 Zadanie zaległe dostaje wydarzenie DZIŚ, nie w przeszłości', async ({ page }) => {
  // zaległe = „do zrobienia teraz": wydarzenie w minionym dniu nigdy by nie przypomniało
  // (decyzja właściciela po przeglądzie kodu 2026-08-28)
  await setupFirebaseMocks(page, {
    user: mockUser,
    dbData: {
      ...baseDb,
      'users/uid-test/rentals/task-late': {
        id: 'task-late', type: 'reminder', text: 'Zaległy przegląd komina', date: isoInDays(-5), isCompleted: false,
      },
    },
  });
  await page.goto('/dashboard');

  await page.locator('.wpd-nav__item', { hasText: 'Rezerwacje' }).first().click();
  await page.locator('.wpd-seg__btn', { hasText: 'Zadania' }).click();
  await page.locator('tr', { hasText: 'Zaległy przegląd komina' }).getByTitle('Dodaj do kalendarza').click();

  const href = await page.getByRole('menuitem', { name: 'Google Calendar' }).getAttribute('href');
  expect(new URL(href).searchParams.get('dates')).toBe(`${compact(isoInDays(0))}/${compact(isoInDays(1))}`);
});

/*
  iOS: anchor z `download` zapisuje .ics jak zwykły plik bez ścieżki do Kalendarza
  (potwierdzone na iPhonie właściciela 2026-08-28) — ścieżka Apple musi tam NAWIGOWAĆ
  do blob:, bo podgląd wydarzenia z „Dodaj wszystkie" Safari pokazuje przy nawigacji.
  Emulujemy UA iPhone'a; sam podgląd Safari potwierdzi właściciel na urządzeniu.
*/
test.describe('iOS', () => {
  test.use({
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    viewport: { width: 375, height: 812 },
  });

  test('E6 iOS: opcja Apple nawiguje do blob: zamiast używać atrybutu download', async ({ page }) => {
    await setupFirebaseMocks(page, { user: mockUser, dbData: wlasneZadanie });
    await page.goto('/dashboard');

    const pobrania = [];
    page.on('download', (d) => pobrania.push(d.suggestedFilename()));

    await wierszZadania(page, 'Kupić żarówki').getByTitle('Dodaj do kalendarza').click();
    await page.getByRole('menuitem', { name: 'Apple / plik .ics' }).click();

    /*
      Chromium nie umie pokazać podglądu Safari — nawigację do blob: zamienia na
      pobranie nazwane UUID-em bloba (np. '3e346fc7-….ics'). To wystarcza za dowód,
      że poszła NAWIGACJA, nie anchor z atrybutem download: tamta ścieżka nadaje
      plikowi nazwę 'zadanie_YYYY-MM-DD.ics'. Sam podgląd „Dodaj wszystkie"
      potwierdza właściciel na urządzeniu.
    */
    await expect.poll(() => pobrania.length, { timeout: 10000 }).toBeGreaterThan(0);
    expect(pobrania[0]).toMatch(/\.ics$/);
    expect(pobrania[0]).not.toMatch(/^zadanie_/);
  });
});

test('E6 375px: menu mieści się w oknie telefonu', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await setupFirebaseMocks(page, { user: mockUser, dbData: wlasneZadanie });
  await page.goto('/dashboard');

  await wierszZadania(page, 'Kupić żarówki').getByTitle('Dodaj do kalendarza').click();
  const menu = page.getByRole('menu', { name: 'Dodaj do kalendarza' });
  await expect(menu).toBeVisible();
  const box = await menu.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(375);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(812);
});
