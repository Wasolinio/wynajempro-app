import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock';
import { generateMicroAccount } from '../src/utils/taxCalculator';

const mockUser = {
  uid: 'uid-test',
  email: 'test@example.com',
  displayName: 'Test Host',
  emailVerified: true
};

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
  ['users/uid-test/settings/hostProfile']: {
    entityName: 'Jan Host',
    phone: '+48 999 888 777',
    email: 'jan@example.com',
    identifierType: 'NIP',
    taxIdentifier: '1234567890'
  }
};

const buildTaxesDbData = (taxForm, autoThreshold, taxIdentifier = '1234567890', bookings = []) => {
  return {
    'users/uid-test': {
      accountStatus: 'active',
      name: 'Test Host',
      email: 'test@example.com'
    },
    'users/uid-test/settings/tax': {
      taxForm,
      autoThreshold,
      rate: 8.5,
      isVatPayer: false
    },
    'users/uid-test/settings/hostProfile': {
      entityName: 'Test Host',
      identifierType: 'NIP',
      taxIdentifier
    },
    'users/uid-test/settings/properties': { items: [] },
    'users/uid-test/settings/sources': { items: [] },
    'users/uid-test/settings/categories': { items: [] },
    ...bookings.reduce((acc, b, index) => {
      acc[`users/uid-test/rentals/rental-${index}`] = b;
      return acc;
    }, {})
  };
};

