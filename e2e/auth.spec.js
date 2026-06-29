import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock';

const mockDbData = {
  'users/uid-test': {
    accountStatus: 'active',
    name: 'Test User',
    email: 'test@example.com'
  }
};

test.describe('Authentication Tests', () => {
  // Tier 1: Feature Coverage (5 cases)
  test('Verify registration form inputs exist and are editable', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: mockDbData });
    await page.goto('/login');
    
    // Switch to Register
    await page.click('text=Rozpocznij 14-dniowy test');
    
    const nameInput = page.locator('input[name="name"]');
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    await nameInput.fill('Jan Nowak');
    await emailInput.fill('new@example.com');
    await passwordInput.fill('password123');
    
    await expect(nameInput).toHaveValue('Jan Nowak');
    await expect(emailInput).toHaveValue('new@example.com');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('Verify login form inputs exist and are editable', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: mockDbData });
    await page.goto('/login');
    
    const emailInput = page.locator('input[name="email"]');
    const passwordInput = page.locator('input[name="password"]');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('Verify error message display when wrong credentials are submitted', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: mockDbData });
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'wrong');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Nieprawidłowy e-mail lub hasło.')).toBeVisible();
  });

  test('Verify password visibility toggle button works', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: mockDbData });
    await page.goto('/login');
    
    const passwordInput = page.locator('input[name="password"]');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Toggle visibility (the eye icon button)
    await page.locator('button:has(svg.lucide-eye)').first().click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    
    // Toggle back
    await page.locator('button:has(svg.lucide-eye-off)').first().click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Verify redirect to dashboard when login succeeds', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: mockDbData });
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'correct-pass');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/dashboard');
    expect(page.url()).toContain('/dashboard');
  });

  // Tier 2: Boundary & Corner Cases (5 cases)
  test('Test signup with weak password (<6 characters) and verify error', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: mockDbData });
    await page.goto('/login');
    
    // Switch to register
    await page.click('text=Rozpocznij 14-dniowy test');
    
    await page.fill('input[name="name"]', 'New User');
    await page.fill('input[name="email"]', 'weak@example.com');
    await page.fill('input[name="password"]', '12345');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Hasło jest za słabe (wymagane minimum 6 znaków).')).toBeVisible();
  });

  test('Test signup with email already in use and verify error', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: mockDbData });
    await page.goto('/login');
    
    // Switch to register
    await page.click('text=Rozpocznij 14-dniowy test');
    
    await page.fill('input[name="name"]', 'Existing User');
    await page.fill('input[name="email"]', 'existing@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Konto z tym adresem e-mail już istnieje.')).toBeVisible();
  });

  test('Test login with empty email or invalid format', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: mockDbData });
    await page.goto('/login');
    await page.waitForSelector('form');
    
    // Disable native HTML5 validation so the form submits invalidemail
    await page.evaluate(() => {
      document.querySelector('form').setAttribute('novalidate', 'novalidate');
    });
    
    // Playwright test client-side validation for type="email"
    // To trigger client-side validation we can type invalid text
    await page.fill('input[name="email"]', 'invalidemail');
    await page.fill('input[name="password"]', 'somepass');
    await page.click('button[type="submit"]');
    
    // Our mock throws auth/invalid-email for invalidemail
    await expect(page.locator('text=Nieprawidłowy e-mail lub hasło.').or(page.locator('text=Nie udało się zalogować'))).toBeVisible();
  });

  test('Test login with unverified email and check banner', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: mockDbData });
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'unverified@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Twój adres email nie został jeszcze zweryfikowany.')).toBeVisible();
  });

  test('Test verification email resend cooldown button behavior', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: mockDbData });
    await page.goto('/login');
    
    // Switch to register
    await page.click('text=Rozpocznij 14-dniowy test');
    
    await page.fill('input[name="name"]', 'Verify User');
    await page.fill('input[name="email"]', 'verifyresend@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Should be redirected to verification screen
    const resendBtn = page.locator('button:has-text("ponownie")');
    await expect(resendBtn).toBeVisible();
    
    // Click resend
    await resendBtn.click();
    
    // Button should change state/text to cooldown and be disabled
    await expect(resendBtn).toBeDisabled();
    await expect(resendBtn).toContainText('Wysłano ponownie');
  });

  // Tier 3: Cross-Feature Combinations (1 case)
  test('Test signup flow redirecting to email verification, then clicking Przejdź do logowania to login panel', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: mockDbData });
    await page.goto('/login');
    
    // Go to register
    await page.click('text=Rozpocznij 14-dniowy test');
    
    await page.fill('input[name="name"]', 'Combo User');
    await page.fill('input[name="email"]', 'combo@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Checks email verification screen
    await expect(page.locator('text=Sprawdź swoją skrzynkę')).toBeVisible();
    
    // Click go back to login panel
    await page.click('text=Przejdź do logowania');
    
    // Verify we are back to login panel
    await expect(page.locator('text=Zaloguj się do panelu')).toBeVisible();
  });

  // Tier 4: Real-World Application (1 case)
  test('Full registration workflow: register -> verify screen -> resend cooldown -> back to login -> clean login', async ({ page }) => {
    await setupFirebaseMocks(page, { dbData: mockDbData });
    await page.goto('/login');
    
    // Register
    await page.click('text=Rozpocznij 14-dniowy test');
    await page.fill('input[name="name"]', 'Real User');
    await page.fill('input[name="email"]', 'realuser@example.com');
    await page.fill('input[name="password"]', 'securepassword123');
    await page.click('button[type="submit"]');
    
    // Verify screen is shown
    await expect(page.locator('text=Sprawdź swoją skrzynkę')).toBeVisible();
    
    // Click resend cooldown
    await page.click('text=Wyślij link ponownie');
    await expect(page.locator('button:has-text("Wysłano ponownie")')).toBeDisabled();
    
    // Go back to login panel
    await page.click('text=Przejdź do logowania');
    await expect(page.locator('text=Zaloguj się do panelu')).toBeVisible();
    
    // Now mock the email as verified by updating mock users list in window
    await page.evaluate(() => {
      if (window.__mockAuth) {
        window.__mockAuth.users['realuser@example.com'] = {
          uid: 'uid-real',
          email: 'realuser@example.com',
          displayName: 'Real User',
          emailVerified: true
        };
      }
    });
    
    // Login with clean credentials
    await page.fill('input[name="email"]', 'realuser@example.com');
    await page.fill('input[name="password"]', 'securepassword123');
    await page.click('button[type="submit"]');
    
    // Redirect to dashboard
    await page.waitForURL('**/dashboard');
    expect(page.url()).toContain('/dashboard');
  });
});
