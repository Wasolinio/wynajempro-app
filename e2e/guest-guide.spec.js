import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const GUIDE_ID = 'guide_test_abc123';

const fullGuideData = {
  [`guides/${GUIDE_ID}`]: {
    name: 'Informator - Domek Leśny',
    propertyId: 'Domek Leśny',
    ownerId: 'owner-uid-123',
    coverImage: '',
    wifiNetwork: 'Domek_Goscie',
    wifiPassword: 'supertajne123',
    doorPin: '4455#',
    hasSensitiveData: true,
    checkInInfo: 'Kluczyk znajduje się w skrytce obok drzwi. Kod do skrytki: 9876.',
    mapLink: 'https://maps.app.goo.gl/example',
    houseRules: '1. Cisza nocna obowiązuje w godzinach 22:00 - 7:00.\n2. Zakaz palenia wewnątrz obiektu.\n3. Maksymalna liczba gości: 6 osób.',
    ppoRules: '- Zakaz używania otwartego ognia wewnątrz obiektu.\n- Upewnij się, że znasz lokalizację gaśnicy.',
    attractions: [
      { name: 'Pizzeria Napoli', description: 'Najlepsza pizza w okolicy', link: 'https://example.com/pizzeria' },
      { name: 'Jezioro Błękitne', description: 'Idealne na kąpiel', link: '' }
    ]
  },
  // Secrets subcollection
  [`guides/${GUIDE_ID}/secrets/data`]: {
    wifiNetwork: 'Domek_Goscie',
    wifiPassword: 'supertajne123',
    doorPin: '4455#'
  },
  // Host profile
  ['users/owner-uid-123/settings/hostProfile']: {
    entityName: 'Jan Kowalski',
    phone: '+48 123 456 789',
    email: 'jan@example.com'
  }
};

// Guide with no WiFi, no PIN, no attractions (minimal)
const minimalGuideData = {
  [`guides/${GUIDE_ID}`]: {
    name: 'Apartament Słoneczny',
    propertyId: 'Apartament A1',
    ownerId: 'owner-uid-456',
    coverImage: '',
    hasSensitiveData: false,
    checkInInfo: 'Klucze odbierz w recepcji.',
    mapLink: '',
    houseRules: 'Prosimy o utrzymanie porządku.',
    ppoRules: '',
    attractions: []
  }
};

// ─── Tier 1: Basic Feature Coverage ──────────────────────────────────────────

test.describe('Guest Guide — Tier 1: Basic Feature Coverage', () => {

  test('Guest guide page loads at /guide/:guideId with guide content visible', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: fullGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    // Loading spinner should disappear
    await expect(page.locator('text=Ładowanie przewodnika...')).not.toBeVisible({ timeout: 5000 });

    // Guide name is visible in the header
    await expect(page.locator('h1')).toContainText('Informator - Domek Leśny');

    // Footer branding
    await expect(page.locator('text=Stworzono za pomocą WynajemPRO')).toBeVisible();
  });

  test('Guide shows property name, WiFi section header, and house rules', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: fullGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    await expect(page.locator('h1')).toContainText('Informator - Domek Leśny');

    // Property ID badge
    await expect(page.locator('text=Domek Leśny').first()).toBeVisible();

    // WiFi section exists (masked before acceptance)
    await expect(page.locator('text=Sieć Wi-Fi')).toBeVisible();

    // House rules section
    await expect(page.locator('text=Regulamin Obiektu')).toBeVisible();
    await expect(page.locator('text=Cisza nocna obowiązuje')).toBeVisible();
  });

  test('Guest can accept regulations via checkboxes and unlock button', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: fullGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    await expect(page.locator('h1')).toContainText('Informator - Domek Leśny');

    // Acceptance section is visible
    await expect(page.locator('text=Akceptacja dokumentów')).toBeVisible();

    // The unlock button should be disabled before checking boxes
    const unlockButton = page.locator('button:has-text("Odkryj dane dostępowe")');
    await expect(unlockButton).toBeVisible();
    await expect(unlockButton).toBeDisabled();

    // Check the regulations checkbox
    const regulationsCheckbox = page.locator('input[type="checkbox"]').first();
    await regulationsCheckbox.check();

    // Check the PPOŻ checkbox
    const ppoCheckbox = page.locator('input[type="checkbox"]').nth(1);
    await ppoCheckbox.check();

    // Now the button should be enabled
    await expect(unlockButton).toBeEnabled();
  });

  test('Guide URL is clean and user-friendly at /guide/:guideId', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: fullGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    await expect(page.locator('h1')).toContainText('Informator - Domek Leśny');

    // URL should be clean /guide/<id> pattern
    expect(page.url()).toContain(`/guide/${GUIDE_ID}`);
    // Should not contain extraneous query params or hash fragments
    expect(page.url()).not.toContain('?');
    expect(page.url()).not.toContain('#');
  });
});

