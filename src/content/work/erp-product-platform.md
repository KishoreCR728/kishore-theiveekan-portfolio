---
title: ERP Product Platform
order: 1
description: A prerendered Angular marketing site with 100+ pages where content lives in JSON, the build refuses weak pages, and security headers were proved on production.
oneLiner: 100+ prerendered pages from JSON, a build that refuses weak pages, and security headers proved on production.
tags: Angular 21 · Prerendering · JSON content · SEO lint · Security headers
role: Lead developer. 430 of 462 commits on the main branch
when: Nov 2025 – present
team: Me, plus colleagues for SEO content, the CI pipeline and a few data fixes. The team that runs the servers owns them
stack: Angular 21 (upgraded from 19), prerendering with @angular/ssr, TypeScript, Express, Vitest, GitLab CI with security scanning
scale: 100+ JSON-driven pages in many sections · 100+ prerendered routes
proof: 96 desktop Lighthouse on the live site (my run, Nov 2026) · production security findings 10 → 0
ai: From May 2026 some commits were written with Claude Code. Decisions and verification were mine
metric1: 100+|prerendered routes
metric2: 10 → 0|production security findings
metric3: 146 → 8.8 MB|SVG assets
impact1: Led it end to end: 430 of 462 commits, from architecture to deploy.
impact2: Made the build refuse weak pages: an SEO lint gates every release.
impact3: Took production security findings from 10 to 0, and proved the headers with curl.
---

## The problem

A product company needed a fast, search-friendly marketing site with more than a hundred pages: products, industries, locations and guides. Content changes often, and weak pages (thin text, a missing title, copy-pasted location pages) hurt search ranking for the whole site.

## Constraints

- Content had to be editable without touching component code.
- Production runs on a static Apache server and UAT on Nginx. Another team owns both, so I could ship files, not change servers directly.
- The company's CI template runs dependency, code and secret scans on every build.
- Clients run penetration tests, so security findings have to be fixed and proved, not argued.

## Decisions and tradeoffs

### 1. Content as JSON files, not hard-coded pages

Each page is one JSON file. A script builds the section indexes, another generates the prerender route list, and one route template renders every page. Slugs are sanitised to letters, digits, `-` and `_`.

**Tradeoff:** no CMS screen for editors, but no database or extra server either, and every content change goes through review and the same build checks.

### 2. A build that refuses to ship weak pages

`npm run build` runs: fetch blog posts → build indexes → generate routes → generate sitemap → SEO lint → Angular build. Every step must pass. The SEO lint checks new and changed pages for title length, meta description, a single H1, claims against an approved list, and similarity between location pages (above 40 % fails). The route generator only adds routes, so a bad run can't silently drop pages.

**Tradeoff:** builds are slower and stricter, and the lint checks only changed pages by default, so old content doesn't block urgent fixes.

### 3. One security policy, kept in step across four places

The same policy lives in the Express server, the page's meta CSP, the production Apache config and the UAT Nginx config: HSTS with preload, a strict CSP, frame protection, `nosniff`, a strict referrer policy, cross-origin isolation headers and a deny-by-default Permissions-Policy.

**Tradeoff:** four copies must stay in sync, which I documented with `curl` checks. Trusted Types was left off on purpose, because it breaks Angular and the tag manager.

## What broke, and the fix

In July 2026 a check showed production serving a two-month-old build **with no security headers and no caching**, while UAT had an outdated CSP and an invalid Permissions-Policy.

- **Cause:** the headers lived in the Node server, but production never runs Node. Apache serves the prerendered files directly, so those headers never reached a browser.
- **Fix:** first an `.htaccess` file; the same day I replaced it with reviewed copies of the Apache site configs in the repo, because the server team owns server configs and `.htaccess` is weaker. They add the headers, one-year immutable caching for hashed files, and `AllowOverride None`.
- **Proved with:** `curl` checks for each header, `Last-Modified` equal to the deploy date, and `Cache-Control` on hashed JavaScript.

Follow-ups in August 2026:

- The CSP blocked every analytics hit, because `*.analytics.google.com` doesn't match the bare domain. Fixing the server alone did nothing: the browser enforces both the header and the meta CSP, so the page needed a rebuild too.
- UAT Nginx sent more than half the routes through a trailing-slash redirect and returned soft 404s. Fixed, plus real 404s on Apache.
- Deploy excludes had left share images and icons missing or stale on both environments. Fixed.
- The share-image generator clipped 29 of the 122 share-image titles it generated and had left 6 of 7 product pages without an image. Fixed.

## Results

- 100+ pages prerendered and in the sitemap, each passing the SEO lint when added or changed.
- Security headers live on production, checked with `curl`.
- Production findings from penetration testing: 10 → 0.
- SVG assets cut from 146 MB to 8.8 MB in one optimisation pass.
- 96 desktop Lighthouse on the live home page (my run, November 2026).

## What I'd do next

- Decide whether production should run the Node server behind Apache or stay fully static, and remove the unused copy of the headers.
- Add the existing layout lint (headless Chrome checks that sections don't overlap) to the build; today it runs by hand.
- Store Lighthouse reports from CI, so scores are proved over time, not measured once.
