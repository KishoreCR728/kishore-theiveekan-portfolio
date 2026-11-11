---
title: Jarvis Assistant
order: 4
description: A local-first AI assistant with voice in English, Tamil and Tanglish, 103 tools, an offline fallback and a safety gate on every risky action. Open source.
oneLiner: A local-first AI assistant with voice in three languages, 103 tools and a safety gate on every risky action.
tags: Python · FastAPI · Electron · Whisper · Claude · Gemini · Ollama
role: Sole developer, personal project, built with Claude Code as a pair
when: Jul – Oct 2026
team: Personal project
stack: Python 3.11, FastAPI + WebSockets, Electron desktop app, MediaPipe, Whisper, Silero VAD, openWakeWord; Claude, Gemini or local Ollama models
scale: About 107 Python modules (~32k lines), 103 tools, 1,500+ automated tests
proof: Open source on GitHub · Linux desktop builds (AppImage, .deb)
ai: Built with Claude Code as a pair; the design, safety rules and verification are mine
code: https://github.com/KishoreCR728/jarvis-assistant
metric1: 103|tools
metric2: 1,500+|automated tests
metric3: 3|model backends, one offline
---

## The problem

I wanted an assistant that actually does things on my own computer (opens apps, manages files, sets reminders, remembers what I told it) in English, Tamil and Tanglish, without sending everything to a cloud service and without being dangerous.

## Constraints

- Local first: the server binds to 127.0.0.1 only; you bring your own key and it stays on your machine.
- It must keep working when the internet drops.
- An assistant that can run shell commands and delete files must never do something destructive without asking.
- Voice has to feel quick, so simple commands can't wait for a large model.

## Decisions and tradeoffs

### 1. Three model backends behind one interface

Claude, Gemini and a local Ollama model share one `ask()` interface. "Auto" picks whichever key exists; if a cloud call fails because the network is down, the local model answers instead.

**Tradeoff:** the lowest common feature set across providers, in exchange for no lock-in and an offline mode.

### 2. An instant path before the model

Simple commands ("what time is it", "ippo mani enna", "go to routines") are matched by patterns in three languages and answered with no model call. Everything else gets a short spoken acknowledgement, then a model turn with retries and a smaller "voice" tool set for lower latency.

**Tradeoff:** the instant path only covers simple commands, but those are the ones you say most.

### 3. Safety as code, not a prompt

- Shell commands go through three tiers: blocked outright (`rm -rf /`, `mkfs`, disk writes, fork bombs), confirm first (`rm`, `mv`, `sudo`, `kill`, `git reset --hard`), or run.
- Deleting moves to the Trash, never `rm`; the home folder itself is refused.
- Risky actions (overwriting files, closing windows, sending email, adding calendar events, delegating to Claude Code) send a confirm card and wait up to 60 seconds for yes or no: by click, by voice ("yes" / "seri", "no" / "venda") or by thumbs up or down to the camera.
- Scheduled routines automatically decline anything that would need confirmation.

**Tradeoff:** a few extra clicks, in exchange for an assistant I trust on my real machine.

Also: Electron over Tauri, because my Linux machine lacked the WebKit version Tauri needs.

## How it works

A FastAPI core on localhost with WebSocket channels for chat events, audio and gestures → a turn handler (instant path or model) → a tool registry (24 modules, 103 tools: computer control, files, screen reading, memory, second brain, journal, reminders, routines) → platform adapters for Linux, Windows and macOS. The Electron app starts the core as a sidecar and shows a console; events stream back as text chunks, tool start and end, and speech.

## What broke, and the fix: from v1 to a desktop app

v1 (July 2026) was a single Windows-first Python app. In September 2026 I restructured it into a monorepo: a core package, a shared event protocol, platform adapters, and an Electron shell (tray, always-on-top overlay, hotkeys) that starts the core as a sidecar.

Three things broke along the way:

- **The new app talked to the old one.** The July v1 build was still running on port 8765. The new desktop app saw "something on 8765", assumed it was its own core and connected to it. Fix: the core reports a build id at `/api/ping`; the shell only adopts a core with the same build, otherwise it starts its own on the next free port, with its own data folder and a single-instance lock. Settings migrate from the old folder once. Covered by tests on both sides.
- **A black box behind the overlay.** `backdrop-filter` on a transparent Electron window painted a black rectangle behind it. Fix: dropped `backdrop-filter` from that panel.
- **A panel squeezed to about 96 px.** Panel sizes were computed from the small orb window, not the screen. Fixed to use the real screen height.

## Results

- Works with three model providers, and offline with a local model.
- Voice and text in English, Tamil and Tanglish; wake word "hey Jarvis".
- 1,510 automated tests: 1,508 pass, one is skipped, and one memory-search test depends on local state and is being fixed.
- Linux desktop builds (AppImage, .deb); Windows and macOS packaging is configured but not yet built.

## What I'd do next

- Build and test the Windows and macOS packages.
- Make the memory-search test independent of the machine it runs on.
