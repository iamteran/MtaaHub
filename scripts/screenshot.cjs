const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");
const { encode } = require("next-auth/jwt");
const { PrismaClient } = require("@prisma/client");

const BASE = process.env.BASE_URL || "http://127.0.0.1:3100";
const OUT = process.env.OUT_DIR || path.join(__dirname, "..", "shots");

const prisma = new PrismaClient();

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const user = await prisma.user.findUnique({ where: { email: "admin@mtaahub.co.ke" } });
  if (!user) throw new Error("admin user missing — run the seed");

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET missing");

  const token = await encode({
    secret,
    token: {
      sub: user.id,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      picture: user.image,
    },
    maxAge: 60 * 60 * 2,
    salt: "authjs.session-token",
  });

  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();

  await page.goto(`${BASE}/`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(OUT, "home.png"), fullPage: true });

  await context.addCookies([
    { name: "authjs.session-token", value: token, domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax" },
    { name: "next-auth.session-token", value: token, domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax" },
  ]);

  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, "admin.png"), fullPage: true });

  await page.goto(`${BASE}/nyumba`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, "nyumba.png"), fullPage: true });

  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, "dashboard.png"), fullPage: true });

  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.goto(`${BASE}/jobs`, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(OUT, "jobs.png"), fullPage: true });

  console.log("screenshots written to", OUT);
  console.log("console errors:", errors.length ? errors.join("\n") : "none");

  await browser.close();
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
