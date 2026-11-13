/* Entry point of the home page's browser module (bundled by scripts/build-runtime.mjs). */
import { HomeController } from "./controller";
import type { RuntimeData } from "../view";

/** Starts after the page's load event, so text and images always paint first. */
function boot(): void {
  const el = document.getElementById("home-data");
  if (!el?.textContent) return;
  const start = () => void new HomeController(JSON.parse(el.textContent!) as RuntimeData).start();
  // Under `next dev` React hydrates the page first (the published site has no React); wait for it.
  if (el.dataset.dev === "1" && document.documentElement.dataset.hydrated !== "1") addEventListener("home:hydrated", start, { once: true });
  else start();
}
if (document.readyState === "complete") setTimeout(boot, 0);
else addEventListener("load", () => setTimeout(boot, 0), { once: true });
