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
// The React data files for client-side navigation are unused too.
for (const f of walk(root).filter((f) => f.endsWith(".txt") && /(^|\/)(__next\.|index\.txt$|[^/]+\.txt$)/.test(path.relative(root, f)) && !/robots\.txt$|llms\.txt$/.test(f))) fs.rmSync(f);
console.log(`plain HTML: ${n} pages`);
