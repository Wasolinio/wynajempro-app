import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock';

/*
  Regresja wydruku raportu rentowności (X18).

  Ten spec istnieje, bo druk raportu zepsuł się DWA RAZY, za każdym razem cicho — wydruk
  jest za logowaniem, więc żaden dotychczasowy test go nie dotykał, a agent nie mógł
  sprawdzić go w przeglądarce:

  1. 2026-08-13 — pusta pierwsza strona, treść na 2 i 3 (`visibility:hidden` nie zwalnia
     miejsca w układzie + `position:absolute` wiązało raport z pozycjonowanym przodkiem).
  2. 2026-08-18 — CAŁY wydruk pusty. Poprawka nr 1 usunęła z bloku raportu regułę
     `.wpd-report-print *{ visibility:visible }`, a NIŻEJ w tym samym arkuszu stoi
     niezakresowany blok generatora umów z `body *{ visibility:hidden }`. Wygrywał
     z raportem i chował go w całości — treść zajmowała strony, papier wychodził czysty.

  Dlatego test mierzy stan RZECZYWISTEGO panelu w trybie print (`emulateMedia`), a nie
  odtworzonej struktury: sprawdza, że raport jest widoczny i ma wymiary, a powłoka panelu
  wychodzi z układu.
*/

const mockUser = { uid: 'uid-test', email: 'test@example.com', displayName: 'Test User', emailVerified: true };

const db = {
  'users/uid-test': { accountStatus: 'active', name: 'Test User', email: 'test@example.com' },
  'users/uid-test/settings/hostProfile': {
    entityName: 'Test Company', identifierType: 'NIP', taxIdentifier: '1234567890',
    address: 'ul. Testowa 1', phone: '123456789', email: 'test@example.com',
  },
  'users/uid-test/settings/properties': { items: [{ name: 'Apartament A', color: 'blue', id: 'prop-1', secretToken: 'token1' }] },
  'users/uid-test/settings/sources': { items: ['Booking.com'] },
  'users/uid-test/settings/categories': { items: ['Media'] },
  /*
    Raport czyta WYŁĄCZNIE wpisy `type:'booking'` i pola `date` + `income` — nie `startDate`
    ani `price` (pierwsza wersja tego fixture'u miała złe nazwy, raport widział zero danych,
    przycisk „Drukuj" był wyłączony i test mierzył stan pusty). Rok liczony z `date`, więc
    trzyma się roku bieżącego, a nie sztywnej daty — inaczej spec zgnije 1 stycznia.
  */
  'users/uid-test/rentals/rent-1': {
    id: 'rent-1', type: 'booking', property: 'Apartament A', guest: 'Jan Kowalski', source: 'Booking.com',
    date: `${new Date().getFullYear()}-03-01`, income: 2000, commission: 300,
    utilities: 120, tax: 200, isPaid: true, isCompleted: true,
  },
};

async function otworzRaport(page) {
  await setupFirebaseMocks(page, { user: mockUser, dbData: db });
  await page.goto('/dashboard');
  await page.locator('.wpd-nav__item', { hasText: 'Finanse' }).first().click();
  await page.getByRole('tab', { name: 'Raporty' }).click();
  await page.getByRole('button', { name: /Raport rentowności/ }).click();
  await expect(page.locator('.wpd-report-print')).toBeVisible();
}

test('Wydruk raportu: treść jest widoczna, a powłoka panelu wychodzi z układu', async ({ page }) => {
  await otworzRaport(page);
  await page.emulateMedia({ media: 'print' });

  const pomiar = await page.evaluate(() => {
    const raport = document.querySelector('.wpd-report-print');
    const naglowek = document.querySelector('.wpd-rpt-head');
    const powloka = document.querySelector('.wpd-side');
    const st = (el) => (el ? getComputedStyle(el) : null);
    const sr = st(raport);
    return {
      raportVisibility: sr.visibility,
      raportDisplay: sr.display,
      raportWysokosc: raport.getBoundingClientRect().height,
      raportSzerokosc: raport.getBoundingClientRect().width,
      // Nagłówek wydruku (widoczny TYLKO w druku) musi się pojawić.
      naglowekDisplay: naglowek ? st(naglowek).display : 'BRAK',
      naglowekVisibility: naglowek ? st(naglowek).visibility : 'BRAK',
      // Powłoka panelu ma zniknąć Z UKŁADU, nie tylko z oczu.
      powlokaDisplay: powloka ? st(powloka).display : 'BRAK',
      powlokaWysokosc: powloka ? powloka.getBoundingClientRect().height : 0,
    };
  });

  // To jest asercja, której zabrakło 18.08: treść była w DOM i zajmowała strony,
  // ale miała visibility:hidden, więc na papierze nie było nic.
  expect(pomiar.raportVisibility).toBe('visible');
  expect(pomiar.raportDisplay).not.toBe('none');
  expect(pomiar.raportWysokosc).toBeGreaterThan(100);
  expect(pomiar.raportSzerokosc).toBeGreaterThan(100);

  // Nagłówek wydruku („Raport rentowności {rok}") pojawia się wyłącznie w druku.
  expect(pomiar.naglowekVisibility).toBe('visible');
  expect(pomiar.naglowekDisplay).not.toBe('none');

  // Asercja z poprawki 13.08: powłoka nie może zostawiać po sobie pustego miejsca.
  expect(pomiar.powlokaDisplay).toBe('none');
  expect(pomiar.powlokaWysokosc).toBe(0);
});

test('Wydruk raportu: tytuł dokumentu zamiast hasła reklamowego', async ({ page }) => {
  await otworzRaport(page);

  /*
    Tytuł trzeba złapać W MOMENCIE drukowania. Przeglądarka bezgłowa nie wysyła
    `beforeprint`, a `window.print()` wykonuje jako operację pustą — podmieniamy je więc
    na rejestrator. (Dwie wcześniejsze wersje tego testu mierzyły stan po przywróceniu
    tytułu i po zdarzeniu, które nigdy nie padło.)
  */
  await page.evaluate(() => {
    window.__tytulWDruku = null;
    window.print = () => { window.__tytulWDruku = document.title; };
  });

  await page.getByRole('button', { name: /Drukuj/ }).click();

  const wTrakcie = await page.evaluate(() => window.__tytulWDruku);
  // To trafia do metadanych PDF i do domyślnej nazwy pliku u księgowego.
  expect(wTrakcie).toMatch(/^Raport rentowności \d{4} — /);
  expect(wTrakcie).not.toMatch(/system do zarządzania/i);

  // Po zamknięciu okna druku (także po anulowaniu) tytuł aplikacji musi wrócić —
  // inaczej użytkownik zostaje z „Raport rentowności…" w karcie przeglądarki.
  const po = await page.evaluate(() => {
    window.dispatchEvent(new Event('afterprint'));
    return document.title;
  });
  expect(po).toMatch(/WynajemPRO/);
});
