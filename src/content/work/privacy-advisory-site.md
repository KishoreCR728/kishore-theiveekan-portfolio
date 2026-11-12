---
title: Privacy Advisory Site
order: 2
description: A React site in 18 languages and Hinglish, prerendered in a real browser, with a build that refuses to ship blank or untranslated pages.
oneLiner: 18 languages and Hinglish, about 516 prerendered pages, and a build that stops blank pages shipping.
tags: React 19 · Vite · Puppeteer prerender · i18n · Build gates
role: Lead developer from July 2026. 330 of 388 commits
when: Jul 2026 – present
team: Earlier versions were started by colleagues; others later added content, locale fixes and a theme
stack: React 19, React Router, Vite 7, TypeScript, Tailwind, Puppeteer prerendering, axe-core, GSAP, Lenis; a small Node API for forms; static files on Nginx
scale: About 516 prerendered pages · English plus 17 languages and Hinglish
proof: 97 mobile / 100 desktop Lighthouse on the live site (my runs, Nov 2026) · 100 accessibility, best practices and SEO on 18 routes
ai: Built with Claude Code as a pair; decisions, checks and verification are mine
metric1: 97|mobile Lighthouse, live
metric2: 851 → 387 ms|mobile LCP
metric3: 6|blocking build steps
article: blank-page-build-gate
video: build-gate
impact1: Led it from July 2026: 330 of 388 commits.
impact2: My own fallback once shipped blank pages; I owned it and built the strict gate that stops it.
impact3: Mobile LCP from about 850 ms to under 390 ms; 97 mobile Lighthouse.
---

## The problem

An advisory firm needed a site that explains a new data-protection law to businesses, in their own language. The pages had to be readable by search engines and AI crawlers, fast on cheap phones, and identical in meaning across every language.

## Constraints

- A React single-page app sends an empty page until JavaScript runs. Many crawlers don't run JavaScript.
- The team that deploys the site builds it by hand on a server. It doesn't run our CI pipeline, so any safety check had to live inside `npm run build` itself.
- Translations are added by several people; a missing key silently shows English.

## Decisions and tradeoffs

### 1. Prerender every route with a real browser

After `vite build`, a Puppeteer script opens every route in headless Chromium and saves the fully rendered HTML, so crawlers get real text.

**Tradeoff:** the build needs Chromium and takes minutes, not seconds. Slow routes are retried one by one with longer timeouts.

### 2. Make the build fail instead of shipping a bad page

The build runs: locale parity check → ESLint → TypeScript → Vite → prerender → SEO validator. Each step must pass.

- The prerender is strict by default: if any page falls back to an empty shell, the build exits with an error.
- The SEO validator fails any indexable page with under 500 visible characters, has higher floors for big pages, and fails on a raw translation key that leaked into the page.

**Tradeoff:** a missing Chromium now stops a deploy instead of quietly shipping. That is the point; an explicit `build:nostrict` exists for local work only.

### 3. Locale parity as a gate

A script compares every language pack with English. It fails on any missing key without a written waiver, on waivers that no longer match anything, and on hard-coded `aria-label`s. It started from 99 keys showing English across 18 locales.

**Tradeoff:** adding a sentence means adding it in every language (or waiving it with a reason) before the build passes.

Also measured and rejected: switching to `hydrateRoot` (no measurable gain) and lazy-loading the home page (it made LCP worse, so it was reverted).

## What broke, and the fix

My first prerender design had a fallback: if Chromium was missing, write "head-only" pages and exit 0, "so the build can never go red". The deploy server had no Chromium. So for up to about two weeks the build printed a warning nobody saw, exited 0, and shipped about 380 normal-looking files, each with an empty `<div id="root">`.

- **Found:** an external SEO audit on 10 August 2026. I confirmed it with `curl` the next day: production home page 0 visible characters, my local build 15,147. Hindi and Tamil pages served English titles.
- **Fix, 11 Aug:** strict mode in CI.
- **Fix, 12 Aug:** strict **by default**, because the people who deploy don't run CI. Added the SEO validator to the build and a deploy check.
- **Confirmed live** by 28 August.

The full story is in the article [Our build said success. The crawlers saw a blank page.](/writing/blank-page-build-gate)

## Results

- Mobile LCP 837–851 ms → 332–387 ms; entry JavaScript 184 KB → 125 KB gzipped.
- Turning on gzip took mobile Performance from 60–66 to 82–95; images 5.3 MB → 1.4 MB.
- CLS 0.003; 100 accessibility, best practices and SEO on 18 routes.
- 97 mobile / 100 desktop Lighthouse on the live home page (my run, November 2026).

## What I'd do next

- Bring the same build gates to the redesign branch, which doesn't have them yet.
- Put a CI job back, so the gates also run on every merge, not only on deploy.
