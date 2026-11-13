// Navigation checks in real Chrome, run after `npm run build` (part of `npm test`).
// Clicks real links the way a visitor does, then checks where they land, that Back and
// Forward return to the right page, that section links land on their section (also from
// other pages, past the home loader), and that the menu, hero and "next" links work.
import fs from "fs"; import path from "path"; import { chromium } from "playwright-core"; import { serve } from "./serve.mjs";

const root = "out", port = 8760, base = `http://127.0.0.1:${port}`, fails = [];
const fail = (m) => { fails.push(m); console.log("FAIL", m); };
const pathOf = (u) => new URL(u).pathname.replace(/\.html$/, "").replace(/\/index$/, "/") || "/";
const settle = (page, url) => page.waitForTimeout(new URL(url).pathname === "/" ? 3500 : 700);

const slugs = fs.readdirSync(path.join(root, "work")).filter((f) => f.endsWith(".html")).map((f) => f.replace(".html", ""));
const posts = fs.readdirSync(path.join(root, "writing")).filter((f) => f.endsWith(".html")).map((f) => f.replace(".html", ""));

const server = await serve(root, port);
const browser = await chromium.launch({ channel: "chrome" });

async function newPage(width = 1440) {
  const ctx = await browser.newContext({ viewport: { width, height: width > 600 ? 900 : 844 } });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => fail(`${page.url()}: ${e.message.slice(0, 140)}`));
  return { ctx, page };
}

/** Is the element with this id on screen (its top within the viewport)? */
const onScreen = (page, id) => page.evaluate((id) => { const e = document.getElementById(id); if (!e) return "missing"; const r = e.getBoundingClientRect(); return r.top > -40 && r.top < innerHeight * 0.6 ? "ok" : `top=${Math.round(r.top)}`; }, id);

// 1. Every internal link on each kind of page: click it, check the destination, go Back.
const sources = ["/", "/writing", `/work/${slugs[0]}`, `/work/${slugs[slugs.length - 1]}`, `/writing/${posts[0]}`, "/404"];
for (const width of [1440, 390]) {
  for (const src of sources) {
    const { ctx, page } = await newPage(width);
    await page.goto(base + src); await settle(page, base + src);
    const links = await page.evaluate(() => [...new Set([...document.querySelectorAll("a[href]")].map((a) => a.getAttribute("href")))].filter((h) => h.startsWith("/") || h.startsWith("#")));
    for (const href of links) {
      await page.goto(base + src); await settle(page, base + src);
      const target = new URL(href, base + src);
      // Reveal the link if it lives in the closed menu, then click the first visible copy.
      const clicked = await page.evaluate((href) => {
        const all = [...document.querySelectorAll(`a[href="${CSS.escape(href).replace(/\\/g, "")}"]`)].filter((a) => a.getAttribute("href") === href);
        const vis = all.find((a) => { const r = a.getBoundingClientRect(); const st = getComputedStyle(a); return r.width > 0 && r.height > 0 && st.visibility !== "hidden" && st.pointerEvents !== "none"; }) || all[0];
        if (!vis) return false; vis.click(); return true;
      }, href);
      if (!clicked) { fail(`${src} @${width}: no element for ${href}`); continue; }
      if (href.endsWith(".pdf")) continue; // downloads are checked by the file check in run.mjs
      await page.waitForTimeout(target.pathname === new URL(base + src).pathname ? 1600 : 0);
      await page.waitForLoadState("load").catch(() => {}); await settle(page, page.url());
      if (pathOf(page.url()) !== pathOf(target.href)) { fail(`${src} @${width}: ${href} landed on ${pathOf(page.url())}`); continue; }
      if (target.hash) { const s = await onScreen(page, target.hash.slice(1)); if (s !== "ok") fail(`${src} @${width}: ${href} section not on screen (${s})`); }
      if (pathOf(page.url()) !== pathOf(base + src)) {
        await page.goBack(); await settle(page, base + src);
        if (pathOf(page.url()) !== pathOf(base + src)) fail(`${src} @${width}: Back after ${href} went to ${pathOf(page.url())}`);
      }
    }
    await ctx.close();
  }
}

