/*
 * Hero: a white panel with a ring of small glossy cubes and spheres orbiting the centre.
 *
 * Scrolling turns the ring (the objects travel round in a circle) and moves the camera in a little.
 * Hovering, focusing or swiping to a project card makes the orange cubes leave the ring and lock into that
 * project's name on an exact grid, drawn from a hand-made 5x7 pixel font (each font pixel is a 2x2 block of
 * cubes when there are enough orange cubes, otherwise one cube). They build left to right, square up to the
 * viewer and then shimmer gently. Moving away sends them back into orbit. No object changes colour.
 *
 * Two InstancedMeshes draw everything (cubes and spheres), so this stays light on phones.
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
  /** Coarse pointer (phones, tablets): fewer objects, lower pixel ratio. */
  low: boolean;
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
  /** Build project i's word; -1 releases the cubes. `refit` re-lays it after a resize without restarting. */
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

const BG = 0xffffff;
const ORANGE = 0xe0562a;
// Non-orange cube colours: warm whites, greys and some ink. The orange share is set exactly (see createHero).
const CUBE_COLOURS: [number, number][] = [[0xf1efea, 40], [0xe1ddd5, 23], [0xc6c0b5, 13], [0x2a2622, 24]];
const SPHERE_COLOURS: [number, number][] = [[0xf1efea, 40], [0xdad5cc, 25], [0x2a2622, 15], [ORANGE, 20]];
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const smooth = (x: number) => x * x * (3 - 2 * x);

/** A floating object: its place on the ring (a cylinder around the vertical axis) and its own motion. */
interface Body {
  r: number; theta: number; y: number;
  phase: number; spin: THREE_NS.Vector3; rot: THREE_NS.Euler; size: number;
  push: THREE_NS.Vector2;
}
interface Cube extends Body {
  orange: boolean;
  /** Formation progress 0..1, its goal and start delay; how far it has stepped back; its grid cell. */
  f: number; goal: number; delay: number; back: number;
  target: THREE_NS.Vector3 | null;
}

