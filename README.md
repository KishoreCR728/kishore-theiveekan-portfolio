# Kishore Theiveekan: Portfolio

The portfolio of a frontend engineer: [kishore-theiveekan.vercel.app](https://kishore-theiveekan.vercel.app).

A Next.js 16 static export. Every page is plain HTML at build time, there is no server, no cookies and no trackers, and the only JavaScript-heavy part (three.js) loads after the page is usable, on devices that can run it.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static site in out/
npm test        # release checks against out/ (run after a build)
npm run og      # regenerate share images after adding or renaming content
```

## How it is organised

```
src/
  app/                    routes (App Router, all statically exported)
    page.tsx              home: composes the sections in components/home
    work/[slug]/          case studies
    writing/, [slug]/     articles
    journey/              optional immersive 3D version (noindex)
    sitemap.ts, robots.ts, llms.txt/   generated from the content below
  components/
    home/                 one component per home section; HeroScene is the only client component
    site/                 header and footer shared by every content page
  content/
    work/*.md             flagship case studies (front matter + Markdown)
    writing/*.md          articles
    home.ts               home page text
    portfolio.js          shorter case studies and data used by /journey
  lib/
    content.ts            reads the Markdown at build time
    markdown.tsx          a small renderer that returns React elements, never raw HTML
    cases.ts              one list of case studies for every page
  journey/                the original scroll-driven three.js city, converted from the design prototype
qa/                       release checks (Playwright + real Chrome)
scripts/og.mjs            renders 1200x630 share images
```

Content is data: adding an article is one Markdown file in `src/content/writing/`. The pages, sitemap, `llms.txt` and share image all pick it up.

## Decisions

- **Static export, no server.** It's a portfolio; HTML files on a CDN are the fastest and safest thing to serve.
- **Markdown rendered to React elements.** No `dangerouslySetInnerHTML` for content, so a typo in a file can't inject markup. The renderer supports only what the writing uses.
- **three.js is optional.** The hero scene loads only on desktop-sized screens with hardware WebGL and no reduced-motion preference, after the browser is idle. It pauses off screen and switches itself off if frames take longer than 50 ms. Everyone else gets a CSS backdrop.
- **Fonts through `next/font/local`.** Preloaded, with metric-matched fallbacks, so text doesn't move when fonts arrive (layout shift 0).
- **The immersive version is kept, not deleted.** `/journey` is the original design, a scroll-driven city with one district a year. It is code converted from the design prototype, so it lives in its own folder with its own CSS and is not indexed.

## Quality checks

- `npm test`: every route at six widths (320 to 1920 px) in real Chrome, with no horizontal overflow, no console errors, no broken links or anchors, a description, canonical URL and share image on every indexable page, and a list of banned terms (client names stay off the site).
- GitHub Actions runs Lighthouse CI on every push: mobile performance at least 85, and accessibility, best practices and SEO at least 95.
- Measured locally with compression, mobile: 98–100 performance, 100 accessibility, best practices and SEO.

## Security

Six headers from `vercel.json`: a Content-Security-Policy, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy`.

## About the content

Client names are hidden on purpose. Work done with AI coding agents (Claude Code) is labelled as such on each case study and article, including what was mine.
