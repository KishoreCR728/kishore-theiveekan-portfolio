// The real 3D path (hardware WebGL), which the other checks never reach: they run in static mode.
// Runs only with QA_GPU=1 on a machine with a GPU: QA_GPU=1 npm test
// Loads the home page several times (the city is random), checks the 3D started without errors,
// that hovering a project card builds its word, and that the static fallback was not taken.
import { chromium } from "playwright-core"; import { serve } from "./serve.mjs";
if (process.env.QA_GPU !== "1") { console.log("GPU CHECKS SKIPPED (set QA_GPU=1 on a machine with a GPU)"); process.exit(0); }
const server = await serve(new URL("../out", import.meta.url).pathname, 8796), base = "http://127.0.0.1:8796";
const browser = await chromium.launch({ channel: "chrome", args: ["--enable-gpu", "--use-angle=gl", "--ignore-gpu-blocklist"] });
const fails = [], fail = (m) => { fails.push(m); console.log("FAIL " + m); };
for (let run = 0; run < 8; run++) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } }); const errs = [];
  page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && errs.push(m.text())); page.on("pageerror", (e) => errs.push(e.message));
  await page.goto(base + "/");
  await page.waitForFunction(() => !document.querySelector("[data-loader]"), null, { timeout: 15000 });
  await page.waitForTimeout(1500);
  if (await page.evaluate(() => document.documentElement.classList.contains("static-mode"))) fail(`run ${run}: fell back to static mode`);
  await page.evaluate(() => document.querySelector('[data-screen-label="3D panel"]').scrollIntoView());
  await page.hover('[data-hero-card="0"]'); await page.waitForTimeout(900);
  const shown = await page.evaluate(() => document.querySelector("[data-hero-preview]")?.classList.contains("on") && document.querySelector("[data-hero-panel]")?.classList.contains("hero-focus"));
  if (!shown) fail(`run ${run}: hovering a card did not start the word`);
  errs.forEach((e) => fail(`run ${run}: ${e.slice(0, 160)}`));
  await page.close();
}
await browser.close(); server.close();
console.log(fails.length ? `${fails.length} GPU CHECKS FAILED` : "ALL GPU CHECKS PASSED"); process.exit(fails.length ? 1 : 0);
