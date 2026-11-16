/*
 * Hero: a dark panel with about fifty large glossy shapes (rounded cubes, capsules, rings, spheres, a few glass)
 * in orange, white, warm grey and graphite, plus a colourful light trail that follows the pointer.
 *
 * Scrolling (the original hero's motion): the shapes start spread out and gather as the camera pushes in through
 * them; the whole set turns with scroll and with the pointer, and tilts with scroll speed.
 * Hovering, focusing or swiping to a project card parts the shapes to the sides and builds the project's name
 * from glowing orange cubes on an exact grid (a hand-drawn 5x7 pixel font, each font pixel a 2x2 block of cubes).
 * Moving straight to another card morphs the same cubes from one name into the next, left to right, without
 * dropping them; moving away scatters them back. Every move is timed and eased per cube, so nothing snaps.
 */
import type * as THREE_NS from "three";
import type { RoundedBoxGeometry as RBG } from "three/addons/geometries/RoundedBoxGeometry.js";
import type { RoomEnvironment as RE } from "three/addons/environments/RoomEnvironment.js";

type Three = typeof THREE_NS;

export interface HeroOptions {
  THREE: Three;
  RoundedBoxGeometry: typeof RBG;
  RoomEnvironment: typeof RE;
  canvas: HTMLCanvasElement;
  /** One short uppercase word per project (e.g. "ERP", "JARVIS"). */
  titles: string[];
  /** Coarse pointer (phones, tablets): fewer shapes, no glass, no trail. */
  low: boolean;
}

export interface HeroFrame {
  dt: number;
  t: number;
  /** Scroll progress through the hero section, 0..1. */
  p: number;
  /** Smoothed scroll velocity, -1..1. */
  vn?: number;
  /** Pointer in client pixels and normalised (-1..1). */
  pointer: { x: number; y: number; nx: number; ny: number };
}

export interface Hero {
  frame(f: HeroFrame): void;
  resize(): void;
  /** Build project i's word; -1 releases it. `refit` re-lays it after a resize without restarting. */
  show(i: number, refit?: boolean): void;
  /** Where the word ends on screen (px from the top of the canvas), for placing the caption. */
  titleBottom(): number;
}

