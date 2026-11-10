// Serves a static folder the way the host does: /about resolves to about.html.
import http from "http"; import fs from "fs"; import path from "path";
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".woff2": "font/woff2", ".pdf": "application/pdf", ".txt": "text/plain", ".xml": "application/xml", ".json": "application/json", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
export function serve(root, port) {
  return new Promise((ok) => { const s = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
    let f = path.join(root, p); if (fs.existsSync(f + ".html")) f += ".html";
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404, { "content-type": "text/html" }); return r.end(fs.existsSync(path.join(root, "404.html")) ? fs.readFileSync(path.join(root, "404.html")) : "404"); }
    r.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream" }); r.end(fs.readFileSync(f));
  }).listen(port, "127.0.0.1", () => ok(s)); });
}
