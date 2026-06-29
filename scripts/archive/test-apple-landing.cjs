const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  try {
    const browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto('http://localhost:5173/prototyp2', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000); // Allow framer-motion animations to complete
    
    await page.screenshot({ path: '/Users/wasolinio/.gemini/antigravity/brain/e953cf05-5f6e-44fe-980e-15c0fea893b6/screenshot_apple.png', fullPage: true });
    
    await browser.close();
    console.log('Zrzut ekranu zapisany.');
  } catch (error) {
    console.error('Błąd:', error);
    process.exit(1);
  }
})();
