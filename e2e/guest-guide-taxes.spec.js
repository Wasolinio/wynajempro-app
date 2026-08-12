import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock';

const GUIDE_ID = 'guide_test_guide_taxes';

const mockGuideData = {
  [`guides/${GUIDE_ID}`]: {
    name: 'Przewodnik Luksusowy',
    propertyId: 'Apartament Widokowy',
    ownerId: 'uid-test',
    wifiNetwork: 'Luxury_Net',
    wifiPassword: 'securepassword99',
    doorPin: '9988#',
    hasSensitiveData: true,
    checkInInfo: 'Skrytka na klucze kod 1234',
    mapLink: 'https://maps.google.com/?q=Luxury',
    houseRules: 'Szanuj ciszę nocną.',
    ppoRules: 'Gaśnica w korytarzu.',
    attractions: []
  },
  [`guides/${GUIDE_ID}/secrets/data`]: {
    wifiNetwork: 'Luxury_Net',
    wifiPassword: 'securepassword99',
    doorPin: '9988#'
  },
  // Przewodnik czyta wąski kontakt publiczny (RODO-UI, N5), nie pełny hostProfile.
  ['users/uid-test/settings/publicContact']: {
    entityName: 'Jan Host',
    phone: '+48 999 888 777',
    email: 'jan@example.com',
    identifierType: 'NIP',
    taxIdentifier: '1234567890'
  }
};

