// Runs after `next build` (static export). Every page is already complete HTML.
//
// Inner pages (case studies, articles, the writing index, 404) have no client components: React would
// only re-render the same HTML. Their Next.js runtime scripts and the embedded React data (about 60% of
// each file) are removed, so they are plain HTML and CSS plus a few lines of inline JavaScript.
// The home page needs React for its interactions; its scripts are moved out of <head> and loaded
// right after the load event, so the text paints first.
// Measured on mobile Lighthouse: inner pages 96-98 -> 100. qa/run.mjs checks that no inner page
// still references a /_next/ script, and qa/nav.mjs tests the Back link and every navigation path.
import fs from "fs"; import path from "path";
const root = path.resolve(process.argv[2] || "out");
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const NEXT_SCRIPT = /<script src="\/_next\/[^"]+"[^>]*><\/script>/g, PRELOAD = /<link rel="preload" as="script"[^>]*\/>/g;
const RSC = /<script>\(?self\.__next_f[\s\S]*?<\/script>/g, TURBO = /<script id="_R_">[\s\S]*?<\/script>/g;
let plain = 0, deferred = 0;
for (const f of walk(root).filter((f) => f.endsWith(".html"))) {
  let html = fs.readFileSync(f, "utf8");
  if (path.relative(root, f) === "index.html") {
    const srcs = [...html.matchAll(/<script src="([^"]+)"[^>]*><\/script>/g)].map((m) => m[1]);
    if (!srcs.length) continue;
    html = html.replace(NEXT_SCRIPT, "").replace(PRELOAD, "");
    html = html.replace("</body>", `<script>(function(){var s=${JSON.stringify(srcs)};function go(){s.forEach(function(u){var e=document.createElement("script");e.src=u;document.body.appendChild(e)})}if(document.readyState==="complete")setTimeout(go,0);else addEventListener("load",function(){setTimeout(go,0)},{once:true})})()</script></body>`);
    deferred++;
  } else {
    html = html.replace(NEXT_SCRIPT, "").replace(PRELOAD, "").replace(RSC, "").replace(TURBO, "");
    plain++;
  }
  fs.writeFileSync(f, html);
}
console.log(`plain HTML: ${plain} pages · deferred hydration: ${deferred} (home)`);
