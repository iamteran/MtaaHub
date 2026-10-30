const { chromium } = require("playwright-core");
(async () => {
  const b = await chromium.launch({ channel: "msedge", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await p.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  await p.locator("footer").screenshot({ path: "shots/footer.png" });
  await b.close();
})();
