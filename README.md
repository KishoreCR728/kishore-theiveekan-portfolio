# Kishore Theiveekan: Portfolio

The portfolio of a frontend engineer: [kishore-theiveekan.vercel.app](https://kishore-theiveekan.vercel.app).

Every page is plain HTML built ahead of time. There is no server, no cookies and no trackers. The one heavy part, a three.js hero, loads only when the visitor first moves, scrolls, touches or presses a key. PageSpeed Insights gives the live site 100 for performance, accessibility, best practices and SEO, on mobile and on desktop (November 2026).

## Run it

```bash
npm install
npm run dev        # http://localhost:3000 (development server)
npm run build      # static site in out/ (clears .next first)
npm test           # release, navigation and 3D checks against out/ (run after a build)
npm start          # serve out/ at http://127.0.0.1:3000 the way the host does
npm run typecheck
npm run og         # regenerate share images after adding or renaming content
```

## How a page gets to the browser

```
 Markdown + TypeScript content         next build (static export)          scripts/strip-react.mjs
 src/content/**  ─────────────────►  finished HTML for every page  ───────►  plain HTML + CSS
                                     (React renders at build time only)       (Next.js runtime removed)

 Home page only, in the browser:
 main.ts (esbuild) ──► controller.ts   menu, focus trap, smooth scroll, Back position, project names
                            │
                            └── first move / scroll / touch / key ──► scene.js + hero.ts + three.js (~640 KB)
                                only with hardware WebGL and no reduced-motion preference; otherwise a still
```

- **Build time.**
  - React and Next.js render every route to finished HTML.
  - Case studies and articles are Markdown files with front matter.
  - The sitemap, `robots.txt`, `llms.txt` and the 1200×630 share images are generated from the same content.
- **After the build.**
  - `scripts/strip-react.mjs` removes the Next.js runtime and the embedded React data, because no page hydrates. On mobile Lighthouse this took pages from 92–97 to 100.
  - `qa/run.mjs` fails if any page still references them.
- **In the browser.**
  - Only the home page runs JavaScript of its own: a small typed module built with esbuild (`scripts/build-runtime.mjs`, hashed file names).
  - three.js and the scenes are a separate chunk, imported on the first interaction.

## Layout

```
src/
  app/                  routes (App Router, statically exported): home, work/[slug], writing/[slug], 404,
                        sitemap.ts, robots.ts, llms.txt
  home/
    Markup.tsx          home page markup, server-rendered (converted from the original design file)
    view.ts             typed data shared by the markup and the runtime
    runtime/
      main.ts           entry point
      controller.ts     menu, keyboard and focus, smooth wheel, Back-position restore, reveals, project names
      hero.ts           hero scene: instanced shapes, a clear zone around the project name, colour trail
      scene.js          scroll scenes and the 2023–2026 journey city (ported, untyped; see "Next")
    lusion.css          home page styles
  components/
    home/               experience, writing and "working with me" sections
    site/               header/footer, Back link, previous/next pager, diagrams, video block
  content/
    work/*.md           flagship case studies
    writing/*.md        articles
    portfolio.js        home page data and the shorter case studies
  lib/
    content.ts          reads and validates front matter at build time
    markdown.tsx        a small Markdown renderer that returns React elements, never raw HTML
    cases.ts            one list of case studies for every page
qa/                     release checks with Playwright and real Chrome
scripts/                runtime build, React stripping, share images, font subsetting
```

To add an article, add one Markdown file in `src/content/writing/`. The page, the sitemap, the `llms.txt` entry and the share image all pick it up.

## Decisions and trade-offs

| Decision | Why | Cost |
|---|---|---|
| Static export, no server | A portfolio needs nothing dynamic. HTML on a CDN is the fastest option and has nothing to attack | No forms or server features (email links instead) |
| Strip the Next.js runtime after the build | No page hydrates, so the runtime was pure weight. Mobile Lighthouse went from 92–97 to 100 | Depends on Next's output format; a test fails if that format changes |
| Load three.js on the first interaction | Parsing 640 KB during load put Total Blocking Time at 1,290 ms (Lighthouse 66). Deferring it took TBT to near zero | The panel is plain black until the visitor first moves, scrolls, touches or presses a key |
| A still image when there's no hardware WebGL, or with reduced motion | Software renderers take hundreds of milliseconds per frame, and reduced motion is the visitor's stated preference | A second layout to keep working, covered by `qa/run.mjs` |
| Hero resolution steps down on slow GPUs | Keeps the animation near 50 fps on integrated graphics | A slightly softer image on those machines |
| Markdown → React elements, no `dangerouslySetInnerHTML` | Content can't inject markup. Unsafe links, unclosed code fences and bad front matter fail the build | The renderer supports only what the writing uses |
| `next/font/local` with size-matched fallbacks for Arial and Liberation Sans/Arimo | Text doesn't re-wrap when the real fonts arrive, Linux included | Two extra `@font-face` rules |
| Scripts allowed by hash in the Content-Security-Policy, not `'unsafe-inline'` | Injected scripts can't run | Every inline script needs a hash. `qa/run.mjs` re-hashes them and compares with `vercel.json` |

## Quality checks

- **`qa/run.mjs`:**
  - Covers every page (home, case studies, articles, 404) at six widths from 320 to 1920 px, in real Chrome.
  - Fails on horizontal overflow and on console errors.
  - Checks that every link and anchor resolves.
  - Checks that every indexable page has a description, a canonical URL and an existing share image.
  - Checks that the CSP hashes match the inline scripts.
  - Locally it also fails on a list of banned terms (`QA_BANNED`), so client names stay off the site. That list isn't in the repo.
- **`qa/nav.mjs`:**
  - Clicks every internal link at desktop and phone width and checks where it lands.
  - Checks that section links put the section on screen.
  - Checks that Back and Forward return to the right page, and that previous/next walk every case study and article.
  - Checks every menu item, and that Escape closes the menu.
- **`qa/gpu.mjs`** (with `QA_GPU=1`, on a machine with a GPU): checks that the 3D does not load before interaction and starts after it, and that each project card shows its name.
- **GitHub Actions** (read-only token, actions pinned to commit SHAs): type-check, build, the checks above, and Lighthouse CI. It fails if mobile performance drops below 85, or accessibility, best practices or SEO drop below 95.

## Security

`vercel.json` sets eight headers on every response:
- Content-Security-Policy, with scripts allowed by hash
- HSTS
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
- Cross-Origin-Opener-Policy
- Cross-Origin-Resource-Policy

Source maps are not published. `/.well-known/security.txt` gives a contact.

## Next

What I'd change next, in order:

1. Split `src/home/Markup.tsx` (converted from the design file, with many inline styles) into section components with their own CSS.
2. Convert `scene.js` to TypeScript, with an explicit context object instead of running with the controller as `this`.
3. Add unit tests (Vitest) for `lib/markdown.tsx` and `lib/content.ts`, and ESLint plus a Prettier check in CI.
4. Replace the polling and fixed waits in the controller and the tests with events and explicit ready flags.

## About the content

Client names are hidden on purpose. Each case study, article and video says where an AI coding agent (Claude Code) was used and what was mine. This site was also built with Claude Code as a pair. The videos use an AI-generated voice.
