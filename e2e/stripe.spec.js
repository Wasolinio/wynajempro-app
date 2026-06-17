import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Past date for expired trials. */
const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

/** Future deletion date — 15 days from now. */
const futureDeletionDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

/** Authenticated user fixture. */
const mockUser = {
  uid: 'uid-test',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true
};

// ─── DB Data builders ───────────────────────────────────────────────────────

const buildDbData = (statusOverrides = {}) => ({
  'users/uid-test': {
    status: 'trial_expired',
    name: 'Test User',
    email: 'test@example.com',
    ...statusOverrides
  }
});

const trialExpiredDb = buildDbData({
  status: 'trial_expired',
  trialEndsAt: pastDate
});

const pastDueDb = buildDbData({ status: 'past_due' });

const canceledDb = buildDbData({
  status: 'canceled',
  scheduledDeletionAt: futureDeletionDate.toISOString()
});

const canceledNoDeleteDb = buildDbData({ status: 'canceled' });

const activeDb = buildDbData({ status: 'active' });


// ═══════════════════════════════════════════════════════════════════════════
//  TIER 1 — BASIC PAYWALL FEATURE COVERAGE
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Stripe Paywall — Tier 1: Feature Coverage', () => {

  test('Paywall renders for trial_expired user (no active subscription)', async ({ page }) => {
    await setupFirebaseMocks(page, { user: mockUser, dbData: trialExpiredDb });
    await page.goto('/dashboard');

    // Paywall title and pricing
    await expect(page.locator('text=Koniec okresu próbnego')).toBeVisible();
    await expect(page.locator('text=29.99')).toBeVisible();
    await expect(page.locator('text=zł / msc')).toBeVisible();

    // Subscribe button is present
    await expect(page.locator('button:has-text("Aktywuj subskrypcję i odzyskaj dane")')).toBeVisible();

    // Logout link present
    await expect(page.locator('button:has-text("Wyloguj się")')).toBeVisible();
  });

  test('Subscribe button triggers createCheckoutSession and attempts redirect', async ({ page }) => {
    // Track navigation attempts — window.location.assign is called with the Stripe URL
    let capturedUrl = null;
    await setupFirebaseMocks(page, { user: mockUser, dbData: trialExpiredDb });

    // Intercept window.location.assign to capture the Stripe redirect URL
    await page.addInitScript(() => {
      window.__capturedAssign = null;
      const _origAssign = window.location.assign.bind(window.location);
      window.location.assign = (url) => {
        window.__capturedAssign = url;
        // Don't actually navigate away
      };
    });

    await page.goto('/dashboard');
    await page.waitForSelector('text=Koniec okresu próbnego');

    // Click subscribe
    await page.click('button:has-text("Aktywuj subskrypcję i odzyskaj dane")');

    // Verify the redirect URL was captured
    capturedUrl = await page.evaluate(() => window.__capturedAssign);
    expect(capturedUrl).toContain('checkout.stripe.com');
  });

  test('Manage subscription button triggers createBillingPortalSession for canceled user', async ({ page }) => {
    await setupFirebaseMocks(page, { user: mockUser, dbData: canceledNoDeleteDb });

    await page.addInitScript(() => {
      window.__capturedAssign = null;
      window.location.assign = (url) => { window.__capturedAssign = url; };
    });

    await page.goto('/dashboard');
    await page.waitForSelector('text=Subskrypcja wygasła');

    // The "Otwórz panel zarządzania" button should be visible for canceled status
    const manageBtn = page.locator('button:has-text("Otwórz panel zarządzania")');
    await expect(manageBtn).toBeVisible();

    await manageBtn.click();

    const capturedUrl = await page.evaluate(() => window.__capturedAssign);
    expect(capturedUrl).toContain('billing.stripe.com');
  });

  test('Past_due banner appears with correct messaging', async ({ page }) => {
    await setupFirebaseMocks(page, { user: mockUser, dbData: pastDueDb });
    await page.goto('/dashboard');

    // Paywall title for past_due
    await expect(page.locator('text=Zaległa płatność')).toBeVisible();

    // Past due specific banner
    await expect(page.locator('text=Zaległość w płatności')).toBeVisible();
    await expect(page.locator('text=Twoja karta odrzuciła płatność')).toBeVisible();

    // Manage subscription button should be visible for past_due
    await expect(page.locator('button:has-text("Otwórz panel zarządzania")')).toBeVisible();
  });
});


