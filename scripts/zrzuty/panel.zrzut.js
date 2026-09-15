import { test, expect } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setupFirebaseMocks } from '../../e2e/firebase-mock.js';
import { TODAY, user, dbData, PRZYCHOD_MIESIACA } from './dane-demo.js';

/*
  GENERATOR ZRZUTÓW PANELU na landing (plan uczłowieczenia, analiza Smoobu §7 pkt 3:
  „pokazujmy produkt, nie ilustrację produktu"). Uruchomienie: npm run zrzuty:build.

  Mechanika = ta sama, którą chodzą testy e2e: dev server Vite + atrapa Firebase
  (e2e/firebase-mock.js) zasilona zestawem z dane-demo.js. Zrzut z 31.08 (do analizy)
  zrobiono tymczasowym specem i skasowano — to trzecie powtórzenie tej samej lekcji
  (og:build, banery:build): eksport bez skryptu w repo nie daje się odtworzyć.

  Wynik: src/assets/landing/panel-<widok>.webp (import w JSX = URL z haszem, więc po
  regeneracji ani przeglądarka, ani CDN nie podadzą starego obrazka) oraz
  src/data/zrzutyPanelu.js z datą stanu (podpis „stan z …" na landingu liczy się z niej).
  Podgląd PNG ląduje w test-results/zrzuty/ (poza gitem).

  Twarde bramki (przerywają zamiast zapisać zły obrazek):
  - fonty marki z Google muszą DOJŚĆ — zrzut na foncie zastępczym nikt nie zauważy w diffie;
  - zegar przypięty PRZED goto — podtytuł Pulpitu liczy się przy ładowaniu modułu;
  - popup „Co nowego" nie ma prawa się pokazać; pływający widget zadań chowamy CSS-em
    (to zwijana nakładka, nie dane — zadania i tak są w panelu „Zadania na dziś").
*/

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ASSETS = join(ROOT, 'src', 'assets', 'landing');
const PODGLAD = join(ROOT, 'test-results', 'zrzuty');
const DANE = join(ROOT, 'src', 'data', 'zrzutyPanelu.js');
const JAKOSC_WEBP = 0.84;

const pad = (n) => String(n).padStart(2, '0');
const STAN = `${TODAY.getFullYear()}-${pad(TODAY.getMonth() + 1)}-${pad(TODAY.getDate())}`;
// „31 360" w panelu ma separator tysięcy z Intl (spacja niełamliwa) — dopasowanie tolerancyjne na biały znak
const KWOTA = new RegExp(String(PRZYCHOD_MIESIACA).replace(/\B(?=(\d{3})+(?!\d))/g, '\\s?'));

const WIDOKI = [
  {
    plik: 'panel-pulpit', nav: null,
    gotowe: async (page) => {
      await expect(page.locator('.wpd-stat')).toHaveCount(4);
      await expect(page.locator('.wpd-top__sub')).toContainText('WRZEŚNIA 2026');
      await expect(page.locator('.wpd-list').getByText('Rodzina Zielińskich')).toBeVisible();
      // jeden wyjazd dziś = jeden obiekt do sprzątania; więcej znaczy, że zaległe zadania z szablonów wróciły
      await expect(page.locator('.wpd-stat', { hasText: 'Do posprzątania' }).locator('.wpd-stat__value')).toHaveText('1');
      // liczba KOŃCOWA, nie klatka animacji — asercja czeka, aż useCountUp dojedzie do 1
      await expect(page.locator('.wpd-stat', { hasText: 'Przychód' }).locator('.wpd-stat__value')).toHaveText(KWOTA);
    },
    alt: 'Pulpit WynajemPRO na danych przykładowych: karty przychodu miesiąca, obłożenia, przyjazdów i sprzątania, lista najbliższych przyjazdów, wykres ostatnich 7 dni i zadania na dziś',
  },
  {
    plik: 'panel-kalendarz', nav: 'Kalendarz',
    gotowe: async (page) => {
      await expect(page.locator('.wpd-cal__head')).toBeVisible();
      await expect(page.locator('.wpd-cal__title')).toContainText(/wrzesie/i);
      await expect(page.locator('.wpd-cal__objname', { hasText: 'Domek Cisowy' })).toBeVisible();
    },
    alt: 'Kalendarz WynajemPRO na danych przykładowych: trzy obiekty w wierszach, dni września w kolumnach, rezerwacje jako paski w kolorze portalu',
  },
  {
    plik: 'panel-finanse', nav: 'Finanse',
    gotowe: async (page) => {
      await expect(page.getByRole('tab', { name: 'Przegląd' })).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator('.wpd-stat', { hasText: 'Zysk netto' })).toBeVisible();
      await expect(page.getByText('Przychód wg kanału')).toBeVisible();
      // ta sama liczba co na Pulpicie i w rankingu obiektów — łapana po końcu animacji
      await expect(page.locator('.wpd-stat', { hasText: 'Przychód' }).first().locator('.wpd-stat__value')).toHaveText(KWOTA);
    },
    alt: 'Finanse WynajemPRO na danych przykładowych: przychód, zysk netto i obłożenie miesiąca z porównaniem do poprzedniego, przychód wg kanału i ranking obiektów',
  },
  {
    plik: 'panel-zadania', nav: 'Zadania',
    gotowe: async (page) => {
      await expect(page.locator('h2', { hasText: 'Oś przypisania' })).toBeVisible();
      await expect(page.getByText('Odczyt liczników prądu').first()).toBeVisible();
    },
    alt: 'Zadania WynajemPRO na danych przykładowych: lista dnia z zaległymi, dzisiejszymi i nadchodzącymi zadaniami oraz oś przypisania na tydzień',
  },
];

