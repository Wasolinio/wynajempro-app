import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock';

const mockUser = {
  uid: 'uid-test',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true
};

const mockDbData = {
  'users/uid-test': {
    accountStatus: 'active',
    name: 'Test User',
    email: 'test@example.com'
  },
  'users/uid-test/settings/properties': {
    items: [
      { name: 'Domek nad Jeziorem', color: 'blue' },
      { name: 'Apartament Centrum', color: 'emerald' }
    ]
  },
  'users/uid-test/settings/sources': {
    items: ['Booking.com', 'Airbnb']
  },
  'users/uid-test/settings/categories': {
    items: ['Prąd', 'Woda']
  },
  'users/uid-test/settings/reminders': {
    items: [
      { id: 'directions', text: 'Wyślij wskazówki dojazdu', shortName: 'Dojazd', daysBefore: 3, icon: 'Mail' }
    ]
  },
  'users/uid-test/settings/tax': {
    taxForm: 'lump_sum',
    autoThreshold: true,
    rate: 8.5,
    isVatPayer: false,
    zusHealth: 0,
    zusSocial: 0,
    taxFreeAmount: 30000,
    includeZusInCosts: true
  },
  'users/uid-test/settings/hostProfile': {
    entityName: 'Test Host',
    identifierType: 'NIP',
    taxIdentifier: '1234567890',
    address: 'ul. Testowa 1, 00-001 Warszawa',
    phone: '123456789',
    email: 'host@example.com'
  },
  'users/uid-test/settings/syncLinks': {
    links: {}
  },
  'users/uid-test/rentals/rental-1': {
    id: 'rental-1',
    type: 'booking',
    property: 'Domek nad Jeziorem',
    guest: 'Jan Kowalski',
    source: 'Booking.com',
    date: '2026-12-20',
    endDate: '2026-12-25',
    income: '1500',
    commission: '150',
    tax: '114.75',
    isPaid: true,
    isCompleted: false,
    completedTasks: {}
  }
};