// ─── Tier 2: Boundary & Edge Cases ───────────────────────────────────────────

test.describe('Guest Guide — Tier 2: Boundary & Edge Cases', () => {

  test('Guide renders properly on mobile viewport (375x667)', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 667 }
    });
    const page = await context.newPage();

    await setupFirebaseMocks(page, { dbData: fullGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    await expect(page.locator('h1')).toContainText('Informator - Domek Leśny');

    // Key sections should be visible and not overflow
    await expect(page.locator('text=Sieć Wi-Fi')).toBeVisible();
    await expect(page.locator('text=Regulamin Obiektu')).toBeVisible();
    await expect(page.locator('text=Stworzono za pomocą WynajemPRO')).toBeVisible();

    // Ensure nothing overflows horizontally
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);

    await context.close();
  });

  test('Guide works without authentication (anonymous auth is used automatically)', async ({ page }) => {
    // No user is passed — anonymous auth should kick in via signInAnonymously mock
    await setupFirebaseMocks(page, { dbData: fullGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    // Page should load successfully without any auth error
    await expect(page.locator('text=Wystąpił błąd autoryzacji sesji')).not.toBeVisible();
    await expect(page.locator('h1')).toContainText('Informator - Domek Leśny');

    // The acceptance panel should be present (only for anonymous users)
    await expect(page.locator('text=Akceptacja dokumentów')).toBeVisible();
  });

  test('WiFi password and door PIN are masked before acceptance', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: fullGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    await expect(page.locator('h1')).toContainText('Informator - Domek Leśny');

    // Sensitive data should be masked with bullets
    await expect(page.locator('text=••••••••').first()).toBeVisible();

    // The lock overlay should be visible
    await expect(page.locator('text=Zaakceptuj regulamin, aby odkryć')).toBeVisible();

    // Actual WiFi password should NOT be visible yet
    await expect(page.locator('text=supertajne123')).not.toBeVisible();
    await expect(page.locator('text=4455#')).not.toBeVisible();
  });

  test('Acceptance checkboxes toggle correctly and enable/disable the unlock button', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: fullGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    await expect(page.locator('h1')).toContainText('Informator - Domek Leśny');

    const unlockButton = page.locator('button:has-text("Odkryj dane dostępowe")');
    const regulationsCheckbox = page.locator('input[type="checkbox"]').first();
    const ppoCheckbox = page.locator('input[type="checkbox"]').nth(1);

    // Initially disabled
    await expect(unlockButton).toBeDisabled();

    // Check only regulations — still disabled (PPO not checked)
    await regulationsCheckbox.check();
    await expect(unlockButton).toBeDisabled();

    // Check PPO — now enabled
    await ppoCheckbox.check();
    await expect(unlockButton).toBeEnabled();

    // Uncheck regulations — disabled again
    await regulationsCheckbox.uncheck();
    await expect(unlockButton).toBeDisabled();

    // Re-check regulations — enabled again
    await regulationsCheckbox.check();
    await expect(unlockButton).toBeEnabled();
  });
});

// ─── Tier 3: Full Flows & Combinatorial ──────────────────────────────────────

