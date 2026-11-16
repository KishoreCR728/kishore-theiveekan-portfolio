/*
 * Hero: a white studio. About fifty large glossy shapes (rounded cubes, capsules, rings, spheres in orange,
 * ink and white) orbit the centre above a seamless floor that catches their soft shadows.
 *
 * Scrolling turns the orbit and moves the camera in; the pointer makes the whole set lean toward it.
 * Hovering, focusing or swiping to a project card parts the shapes to the sides, and small orange cubes rise
 * from the floor and lock into the project's name on an exact grid (a hand-drawn 5x7 pixel font, each font
 * pixel a 2x2 block of cubes), building left to right, then shimmer. Moving away drops them back to the floor.
 *
 * One InstancedMesh per shape type plus one for the word's cubes: a handful of draw calls in total.
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
  /** Coarse pointer (phones, tablets): fewer shapes, smaller shadow map, standard material. */
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

const ORANGE = 0xe0562a;
const SHAPE_COLOURS: [number, number][] = [[ORANGE, 34], [0x1f1c19, 22], [0xf4f2ee, 30], [0xd9d3c8, 14]];
const FLOOR_Y = -3.4;
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const smooth = (x: number) => x * x * (3 - 2 * x);

/** A large shape on the orbit. */
interface Shape { kind: number; r: number; theta: number; y: number; size: number; phase: number; spin: THREE_NS.Vector3; rot: THREE_NS.Euler; }
/** One small cube of the word: its grid cell, where it rises from, and its progress. */
interface Cell { target: THREE_NS.Vector3; from: THREE_NS.Vector3; f: number; goal: number; delay: number; }

