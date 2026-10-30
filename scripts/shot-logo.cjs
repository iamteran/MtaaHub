const { chromium } = require("playwright-core");
const MARK = `
<svg viewBox="0 0 48 48" width="240" height="240" fill="none">
  <defs>
    <linearGradient id="t" x1="4" y1="2" x2="44" y2="47" gradientUnits="userSpaceOnUse">
      <stop stop-color="#1AB57B"/><stop offset="0.55" stop-color="#0F8A56"/><stop offset="1" stop-color="#07543A"/>
    </linearGradient>
    <linearGradient id="s" x1="24" y1="0" x2="24" y2="20" gradientUnits="userSpaceOnUse">
      <stop stop-color="#ffffff" stop-opacity="0.28"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
  </defs>
  <rect width="48" height="48" rx="13" fill="url(#t)"/>
  <path d="M0 13C0 5.8 5.8 0 13 0h22c7.2 0 13 5.8 13 13v1.4C36 8.2 12 8.2 0 14.4V13Z" fill="url(#s)"/>
  <circle cx="24" cy="20.5" r="14.2" stroke="#ffffff" stroke-opacity="0.16" stroke-width="1.4"/>
  <path d="M24 6.6c-5.35 0-9.7 4.28-9.7 9.56 0 6.95 8.55 15.6 9.25 16.33a.62.62 0 0 0 .9 0c.7-.73 9.25-9.38 9.25-16.33 0-5.28-4.35-9.56-9.7-9.56Z" fill="#ffffff"/>
  <path d="M24 13.9 16.9 19.5v7.9h4.15v-4.75h5.9v4.75H31.1v-7.9L24 13.9Z" fill="#0A6A46"/>
</svg>`;
(async () => {
  const b = await chromium.launch({ channel: "msedge", headless: true });
  const p = await b.newPage({ viewport: { width: 900, height: 520 }, deviceScaleFactor: 2 });
  await p.setContent(`<body style="margin:0;background:#fff;font-family:system-ui;display:flex;gap:40px;align-items:center;padding:40px">
    <div>${MARK}</div>
    <div style="display:flex;align-items:center;gap:18px">
      <div style="width:110px;height:110px">${MARK}</div>
      <div><div style="font-size:56px;font-weight:800;letter-spacing:-2px">Mtaa<span style="color:#0B6B45">Hub</span></div>
      <div style="font-size:12px;letter-spacing:4px;color:#888;font-weight:600">CONNECT · COMPARE · THRIVE</div></div>
    </div>
  </body>`);
  await p.waitForTimeout(300);
  await p.screenshot({ path: "shots/logo-large.png" });
  await b.close();
})();
