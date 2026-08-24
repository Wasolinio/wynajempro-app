import { test, expect } from '@playwright/test';
import { setupFirebaseMocks } from './firebase-mock';

test('verify iCal token generation, retrofitting, and link display', async ({ page }) => {
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
    'users/uid-test/settings/hostProfile': {
      entityName: 'Test Host',
      phone: '+48 999 888 777',
      email: 'test@example.com',
      identifierType: 'NIP',
      taxIdentifier: '1234567890'
    },
    'users/uid-test/settings/properties': {
      items: [
        { name: 'Legacy Property 1', color: 'blue' },
        { name: 'Legacy Property 2', color: 'emerald', id: 'existing-id', secretToken: 'existing-token' }
      ]
    }
  };

  // 1. Set up standard mocks
  await setupFirebaseMocks(page, { user: mockUser, dbData: mockDbData });

  // 2. Perform mock login
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123'); // correct pass defaults to login success
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await expect(page).toHaveURL(/\/dashboard/);

  // 3. Open Settings Modal
  await page.locator('button:has(svg.lucide-settings)').first().click();

  // Settings Modal should be open on 'sync' tab by default
  const legacyProp1Input = page.locator('input[readOnly]').first();
  const legacyProp2Input = page.locator('input[readOnly]').nth(1);

  // Check legacy property 2 (which had 'existing-token')
  const legacyProp2Val = await legacyProp2Input.inputValue();
  expect(legacyProp2Val).toContain('token=existing-token');

  // Check legacy property 1 (which lacked token, thus got retrofitted)
  const legacyProp1Val = await legacyProp1Input.inputValue();
  expect(legacyProp1Val).toContain('token=');
  const tokenMatch = legacyProp1Val.match(/&token=([a-z0-9]+)/);
  expect(tokenMatch).not.toBeNull();
  expect(tokenMatch[1]).not.toBe('');

  // 4. Navigate to 'Nieruchomości' (Properties) tab
  await page.locator('button:has-text("Nieruchomości")').click();

  // Add a new property
  // UWAGA: placeholder ma typograficzny wielokropek „…", nie trzy kropki. Selektor po
  // pełnym placeholderze zgnił na tej jednej różnicy — dopasowanie po fragmencie jest odporne.
  await page.fill('input[placeholder^="Nazwa nowego obiektu"]', 'Nowy Apartament');
  await page.click('button[type="submit"]:has(svg.lucide-plus)');

  // 5. Navigate back to 'Integracje' tab
  await page.locator('button:has-text("Integracje")').click();

  // New property should be listed at index 2 (third input)
  //
  // X26 (2026-08-22): adres eksportu buduje się z ID obiektu, NIE z jego nazwy.
  // Do tej pory test pilnował `p=Nowy%20Apartament` — czyli utrwalał błąd: adres
  // wklejony wcześniej do Booking.com umierał po zmianie nazwy obiektu w panelu
  // (funkcja `exportIcal` zwracała 403 i portal po cichu przestawał widzieć blokady).
  // Asercja sprawdza teraz to, co ma być prawdą: w adresie jest identyfikator,
  // a nazwy w nim NIE MA.
  const newPropInput = page.locator('input[readOnly]').nth(2);
  const newPropVal = await newPropInput.inputValue();
  expect(newPropVal).not.toContain('Nowy%20Apartament');
  expect(newPropVal).toContain('token=');
  const idMatch = newPropVal.match(/[?&]p=([^&]+)/);
  expect(idMatch).not.toBeNull();
  expect(decodeURIComponent(idMatch[1]).length).toBeGreaterThan(8);

  // Obiekt z ustalonym wcześniej ID musi trafić do adresu tym właśnie ID.
  expect(legacyProp2Val).toContain('p=existing-id');

  // Save Settings
  await page.locator('button:has-text("Zapisz Ustawienia")').click();
  
  // Wait a moment for firestore write simulation
  await page.waitForTimeout(500);

  // Verify that Settings got saved correctly in mock Firestore with all tokens intact
  const savedDoc = await page.evaluate(() => window.__mockDbData['users/uid-test/settings/properties']);
  expect(savedDoc).not.toBeNull();
  expect(savedDoc.items).toHaveLength(3);
  expect(savedDoc.items[0].name).toBe('Legacy Property 1');
  expect(savedDoc.items[0].secretToken).not.toBeUndefined();
  expect(savedDoc.items[2].name).toBe('Nowy Apartament');
  expect(savedDoc.items[2].secretToken).not.toBeUndefined();
});