// 2. A visitor's journey: home → case (hero link) → next case → article → Back, Back, Back, Forward.
{
  const { ctx, page } = await newPage();
  await page.goto(base + "/"); await settle(page, base + "/");
  await page.evaluate(() => document.querySelector("[data-hero-link]").click()); await page.waitForLoadState("load"); await settle(page, page.url());
  const first = pathOf(page.url()); if (!first.startsWith("/work/")) fail(`hero link went to ${first}`);
  await Promise.all([page.waitForURL((u) => pathOf(u.href) !== first), page.click('.pager a[rel=next]')]); await page.waitForLoadState("load"); await page.waitForTimeout(500);
  const second = pathOf(page.url());
  await page.goto(base + `/writing/${posts[0]}`); await page.waitForTimeout(500);
  await page.goBack(); await page.waitForTimeout(400); if (pathOf(page.url()) !== second) fail(`Back 1 went to ${pathOf(page.url())}, expected ${second}`);
  await page.goBack(); await page.waitForTimeout(400); if (pathOf(page.url()) !== first) fail(`Back 2 went to ${pathOf(page.url())}, expected ${first}`);
  await page.goBack(); await settle(page, base + "/"); if (pathOf(page.url()) !== "/") fail(`Back 3 went to ${pathOf(page.url())}`);
  await page.goForward(); if (pathOf(page.url()) !== first) fail(`Forward went to ${pathOf(page.url())}`);
  await ctx.close();
}

// 3. "Next" links walk every case study and every article and come back to the start.
for (const [start, sel, count] of [[`/work/${slugs[0]}`, '.pager a[rel=next]', slugs.length], [`/writing/${posts[0]}`, '.pager a[rel=next]', posts.length]]) {
  const { ctx, page } = await newPage(); await page.goto(base + start); const seen = new Set([pathOf(page.url())]);
  for (let i = 0; i < count; i++) { const from = pathOf(page.url()); await Promise.all([page.waitForURL((u) => pathOf(u.href) !== from), page.click(sel)]); await page.waitForLoadState("load"); seen.add(pathOf(page.url())); }
  if (pathOf(page.url()) !== start || seen.size !== count) fail(`next-link loop from ${start}: visited ${seen.size} of ${count}, ended on ${pathOf(page.url())}`);
  await ctx.close();
}

// 4. The home menu: opens, each item goes where it says, Escape closes it.
for (const width of [1440, 390]) {
  const { ctx, page } = await newPage(width);
  await page.goto(base + "/"); await settle(page, base + "/");
  await page.getByRole("button", { name: "Menu" }).click(); await page.waitForTimeout(500);
  const items = await page.evaluate(() => [...document.querySelectorAll("[data-overlay] a[href]")].map((a) => a.getAttribute("href")));
  if (items.length < 4) fail(`menu @${width}: only ${items.length} items`);
  for (const href of items) {
    await page.goto(base + "/"); await settle(page, base + "/");
    await page.getByRole("button", { name: "Menu" }).click(); await page.waitForTimeout(500);
    const ok = await page.evaluate((href) => { const a = [...document.querySelectorAll("[data-overlay] a")].find((x) => x.getAttribute("href") === href); const r = a && a.getBoundingClientRect(); return !!(r && r.width && r.height); }, href);
    if (!ok) { fail(`menu @${width}: item ${href} not visible when open`); continue; }
    if (href.endsWith(".pdf")) continue;
    await page.evaluate((href) => [...document.querySelectorAll("[data-overlay] a")].find((x) => x.getAttribute("href") === href).click(), href);
    await page.waitForTimeout(1600); await page.waitForLoadState("load"); await settle(page, page.url());
    const t = new URL(href, base + "/");
    if (pathOf(page.url()) !== pathOf(t.href)) fail(`menu @${width}: ${href} landed on ${pathOf(page.url())}`);
    else if (t.hash) { const s = await onScreen(page, t.hash.slice(1)); if (s !== "ok") fail(`menu @${width}: ${href} section not on screen (${s})`); }
    const open = await page.evaluate(() => (() => { const o = document.querySelector("[data-overlay]"); return !!(o && o.getClientRects().length); })()); // the menu stays in the page, hidden, when closed
    if (open && pathOf(page.url()) === "/") fail(`menu @${width}: still open after choosing ${href}`);
  }
  await page.goto(base + "/"); await settle(page, base + "/");
  await page.getByRole("button", { name: "Menu" }).click(); await page.waitForTimeout(400); await page.keyboard.press("Escape"); await page.waitForTimeout(500);
  if (await page.evaluate(() => (() => { const o = document.querySelector("[data-overlay]"); return !!(o && o.getClientRects().length); })())) fail(`menu @${width}: Escape did not close it`);
  await ctx.close();
}

