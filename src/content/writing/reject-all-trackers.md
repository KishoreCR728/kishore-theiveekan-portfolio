---
title: "Reject All" didn't stop the trackers
order: 1
topic: Privacy and consent
date: 2026-11-11
description: A cookie banner's own start-up order let analytics and sales trackers run before consent and after Reject All. Finding the real cause, a fix that fails closed, and the black videos that followed.
---
A visitor opened a client's website, clicked **Reject All** on the cookie banner, and the analytics and sales-tracking scripts loaded anyway. The banner was ours. In Europe that is not a cosmetic bug: under EU privacy law (the ePrivacy rules, with GDPR-standard consent), a tracker that runs before consent, or after a refusal, is the exact thing a consent banner exists to prevent.

This is how we found the real cause, why the obvious explanation was wrong, and how the fix ended up failing closed.

## How the banner works

The product is a hosted cookie-consent service. A site adds one script tag. That script:

1. downloads the site's own settings (which categories exist, which vendors belong to each, the banner's text),
2. starts a blocking engine that holds known trackers until the visitor chooses,
3. tells Google Consent Mode what the visitor allowed,
4. shows the banner.

On our own test pages it worked.

## The symptom

On the client's live site, before any choice was made:

- Google Analytics was configured **before** Google had been told "denied".
- A social network's insight tag and a sales-intelligence script loaded before any choice.
- After **Reject All**, on the next page, they loaded again.

## The wrong explanation

The client's developer said the cause was load order: their WordPress files had to load before our script. It sounded plausible, and it would have meant the fix was on their side.

We tested it instead of arguing. Our script already came before every tracker on the page. Load order was not the problem.

## The real cause: a gap, not an order

The script's steps were in the wrong order for a slow network:

```js
// Before (simplified)
fetch(settingsUrl)
  .then(cfg => {
    startBlocker(cfg);       // hold trackers
    setConsentDefaults(cfg); // tell Google "denied"
    showBanner(cfg);
  });
```

The browser doesn't wait for that `fetch`. While the settings were downloading, the page kept parsing and every tracker below our tag started. By the time the blocker existed, the trackers had already run, and a script that has run cannot be called back.

On our own test pages the settings arrived quickly, so nothing fell into the gap. On the client's WordPress site, with many tags below ours, the trackers did.

## The fix: protect first, configure later

Version 1.1.1 split the start into two phases.

```js
// After (simplified)
consent.prepare();      // runs the moment the script runs:
                        // hold every tracker on the built-in vendor list
                        // and tell Google "denied" for everything

fetch(settingsUrl)
  .then(cfg => {
    init(cfg);          // apply this site's settings,
                        // release what this site would not have held,
                        // show the banner
  })
  .catch(() => {
    // settings unreachable: keep everything held, show no banner
  });
```

Three details mattered more than the main idea:

- **Release what you held by mistake.** The early phase uses a built-in list of tracker hosts, because the site's own list hasn't arrived. Once it does, anything the site's settings would *not* have held (an allowed host, a vendor the site maps to a different category, a site that tags scripts by hand) is released immediately. Otherwise the fix would break sites that were working.
- **Don't change sites that never used Consent Mode.** For them, Google is told "granted" at the end, exactly as before.
- **Fail closed.** If the settings can't be downloaded at all, trackers stay held and no banner appears. A broken banner server now costs the site its analytics, not its visitors' privacy.

Two missing trackers (the sales-intelligence script and a monitoring tool's real-user script) were added to the built-in vendor list at the same time.

## Proving it

A fix for a timing bug that you only test on a fast machine is a guess. So the test suite gained a page built like the client's, with the settings download **deliberately slowed down**. It checks 24 things: nothing loads before a choice, Google hears "denied" first, Accept and Reject both behave, returning visitors, per-site settings, the US (CCPA) variant, and an unreachable settings server.

After release, the live site was checked again for each choice: the trackers the banner handles waited for a choice and stayed off after Reject All. Two that still loaded needed tagging on the client's side, and once that was done, Reject All loaded none.

## The follow-up: black videos

Nine days later the same client reported that their testimonial videos didn't play after Reject All. They stayed **black**.

The page built a video player in a lightbox when you clicked. The built-in vendor list puts the video platform under targeting, as the client's cookie policy does, so the engine held the player, correctly. But the engine only showed a placeholder for players the site had tagged in advance. A player added later was just held, and the user saw an empty black box with no explanation.

Before changing anything, we measured the player: the normal embed contacted the video platform's analytics endpoint; the same embed with its privacy setting on (`dnt=1`) did not, and both played.

Two releases followed:

- **1.1.2:** a player the engine holds now gets a readable message in its exact position and size, with a "Customize Settings" button. Hidden one-pixel tracking frames get no message. A new test with 11 checks fails on the old version.
- **1.1.3:** a per-site option, off by default, that swaps a held player for its privacy-mode version (the video platform with `dnt=1`, YouTube's no-cookie domain) for visitors who haven't accepted, so the video plays without tracking. Visitors who accepted get the normal player. It also moved 1.1.2's blanket allowance for privacy-mode players under the same option, so stricter sites keep every player held.

The live check after release: Reject All, open a video, and the page loads the privacy-mode player.

## What I took from it

**Consent code must protect first and ask questions later.** Any step that waits for the network leaves a window, and the page doesn't wait with you.

**Test with the slow network, not the fast one.** The bug was invisible on every page we owned because our settings server was close and quick.

**Check the theory before the fix.** "Load order" was a reasonable explanation, and it took one test to rule it out. Arguing would have taken days.

**Fail closed, on purpose.** Decide what happens when your own server is down before it happens.

**Blocking isn't the whole job.** Holding the video was correct; leaving a black box was not. A privacy tool has to tell people what it did.

> **How this was solved.** I worked on this with Claude Code, an AI coding agent. My part: bringing the client's reports in, testing the client's load-order theory, deciding that no client-specific code ships and that the video option stays off by default, talking to the client's team, and having each release checked on the live site. The agent wrote most of the code and the tests with me, and I reviewed every change.
