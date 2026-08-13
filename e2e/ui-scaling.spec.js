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
    await setupFirebaseMocks(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    await expect(page.locator('text=Wynajem').first()).toBeVisible();
    // Poniżej 900px desktopowa nawigacja ustępuje miejsca przyciskowi menu
    await expect(page.locator('header .wp4-nav')).toBeHidden();
    await expect(page.locator('.wp4-burger')).toBeVisible();
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
    // Zgoda na cookies z mocka: baner .wpc-bar jest fixed przy dolnej krawędzi i na
    // ekranie 667px zasłania połowę panelu, przechwytując kliki w jego pozycje.
    await setupFirebaseMocks(page);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const burger = page.locator('.wp4-burger');
    const panel = page.locator('#wp4-mnav');

    // Zamknięte na starcie
    await expect(burger).toHaveAttribute('aria-expanded', 'false');
    await expect(panel).toHaveCount(0);

    // Otwarcie: panel z kompletem sekcji + drogą do logowania (poniżej 560px tekstowy
    // link „Zaloguj się" znika z topbaru, więc panel jest jedyną drogą)
    await burger.click();
    await expect(panel).toBeVisible();
    await expect(burger).toHaveAttribute('aria-expanded', 'true');
    await expect(panel.locator('text=Cennik')).toBeVisible();
    await expect(panel.locator('text=FAQ')).toBeVisible();
    await expect(panel.locator('text=Zaloguj się')).toBeVisible();

    // Strona nie może się rozpychać w poziomie przy otwartym panelu
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);

    // Escape zamyka i oddaje fokus przyciskowi
    await page.keyboard.press('Escape');
    await expect(panel).toHaveCount(0);
    await expect(burger).toBeFocused();

    // Klik w pozycję menu zamyka panel
    await burger.click();
    const pozycjaCennik = panel.getByRole('link', { name: 'Cennik' });
    await expect(pozycjaCennik).toBeVisible();
    await pozycjaCennik.click();
    await expect(panel).toHaveCount(0);
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
    // Poniżej 980px .wpd-side znika, a nawigacja przechodzi do dolnego paska (X12)
    await page.locator('.wpd-bottombar button:has-text("Rezerwacje")').click();

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

  test('Dialog z parą pól dat nie przewija się w poziomie', async ({ page }) => {
    // Regresja zgłoszona przez właściciela przy smoke 4e (2026-08-13): modal „Edytuj koszt
    // stały" rozpychał się w poziomie i ucinał drugie pole daty. Przyczyna: pola typu
    // month/date mają dużą szerokość własną, a element siatki stoi domyślnie na
    // min-width:auto, więc nie dawał się ścisnąć w wąskim dialogu (--sm = 400 px).
    // Test celuje w SIATKĘ (.wpd-fgrid), bo to ona przepełniała rodzica — mierzenie
    // samego okna dialogu tego nie pokazuje.
    await setupFirebaseMocks(page, { user: mockUser, dbData: mockDbData });
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard');
    await page.waitForTimeout(500);

    await page.locator('button[title="Ustawienia"]').first().click({ force: true });
    await expect(page.locator('div.wpd-dialog').first()).toBeVisible();

    const siatki = page.locator('.wpd-dialog .wpd-fgrid');
    const ile = await siatki.count();
    // Bez tego test przestałby cokolwiek sprawdzać, gdyby modal kiedyś zmienił układ —
    // przechodziłby na zielono z zerem asercji (lekcja z [[Known-Issues]] #14).
    expect(ile, 'w dialogu nie ma ani jednej siatki pól — test stracił przedmiot').toBeGreaterThan(0);
    for (let i = 0; i < ile; i += 1) {
      const wymiary = await siatki.nth(i).evaluate((el) => ({ tresc: el.scrollWidth, widok: el.clientWidth }));
      expect(wymiary.tresc, `siatka pól #${i} przepełnia dialog`).toBeLessThanOrEqual(wymiary.widok);
    }
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
    // Na telefonie .wpd-top__btnlabel jest ukryta, więc przycisk jest sam ikonowy —
    // celujemy w title, który zostaje niezależnie od szerokości
    await expect(page.locator('button[title="Nowa rezerwacja"]')).toBeVisible();
  });

  // Tier 4: Real-World Application (1 case)
  test('Full user walkthrough: visit landing page on desktop, resize to mobile, verify inputs', async ({ page }) => {
    // setupFirebaseMocks ustawia zgodę na cookies (consentCookies domyślnie true). Bez tego
    // baner .wpc-bar wisi nad stopką i PRZECHWYTUJE klik w link „Kontakt" — klik nie dociera
    // do elementu i test wisi 30 s na locatorze, który jest w DOM.
    await setupFirebaseMocks(page);
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await expect(page.locator('text=Wynajem').first()).toBeVisible();
    
    // Navigate to Contact Page — link żyje w stopce, nie w nagłówku
    await page.locator('a[href="/kontakt"]').first().click();
    await page.waitForURL('**/kontakt');
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