// 5. Section links from another page land on the section on the home page (past the loader).
for (const id of ["work", "experience", "journey", "writing", "contact"]) {
  const { ctx, page } = await newPage(); await page.goto(`${base}/#${id}`); await settle(page, base + "/");
  const s = await onScreen(page, id); if (s !== "ok") fail(`/#${id} opened directly: section not on screen (${s})`);
  await ctx.close();
}

// 6. Selected work → a case study → "Back to selected work" (and the browser Back button)
//    return to the same place on the home page, at desktop and phone widths.
for (const width of [1440, 390]) {
  for (const how of ["link", "browser"]) {
    const { ctx, page } = await newPage(width);
    await page.goto(base + "/"); await settle(page, base + "/");
    const card = page.locator('#work a[href^="/work/"]').nth(2);
    await card.scrollIntoViewIfNeeded(); await page.waitForTimeout(900);
    const y0 = await page.evaluate(() => Math.round(scrollY));
    await card.evaluate((a) => a.click()); await page.waitForLoadState("load"); await page.waitForTimeout(500);
    if (!pathOf(page.url()).startsWith("/work/")) { fail(`back test @${width}: card went to ${pathOf(page.url())}`); await ctx.close(); continue; }
    if (how === "link") await page.click("a.back-link"); else await page.goBack();
    await page.waitForLoadState("load"); await page.waitForTimeout(1500);
    const y1 = await page.evaluate(() => Math.round(scrollY));
    if (pathOf(page.url()) !== "/") fail(`back test @${width} (${how}): landed on ${pathOf(page.url())}`);
    else if (Math.abs(y1 - y0) > 60) fail(`back test @${width} (${how}): left at y=${y0}, came back to y=${y1}`);
    await ctx.close();
  }
}

// 7. Previous and next walk the case studies in opposite directions.
{
  const { ctx, page } = await newPage(); await page.goto(`${base}/work/${slugs[1]}`);
  await page.click(".pager a[rel=prev]"); await page.waitForLoadState("load");
  if (pathOf(page.url()) !== `/work/${slugs[0]}`) fail(`prev from ${slugs[1]} went to ${pathOf(page.url())}`);
  const p1 = pathOf(page.url()); await page.click(".pager a[rel=next]"); await page.waitForLoadState("load");
  if (pathOf(page.url()) !== `/work/${slugs[1]}`) fail(`prev then next did not return to ${slugs[1]} (from ${p1} to ${pathOf(page.url())})`);
  await ctx.close();
}

await browser.close(); server.close();
console.log(fails.length ? `${fails.length} NAVIGATION CHECKS FAILED` : "ALL NAVIGATION CHECKS PASSED"); process.exit(fails.length ? 1 : 0);
