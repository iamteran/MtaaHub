const { chromium } = require("playwright-core");
(async () => {
  const b = await chromium.launch({ channel: "msedge", headless: true });
  for (const [w, h, name] of [[1440, 1000, "header-1440"], [1280, 900, "header-1280"], [1024, 800, "header-1024"]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    await p.goto("http://127.0.0.1:3100/jobs", { waitUntil: "networkidle" });
    await p.waitForTimeout(800);
    await p.screenshot({ path: "shots/" + name + ".png", clip: { x: 0, y: 0, width: w, height: 92 } });
    await p.close();
  }
  await b.close();
})();