test.describe('Guest Guide and Taxes E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  });

  // TIER 1: Feature Coverage (5 cases)

  test('1. Verify Guest Guide page loads header, cover image, and property ID', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: mockGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    await expect(page.locator('h1')).toContainText('Przewodnik Luksusowy');
    await expect(page.locator('text=Apartament Widokowy').first()).toBeVisible();
    // Falls back to placeholder icon cover container since coverImage is empty
    await expect(page.locator('svg.w-16.h-16')).toBeVisible();
  });

  test('2. Verify that wifi and access PIN card are locked (blurred/hidden) before accepting rules', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: mockGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    await expect(page.locator('text=••••••••').first()).toBeVisible();
    await expect(page.locator('text=Zaakceptuj regulamin, aby odkryć')).toBeVisible();
    await expect(page.locator('text=Luxury_Net')).not.toBeVisible();
  });

  test('3. Verify document acceptance checkbox list (Regulations, PPOŻ rules)', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: mockGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    await expect(page.locator('text=Akceptacja dokumentów')).toBeVisible();
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

  test('5. Verify Tax Summary Panel monthly gross, net, commission, and expense card rendering', async ({ page }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const bookings = [
      { type: 'booking', date: todayStr, endDate: todayStr, income: 1000, commission: 150 },
      { type: 'utility', date: todayStr, utilities: 200 }
    ];
    const dbData = buildTaxesDbData('general', false, '1234567890', bookings);

    await setupFirebaseMocks(page, { user: mockUser, dbData });
    await page.goto('/dashboard');
    await page.click('button:has-text("Podatki")');

    // Verify stat cards
    await expect(page.locator('text=Przychód brutto')).toBeVisible();
    await expect(page.locator('text=Przychód netto')).toBeVisible();
    await expect(page.locator('text=Prowizje portali')).toBeVisible();
    await expect(page.locator('text=Koszty ekspl.')).toBeVisible();
  });

  // TIER 2: Boundary & Corner Cases (5 cases)

  test('6. Verify loading non-existent guide ID displays "Brak Dostępu" error page', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: {} });
    await page.goto('/guide/nonexistent-id');

    await expect(page.locator('text=Brak Dostępu')).toBeVisible();
    await expect(page.locator('text=Ten przewodnik nie istnieje lub został usunięty.')).toBeVisible();
  });

  test('7. Verify that the custom individual microaccount number (NIP/PESEL format) is calculated correctly in the tax calculator and displayed on the panel', async ({ page }) => {
    const dbData = buildTaxesDbData('general', false, '1234567890');
    const expectedRaw = generateMicroAccount('1234567890', 'NIP');
    // XX 1010 0071 2222 1234 5678 9000
    const expectedFormatted = expectedRaw.replace(/(.{2})(.{4})(.{4})(.{4})(.{4})(.{4})(.{4})/, '$1 $2 $3 $4 $5 $6 $7');

    await setupFirebaseMocks(page, { user: mockUser, dbData });
    await page.goto('/dashboard');
    await page.click('button:has-text("Podatki")');

    await expect(page.locator(`text=${expectedFormatted}`).first()).toBeVisible();
  });

  test('8. Verify that if NIP/PESEL is missing, the microaccount field displays a warnings card to "Uzupełnij NIP lub PESEL"', async ({ page }) => {
    const dbData = buildTaxesDbData('general', false, ''); // empty tax identifier

    await setupFirebaseMocks(page, { user: mockUser, dbData });
    await page.goto('/dashboard');
    await page.click('button:has-text("Podatki")');

    await expect(page.locator('text=Uzupełnij NIP lub PESEL w ustawieniach').first()).toBeVisible();
  });

  test('9. Verify VAT-UE import of services calculation (23% of foreign portal commission) displays correctly', async ({ page }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const bookings = [
      // Booking from a foreign source (Booking.com) with 200 PLN commission -> 23% of 200 is 46 PLN
      { type: 'booking', date: todayStr, endDate: todayStr, income: 1000, commission: 200, source: 'Booking.com', isForeignSource: true }
    ];
    const dbData = buildTaxesDbData('general', false, '1234567890', bookings);

    await setupFirebaseMocks(page, { user: mockUser, dbData });
    await page.goto('/dashboard');
    await page.click('button:has-text("Podatki")');

    // VAT-UE should render 46.00
    await expect(page.locator('text=VAT-UE (Import Usług)')).toBeVisible();
    await expect(page.locator('text=46,00').first()).toBeVisible();
  });

  test('10. Verify that for Lump Sum (Ryczałt) with autoThreshold active, YTD progress bar and status card render progress, showing remaining amount to 100k or threshold exceeded text', async ({ page }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Case 1: Under threshold (60k gross)
    const bookingsUnder = [
      { type: 'booking', date: todayStr, endDate: todayStr, income: 60000 }
    ];
    const dbDataUnder = buildTaxesDbData('lump_sum', true, '1234567890', bookingsUnder);
    await setupFirebaseMocks(page, { user: mockUser, dbData: dbDataUnder });
    await page.goto('/dashboard');
    await page.click('button:has-text("Podatki")');

    await expect(page.locator('text=Próg Ryczałtu 100 000 zł')).toBeVisible();
    await expect(page.locator('text=60 000').first()).toBeVisible();
    await expect(page.locator('text=Brakuje 40 000 zł').first()).toBeVisible();

    // Case 2: Over threshold (120k gross)
    const bookingsOver = [
      { type: 'booking', date: todayStr, endDate: todayStr, income: 120000 }
    ];
    const dbDataOver = buildTaxesDbData('lump_sum', true, '1234567890', bookingsOver);
    await setupFirebaseMocks(page, { user: mockUser, dbData: dbDataOver });
    await page.goto('/dashboard');
    await page.click('button:has-text("Podatki")');

    await expect(page.locator('text=120 000').first()).toBeVisible();
    await expect(page.locator('text=Próg przekroczony!')).toBeVisible();
    await expect(page.locator('text=Przychód w 2026 roku przekroczył próg 100 000 zł')).toBeVisible();
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
    await expect(page.locator('text=Akceptacja dokumentów')).toBeVisible();

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
    await expect(page.locator('text=Kontakt z Gospodarzem')).toBeVisible();
    await expect(page.locator('text=Jan Host')).toBeVisible();
    await expect(page.locator('text=+48 999 888 777')).toBeVisible();
    await expect(page.locator('text=jan@example.com')).toBeVisible();
  });

});
