/*
 * The home page in the browser. The HTML is complete without this file (static export); this adds:
 * the intro loader, the Chennai clock, the menu (focus trap, Escape, inert background), smooth wheel
 * scrolling, returning to the same scroll position after Back, scroll reveals, the journey buttons, and
 * finally the 3D scenes (./scene.js, loaded on demand). No framework: about 10 KB before three.js.
 *
 * Static mode (reduced motion, no hardware WebGL) is decided before first paint by an inline script that
 * adds html.static-mode; then only the menu, clock, reveals and Back restore run.
 */
import type { RuntimeData } from "../view";
import type { Hero } from "./hero";

type Ref<T extends Element = HTMLElement> = { current: T | null };
interface Pointer { x: number; y: number; px: number; py: number; tx: number; ty: number; nx: number; ny: number }
interface Scroll { target: number; cur: number; last: number; vel: number }

const WORDS = ["Curious.", "Persistent.", "Practical.", "Careful.", "Investigative."];
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => Array.from(root.querySelectorAll<T>(sel));

/** WebGL2 on real hardware. Software renderers draw each frame in hundreds of ms, so they get the static page. */
function hasWebGL(): boolean {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return false;
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return !/swiftshader|llvmpipe|software|basic render/i.test(name);
  } catch { return false; }
}

export class HomeController {
  readonly data: RuntimeData;
  /** Read by the scene module. */
  state = { phase: "load" as "load" | "exit" | "ready", menuOpen: false };
  m: Pointer = { x: -9999, y: -9999, px: -9999, py: -9999, tx: -9999, ty: -9999, nx: 0, ny: 0 };
  sc: Scroll = { target: 0, cur: 0, last: 0, vel: 0 };
  inJ = false;
  // Set by the scene module.
  _alive = false; _raf = 0; _hero?: Hero;
  _goCh?: (i: number) => void;
  J?: { ch: number };
  _pars: HTMLElement[] = []; _floats: HTMLElement[] = []; _yrs: HTMLElement[] = []; _tilts: HTMLElement[] = [];
  private refs = new Map<string, Ref>();
  private isStatic = false;
  private opener: HTMLElement | null = null;
  private io?: IntersectionObserver;

  constructor(data: RuntimeData) { this.data = data; }

  /** Element by its data-ref name, in the { current } shape the scene code expects. */
  R(name: string): Ref {
    let r = this.refs.get(name);
    if (!r) { r = { current: $(`[data-ref="${name}"]`) }; this.refs.set(name, r); }
    return r;
  }

  async start(): Promise<void> {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.documentElement.classList.contains("static-mode") || reduce || !hasWebGL()) this.enableStatic();

    this.bindMenuAndKeys();
    this.bindActions();
    this.startClock();

    let skip = false;
    try { skip = sessionStorage.getItem("skipLoader") === "1"; sessionStorage.removeItem("skipLoader"); } catch { /* storage blocked */ }
    // Coming back (browser Back or the "Back to selected work" link): skip the loader and return to the
    // exact scroll position the visitor left from. The position is saved whenever they leave.
    let backY = -1;
    try {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
      if (nav && nav.type === "back_forward" && !location.hash) { const y = Number(sessionStorage.getItem("homeY")); if (y > 0) { backY = y; skip = true; history.scrollRestoration = "manual"; } }
    } catch { /* storage blocked */ }
    addEventListener("pagehide", () => { try { sessionStorage.setItem("homeY", String(Math.round(scrollY))); } catch { /* storage blocked */ } });
    if (backY > 0) {
      const go = () => { const y = Math.min(backY, document.documentElement.scrollHeight - innerHeight); scrollTo(0, y); this.sc.target = this.sc.cur = this.sc.last = y; };
      requestAnimationFrame(go);
      setTimeout(() => { if (Math.abs(scrollY - backY) > 4 && scrollY < 4) go(); }, 500);
    } else this.sc.target = this.sc.cur = scrollY;

    if (this.isStatic || skip) this.finishLoader(true); else this.runLoader();

    addEventListener("mousemove", (e) => { const m = this.m; m.tx = e.clientX; m.ty = e.clientY; m.nx = (e.clientX / innerWidth) * 2 - 1; m.ny = (e.clientY / innerHeight) * 2 - 1; });
    addEventListener("scroll", () => { if (Math.abs(scrollY - this.sc.last) > 1.5) this.sc.target = this.sc.cur = scrollY; }, { passive: true });
    if (!this.isStatic) addEventListener("wheel", this.onWheel, { passive: false });

    setTimeout(() => this.setupReveals(), 150);
    setTimeout(() => this.setupReveals(), 1500);
    if (this.isStatic) return;

