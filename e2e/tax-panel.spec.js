import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock';

/*
  X25 — panel podatkowy w Finansach. Testy pilnują rzeczy, które analiza prawna
  z 2026-08-24 wskazała jako nośne: zastrzeżenie dokładnie raz, brak zer w polach
  składek, znikanie odliczenia 50% przy najmie prywatnym.
*/

const isoInDays = (n) => new Date(Date.now() + n * 86400000).toISOString().split('T')[0];
const mockUser = { uid: 'uid-test', email: 'test@example.com', displayName: 'Test User', emailVerified: true };

const bazaDb = (tax) => ({
  'users/uid-test': { accountStatus: 'active', name: 'Test User', email: 'test@example.com' },
  'users/uid-test/settings/hostProfile': {
    entityName: 'Test Company', identifierType: 'NIP', taxIdentifier: '1234567890',
    address: 'ul. Testowa 1', phone: '123456789', email: 'test@example.com',
  },
  'users/uid-test/settings/properties': { items: [{ name: 'Apartament A', color: 'blue', id: 'prop-1', secretToken: 't1' }] },
  'users/uid-test/settings/sources': { items: ['Booking.com'] },
  'users/uid-test/settings/categories': { items: ['Wynajem'] },
  'users/uid-test/settings/tax': tax,
  'users/uid-test/rentals/r1': {
    type: 'booking', property: 'Apartament A', date: isoInDays(-30), endDate: isoInDays(-25),
    income: 40000, commission: 4000, guests: 2, source: 'Booking.com',
  },
});

async function otworzPodatki(page, tax) {
  await setupFirebaseMocks(page, { user: mockUser, dbData: bazaDb(tax) });
  await page.goto('/dashboard');
  await page.locator('.wpd-nav__item', { hasText: 'Finanse' }).click();
  await page.locator('.wpd-tab', { hasText: 'Podatki' }).click();
  await expect(page.locator('.wpd-seg')).toBeVisible();
}

test('Zastrzeżenie prawne stoi dokładnie raz i mówi o zapłacie, nie tylko o zeznaniu', async ({ page }) => {
  const bledy = [];
  page.on('console', (m) => { if (m.type() === 'error') bledy.push(m.text()); });
  await otworzPodatki(page, { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'business' });

  const zastrzezenie = page.getByText(/nie jest deklaracją, wyliczeniem podatku ani poradą podatkową/);
  await expect(zastrzezenie).toHaveCount(1);
  await expect(page.getByText(/zanim zapłacisz\s+podatek albo złożysz deklarację/)).toBeVisible();
  await expect(page.getByText(/Nie odejmujemy zapłaconych\s+już zaliczek/)).toBeVisible();

  expect(bledy, `błędy konsoli: ${bledy.join(' | ')}`).toHaveLength(0);
});

test('Najem prywatny: bez składki zdrowotnej i bez odliczenia 50%', async ({ page }) => {
  await otworzPodatki(page, { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'private', viewMode: 'szczegolowy' });

  await expect(page.getByText('Składka zdrowotna · najem prywatny')).toBeVisible();
  await expect(page.getByText(/Odliczenie 50%/)).toHaveCount(0);
  // Nigdy „0 zł" w wierszu składki — zero czytałoby się jak twierdzenie o obowiązku.
  const rachunek = page.locator('.wpd-panel').filter({ hasText: 'Rachunek roku' });
  await expect(rachunek.getByText('0,00 zł', { exact: true })).toHaveCount(0);
});

test('Brak odpowiedzi o podstawę wynajmu odsyła do ustawień, nie pokazuje zera', async ({ page }) => {
  await otworzPodatki(page, { taxForm: 'lump_sum', autoThreshold: true });

  await expect(page.getByText('Zanim doliczymy składkę zdrowotną')).toBeVisible();
  await expect(page.getByText('Uzupełnij w ustawieniach →')).toBeVisible();
  await expect(page.getByText(/Odliczenie 50%/)).toHaveCount(0);
});