test.describe('Guest Guide and Taxes E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  });

  // TIER 1: Feature Coverage (4 cases)

  test('1. Verify Guest Guide page loads header, cover image, and property ID', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: mockGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    await expect(page.locator('h1')).toContainText('Przewodnik Luksusowy');
    await expect(page.locator('text=Apartament Widokowy').first()).toBeVisible();
    // coverImage jest puste, więc widok idzie ścieżką zastępczą: zamiast <img> rysuje
    // kafel z ikoną. Asercja celuje w BRAK obrazka, nie w klasy — te przepadły przy v2.
    await expect(page.locator('img[alt="Przewodnik Luksusowy"]')).toHaveCount(0);
  });

  test('2. Verify that wifi and access PIN card are locked (blurred/hidden) before accepting rules', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: mockGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    // v2 nie maskuje kropkami — przed akceptacją renderuje kartę blokady
    await expect(page.locator('text=Dane dostępowe zablokowane')).toBeVisible();
    await expect(page.locator('text=Luxury_Net')).not.toBeVisible();
  });

  test('3. Verify document acceptance checkbox list (Regulations, PPOŻ rules)', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: mockGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    await expect(page.locator('text=Odblokuj dane dostępowe')).toBeVisible();
    const regulationsCheckbox = page.locator('input[type="checkbox"]').first();
    const ppoCheckbox = page.locator('input[type="checkbox"]').nth(1);

    await expect(regulationsCheckbox).not.toBeChecked();
    await expect(ppoCheckbox).not.toBeChecked();
  });

  test('4. Verify clicking "Odkryj dane dostępowe" unlocks the access PIN and wifi network/password', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: mockGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    const regulationsCheckbox = page.locator('input[type="checkbox"]').first();
    const ppoCheckbox = page.locator('input[type="checkbox"]').nth(1);
    await regulationsCheckbox.check();
    await ppoCheckbox.check();

    const unlockBtn = page.locator('button:has-text("Odkryj dane dostępowe")');
    await unlockBtn.click();

    // Sensitive data unlocked
    await expect(page.locator('text=Luxury_Net')).toBeVisible();
    await expect(page.locator('text=securepassword99')).toBeVisible();
    await expect(page.locator('text=9988#')).toBeVisible();
  });

  // TIER 2: Boundary & Corner Cases (1 case)

  test('6. Verify loading non-existent guide ID displays "Brak Dostępu" error page', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: {} });
    await page.goto('/guide/nonexistent-id');

    await expect(page.locator('text=Brak Dostępu')).toBeVisible();
    await expect(page.locator('text=Ten przewodnik nie istnieje lub został usunięty.')).toBeVisible();
  });

  // TIER 3: Cross-Feature Combinations (1 case)

  test('11. Test Guest Guide View flow: anonymous authentication completes -> rules are displayed -> click check regulations -> click check PPOŻ -> click unlock -> access credentials unlock and copy buttons are verified', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-write', 'clipboard-read']);
    
    let copiedText = '';
    await page.exposeFunction('mockWriteText', (text) => {
      copiedText = text;
    });

    await page.addInitScript(() => {
      const mockClipboard = {
        writeText: async (text) => {
          window.mockWriteText(text);
        }
      };
      try {
        Object.defineProperty(navigator, 'clipboard', {
          value: mockClipboard,
          configurable: true,
          writable: true
        });
      } catch {
        // ignore
      }
    });

    await setupFirebaseMocks(page, { dbData: mockGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    // Anonymous login complete and rules displayed
    await expect(page.locator('text=Odblokuj dane dostępowe')).toBeVisible();

    // Click check regulations & check PPOŻ
    await page.locator('input[type="checkbox"]').first().check();
    await page.locator('input[type="checkbox"]').nth(1).check();

    // Click unlock
    await page.locator('button:has-text("Odkryj dane dostępowe")').click();

    // Copy wifi password
    await page.locator('button:has-text("Kopiuj Hasło")').click();
    await expect(page.locator('button:has-text("Skopiowano")').first()).toBeVisible();
    expect(copiedText).toBe('securepassword99');
  });

  // TIER 4: Real-World Application (1 case)

  test('12. Complete Guest workflow: loads guide page -> view arrival instructions -> open Google Map link -> scroll to rules -> check both agreements -> unlock details -> copy WiFi password -> verify host contact card info', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-write', 'clipboard-read']);

    let copiedText = '';
    await page.exposeFunction('mockWriteText', (text) => {
      copiedText = text;
    });

    await page.addInitScript(() => {
      const mockClipboard = {
        writeText: async (text) => {
          window.mockWriteText(text);
        }
      };
      try {
        Object.defineProperty(navigator, 'clipboard', {
          value: mockClipboard,
          configurable: true,
          writable: true
        });
      } catch {
        // ignore
      }
    });

    await setupFirebaseMocks(page, { dbData: mockGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    // 1. Loads guide page
    await expect(page.locator('h1')).toContainText('Przewodnik Luksusowy');

    // 2. View arrival instructions
    await expect(page.locator('text=Skrytka na klucze kod 1234')).toBeVisible();

    // 3. Open Google Map link (target="_blank" validation)
    const mapBtn = page.locator('a:has-text("Nawiguj (Mapy Google)")');
    await expect(mapBtn).toBeVisible();
    await expect(mapBtn).toHaveAttribute('target', '_blank');
    await expect(mapBtn).toHaveAttribute('href', 'https://maps.google.com/?q=Luxury');

    // 4. Scroll to rules and check both agreements
    const regulationsCheckbox = page.locator('input[type="checkbox"]').first();
    const ppoCheckbox = page.locator('input[type="checkbox"]').nth(1);
    await regulationsCheckbox.scrollIntoViewIfNeeded();
    await regulationsCheckbox.check();
    await ppoCheckbox.check();

    // 5. Unlock details
    await page.locator('button:has-text("Odkryj dane dostępowe")').click();

    // 6. Copy WiFi password
    await page.locator('button:has-text("Kopiuj Hasło")').click();
    await expect(page.locator('button:has-text("Skopiowano")').first()).toBeVisible();
    expect(copiedText).toBe('securepassword99');

    // 7. Verify host contact card info
    await expect(page.locator('text=Kontakt z gospodarzem')).toBeVisible();
    await expect(page.locator('text=Jan Host')).toBeVisible();
    await expect(page.locator('text=+48 999 888 777')).toBeVisible();
    await expect(page.locator('text=jan@example.com')).toBeVisible();
  });

});
