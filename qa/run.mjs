// Repeatable release checks. Run after `npm run build`: npm test
import fs from "fs"; import path from "path"; import { chromium } from "playwright-core"; import { serve } from "./serve.mjs";
const root = "out", port = 8750, base = `http://127.0.0.1:${port}`, fails = [];
const fail = (m) => { fails.push(m); console.log("FAIL", m); };
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const banned = (process.env.QA_BANNED || "").split(",").filter(Boolean);
const files = walk(root).filter((f) => /\.(html|txt|xml|js|vtt)$/.test(f));
for (const f of files) { const t = fs.readFileSync(f, "utf8"); for (const b of banned) if (new RegExp(b, "i").test(t)) fail(`banned term "${b}" in ${f}`); if (f.endsWith(".html") && t.includes("{{")) fail(`template token in ${f}`); }
const slugs = fs.readdirSync(path.join(root, "work")).filter((f) => f.endsWith(".html")).map((f) => f.replace(".html", ""));
if (slugs.length !== 10) fail(`expected 10 case studies, found ${slugs.length}`);
const posts = fs.readdirSync(path.join(root, "writing")).filter((f) => f.endsWith(".html")).map((f) => f.replace(".html", ""));
if (posts.length !== 5) fail(`expected 5 articles, found ${posts.length}`);
if (!fs.existsSync(path.join(root, "writing.html"))) fail("missing writing index");
for (const f of walk(root).filter((f) => f.endsWith(".html"))) { const t = fs.readFileSync(f, "utf8"); const og = t.match(/property="og:image" content="[^"]*?(\/og[^"]*)"/); if (/noindex/.test(t) || f.endsWith("404.html") || f.includes("_not-found")) continue; if (!og) fail(`no og:image in ${f}`); else if (!fs.existsSync(path.join(root, og[1]))) fail(`og:image ${og[1]} missing for ${f}`); if (!/<meta name="description"/.test(t)) fail(`no description in ${f}`); if (!/rel="canonical"/.test(t)) fail(`no canonical in ${f}`); }
// Fonts are subset (scripts/subset-fonts.sh). Any visible character outside the subset would fall back to another font.
const FONT_CHARS = /[\u0020-\u007E\u00A0\u00A9\u00B0\u00B7\u00E7\u00F7\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026\u2190-\u2193\u2197\u2265\u2713\u2715\s]/;
for (const f of walk(root).filter((f) => f.endsWith(".html"))) { const text = fs.readFileSync(f, "utf8").replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;|&#\d+;/g, " "); const bad = [...new Set([...text].filter((c) => !FONT_CHARS.test(c)))]; if (bad.length) fail(`characters outside the font subset in ${f}: ${bad.join(" ")}`); }
// Every page is plain HTML (scripts/strip-react.mjs): no React runtime, no embedded React data.
for (const f of walk(root).filter((f) => f.endsWith(".html"))) { const t = fs.readFileSync(f, "utf8"); if (/\/_next\/static\/chunks\/[^"]+\.js|self\.__next_f/.test(t)) fail(`page still ships the React runtime: ${f}`); }
for (const f of ["robots.txt", "sitemap.xml", "llms.txt", "og.png", "Kishore-Theiveekan-CV.pdf", "404.html"]) if (!fs.existsSync(path.join(root, f))) fail(`missing ${f}`);
const server = await serve(root, port);
const browser = await chromium.launch({ channel: "chrome", args: ["--use-angle=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"] });
// Every page, at every width: loads, no horizontal overflow, no console errors.
const routes = ["/", "/writing", "/404", ...slugs.map((s) => `/work/${s}`), ...posts.map((s) => `/writing/${s}`)];
for (const width of [320, 390, 768, 1024, 1440, 1920]) {
  const ctx = await browser.newContext({ viewport: { width, height: 800 } });
  for (const route of routes) {
    const page = await ctx.newPage(); const errs = [];
    page.on("pageerror", (e) => errs.push(e.message)); page.on("console", (m) => { if (m.type() === "error" && !(route === "/404" && /404/.test(m.text()))) errs.push(m.text()); });
    const r = await page.goto(base + route); if (route !== "/404" && !r.ok()) fail(`${route} returned ${r.status()}`);
    await page.waitForTimeout(route === "/" ? 4000 : 500);
    const over = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (over > 0) fail(`${route} overflows ${over}px at ${width}`);
    errs.forEach((e) => fail(`${route} @${width}: ${e.slice(0, 140)}`)); await page.close();
  }
  await ctx.close();
}
// Every link and anchor on every page resolves to a file in out/ (internal) or is a known external scheme.
const exists = (u) => { let p = decodeURIComponent(u.split(/[?#]/)[0]); if (p.endsWith("/")) p += "index.html"; const f = path.join(root, p); return fs.existsSync(f) && !fs.statSync(f).isDirectory() || fs.existsSync(f + ".html"); };
for (const f of walk(root).filter((f) => f.endsWith(".html"))) {
  const t = fs.readFileSync(f, "utf8"); const ids = new Set([...t.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, href] of t.matchAll(/<a[^>]*\shref="([^"]*)"/g)) {
    if (href === "" || href === "#") fail(`dead link in ${f}`);
    else if (href.startsWith("#")) { if (!ids.has(href.slice(1))) fail(`missing anchor ${href} in ${f}`); }
    else if (href.startsWith("/")) { if (!exists(href)) fail(`broken link ${href} in ${f}`); }
    else if (!/^(https:\/\/|mailto:)/.test(href)) fail(`unexpected link ${href} in ${f}`);
  }
}
await browser.close(); server.close(); console.log(fails.length ? `${fails.length} FAILED` : "ALL CHECKS PASSED"); process.exit(fails.length ? 1 : 0);
