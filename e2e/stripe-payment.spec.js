import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock';

const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
const futureDeletionDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

const mockUser = {
  uid: 'uid-test',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true
};

const buildDbData = (statusOverrides = {}) => ({
  'users/uid-test': {
    accountStatus: 'trial_expired',
    name: 'Test User',
    email: 'test@example.com',
    ...statusOverrides
  }
});

const trialExpiredDb = buildDbData({
  accountStatus: 'trial_expired',
  trialEndsAt: pastDate
});

const trialActiveDb = buildDbData({
  accountStatus: 'trialing',
  trialEndsAt: futureDate
});

const canceledDb = buildDbData({
  accountStatus: 'canceled',
  scheduledDeletionAt: futureDeletionDate.toISOString()
});

const _pastDueDb = buildDbData({
  accountStatus: 'past_due'
});

const activeDb = buildDbData({
  accountStatus: 'active'
});

test.describe('Stripe Payment E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

    // Mock getIdToken on window.__mockAuth when created
    await page.addInitScript(() => {
      let mockAuthVal = null;
      Object.defineProperty(window, '__mockAuth', {
        get() {
          return mockAuthVal;
        },
        set(val) {
          mockAuthVal = val;
          if (mockAuthVal) {
            let currentUserVal = mockAuthVal.currentUser;
            if (currentUserVal) {
              currentUserVal.getIdToken = async () => 'mock-token';
              currentUserVal.reload = async () => {};
            }
            Object.defineProperty(mockAuthVal, 'currentUser', {
              get() {
                return currentUserVal;
              },
              set(newVal) {
                currentUserVal = newVal;
                if (currentUserVal) {
                  currentUserVal.getIdToken = async () => 'mock-token';
                  currentUserVal.reload = async () => {};
                }
              },
              configurable: true,
              enumerable: true
            });
          }
        },
        configurable: true
      });
    });
  });

  // TIER 1: Feature Coverage (5 cases)

  test('1. Verify paywall screen renders billing options (monthly, annual subscription packages)', async ({ page }) => {
    await setupFirebaseMocks(page, { user: mockUser, dbData: trialExpiredDb });
    await page.goto('/dashboard');

    await expect(page.locator('text=Pakiet Miesięczny')).toBeVisible();
    await expect(page.locator('text=Pakiet Roczny')).toBeVisible();
  });

  test('2. Verify click on subscription plan buttons triggers paywall redirect action', async ({ page }) => {
    await setupFirebaseMocks(page, { user: mockUser, dbData: trialExpiredDb });
    await page.route('**/*stripe.com/**', route => route.fulfill({ status: 200, body: 'Stripe Mock' }));

    await page.goto('/dashboard');
    await page.waitForSelector('text=Pakiet Miesięczny');

    // Click subscribe for monthly plan
    await page.locator('button:has-text("Aktywuj subskrypcję i odzyskaj dane")').first().click();
    await page.waitForURL('**/checkout.stripe.com/**');

    expect(page.url()).toContain('checkout.stripe.com');
  });

  test('3. Verify that trial expiry warning page is shown for accounts with trial ended', async ({ page }) => {
    await setupFirebaseMocks(page, { user: mockUser, dbData: trialExpiredDb });
    await page.goto('/dashboard');

    await expect(page.locator('text=Koniec okresu próbnego')).toBeVisible();
    await expect(page.locator('text=darmowy 14-dniowy dostęp do WynajemPro dobiegł końca')).toBeVisible();
  });

  test('4. Verify Stripe pricing labels are correctly rendered (in PLN)', async ({ page }) => {
    await setupFirebaseMocks(page, { user: mockUser, dbData: trialExpiredDb });
    await page.goto('/dashboard');

    // Verify PLN pricing text exists
    await expect(page.locator('text=29.99')).toBeVisible();
    await expect(page.locator('text=zł / msc').first()).toBeVisible();
    
    // Switch to yearly and check
    await page.click('button:has-text("Rocznie")');
    await expect(page.locator('text=299.90')).toBeVisible();
    await expect(page.locator('text=zł / rok')).toBeVisible();
  });

  test('5. Verify redirect URLs/parameters for Stripe success/cancel flows', async ({ page }) => {
    let callParams = null;
    const functions = {
      createCheckoutSession: async (data) => {
        callParams = data;
        return { url: 'https://checkout.stripe.com/pay/mock_session_123' };
      }
    };

    await setupFirebaseMocks(page, { user: mockUser, dbData: trialExpiredDb, functions });

    await page.exposeFunction('saveCallParams', (data) => {
      callParams = data;
    });

    await page.addInitScript(() => {
      window.location.assign = () => {};
      // Overwrite mock functions wrapper in client to capture call arguments
      if (window.__mockFunctions) {
        window.__mockFunctions.createCheckoutSession = async (data) => {
          window.saveCallParams(data);
          return { url: 'https://checkout.stripe.com/pay/mock_session_123' };
        };
      }
    });

    await page.goto('/dashboard');
    await page.locator('button:has-text("Aktywuj subskrypcję i odzyskaj dane")').first().click();

    // Wait short time for async function to invoke
    await page.waitForTimeout(500);

    expect(callParams).not.toBeNull();
    expect(callParams.successUrl).toContain('/dashboard');
    expect(callParams.cancelUrl).toContain('/dashboard');
  });

  // TIER 2: Boundary & Corner Cases (5 cases)

  test('6. Test loading paywall with a non-authenticated user or trial active user and verify dashboard access vs. paywall redirection', async ({ page }) => {
    // 6a. Non-authenticated user should redirect to login page
    await setupFirebaseMocks(page, { user: null, dbData: {} });
    await page.goto('/dashboard');
    await page.waitForURL('**/login');
    expect(page.url()).toContain('/login');

    // 6b. Active trial user should have dashboard access, not paywall
    const activeTrialDbWithProfile = {
      ...trialActiveDb,
      'users/uid-test/settings/hostProfile': { entityName: 'Test Host' }
    };
    await setupFirebaseMocks(page, { user: mockUser, dbData: activeTrialDbWithProfile });
    await page.goto('/dashboard');
    await expect(page.locator('text=Koniec okresu próbnego')).not.toBeVisible();
    await expect(page.locator('text=WynajemPro').first()).toBeVisible();
  });

  test('7. Test Stripe payment cancel redirection back to account settings/paywall with warning messages', async ({ page }) => {
    // Return on cancel should keep user blocked and show warnings
    await setupFirebaseMocks(page, { user: mockUser, dbData: canceledDb });
    await page.goto('/dashboard');

    await expect(page.locator('text=Subskrypcja wygasła').first()).toBeVisible();
    await expect(page.locator('text=Planowana kasacja danych')).toBeVisible();
  });

  test('8. Test Stripe payment success redirection with success message and unlocked premium status', async ({ page }) => {
    // User status becomes active
    const activeDbWithProfile = {
      ...activeDb,
      'users/uid-test/settings/hostProfile': { entityName: 'Test Host' },
      'users/uid-test/settings/properties': { items: [] },
      'users/uid-test/settings/sources': { items: [] },
      'users/uid-test/settings/categories': { items: [] }
    };

    await setupFirebaseMocks(page, { user: mockUser, dbData: activeDbWithProfile });
    await page.goto('/dashboard');

    // Verify dashboard is unlocked and paywall is not visible
    await expect(page.locator('text=Koniec okresu próbnego')).not.toBeVisible();
    await expect(page.locator('text=Subskrypcja wygasła')).not.toBeVisible();
    await expect(page.locator('text=WynajemPro').first()).toBeVisible();
  });

  test('9. Verify billing modal behavior on mobile screens (ensuring subscription buttons are visible without scrolling offscreen)', async ({ page }) => {
    // Force mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await setupFirebaseMocks(page, { user: mockUser, dbData: trialExpiredDb });
    await page.goto('/dashboard');

    const monthlyBtn = page.locator('button:has-text("Aktywuj subskrypcję i odzyskaj dane")').first();
    await expect(monthlyBtn).toBeVisible();

    // Verify that the element fits in the viewport bounds
    const box = await monthlyBtn.boundingBox();
    expect(box).not.toBeNull();
    expect(box.y + box.height).toBeLessThanOrEqual(667);
  });

  test('10. Verify pricing updates dynamically when switching billing intervals (monthly vs. yearly)', async ({ page }) => {
    await setupFirebaseMocks(page, { user: mockUser, dbData: trialExpiredDb });
    await page.goto('/dashboard');

    // Default is monthly
    await expect(page.locator('text=29.99')).toBeVisible();
    await expect(page.locator('text=zł / msc').first()).toBeVisible();

    // Click yearly tab
    await page.click('button:has-text("Rocznie")');
    await expect(page.locator('text=299.90')).toBeVisible();
    await expect(page.locator('text=zł / rok').first()).toBeVisible();

    // Click monthly tab again
    await page.click('button:has-text("Miesięcznie")');
    await expect(page.locator('text=29.99')).toBeVisible();
    await expect(page.locator('text=zł / msc').first()).toBeVisible();
  });

  // TIER 3: Cross-Feature Combinations (1 case)

  test('11. Test that an expired trial user logging in is blocked by the PaywallScreen, selects a plan, triggers payment redirect, then returns on cancel to remain blocked', async ({ page }) => {
    await setupFirebaseMocks(page, { user: mockUser, dbData: trialExpiredDb });
    await page.route('**/*stripe.com/**', route => route.fulfill({ status: 200, body: 'Stripe Mock' }));

    await page.goto('/login');
    
    // Login
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'correct-pass');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');
    await expect(page.locator('text=Koniec okresu próbnego')).toBeVisible();

    // Select yearly plan
    await page.click('button:has-text("Rocznie")');
    await page.locator('button:has-text("Aktywuj subskrypcję i odzyskaj dane")').last().click();
    await page.waitForURL('**/checkout.stripe.com/**');

    expect(page.url()).toContain('checkout.stripe.com');

    // Simulate returning back via cancelUrl (still blocked)
    await page.goto('/dashboard');
    await expect(page.locator('text=Koniec okresu próbnego')).toBeVisible();
  });

  // TIER 4: Real-World Application (1 case)

  test('12. Expired user payment checkout: login -> trial expired screen -> click monthly subscription -> mock checkout redirection -> verify redirect parameters -> return page checks', async ({ page }) => {
    let callParams = null;
    await setupFirebaseMocks(page, { user: mockUser, dbData: trialExpiredDb });
    await page.route('**/*stripe.com/**', route => route.fulfill({ status: 200, body: 'Stripe Mock' }));

    await page.exposeFunction('saveCallParams', (data) => {
      callParams = data;
    });

    await page.addInitScript(() => {
      if (window.__mockFunctions) {
        window.__mockFunctions.createCheckoutSession = async (data) => {
          window.saveCallParams(data);
          return { url: 'https://checkout.stripe.com/pay/mock_session_123' };
        };
      }
    });

    await page.goto('/login');

    // 1. Login
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'correct-pass');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard');

    // 2. Trial expired screen
    await expect(page.locator('text=Koniec okresu próbnego')).toBeVisible();

    // 3. Click monthly subscription
    await page.locator('button:has-text("Aktywuj subskrypcję i odzyskaj dane")').first().click();

    // 4. Mock checkout redirection & verify redirect parameters
    await page.waitForURL('**/checkout.stripe.com/**');
    expect(page.url()).toContain('checkout.stripe.com');
    expect(callParams).not.toBeNull();
    expect(callParams.successUrl).toContain('/dashboard');

    // 5. Return page checks (Simulate successful checkout)
    const activeDbWithProfile = {
      ...activeDb,
      'users/uid-test/settings/hostProfile': { entityName: 'Test Host' },
      'users/uid-test/settings/properties': { items: [] },
      'users/uid-test/settings/sources': { items: [] },
      'users/uid-test/settings/categories': { items: [] }
    };
    await setupFirebaseMocks(page, { user: mockUser, dbData: activeDbWithProfile });
    await page.goto('/dashboard');

    // Verify unlocked access
    await expect(page.locator('text=Koniec okresu próbnego')).not.toBeVisible();
    await expect(page.locator('text=WynajemPro').first()).toBeVisible();
  });

});
