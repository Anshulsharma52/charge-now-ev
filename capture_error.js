import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));
  
  await page.goto('http://localhost:8080/login');
  
  // Fill login
  await page.fill('input[type="email"]', 'test2@test.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  // Wait for dashboard and log errors
  await page.waitForTimeout(5000);
  
  await browser.close();
})();
