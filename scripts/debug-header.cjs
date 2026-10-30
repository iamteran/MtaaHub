const { chromium } = require("playwright-core");

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 700 } });
  const logs = [];
  page.on("console", (m) => logs.push(`${m.type()}: ${m.text()}`));
  page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));

  await page.goto("http://127.0.0.1:3100/", { waitUntil: "load" });
  await page.waitForTimeout(4000);

  const headerText = await page.locator("header").innerText();
  console.log("HEADER:", JSON.stringify(headerText));
  console.log("LOGS:", logs.slice(0, 15).join("\n"));

  await page.screenshot({ path: "shots/header-debug.png", clip: { x: 0, y: 0, width: 1440, height: 90 } });
  await browser.close();
})();
