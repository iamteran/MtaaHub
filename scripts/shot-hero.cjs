const { chromium } = require("playwright-core");
(async () => {
  const b = await chromium.launch({ channel: "msedge", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.goto("http://127.0.0.1:3100/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  await p.screenshot({ path: "shots/home-hero.png", clip: { x: 0, y: 0, width: 1440, height: 760 } });
  await p.screenshot({ path: "shots/home.png", fullPage: true });
  await b.close();
})();