// ═══════════════════════════════════════════════════════════════════════════
//  TIER 2 — BOUNDARY & CORNER CASES
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Stripe Paywall — Tier 2: Edge Cases', () => {

  test('Loading spinner appears on subscribe button during checkout session creation', async ({ page }) => {
    // Use a delayed function mock so the spinner is visible longer
    const functions = {
      createCheckoutSession: () => new Promise((resolve) => {
        setTimeout(() => resolve({ url: 'https://checkout.stripe.com/pay/delayed_session' }), 2000);
      })
    };

    await setupFirebaseMocks(page, { user: mockUser, dbData: trialExpiredDb, functions });

    await page.addInitScript(() => {
      window.location.assign = () => {};
    });

    await page.goto('/dashboard');
    await page.waitForSelector('text=Koniec okresu próbnego');

    await page.click('button:has-text("Aktywuj subskrypcję i odzyskaj dane")');

    // Spinner should appear (Loader2 with animate-spin)
    await expect(page.locator('button:has(svg.lucide-loader-circle)')).toBeVisible();

    // Subscribe button should be disabled while loading
    const subscribeBtn = page.locator('button').filter({ has: page.locator('svg.lucide-loader-circle') });
    await expect(subscribeBtn).toBeDisabled();
  });

  test('Loading spinner appears on manage subscription button during billing portal creation', async ({ page }) => {
    const functions = {
      createBillingPortalSession: () => new Promise((resolve) => {
        setTimeout(() => resolve({ url: 'https://billing.stripe.com/p/delayed_portal' }), 2000);
      })
    };

    await setupFirebaseMocks(page, { user: mockUser, dbData: canceledNoDeleteDb, functions });

    await page.addInitScript(() => {
      window.location.assign = () => {};
    });

    await page.goto('/dashboard');
    await page.waitForSelector('text=Subskrypcja wygasła');

    await page.click('button:has-text("Otwórz panel zarządzania")');

    // Spinner should appear in the manage button
    const manageBtn = page.locator('button').filter({ has: page.locator('svg.lucide-loader-circle') });
    await expect(manageBtn).toBeVisible();
  });

  test('Error handling when createCheckoutSession fails shows alert', async ({ page }) => {
    const functions = {
      createCheckoutSession: () => {
        throw new Error('Network error');
      }
    };

    await setupFirebaseMocks(page, { user: mockUser, dbData: trialExpiredDb, functions });
    await page.goto('/dashboard');
    await page.waitForSelector('text=Koniec okresu próbnego');

    // Listen for the alert dialog
    const alertPromise = page.waitForEvent('dialog');

    await page.click('button:has-text("Aktywuj subskrypcję i odzyskaj dane")');

    const dialog = await alertPromise;
    expect(dialog.message()).toContain('Wystąpił problem z wczytaniem płatności');
    await dialog.accept();

    // After error, subscribe button should become clickable again (loading state resets)
    await expect(page.locator('button:has-text("Aktywuj subskrypcję i odzyskaj dane")')).toBeVisible();
  });

  test('Paywall shows correct trial expiry messaging vs subscription canceled', async ({ page }) => {
    // First check trial_expired messaging
    await setupFirebaseMocks(page, { user: mockUser, dbData: trialExpiredDb });
    await page.goto('/dashboard');

    await expect(page.locator('text=Koniec okresu próbnego')).toBeVisible();
    await expect(page.locator('text=darmowy 14-dniowy dostęp')).toBeVisible();

    // "Otwórz panel zarządzania" should NOT be visible for trial_expired
    await expect(page.locator('button:has-text("Otwórz panel zarządzania")')).not.toBeVisible();
  });

  test('Canceled account with scheduled deletion shows deletion banner with days remaining', async ({ page }) => {
    await setupFirebaseMocks(page, { user: mockUser, dbData: canceledDb });
    await page.goto('/dashboard');

    await expect(page.locator('text=Subskrypcja wygasła')).toBeVisible();

    // Deletion banner
    await expect(page.locator('text=Planowana kasacja danych')).toBeVisible();
    await expect(page.locator('text=trwale i bezpowrotnie usunięci')).toBeVisible();

    // Days remaining badge — should show ~15 days
    const daysText = page.locator('text=/Pozostało: \\d+ dn/');
    await expect(daysText).toBeVisible();
  });
});


