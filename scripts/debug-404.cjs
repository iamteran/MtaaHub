const { chromium } = require("playwright-core");
(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage();
  page.on("response", (r) => { if (r.status() >= 400) console.log("HTTP", r.status(), r.url()); });
  await page.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await browser.close();
})();
