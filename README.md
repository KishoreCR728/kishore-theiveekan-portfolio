# Kishore Theiveekan: Portfolio

The portfolio of a frontend engineer: [kishore-theiveekan.vercel.app](https://kishore-theiveekan.vercel.app).

A Next.js 16 static export. Every page is plain HTML at build time, there is no server, no cookies and no trackers, and the only JavaScript-heavy part (three.js) loads after the page is usable, on devices that can run it.

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # static site in out/
npm test        # release and navigation checks against out/ (run after a build)
npm start       # serve out/ at http://127.0.0.1:3000 the way the host does
npm run typecheck
npm run og      # regenerate share images after adding or renaming content
```

## How it is organised

```
src/
  app/                    routes (App Router, all statically exported)
    page.tsx              home: the Lusion design (src/lusion) with the sections in components/home slotted in
    work/[slug]/          case studies
    writing/, [slug]/     articles
    sitemap.ts, robots.ts, llms.txt/   generated from the content below
  components/
    home/                 sections added to the home page (experience, writing)
    site/                 header and footer shared by every content page
  content/
    work/*.md             flagship case studies (front matter + Markdown)
    writing/*.md          articles
    home.ts               home page text
    portfolio.js          home page data (projects, journey years, stack, off the clock) and the shorter case studies
  lib/
    content.ts            reads the Markdown at build time
    markdown.tsx          a small renderer that returns React elements, never raw HTML
    cases.ts              one list of case studies for every page
  lusion/                 the home page design: scroll, 3D hero and city, converted from the Claude Design prototype
qa/                       release checks (Playwright + real Chrome)
scripts/og.mjs            renders 1200x630 share images
```

Content is data: adding an article is one Markdown file in `src/content/writing/`. The pages, sitemap, `llms.txt` and share image all pick it up.

## Decisions

- **Static export, no server.** It's a portfolio; HTML files on a CDN are the fastest and safest thing to serve.
- **Markdown rendered to React elements.** No `dangerouslySetInnerHTML` for content, so a file can't inject markup, and an unsafe link, unclosed code block or broken front matter fails the build. The renderer supports only what the writing uses.
- **3D that does something.** In the hero, four orange shapes are the four main projects: hover shows the project, click opens it, and the same projects are plain links underneath for keyboards and phones. The three.js scenes start after a loader of under a second, only with hardware WebGL and no reduced-motion preference; otherwise a still of the same scene is shown, decided before first paint so nothing shifts.
- **Fonts through `next/font/local`.** Preloaded, with metric-matched fallbacks, so text doesn't move when fonts arrive (layout shift 0).
- **The design is the original.** The home page is the Lusion design from Claude Design, kept as converted code in `src/lusion/` and restructured for recruiters: a profile card, work first, then experience, the 2023–2026 journey city, writing and contact.

## Quality checks

- `npm test`: every page (home, case studies, articles, 404) at six widths (320 to 1920 px) in real Chrome, with no horizontal overflow and no console errors; every link and anchor on every page resolves; every indexable page has a description, canonical URL and an existing share image. Locally it also fails on a list of banned terms (`QA_BANNED`), so client names stay off the site; that list isn't in the repo.
- `qa/nav.mjs` (also in `npm test`): clicks every internal link on each kind of page at desktop and phone width and checks where it lands, that section links (also from other pages, past the loader) put the section on screen, that Back and Forward return to the right page, that the "next" links walk every case study and article, and that every menu item works and Escape closes the menu.
- GitHub Actions (read-only token, actions pinned to commits) type-checks, builds and runs Lighthouse CI on every push: mobile performance at least 85, and accessibility, best practices and SEO at least 95.
- Measured locally with compression, mobile: 98–100 performance, 100 accessibility, best practices and SEO.

## Security

Six headers from `vercel.json`: a Content-Security-Policy, HSTS, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy`.

## About the content

Client names are hidden on purpose. Work done with AI coding agents (Claude Code) is labelled as such on each case study, article and video, including what was mine; this site was built with Claude Code as a pair too. The videos use an AI-generated voice.
