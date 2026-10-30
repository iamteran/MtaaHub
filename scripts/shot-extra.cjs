const { chromium } = require("playwright-core");
(async () => {
  const b = await chromium.launch({ channel: "msedge", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  p.on("requestfailed", (r) => console.log("REQFAIL", r.url()));
  for (const [path, name] of [["/safety","safety"],["/services","services"],["/ai","ai"]]) {
    await p.goto("http://127.0.0.1:3100" + path, { waitUntil: "load", timeout: 60000 });
    await p.waitForTimeout(1200);
    await p.screenshot({ path: "shots/" + name + ".png", fullPage: false });
    console.log("shot", name);
  }
  await b.close();
})();