    await new Promise<void>((ok) => { const t = setInterval(() => { if (this.state.phase === "ready") { clearInterval(t); ok(); } }, 120); });
    if (document.fonts) await document.fonts.ready;
    try {
      const scene = await import("./scene.js");
      await scene.initGL.call(this);
    } catch (err) {
      console.warn("3D scenes unavailable; showing the static layout.", err);
      this.enableStatic();
    }
  }

  private enableStatic(): void {
    this.isStatic = true;
    document.documentElement.classList.add("static-mode");
    removeEventListener("wheel", this.onWheel);
    this._alive = false;
    cancelAnimationFrame(this._raf);
    this.finishLoader(true);
  }

  /* ---------- loader ---------- */

  private runLoader(): void {
    let c = 0;
    const count = $("[data-count]"), word = $("[data-word]");
    const t = setInterval(() => {
      c = Math.min(100, c + 3 + Math.ceil(Math.random() * 5));
      if (count) count.textContent = String(c);
      if (word) word.textContent = WORDS[Math.min(4, Math.floor(c / 20))];
      if (c >= 100) { clearInterval(t); setTimeout(() => this.finishLoader(false), 120); }
    }, 30);
  }

  /** Splits the loader open (two halves slide away, text fades), then removes it. */
  private finishLoader(instant: boolean): void {
    const loader = $("[data-loader]");
    if (this.state.phase === "ready") return;
    if (!loader || instant) { loader?.remove(); this.state.phase = "ready"; return; }
    this.state.phase = "exit";
    const parts = Array.from(loader.children) as HTMLElement[];
    parts.forEach((el, i) => {
      if (i === 0) el.style.transform = "translateY(-101%)";
      else if (i === 1) el.style.transform = "translateY(101%)";
      else el.style.opacity = "0";
    });
    setTimeout(() => { loader.remove(); this.state.phase = "ready"; }, 580);
  }

  /* ---------- clock ---------- */

  private startClock(): void {
    const el = $("[data-time]");
    if (!el) return;
    const fmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata" });
    const tick = () => { el.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 30000);
  }

  /* ---------- menu and keyboard ---------- */

  private menuToggle(): HTMLElement | null { return $('[data-topnav] [aria-label="Menu"]'); }

  setMenu(open: boolean): void {
    if (open === this.state.menuOpen) return;
    this.state.menuOpen = open;
    const menu = $("[data-menu]"), toggle = this.menuToggle(), label = $("[data-menu-label]");
    if (open) this.opener = document.activeElement as HTMLElement | null;
    if (menu) menu.hidden = !open;
    toggle?.setAttribute("aria-expanded", String(open));
    if (label) label.textContent = open ? "Close" : "Menu";
    $$("main, footer").forEach((el) => { el.inert = open; });
    if (open) $("[data-overlay] a")?.focus({ preventScroll: true });
    else if (this.opener?.isConnected) this.opener.focus({ preventScroll: true });
  }

  private bindMenuAndKeys(): void {
    addEventListener("keydown", (e) => {
      if (e.key === "Tab" && this.state.menuOpen) {
        // Keep focus inside the open menu: the Menu/Close button plus the menu links.
        const items = [this.menuToggle(), ...$$("[data-overlay] a[href]")].filter((x): x is HTMLElement => !!x);
        const i = items.indexOf(document.activeElement as HTMLElement);
        const n = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : (i < 0 || i >= items.length - 1 ? 0 : i + 1);
        e.preventDefault();
        items[n].focus();
        return;
      }
      if (e.key === "Escape" && this.state.menuOpen) this.setMenu(false);
    });
  }

  /* ---------- buttons: data-action ---------- */

  private bindActions(): void {
    const run = (el: HTMLElement) => {
      const action = el.dataset.action;
      // Menu links carry data-action="menu" too: following one closes the menu.
      if (action === "menu") this.setMenu(el.tagName === "A" ? false : !this.state.menuOpen);
      else if (action === "top") this.sc.target = 0;
      else if (action === "chapter") this._goCh?.(Number(el.dataset.ch || 0));
      else if (action === "chapter-prev") this._goCh?.((this.J?.ch ?? 0) - 1);
      else if (action === "chapter-next") this._goCh?.((this.J?.ch ?? 0) + 1);
    };
    document.addEventListener("click", (e) => {
      const el = (e.target as Element).closest<HTMLElement>("[data-action]");
      if (el) run(el);
    });
    // role="button" elements also answer Enter and Space, like real buttons.
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const el = (e.target as Element).closest<HTMLElement>("[data-action]");
      if (!el || el.tagName === "BUTTON" || el.tagName === "A") return;
      e.preventDefault();
      run(el);
    });
  }

  /* ---------- smooth wheel scrolling ---------- */

  private onWheel = (e: WheelEvent): void => {
    if (this.state.menuOpen || this.state.phase !== "ready") { if (this.state.phase !== "ready") e.preventDefault(); return; }
    e.preventDefault();
    const max = document.documentElement.scrollHeight - innerHeight;
    const js = this.R("diveSec").current, jr = js?.getBoundingClientRect();
    this.inJ = !!jr && jr.top <= 2 && jr.bottom >= innerHeight + 2;
    this.sc.target = Math.max(0, Math.min(max, this.sc.target + e.deltaY * (e.deltaMode === 1 ? 16 : 1) * (this.inJ ? 0.5 : 0.9)));
  };

  /* ---------- reveals ---------- */

  setupReveals(): void {
    const io = this.io ?? (this.io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target as HTMLElement;
      io.unobserve(el);
      if (el.hasAttribute("data-reveal")) $$("[data-w]", el).forEach((w, i) => { w.style.transitionDelay = i * 45 + "ms"; w.style.transform = "none"; });
      else { el.style.opacity = "1"; el.style.transform = "none"; }
    }), { threshold: 0.1 }));
    $$("[data-reveal],[data-fade]").forEach((el) => io.observe(el));
    const grid = this.R("grid").current;
    if (grid) Array.from(grid.children as HTMLCollectionOf<HTMLElement>).forEach((el, i) => { el.style.transitionDelay = (i % 2) * 140 + "ms"; io.observe(el); });
    this._pars = $$("[data-par]");
    this._floats = $$("[data-float]");
    this._yrs = $$("[data-yr]");
    this._tilts = $$("[data-tilt]");
  }
}
