---
title: Every code was “Invalid”: a login lockout, and a fix that didn't deploy
order: 5
topic: Authentication
date: 2026-11-11
seoTitle: Every code was “Invalid”: a login lockout
description: Every two-factor code came back invalid. A failed check still saved a new secret, and the fix 'deployed' without being in the build.
problem: A production user got “Invalid” for every two-factor code.
found: Measured the clock, the key and the stored secret one by one; all were fine, so the fault was in enrolment.
fix: A failed check now writes nothing; then proved production was running an old build and had it rebuilt.
result: The user signed in; a test harness with a negative control guards the rule.
video: short-mfa
---
A user of a finance reporting app couldn't sign in to production. Correct password, then the two-factor screen: every six-digit code from their authenticator app came back **"Invalid Code"**. Every code, every time, with no way out of the screen.

It took about a day to fix, and most of that day went to a deploy that hadn't really deployed.

## The usual suspects

Authenticator codes (TOTP) are a function of a shared secret and the current time, in 30-second steps. When codes fail, the list of suspects is short:

1. **The clock.** If the server's clock and the phone's clock disagree, every code is for the wrong step.
2. **The encryption key.** The app stores each user's secret encrypted. A different key on production would decrypt it to garbage.
3. **The stored secret.** A corrupted or truncated secret can never produce a matching code.
4. **Tolerance.** Earlier that day I had shipped a small fix: the library defaulted to a window of 0, meaning the code had to be typed inside the very same 30-second step. A phone a few seconds off, or a user typing as the step rolls over, was rejected. Window 1 accepts the previous and next step, which is what authenticator apps assume.

My first guess was the clock, or the key.

## Measured, not guessed

Instead of changing anything, we checked each suspect on a local copy:

- The encryption key was set, and encrypting and decrypting a secret gave it back unchanged.
- Every one of the 24 enrolled users' secrets decrypted to a valid 32-character key.
- Verifying a fresh code against a stored secret returned **true**.
- The tolerance change could only ever accept *more* codes, never fewer.

So the server was sound. The codes simply didn't belong to the secret the server had stored. The question became: how did the wrong secret get stored?

## Bug one: enrolment saved on failure

Setting up two-factor works like this: the setup screen asks the server for a new secret and shows it as a QR code; you scan it and type a code; the server checks the code and turns two-factor on.

The verify step computed whether the code was valid, and then **saved the enrolment anyway**.

On its own that sounds survivable. Combined with one more detail, it locks people out: the setup screen asked for a **new** secret every time it loaded. So:

1. The user scans QR code A.
2. The page reloads (or they come back to it). It now holds secret B.
3. They type a code from their phone, which only knows A.
4. The check fails. The server saves the enrolment with secret B anyway.

Two-factor is now on, against a secret the phone has never seen. No code can ever match, and the screen has no way out. That was exactly where the user was. The code had been like this for more than a year; it only needed one user to reload at the wrong moment.

The fix is one rule: **a failed check writes nothing.** The user stays un-enrolled, sees what to do, and can try again or rescan.

To prove it, a test harness drove the real controller and the real two-factor service (the real TOTP library and the real encryption, with only the database stubbed):

- code from secret A while the page posts secret B → refused, zero writes, two-factor still off;
- code from the secret on screen → enrols, and a later sign-in succeeds;
- wrong code at sign-in → still refused;
- code from the previous 30-second step → accepted; five minutes old → refused.

As a negative control, the same harness was run with the guard removed: the mismatched code "succeeded" and enrolled. The test could tell the difference.

The same change removed a debug `console.log` that printed the encrypted secret and the backup-code hash to the server log on every enrolment.

## Bug two: the fix that "deployed" but didn't

The fix was pushed, the team that runs the server built and restarted the app, and we cleared the user's broken enrolment. They tried again, and it broke again.

Each reset was undone by the user's next attempt, as if the fix wasn't there. The clock and the key were suspected again, so we checked both on production: the clock matched, and the key's fingerprint was **identical** to ours. That pointed at the build itself. The fix wasn't there. The server had been built at 10:32 from source that didn't contain the commit, although it was pushed at 10:19. The process manager's restart looked like success, because it was one: a successful restart of the old code.

We stopped trusting the restart and checked the output instead. On a Windows server, `findstr` for a string that only the new code contains, in the compiled file:

```bat
rem simplified
findstr /s /m "the new error message" dist\*.js
```

Nothing found. Proof, in one line, that production was running the old build. After a real rebuild, the string was there, the reset held, and the user signed in. They confirmed it themselves.

## What I took from it

**Measure the suspects before you blame one.** The clock, the key and the secret each took minutes to rule out, and each ruled-out theory narrowed the search to the real cause.

**"Saved on failure" is a whole class of bug.** Any flow that writes state before confirming the user can use it (a secret, a password, an email change) can leave someone locked out. Write after the check, never before.

**Generate secrets once per attempt, not once per page load,** or at least make sure the server checks against the secret the user actually saw.

**Verify the built file, not the restart.** A deploy is done when the running code contains the change. Search the output for a string only your change contains.

**Log nothing secret, even encrypted.** A debug line that seems harmless is still a copy of the secret in a place nobody guards.

> **How this was solved.** I worked on this with Claude Code, an AI coding agent. My part: measuring the suspects on production with the team that runs the server, dropping my own clock-or-key theory when the numbers said so, pressing for proof that the new build was really live, and talking to the user. The agent traced the enrolment flow, wrote the fix and the harness with me, and I reviewed every change.
