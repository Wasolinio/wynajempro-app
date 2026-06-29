const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));

  await page.goto('https://wynajempro.com/login');
  
  const [popup] = await Promise.all([
    page.waitForEvent('popup').catch(() => null),
    page.locator('button', { hasText: 'Google' }).click()
  ]);

  if (popup) {
    console.log('Popup opened:', popup.url());
    
    popup.on('response', async (response) => {
      if (response.status() >= 400) {
        console.log(`POPUP HTTP ERROR: ${response.status()} ${response.url()}`);
        try {
          const text = await response.text();
          console.log(`RESPONSE BODY:`, text);
        } catch(e) {}
      }
    });

    await popup.waitForLoadState('networkidle').catch(() => {});
    await popup.waitForTimeout(4000);
  }

  await browser.close();
})();
