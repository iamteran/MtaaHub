const { chromium } = require("playwright-core");
const PASSWORD = process.env.E2E_PASSWORD;
(async () => {
  const b = await chromium.launch({ channel: "msedge", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  p.on("response", (r) => {
    const u = r.url();
    if (u.includes("127.0.0.1:3100/nyumba")) console.log("RESP", r.status(), r.request().method(), u);
  });
  p.on("framenavigated", (f) => { if (f === p.mainFrame()) console.log("NAV", f.url()); });
  await p.goto("http://127.0.0.1:3100/auth/signin", { waitUntil: "networkidle" });
  await p.fill("#email", "brian@mtaahub.co.ke");
  await p.fill("#password", PASSWORD);
  await p.click('button[type="submit"]');
  await p.waitForURL(/dashboard/, { timeout: 30000 });
  await p.goto("http://127.0.0.1:3100/nyumba/list", { waitUntil: "networkidle" });
  await p.waitForTimeout(1000);
  await p.fill("#title", "Trace listing test one");
  await p.fill("#rent", "21000");
  await p.fill("#contactPhone", "0712345999");
  await p.fill("#description", "A trace test listing with enough characters to pass validation.");
  await p.click('button[type="submit"]');
  await p.waitForTimeout(6000);
  console.log("FINAL URL:", p.url());
  console.log("H1:", await p.locator("h1").first().innerText().catch(() => "none"));
  await b.close();
})();
