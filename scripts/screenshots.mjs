// Local-only helper: full-page screenshots of each sample home for the /designs/ gallery cards.
// Not deployed (netlify.toml sends /scripts/* to the 404 page).
//
// Run from the project folder:
//   npx -y -p playwright node scripts/screenshots.mjs            (all samples)
//   npx -y -p playwright node scripts/screenshots.mjs torque-bay (one or more slugs)
// If Playwright asks for a browser first: npx -y playwright install chromium
//
// What it does: serves the folder on a local port, opens each /samples/<slug>/ at 1280 wide with
// reduced motion and animations off, scrolls once so lazy images load, takes a full-page PNG
// (Torque Bay: one 1280×800 screen instead, see VIEWPORT_ONLY), then resizes it to 640 wide
// (capped at 5000px tall, cropped from the top) and saves WebP at quality 0.75
// to assets/images/designs/<slug>-full.webp. The WebP encoding happens in Chromium's canvas,
// so nothing else needs installing.

import { createServer } from "node:http";
import { readFile, stat, mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const OUT_DIR = join(ROOT, "assets", "images", "designs");
const SLUGS = ["ironbark-plumbing", "suurdeeg-bakehouse", "lindela-ledger", "fynbos-fringe", "torque-bay", "ridgeline-security"];
const CAPTURE_WIDTH = 1280;
const VIEWPORT_HEIGHT = 800;
const OUT_WIDTH = 640;
const MAX_HEIGHT = 5000;
const QUALITY = 0.75;
// Sticky split layouts: a full-page shot only shows the sticky half at the top and a blank column below,
// so these are captured as one 1280×800 screen instead (640×400 after resizing).
const VIEWPORT_ONLY = new Set(["torque-bay"]);

// npx puts its temporary node_modules/.bin on PATH; find playwright from there.
function loadPlaywright() {
  const dirs = (process.env.PATH || "").split(process.platform === "win32" ? ";" : ":");
  for (const dir of [join(ROOT, "node_modules", ".bin"), ...dirs]) {
    if (!/node_modules[\\/]\.bin$/.test(dir)) continue;
    try {
      return createRequire(join(dir, "..", "noop.js"))("playwright");
    } catch {}
  }
  console.error("Playwright not found. Run with: npx -y -p playwright node scripts/screenshots.mjs");
  process.exit(1);
}

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".mjs": "text/javascript",
  ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".ico": "image/x-icon",
  ".woff2": "font/woff2", ".json": "application/json", ".webmanifest": "application/manifest+json", ".txt": "text/plain",
};

function startServer() {
  const server = createServer(async (req, res) => {
    try {
      let path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
      let file = join(ROOT, path);
      if (!file.startsWith(ROOT + sep) && file !== ROOT) throw new Error("outside");
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
      const body = await readFile(file);
      res.writeHead(200, { "Content-Type": TYPES[extname(file).toLowerCase()] || "application/octet-stream" });
      res.end(body);
    } catch {
      res.writeHead(404).end("Not found");
    }
  });
  return new Promise((ok) => server.listen(0, "127.0.0.1", () => ok(server)));
}

async function shoot(browser, base, slug) {
  const context = await browser.newContext({
    viewport: { width: CAPTURE_WIDTH, height: VIEWPORT_HEIGHT },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  const problems = [];
  page.on("pageerror", (e) => problems.push(`JS error: ${e.message}`));
  page.on("response", (r) => { if (r.status() >= 400) problems.push(`${r.status()} ${r.url()}`); });

  await page.goto(`${base}/samples/${slug}/`, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important}" });

  // Scroll down in steps so lazy images load, then back to the top.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => Promise.all([...document.images].filter((i) => i.loading !== "lazy" || i.complete).map((i) => i.decode().catch(() => {}))));
  await page.evaluate(() => document.fonts.ready);

  const png = await page.screenshot({ fullPage: !VIEWPORT_ONLY.has(slug), animations: "disabled", caret: "hide", type: "png" });

  // Resize + encode in the browser: 640 wide, crop to 5000px tall, WebP.
  const result = await page.evaluate(async ({ b64, width, maxH, quality }) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const scale = width / img.naturalWidth;
    const fullH = Math.round(img.naturalHeight * scale);
    const h = Math.min(fullH, maxH);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, img.naturalWidth, h / scale, 0, 0, width, h);
    const url = canvas.toDataURL("image/webp", quality);
    return { data: url.split(",")[1], type: url.slice(5, url.indexOf(";")), h, fullH };
  }, { b64: png.toString("base64"), width: OUT_WIDTH, maxH: MAX_HEIGHT, quality: QUALITY });

  if (result.type !== "image/webp") throw new Error(`Browser could not encode WebP (got ${result.type})`);
  const buf = Buffer.from(result.data, "base64");
  await writeFile(join(OUT_DIR, `${slug}-full.webp`), buf);
  await context.close();

  const cropped = result.fullH > result.h ? ` (cropped from ${result.fullH})` : "";
  console.log(`${slug}: ${OUT_WIDTH}×${result.h}${cropped}, ${Math.round(buf.length / 1024)} KB`);
  problems.forEach((p) => console.log(`  ! ${p}`));
}

const wanted = process.argv.slice(2);
const slugs = wanted.length ? wanted.filter((s) => SLUGS.includes(s)) : SLUGS;
if (!slugs.length) {
  console.error(`Unknown slug. Pick from: ${SLUGS.join(", ")}`);
  process.exit(1);
}

const { chromium } = loadPlaywright();
await mkdir(OUT_DIR, { recursive: true });
const server = await startServer();
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
try {
  for (const slug of slugs) await shoot(browser, base, slug);
} finally {
  await browser.close();
  server.close();
}