async function otworzPanel(page) {
  await setupFirebaseMocks(page, { user, dbData });
  await page.clock.setFixedTime(TODAY); // PRZED goto — VIEW_META.pulpit.sub liczy się przy ładowaniu modułu
  await page.goto('/dashboard');
  await expect(page.locator('.wpd-side')).toBeVisible();

  // bramka fontów: load() zwraca listę dopasowanych FontFace — pusta = font nie doszedł
  const fonty = await page.evaluate(async () => {
    await document.fonts.ready;
    const wyniki = await Promise.all([
      document.fonts.load("500 12px 'IBM Plex Mono'"),
      document.fonts.load("700 16px 'Schibsted Grotesk'"),
    ]);
    return wyniki.map((w) => w.length);
  });
  expect(fonty.every((n) => n > 0), `fonty marki nie doszły (dopasowania: ${fonty.join('/')})`).toBe(true);

  await page.addStyleTag({
    content: '.wpd-taskwidget{display:none!important} *::-webkit-scrollbar{display:none!important} html,body,.wpd{scrollbar-width:none}',
  });
  await expect(page.locator('.wpd-dialog')).toHaveCount(0);
}

async function naWebp(context, png) {
  // Chromium koduje WebP przez canvas — bez sharp/cwebp, których w tym środowisku nie ma
  const p = await context.newPage();
  await p.setContent('<canvas id="c"></canvas>');
  const dataUrl = await p.evaluate(async ({ b64, q }) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.getElementById('c');
    c.width = img.naturalWidth; c.height = img.naturalHeight;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.toDataURL('image/webp', q);
  }, { b64: png.toString('base64'), q: JAKOSC_WEBP });
  await p.close();
  expect(dataUrl.startsWith('data:image/webp'), 'Chromium nie zakodował WebP').toBe(true);
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

test.describe.configure({ mode: 'serial' });

const wykonane = [];

for (const widok of WIDOKI) {
  test(`zrzut: ${widok.plik}`, async ({ page, context }) => {
    await otworzPanel(page);
    if (widok.nav) await page.locator('.wpd-nav__item', { hasText: widok.nav }).first().click();
    await widok.gotowe(page);
    await page.mouse.move(0, 0);
    // animacje wjazdu (.wpd-rise, słupki wykresów, useCountUp 700 ms) — asercje wyżej łapią
    // liczby, ale paski i sekcje dojeżdżają własnymi przejściami; margines ponad ich długość
    await page.waitForTimeout(1200);

    const png = await page.screenshot({ type: 'png', animations: 'disabled', caret: 'hide' });
    const webp = await naWebp(context, png);

    mkdirSync(ASSETS, { recursive: true });
    mkdirSync(PODGLAD, { recursive: true });
    writeFileSync(join(PODGLAD, `${widok.plik}.png`), png);
    writeFileSync(join(ASSETS, `${widok.plik}.webp`), webp);
    wykonane.push({ plik: `${widok.plik}.webp`, alt: widok.alt, bajty: webp.length });
    console.log(`✓ ${widok.plik}.webp — ${(webp.length / 1024).toFixed(0)} KB`);
  });
}

test('manifest: src/data/zrzutyPanelu.js', async () => {
  expect(wykonane.length, 'nie wszystkie widoki się wygenerowały — manifest nie zapisany').toBe(WIDOKI.length);
  const tresc = [
    '// GENEROWANE przez scripts/zrzuty/panel.zrzut.js (npm run zrzuty:build) — NIE edytuj ręcznie.',
    '// Data stanu = TODAY z scripts/zrzuty/dane-demo.js; landing bierze z niej podpis „stan z …".',
    `export const ZRZUTY_STAN = '${STAN}';`,
    `export const ZRZUTY_PANELU = ${JSON.stringify(wykonane.map(({ plik, alt }) => ({ plik, alt })), null, 2)};`,
    '',
  ].join('\n');
  writeFileSync(DANE, tresc);
});
