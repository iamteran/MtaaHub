const { chromium } = require("playwright-core");

const BASE = "http://127.0.0.1:3100";
const PASSWORD = process.env.E2E_PASSWORD || "Password123!";
const results = [];

function log(name, ok, extra = "") {
  results.push(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? " — " + extra : ""}`);
}

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text()));
  page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));

  // 1. credentials sign in
  await page.goto(`${BASE}/auth/signin`, { waitUntil: "networkidle" });
  await page.fill("#email", "brian@mtaahub.co.ke");
  await page.fill("#password", PASSWORD);
  await Promise.all([page.waitForURL(/\/dashboard/, { timeout: 30000 }).catch(() => null), page.click('button[type="submit"]')]);
  log("credentials sign-in redirects to dashboard", page.url().includes("/dashboard"), page.url());

  // 2. create a listing
  await page.goto(`${BASE}/nyumba/list`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.fill("#title", "E2E sunny one bedroom in Kileleshwa");
  await page.fill("#rent", "32000");
  await page.fill("#deposit", "32000");
  await page.fill("#bedrooms", "1");
  await page.fill("#bathrooms", "1");
  await page.fill("#town", "Kileleshwa");
  await page.fill("#contactPhone", "0712345999");
  await page.fill("#description", "Quiet one bedroom with a balcony, borehole water and secure parking. Available immediately.");
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/nyumba\/(?!list)[a-z0-9]{20,}/, { timeout: 30000 }).catch(() => null);
  await page.waitForLoadState("networkidle").catch(() => null);
  const created = /\/nyumba\/(?!list)[a-z0-9]+/i.test(page.url());
  log("create listing redirects to detail page", created, page.url());

  const heading = created ? await page.locator("h1").first().innerText() : "";
  log("new listing renders its title", heading.includes("E2E sunny one bedroom"), heading);

  // 3. favourite it
  if (created) {
    await Promise.all([page.waitForLoadState("networkidle"), page.click("text=Save to favourites")]);
    const body = await page.locator("body").innerText();
    log("favourite action completes without error", !body.includes("Something went wrong"));
  }

  // 4. admin console as non-staff
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  log("non-staff blocked from /admin", page.url().includes("/dashboard"), page.url());

  // 5. public pages
  for (const path of ["/", "/nyumba", "/jobs", "/services", "/prices", "/safety", "/biashara", "/ai", "/auth/signin"]) {
    const response = await page.goto(BASE + path, { waitUntil: "domcontentloaded" });
    log(`GET ${path}`, response.status() === 200, String(response.status()));
  }

  // 6. 404 page
  const missing = await page.goto(`${BASE}/nyumba/does-not-exist`, { waitUntil: "domcontentloaded" });
  log("unknown listing → 404", missing.status() === 404, String(missing.status()));

  const realErrors = consoleErrors.filter((e) => !e.includes("404 (Not Found)"));
  log("no unexpected console errors", realErrors.length === 0, realErrors.slice(0, 3).join(" | "));

  console.log(results.join("\n"));
  await browser.close();
})();
