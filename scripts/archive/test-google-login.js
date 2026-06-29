const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err));

  await page.goto('https://wynajempro.com');
  
  console.log('Navigated to wynajempro.com');
  
  // click login button on landing page if needed
  // Let's assume the user goes to /login or clicks the login button on navbar
  // W nawigacji jest przycisk z tekstem "Zaloguj się" lub "Zaloguj"
  try {
    await page.click('text=Zaloguj się');
  } catch (e) {
    try {
      await page.goto('https://wynajempro.com/login');
    } catch (e2) {}
  }

  await page.waitForTimeout(2000);
  
  console.log('Clicking Google login button');
  // W LoginPanel przycisk to "Zaloguj się przez Google"
  
  const [popup] = await Promise.all([
    page.waitForEvent('popup').catch(() => null),
    page.click('text=Zaloguj się przez Google').catch(e => console.log('Failed to click google btn', e))
  ]);

  if (popup) {
    console.log('Popup opened:', popup.url());
    popup.on('console', msg => console.log('POPUP CONSOLE:', msg.text()));
    await popup.waitForLoadState('networkidle');
    console.log('Popup loaded URL:', popup.url());
  } else {
    console.log('No popup detected.');
  }

  await page.waitForTimeout(5000);
  await browser.close();
})();
