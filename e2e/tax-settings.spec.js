import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock';

/*
  X25 — ustawienia podatkowe po analizie prawnej z 2026-08-24.
  Test pilnuje trzech rzeczy, które łatwo cofnąć przypadkiem, a każda kosztuje
  gospodarza pieniądze:

  1. `rentalBasis` nie ma wartości domyślnej. Ryczałt to dwie różne sytuacje
     podatkowe — najem prywatny nie płaci składki zdrowotnej i nie ma odliczenia
     50%. Zaznaczenie czegokolwiek za gospodarza to zgadywanie cudzego statusu:
     ~10 tys. zł zawyżenia albo ~424 zł niedopłaty rocznie (analiza §B1).
  2. Kwota wolna startuje z 0. Grupa docelowa wynajmuje obok etatu, więc kwotę
     wolną konsumuje pracodawca — stare 30 000 odejmowało ją drugi raz i zaniżało
     podatek o 3 600 zł (§B8).
  3. „Płatnik" i „podatnik" to dwie różne role prawne (art. 8 Ordynacji) — §P1.
*/

const mockUser = { uid: 'uid-test', email: 'test@example.com', displayName: 'Test User', emailVerified: true };
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

async function otworzPodatki(page) {
  await setupFirebaseMocks(page, { user: mockUser, dbData: activeDb });
  await page.goto('/dashboard');
  await expect(page.locator('.wpd-side')).toBeVisible();
  await page.locator('.wpd-iconbtn').filter({ has: page.locator('svg.lucide-settings') }).first().click();
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible();
  await dialog.getByText('Podatki', { exact: true }).first().click();
  return dialog;
}

test('Podstawa wynajmu: pytamy, nie zgadujemy', async ({ page }) => {
  const bledy = [];
  page.on('console', (m) => { if (m.type() === 'error') bledy.push(m.text()); });
  const dialog = await otworzPodatki(page);

  await expect(dialog.getByText('Jak wynajmujesz', { exact: true })).toBeVisible();
  await expect(dialog.getByText(/Najem prywatny — wynajmuję poza działalnością/)).toBeVisible();
  await expect(dialog.getByText(/Działalność gospodarcza — mam wpis w CEIDG/)).toBeVisible();

  // Żadna opcja nie jest zaznaczona z góry — to jest cała istota poprawki.
  const grupa = dialog.locator('.wpd-fieldset').filter({ hasText: 'Jak wynajmujesz' });
  await expect(grupa.locator('input[type="radio"]:checked')).toHaveCount(0);
  await expect(dialog.getByText(/Nie doliczamy jej, dopóki nie wiemy/)).toBeVisible();

  // Podpowiedź przy składce zdrowotnej mówi prawdę o każdym z trzech stanów.
  await dialog.getByText(/Najem prywatny/).click();
  await expect(dialog.getByText(/nie jest tytułem do ubezpieczenia zdrowotnego/)).toBeVisible();
  await dialog.getByText(/Działalność gospodarcza/).click();
  await expect(dialog.getByText(/liczymy ją sami/)).toBeVisible();

  expect(bledy, `błędy konsoli: ${bledy.join(' | ')}`).toHaveLength(0);
});

test('Kwota wolna startuje z 0 i mówi dlaczego', async ({ page }) => {
  const dialog = await otworzPodatki(page);
  await dialog.getByText('Zasady ogólne (skala)').click();

  await expect(dialog.locator('input[type="number"]').first()).toHaveValue('0');
  await expect(dialog.getByText(/kwotę wolną uwzględnia już pracodawca/)).toBeVisible();
});

test('VAT: podatnik, nie płatnik — i bez pierwszej osoby', async ({ page }) => {
  const dialog = await otworzPodatki(page);

  await expect(dialog.getByText('Status VAT', { exact: true })).toBeVisible();
  await expect(dialog.getByText(/Czynny podatnik VAT — podatek liczony od kwoty netto/)).toBeVisible();
  await expect(dialog.getByText(/płatnikiem VAT/)).toHaveCount(0);
  await expect(dialog.getByText(/Jestem czynnym/)).toHaveCount(0);
});

