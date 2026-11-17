/*
 * Hero: a black panel with about forty large glossy shapes (rounded cubes, capsules, rings, spheres) in orange,
 * coral and white, plus a colourful light trail that follows the pointer.
 *
 * Scrolling (the original hero's motion): the shapes start spread out and gather as the camera pushes in through
 * them; the whole set turns with scroll and with the pointer, and tilts with scroll speed.
 * When a project's name is on screen (an HTML title over the canvas, see ./controller.ts), the shapes glide out
 * of an oval around the title and its caption, measured in screen pixels, so the text is never covered.
 * The oval follows the text when another project is picked; every move is eased, so nothing snaps.
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
  /** Coarse pointer (phones, tablets): fewer shapes, no trail. */
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

/** An area of the canvas to keep clear, in canvas pixels (centre and half sizes). */
export interface Clear { cx: number; cy: number; rx: number; ry: number }

export interface Hero {
  frame(f: HeroFrame): void;
  resize(): void;
  /** Keep this area clear of shapes; null lets them back in. */
  clear(c: Clear | null): void;
}

const BG = 0x000000;
const SHAPE_COLOURS: [number, number][] = [[0xe0562a, 40], [0xff8a5c, 14], [0xf4f1ec, 46]];
const TRAIL_SCALE = 3; // drawn at a third of the size and scaled up, strokes blurred as they are drawn: soft and cheap
const smooth = (x: number) => x * x * (3 - 2 * x);

interface Shape {
  base: THREE_NS.Vector3; size: number; phase: number; spin: THREE_NS.Vector3; rot: THREE_NS.Euler;
  /** How far (world units) it is pushed out of the title's oval right now, and in which screen direction. */
  push: number; dx: number; dy: number;
}