test.describe('UI Scaling Tests', () => {
  // Tier 1: Feature Coverage (5 cases)
  test('Test landing page layout elements are visible on standard desktop viewport (1280x720)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    
    // Check main elements
    await expect(page.locator('text=Wynajem').first()).toBeVisible();
    await expect(page.locator('text=Cennik').first()).toBeVisible();
    await expect(page.locator('text=Rozpocznij 14-dniowy test').first()).toBeVisible();
  });

  test('Test landing page layout elements are visible on mobile viewport (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('text=Wynajem').first()).toBeVisible();
    // Landing v2 NIE ma menu mobilnego: .wp4-nav jest ukrywana CSS-em i nic jej nie zastępuje.
    // Na telefonie widoczne zostaje logo i CTA; nawigacja żyje dopiero w stopce.
    await expect(page.locator('header .wp4-nav')).toBeHidden();
    await expect(page.locator('header .wp4-btn--primary')).toBeVisible();
  });

  test('Test navigation bar visibility on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    
    // Desktop navigation links should be visible
    const navBar = page.locator('header').first();
    await expect(navBar).toBeVisible();
    await expect(navBar.locator('text=Cennik')).toBeVisible();
  });

  test('Test mobile navigation menu hamburger toggle on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // ŚWIADOMY STAN, NIE BŁĄD TESTU: landing v2 nie ma hamburgera ani menu mobilnego.
    // Test pilnuje, że nawigacja jest ukryta i że nie pojawił się przycisk-widmo.
    // Jeśli menu mobilne kiedyś powstanie, ten test trzeba przepisać na jego zachowanie.
    await expect(page.locator('header .wp4-nav')).toBeHidden();
    // Wejście do panelu musi zostać osiągalne mimo braku nawigacji. Poniżej 560px tekstowy
    // link „Zaloguj się" też znika (.wp4-topbar__cta .wp4-link), więc jedyną drogą jest CTA.
    await expect(page.locator('header .wp4-btn--primary')).toBeVisible();
  });

  test('Test responsive bookings view: Desktop vs Mobile', async ({ page }) => {
    await setupFirebaseMocks(page, { user: mockUser, dbData: mockDbData });
    
    // Desktop: DesktopBookingsTable is rendered, MobileBookingsList is hidden
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/dashboard');
    await page.waitForTimeout(500); // let snapshot load
    await page.locator('button:has-text("Rezerwacje")').first().click();
    
    // Panel v2 nie ma pary „tabela desktop / lista mobile" na klasach Tailwind — jest JEDNA
    // responsywna tabela .wpd-table, która restackuje się CSS-em. Test pilnuje więc tego,
    // co ma znaczenie dla użytkownika: tabela jest widoczna i nic nie wychodzi poza ekran.
    const table = page.locator('table.wpd-table').first();
    await expect(table).toBeVisible();
    
    // Mobile: ta sama tabela ma się zrestackować, a nie zniknąć ani rozepchać strony
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    await expect(table).toBeVisible();
    expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(375);
  });

  // Tier 2: Boundary & Corner Cases (5 cases)
  test('Test layout at custom extra-small viewports (320px width)', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');
    
    // Layout remains readable and elements do not crash/overflow
    await expect(page.locator('text=Wynajem').first()).toBeVisible();
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('Test layout at large ultra-wide viewports (1920x1080)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    
    // Container constraints should hold (e.g., max-w-7xl, max-w-6xl center positioning)
    const content = page.locator('text=Wynajem').first();
    await expect(content).toBeVisible();
    const boundingBox = await content.boundingBox();
    expect(boundingBox.x).toBeGreaterThan(100); // Should be centered, not glued to the left edge
  });

  test('Test table columns visibility on medium screens (tablet: 768x1024)', async ({ page }) => {
    await setupFirebaseMocks(page, { user: mockUser, dbData: mockDbData });
    await page.setViewportSize({ width: 820, height: 1180 });
    await page.goto('/dashboard');
    await page.waitForTimeout(500);
    await page.locator('button:has-text("Rezerwacje")').first().click();
    
    const desktopTable = page.locator('table.wpd-table').first();
    await expect(desktopTable).toBeVisible();
    
    // Table content might be taking a moment to render
    await expect(desktopTable.locator('text=Jan Kowalski').first()).toBeVisible({ timeout: 10000 });
  });

  test('Test modal sizing (SettingsModal) on small mobile screens', async ({ page }) => {
    await setupFirebaseMocks(page, { user: mockUser, dbData: mockDbData });
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    await page.waitForTimeout(500);
    
    // Open settings modal (the button has class containing settings icon or can be found by selector)
    await page.locator('button[title="Ustawienia"]').first().click({ force: true });
    await expect(page.locator('text=Ustawienia aplikacji')).toBeVisible();
    
    // Check if modal container fits inside viewport
    const modal = page.locator('div.wpd-dialog').first();
    const box = await modal.boundingBox();
    expect(box.width).toBeLessThanOrEqual(375); // Should constrain to mobile width
  });

  test('Test cookie banner positioning on mobile vs desktop', async ({ page }) => {
    await page.goto('/');
    
    // Desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    const banner = page.locator('div.wpc-bar'); // baner zgody ma własny namespace .wpc (v2)
    await expect(banner).toBeVisible();
    let box = await banner.boundingBox();
    expect(box.y + box.height).toBeGreaterThan(600); // dolna krawędź blisko dołu ekranu (720px)

    // Mobile
    await page.setViewportSize({ width: 375, height: 667 });
    box = await banner.boundingBox();
    expect(box.width).toBeLessThanOrEqual(375); // Should span full width or constrained
  });

  // Tier 3: Cross-Feature Combinations (1 case)
  test('Test opening settings modal on mobile, toggling a setting, closing it, and verifying main dashboard', async ({ page }) => {
    await setupFirebaseMocks(page, { user: mockUser, dbData: mockDbData });
    
    // Setup mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/dashboard');
    
    // Open settings modal
    await page.locator('button[title="Ustawienia"]').first().click({ force: true });
    await expect(page.locator('text=Ustawienia aplikacji')).toBeVisible();
    
    // Switch to Tax tab using exact text match to avoid ambiguous matches
    await page.locator('button', { hasText: /^Podatki$/ }).first().click({ force: true });
    
    // Verify Tax setting inputs exist (e.g. Lump Sum threshold or VAT options)
    const vatText = page.locator('text=Jestem czynnym płatnikiem VAT');
    await expect(vatText).toBeVisible({ timeout: 10000 });
    
    // Close modal
    await page.locator('button.wpd-dialog__close').first().click({ force: true });
    
    // Verify we are back to dashboard elements
    await expect(page.locator('button', { hasText: /Dodaj rezerwację|Dodaj wpis/i }).first()).toBeVisible();
  });

  // Tier 4: Real-World Application (1 case)
  test('Full user walkthrough: visit landing page on desktop, resize to mobile, verify inputs', async ({ page }) => {
    // Visit landing page on desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await expect(page.locator('text=Wynajem').first()).toBeVisible();
    
    // Navigate to Contact Page
    await page.click('text=Kontakt');
    await expect(page.locator('text=Adres e-mail').first()).toBeVisible();
    
    // Resize viewport to mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    
    // Verify contact form elements are visible and centered/centered-aligned properly
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    const messageInput = page.locator('textarea').first();
    await expect(messageInput).toBeVisible();
  });
});
