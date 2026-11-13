/*
 * Hero: a light panel full of small floating boxes.
 *
 * Hover (or focus, or swipe on a phone) a project card and the near-black boxes fly in, left to right, and
 * build that project's name (one short word) out of themselves, like pixels. Nothing is recoloured. Move away and they drift
 * back. The pointer gently pushes nearby boxes aside. Everything is eased per box, so nothing snaps.
 *
 * One InstancedMesh draws every box in a single call, so this stays cheap on phones.
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
  /** One short word per project (e.g. "ERP", "JARVIS"): short words stay legible when built from boxes. */
  titles: string[];
  /** Coarse pointer (phones, tablets): fewer boxes, lower pixel ratio. */
  low: boolean;
  /** CSS font-family of the page, used to draw the titles that the boxes copy. */
  font: string;
}

export interface HeroFrame {
  dt: number;
  t: number;
  /** Scroll progress through the hero section, 0..1. */
  p: number;
  /** Pointer in client pixels and normalised (-1..1). */
  pointer: { x: number; y: number; nx: number; ny: number };
}

export interface Hero {
  frame(f: HeroFrame): void;
  resize(): void;
  /** Build project i's title; -1 releases the boxes. */
  show(i: number, refit?: boolean): void;
  /** Where the formed title ends on screen (client px, relative to the canvas), for placing the caption. */
  titleBottom(): number;
}

interface Box {
  home: THREE_NS.Vector3;
  phase: number;
  spin: THREE_NS.Vector3;
  rot: THREE_NS.Euler;
  size: number;
  push: THREE_NS.Vector2;
  /** Formation progress 0..1 and its target. */
  f: number;
  goal: number;
  /** How far the box has stepped back while a title is shown. */
  back: number;
  delay: number;
  target: THREE_NS.Vector3 | null;
  /** Near-black box: these build the words, so they read clearly on the light panel. */
  ink: boolean;
}

const BG = 0xebe8e1;
// Weighted palette: mostly warm whites and greys, some ink, a few accent orange.
const PALETTE: [number, number][] = [[0xfbfaf7, 30], [0xe2ddd4, 16], [0xc9c3b8, 10], [0x2a2622, 30], [0xe0562a, 14]];
const INK = 0x2a2622; // the near-black boxes build the words: one colour, high contrast, and nothing is recoloured
const smooth = (x: number) => x * x * (3 - 2 * x);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