export function createHero(o: HeroOptions): Hero {
  const { THREE, canvas } = o;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  // Sharpness steps down (never below 1) if a weaker GPU cannot keep about 50 frames a second at this size.
  let ratio = Math.min(devicePixelRatio, 1.5), slowFor = 0;
  renderer.setPixelRatio(ratio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(BG);
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new o.RoomEnvironment(), 0.04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(5, 8, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffd2b8, 1.0);
  rim.position.set(-6, -3, -4);
  scene.add(rim);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.z = 18;

  const rnd = (a: number, b: number) => a + Math.random() * (b - a);
  const color = new THREE.Color();

  // ---- the shapes: one InstancedMesh per geometry, one cheap glossy material (no clear-coat pass, no glass)
  const geos = [new o.RoundedBoxGeometry(1.05, 1.05, 1.05, 3, 0.24), new THREE.CapsuleGeometry(0.34, 1.0, 6, 18), new THREE.TorusGeometry(0.56, 0.21, 16, 44), new THREE.SphereGeometry(0.62, 28, 20)];
  const PER = (o.low ? 26 : 40) / geos.length;
  const totalW = SHAPE_COLOURS.reduce((s, [, w]) => s + w, 0);
  const pickColour = () => { let r = Math.random() * totalW; for (const [c, w] of SHAPE_COLOURS) { if ((r -= w) <= 0) return c; } return SHAPE_COLOURS[0][0]; };
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.2, metalness: 0, envMapIntensity: 1.25 });
  const groups: { m: THREE_NS.InstancedMesh; list: Shape[] }[] = geos.map((g) => {
    const list: Shape[] = Array.from({ length: Math.round(PER) }, () => {
      // The original hero's cloud: a disc around the centre, deeper than wide.
      const r = rnd(1.6, 6.4), th = rnd(0, Math.PI * 2);
      return {
        base: new THREE.Vector3(r * Math.cos(th), r * Math.sin(th) * 0.68 + rnd(-1, 1), rnd(-6, 3.5)),
        size: rnd(0.75, 1.3), phase: rnd(0, Math.PI * 2),
        spin: new THREE.Vector3(rnd(-0.4, 0.4), rnd(-0.4, 0.4), rnd(-0.2, 0.2)), rot: new THREE.Euler(rnd(0, 6.3), rnd(0, 6.3), rnd(0, 6.3)),
        push: 0, dx: Math.random() < 0.5 ? -1 : 1, dy: 0,
      };
    });
    const m = new THREE.InstancedMesh(g, mat, list.length);
    m.frustumCulled = false; // instances move every frame
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    list.forEach((_, j) => m.setColorAt(j, color.setHex(pickColour())));
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
    scene.add(m);
    return { m, list };
  });

  // ---- the original hero's colour trail: a small 2D canvas over the panel, scaled up and blurred.
  const trail = o.low ? null : document.createElement("canvas");
  const tctx = trail?.getContext("2d") ?? null;
  if (tctx) tctx.filter = "blur(2.2px)"; // ≈6 px once scaled up; a CSS blur on the layer would cost the GPU every frame
  if (trail) {
    Object.assign(trail.style, { position: "absolute", inset: "0", width: "100%", height: "100%", pointerEvents: "none", opacity: "0.75" });
    trail.setAttribute("aria-hidden", "true");
    canvas.after(trail);
  }

  // Scratch objects, reused every frame.
  const dummy = new THREE.Object3D(), set = new THREE.Euler(), setQ = new THREE.Quaternion(), pos = new THREE.Vector3();
  let width = 1, height = 1, rect = canvas.getBoundingClientRect(), rectAge = 0;
  let lastPX = -9999, lastPY = -9999, trailIdle = 99, spinY = 0, rotX = 0, rotZ = 0, hue = 20, px0 = -9999, py0 = -9999;
  let intro = 0, part = 0, want = false;
  // The oval to keep clear, eased toward its goal so it slides when the title changes.
  const zone: Clear = { cx: 0, cy: 0, rx: 0, ry: 0 }, goal: Clear = { cx: 0, cy: 0, rx: 0, ry: 0 };

  function clear(c: Clear | null) {
    want = !!c;
    if (!c) return;
    Object.assign(goal, c);
    if (part < 0.02) Object.assign(zone, c); // first title: start from its own place, no slide
  }

  function frame({ dt, t, p, vn = 0, pointer }: HeroFrame) {
    const e = smooth(p), k6 = 1 - Math.exp(-dt * 6), kZ = 1 - Math.exp(-dt * 7), kPart = 1 - Math.exp(-dt * 4.5);
    // Entrance: the first time the panel draws, the shapes fly in from far out and grow to size.
    intro = Math.min(1, intro + dt / 1.8);
    const ie = 1 - Math.pow(1 - intro, 3);
    // Original motion: the shapes gather from a wide spread while the camera pushes in through them.
    const spread = (1 + (1 - smooth(Math.min(1, p * 1.6))) * 1.4) * (1 + (1 - ie) * 1.6);
    camera.position.z = 18 - e * 7;
    camera.position.x += (pointer.nx * 0.7 - camera.position.x) * 0.05;
    camera.position.y += (-pointer.ny * 0.5 - camera.position.y) * 0.05;
    // The set turns with scroll and the pointer, and tilts with scroll speed.
    spinY += ((pointer.nx * 0.3 + e * 1.6) - spinY) * k6 * 0.6;
    rotX += ((pointer.ny * 0.2 - vn * 0.15) - rotX) * k6 * 0.6;
    rotZ += (vn * 0.12 - rotZ) * k6 * 0.7;
    set.set(rotX, spinY, rotZ);
    setQ.setFromEuler(set);
    part += ((want ? 1 : 0) - part) * kPart;
    zone.cx += (goal.cx - zone.cx) * kZ; zone.cy += (goal.cy - zone.cy) * kZ;
    zone.rx += (goal.rx - zone.rx) * kZ; zone.ry += (goal.ry - zone.ry) * kZ;
    // World units per screen pixel at distance 1 from the camera (the camera only moves, it never turns).
    const perPx1 = (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / height;

    for (const { m, list } of groups) {
      list.forEach((s, j) => {
        pos.set(
          s.base.x * spread + Math.cos(t * 0.35 + s.phase) * 0.18,
          s.base.y * spread + Math.sin(t * 0.5 + s.phase) * 0.25 - vn * 0.6,
          s.base.z * spread,
        ).applyQuaternion(setQ);
        // Keep the title's oval clear: in screen pixels, find how far the shape (with its own radius) must move
        // to sit outside the oval, mostly sideways, then ease toward that.
        let target = 0;
        const depth = camera.position.z - pos.z;
        if (want && depth > 0.5) {
          const perPx = perPx1 * depth;
          const bxPx = (pos.x - camera.position.x) / perPx + width / 2 - zone.cx, byPx = height / 2 - (pos.y - camera.position.y) / perPx - zone.cy;
          const rad = (s.size * 0.85) / perPx, ax = zone.rx + rad, ay = zone.ry + rad;
          const bx = bxPx / ax, by = byPx / ay;
          if (bx * bx + by * by < 1) {
            // Wide panels push mostly sideways (the cards sit below the caption); tall phone panels push up and down.
            let dx = bx * (width >= height ? 1.8 : 0.4), dy = by;
            const l = Math.hypot(dx, dy);
            if (l < 0.04) { dx = s.dx >= 0 ? 1 : -1; dy = 0; } else { dx /= l; dy /= l; }
            // Distance along (dx, dy) to the oval's edge, solved in the oval's own scaled space.
            const ex = dx / ax, ey = dy / ay, A = ex * ex + ey * ey, B = 2 * (bx * ex + by * ey), C = bx * bx + by * by - 1;
            target = ((-B + Math.sqrt(Math.max(0, B * B - 4 * A * C))) / (2 * A)) * perPx;
            s.dx = dx; s.dy = dy;
          }
        }
        // Each shape eases its own push, so a shape crossing the oval's edge glides instead of jumping.
        s.push += (target * part - s.push) * (target > s.push ? kZ : kPart);
        if (s.push > 0.0005) { pos.x += s.dx * s.push; pos.y -= s.dy * s.push; }
        s.rot.x += s.spin.x * dt; s.rot.y += (s.spin.y + vn * 1.5) * dt; s.rot.z += s.spin.z * dt;
        dummy.position.copy(pos); dummy.rotation.copy(s.rot); dummy.scale.setScalar(s.size * (0.6 + ie * 0.4)); dummy.updateMatrix();
        m.setMatrixAt(j, dummy.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
    }

    renderer.render(scene, camera);
    if (ratio > 1 && intro >= 1) {
      slowFor = dt > 1 / 48 && dt < 0.25 ? slowFor + dt : Math.max(0, slowFor - dt * 0.5);
      if (slowFor > 1.2) { ratio = Math.max(1, ratio - 0.25); slowFor = 0; renderer.setPixelRatio(ratio); renderer.setSize(width, height, false); }
    }

    // Colour trail (original hero): fade the old strokes, draw a new one from the last pointer position.
    if ((rectAge += dt) > 0.25) { rect = canvas.getBoundingClientRect(); rectAge = 0; }
    const r = rect;
    if (pointer.x > -9000 && pointer.x >= r.left && pointer.x <= r.right && pointer.y >= r.top && pointer.y <= r.bottom && (pointer.x !== lastPX || pointer.y !== lastPY)) trailIdle = 0;
    lastPX = pointer.x; lastPY = pointer.y;
    const wasIdle = trailIdle;
    trailIdle += dt;
    // Fading by repeated partial erases leaves a faint ghost (8-bit alpha rounds up), so wipe it once it has faded.
    if (tctx && trail && wasIdle < 1.6 && trailIdle >= 1.6) tctx.clearRect(0, 0, trail.width, trail.height);
    if (tctx && trail && trailIdle < 1.6) { // after 1.6 s without strokes the trail is gone: skip the work entirely
      tctx.globalCompositeOperation = "destination-out"; tctx.fillStyle = "rgba(0,0,0,.1)"; tctx.fillRect(0, 0, trail.width, trail.height);
      tctx.globalCompositeOperation = "lighter";
      const lx = (pointer.x - r.left) / TRAIL_SCALE, ly = (pointer.y - r.top) / TRAIL_SCALE;
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
    width = r.width;
    height = r.height;
    rect = canvas.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / Math.max(1, height);
    // Tall phone panels: keep the horizontal view of a square-ish panel, so the shapes fit the width.
    camera.fov = camera.aspect < 1.1 ? THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(15)) * 1.1 / camera.aspect)) : 30;
    camera.updateProjectionMatrix();
    if (trail) { trail.width = Math.max(1, Math.round(width / TRAIL_SCALE)); trail.height = Math.max(1, Math.round(height / TRAIL_SCALE)); }
  }

  resize();
  return { frame, resize, clear };
}
