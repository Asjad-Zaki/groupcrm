const { chromium } = require("playwright-core");
const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const page = await browser.newPage();
  
  const events = [];
  page.on('console', msg => events.push(`[CONSOLE ${msg.type()}] ${msg.text()}`));
  page.on('pageerror', err => events.push(`[PAGE ERROR] ${err.message}`));
  page.on('requestfailed', req => events.push(`[REQ FAILED] ${req.method()} ${req.url()} - ${req.failure()?.errorText}`));

  console.log('Navigating to http://localhost:5173/ ...');
  const startTime = Date.now();
  await page.goto('http://localhost:5173/', { waitUntil: 'load' });
  console.log(`Page load event fired in ${Date.now() - startTime}ms`);
  
  // Wait up to 5 seconds, checking DOM every 500ms
  for (let i = 0; i < 10; i++) {
    await page.waitForTimeout(500);
    const hasLoader = await page.evaluate(() => !!document.querySelector('.loader'));
    const bodyLength = await page.evaluate(() => document.body.innerText.trim().length);
    const rootHtml = await page.evaluate(() => document.getElementById('root')?.innerHTML.slice(0, 100));
    console.log(`[T+${(i+1)*500}ms] hasLoader: ${hasLoader}, textLen: ${bodyLength}, root: ${rootHtml?.replace(/\n/g, '')}`);
    if (!hasLoader && bodyLength > 0) {
      console.log('App successfully mounted and loader disappeared!');
      break;
    }
  }

  console.log('\n--- Captured Events ---');
  console.log(events.join('\n'));

  await browser.close();
})();
