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

const ROK = new Date().getFullYear();

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
  'users/uid-test/settings/recurringCosts': { items: [{ id: 'rc-1', name: 'Internet Starlink', amount: 129, startMonth: `${ROK}-01`, category: 'IT', property: '' }] },
  /*
    Raport czyta WYŁĄCZNIE wpisy `type:'booking'` i pola `date` + `income` — nie `startDate`
    ani `price` (pierwsza wersja tego fixture'u miała złe nazwy, raport widział zero danych,
    przycisk „Drukuj" był wyłączony i test mierzył stan pusty). Rok liczony z `date`, więc
    trzyma się roku bieżącego, a nie sztywnej daty — inaczej spec zgnije 1 stycznia.
  */
  'users/uid-test/rentals/rent-1': {
    id: 'rent-1', type: 'booking', property: 'Apartament A', guest: 'Jan Kowalski', source: 'Booking.com',
    date: `${ROK}-03-01`, income: 2000, commission: 300,
    utilities: 120, tax: 200, isPaid: true, isCompleted: true,
  },
  'users/uid-test/rentals/rent-2': {
    id: 'rent-2', type: 'booking', property: 'Apartament A', guest: 'Anna Nowak', source: 'Airbnb',
    date: `${ROK}-04-10`, income: 1000, commission: 150, tax: 85, isPaid: true, isCompleted: true,
  },
  // Koszt własny z kategorią — sprawdza drugi poziom klasyfikacji.
  'users/uid-test/rentals/cost-1': {
    id: 'cost-1', type: 'utility', property: 'Apartament A', category: 'Media',
    guest: 'Prąd 03/2026', date: `${ROK}-03-20`, utilities: 240,
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

test('Raport zawiera przekroje z partii A+B (klasyfikacja, źródła, statystyki, rejestr, metodyka)', async ({ page }) => {
  await otworzRaport(page);

  // Partia A — analityka.
  await expect(page.getByRole('heading', { name: 'Klasyfikacja kosztów' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Struktura przychodów' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Statystyki operacyjne' })).toBeVisible();
  // Drugi poziom klasyfikacji: prowizje rozbite na portale.
  const klasyfikacja = page.locator('.wpd-panel', { has: page.getByRole('heading', { name: 'Klasyfikacja kosztów' }) });
  await expect(klasyfikacja).toContainText('Prowizje portali');
  await expect(klasyfikacja).toContainText('Booking.com');
  await expect(klasyfikacja).toContainText('Airbnb');
  await expect(klasyfikacja).toContainText('Koszty stałe');
  // Struktura przychodów zna oba źródła i liczy rezerwacje.
  const zrodla = page.locator('.wpd-panel', { has: page.getByRole('heading', { name: 'Struktura przychodów' }) });
  await expect(zrodla).toContainText('Booking.com');
  await expect(zrodla).toContainText('Airbnb');

  // Partia B — dokument dla księgowego.
  await expect(page.getByRole('heading', { name: /Rejestr pozycji/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Metodyka i ograniczenia' })).toBeVisible();
  // Ograniczenie musi być nazwane wprost — to zdanie chroni właściciela przed zawyżoną marżą.
  await expect(page.locator('.wpd-panel', { has: page.getByRole('heading', { name: 'Metodyka i ograniczenia' }) }))
    .toContainText('wyższa niż rzeczywista');
});

test('Rejestr pozycji wchodzi do wydruku dopiero po zaznaczeniu przełącznika', async ({ page }) => {
  await otworzRaport(page);
  /* Selektor po KLASIE, nie po roli: w trybie print panel ma display:none, więc nagłówek
     znika z drzewa dostępności i `getByRole` przestaje go znajdować. */
  const rejestr = page.locator('.wpd-rpt-register');

  // Na ekranie rejestr jest zawsze — tam długość nie przeszkadza.
  await expect(rejestr).toBeVisible();

  await page.emulateMedia({ media: 'print' });
  // Domyślnie POZA wydrukiem: przy pełnym sezonie to kilkanaście stron.
  expect(await rejestr.evaluate((el) => getComputedStyle(el).display)).toBe('none');

  await page.emulateMedia({ media: 'screen' });
  /* Input checkboxa jest wizualnie ukryty pod własną stylizacją (.wpd-check), a nakładka
     dotykowa ::after przechwytuje kliknięcia — ten sam wzorzec co przy zgodzie na regulamin
     w links-buttons.spec. `dispatchEvent` omija sprawdzanie aktowalności, a React i tak
     obsłuży zdarzenie na inpucie. */
  await page.locator('.wpd-dialog__head input[type="checkbox"]').dispatchEvent('click');
  await page.emulateMedia({ media: 'print' });
  expect(await rejestr.evaluate((el) => getComputedStyle(el).display)).not.toBe('none');

  // Metodyka jest w wydruku zawsze — bez niej liczby idą do księgowego bez zastrzeżeń.
  const metodyka = page.locator('.wpd-rpt-method');
  expect(await metodyka.evaluate((el) => getComputedStyle(el).display)).not.toBe('none');
});

/*
  X18 partia C — typografia i uklad dokumentu. Test pilnuje decyzji projektowych, ktore
  latwo cofnac przypadkiem, bo wszystkie zyja w jednym bloku @media print:
  gestosc tabel, cztery wskazniki w rzedzie, brak koloru przy tekscie tabelarycznym,
  plaska karta zysku i rejestr od nowej kartki. Mierzone na realnym panelu.
*/
test('Wydruk raportu: gęstość i układ dokumentu (partia C)', async ({ page }) => {
  await otworzRaport(page);
  /* Szerokość okna MUSI odpowiadać kartce (A4 minus marginesy = 794 px CSS), bo
     `emulateMedia` przełącza tylko typ nośnika, a zapytania `max-width` dalej patrzą
     na viewport. Przy domyślnych 1280 px breakpoint mobilny się nie włącza i pomiar
     układu kart pokazuje stan, którego na papierze nie ma. */
  await page.setViewportSize({ width: 794, height: 1123 });
  await page.emulateMedia({ media: 'print' });

  const p = await page.evaluate(() => {
    const cs = (sel) => getComputedStyle(document.querySelector(sel));
    /* Komórka z kolorem ustawionym w JSX (przychód = --green). Komórka bez stylu
       własnego jest czarna także bez reguły druku i niczego by nie pilnowała. */
    const numer = document.querySelector('.wpd-table td.wpd-cell-num[style*="green"]');
    return {
      kolumnyKpi: cs('.wpd-stats').gridTemplateColumns.split(' ').length,
      kartaZysku: cs('.wpd-stat--dark').backgroundColor,
      ramkaZysku: cs('.wpd-stat--dark').borderTopColor,
      tloStrony: getComputedStyle(document.body).backgroundColor,
      komorkaFont: cs('.wpd-table td').fontSize,
      naglowekFont: cs('.wpd-table th').fontSize,
      kwotaKolor: numer ? getComputedStyle(numer).color : 'BRAK',
      kwotaZawijanie: numer ? getComputedStyle(numer).whiteSpace : 'BRAK',
      rejestrLamanie: cs('.wpd-rpt-register').breakBefore,
    };
  });

  // Cztery wskaźniki w jednym rzędzie: w druku obowiązuje breakpoint mobilny
  // (szerokość strony < 980px), więc bez tej reguły karty wracają do układu 2x2
  // i zjadają połowę pierwszej kartki.
  expect(p.kolumnyKpi).toBe(4);
  // Karta „Zysk netto" na papierze jest ramką, nie plamą — odwrócenie znika przy
  // odznaczonej opcji „Grafika w tle" i zabiera ze sobą najważniejszą liczbę raportu.
  expect(p.kartaZysku).toBe('rgb(255, 255, 255)');
  // Hierarchię niesie ramka ciemniejsza od zwykłej --hairline — linia, nie plama.
  expect(p.ramkaZysku).not.toBe('rgb(221, 213, 195)');
  // Ogon ostatniej kartki wychodził w #f8fafc (tło <body> z czasów Tailwinda).
  expect(p.tloStrony).toBe('rgb(255, 255, 255)');
  // Gęstość dokumentu: 13,5px ekranowe -> 10,5px (ok. 8 pt) na papierze.
  expect(p.komorkaFont).toBe('10.5px');
  expect(p.naglowekFont).toBe('8.5px');
  // Kolor przy tekście tabelarycznym: --cynober daje 4,29:1 na bieli, a w skali
  // szarości zlewa się z --green. Liczby w tabelach idą --ink.
  expect(p.kwotaKolor).toBe('rgb(23, 21, 15)');
  // Kwota nigdy nie schodzi do drugiej linii („11 507 zł" łamało rytm tabeli).
  expect(p.kwotaZawijanie).toBe('nowrap');
  // Rejestr to załącznik — zaczyna się od świeżej kartki.
  expect(p.rejestrLamanie).toBe('page');
});