export function createHero(o: HeroOptions): Hero {
  const { THREE, canvas } = o;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, o.low ? 1.5 : 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  scene.fog = new THREE.Fog(0xffffff, 20, 42);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new o.RoomEnvironment(), 0.04).texture;
  scene.add(new THREE.HemisphereLight(0xffffff, 0xeee9e0, 0.55));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(3, 12, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(o.low ? 1024 : 2048, o.low ? 1024 : 2048);
  Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 40 });
  sun.shadow.radius = 6;
  sun.shadow.bias = -0.0005;
  scene.add(sun);
  // The seamless floor: invisible except for the shadows it catches.
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: 0.13 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = FLOOR_Y;
  floor.receiveShadow = true;
  scene.add(floor);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 1.2, 19);

  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  const glossy = () => o.low
    ? new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0, envMapIntensity: 1.15 })
    : new THREE.MeshPhysicalMaterial({ roughness: 0.22, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.12, envMapIntensity: 1.1 });
  const color = new THREE.Color();

  // ---- the large shapes (one InstancedMesh per kind)
  const geos = [
    new o.RoundedBoxGeometry(1.1, 1.1, 1.1, 4, 0.24),
    new THREE.CapsuleGeometry(0.36, 1.05, 10, 24),
    new THREE.TorusGeometry(0.58, 0.22, 24, 64),
    new THREE.SphereGeometry(0.66, 40, 28),
  ];
  const COUNT = o.low ? 30 : 48;
  const shapes: Shape[] = [];
  const totalW = SHAPE_COLOURS.reduce((s, [, w]) => s + w, 0);
  const pickColour = () => { let r = Math.random() * totalW; for (const [c, w] of SHAPE_COLOURS) { if ((r -= w) <= 0) return c; } return ORANGE; };
  for (let i = 0; i < COUNT; i++) {
    shapes.push({
      kind: i % geos.length, r: rnd(3.2, 8.5), theta: (i / COUNT) * Math.PI * 2 + rnd(-0.2, 0.2), y: rnd(-2.2, 3.4),
      size: rnd(0.75, 1.35), phase: rnd(0, Math.PI * 2),
      spin: new THREE.Vector3(rnd(-0.35, 0.35), rnd(-0.35, 0.35), rnd(-0.2, 0.2)), rot: new THREE.Euler(rnd(0, 6.3), rnd(0, 6.3), rnd(0, 6.3)),
    });
  }
  const meshes = geos.map((g, k) => {
    const list = shapes.filter((s) => s.kind === k);
    const m = new THREE.InstancedMesh(g, glossy(), Math.max(1, list.length));
    m.castShadow = true;
    m.frustumCulled = false; // instances move every frame; never cull the whole mesh on a stale bounding sphere
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    list.forEach((_, j) => m.setColorAt(j, color.setHex(pickColour())));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    scene.add(m);
    return { m, list };
  });

  // ---- the word's cubes (enough for the longest name in 2x2 lettering)
  const maxCells = Math.max(...o.titles.map((w) => wordPixels(w).px.length * 4), 4);
  const cubeMat = glossy();
  const cubes = new THREE.InstancedMesh(new o.RoundedBoxGeometry(1, 1, 1, 2, 0.16), cubeMat, maxCells);
  cubes.castShadow = true;
  cubes.frustumCulled = false; // its bounding sphere would be computed while every cube is hidden
  cubes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  for (let i = 0; i < maxCells; i++) cubes.setColorAt(i, color.setHex(ORANGE));
  if (cubes.instanceColor) cubes.instanceColor.needsUpdate = true;
  scene.add(cubes);
  const cells: Cell[] = Array.from({ length: maxCells }, () => ({ target: new THREE.Vector3(), from: new THREE.Vector3(), f: 0, goal: 0, delay: 0 }));

  // Scratch objects, reused every frame.
  const dummy = new THREE.Object3D(), q = new THREE.Quaternion(), qi = new THREE.Quaternion(), tilt = new THREE.Euler();
  const pos = new THREE.Vector3(), aim = new THREE.Vector3();
  let current = -1, shownAt = 0, clearX = 7.5, cell = 0.2, bottomY = 0, width = 1, height = 1, spin = 0, part = 0, leanX = 0, leanY = 0;

  const visible = () => { const h = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z; return { h, w: h * camera.aspect }; };

  /** Lays the word out on an exact grid on the z = 1 plane; the cubes rise from the floor below their cell. */
  function show(i: number, refit = false) {
    if (i === current && !refit) return;
    current = i;
    if (!refit) shownAt = performance.now() / 1000;
    if (i < 0 || !o.titles[i]) {
      const w = visible().w;
      cells.forEach((c) => { c.goal = 0; c.delay = 0.2 * (0.5 - c.target.x / w); });
      return;
    }
    const { px, cols, rows } = wordPixels(o.titles[i]);
    const { w, h } = visible();
    const narrow = camera.aspect < 1.25;
    const pixel = Math.min((w * (narrow ? 0.84 : 0.56)) / cols, (h * (narrow ? 0.2 : 0.29)) / rows);
    cell = pixel / 2;
    const cy = h * (narrow ? 0.12 : 0.08);
    const x0 = (-cols * pixel) / 2, y0 = cy + (rows * pixel) / 2;
    bottomY = cy - (rows * pixel) / 2;
    clearX = (cols * pixel) / 2 + 1.8; // how far the shapes must move aside to leave the word clear
    let n = 0;
    for (const [cx, ry] of px) for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
      const c = cells[n++];
      c.target.set(x0 + (cx + (a + 0.5) / 2) * pixel, y0 - (ry + (b + 0.5) / 2) * pixel, 1);
      if (!refit || c.goal === 0) {
        c.from.set(c.target.x + rnd(-0.6, 0.6), FLOOR_Y + 0.2, rnd(-1, 3));
        c.delay = ((c.target.x - x0) / (cols * pixel)) * 0.5 + (y0 - c.target.y) * 0.02 + rnd(0, 0.06);
      }
      c.goal = 1;
    }
    for (let k = n; k < cells.length; k++) { cells[k].goal = 0; cells[k].delay = 0; }
  }

  function frame({ dt, t, p, pointer }: HeroFrame) {
    const e = smooth(p);
    const k4 = 1 - Math.exp(-dt * 4), kF = 1 - Math.exp(-dt * 3.4);
    // Scroll turns the orbit (the shapes travel round the centre) on top of a slow idle drift.
    spin += (t * 0.06 + e * Math.PI * 1.3 - spin) * k4;
    // The set leans toward the pointer; the camera moves in a little as the section scrolls.
    leanX += (pointer.ny * 0.12 - leanX) * k4;
    leanY += (pointer.nx * 0.22 - leanY) * k4;
    camera.position.z = 19 - e * 2; // a gentle push in: nothing comes close enough to fill the frame
    camera.position.x += (pointer.nx * 0.6 - camera.position.x) * 0.05;
    camera.position.y += (1.2 - pointer.ny * 0.4 - camera.position.y) * 0.05;
    camera.lookAt(0, 0.2, 0);
    part += ((current >= 0 ? 1 : 0) - part) * kF;

    const cosL = Math.cos(leanY), sinL = Math.sin(leanY);
    for (const { m, list } of meshes) {
      list.forEach((s, j) => {
        const a = s.theta + spin;
        let x = Math.cos(a) * s.r, z = Math.sin(a) * s.r - 2;
        // While a word is shown the shapes part: out to the left and right and a little back, clearing the centre.
        if (part > 0) {
          z -= part * 2.2;
          // Clear the word in screen space: shapes further back must move further out to look clear of it.
          const reach = clearX * (camera.position.z - z) / (camera.position.z - 1);
          const side = x >= 0 ? 1 : -1, need = Math.max(0, reach - Math.abs(x));
          x += side * need * part;
        }
        const y = s.y + Math.sin(t * 0.6 + s.phase) * 0.3;
        // lean (rotate the whole set slightly around the vertical axis)
        const lx = x * cosL + z * sinL; z = -x * sinL + z * cosL; x = lx;
        pos.set(x, y + z * leanX * 0.08, z);
        s.rot.x += s.spin.x * dt; s.rot.y += s.spin.y * dt; s.rot.z += s.spin.z * dt;
        q.setFromEuler(s.rot);
        tilt.set(leanX * 0.4, leanY * 0.4, 0);
        dummy.position.copy(pos); dummy.quaternion.copy(q); dummy.rotation.x += tilt.x; dummy.rotation.y += tilt.y;
        dummy.scale.setScalar(s.size * (1 - part * 0.22)); dummy.updateMatrix();
        m.setMatrixAt(j, dummy.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
    }

    const since = performance.now() / 1000 - shownAt;
    for (let i = 0; i < cells.length; i++) {
      const c = cells[i];
      const g = since >= c.delay ? c.goal : 1 - c.goal;
      c.f += (g - c.f) * kF;
      if (c.f < 0.001) c.f = 0;
      const a = easeInOut(Math.min(1, c.f));
      if (a === 0) { dummy.position.set(0, -50, 0); dummy.scale.setScalar(0.0001); dummy.updateMatrix(); cubes.setMatrixAt(i, dummy.matrix); continue; }
      aim.copy(c.target);
      aim.z += Math.sin(t * 2.4 - c.target.x * 1.6) * 0.04 * a; // a soft shimmer across the settled word
      pos.lerpVectors(c.from, aim, a);
      pos.z += Math.sin(Math.PI * a) * 1.2; // rise in an arc toward the viewer
      q.setFromAxisAngle(aim.set(1, 0.4, 0).normalize(), (1 - a) * 2.2).slerp(qi, a);
      dummy.position.copy(pos); dummy.quaternion.copy(q); dummy.scale.setScalar(cell * 0.9 * Math.min(1, a * 1.6)); dummy.updateMatrix();
      cubes.setMatrixAt(i, dummy.matrix);
    }
    cubes.instanceMatrix.needsUpdate = true;
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
    pos.set(0, bottomY, 1).project(camera);
    return (-pos.y * 0.5 + 0.5) * height;
  }

  resize();
  return { frame, resize, show, titleBottom };
}