test('Zakładka Podatki mieści się na 375 px', async ({ page }) => {
  const dialog = await otworzPodatki(page);
  await expect(dialog.getByText('Jak wynajmujesz', { exact: true })).toBeVisible();

  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(200);

  const szerokosc = await page.evaluate(() => document.body.scrollWidth);
  expect(szerokosc, 'strona rozpycha się w poziomie').toBeLessThanOrEqual(375);
});

test('Liniowy w ustawieniach: bez pytania o podstawę wynajmu i bez martwych pól', async ({ page }) => {
  const dialog = await otworzPodatki(page);

  await expect(dialog.getByText('Podatek liniowy 19%')).toBeVisible();
  await dialog.getByText('Podatek liniowy 19%').click();

  // Liniowy istnieje wyłącznie w działalności (art. 9a ust. 2 PIT) — pytanie znika.
  await expect(dialog.getByText('Jak wynajmujesz', { exact: true })).toHaveCount(0);
  await expect(dialog.getByText('Współwłasność małżeńska', { exact: true })).toHaveCount(0);
  // Kwota wolna należy do skali — pola nie ma.
  await expect(dialog.getByText(/Kwota wolna od podatku/)).toHaveCount(0);
  // Przełącznik ZUS-w-kosztach niczego by przy płaskiej stawce nie robił — ukryty.
  await expect(dialog.getByText(/Uwzględniaj składki ZUS w kosztach/)).toHaveCount(0);

  // Opis zdrowotnej mówi, dlaczego panel nie liczy sam — bez kwalifikowania obowiązku.
  await expect(dialog.getByText(/Panel nie wylicza składki zdrowotnej przy podatku liniowym/)).toBeVisible();
  await expect(dialog.getByText(/Składka zdrowotna, którą faktycznie płacisz/)).toBeVisible();
  await expect(dialog.getByText(/musisz/)).toHaveCount(0);

  // Powrót na ryczałt przywraca pytanie o podstawę wynajmu.
  await dialog.getByText('Ryczałt', { exact: true }).click();
  await expect(dialog.getByText('Jak wynajmujesz', { exact: true })).toBeVisible();
});

test('Współwłasność małżeńska: trzy stany, tylko przy najmie prywatnym', async ({ page }) => {
  const dialog = await otworzPodatki(page);

  // Przy działalności pola nie ma — ust. 6 mówi o przychodach z art. 6 ust. 1a.
  await dialog.getByText(/Działalność gospodarcza/).click();
  await expect(dialog.getByText('Współwłasność małżeńska', { exact: true })).toHaveCount(0);

  // Pojawia się dopiero przy najmie prywatnym, domyślnie „na własny rachunek".
  await dialog.getByText(/Najem prywatny/).click();
  await expect(dialog.getByText('Współwłasność małżeńska', { exact: true })).toBeVisible();
  await expect(dialog.getByText('Wynajmuję na własny rachunek')).toBeVisible();

  // Połowa: podpowiedź mówi o podziale i o tym, że próg zostaje.
  await dialog.getByText('Wspólnie z małżonkiem, każde rozlicza swoją część').click();
  await expect(dialog.getByText(/liczymy połowę tego, co wpłynęło/)).toBeVisible();
  await expect(dialog.getByText(/Próg pozostaje 100 000 zł/)).toBeVisible();

  // Całość: wymaga oświadczenia i odcina się od wspólnego rozliczenia rocznego.
  await dialog.getByText('Wspólnie z małżonkiem, całość rozliczam ja').click();
  await expect(dialog.getByText(/pisemne oświadczenie/)).toBeVisible();
  await expect(dialog.getByText(/próg wynosi 200 000 zł/)).toBeVisible();
  await expect(dialog.getByText(/nie to samo co wspólne rozliczenie roczne/)).toBeVisible();

  // Przy zasadach ogólnych znika — mechanizm dotyczy wyłącznie ryczałtu.
  await dialog.getByText('Zasady ogólne (skala)').click();
  await expect(dialog.getByText('Współwłasność małżeńska', { exact: true })).toHaveCount(0);
});
