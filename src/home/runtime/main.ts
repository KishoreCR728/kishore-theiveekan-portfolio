/* Entry point of the home page's browser module (bundled by scripts/build-runtime.mjs). */
import { HomeController } from "./controller";
import type { RuntimeData } from "../view";

/** Starts after the page's load event, so text and images always paint first. */
function boot(): void {
  const raw = document.getElementById("home-data")?.textContent;
  if (raw) void new HomeController(JSON.parse(raw) as RuntimeData).start();
}
if (document.readyState === "complete") setTimeout(boot, 0);
else addEventListener("load", () => setTimeout(boot, 0), { once: true });