// ═══════════════════════════════════════════════════════════════════════════
//  TIER 3 — CROSS-FEATURE / COMBINATORIAL
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Stripe Paywall — Tier 3: Full Flows', () => {

  test('Full flow: expired trial → click subscribe → mock Stripe redirect → verify URL', async ({ page }) => {
    await setupFirebaseMocks(page, { user: mockUser, dbData: trialExpiredDb });

    await page.addInitScript(() => {
      window.__capturedAssign = null;
      window.location.assign = (url) => { window.__capturedAssign = url; };
    });

    await page.goto('/dashboard');

    // Step 1: Paywall is displayed
    await expect(page.locator('text=Koniec okresu próbnego')).toBeVisible();
    await expect(page.locator('text=29.99')).toBeVisible();

    // Step 2: Verify the description text
    await expect(page.locator('text=darmowy 14-dniowy dostęp')).toBeVisible();

    // Step 3: Click subscribe button
    const subscribeBtn = page.locator('button:has-text("Aktywuj subskrypcję i odzyskaj dane")');
    await expect(subscribeBtn).toBeEnabled();
    await subscribeBtn.click();

    // Step 4: Verify redirect URL contains Stripe checkout domain and mock session ID
    const capturedUrl = await page.evaluate(() => {
      return new Promise((resolve) => {
        // Small delay to let async function execute
        const check = () => {
          if (window.__capturedAssign) resolve(window.__capturedAssign);
          else setTimeout(check, 50);
        };
        check();
      });
    });

    expect(capturedUrl).toBe('https://checkout.stripe.com/pay/mock_session_123');
  });

  test('Billing portal flow for canceled subscriber', async ({ page }) => {
    await setupFirebaseMocks(page, { user: mockUser, dbData: canceledNoDeleteDb });

    await page.addInitScript(() => {
      window.__capturedAssign = null;
      window.location.assign = (url) => { window.__capturedAssign = url; };
    });

    await page.goto('/dashboard');

    // Step 1: Canceled paywall is displayed
    await expect(page.locator('text=Subskrypcja wygasła')).toBeVisible();
    await expect(page.locator('text=Twoja subskrypcja wygasła')).toBeVisible();

    // Step 2: Both buttons should be visible
    await expect(page.locator('button:has-text("Aktywuj subskrypcję i odzyskaj dane")')).toBeVisible();
    const manageBtn = page.locator('button:has-text("Otwórz panel zarządzania")');
    await expect(manageBtn).toBeVisible();

    // Step 3: Click manage subscription button
    await manageBtn.click();

    // Step 4: Verify redirect URL is the billing portal
    const capturedUrl = await page.evaluate(() => {
      return new Promise((resolve) => {
        const check = () => {
          if (window.__capturedAssign) resolve(window.__capturedAssign);
          else setTimeout(check, 50);
        };
        check();
      });
    });

    expect(capturedUrl).toBe('https://billing.stripe.com/p/mock_portal_123');
  });

  test('Past due user: both subscribe and manage buttons work correctly', async ({ page }) => {
    await setupFirebaseMocks(page, { user: mockUser, dbData: pastDueDb });

    await page.addInitScript(() => {
      window.__capturedAssigns = [];
      window.location.assign = (url) => { window.__capturedAssigns.push(url); };
    });

    await page.goto('/dashboard');
    await page.waitForSelector('text=Zaległa płatność');

    // Both buttons present
    await expect(page.locator('button:has-text("Aktywuj subskrypcję i odzyskaj dane")')).toBeVisible();
    await expect(page.locator('button:has-text("Otwórz panel zarządzania")')).toBeVisible();

    // Click manage subscription
    await page.click('button:has-text("Otwórz panel zarządzania")');

    const portalUrl = await page.evaluate(() => {
      return new Promise((resolve) => {
        const check = () => {
          if (window.__capturedAssigns.length > 0) resolve(window.__capturedAssigns[0]);
          else setTimeout(check, 50);
        };
        check();
      });
    });

    expect(portalUrl).toContain('billing.stripe.com');
  });

  test('Active user does NOT see paywall and reaches dashboard', async ({ page }) => {
    // Active users should bypass paywall entirely
    const activeDbWithSettings = {
      ...activeDb,
      // Need hostProfile settings to bypass the CompleteProfileScreen gate
      'users/uid-test/settings/hostProfile': {
        entityName: 'Test Company',
        identifierType: 'NIP',
        taxIdentifier: '1234567890',
        address: 'ul. Testowa 1',
        phone: '123456789',
        email: 'test@example.com'
      },
      'users/uid-test/settings/properties': { items: [{ name: 'Apartament A', color: 'blue', id: 'prop-1', secretToken: 'token1' }] },
      'users/uid-test/settings/sources': { items: ['Booking.com'] },
      'users/uid-test/settings/categories': { items: ['Wynajem'] }
    };

    await setupFirebaseMocks(page, { user: mockUser, dbData: activeDbWithSettings });
    await page.goto('/dashboard');

    // Paywall should NOT be visible
    await expect(page.locator('text=Koniec okresu próbnego')).not.toBeVisible();
    await expect(page.locator('text=Subskrypcja wygasła')).not.toBeVisible();
    await expect(page.locator('text=Zaległa płatność')).not.toBeVisible();

    // Dashboard content should be visible (the app title)
    await expect(page.locator('text=WynajemPro').first()).toBeVisible();
  });
});