export function createHero(o: HeroOptions): Hero {
  const { THREE, canvas } = o;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, o.low ? 1.25 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 16, 34);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new o.RoomEnvironment(), 0.04).texture;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd8d2c6, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(4, 7, 8);
  scene.add(key);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.z = 18;

  const N = o.low ? 640 : 1100;
  const geo = new o.RoundedBoxGeometry(1, 1, 1, 2, 0.16);
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0, envMapIntensity: 0.85 });
  const mesh = new THREE.InstancedMesh(geo, mat, N);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(mesh);

  const total = PALETTE.reduce((s, [, w]) => s + w, 0);
  const pick = () => { let r = Math.random() * total; for (const [c, w] of PALETTE) { if ((r -= w) <= 0) return c; } return PALETTE[0][0]; };
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  const color = new THREE.Color();
  const boxes: Box[] = [];
  for (let i = 0; i < N; i++) {
    const hex = pick();
    mesh.setColorAt(i, color.setHex(hex));
    boxes.push({
      // A wide, shallow volume: nothing ever comes close enough to the camera to look big.
      home: new THREE.Vector3(rnd(-11, 11), rnd(-6, 6), rnd(-7, 2.5)),
      phase: rnd(0, Math.PI * 2),
      spin: new THREE.Vector3(rnd(-0.5, 0.5), rnd(-0.5, 0.5), rnd(-0.3, 0.3)),
      rot: new THREE.Euler(rnd(0, 6.3), rnd(0, 6.3), rnd(0, 6.3)),
      size: rnd(0.16, 0.34),
      push: new THREE.Vector2(),
      f: 0, goal: 0, back: 0, delay: 0, target: null,
      ink: hex === INK,
    });
  }
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

  // Scratch objects, reused every frame.
  const dummy = new THREE.Object3D(), qa = new THREE.Quaternion(), qi = new THREE.Quaternion();
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit = new THREE.Vector3();
  const pos = new THREE.Vector3();
  let current = -1, shownAt = 0, cell = 0.2, bottomY = 0, width = 1, height = 1;

  const visible = () => { const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z; return { h, w: h * camera.aspect }; };

  /** Samples the title as a grid of points on the z = 0 plane, sized to fit above the cards. */
  function titlePoints(text: string, budget: number): THREE_NS.Vector3[] {
    const { w, h } = visible();
    const narrow = camera.aspect < 1.25;
    const lines = [text];
    const c = document.createElement("canvas"), x = c.getContext("2d", { willReadFrequently: true })!;
    const fs = 120;
    x.font = `600 ${fs}px ${o.font}`;
    const tw = Math.max(...lines.map((l) => x.measureText(l).width));
    c.width = Math.ceil(tw + 20);
    c.height = Math.ceil(fs * 1.12 * lines.length + 20);
    x.font = `600 ${fs}px ${o.font}`;
    x.textBaseline = "top";
    x.fillStyle = "#000"; x.strokeStyle = "#000"; x.lineWidth = fs * 0.1; x.lineJoin = "round"; // bolder than the font, so every stroke is several boxes wide
    lines.forEach((l, k) => { const lx = 10 + (tw - x.measureText(l).width) / 2, ly = 10 + k * fs * 1.12; x.fillText(l, lx, ly); x.strokeText(l, lx, ly); });
    const data = x.getImageData(0, 0, c.width, c.height).data;
    let filled = 0;
    for (let i = 3; i < data.length; i += 16) if (data[i] > 128) filled++;
    filled *= 4;
    // Grid step so the title uses most of the boxes but never more than exist.
    const step = Math.max(2, Math.sqrt(filled / budget));
    const pts: [number, number][] = [];
    for (let py = step / 2; py < c.height; py += step) for (let px = step / 2; px < c.width; px += step) if (data[(Math.floor(py) * c.width + Math.floor(px)) * 4 + 3] > 128) pts.push([px, py]);
    // World size: wide on desktop, almost full width on phones; centred a little above the middle.
    const scale = Math.min((w * (narrow ? 0.8 : 0.56)) / c.width, (h * 0.3) / c.height), cy = h * (narrow ? 0.12 : 0.1);
    cell = step * scale;
    bottomY = cy - (c.height / 2) * scale;
    let out = pts.map(([px, py]) => new THREE.Vector3((px - c.width / 2) * scale, cy - (py - c.height / 2) * scale, 0));
    if (out.length > budget) { const keep: THREE_NS.Vector3[] = []; for (let i = 0; i < budget; i++) keep.push(out[Math.floor((i * out.length) / budget)]); out = keep; }
    return out;
  }

  /** Build word i; -1 releases. `refit` re-lays the current word after a resize without restarting the animation. */
  function show(i: number, refit = false) {
    if (i === current && !refit) return;
    current = i;
    if (!refit) shownAt = performance.now() / 1000;
    if (i < 0 || !o.titles[i]) {
      // Release: right to left, so the word un-builds the way it was built.
      boxes.forEach((b) => { b.goal = 0; b.delay = b.target ? (1 - (b.target.x / visible().w + 0.5)) * 0.25 : 0; });
      return;
    }
    // Ink boxes first (dark and orange), so the word has contrast; boxes keep their own colours.
    const pool = boxes.map((b, k) => ({ k, ink: b.ink, x: b.home.x + b.push.x }));
    const inks = pool.filter((b) => b.ink);
    const pts = titlePoints(o.titles[i], Math.min(inks.length, Math.floor(N * 0.9)));
    const chosen = (pts.length <= inks.length ? inks : pool).sort((a, b) => a.x - b.x);
    // Pair points and boxes by horizontal order so every box travels a short, natural path.
    const sortedPts = [...pts].sort((a, b) => a.x - b.x);
    const used = new Set<number>();
    const minX = sortedPts.length ? sortedPts[0].x : 0, spanX = sortedPts.length ? sortedPts[sortedPts.length - 1].x - minX || 1 : 1;
    sortedPts.forEach((p, n) => {
      const k = chosen[Math.min(chosen.length - 1, Math.floor((n * chosen.length) / sortedPts.length))].k;
      used.add(k);
      const b = boxes[k];
      b.target = p; b.goal = 1;
      if (!refit) b.delay = ((p.x - minX) / spanX) * 0.35 + Math.random() * 0.08; // a left-to-right wave
    });
    boxes.forEach((b, k) => { if (!used.has(k)) { b.goal = 0; b.delay = 0; } });
  }

  function frame({ dt, t, p, pointer }: HeroFrame) {
    // A short push-in while scrolling, never through the boxes.
    const e = smooth(p);
    camera.position.z = 18 - e * 4;
    camera.position.x += (pointer.nx * 0.6 - camera.position.x) * 0.05;
    camera.position.y += (-pointer.ny * 0.4 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    // Pointer on the z = 0 plane, for the gentle push.
    const r = canvas.getBoundingClientRect();
    const inside = pointer.x >= r.left && pointer.x <= r.right && pointer.y >= r.top && pointer.y <= r.bottom;
    let px = 1e9, py = 1e9;
    if (inside) {
      ndc.set(((pointer.x - r.left) / r.width) * 2 - 1, -((pointer.y - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, hit)) { px = hit.x; py = hit.y; }
    }

    const now = performance.now() / 1000, since = now - shownAt;
    const kF = 1 - Math.exp(-dt * 3.2), kP = 1 - Math.exp(-dt * 5);
    const formedAny = current >= 0;
    for (let i = 0; i < N; i++) {
      const b = boxes[i];
      // Formation progress, staggered by each box's delay.
      const g = since >= b.delay ? b.goal : 1 - b.goal;
      b.f += (g - b.f) * kF;
      if (b.f < 0.0005) b.f = 0;
      const a = easeInOut(Math.min(1, b.f));

      // Free floating position (+ step back while a title is shown, so the word reads cleanly).
      const fx = b.home.x + Math.cos(t * 0.3 + b.phase) * 0.25;
      const fy = b.home.y + Math.sin(t * 0.42 + b.phase) * 0.3;
      b.back += ((formedAny && b.goal === 0 ? 3 : 0) - b.back) * kF;
      const fz = b.home.z + Math.sin(t * 0.25 + b.phase * 2) * 0.3 - b.back;
      const dx = fx - px, dy = fy - py, d2 = dx * dx + dy * dy;
      const want = d2 < 2.6 && a < 0.5 ? (1.6 - Math.sqrt(d2)) / 1.6 : 0;
      const len = Math.sqrt(d2) || 1;
      b.push.x += ((want * dx) / len * 1.1 - b.push.x) * kP;
      b.push.y += ((want * dy) / len * 1.1 - b.push.y) * kP;
      pos.set(fx + b.push.x, fy + b.push.y, fz);

      let s = b.size * (1 - 0.45 * Math.min(1, b.back / 3)); // the rest shrink back while a word is shown
      b.rot.x += b.spin.x * dt; b.rot.y += b.spin.y * dt; b.rot.z += b.spin.z * dt;
      qa.setFromEuler(b.rot);
      if (a > 0 && b.target) {
        const tz = b.target.z + Math.sin(t * 1.6 + b.target.x * 0.8) * 0.04; // a faint breathing once formed
        pos.lerp(hit.set(b.target.x, b.target.y, tz), a);
        pos.z += Math.sin(Math.PI * a) * 0.8; // a slight arc towards the viewer on the way
        s = b.size + (cell * 0.95 - b.size) * a;
        qa.slerp(qi, a); // square up to face the viewer
      }
      dummy.position.copy(pos);
      dummy.quaternion.copy(qa);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      if (b.goal === 0 && b.f === 0) b.target = null;
    }
    mesh.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  }

  function resize() {
    const r = canvas.parentElement!.getBoundingClientRect();
    const widthChanged = Math.abs(r.width - width) > 1;
    width = r.width; height = r.height;
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
    // Phones fire resize when the address bar hides; only a width change re-lays the word, and it never restarts.
    if (current >= 0 && widthChanged) show(current, true);
  }

  function titleBottom() {
    pos.set(0, bottomY, 0).project(camera);
    return (-pos.y * 0.5 + 0.5) * height;
  }

  resize();
  return { frame, resize, show, titleBottom };
}