/* ---------- 5x7 pixel font (uppercase A–Z), one string per row ---------- */
const FONT: Record<string, string[]> = {
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  B: ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
  C: [".####", "#....", "#....", "#....", "#....", "#....", ".####"],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  E: ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
  F: ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
  G: [".####", "#....", "#....", "#.###", "#...#", "#...#", ".###."],
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  J: ["..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  L: ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
  M: ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
  N: ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  P: ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
  Q: [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
  R: ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
  S: [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  U: ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  V: ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
  W: ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
  X: ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
  Y: ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
  Z: ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
};


/** Font pixels of a word as [column, row] (row 0 = top), plus the word's size in font pixels. */
function wordPixels(word: string): { px: [number, number][]; cols: number; rows: number } {
  const px: [number, number][] = [];
  let x = 0;
  for (const ch of word.toUpperCase()) {
    const glyph = FONT[ch];
    if (glyph) glyph.forEach((row, r) => [...row].forEach((c, k) => { if (c === "#") px.push([x + k, r]); }));
    x += 6; // 5 columns plus 1 column of space
  }
  return { px, cols: Math.max(1, x - 1), rows: 7 };
}

const BG = 0x0b0a09;
const ORANGE = 0xe0562a;
const SHAPE_COLOURS: [number, number][] = [[ORANGE, 34], [0xf4f1ec, 34], [0xc7c0b4, 18], [0x57524b, 14]];
/** Distance from the camera to the plane the word sits on (kept constant, so the word never resizes on scroll). */
const WORD_DIST = 13;
const BUILD = 0.75; // seconds for one cube's flight
const TRAIL_SCALE = 3; // drawn at a third of the size and scaled up, plus a light blur: soft and cheap
const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOutBack = (x: number) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const smooth = (x: number) => x * x * (3 - 2 * x);

interface Shape { kind: number; glass: boolean; base: THREE_NS.Vector3; size: number; phase: number; spin: THREE_NS.Vector3; rot: THREE_NS.Euler; }
/**
 * One cube of the word. It flies from `from` (wherever it was) to `to` over BUILD seconds, starting at `start`.
 * `on` says whether its destination is a grid cell (visible) or a scatter point (hidden at the end).
 */
interface Cube { from: THREE_NS.Vector3; to: THREE_NS.Vector3; cur: THREE_NS.Vector3; start: number; on: boolean; wasOn: boolean; axis: THREE_NS.Vector3; s0: number; s1: number; }

export function createHero(o: HeroOptions): Hero {
  const { THREE, canvas } = o;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, o.low ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 14, 34);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new o.RoomEnvironment(), 0.04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 2.6);
  key.position.set(5, 8, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd2b8, 1.1);
  rim.position.set(-6, -3, -4);
  scene.add(rim);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.z = 18;

  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  const glossy = (emissive = 0) => o.low
    ? new THREE.MeshStandardMaterial({ roughness: 0.22, metalness: 0, envMapIntensity: 1.2, emissive: ORANGE, emissiveIntensity: emissive })
    : new THREE.MeshPhysicalMaterial({ roughness: 0.2, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 1.15, emissive: ORANGE, emissiveIntensity: emissive });
  const color = new THREE.Color();

  // ---- the large shapes: one InstancedMesh per geometry (+ glass versions on desktop)
  const geos = [new o.RoundedBoxGeometry(1.05, 1.05, 1.05, 4, 0.24), new THREE.CapsuleGeometry(0.34, 1.0, 10, 24), new THREE.TorusGeometry(0.56, 0.21, 24, 64), new THREE.SphereGeometry(0.62, 40, 28)];
  const COUNT = o.low ? 30 : 48;
  const totalW = SHAPE_COLOURS.reduce((s, [, w]) => s + w, 0);
  const pickColour = () => { let r = Math.random() * totalW; for (const [c, w] of SHAPE_COLOURS) { if ((r -= w) <= 0) return c; } return ORANGE; };
  const shapes: Shape[] = [];
  for (let i = 0; i < COUNT; i++) {
    // The original hero's cloud: a disc around the centre, deeper than wide.
    const r = rnd(1.6, 6.4), th = rnd(0, Math.PI * 2);
    shapes.push({
      kind: i % geos.length, glass: !o.low && i % 7 === 3,
      base: new THREE.Vector3(r * Math.cos(th), r * Math.sin(th) * 0.68 + rnd(-1, 1), rnd(-6, 3.5)),
      size: rnd(0.75, 1.3), phase: rnd(0, Math.PI * 2),
      spin: new THREE.Vector3(rnd(-0.4, 0.4), rnd(-0.4, 0.4), rnd(-0.2, 0.2)), rot: new THREE.Euler(rnd(0, 6.3), rnd(0, 6.3), rnd(0, 6.3)),
    });
  }
  // "Glass" without a transmission pass (that would render the scene twice): clear-coated and see-through.
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xeaf2f6, roughness: 0.04, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.2, transparent: true, opacity: 0.55, depthWrite: false });
  const groups: { m: THREE_NS.InstancedMesh; list: Shape[] }[] = [];
  geos.forEach((g, k) => {
    for (const glass of [false, true]) {
      const list = shapes.filter((s) => s.kind === k && s.glass === glass);
      if (!list.length) continue;
      const m = new THREE.InstancedMesh(g, glass ? glassMat : glossy(), list.length);
      m.frustumCulled = false; // instances move every frame
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      if (!glass) { list.forEach((_, j) => m.setColorAt(j, color.setHex(pickColour()))); if (m.instanceColor) m.instanceColor.needsUpdate = true; }
      scene.add(m);
      groups.push({ m, list });
    }
  });

  // ---- the word: glowing orange cubes, enough for the longest name in 2x2 lettering
  const MAX = Math.max(...o.titles.map((w) => wordPixels(w).px.length * 4), 4);
  const cubeMat = glossy(0.35);
  cubeMat.color.setHex(ORANGE);
  const cubeMesh = new THREE.InstancedMesh(new o.RoundedBoxGeometry(1, 1, 1, 2, 0.14), cubeMat, MAX);
  cubeMesh.frustumCulled = false;
  cubeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(cubeMesh);
  const cubes: Cube[] = Array.from({ length: MAX }, () => ({ from: new THREE.Vector3(), to: new THREE.Vector3(), cur: new THREE.Vector3(0, -40, 0), start: 0, on: false, wasOn: false, axis: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1)).normalize(), s0: 0, s1: 0 }));
  // A soft orange halo behind the word.
  const haloTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const x = c.getContext("2d")!; const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(224,86,42,0.55)"); g.addColorStop(0.5, "rgba(224,86,42,0.16)"); g.addColorStop(1, "rgba(224,86,42,0)");
    x.fillStyle = g; x.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const halo = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: haloTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0, fog: false }));
  scene.add(halo);

  // ---- the original hero's colour trail: a 2D canvas over the panel, screen-blended, blurred.
  const trail = o.low ? null : document.createElement("canvas");
  const tctx = trail?.getContext("2d") ?? null;
  if (trail) {
    Object.assign(trail.style, { position: "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: "none", opacity: "0.75", filter: "blur(5px)" }); // plain alpha: on black it looks the same as a screen blend, without recompositing the panel
    trail.setAttribute("aria-hidden", "true");
    canvas.after(trail);
  }

  // Scratch objects, reused every frame.
  const dummy = new THREE.Object3D(), q = new THREE.Quaternion(), qi = new THREE.Quaternion(), set = new THREE.Euler(), setQ = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  let current = -1, cell = 0.2, wordW = 0, wordCy = 0, wordH = 0, width = 1, height = 1;
  let lastPX = -9999, lastPY = -9999, trailIdle = 99, spinY = 0, rotX = 0, rotZ = 0, part = 0, haloAmt = 0, hue = 20, px0 = -9999, py0 = -9999, now = 0;

  /** Visible size of the word plane at WORD_DIST from the camera. */
  const plane = () => { const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * WORD_DIST; return { h, w: h * camera.aspect }; };
  /** Word-plane point (x, y relative to the camera axis) to world space. */
  const onPlane = (x: number, y: number, out: THREE_NS.Vector3) => out.set(camera.position.x + x, camera.position.y + y, camera.position.z - WORD_DIST);

  /** Grid cells of word i, left to right, in plane coordinates. */
  function layout(i: number): { x: number; y: number }[] {
    const { px, cols, rows } = wordPixels(o.titles[i]);
    const { w, h } = plane();
    const narrow = camera.aspect < 1.25;
    const pixel = Math.min((w * (narrow ? 0.84 : 0.56)) / cols, (h * (narrow ? 0.2 : 0.3)) / rows);
    cell = pixel / 2;
    wordW = cols * pixel; wordH = rows * pixel; wordCy = h * (narrow ? 0.12 : 0.08);
    const x0 = -wordW / 2, y0 = wordCy + wordH / 2;
    const out: { x: number; y: number }[] = [];
    for (const [cx, ry] of px) for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) out.push({ x: x0 + (cx + (a + 0.5) / 2) * pixel, y: y0 - (ry + (b + 0.5) / 2) * pixel });
    return out.sort((p1, p2) => p1.x - p2.x || p2.y - p1.y);
  }

  /** Starts every cube's flight from where it is now. Cubes keep their order, so one word morphs into the next. */
  function show(i: number, refit = false) {
    if (i === current && !refit) return;
    const switching = current >= 0 && i >= 0 && !refit;
    current = i;
    const cells = i >= 0 && o.titles[i] ? layout(i) : [];
    const { w } = plane();
    cubes.forEach((c, k) => {
      c.from.copy(c.cur);
      c.wasOn = c.on && c.s1 > 0;
      c.s0 = c.wasOn ? cell * 0.92 : 0;
      if (k < cells.length) {
        onPlane(cells[k].x, cells[k].y, c.to);
        c.on = true;
        c.s1 = cell * 0.92;
        if (!c.wasOn) onPlane(cells[k].x * 0.2 + rnd(-1.5, 1.5), cells[k].y - wordH * 1.6 - rnd(0, 2), c.from); // new cubes rise from below
        // Left to right wave; a quicker wave when morphing between words, none for a refit.
        const lead = (cells[k].x + wordW / 2) / Math.max(1, wordW);
        c.start = refit ? now - BUILD : now + lead * (switching ? 0.28 : 0.42) + rnd(0, 0.05);
      } else {
        c.on = false;
        c.s1 = 0;
        if (c.wasOn) { // fly out and shrink: up and outward, away from the centre
          const side = c.cur.x >= camera.position.x ? 1 : -1;
          c.to.set(c.cur.x + side * rnd(2, 5), c.cur.y + rnd(-1.5, 2.5), c.cur.z - rnd(1, 4));
          c.start = now + (0.5 - (c.cur.x - camera.position.x) / w) * 0.12;
        } else { c.to.copy(c.cur); c.start = now - BUILD; }
      }
    });
  }

  function frame({ dt, t, p, vn = 0, pointer }: HeroFrame) {
    now = t;
    const e = smooth(p), k6 = 1 - Math.exp(-dt * 6), kP = 1 - Math.exp(-dt * 3.2);
    // Original motion: the shapes gather from a wide spread while the camera pushes in through them.
    const spread = 1 + (1 - smooth(Math.min(1, p * 1.6))) * 1.4;
    camera.position.z = 18 - e * 7; // push in through the shapes (the original went further; this keeps them from filling the frame)
    camera.position.x += (pointer.nx * 0.7 - camera.position.x) * 0.05;
    camera.position.y += (-pointer.ny * 0.5 - camera.position.y) * 0.05;
    // The set turns with scroll and the pointer, and tilts with scroll speed.
    spinY += ((pointer.nx * 0.3 + e * 1.6) - spinY) * k6 * 0.6;
    rotX += ((pointer.ny * 0.2 - vn * 0.15) - rotX) * k6 * 0.6;
    rotZ += (vn * 0.12 - rotZ) * k6 * 0.7;
    set.set(rotX, spinY, rotZ);
    setQ.setFromEuler(set);
    part += ((current >= 0 ? 1 : 0) - part) * kP;
    const camZ = camera.position.z, wordZ = camZ - WORD_DIST;

    for (const { m, list } of groups) {
      list.forEach((s, j) => {
        pos.set(
          s.base.x * spread + Math.cos(t * 0.35 + s.phase) * 0.18,
          s.base.y * spread + Math.sin(t * 0.5 + s.phase) * 0.25 - vn * 0.6,
          s.base.z * spread,
        ).applyQuaternion(setQ);
        if (part > 0.001) {
          // Part to the sides in screen space (shapes further back must move further out to look clear of the word).
          const depth = camZ - pos.z, reach = (wordW / 2 + 1.4) * depth / WORD_DIST;
          const dx = pos.x - camera.position.x, side = dx >= 0 ? 1 : -1, need = Math.max(0, reach - Math.abs(dx));
          pos.x += side * need * part;
          if (pos.z > wordZ - 0.5 && Math.abs(dx) < reach) pos.z -= (pos.z - (wordZ - 0.5)) * part * 0.6; // nothing in front of the word
        }
        s.rot.x += (s.spin.x) * dt; s.rot.y += (s.spin.y + vn * 1.5) * dt; s.rot.z += s.spin.z * dt;
        dummy.position.copy(pos); dummy.rotation.copy(s.rot); dummy.scale.setScalar(s.size * (1 - part * 0.18)); dummy.updateMatrix();
        m.setMatrixAt(j, dummy.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
    }

    // The word's cubes: timed, eased flights; a soft wave once settled.
    for (let i = 0; i < MAX; i++) {
      const c = cubes[i];
      const raw = Math.min(1, Math.max(0, (t - c.start) / BUILD)), a = easeInOutCubic(raw);
      // The word follows the camera's push-in, so it keeps its size and place while the page scrolls.
      if (c.on) c.to.z = wordZ;
      c.cur.lerpVectors(c.from, c.to, a);
      if (c.on && raw < 1) c.cur.z += Math.sin(Math.PI * a) * (c.wasOn ? 0.8 : 1.6); // arc toward the viewer
      if (c.on && raw >= 1) c.cur.z += Math.sin(t * 2.2 - c.to.x * 1.4) * 0.05; // settled shimmer
      const sc = c.on ? c.s0 + (c.s1 - c.s0) * (c.wasOn ? a : Math.min(1, easeOutBack(Math.min(1, raw * 1.15)))) : c.s0 * (1 - a);
      if (sc <= 0.0005) { dummy.position.set(0, -60, 0); dummy.scale.setScalar(0.0001); }
      else { q.setFromAxisAngle(c.axis, (1 - a) * (c.wasOn && c.on ? 1.2 : 2.6)).slerp(qi, c.on ? a : 0); dummy.position.copy(c.cur); dummy.quaternion.copy(q); dummy.scale.setScalar(sc); }
      dummy.updateMatrix();
      cubeMesh.setMatrixAt(i, dummy.matrix);
    }
    cubeMesh.instanceMatrix.needsUpdate = true;
    haloAmt += ((current >= 0 ? 1 : 0) - haloAmt) * kP;
    halo.material.opacity = haloAmt * 0.9;
    onPlane(0, wordCy, halo.position); halo.position.z -= 0.6;
    halo.scale.set(Math.max(1, wordW) * 1.5, Math.max(1, wordH) * 3.2, 1);

    renderer.render(scene, camera);

    // Colour trail (original hero): fade the old strokes, draw a new one from the last pointer position.
    if (pointer.x > -9000) { const r0 = canvas.getBoundingClientRect(); if (pointer.x >= r0.left && pointer.x <= r0.right && pointer.y >= r0.top && pointer.y <= r0.bottom && (pointer.x !== lastPX || pointer.y !== lastPY)) trailIdle = 0; }
    lastPX = pointer.x; lastPY = pointer.y;
    trailIdle += dt;
    if (tctx && trail && trailIdle < 2.5) { // after 2.5 s without strokes the trail has faded out: skip the work entirely
      tctx.globalCompositeOperation = "destination-out"; tctx.fillStyle = "rgba(0,0,0,.08)"; tctx.fillRect(0, 0, trail.width, trail.height);
      tctx.globalCompositeOperation = "lighter";
      const r = canvas.getBoundingClientRect(), lx = (pointer.x - r.left) / TRAIL_SCALE, ly = (pointer.y - r.top) / TRAIL_SCALE;
      const inside = lx > -25 && ly > -25 && lx < trail.width + 25 && ly < trail.height + 25 && pointer.x > -9000;
      if (inside && px0 > -9000) {
        const spd = Math.hypot(lx - px0, ly - py0);
        hue = (hue + 2 + spd * TRAIL_SCALE * 0.1) % 360;
        tctx.lineCap = "round"; tctx.lineWidth = (8 + Math.min(26, spd * TRAIL_SCALE * 0.4)) / TRAIL_SCALE * 1.6; tctx.strokeStyle = `hsla(${hue},75%,58%,.7)`;
        tctx.beginPath(); tctx.moveTo(px0, py0); tctx.lineTo(lx, ly); tctx.stroke();
      }
      px0 = inside ? lx : -9999; py0 = inside ? ly : -9999;
    }
  }

  function resize() {
    const r = canvas.parentElement!.getBoundingClientRect();
    const widthChanged = Math.abs(r.width - width) > 1;
    width = r.width;
    height = r.height;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
    if (trail) { trail.width = Math.max(1, Math.round(width / TRAIL_SCALE)); trail.height = Math.max(1, Math.round(height / TRAIL_SCALE)); }
    // Phones fire resize when the address bar hides; only a width change re-lays the word, and it never restarts.
    if (current >= 0 && widthChanged) show(current, true);
  }

  function titleBottom() {
    onPlane(0, wordCy - wordH / 2, pos).project(camera);
    return (-pos.y * 0.5 + 0.5) * height;
  }

  resize();
  return { frame, resize, show, titleBottom };
}