test.describe('Guest Guide — Tier 3: Full Flows & Combinatorial', () => {

  test('Full flow: open guide → read rules → accept → secrets revealed', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: fullGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    // 1. Guide loads
    await expect(page.locator('h1')).toContainText('Informator - Domek Leśny');

    // 2. Read house rules
    await expect(page.locator('text=Regulamin Obiektu')).toBeVisible();
    await expect(page.locator('text=Cisza nocna obowiązuje')).toBeVisible();

    // 3. Read PPOŻ rules
    await expect(page.locator('text=Instrukcja Bezpieczeństwa PPOŻ')).toBeVisible();
    await expect(page.locator('text=Zakaz używania otwartego ognia')).toBeVisible();

    // 4. Sensitive data is masked
    await expect(page.locator('text=Zaakceptuj regulamin, aby odkryć')).toBeVisible();
    await expect(page.locator('text=supertajne123')).not.toBeVisible();

    // 5. Check both checkboxes
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.first().check();
    await checkboxes.nth(1).check();

    // 6. Click unlock button
    const unlockButton = page.locator('button:has-text("Odkryj dane dostępowe")');
    await expect(unlockButton).toBeEnabled();
    await unlockButton.click();

    // 7. Acceptance panel should disappear, secrets revealed
    await expect(page.locator('text=Akceptacja dokumentów')).not.toBeVisible({ timeout: 5000 });

    // Lock overlay should be gone
    await expect(page.locator('text=Zaakceptuj regulamin, aby odkryć')).not.toBeVisible();

    // WiFi and PIN should now be visible
    await expect(page.locator('text=Domek_Goscie')).toBeVisible();
    await expect(page.locator('text=supertajne123')).toBeVisible();
    await expect(page.locator('text=4455#')).toBeVisible();

    // Copy buttons should now be visible
    await expect(page.locator('button:has-text("Kopiuj Hasło")')).toBeVisible();
    await expect(page.locator('button:has-text("Kopiuj Kod")')).toBeVisible();
  });

  test('Guide with missing optional fields (no WiFi, no PIN, no attractions) renders without errors', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: minimalGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    // Guide loads successfully
    await expect(page.locator('h1')).toContainText('Apartament Słoneczny');

    // Property ID badge
    await expect(page.locator('text=Apartament A1').first()).toBeVisible();

    // Check-in info is shown
    await expect(page.locator('text=Klucze odbierz w recepcji')).toBeVisible();

    // House rules are shown
    await expect(page.locator('text=Regulamin Obiektu')).toBeVisible();
    await expect(page.locator('text=Prosimy o utrzymanie porządku')).toBeVisible();

    // WiFi section should NOT appear (no wifiNetwork in guide data)
    await expect(page.locator('text=Sieć Wi-Fi')).not.toBeVisible();

    // Door PIN section should NOT appear
    await expect(page.locator('text=Kod do drzwi')).not.toBeVisible();

    // Attractions section should NOT appear (empty array)
    await expect(page.locator('text=Polecane Miejsca')).not.toBeVisible();

    // PPOŻ section should NOT appear (empty string)
    await expect(page.locator('text=Instrukcja Bezpieczeństwa PPOŻ')).not.toBeVisible();

    // No acceptance panel when hasSensitiveData is false
    await expect(page.locator('text=Akceptacja dokumentów')).not.toBeVisible();

    // No error or crash — footer is visible
    await expect(page.locator('text=Stworzono za pomocą WynajemPRO')).toBeVisible();
  });

  test('Non-existent guide shows error page', async ({ page }) => {
    // Empty DB — no guide document at all
    await setupFirebaseMocks(page, { dbData: {} });
    await page.goto('/guide/nonexistent-guide-id');

    // Error screen should be shown
    await expect(page.locator('text=Brak Dostępu')).toBeVisible();
    await expect(page.locator('text=Ten przewodnik nie istnieje lub został usunięty.')).toBeVisible();
  });

  test('Guide shows check-in instructions and Google Maps link', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: fullGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    await expect(page.locator('h1')).toContainText('Informator - Domek Leśny');

    // Check-in section
    await expect(page.locator('text=Wskazówki Dotarcia i Zameldowania')).toBeVisible();
    await expect(page.locator('text=Kluczyk znajduje się w skrytce obok drzwi')).toBeVisible();

    // Google Maps navigation link
    const mapsLink = page.locator('a:has-text("Nawiguj (Mapy Google)")');
    await expect(mapsLink).toBeVisible();
    await expect(mapsLink).toHaveAttribute('href', 'https://maps.app.goo.gl/example');
    await expect(mapsLink).toHaveAttribute('target', '_blank');
  });

  test('Guide shows attractions section with correct data', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: fullGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    await expect(page.locator('h1')).toContainText('Informator - Domek Leśny');

    // Attractions section
    await expect(page.locator('text=Polecane Miejsca')).toBeVisible();
    await expect(page.locator('text=Pizzeria Napoli')).toBeVisible();
    await expect(page.locator('text=Najlepsza pizza w okolicy')).toBeVisible();
    await expect(page.locator('text=Jezioro Błękitne')).toBeVisible();
    await expect(page.locator('text=Idealne na kąpiel')).toBeVisible();

    // First attraction has a link, second does not
    const sprawdzLink = page.locator('a:has-text("Sprawdź")');
    await expect(sprawdzLink).toBeVisible();
    await expect(sprawdzLink).toHaveAttribute('href', 'https://example.com/pizzeria');
  });

  test('Guide shows host contact information', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: fullGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    await expect(page.locator('h1')).toContainText('Informator - Domek Leśny');

    // Contact section
    await expect(page.locator('text=Kontakt z Gospodarzem')).toBeVisible();
    await expect(page.locator('text=Jan Kowalski')).toBeVisible();
    await expect(page.locator('text=+48 123 456 789')).toBeVisible();
    await expect(page.locator('text=jan@example.com')).toBeVisible();

    // Phone link
    const phoneLink = page.locator('a[href="tel:+48 123 456 789"]');
    await expect(phoneLink).toBeVisible();

    // Email link
    const emailLink = page.locator('a[href="mailto:jan@example.com"]');
    await expect(emailLink).toBeVisible();
  });

  test('Guide with only house rules (no PPOŻ) shows single checkbox for acceptance', async ({ page }) => {
    const guideWithoutPpo = {
      [`guides/${GUIDE_ID}`]: {
        name: 'Domek Górski',
        propertyId: 'Domek G1',
        ownerId: 'owner-uid-789',
        coverImage: '',
        wifiNetwork: 'Gorski_WiFi',
        wifiPassword: 'haslo789',
        doorPin: '',
        hasSensitiveData: true,
        checkInInfo: '',
        mapLink: '',
        houseRules: 'Zakaz grillowania na balkonie.',
        ppoRules: '',
        attractions: []
      },
      [`guides/${GUIDE_ID}/secrets/data`]: {
        wifiNetwork: 'Gorski_WiFi',
        wifiPassword: 'haslo789',
        doorPin: ''
      }
    };

    await setupFirebaseMocks(page, { dbData: guideWithoutPpo });
    await page.goto(`/guide/${GUIDE_ID}`);

    await expect(page.locator('h1')).toContainText('Domek Górski');

    // Acceptance panel should be visible
    await expect(page.locator('text=Akceptacja dokumentów')).toBeVisible();

    // Only one checkbox (regulations, no PPOŻ)
    const checkboxes = page.locator('input[type="checkbox"]');
    await expect(checkboxes).toHaveCount(1);

    // Check the single checkbox — button should become enabled
    await checkboxes.first().check();
    const unlockButton = page.locator('button:has-text("Odkryj dane dostępowe")');
    await expect(unlockButton).toBeEnabled();

    // Accept
    await unlockButton.click();

    // Secrets revealed
    await expect(page.locator('text=Gorski_WiFi')).toBeVisible();
    await expect(page.locator('text=haslo789')).toBeVisible();
  });
});
