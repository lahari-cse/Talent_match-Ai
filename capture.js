const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  try {
    const randomNum = Math.floor(Math.random() * 100000);
    await page.goto('http://localhost:5174/register', { waitUntil: 'networkidle2' });
    await page.type('input[type="text"]', 'Test User ' + randomNum);
    await page.type('input[type="email"]', 'test' + randomNum + '@example.com');
    await page.type('input[type="password"]', 'password123');
    await page.select('select', 'candidate');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    console.log("Navigating to resume builder...");
    await page.goto('http://localhost:5174/resume-builder', { waitUntil: 'networkidle2' });
    console.log("Navigation complete.");
  } catch (err) {
    console.error("Navigation error:", err);
  }

  await browser.close();
})();
