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
  'users/uid-test/settings/tax': {
    taxForm: 'lump_sum',
    autoThreshold: true,
    rate: 8.5,
    isVatPayer: false
  },
  'users/uid-test/settings/hostProfile': {
    entityName: 'Test Host',
    identifierType: 'NIP',
    taxIdentifier: '1234567890'
  }
};

const GUIDE_ID = 'guide_test_links_buttons';

const mockGuideData = {
  [`guides/${GUIDE_ID}`]: {
    name: 'Przewodnik Testowy',
    propertyId: 'Apartament 5',
    ownerId: 'uid-test',
    wifiNetwork: 'TestWiFi',
    wifiPassword: 'password123',
    doorPin: '1234#',
    hasSensitiveData: true,
    mapLink: 'https://maps.google.com/?q=Test',
    checkInInfo: 'Instrukcje zameldowania',
    houseRules: 'Regulamin obiektu'
  },
  [`guides/${GUIDE_ID}/secrets/data`]: {
    wifiNetwork: 'TestWiFi',
    wifiPassword: 'password123',
    doorPin: '1234#'
  },
  [`guides/${GUIDE_ID}/signatures/uid-guest`]: {
    acceptedRegulations: true,
    acceptedPpo: true
  }
};

test.describe('Links and Buttons Tests', () => {

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  });

  // Tier 1: Feature Coverage (5 cases)

  test('Verify navbar links to Landing, Blog, Contact, Login pages exist and are visible', async ({ page }) => {
    await setupFirebaseMocks(page);
    await page.goto('/');

    const logo = page.locator('text=WynajemPro').first();
    const blogLink = page.locator('header a[href="/blog"]').first();
    const contactLink = page.locator('header a[href="/kontakt"]').first();
    const loginLink = page.locator('header a[href="/login"]').first();

    await expect(logo).toBeVisible();
    await expect(blogLink).toBeVisible();
    await expect(contactLink).toBeVisible();
    await expect(loginLink).toBeVisible();
  });

  test('Verify footer links (Privacy Policy, Terms of Service) exist and navigate correctly', async ({ page }) => {
    await setupFirebaseMocks(page);
    await page.goto('/');

    const privacyLink = page.locator('footer a[href="/prywatnosc"]').first();
    const termsLink = page.locator('footer a[href="/regulamin"]').first();

    await expect(privacyLink).toBeVisible();
    await expect(termsLink).toBeVisible();

    await privacyLink.click();
    await page.waitForURL('**/prywatnosc');
    expect(page.url()).toContain('/prywatnosc');

    await page.goto('/');
    await termsLink.click();
    await page.waitForURL('**/regulamin');
    expect(page.url()).toContain('/regulamin');
  });

  test('Verify blog list page navigation: clicking a blog post card navigates to the blog post page', async ({ page }) => {
    await setupFirebaseMocks(page);
    await page.goto('/blog');
    await page.waitForSelector('a[href^="/blog/"]');

    // Click the first blog post
    const firstPostCard = page.locator('a[href^="/blog/"]').first();
    await expect(firstPostCard).toBeVisible();
    
    const href = await firstPostCard.getAttribute('href');
    await firstPostCard.click();
    
    await page.waitForURL(`**${href}`);
    expect(page.url()).toContain(href);
  });

  test('Verify contact page form submit button exists and is visible', async ({ page }) => {
    await setupFirebaseMocks(page);
    await page.goto('/kontakt');

    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    await expect(submitBtn).toContainText('Wyślij wiadomość');
  });

  test('Verify cookie banner acceptance: clicking "Akceptuj" closes the banner and stores preference', async ({ page }) => {
    await setupFirebaseMocks(page, { consentCookies: false });
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/');

    const banner = page.locator('text=Szanujemy Twoją prywatność');
    await expect(banner).toBeVisible();

    const acceptBtn = page.locator('button:has-text("Akceptuję")').first();
    await acceptBtn.click();

    await expect(banner).toBeHidden();
    
    const consent = await page.evaluate(() => localStorage.getItem('cookie_consent'));
    expect(consent).toBe('true');
  });

  // Tier 2: Boundary & Corner Cases (5 cases)

  test('Verify broken link safety (navigating to a non-existent URL routes to fallback page)', async ({ page }) => {
    await setupFirebaseMocks(page);
    await page.goto('/some-non-existent-page');

    // Routes to landing page fallback
    await page.waitForURL('**/');
    expect(page.url()).toBe(page.url().split('/')[0] + '//' + page.url().split('/')[2] + '/');
  });

  test('Verify external redirect links (like the google maps button on guide views) have target="_blank" and correct href', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: mockGuideData });
    await page.goto(`/guide/${GUIDE_ID}`);

    // Unlock credentials first
    await page.evaluate(() => {
      // Simulate acceptance
      localStorage.setItem(`wp_guest_${window.location.pathname.split('/').pop()}`, 'uid-guest');
    });
    await page.reload();

    const mapBtn = page.locator('a:has-text("Nawiguj (Mapy Google)")');
    await expect(mapBtn).toBeVisible();
    await expect(mapBtn).toHaveAttribute('target', '_blank');
    await expect(mapBtn).toHaveAttribute('href', 'https://maps.google.com/?q=Test');
  });

  test('Verify that submitting the contact form with missing inputs displays standard HTML5 validation messages', async ({ page }) => {
    await setupFirebaseMocks(page);
    await page.goto('/kontakt');

    const emailInput = page.locator('input[type="email"]');
    const submitBtn = page.locator('button[type="submit"]');

    // Trigger validation
    await submitBtn.click();

    const isEmailValid = await emailInput.evaluate(el => el.checkValidity());
    expect(isEmailValid).toBe(false);

    const emailValidationMessage = await emailInput.evaluate(el => el.validationMessage);
    expect(emailValidationMessage.length).toBeGreaterThan(0);
  });

  test('Verify that clicking "Pobierz plik CSV" on the tax panel triggers a file download stream', async ({ page }) => {
    await setupFirebaseMocks(page, { user: mockUser, dbData: mockDbData });
    await page.goto('/dashboard');

    await page.click('button:has-text("Podatki")');

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("Raport Księgowy")')
    ]);

    expect(download.suggestedFilename()).toContain('.csv');
  });

  test('Verify that copy-to-clipboard buttons (Wi-Fi password, Door PIN) update their label to "Skopiowano" and copy text', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-write', 'clipboard-read']);
    
    // Inject mock user to guide so secrets are fully returned
    const guideDataWithSig = {
      ...mockGuideData,
      [`guides/${GUIDE_ID}/signatures/uid-test`]: {
        acceptedRegulations: true,
        acceptedPpo: true
      }
    };
    
    let copiedText = '';
    await page.exposeFunction('mockWriteText', (text) => {
      console.log('MOCK WRITE TEXT CALLED WITH:', text);
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
      try {
        Object.defineProperty(Navigator.prototype, 'clipboard', {
          value: mockClipboard,
          configurable: true,
          writable: true
        });
      } catch {
        // ignore
      }
    });

    await setupFirebaseMocks(page, { user: mockUser, dbData: guideDataWithSig });
    await page.goto(`/guide/${GUIDE_ID}`);

    // Wifi copy
    const copyWifiBtn = page.locator('button:has-text("Kopiuj Hasło")');
    await expect(copyWifiBtn).toBeVisible();
    await copyWifiBtn.click();
    await expect(page.locator('button:has-text("Skopiowano")').first()).toBeVisible();
    expect(copiedText).toBe('password123');

    // Door PIN copy
    const copyPinBtn = page.locator('button:has-text("Kopiuj Kod")');
    await expect(copyPinBtn).toBeVisible();
    await copyPinBtn.click();
    await expect(page.locator('button:has-text("Skopiowano")').first()).toBeVisible();
    expect(copiedText).toBe('1234#');
  });

  // Tier 3: Cross-Feature Combinations (1 case)

  test('Navigate to blog, click a post, click back link, verify the list is preserved, then click the call-to-action button to navigate to the Auth panel', async ({ page }) => {
    await setupFirebaseMocks(page);
    await page.goto('/blog');
    await page.waitForSelector('a[href^="/blog/"]');

    // Verify blog list is loaded
    const listCount = await page.locator('a[href^="/blog/"]').count();
    expect(listCount).toBeGreaterThan(0);

    // Click first post
    const firstPost = page.locator('a[href^="/blog/"]').first();
    await firstPost.click();

    // Click back link
    const backBtn = page.locator('text=Wróć do Bazy Wiedzy');
    await backBtn.click();

    // Verify list preserved
    await page.waitForURL('**/blog');
    await page.waitForSelector('a[href^="/blog/"]');
    const newListCount = await page.locator('a[href^="/blog/"]').count();
    expect(newListCount).toBe(listCount);

    // Click first post again
    await page.locator('a[href^="/blog/"]').first().click();

    // Click CTA button to navigate to Auth panel
    const ctaBtn = page.locator('text=Wypróbuj za darmo');
    await expect(ctaBtn).toBeVisible();
    await ctaBtn.click();

    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');
  });

  // Tier 4: Real-World Application (1 case)

  test('Full navigation walkthrough: landing page -> check cookie banner -> accept cookies -> click blog -> view post -> click contacts -> fill form -> click register -> redirect', async ({ page }) => {
    await setupFirebaseMocks(page, { consentCookies: false });
    await page.addInitScript(() => {
      localStorage.clear();
    });
    await page.goto('/');

    // 1. Check cookie banner
    const banner = page.locator('text=Szanujemy Twoją prywatność');
    await expect(banner).toBeVisible();

    // 2. Accept cookies
    const acceptBtn = page.locator('button:has-text("Akceptuję")').first();
    await acceptBtn.click();
    await expect(banner).toBeHidden();

    // 3. Click blog
    await page.locator('header a[href="/blog"]').first().click();
    await page.waitForURL('**/blog');
    await page.waitForSelector('a[href^="/blog/"]');

    // 4. View post
    await page.locator('a[href^="/blog/"]').first().click();
    await page.waitForSelector('text=Wróć do Bazy Wiedzy');

    // 5. Click contacts (header link)
    await page.locator('header a[href="/kontakt"]').first().click();
    await page.waitForURL('**/kontakt');

    // 6. Fill form
    await page.fill('input[type="email"]', 'walkthrough@example.com');
    await page.fill('textarea', 'Jestem zainteresowany systemem.');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Wiadomość została wysłana!').first()).toBeVisible();

    // 7. Click register (Zarejestruj się link in LegalLayout header)
    await page.locator('text=Zarejestruj się').first().click();
    await page.waitForURL('**/login');

    // Go to registration
    await page.click('text=Rozpocznij 14-dniowy test');

    // Fill registration
    await page.fill('input[name="name"]', 'Walkthrough User');
    await page.fill('input[name="email"]', 'walkthrough-reg@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Redirect to email verification
    await expect(page.locator('text=Sprawdź swoją skrzynkę')).toBeVisible();
  });
});
