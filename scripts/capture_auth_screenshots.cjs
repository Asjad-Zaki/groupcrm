const { chromium } = require("playwright-core");
const path = require("path");

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ARTIFACT_DIR = "C:\\Users\\Mohammed Asjad Zaki\\.gemini\\antigravity\\brain\\2687b17e-69a3-4cc0-9212-fe5ac642603a";

async function run() {
  const browser = await chromium.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  // 1. Login Page
  console.log("Navigating to login page...");
  await page.goto("http://localhost:5173/#/login", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "verify_login_screen.png"),
  });
  console.log("Saved verify_login_screen.png");

  // 2. Click Quick Login for Navas (MD)
  console.log("Logging in as Navas (MD)...");
  const navasCard = page.locator('text=Navas (MD)');
  await navasCard.click();
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "verify_navas_dashboard.png"),
  });
  console.log("Saved verify_navas_dashboard.png");

  // 3. Open UserMenu to show enhanced Persona details & Switcher
  console.log("Opening UserMenu...");
  const userAvatar = page.locator('button.rounded-full.ring-1');
  if (await userAvatar.count() > 0) {
    await userAvatar.first().click();
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, "verify_usermenu_personas.png"),
    });
    console.log("Saved verify_usermenu_personas.png");
  }

  // 4. Log in as Asma (Casavera Interiors)
  console.log("Logging in as Asma (Casavera)...");
  await page.evaluate(() => {
    const asma = {
      id: 5,
      user_id: "5",
      first_name: "Asma",
      last_name: "(Interior Design)",
      email: "asma@casaverainteriors.com",
      role_name: "Lead Interior Designer",
      job_title: "Lead Interior Designer & Fit-out Specialist",
      tenant_ids: ["casavera"],
      administrator: false
    };
    localStorage.setItem("user", JSON.stringify(asma));
    localStorage.setItem("atomic-crm-active-tenant", "casavera");
  });
  await page.goto("http://localhost:5173/#/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, "verify_asma_casavera.png"),
  });
  console.log("Saved verify_asma_casavera.png");

  await browser.close();
  console.log("ALL SCREENSHOTS CAPTURED SUCCESSFULLY!");
}

run().catch((err) => {
  console.error("Screenshot capture failed:", err);
  process.exit(1);
});
