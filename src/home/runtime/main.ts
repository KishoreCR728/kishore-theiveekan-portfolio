/* Entry point of the home page's browser module (bundled by scripts/build-runtime.mjs). */
import { HomeController } from "./controller";
import type { RuntimeData } from "../view";

const raw = document.getElementById("home-data")?.textContent;
if (raw) void new HomeController(JSON.parse(raw) as RuntimeData).start();
