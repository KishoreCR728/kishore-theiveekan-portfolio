---
title: Security headers in the real world: five ways a correct policy still fails
order: 4
topic: Web security
date: 2026-11-11
description: A correct Content-Security-Policy in the repo is not a protected site. Stale hand copies, nginx header inheritance, strict-dynamic, removing unsafe-inline, and a server that bypassed it all.
problem: A correct security policy in the repo did not protect the live pages.
found: Checked headers on every response type, not just the home page: scripts and fonts had none.
fix: Headers generated at build and re-included per nginx block, inline scripts removed, a proxy bypass closed.
result: All eight headers on every response; the security retest passed.
video: short-headers
---
Every guide to security headers ends the same way: add a Content-Security-Policy, HSTS and `X-Content-Type-Options`, check them with a scanner, done.

In practice, writing a correct policy was the easy part. On two sites in autumn 2026, a correct-looking policy failed to protect the pages in five different ways, and none of them showed an error. Here they are, in the order we hit them.

## 1. The hand-copied policy that went stale

The first site was the marketing site for a consent product. Its build already had one source of truth for headers: a script that wrote the same headers into the config for every deployment target, "so no deployment target can drift from the others".

The server that actually shipped the site was never added to that list. Its config carried its own hand-written copy of the policy, with `script-src 'self'` and a comment saying the site used no third-party code at all. That had been true, before the consent banner was embedded.

Tested against the real build, that policy blocked the site's own inline loader: **no banner and no working JavaScript**, silently. Nothing failed in the build; the HTML was fine.

The obvious fix (copy the correct policy across) wouldn't have held either. The policy contains a **hash of the inline loader**, and the hash changes whenever the build changes the loader. Any hand copy is correct for one build.

So the build now **generates** the server's header snippet too, and the server config includes it. The policy can't go stale unless the deploy step is skipped entirely.

## 2. nginx forgets your headers in some places

Generating the snippet surfaced the second problem, and it's one of nginx's best-known traps that still catches everyone:

> `add_header` directives are inherited from the level above **only if the current level defines none of its own**.

The `/assets/` and `/fonts/` blocks each set a `Cache-Control` header. That one `add_header` silently dropped every inherited header in those blocks. So every script bundle and every font was served with **no CSP, no HSTS and no `X-Content-Type-Options`**, while the HTML page looked perfectly locked down.

A header check against `/` would have passed. That's the dangerous part: the URL everyone tests was the one URL that was fine.

```nginx
# simplified
location /assets/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
    include security-headers.conf;   # without this line: no CSP here
}
```

Both blocks now re-include the generated snippet.

## 3. `strict-dynamic` blocked our own install instructions

The banner was loaded in an unusual way: the site's inline loader created the `<script>` element at runtime. That was because the policy used `'strict-dynamic'`, which tells the browser to **ignore host allowlists**: only scripts with the right hash, and scripts they create, may run. A plain `<script src="…">` in `<head>` would have been blocked.

It worked, but it meant the company's own site wasn't installed the way its install page tells every customer to install it. Nobody reading the page source could see the product.

We changed the policy to an ordinary host allowlist: `'self'`, the hash of the site's own inline loader, and the product's origin. The snippet now sits first in `<head>`, copied word for word from the install page. That's the shape a customer's site will have, so our site now tests the real installation.

It is a tradeoff. `'strict-dynamic'` is a strong design for sites with many dynamic scripts. For a small static site whose job is to show a one-line install, a short allowlist is simpler to reason about and matches what customers do. (We also left the snippet without a pinned integrity hash, because a pinned one breaks silently on the product's next release, which is why the install page recommends the unpinned version.)

Verified in a browser against the live platform: banner rendered, zero policy violations, and clicking Accept stored a consent record.

## 4. Removing `'unsafe-inline'` from a real site

The second site was the company's security-services site. A security test in October 2026 rated one finding Low: the policy allowed `'unsafe-inline'` and `'unsafe-eval'` in `script-src`, so it couldn't stop an injected script.

Removing two words from a header is easy. Making the site still work without them meant:

- moving the tag-manager loader from an inline `<script>` on every page into its own file, still loaded right after the consent script;
- replacing **17** `onclick` attributes in the HTML and **14** in markup built by JavaScript with `addEventListener` and delegated `data-*` handlers;
- removing the last inline scripts and the `<meta>` policies on 20 pages that still allowed both keywords;
- removing resources the policy already blocked, and slider calls to functions that didn't exist and threw on every click.

One happy side effect: a set of tabs on the services page **started working**. They had never worked. The HTML sanitiser had been stripping their `onclick` attributes all along, so clicking did nothing. With delegated listeners there was nothing left to strip.

A browser suite of 31 checks, run against the local site served as production, compared old and new pages. On the test server the new files arrived but the new nginx config wasn't loaded, so the first check still showed both keywords; once it was applied, the policy matched the repo and the suite passed 31 of 31. The retest passed on 26 October.

## 5. The server bypassed the policy entirely

Then production. Two separate things kept the correct policy from reaching visitors:

- **A proxy that skipped `.htaccess`.** The Apache config still had four `ProxyPass` lines sending old form paths to an Express server. Proxied responses never pass through `.htaccess`, so they carried **no security headers** and accepted `POST`. No page used them anymore. They were removed, and reviewed copies of both production vhosts now live in the repo.
- **A deploy that dropped the file.** The deploy process copied and moved files by hand, and `.htaccess` (a dotfile) didn't survive. It happened on both production deploys. On the second, the pages matched the commit exactly, and **there were no security headers at all**.

And one false alarm: after a deploy, a report of console errors turned out to be Chrome showing the **old homepage from its cache**, because the old site sent no cache headers. A hard refresh showed zero errors.

On 27 October, production was checked again: the policy identical to the repo, all eight headers on **every response type**, only `GET` and `HEAD` allowed, and the browser suite passing 31 of 31 on the live site.

## What I took from it

**Generate headers, don't copy them.** If the policy contains a build hash, a hand copy is wrong by design.

**Test every response type, not `/`.** Scripts, fonts, error pages and proxied paths are where headers go missing.

**Know your server's inheritance rules.** In nginx, one `add_header` in a block cancels every header it would have inherited.

**Verify after every deploy, on the real server.** The repo being right proves nothing about what visitors receive.

**Removing `'unsafe-inline'` is a refactor, not a config change.** Budget for the event handlers.

> **How this was solved.** I worked on this with Claude Code, an AI coding agent. My part: deciding how the sites should be installed and secured, getting the real server configs from the team that runs them, coordinating every deploy and retest, and making sure each live site was checked after every deploy. The agent wrote most of the code, the header generator and the browser checks with me, and I reviewed every change.