test('Działalność: odliczenie 50% jest i zgadza się z podstawą', async ({ page }) => {
  await otworzPodatki(page, { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'business', viewMode: 'szczegolowy' });

  await expect(page.getByText(/Odliczenie 50% zapłaconej składki zdrowotnej/)).toBeVisible();
  await expect(page.getByText(/art\. 11 ust\. 1a ustawy o ryczałcie/)).toBeVisible();
  // Etykieta nazywa PRZEDZIAŁ, nie samą górną granicę (§B6).
  await expect(page.getByText(/przychód do 60\s?000 zł/)).toBeVisible();
  await expect(page.getByText(/próg do 300\s?000 zł/)).toHaveCount(0);
});

test('Panel podatkowy mieści się na 375 px', async ({ page }) => {
  await otworzPodatki(page, { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'business', viewMode: 'szczegolowy' });
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(250);

  const szerokosc = await page.evaluate(() => document.body.scrollWidth);
  expect(szerokosc, 'strona rozpycha się w poziomie').toBeLessThanOrEqual(375);
  await page.screenshot({ path: 'test-results/panel-podatkowy-375.png' });
});

test('Współwłasność bez oświadczenia: panel tłumaczy, skąd połowa', async ({ page }) => {
  await otworzPodatki(page, {
    taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'private',
    spouseRental: 'polowa', viewMode: 'szczegolowy',
  });

  // Rezerwacja w atrapie ma 40 000 zł; do opodatkowania wchodzi połowa.
  // W szczegółach: rachunek tłumaczy podział.
  await expect(page.getByText(/Część małżonka · rozlicza ją u siebie/)).toBeVisible();
  await expect(page.getByText('Twój przychód do opodatkowania')).toBeVisible();
  await expect(page.getByText(/art\. 12 ust\. 5 i 6 ustawy o ryczałcie/)).toBeVisible();

  // W podsumowaniu: karta progu mówi, że to Twoja część, a próg zostaje 100 000 zł.
  await page.getByRole('tab', { name: 'Podsumowanie' }).click();
  await expect(page.getByText(/Próg ryczałtu · 100\s?000 zł · Twoja część/)).toBeVisible();
});

test('Oświadczenie małżeńskie podnosi próg do 200 000 zł', async ({ page }) => {
  await otworzPodatki(page, {
    taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'private', spouseRental: 'calosc',
  });

  await expect(page.getByText(/Próg ryczałtu · 200\s?000 zł · oświadczenie małżeńskie/)).toBeVisible();
  // Całość rozlicza jedno z małżonków, więc nic nie odejmujemy.
  await expect(page.getByText(/Część małżonka/)).toHaveCount(0);
});

test('Karta limitu VAT: widoczna bez statusu podatnika, z oboma zdaniami obowiązkowymi', async ({ page }) => {
  // Ustawienia domyślne = isVatPayer false → karta ma się pokazać (ADR-026).
  await otworzPodatki(page, { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'private' });

  await expect(page.getByText(/Limit zwolnienia z VAT · 240\s?000 zł/)).toBeVisible();
  // Rezerwacja w atrapie ma 40 000 zł → zostało 200 000 zł, stan spokojny.
  await expect(page.getByText(/Zostało\s*200\s?000 zł\s*wartości sprzedaży/)).toBeVisible();
  // Dwa zdania obowiązkowe: licznik tylko z aplikacji + proporcja pierwszego roku.
  await expect(page.getByText(/pozostała sprzedaż \(inny najem,\s*inna działalność\) także zużywa ten limit/)).toBeVisible();
  await expect(page.getByText(/W pierwszym roku działalności limit liczy\s*się proporcjonalnie/)).toBeVisible();
});

test('Karta limitu VAT: czynny podatnik jej nie widzi', async ({ page }) => {
  await otworzPodatki(page, { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'private', isVatPayer: true });
  await expect(page.getByText(/Limit zwolnienia z VAT/)).toHaveCount(0);
});