export function createHero(o: HeroOptions): Hero {
  const { THREE, canvas } = o;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, o.low ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.fog = new THREE.Fog(BG, 17, 36);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new o.RoomEnvironment(), 0.04).texture;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xe9e4da, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(5, 8, 9);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe4d2, 0.6);
  rim.position.set(-6, -3, -4);
  scene.add(rim);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.z = 18;

  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  const picker = (list: [number, number][]) => {
    const total = list.reduce((s, [, w]) => s + w, 0);
    return () => { let r = Math.random() * total; for (const [c, w] of list) { if ((r -= w) <= 0) return c; } return list[0][0]; };
  };
  const body = (size: number): Body => ({
    r: Math.sqrt(rnd(9, 144)), // radius 3..12, spread evenly over the ring's area
    theta: rnd(0, Math.PI * 2), y: rnd(-5.8, 5.8), phase: rnd(0, Math.PI * 2),
    spin: new THREE.Vector3(rnd(-0.6, 0.6), rnd(-0.6, 0.6), rnd(-0.3, 0.3)),
    rot: new THREE.Euler(rnd(0, 6.3), rnd(0, 6.3), rnd(0, 6.3)), size, push: new THREE.Vector2(),
  });
  // Clear-coated on desktop; the cheaper standard material on touch devices keeps phones at a smooth frame rate.
  const glossy = () => o.low
    ? new THREE.MeshStandardMaterial({ roughness: 0.3, metalness: 0, envMapIntensity: 1.1 })
    : new THREE.MeshPhysicalMaterial({ roughness: 0.32, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.22, envMapIntensity: 1 });
  const color = new THREE.Color();

  // Cubes
  const NC = o.low ? 960 : 1100; // enough orange cubes on phones too for 2x2 lettering
  const cubeMesh = new THREE.InstancedMesh(new o.RoundedBoxGeometry(1, 1, 1, 2, 0.14), glossy(), NC);
  cubeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(cubeMesh);
  // Exactly enough orange cubes for 2x2 lettering of the longest word (plus a margin); the rest from the other colours.
  const needOrange = Math.max(...o.titles.map((w) => wordPixels(w).px.length * 4), 0) + 48;
  const orangeTotal = Math.min(NC - 200, Math.max(needOrange, Math.round(NC * 0.36)));
  const pickOther = picker(CUBE_COLOURS.filter(([c]) => c !== ORANGE));
  const cubes: Cube[] = [];
  for (let i = 0; i < NC; i++) {
    const orange = i < orangeTotal, hex = orange ? ORANGE : pickOther();
    cubeMesh.setColorAt(i, color.setHex(hex));
    cubes.push({ ...body(rnd(0.13, 0.3)), orange, f: 0, goal: 0, delay: 0, back: 0, target: null });
  }
  if (cubeMesh.instanceColor) cubeMesh.instanceColor.needsUpdate = true;
  const orangeCount = cubes.filter((c) => c.orange).length;

  // Spheres (decoration only; they stay in orbit)
  const NS = o.low ? 120 : 220;
  const sphereMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.5, 16, 12), glossy(), NS);
  sphereMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(sphereMesh);
  const pickSphere = picker(SPHERE_COLOURS);
  const spheres: Body[] = [];
  for (let i = 0; i < NS; i++) { sphereMesh.setColorAt(i, color.setHex(pickSphere())); spheres.push(body(rnd(0.14, 0.36))); }
  if (sphereMesh.instanceColor) sphereMesh.instanceColor.needsUpdate = true;

  // Scratch objects, reused every frame.
  const dummy = new THREE.Object3D(), q = new THREE.Quaternion(), qi = new THREE.Quaternion();
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), pointerHit = new THREE.Vector3();
  const pos = new THREE.Vector3(), aim = new THREE.Vector3();
  let current = -1, shownAt = 0, cell = 0.2, bottomY = 0, width = 1, height = 1, spin = 0, clear = 0;

  const visible = () => { const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z; return { h, w: h * camera.aspect }; };

  /** Lays the word out on an exact grid on the z = 0 plane and pairs each grid cell with an orange cube. */
  function show(i: number, refit = false) {
    if (i === current && !refit) return;
    current = i;
    if (!refit) shownAt = performance.now() / 1000;
    if (i < 0 || !o.titles[i]) {
      // Release right to left, so the word un-builds the way it was built.
      const w = visible().w;
      cubes.forEach((c) => { c.goal = 0; c.delay = c.target ? 0.25 * (0.5 - c.target.x / w) : 0; });
      return;
    }
    const { px, cols, rows } = wordPixels(o.titles[i]);
    const sub = px.length * 4 <= orangeCount ? 2 : 1;
    const { w, h } = visible();
    const narrow = camera.aspect < 1.25;
    const pixel = Math.min((w * (narrow ? 0.86 : 0.58)) / cols, (h * (narrow ? 0.2 : 0.3)) / rows);
    cell = pixel / sub;
    const cy = h * (narrow ? 0.12 : 0.09);
    const x0 = (-cols * pixel) / 2, y0 = cy + (rows * pixel) / 2;
    bottomY = cy - (rows * pixel) / 2;
    const targets: THREE_NS.Vector3[] = [];
    for (const [cx, ry] of px) for (let a = 0; a < sub; a++) for (let b = 0; b < sub; b++)
      targets.push(new THREE.Vector3(x0 + (cx + (a + 0.5) / sub) * pixel, y0 - (ry + (b + 0.5) / sub) * pixel, 0));
    // Pair cells and orange cubes by horizontal order, so every flight is short and natural.
    const screenX = (c: Cube) => Math.cos(c.theta + spin) * c.r;
    const pool = cubes.map((c, k) => ({ k, c })).filter(({ c }) => c.orange).sort((a, b) => screenX(a.c) - screenX(b.c));
    const sorted = [...targets].sort((a, b) => a.x - b.x || b.y - a.y);
    const used = new Set<number>();
    const spanX = cols * pixel || 1;
    sorted.forEach((t, n) => {
      const { k, c } = pool[Math.min(pool.length - 1, Math.floor((n * pool.length) / sorted.length))];
      used.add(k);
      c.target = t;
      c.goal = 1;
      if (!refit) c.delay = ((t.x - x0) / spanX) * 0.36 + (y0 - t.y) * 0.012; // left to right, top to bottom
    });
    cubes.forEach((c, k) => { if (!used.has(k)) { c.goal = 0; if (!refit) c.delay = 0; } });
  }

  /** Floating position of a body on the turning ring, in world space. */
  const ringPos = (b: Body, t: number, out: THREE_NS.Vector3) => {
    const a = b.theta + spin, r = b.r + Math.sin(t * 0.4 + b.phase) * 0.25;
    return out.set(Math.cos(a) * r, b.y + Math.sin(t * 0.5 + b.phase) * 0.22, Math.sin(a) * r - 3);
  };

  function frame({ dt, t, p, pointer }: HeroFrame) {
    // Scroll turns the ring (objects travel round the centre) on top of a slow idle drift; the pointer adds a little.
    const e = smooth(p);
    const targetSpin = t * 0.05 + e * Math.PI * 1.2 + pointer.nx * 0.15;
    spin += (targetSpin - spin) * (1 - Math.exp(-dt * 4));
    camera.position.z = 18 - e * 3;
    camera.position.x += (pointer.nx * 0.5 - camera.position.x) * 0.05;
    camera.position.y += (-pointer.ny * 0.35 - camera.position.y) * 0.05;
    camera.lookAt(0, 0, 0);

    // Pointer on the z = 0 plane: nearby floating objects move aside.
    const rect = canvas.getBoundingClientRect();
    let px = 1e9, py = 1e9;
    if (pointer.x >= rect.left && pointer.x <= rect.right && pointer.y >= rect.top && pointer.y <= rect.bottom) {
      ndc.set(((pointer.x - rect.left) / rect.width) * 2 - 1, -((pointer.y - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      if (ray.ray.intersectPlane(plane, pointerHit)) { px = pointerHit.x; py = pointerHit.y; }
    }
    const kP = 1 - Math.exp(-dt * 5), kF = 1 - Math.exp(-dt * 3.6);
    const repel = (b: Body) => {
      const dx = pos.x - px, dy = pos.y - py, d2 = dx * dx + dy * dy, near = pos.z > -6 && d2 < 3.2;
      const want = near ? (1.8 - Math.sqrt(d2)) / 1.8 : 0, len = Math.sqrt(d2) || 1;
      b.push.x += ((want * dx) / len * 1.2 - b.push.x) * kP;
      b.push.y += ((want * dy) / len * 1.2 - b.push.y) * kP;
      pos.x += b.push.x;
      pos.y += b.push.y;
    };

    const since = performance.now() / 1000 - shownAt, showing = current >= 0;
    clear += ((showing ? 1 : 0) - clear) * kF;
    /** While a word is shown, everything not in it moves behind the word's plane, so nothing crosses in front. */
    const behind = (amount: number) => { if (amount > 0 && pos.z > -2.5) pos.z += (-2.5 - pos.z) * amount; };
    for (let i = 0; i < NC; i++) {
      const c = cubes[i];
      const g = since >= c.delay ? c.goal : 1 - c.goal;
      c.f += (g - c.f) * kF;
      if (c.f < 0.0005) c.f = 0;
      const a = easeInOut(Math.min(1, c.f));
      c.back += ((showing && c.goal === 0 ? 1 : 0) - c.back) * kF;

      ringPos(c, t, pos);
      pos.z -= c.back * 2; // while a word is shown, the rest of the ring steps back
      behind(c.back);
      if (a < 0.5) repel(c);
      c.rot.x += c.spin.x * dt; c.rot.y += c.spin.y * dt; c.rot.z += c.spin.z * dt;
      q.setFromEuler(c.rot);
      let s = c.size * (1 - 0.4 * c.back);
      if (a > 0 && c.target) {
        aim.copy(c.target);
        aim.z += Math.sin(t * 2.4 - c.target.x * 1.6) * 0.035 * a; // a soft shimmer across the settled word
        pos.lerp(aim, a);
        pos.z += Math.sin(Math.PI * a) * 1.4; // an arc towards the viewer on the way in
        s += (cell * 0.9 - s) * a;
        q.slerp(qi, a); // square up to the viewer
      }
      dummy.position.copy(pos); dummy.quaternion.copy(q); dummy.scale.setScalar(s); dummy.updateMatrix();
      cubeMesh.setMatrixAt(i, dummy.matrix);
      if (c.goal === 0 && c.f === 0) c.target = null;
    }
    cubeMesh.instanceMatrix.needsUpdate = true;

    for (let i = 0; i < NS; i++) {
      const b = spheres[i];
      ringPos(b, t, pos);
      behind(clear);
      repel(b);
      dummy.position.copy(pos); dummy.quaternion.identity(); dummy.scale.setScalar(b.size * (showing ? 0.75 : 1)); dummy.updateMatrix();
      sphereMesh.setMatrixAt(i, dummy.matrix);
    }
    sphereMesh.instanceMatrix.needsUpdate = true;
    renderer.render(scene, camera);
  }

  function resize() {
    const r = canvas.parentElement!.getBoundingClientRect();
    const widthChanged = Math.abs(r.width - width) > 1;
    width = r.width;
    height = r.height;
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
