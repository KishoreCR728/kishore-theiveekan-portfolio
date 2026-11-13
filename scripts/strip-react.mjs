// Runs after `next build` (static export). Next.js renders every page to complete HTML at build time;
// no page on this site uses React in the browser (the home page's interactions are a separate, small
// module: src/home/runtime). So the Next.js runtime scripts and the embedded React data (often more than
// half of each file) are removed, leaving plain HTML and CSS plus a few lines of inline JavaScript.
// Measured on mobile Lighthouse: pages 92-97 -> 100. qa/run.mjs fails if any page still references them.
import fs from "fs"; import path from "path";
const root = path.resolve(process.argv[2] || "out");
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const PATTERNS = [
  /<script src="\/_next\/[^"]+"[^>]*><\/script>/g, // runtime chunks
  /<link rel="preload" as="script"[^>]*\/>/g, // their preloads
  /<script>\(?self\.__next_f[\s\S]*?<\/script>/g, // embedded React data
  /<script id="_R_">[\s\S]*?<\/script>/g, // bundler bootstrap
];
let n = 0;
for (const f of walk(root).filter((f) => f.endsWith(".html"))) {
  const html = fs.readFileSync(f, "utf8");
  const out = PATTERNS.reduce((h, re) => h.replace(re, ""), html);
  if (out !== html) { fs.writeFileSync(f, out); n++; }
}
// The React data files for client-side navigation are unused too (only Next.js's own *.txt files, by name).
const isRscData = (rel) => /(^|\/)__next\.[^/]*\.txt$/.test(rel) || (/\.txt$/.test(rel) && fs.existsSync(path.join(root, rel.replace(/\.txt$/, ".html"))));
for (const f of walk(root).filter((f) => isRscData(path.relative(root, f).split(path.sep).join("/")))) fs.rmSync(f);
// The runtime chunks themselves and Next.js's duplicate not-found page are now unused.
const chunks = path.join(root, "_next/static/chunks");
let removed = 0;
if (fs.existsSync(chunks)) for (const f of walk(chunks).filter((f) => f.endsWith(".js"))) { fs.rmSync(f); removed++; }
for (const f of ["_not-found.html", "_not-found"]) fs.rmSync(path.join(root, f), { recursive: true, force: true });
// Per-build manifests for client-side navigation (_next/static/<buildId>/) are unused as well.
const st = path.join(root, "_next/static");
if (fs.existsSync(st)) for (const d of fs.readdirSync(st)) { const dir = path.join(st, d); if (fs.existsSync(path.join(dir, "_buildManifest.js"))) fs.rmSync(dir, { recursive: true, force: true }); }
console.log(`plain HTML: ${n} pages · ${removed} unused runtime files removed`);