test('Przekroczenie limitu VAT: karta mówi o całej czynności, nie o stawce od nadwyżki', async ({ page }) => {
  // Mechanika z art. 113 ust. 5 jest inna niż przy progu ryczałtu — karta nie może
  // sugerować „od nadwyżki inna stawka".
  const db = bazaDb({ taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'private' });
  db['users/uid-test/rentals/r1'].income = 250000;
  await setupFirebaseMocks(page, { user: mockUser, dbData: db });
  await page.goto('/dashboard');
  await page.locator('.wpd-nav__item', { hasText: 'Finanse' }).click();
  await page.locator('.wpd-tab', { hasText: 'Podatki' }).click();
  await expect(page.locator('.wpd-seg')).toBeVisible();

  await expect(page.getByText(/Powyżej limitu o\s*10\s?000 zł/)).toBeVisible();
  await expect(page.getByText(/art\. 113 ust\. 5 ustawy o VAT/)).toBeVisible();

  const kartaVat = page.locator('.wpd-panel').filter({ hasText: 'Limit zwolnienia z VAT' });
  await expect(kartaVat.getByText(/12,5%/)).toHaveCount(0);
  await expect(kartaVat.getByText(/musisz/)).toHaveCount(0);
});

test('Liniowy 19%: karta wyniku bez karty progu ryczałtu, karta VAT zostaje', async ({ page }) => {
  await otworzPodatki(page, { taxForm: 'linear', zusHealth: 800, zusSocial: 0, viewMode: 'szczegolowy' });

  // Rachunek nazywa formę i pokazuje odliczenie wpisanej zdrowotnej (kwoty zależne
  // od bieżącego miesiąca — złote liczby pilnuje test:podatki, tu treści i widoczność).
  await expect(page.getByText('Podatek liniowy 19% od podstawy')).toBeVisible();
  await expect(page.getByText(/Odliczenie zapłaconej składki zdrowotnej/)).toBeVisible();
  await expect(page.getByText(/art\. 30c ust\. 2 pkt 2 PIT/)).toBeVisible();

  // Kwota wolna należy do skali — przy liniowym nie ma jej nawet informacyjnie.
  await expect(page.getByText(/kwota wolna z Twoich ustawień/)).toHaveCount(0);

  // Dopisek granic (L8): czego nie liczymy.
  await expect(page.getByText(/Nie uwzględniamy kosztów spoza aplikacji/)).toBeVisible();
  await expect(page.getByText(/strat z lat ubiegłych, wpłat na IKZE ani daniny solidarnościowej/)).toBeVisible();

  // Progu ryczałtu nie ma (liniowy nie ma progu)…
  await page.getByRole('tab', { name: 'Podsumowanie' }).click();
  await expect(page.getByText(/Próg ryczałtu/)).toHaveCount(0);
  // …ale limit zwolnienia z VAT zostaje — jest niezależny od formy dochodowej (L5).
  await expect(page.getByText(/Limit zwolnienia z VAT · 240\s?000 zł/)).toBeVisible();
  // Pytania o podstawę wynajmu nie zadajemy — liniowy to wyłącznie działalność.
  await expect(page.getByText('Zanim doliczymy składkę zdrowotną')).toHaveCount(0);
});

test('Eksport CSV: przycisk działa i plik niesie zastrzeżenie', async ({ page }) => {
  await otworzPodatki(page, { taxForm: 'lump_sum', autoThreshold: true, rentalBasis: 'business' });

  const pobranie = page.waitForEvent('download');
  await page.getByRole('button', { name: /Pobierz dla księgowej/ }).click();
  const plik = await pobranie;

  expect(plik.suggestedFilename()).toMatch(/^wynajempro-podatki-\d{4}-\d{4}-\d{2}-\d{2}\.csv$/);

  const strumien = await plik.createReadStream();
  const kawalki = [];
  for await (const k of strumien) kawalki.push(k);
  const tresc = Buffer.concat(kawalki).toString('utf8');

  expect(tresc.charCodeAt(0), 'BOM — bez niego Excel rozsypuje polskie znaki').toBe(0xFEFF);
  expect(tresc).toContain('Nie jest deklaracją, wyliczeniem podatku ani poradą podatkową');
  expect(tresc).toContain('VAT od prowizji portali (import usług) jest poza zakresem aplikacji');
  expect(tresc).toContain('Limit zwolnienia podmiotowego z VAT (art. 113)');
  expect(tresc).toContain('REZERWACJE');
  expect(tresc).toContain('RAZEM DO ODŁOŻENIA');
});
