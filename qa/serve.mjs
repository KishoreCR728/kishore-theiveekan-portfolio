// Serves a static folder the way the host does: /about resolves to about.html, text is gzipped,
// media supports Range requests. Paths are confined to the root folder.
import http from "http"; import fs from "fs"; import path from "path"; import zlib from "zlib";
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".pdf": "application/pdf", ".txt": "text/plain", ".vtt": "text/vtt", ".xml": "application/xml", ".json": "application/json", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".mp4": "video/mp4" };
export function serve(root, port) {
  const base = path.resolve(root);
  return new Promise((ok) => { const s = http.createServer((q, r) => {
    let p; try { p = decodeURIComponent(q.url.split("?")[0]); } catch { r.writeHead(400); return r.end(); }
    if (p.endsWith("/")) p += "index.html";
    let f = path.resolve(base, "." + p);
    if (f !== base && !f.startsWith(base + path.sep)) { r.writeHead(403); return r.end(); }
    if (fs.existsSync(f + ".html")) f += ".html";
    if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404, { "content-type": "text/html" }); return r.end(fs.existsSync(path.join(base, "404.html")) ? fs.readFileSync(path.join(base, "404.html")) : "404"); }
    const type = types[path.extname(f)] || "application/octet-stream", size = fs.statSync(f).size;
    const range = /^bytes=(\d*)-(\d*)$/.exec(q.headers.range || "");
    if (range && type.startsWith("video/")) {
      const start = range[1] ? Number(range[1]) : 0, end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
      r.writeHead(206, { "content-type": type, "content-range": `bytes ${start}-${end}/${size}`, "accept-ranges": "bytes", "content-length": end - start + 1 });
      return fs.createReadStream(f, { start, end }).pipe(r);
    }
    const body = fs.readFileSync(f);
    if (/text|javascript|json|xml|svg/.test(type) && /gzip/.test(q.headers["accept-encoding"] || "")) { r.writeHead(200, { "content-type": type, "content-encoding": "gzip" }); return r.end(zlib.gzipSync(body)); }
    r.writeHead(200, { "content-type": type, "accept-ranges": "bytes" }); r.end(body);
  }).listen(port, "127.0.0.1", () => ok(s)); });
}
