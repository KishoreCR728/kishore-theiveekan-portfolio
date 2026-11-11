// Serves a static folder the way the host does: /about resolves to about.html, text is gzipped.
import http from "http"; import fs from "fs"; import path from "path"; import zlib from "zlib";
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".woff2": "font/woff2", ".pdf": "application/pdf", ".txt": "text/plain", ".xml": "application/xml", ".json": "application/json", ".svg": "image/svg+xml", ".ico": "image/x-icon" };
export function serve(root, port) {
  return new Promise((ok) => { const s = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split("?")[0]); if (p.endsWith("/")) p += "index.html";
    let f = path.join(root, p); if (fs.existsSync(f + ".html")) f += ".html";
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404, { "content-type": "text/html" }); return r.end(fs.existsSync(path.join(root, "404.html")) ? fs.readFileSync(path.join(root, "404.html")) : "404"); }
    const type = types[path.extname(f)] || "application/octet-stream", body = fs.readFileSync(f);
    if (/text|javascript|json|xml|svg/.test(type) && /gzip/.test(q.headers["accept-encoding"] || "")) { r.writeHead(200, { "content-type": type, "content-encoding": "gzip" }); return r.end(zlib.gzipSync(body)); }
    r.writeHead(200, { "content-type": type }); r.end(body);
  }).listen(port, "127.0.0.1", () => ok(s)); });
}
