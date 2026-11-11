---
title: Our build said success. The crawlers saw a blank page.
order: 5
topic: Build and release
date: 2026-11-11
video: build-gate
description: A prerender fallback I designed shipped hundreds of empty pages to crawlers for up to two weeks while the build stayed green. How it was found, and the build gate that replaced it.
---
For up to two weeks, a site I lead shipped hundreds of pages that looked perfect in a browser and were empty to anything that didn't run JavaScript. The build was green the whole time. I had designed it that way.

## Why we prerender

The site is a React app in 18 languages. A plain React app sends this to every visitor:

```html
<div id="root"></div>
<script src="/assets/index.js"></script>
```

Browsers run the script and draw the page. Many crawlers and AI bots don't run scripts. They see an empty `div`.

So after `vite build`, a script opens every route in headless Chromium with Puppeteer, waits for the page to render, and saves the real HTML. Crawlers get text; browsers still get the app.

## The decision that caused it

When I wrote the prerender script, I worried about one thing: a flaky build machine blocking a release. So I added a fallback. If Chromium couldn't start, the script wrote "head-only" pages (correct titles and meta tags, empty body) and exited with code 0. My own comment said the build "can never go red".

It felt responsible. It was the bug.

## What happened

The server that builds production didn't have Chromium installed. Every deploy:

1. printed a "head only" warning into a log nobody reads,
2. exited 0,
3. produced about 380 HTML files that looked completely normal in a file listing.

Open any of them in a browser and the JavaScript drew the page. Look at the raw HTML and the body was empty.

## How it was found

Not by me. An external SEO audit in August flagged it. I checked it myself before believing it:

```bash
curl -s https://<site>/ | sed 's/<[^>]*>//g' | tr -s ' \n' | wc -c
```

Production home page: **0** visible characters. The same page from my local build: **15,147**. The Hindi and Tamil pages served English titles. UAT was the same.

## The first fix wasn't enough

On 11 August I made the prerender strict when it ran in CI: a missing browser or an empty page now exits 1.

Then I looked at how the site is actually deployed. The team that deploys it clones the repo on the server and runs `npm run build`. They don't run our CI pipeline. My strict mode would never run where it mattered.

## The real fix: strict by default

On 12 August the script became strict by default. It fails the build if:

- the full render throws,
- any single page falls back to head-only,
- anything unrecoverable happens.

Slow pages are retried one at a time with 90- and 120-second timeouts before it gives up. There is an explicit `build:nostrict` for local experiments, and you have to type it on purpose.

I also put a second, independent check after it. An SEO validator reads the generated files and fails any indexable page with fewer than 500 visible characters, with much higher floors for large pages like the tools and knowledge sections. It also fails if a raw translation key, like `home.hero.title`, appears in the output.

So the build is now:

```
locale parity → lint → types → vite build → prerender (strict) → SEO validator
```

Every arrow is `&&`. Any failure stops the deploy before a single file is copied.

By 28 August the fix was confirmed on production.

## What I took from it

**A build that can't fail can't protect you.** "Never go red" sounded like reliability. It meant the build lost the ability to tell me the truth.

**Put the gate where the deploy actually happens.** A check in CI is worthless if production isn't built by CI. Find out who runs which command on which machine.

**Check the output, not the process.** The prerender script reported its own success. The validator doesn't trust it: it reads the files that will be served and counts the words.

**Verify like an outsider.** `curl` and a character count took thirty seconds and settled the question. The browser had hidden the problem because it ran the JavaScript for me.

**Two layers beat one clever one.** The prerender stops on known failures; the validator catches the ones I haven't imagined yet.

The best test of a release gate is to break it on purpose. We did: we blocked the port the prerender uses, and the build failed, as it should.

> **How this was solved.** I worked on this site with Claude Code, an AI coding agent, as a pair. My part: the original fallback decision (and owning it), confirming the audit with my own measurements, finding out how production was really built, and deciding that the build must be strict by default with a second, independent check. The agent wrote most of the scripts with me, and I reviewed every change.
