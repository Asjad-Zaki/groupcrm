const { chromium } = require("playwright-core");
const path = require("path");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\Mohammed Asjad Zaki\\.gemini\\antigravity\\brain\\2687b17e-69a3-4cc0-9212-fe5ac642603a";

async function run() {
  console.log("Launching Chrome...");
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const errors = [];

  // Desktop Test
  console.log("Testing Desktop view (1280x800)...");
  const desktopContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const desktopPage = await desktopContext.newPage();
  desktopPage.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`[Desktop Console Error] ${msg.text()}`);
    }
  });
  desktopPage.on("pageerror", (err) => {
    errors.push(`[Desktop Page Error] ${err.message}`);
  });

  await desktopPage.goto("http://localhost:5173/", { waitUntil: "domcontentloaded", timeout: 15000 });
  await desktopPage.waitForTimeout(3000);
  await desktopPage.screenshot({
    path: path.join(ARTIFACT_DIR, "verify_desktop_final.png"),
  });
  console.log("Desktop screenshot saved.");

  // Mobile Test
  console.log("Testing Mobile view (375x667)...");
  const mobileContext = await browser.newContext({
    viewport: { width: 375, height: 667 },
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  mobilePage.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(`[Mobile Console Error] ${msg.text()}`);
    }
  });
  mobilePage.on("pageerror", (err) => {
    errors.push(`[Mobile Page Error] ${err.message}`);
  });

  await mobilePage.goto("http://localhost:5173/", { waitUntil: "domcontentloaded", timeout: 15000 });
  await mobilePage.waitForTimeout(3000);
  await mobilePage.screenshot({
    path: path.join(ARTIFACT_DIR, "verify_mobile_final.png"),
  });
  console.log("Mobile screenshot saved.");

  // Check Deals route
  console.log("Testing Deals route...");
  await desktopPage.goto("http://localhost:5173/#/deals", { waitUntil: "domcontentloaded", timeout: 15000 });
  await desktopPage.waitForTimeout(2000);
  await desktopPage.screenshot({
    path: path.join(ARTIFACT_DIR, "verify_deals_final.png"),
  });
  console.log("Deals screenshot saved.");

  // Check Meetings route
  console.log("Testing Meetings route...");
  await desktopPage.goto("http://localhost:5173/#/meetings", { waitUntil: "domcontentloaded", timeout: 15000 });
  await desktopPage.waitForTimeout(2000);
  await desktopPage.screenshot({
    path: path.join(ARTIFACT_DIR, "verify_meetings_final.png"),
  });
  console.log("Meetings screenshot saved.");

  // Check Performance route
  console.log("Testing Performance route...");
  await desktopPage.goto("http://localhost:5173/#/performance", { waitUntil: "domcontentloaded", timeout: 15000 });
  await desktopPage.waitForTimeout(2000);
  await desktopPage.screenshot({
    path: path.join(ARTIFACT_DIR, "verify_performance_final.png"),
  });
  console.log("Performance screenshot saved.");

  await browser.close();

  console.log("\n--- VERIFICATION RESULT ---");
  if (errors.length > 0) {
    console.error("Errors found:", errors);
    process.exit(1);
  } else {
    console.log("SUCCESS: 0 errors detected, all routes rendered cleanly!");
  }
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
