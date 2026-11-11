"use client";
/*
 * The floating glossy shapes in the hero panel. three.js is loaded only on
 * desktop-sized screens with WebGL and without reduced motion, after the page
 * is idle, so it never delays the first paint. Rendering stops when the panel
 * is off screen or the tab is hidden. Everyone else sees the CSS backdrop.
 */
import { useEffect, useRef } from "react";

export default function HeroScene() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || innerWidth < 821) return;
    try {
      const gl = document.createElement("canvas").getContext("webgl2");
      if (!gl) return;
      // Software renderers draw each frame in hundreds of milliseconds: keep the CSS backdrop instead.
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      if (/swiftshader|llvmpipe|software|basic render/i.test(name)) return;
    } catch { return; }

    let disposed = false;
    let cleanup = () => {};
    const start = async () => {
      const THREE = await import("three");
      const [{ RoomEnvironment }, { RoundedBoxGeometry }] = await Promise.all([
        import("three/addons/environments/RoomEnvironment.js"),
        import("three/addons/geometries/RoundedBoxGeometry.js"),
      ]);
      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.z = 18;
      const key = new THREE.DirectionalLight(0xffffff, 2.4);
      key.position.set(5, 8, 6);
      const rim = new THREE.DirectionalLight(0xffe2c8, 1);
      rim.position.set(-6, -3, -4);
      scene.add(key, rim);

      const rnd = (a: number, b: number) => a + Math.random() * (b - a);
      const palette = [0xf0efe9, 0xf0efe9, 0x1a1816, 0x8c8880, 0xe8d5b0, 0xe0562a];
      const geos = [
        new RoundedBoxGeometry(1, 1, 1, 6, 0.22),
        new THREE.CapsuleGeometry(0.38, 1.1, 8, 24),
        new THREE.TorusGeometry(0.62, 0.24, 24, 64),
        new THREE.SphereGeometry(0.7, 40, 40),
        new RoundedBoxGeometry(2.2, 0.5, 0.5, 6, 0.24),
      ];
      const mats = palette.map((c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.22, clearcoat: 0.8, clearcoatRoughness: 0.15 }));
      const group = new THREE.Group();
      scene.add(group);
      const items = Array.from({ length: 30 }, (_, i) => {
        const mesh = new THREE.Mesh(geos[i % geos.length], mats[Math.floor(Math.random() * mats.length)]);
        const r = rnd(1.5, 7), th = rnd(0, Math.PI * 2);
        const base = new THREE.Vector3(r * Math.cos(th), r * Math.sin(th) * 0.55, rnd(-6, 3));
        mesh.rotation.set(rnd(0, 6), rnd(0, 6), rnd(0, 6));
        mesh.scale.setScalar(rnd(0.7, 1.4));
        group.add(mesh);
        return { mesh, base, spin: new THREE.Vector3(rnd(-0.4, 0.4), rnd(-0.4, 0.4), rnd(-0.2, 0.2)), ph: rnd(0, 6) };
      });

      const mouse = { x: 0, y: 0 };
      const onMove = (e: PointerEvent) => { mouse.x = (e.clientX / innerWidth) * 2 - 1; mouse.y = (e.clientY / innerHeight) * 2 - 1; };
      const size = () => {
        const r = canvas.getBoundingClientRect();
        renderer.setSize(r.width, r.height, false);
        camera.aspect = r.width / Math.max(1, r.height);
        camera.updateProjectionMatrix();
      };
      size();
      let visible = true, raf = 0, last = performance.now(), slow = 0, frames = 0;
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (!visible || document.hidden) { last = now; return; }
        const gap = now - last;
        // A device that can't keep up gets the static backdrop back.
        if (frames++ > 10 && gap > 50 && ++slow > 20) { cleanup(); canvas.removeAttribute("data-ready"); return; }
        const dt = Math.min(0.05, gap / 1000), t = now / 1000;
        last = now;
        group.rotation.y += (mouse.x * 0.3 - group.rotation.y) * 0.05;
        group.rotation.x += (mouse.y * 0.2 - group.rotation.x) * 0.05;
        for (const it of items) {
          it.mesh.position.set(it.base.x + Math.cos(t * 0.35 + it.ph) * 0.18, it.base.y + Math.sin(t * 0.5 + it.ph) * 0.25, it.base.z);
          it.mesh.rotation.x += it.spin.x * dt;
          it.mesh.rotation.y += it.spin.y * dt;
          it.mesh.rotation.z += it.spin.z * dt;
        }
        renderer.render(scene, camera);
      };
      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
      io.observe(canvas);
      addEventListener("resize", size);
      addEventListener("pointermove", onMove);
      raf = requestAnimationFrame(loop);
      canvas.dataset.ready = "1";
      const onNarrow = () => { if (innerWidth < 821) { cleanup(); canvas.removeAttribute("data-ready"); } };
      addEventListener("resize", onNarrow);
      cleanup = () => {
        cleanup = () => {};
        removeEventListener("resize", onNarrow);
        cancelAnimationFrame(raf);
        io.disconnect();
        removeEventListener("resize", size);
        removeEventListener("pointermove", onMove);
        geos.forEach((g) => g.dispose());
        mats.forEach((m) => m.dispose());
        pmrem.dispose();
        renderer.dispose();
      };
    };

    const w = window as Window & { requestIdleCallback?: (f: () => void, o?: object) => number; cancelIdleCallback?: (id: number) => void };
    const run = () => { start().catch(() => {}); };
    const idleId = w.requestIdleCallback ? w.requestIdleCallback(run, { timeout: 2000 }) : window.setTimeout(run, 600);
    return () => {
      disposed = true;
      if (w.cancelIdleCallback) w.cancelIdleCallback(idleId); else window.clearTimeout(idleId);
      cleanup();
    };
  }, []);

  return <canvas ref={ref} className="hero-canvas" aria-hidden="true" />;
}
