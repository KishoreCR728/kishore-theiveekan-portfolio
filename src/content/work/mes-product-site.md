---
title: MES Product Site
order: 3
description: An unreleased scroll-driven 3D factory for a manufacturing software product, built in Angular with three.js and a walking robot made entirely in code.
oneLiner: A scroll-driven 3D factory with a walking robot built entirely in code.
tags: Angular 21 · three.js · GSAP ScrollTrigger · Lenis · Performance
status: Unreleased concept on a feature branch; not deployed
role: Sole developer. 158 of 162 commits, about five weeks
when: Apr – May 2026
team: A colleague added a security-scan CI file
stack: Angular 21, three.js 0.183, GSAP ScrollTrigger, Lenis, PrimeNG, Express 5 + MySQL contact API, reCAPTCHA v3
scale: About 45 routes, 59 components; a scroll-driven factory scene with a hand-built walking robot
proof: Working build on a feature branch; not released
ai: Built with AI coding tools; I directed the scene design, robot rig and performance work and verified every change
metric1: 59|Angular components
metric2: 1,024|steps in the camera's arc-length table
metric3: 5|weeks, first commit to last
impact1: Built it alone in about five weeks: 158 of 162 commits.
impact2: Kept three.js outside Angular’s change detection and freed GPU memory when you leave.
impact3: A walking robot and a constant-speed camera, all in code, no downloaded models.
---

## The problem

A manufacturing software product needed a site that shows what the software does on a real factory floor, not stock photos. The idea: scroll through a factory, and watch machines, screens and a robot worker react.

This site is **not live**. The 3D work sits on a feature branch and was never merged or deployed. I include it because the engineering is real and the code exists.

## Constraints

- It has to run in a normal browser on ordinary laptops, not only on a gaming GPU.
- It lives inside an Angular app built with server rendering in mind, so three.js must never run on the server and must clean up fully when you leave the page.
- Scroll must feel smooth and the camera must move at a steady speed.

## Decisions and tradeoffs

### 1. Keep the 3D world separate from Angular

A plain TypeScript `FactoryWorld` class owns the scene. A thin Angular component starts it in the browser only (`isPlatformBrowser`), runs the render loop outside Angular's change detection (`runOutsideAngular`), and on destroy cancels loops, kills ScrollTriggers and disposes the renderer, textures, shadows and environment maps.

**Tradeoff:** two layers to keep in sync, but Angular never re-renders 60 times a second and leaving the page doesn't leak GPU memory.

### 2. A camera on a curve, at constant speed

The route is an eight-corridor S-path on a Catmull-Rom curve, with a 1,024-step arc-length table so equal scroll gives equal distance. Lenis smooths the wheel, ScrollTrigger maps scroll to progress, and a frame-rate-independent damp moves the camera.

**Tradeoff:** the path is fixed (no free roaming), which keeps the story controlled.

### 3. A robot built from code, not a downloaded model

A skeleton of named joints from hips to fingers (four fingers with three joints each, a two-part thumb, three toes), a parametric walk cycle (hip, knee, ankle, sway, bob and arm swing from one phase, with cadence = speed ÷ stride so the feet don't slide), and poses: tapping buttons, pulling a lever, inspecting, typing on a tablet, carrying boxes, patrolling, sitting, and walking into a charging bay.

**Tradeoff:** more code than importing a model, but no licence questions, a tiny download, and full control of every motion.

## What broke, and the fix

- **Black flash on large screens:** the post-processing pipeline blinked black above 1,024 px wide. Bloom, depth-of-field and ambient-occlusion passes were tested and removed; lighting does the work instead.
- **Freezes when lights changed:** switching spotlights on and off forced shader recompiles (50–200 ms stalls). Lights now stay in the scene and change intensity instead.
- **Broken sticky layout and half-screen rendering:** `overflow-x: hidden` broke `position: sticky`; `overflow-x: clip` fixed it.
- **Jitter on fast or slow monitors:** per-frame lerps were replaced with frame-rate-independent damping.

## Performance work

- Pixel ratio locked to 1, dropping to 0.75 while the user drags.
- Weak devices (four or fewer cores, or a phone) lose antialiasing and shadows.
- Static meshes merged; repeated objects drawn as instanced meshes.
- Rendering pauses when the tab is hidden; a large wall texture loads only when the camera is near.
- Routes lazy-loaded.

## Results

- A working scroll-driven factory with a walking robot, built in about five weeks.
- Not measured yet: Lighthouse and frame rate on real mid-range phones. That is the first thing I'd do before release.

## What I'd do next

- Respect reduced motion inside the 3D scene (today only the CSS does).
- Measure on real mid-range phones and set a frame budget.
- Split three.js out of the main bundle and ship a production build.
