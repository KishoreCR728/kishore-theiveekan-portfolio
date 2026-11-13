// Bundles the home page's browser module (src/home/runtime) into public/home/ with content-hashed names.
// three.js and the 3D scenes are split into chunks that load only after the page is ready.
import { build } from "esbuild"; import fs from "fs"; import path from "path";
const out = path.resolve("public/home");
fs.rmSync(out, { recursive: true, force: true });
const result = await build({
  entryPoints: { main: "src/home/runtime/main.ts" }, bundle: true, splitting: true, format: "esm", minify: true,
  target: "es2020", outdir: out, entryNames: "[name]-[hash]", chunkNames: "chunk-[hash]", metafile: true, legalComments: "eof",
  logLevel: "warning",
});
const entry = Object.entries(result.metafile.outputs).find(([, o]) => o.entryPoint)?.[0];
if (!entry) throw new Error("no entry output");
fs.writeFileSync(path.resolve("src/home/runtime-manifest.json"), JSON.stringify({ entry: "/" + path.relative("public", entry).split(path.sep).join("/") }));
const sizes = Object.entries(result.metafile.outputs).filter(([f]) => f.endsWith(".js")).map(([f, o]) => `${path.basename(f)} ${(o.bytes / 1024).toFixed(1)} KB`);
console.log("home runtime:", sizes.join(", "));
