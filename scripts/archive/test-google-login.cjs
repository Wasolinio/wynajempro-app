const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err));

  await page.goto('https://wynajempro.com/login');
  
  console.log('Navigated to /login');
  await page.waitForTimeout(2000);
  
  const [popup] = await Promise.all([
    page.waitForEvent('popup').catch(() => null),
    page.locator('button', { hasText: 'Google' }).click()
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
