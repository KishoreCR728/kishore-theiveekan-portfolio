// Generates a 1200x630 share image for every case study and article into public/og/.
// Run after adding or renaming content: npm run og
import fs from "node:fs"; import path from "node:path";
import { chromium } from "playwright-core";

const root = process.cwd(), out = path.join(root, "public", "og");
const font = (f) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(root, "src", "fonts", f)).toString("base64")})`;
const read = (dir) => fs.readdirSync(path.join(root, "src/content", dir)).filter((f) => f.endsWith(".md")).map((f) => {
  const raw = fs.readFileSync(path.join(root, "src/content", dir, f), "utf8").replace(/\r\n/g, "\n");
  const meta = Object.fromEntries(raw.split("\n---")[0].split("\n").filter((l) => l.includes(": ")).map((l) => [l.slice(0, l.indexOf(": ")), l.slice(l.indexOf(": ") + 2)]));
  return { slug: f.replace(/\.md$/, ""), meta };
});
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");

const cards = [
  ...read("work").map(({ slug, meta }) => ({ file: `work-${slug}.png`, label: "Case study", title: meta.title, sub: meta.oneLiner })),
  ...read("writing").map(({ slug, meta }) => ({ file: `writing-${slug}.png`, label: meta.topic ? `Writing · ${meta.topic}` : "Writing", title: meta.title, sub: "" })),
  { file: "../og.png", label: "Chennai, India · open to relocation", title: "Kishore Theiveekan", sub: "Frontend engineer. I build web products that have to be fast, secure and well made, and I stay with them all the way to production." },
  { file: "writing.png", label: "Field notes", title: "Real bugs, and how I handled them.", sub: "What broke, how I found the cause, what I changed and what it achieved." },
];

const html = (c) => `<!doctype html><html><head><style>
@font-face { font-family: S; src: ${font("dm-sans-latin-opsz-normal.woff2")}; font-weight: 100 1000; }
@font-face { font-family: I; src: ${font("instrument-serif-latin-400-italic.woff2")}; font-style: italic; }
html, body { margin: 0; width: 1200px; height: 630px; background: #f0efe9; color: #0f0e0c; font-family: S; }
.c { box-sizing: border-box; height: 100%; padding: 64px 72px; display: flex; flex-direction: column; }
.l { font-size: 22px; letter-spacing: .08em; text-transform: uppercase; color: #6e6a62; }
.t { margin-top: 28px; font-size: ${c.title.length > 60 ? 62 : 76}px; line-height: 1.04; letter-spacing: -.035em; max-width: 1000px; }
.s { margin-top: 24px; font-size: 28px; line-height: 1.4; color: #4a4740; max-width: 960px; }
.f { margin-top: auto; display: flex; justify-content: space-between; align-items: center; font-size: 26px; }
.f i { font-family: I; font-size: 32px; color: #4a4740; }
.d { width: 18px; height: 18px; border-radius: 50%; background: #e0562a; display: inline-block; margin-right: 14px; vertical-align: middle; }
</style></head><body><div class="c"><div class="l">${esc(c.label)}</div><div class="t">${esc(c.title)}</div>${c.sub ? `<div class="s">${esc(c.sub)}</div>` : ""}
<div class="f"><span><span class="d"></span>Kishore Theiveekan</span><i>Frontend Engineer</i></div></div></body></html>`;

fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const c of cards) {
  await page.setContent(html(c), { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(out, c.file) });
  console.log("og/" + c.file);
}
await browser.close();
