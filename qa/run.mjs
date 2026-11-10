// Repeatable release checks. Run after `npm run build`: npm test
import fs from "fs"; import path from "path"; import { chromium } from "playwright-core"; import { serve } from "./serve.mjs";
const root = "out", port = 8750, base = `http://127.0.0.1:${port}`, fails = [];
const fail = (m) => { fails.push(m); console.log("FAIL", m); };
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const banned = (process.env.QA_BANNED || "").split(",").filter(Boolean);
const files = walk(root).filter((f) => /\.(html|txt|xml|js)$/.test(f));
for (const f of files) { const t = fs.readFileSync(f, "utf8"); for (const b of banned) if (new RegExp(b, "i").test(t)) fail(`banned term "${b}" in ${f}`); if (f.endsWith(".html") && t.includes("{{")) fail(`template token in ${f}`); }
const slugs = fs.readdirSync(path.join(root, "work")).filter((f) => f.endsWith(".html")).map((f) => f.replace(".html", ""));
if (slugs.length !== 10) fail(`expected 10 case studies, found ${slugs.length}`);
for (const f of ["robots.txt", "sitemap.xml", "llms.txt", "og.png", "Kishore-Theiveekan-CV.pdf", "404.html"]) if (!fs.existsSync(path.join(root, f))) fail(`missing ${f}`);
const server = await serve(root, port);
const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"] });
for (const width of [320, 390, 768, 1024, 1440, 1920]) for (const route of ["/", `/work/${slugs[0]}`]) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 } }); const page = await ctx.newPage(); const errs = [];
  page.on("pageerror", (e) => errs.push(e.message)); page.on("console", (m) => { if (m.type() === "error") errs.push(m.text()); });
  const r = await page.goto(base + route); if (!r.ok()) fail(`${route} returned ${r.status()}`); await page.waitForTimeout(route === "/" ? 6000 : 1200);
  const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (over > 0) fail(`${route} overflows ${over}px at ${width}`);
  errs.forEach((e) => fail(`${route} @${width}: ${e.slice(0, 140)}`)); await ctx.close();
}
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } }); const page = await ctx.newPage(); await page.goto(base + "/"); await page.waitForTimeout(1000);
const links = await page.evaluate(() => [...new Set([...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")))]);
for (const l of links) { if (l === "#") fail("dead # link"); if (l.startsWith("/")) { const r = await ctx.request.get(base + l); if (!r.ok()) fail(`broken link ${l}`); } if (l.startsWith("#") && !(await page.locator(l).count())) fail(`missing anchor ${l}`); }
await browser.close(); server.close(); console.log(fails.length ? `${fails.length} FAILED` : "ALL CHECKS PASSED"); process.exit(fails.length ? 1 : 0);
