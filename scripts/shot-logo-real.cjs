const { chromium } = require("playwright-core");
(async () => {
  const b = await chromium.launch({ channel: "msedge", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 300 }, deviceScaleFactor: 3 });
  await p.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle" });
  await p.waitForTimeout(900);
  await p.screenshot({ path: "shots/logo-real.png", clip: { x: 20, y: 12, width: 300, height: 60 } });
  await b.close();
})();
