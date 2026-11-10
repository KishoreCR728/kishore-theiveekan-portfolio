"use client";
/* Scroll, 3D and interaction logic for the portfolio. Ported from the Claude Design prototype. */
import { Component, createRef } from "react";
import * as portfolio from "../content/portfolio";
import { PageMarkup } from "./Markup";

function hasWebGL() {
  try { return !!document.createElement("canvas").getContext("webgl2"); } catch { return false; }
}

export default class Experience extends Component {
  state = { phase: 'load', count: 0, word: 'Curious.', time: '', menuOpen: false, caseIdx: -1, d: portfolio };
  _r = {};
  m = { x: -1e4, y: -1e4, px: -1e4, py: -1e4, tx: -1e4, ty: -1e4, nx: 0, ny: 0 };
  sc = { target: 0, cur: 0, last: -1, vel: 0 };
  R(k) { return this._r[k] || (this._r[k] = createRef()); }

  async componentDidMount() {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !hasWebGL()) { this.enableStatic(); }
    this._onKey = e => { if (e.key !== 'Escape') return; if (this.state.caseIdx >= 0) this.closeCase(); else if (this.state.menuOpen) this.setState({ menuOpen: false }); };
    window.addEventListener('keydown', this._onKey);
    this._onPop = () => { const i = this.state.d.projects.findIndex(p => location.pathname === '/work/' + p.slug); if (i >= 0) this.openCase(i, false); else this.setState({ caseIdx: -1 }); };
    window.addEventListener('popstate', this._onPop);
    const words = ['Curious.', 'Persistent.', 'Practical.', 'Careful.', 'Investigative.'];
    let c = 0;
    let skip = false; try { skip = sessionStorage.getItem('skipLoader') === '1'; sessionStorage.removeItem('skipLoader'); } catch {}
    if (skip && !this._static) this.setState({ phase: 'ready', count: 100 });
    if (!this._static && !skip) this._pre = setInterval(() => {
      c = Math.min(100, c + Math.ceil(Math.random() * 2.2));
      { const n = document.querySelector('[data-count]'), w = document.querySelector('[data-word]'); if (n) n.textContent = c; if (w) w.textContent = words[Math.min(4, Math.floor(c / 20))]; }
      if (c >= 100) { clearInterval(this._pre); setTimeout(() => this.setState({ phase: 'exit' }), 500); setTimeout(() => this.setState({ phase: 'ready' }), 1750); }
    }, 30);
    const tick = () => this.setState({ time: new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date()) });
    tick(); this._t = setInterval(tick, 30000);
    this._onMove = e => { this.m.tx = e.clientX; this.m.ty = e.clientY; this.m.nx = (e.clientX / innerWidth) * 2 - 1; this.m.ny = (e.clientY / innerHeight) * 2 - 1; };
    window.addEventListener('mousemove', this._onMove);
    this.sc.target = this.sc.cur = window.scrollY;
    this._onWheel = e => {
      if (this.state.caseIdx >= 0 || this.state.menuOpen || this.state.phase !== 'ready') { if (this.state.phase !== 'ready') e.preventDefault(); return; }
      e.preventDefault();
      const max = document.documentElement.scrollHeight - innerHeight; const js = this.R('diveSec').current, jr = js && js.getBoundingClientRect(), inJ = jr && jr.top <= 2 && jr.bottom >= innerHeight + 2; this.inJ = !!inJ;
      this.sc.target = Math.max(0, Math.min(max, this.sc.target + e.deltaY * (e.deltaMode === 1 ? 16 : 1) * (inJ ? .5 : .9)));
    };
    if (!this._static) window.addEventListener('wheel', this._onWheel, { passive: false });
    this._onScroll = () => { if (Math.abs(window.scrollY - this.sc.last) > 1.5) this.sc.target = this.sc.cur = window.scrollY; };
    window.addEventListener('scroll', this._onScroll, { passive: true });

    setTimeout(() => this.setupReveals(), 150); setTimeout(() => this.setupReveals(), 1500);
    if (this._static) return;
    await new Promise(r => { const t = setInterval(() => { if (this.state.phase === 'ready') { clearInterval(t); r(); } }, 120); }); if (document.fonts && document.fonts.ready) await document.fonts.ready;
    this.initGL().catch(() => this.enableStatic());
  }
  enableStatic() {
    this._static = true; clearInterval(this._pre); document.documentElement.classList.add('static-mode');
    if (this._onWheel) window.removeEventListener('wheel', this._onWheel);
    this._alive = false; cancelAnimationFrame(this._raf);
    this.setState({ phase: 'ready', count: 100 });
  }
  componentDidUpdate(_, prev) {
    const open = st => st.caseIdx >= 0 || st.menuOpen;
    const was = open(prev), is = open(this.state);
    if (is && !was) this._opener = document.activeElement;
    if (is !== was || (is && prev.menuOpen !== this.state.menuOpen)) {
      document.querySelectorAll('main, footer').forEach(el => { el.inert = is; });
      const nav = document.querySelector('nav'); if (nav) nav.inert = this.state.caseIdx >= 0;
    }
    if (this.state.menuOpen && !prev.menuOpen) { const first = document.querySelector('[data-overlay] a'); if (first) first.focus({ preventScroll: true }); }
    if (was && !is && this._opener && this._opener.isConnected) this._opener.focus({ preventScroll: true });
  }
  componentWillUnmount() { window.removeEventListener('keydown', this._onKey); window.removeEventListener('popstate', this._onPop); clearInterval(this._pre); clearInterval(this._t); window.removeEventListener('mousemove', this._onMove); window.removeEventListener('wheel', this._onWheel); window.removeEventListener('scroll', this._onScroll); this._io && this._io.disconnect(); this._alive = false; cancelAnimationFrame(this._raf); }

  setupReveals() {
    const io = this._io || (this._io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return; const el = en.target; io.unobserve(el);
      if (el.hasAttribute('data-reveal')) el.querySelectorAll('[data-w]').forEach((w, i) => { w.style.transitionDelay = i * 45 + 'ms'; w.style.transform = 'none'; });
      else { el.style.opacity = '1'; el.style.transform = 'none'; }
    }), { threshold: .1 }));
    document.querySelectorAll('[data-reveal],[data-fade]').forEach(el => io.observe(el));
    const g = this.R('grid').current; if (g) Array.from(g.children).forEach((el, i) => { el.style.transitionDelay = (i % 2) * 140 + 'ms'; io.observe(el); });
    this._pars = Array.from(document.querySelectorAll('[data-par]'));
    this._floats = Array.from(document.querySelectorAll('[data-float]'));
    this._yrs = Array.from(document.querySelectorAll('[data-yr]'));
    this._tilts = Array.from(document.querySelectorAll('[data-tilt]'));
  }

  async initGL() {
    const THREE = await import('three');
    const LOW = matchMedia('(pointer: coarse)').matches;
    const [{ RoomEnvironment }, { RoundedBoxGeometry }, { mergeGeometries }] = await Promise.all([import('three/addons/environments/RoomEnvironment.js'), import('three/addons/geometries/RoundedBoxGeometry.js'), import('three/addons/utils/BufferGeometryUtils.js')]);
    const canvas = this.R('gl').current, trail = this.R('trail').current, dcv = this.R('diveGl').current; if (!canvas || !dcv) return;
    this._alive = true;
    const rnd = (a, b) => a + Math.random() * (b - a);
    const palette = [0xf0efe9, 0xf0efe9, 0xf0efe9, 0x1a1816, 0x1a1816, 0x8c8880, 0xe8d5b0, 0xe0562a];
    const mat = hex => new THREE.MeshPhysicalMaterial({ color: hex, roughness: .22, metalness: 0, clearcoat: .8, clearcoatRoughness: .15, envMapIntensity: .9 });
    const glass = () => new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .1, transmission: 1, thickness: 1.4, ior: 1.4, envMapIntensity: 1 });

    // HERO
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, LOW ? 1.25 : 1.75)); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
    const scene = new THREE.Scene(); scene.background = new THREE.Color(0x131211); scene.fog = new THREE.Fog(0x131211, 12, 30);
    const env = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture; scene.environment = env;
    const camera = new THREE.PerspectiveCamera(30, 1, .1, 100); camera.position.z = 18;
    const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(5, 8, 6); scene.add(key);
    const rim = new THREE.DirectionalLight(0xffe2c8, 1); rim.position.set(-6, -3, -4); scene.add(rim);
    const geos = [new RoundedBoxGeometry(1, 1, 1, 6, .22), new THREE.CapsuleGeometry(.38, 1.1, 8, 24), new THREE.TorusGeometry(.62, .24, 24, 64), new THREE.SphereGeometry(.7, 48, 48), new RoundedBoxGeometry(2.2, .5, .5, 6, .24)];
    const group = new THREE.Group(); scene.add(group); const items = [];
    for (let i = 0; i < 40; i++) {
      const mesh = new THREE.Mesh(geos[i % geos.length], i % 6 === 0 ? glass() : mat(palette[Math.floor(Math.random() * palette.length)]));
      const r = rnd(1, 6), th = rnd(0, 6.283), base = new THREE.Vector3(r * Math.cos(th), r * Math.sin(th) * .7 + rnd(-1, 1) * 1.4, rnd(-6, 4));
      mesh.rotation.set(rnd(0, 6.283), rnd(0, 6.283), rnd(0, 6.283)); mesh.scale.setScalar(rnd(.7, 1.5)); group.add(mesh);
      items.push({ mesh, base, spin: new THREE.Vector3(rnd(-.4, .4), rnd(-.4, .4), rnd(-.2, .2)), ph: rnd(0, 6.283) });
    }
    const tctx = trail.getContext('2d');

    // JOURNEY — Skyline: pastel low-poly city along a winding avenue; districts grow as the camera approaches
    const drend = new THREE.WebGLRenderer({ canvas: dcv, antialias: true, alpha: true, powerPreference: 'high-performance' });
    drend.setPixelRatio(1); drend.setClearColor(0x000000, 0); drend.toneMapping = THREE.ACESFilmicToneMapping; drend.toneMappingExposure = 1.0;
    const dscene = new THREE.Scene(); dscene.fog = new THREE.FogExp2(0xf6f5f1, .0058);
    const dcam = new THREE.PerspectiveCamera(46, 1, .1, 900);
    dscene.add(new THREE.HemisphereLight(0xffffff, 0xe6e2da, 1.3)); const sun = new THREE.DirectionalLight(0xfff3e6, 1.5); sun.position.set(-80, 120, -60); dscene.add(sun);
    const TAU = 6.28318, N_D = 5;
    // ================= GRID CITY. One orthogonal street network. Avenues run N-S (along z), streets run E-W (along x). Everything snaps to it.
    const std = (c, r = 1, m = 0, extra = {}) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: r, metalness: m }, extra));
    const dm = new THREE.Object3D(), cp = new THREE.Vector3(), la = new THREE.Vector3(), tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), tn = new THREE.Vector3(), nm = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), bc = new THREE.Color();
    drend.shadowMap.enabled = true; drend.shadowMap.type = THREE.PCFSoftShadowMap; drend.shadowMap.autoUpdate = false; sun.castShadow = true; sun.shadow.mapSize.set(LOW ? 1024 : 2048, LOW ? 1024 : 2048); sun.shadow.camera.left = -360; sun.shadow.camera.right = 360; sun.shadow.camera.top = 360; sun.shadow.camera.bottom = -360; sun.shadow.camera.far = 900; sun.shadow.bias = -.0004; sun.shadow.normalBias = .05; sun.position.set(-160, 260, -300); sun.target.position.set(0, 0, -300); dscene.add(sun.target);
    const BLK = 22, ST = 7, AVE_W = 13, PITCH = BLK + ST;                  // block size, street width, avenue width
    const NX = 14, NZ = 26;                                                 // blocks across (x) and along (z)
    const X0 = -(NX * PITCH) / 2, Z0 = 30;                                  // grid origin: block (0,0) top-left; z decreases going "north"
    const gx = c => X0 + c * PITCH, gz = r => Z0 - r * PITCH;               // block corner
    const cx = c => gx(c) + BLK / 2, cz = r => gz(r) - BLK / 2;             // block centre
    const sx = c => gx(c) - ST / 2, sz = r => gz(r) + ST / 2;               // street centre lines (street c runs along z at x=sx(c); street r runs along x at z=sz(r))
    const AVE_C = [4, 9], AVE_R = [5, 11, 17, 23];                          // which grid lines are wide avenues
    const isAveC = c => AVE_C.includes(c), isAveR = r => AVE_R.includes(r);
    const ZLEN = NZ * PITCH;
    // districts = 5 neighbourhoods along the grid, centres given in block coords
    const DCB = [[6, 3], [9, 8], [4, 13], [10, 18], [6, 23]]; const DC = DCB.map(([c, r]) => new THREE.Vector3(cx(c), 0, cz(r))); const distSide = i => i % 2 ? -1 : 1;
    const distOf = (x, z) => { let b = 0, bd = 1e9; for (let i = 0; i < N_D; i++) { const d = (DC[i].x - x) ** 2 + (DC[i].z - z) ** 2; if (d < bd) { bd = d; b = i; } } return b; };
    const pastel = [0xffffff, 0xf8f7f3, 0xf2f0ea, 0xffffff, 0xf5f3ee, 0xece9e2, 0xffffff, 0xe6e9eb, 0xf4f1ec, 0xdfe3e6];
    // ---- materials
    const asphalt = std(0xdad7d0, .95), asphaltAve = std(0xd4d1ca, .95), kerb = std(0xf7f6f2, .9), whiteM = new THREE.MeshBasicMaterial({ color: 0xffffff }), grass = std(0xd9e2d2), plazaM = std(0xf3f0ea), waterM = std(0xcbdce6, .12, .1), yellowM = new THREE.MeshBasicMaterial({ color: 0xe8d5b0 });
    // ---- merged static geometry helper
    const MERGE = new Map(); const addG = (g, m) => { if (!MERGE.has(m)) MERGE.set(m, []); MERGE.get(m).push(g); };
    const plane = (w, d, x, z, y, m) => { const g = new THREE.PlaneGeometry(w, d); g.rotateX(-Math.PI / 2); g.translate(x, y, z); addG(g, m); };
    const box = (w, hh, d, x, y, z, m) => { const g = new THREE.BoxGeometry(w, hh, d); g.translate(x, y, z); addG(g, m); };
    // ---- ground
    { const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), std(0xf0eee9)); ground.rotation.x = -Math.PI / 2; ground.position.set(0, -.04, -ZLEN / 2); ground.receiveShadow = true; dscene.add(ground); }
    // ---- river: straight canal along street row 14/15 gap, replaced block row 14 (E-W), with embankments
    const RIVER_R = 14; const riverZ = cz(RIVER_R); plane(NX * PITCH + 300, BLK + 6, 0, riverZ, .005, std(0xe4e2db)); plane(NX * PITCH + 300, BLK, 0, riverZ, .012, waterM);
    // ---- streets: N-S lines c=0..NX, E-W lines r=0..NZ. Avenues wider with a median.
    for (let c = 0; c <= NX; c++) { const w = isAveC(c) ? AVE_W : ST; plane(w + 1.8, ZLEN + ST + 80, sx(c), Z0 - ZLEN / 2 + ST / 2, .01, kerb); plane(w, ZLEN + ST + 80, sx(c), Z0 - ZLEN / 2 + ST / 2, .02, isAveC(c) ? asphaltAve : asphalt); if (isAveC(c)) plane(1.2, ZLEN + ST + 60, sx(c), Z0 - ZLEN / 2 + ST / 2, .04, grass); }
    for (let r = 0; r <= NZ; r++) { if (r === RIVER_R || r === RIVER_R + 1) continue; const w = isAveR(r) ? AVE_W : ST; plane(NX * PITCH + ST + 80, w + 1.8, X0 + (NX * PITCH) / 2 - ST / 2, sz(r), .01, kerb); plane(NX * PITCH + ST + 80, w, X0 + (NX * PITCH) / 2 - ST / 2, sz(r), .02, isAveR(r) ? asphaltAve : asphalt); if (isAveR(r)) plane(NX * PITCH + ST + 60, 1.2, X0 + (NX * PITCH) / 2 - ST / 2, sz(r), .04, grass); }
    // lane dashes (instanced) on avenues
    { const dashes = []; for (const c of AVE_C) for (let z = Z0 + 30; z > Z0 - ZLEN - 30; z -= 5) for (const o of [-3.6, 3.6]) dashes.push([sx(c) + o, z, 0]); for (const r of AVE_R) for (let x = X0 - 30; x < X0 + NX * PITCH + 30; x += 5) for (const o of [-3.6, 3.6]) dashes.push([x, sz(r) + o, Math.PI / 2]); const dash = new THREE.InstancedMesh(new THREE.PlaneGeometry(.16, 2.4), whiteM, dashes.length); dashes.forEach(([x, z, rot], k) => { dm.position.set(x, .06, z); dm.rotation.set(-Math.PI / 2, 0, rot); dm.scale.set(1, 1, 1); dm.updateMatrix(); dash.setMatrixAt(k, dm.matrix); }); dscene.add(dash); }
    // ---- flyovers: two elevated E-W expressways crossing the whole grid at r=8 and r=20, ramps at both ends; traffic on top, streets below stay open
    const FLY_R = [8, 20], FLY_Y = 9, FLY = [];
    for (const r of FLY_R) { const z = sz(r), len = NX * PITCH + ST + 120, xa = X0 - 60, xb = X0 + NX * PITCH + 60; const g = new THREE.Group(); const deck = new THREE.Mesh(new THREE.BoxGeometry(len, 1, 11), std(0xffffff, .7)); deck.position.set((xa + xb) / 2, FLY_Y, z); deck.castShadow = true; deck.receiveShadow = true; g.add(deck); for (const s of [-5.2, 5.2]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(len, 1.1, .35), std(0xf4f2ed)); rail.position.set((xa + xb) / 2, FLY_Y + 1, z + s); g.add(rail); } const pill = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, FLY_Y, 1.6), std(0xf0ede6), Math.ceil(len / 16)); let n = 0; for (let x = xa + 8; x < xb; x += 16) { dm.position.set(x, FLY_Y / 2 - .5, z); dm.rotation.set(0, 0, 0); dm.scale.set(1, 1, 1); dm.updateMatrix(); pill.setMatrixAt(n++, dm.matrix); } pill.count = n; pill.castShadow = true; g.add(pill); const mk = (x0, dir) => { const ramp = new THREE.Mesh(new THREE.BoxGeometry(60, 1, 11), std(0xffffff, .7)); ramp.position.set(x0 + dir * 30, FLY_Y / 2, z); ramp.rotation.z = -dir * Math.atan2(FLY_Y, 60); g.add(ramp); }; mk(xa, -1); mk(xb, 1); const asph = new THREE.Mesh(new THREE.PlaneGeometry(len, 9.4), asphaltAve); asph.rotation.x = -Math.PI / 2; asph.position.set((xa + xb) / 2, FLY_Y + .51, z); g.add(asph); dscene.add(g); FLY.push({ z, xa, xb }); }
    // ---- bridges over the canal where every avenue and every other street crosses
    { for (let c = 0; c <= NX; c++) { if (!isAveC(c) && c % 2) continue; const w = isAveC(c) ? AVE_W : ST; const g = new THREE.Group(); g.position.set(sx(c), 0, riverZ); const deck = new THREE.Mesh(new THREE.BoxGeometry(w + 1, 1.2, BLK + 8), std(0xffffff, .7)); deck.position.y = 1.4; deck.castShadow = true; g.add(deck); for (const s of [-(w + 1) / 2, (w + 1) / 2]) { const rl = new THREE.Mesh(new THREE.BoxGeometry(.35, 1.2, BLK + 8), std(0xffffff)); rl.position.set(s, 2.6, 0); g.add(rl); } for (const zz of [-7, 7]) { const pier = new THREE.Mesh(new THREE.BoxGeometry(w - 1, 2.4, 2), std(0xf0ede6)); pier.position.set(0, .6, zz); g.add(pier); } dscene.add(g); } }
    // ---- blocks: land use by zone. Buildings with real façades: podium + tower, floor slabs, mullion bands, cores, parapets, rooftop plant, tanks, AC units, solar
    const B = [], PARK = [], PLAZA = [], SITES = [];
    for (let c = 0; c < NX; c++) for (let r = 0; r < NZ; r++) {
      if (r === RIVER_R) continue; const x = cx(c), z = cz(r), di = distOf(x, z), dc = Math.hypot(DC[di].x - x, DC[di].z - z) / PITCH;
      const core = Math.exp(-((dc / 2.2) ** 2));
      if ([[5, 3], [11, 9], [2, 12], [12, 19], [4, 24]].some(([a, b]) => a === c && b === r)) { PARK.push({ x, z, i: di }); continue; }
      if (DCB.some(([a, b]) => a === c && b === r)) { PLAZA.push({ x, z, i: di }); continue; }
      if (di === 4 && core > .35 && (c + r) % 2) { SITES.push({ x, z, i: di }); continue; }
      const roll = Math.random();
      if (roll < .12 + core * .42) { // tower on podium
        const pool = ['box', 'box', 'slim', 'tiered', 'tiered', 'stepped', 'hex', 'oval', 'tri', 'twist', 'cross', 'sail', 'gate', 'drum', 'round']; let shape = pool[(c * 7 + r * 13 + Math.floor(Math.random() * 3)) % pool.length]; if (shape === 'round' && (c + r) % 3) shape = 'hex'; const hh = rnd(40, 60 + core * 70); const pw = BLK - 3, tw = shape === 'slim' ? rnd(9, 12) : rnd(12, 16);
        B.push({ x, z, w: pw, d: pw, h: rnd(6, 10), kind: 'podium', i: di }); B.push({ x: x + rnd(-1.5, 1.5), z: z + rnd(-1.5, 1.5), w: tw, d: shape === 'slim' ? tw * 1.6 : tw, h: hh, kind: 'tower', shape, i: di, heli: hh > 52 && Math.random() < .65 && ['box', 'slim', 'round', 'hex', 'cross', 'tiered'].includes(shape), crown: Math.random() < .5 });
      } else if (roll < .42) { // perimeter block (courtyard), 4 wings different heights
        const t = 5.2, hh = rnd(12, 22 + core * 8); const wings = [[0, -(BLK - t) / 2 + .5, BLK - 1, t], [0, (BLK - t) / 2 - .5, BLK - 1, t], [-(BLK - t) / 2 + .5, 0, t, BLK - 1 - 2 * t], [(BLK - t) / 2 - .5, 0, t, BLK - 1 - 2 * t]]; wings.forEach(([ox, oz, w, d], k) => B.push({ x: x + ox, z: z + oz, w, d, h: hh * rnd(.85, 1.15), kind: 'wing', i: di })); PARK.push({ x, z, i: di, inner: true });
      } else if (roll < .68) { // two slabs
        const vert = Math.random() < .5; for (const s of [-1, 1]) B.push({ x: x + (vert ? s * BLK / 4 : 0), z: z + (vert ? 0 : s * BLK / 4), w: vert ? BLK / 2 - 3 : BLK - 3, d: vert ? BLK - 3 : BLK / 2 - 3, h: rnd(14, 30 + core * 10), kind: 'slab', i: di });
      } else { // low-rise 3x3 with a gap
        for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { if (Math.random() < .2) continue; B.push({ x: x + a * (BLK / 3), z: z + b * (BLK / 3), w: BLK / 3 - 1.4, d: BLK / 3 - 1.4, h: rnd(4, 11), kind: 'low', i: di }); }
      }
    }
    // ---- instanced bodies
    const SPECIAL = ['round', 'hex', 'oval', 'tri', 'twist', 'cross', 'sail', 'gate', 'drum', 'stepped'];
    const boxes = B.filter(o => !SPECIAL.includes(o.shape)), rounds = B.filter(o => o.shape === 'round' || o.shape === 'oval' || o.shape === 'drum');
    const SPEC = B.filter(o => SPECIAL.includes(o.shape) && !['round', 'oval', 'drum'].includes(o.shape));
    const specGeo = { hex: new THREE.CylinderGeometry(.5, .5, 1, 6), tri: new THREE.CylinderGeometry(.55, .55, 1, 3), twist: (() => { const g = new THREE.BoxGeometry(1, 1, 1, 1, 24, 1); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), a = (y + .5) * 1.1; const x = p.getX(i), z = p.getZ(i); p.setXYZ(i, x * Math.cos(a) - z * Math.sin(a), y, x * Math.sin(a) + z * Math.cos(a)); } g.computeVertexNormals(); return g; })(), cross: (() => { const a = new THREE.BoxGeometry(1, 1, .45), b = new THREE.BoxGeometry(.45, 1, 1); return mergeGeometries([a, b], false); })(), sail: (() => { const g = new THREE.BoxGeometry(1, 1, 1, 1, 16, 1); const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) + .5; p.setX(i, p.getX(i) * (1 - y * .55) + y * .2); p.setZ(i, p.getZ(i) * (1 - y * .25)); } g.computeVertexNormals(); return g; })(), gate: (() => { const l = new THREE.BoxGeometry(.3, 1, 1); l.translate(-.35, 0, 0); const r = new THREE.BoxGeometry(.3, 1, 1); r.translate(.35, 0, 0); const top = new THREE.BoxGeometry(1, .22, 1); top.translate(0, .39, 0); return mergeGeometries([l, r, top], false); })(), stepped: (() => { const a = new THREE.BoxGeometry(1, .45, 1); a.translate(0, -.275, 0); const b = new THREE.BoxGeometry(.72, .3, .72); b.translate(.1, .1, -.1); const c = new THREE.BoxGeometry(.46, .3, .46); c.translate(.2, .4, -.2); return mergeGeometries([a, b, c], false); })() };
    const specMeshes = {}; for (const k in specGeo) { const list = SPEC.filter(o => o.shape === k); const im = new THREE.InstancedMesh(specGeo[k], std(0xffffff, .65, .05), Math.max(1, list.length)); im.castShadow = true; im.receiveShadow = true; im.count = list.length; list.forEach((o, i) => { dm.position.set(o.x, o.h / 2, o.z); const w = k === 'sail' || k === 'gate' ? Math.min(BLK - 4, o.w * 1.3) : o.w; dm.scale.set(w, o.h, k === 'gate' ? Math.min(BLK - 4, o.d * 1.2) : o.d); dm.rotation.set(0, k === 'tri' ? Math.PI / 6 : k === 'hex' ? Math.PI / 6 : 0, 0); dm.updateMatrix(); im.setMatrixAt(i, dm.matrix); im.setColorAt(i, bc.setHex(i % 5 === 0 ? 0xe6e9eb : 0xffffff)); }); im.instanceColor.needsUpdate = true; dscene.add(im); specMeshes[k] = im; }
    const bld = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), std(0xffffff, .7), Math.max(1, boxes.length)); bld.castShadow = true; bld.receiveShadow = true; dscene.add(bld);
    boxes.forEach((o, k) => bld.setColorAt(k, bc.setHex(k % 47 === 0 && o.kind === 'tower' ? 0xe0562a : pastel[k % pastel.length]))); bld.instanceColor.needsUpdate = true;
    const rnd_ = new THREE.InstancedMesh(new THREE.CylinderGeometry(.5, .5, 1, 40), std(0xffffff, .55, .05), Math.max(1, rounds.length)); dscene.add(rnd_);
    const TIER = B.filter(o => o.shape === 'tiered'); const tierM = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), std(0xffffff, .7), Math.max(1, TIER.length)); tierM.castShadow = true; dscene.add(tierM);
    // floor slabs (thin light lines every 3.3m) and glazing bands between them = façade rhythm
    const STEM = B.filter(o => o.shape === 'drum'); const stemM = new THREE.InstancedMesh(new THREE.CylinderGeometry(.5, .5, 1, 24), std(0xf4f2ed, .8), Math.max(1, STEM.length)); stemM.castShadow = true; dscene.add(stemM);
    const FL = []; for (const o of B) if (o.h > 7 && o.kind !== 'podium' && (!o.shape || ['box', 'slim', 'tiered', 'round'].includes(o.shape))) { const n = Math.floor(o.h / 3.3); for (let k = 1; k < n; k++) FL.push({ o, y: k * 3.3 }); }
    const slabM = new THREE.InstancedMesh(new THREE.BoxGeometry(1, .28, 1), std(0xffffff, .9), Math.max(1, FL.filter(f => f.o.shape !== 'round').length)); dscene.add(slabM);
    const slabR = new THREE.InstancedMesh(new THREE.CylinderGeometry(.5, .5, .28, 40), std(0xffffff, .9), Math.max(1, FL.filter(f => f.o.shape === 'round').length)); dscene.add(slabR);
    const glassB = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), std(0xbfcbd3, .15, .45), Math.max(1, B.filter(o => o.kind === 'tower' && o.shape !== 'round').length)); dscene.add(glassB);
    const glassR = new THREE.InstancedMesh(new THREE.CylinderGeometry(.5, .5, 1, 40), std(0xbfcbd3, .15, .45), Math.max(1, rounds.length)); dscene.add(glassR);
    // vertical mullions on towers
    const MUL = []; for (const o of B) if (o.kind === 'tower' && ['box', 'slim', 'tiered'].includes(o.shape)) { const nx = Math.max(2, Math.round(o.w / 2.2)), nz = Math.max(2, Math.round(o.d / 2.2)); for (let k = 0; k <= nx; k++) for (const s of [-1, 1]) MUL.push({ x: o.x - o.w / 2 + k * (o.w / nx), z: o.z + s * o.d / 2, h: o.h }); for (let k = 0; k <= nz; k++) for (const s of [-1, 1]) MUL.push({ x: o.x + s * o.w / 2, z: o.z - o.d / 2 + k * (o.d / nz), h: o.h }); }
    const mulM = new THREE.InstancedMesh(new THREE.BoxGeometry(.22, 1, .22), std(0xffffff, .8), Math.max(1, MUL.length)); dscene.add(mulM);
    // podium glazing at street level for podiums/wings/slabs
    const SHOP = B.filter(o => o.kind === 'podium' || o.kind === 'wing' || o.kind === 'slab'); const shopM = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 3.2, 1), std(0xa9b8c2, .1, .5), Math.max(1, SHOP.length)); dscene.add(shopM);
    // parapets, cores, roof kit
    for (let di = 0; di < N_D; di++) { const tw = B.filter(o => o.kind === 'tower' && o.i === di && ['box', 'slim', 'round', 'hex', 'cross', 'tiered'].includes(o.shape)).sort((a, b) => b.h - a.h); tw.slice(0, 2).forEach(o => { o.heli = true; o.crown = false; }); }
    const TALL = B.filter(o => o.h > 7 && o.kind !== 'podium'); const parM = new THREE.InstancedMesh(new THREE.BoxGeometry(1, .9, 1), std(0xffffff, .8), Math.max(1, TALL.filter(o => o.shape !== 'round').length)); dscene.add(parM);
    const ROOF = []; for (const o of TALL) { if (o.heli) continue; const n = o.kind === 'tower' ? 3 : o.kind === 'low' ? 1 : 2; for (let k = 0; k < n; k++) ROOF.push({ o, ox: rnd(-.3, .3) * o.w, oz: rnd(-.3, .3) * o.d, w: rnd(1.4, o.w * .3), d: rnd(1.4, o.d * .3), h: rnd(1, 2.4), kind: k === 0 && o.kind === 'tower' ? 'core' : Math.random() < .35 ? 'tank' : 'ac' }); }
    const roofBox = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), std(0xe9e6df, .9), Math.max(1, ROOF.filter(r => r.kind !== 'tank').length)); dscene.add(roofBox);
    const roofTank = new THREE.InstancedMesh(new THREE.CylinderGeometry(.5, .5, 1, 14), std(0xffffff, .6), Math.max(1, ROOF.filter(r => r.kind === 'tank').length)); dscene.add(roofTank);
    const SOLAR = TALL.filter(o => o.kind !== 'tower' && Math.random() < .35); const solarM = new THREE.InstancedMesh(new THREE.BoxGeometry(1, .12, 1), std(0x6b7d8a, .3, .5), Math.max(1, SOLAR.length)); dscene.add(solarM);
    const CROWN = B.filter(o => o.crown); const crownM = new THREE.InstancedMesh(new THREE.CylinderGeometry(.08, .18, 1, 6), std(0xffffff), Math.max(1, CROWN.length)); dscene.add(crownM);
    // helipads
    const HP = B.filter(o => o.heli); const padDeck = new THREE.InstancedMesh(new THREE.BoxGeometry(1, .5, 1), std(0xf4f2ed, .8), Math.max(1, HP.length)); dscene.add(padDeck);
    const pad = new THREE.InstancedMesh(new THREE.CylinderGeometry(3.6, 3.6, .12, 40), std(0xe0562a, .7), Math.max(1, HP.length)); dscene.add(pad);
    const padRing = new THREE.InstancedMesh(new THREE.TorusGeometry(3.1, .12, 8, 48), whiteM, Math.max(1, HP.length)); dscene.add(padRing);
    const padH1 = new THREE.InstancedMesh(new THREE.BoxGeometry(.34, .05, 2.4), whiteM, Math.max(1, HP.length * 2)); dscene.add(padH1);
    const padH2 = new THREE.InstancedMesh(new THREE.BoxGeometry(1.2, .05, .34), whiteM, Math.max(1, HP.length)); dscene.add(padH2);
    const net = new THREE.InstancedMesh(new THREE.BoxGeometry(1, .06, 1), std(0xb9b3a9, .9, 0, { transparent: true, opacity: .6 }), Math.max(1, HP.length * 4)); dscene.add(net);
    const padLight = new THREE.InstancedMesh(new THREE.SphereGeometry(.14, 6, 6), new THREE.MeshBasicMaterial({ color: 0xe0562a }), Math.max(1, HP.length * 8)); dscene.add(padLight);
    // ---- parks / plazas / sites
    for (const p of PARK) { const s = p.inner ? BLK - 2 * 5.2 - 2 : BLK - 1; plane(s, s, p.x, p.z, .03, grass); if (!p.inner) { plane(1.8, s, p.x, p.z, .04, plazaM); plane(s, 1.8, p.x, p.z, .04, plazaM); const pg = new THREE.CircleGeometry(3.8, 32); pg.rotateX(-Math.PI / 2); pg.translate(p.x + 4.2, .05, p.z - 4.2); addG(pg, waterM); } }
    for (const l of PLAZA) { plane(BLK - 1, BLK - 1, l.x, l.z, .03, plazaM); const rg = new THREE.TorusGeometry(2.8, .3, 8, 40); rg.rotateX(-Math.PI / 2); rg.translate(l.x, .25, l.z); addG(rg, std(0xffffff)); const wg = new THREE.CircleGeometry(2.6, 32); wg.rotateX(-Math.PI / 2); wg.translate(l.x, .16, l.z); addG(wg, waterM); for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; box(1.8, .45, .45, l.x + Math.cos(a) * 6.5, .23, l.z + Math.sin(a) * 6.5, std(0xffffff)); } }
    for (const s of SITES) { plane(BLK - 1, BLK - 1, s.x, s.z, .03, std(0xe6e1d6)); box(BLK - 1, 2.2, .3, s.x, 1.1, s.z + BLK / 2 - .5, std(0xffffff)); box(BLK - 1, 2.2, .3, s.x, 1.1, s.z - BLK / 2 + .5, std(0xffffff)); box(.3, 2.2, BLK - 1, s.x + BLK / 2 - .5, 1.1, s.z, std(0xffffff)); box(.3, 2.2, BLK - 1, s.x - BLK / 2 + .5, 1.1, s.z, std(0xffffff)); box(BLK - 6, 1.2, BLK - 6, s.x, .6, s.z, std(0xf0ede6)); box(4, 1.6, 3, s.x - 6, .8, s.z - 6, std(0xd9c9b8)); box(3, 2.6, 3, s.x + 6, 1.3, s.z + 6, std(0xffffff)); }
    // one big crane in the unbuilt district
    { const a = SITES[0] || { x: DC[4].x, z: DC[4].z }; const base = new THREE.Mesh(new THREE.BoxGeometry(6, 1.4, 6), std(0xe6e3dc)); base.position.set(a.x + 7, .7, a.z + 7); dscene.add(base); const mast = new THREE.Mesh(new THREE.BoxGeometry(1.5, 52, 1.5), std(0xe0562a)); mast.position.set(a.x + 7, 27, a.z + 7); mast.castShadow = true; dscene.add(mast); const jibG = new THREE.Group(); jibG.position.set(a.x + 7, 53, a.z + 7); const jib = new THREE.Mesh(new THREE.BoxGeometry(40, 1, 1), std(0xe0562a)); jib.position.x = 11; jibG.add(jib); const cw = new THREE.Mesh(new THREE.BoxGeometry(6, 2.2, 2.2), std(0x2a2622)); cw.position.set(-10, -.7, 0); jibG.add(cw); const cab = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2, 2.2), std(0xffffff)); cab.position.set(1.6, -1.6, 0); jibG.add(cab); const cable = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 24, 4), std(0x555049)); cable.position.set(22, -12, 0); jibG.add(cable); const hook = new THREE.Mesh(new THREE.BoxGeometry(3, 1.4, 3), std(0xffffff)); hook.position.set(22, -24.5, 0); jibG.add(hook); dscene.add(jibG); this._crane = jibG; }
    // ---- footpath furniture: crosswalks + signals at every avenue intersection, lamps along avenues
    const XW = []; for (const c of AVE_C) for (let r = 0; r <= NZ; r++) { if (r === RIVER_R || r === RIVER_R + 1) continue; XW.push({ x: sx(c), z: sz(r), aveW: AVE_W, stW: isAveR(r) ? AVE_W : ST }); } for (const r of AVE_R) for (let c = 0; c <= NX; c++) { if (isAveC(c)) continue; XW.push({ x: sx(c), z: sz(r), aveW: isAveR(r) ? AVE_W : ST, stW: ST, rot: 1 }); }
    { const zb = []; for (const x of XW) { const a = x.rot ? x.stW : x.aveW, b = x.rot ? x.aveW : x.stW; for (let k = 0; k < 8; k++) { const o = (k - 3.5) * .9; zb.push([x.x + o, x.z + b / 2 + 1.6, .55, 2.4]); zb.push([x.x + o, x.z - b / 2 - 1.6, .55, 2.4]); zb.push([x.x + a / 2 + 1.6, x.z + o, 2.4, .55]); zb.push([x.x - a / 2 - 1.6, x.z + o, 2.4, .55]); } } const zebra = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ color: 0xfafaf7 }), zb.length); zb.forEach(([x, z, w, d], k) => { dm.position.set(x, .07, z); dm.rotation.set(-Math.PI / 2, 0, 0); dm.scale.set(w, d, 1); dm.updateMatrix(); zebra.setMatrixAt(k, dm.matrix); }); dscene.add(zebra); }
    const SIG = []; for (const x of XW) { const a = x.rot ? x.stW : x.aveW, b = x.rot ? x.aveW : x.stW; SIG.push({ x: x.x + a / 2 + 1.2, z: x.z + b / 2 + 1.2, yaw: Math.PI }, { x: x.x - a / 2 - 1.2, z: x.z - b / 2 - 1.2, yaw: 0 }); }
    { const pole = new THREE.InstancedMesh(new THREE.CylinderGeometry(.09, .11, 4.4, 6), std(0x9c968c), SIG.length), arm = new THREE.InstancedMesh(new THREE.BoxGeometry(.08, .08, 3), std(0x9c968c), SIG.length), head = new THREE.InstancedMesh(new THREE.BoxGeometry(.5, 1.4, .45), std(0x2a2622), SIG.length); SIG.forEach((s, k) => { dm.position.set(s.x, 2.2, s.z); dm.rotation.set(0, s.yaw, 0); dm.scale.set(1, 1, 1); dm.updateMatrix(); pole.setMatrixAt(k, dm.matrix); dm.position.set(s.x, 4.35, s.z - Math.cos(s.yaw) * 1.5 * -1); dm.updateMatrix(); arm.setMatrixAt(k, dm.matrix); dm.position.set(s.x, 4, s.z - Math.cos(s.yaw) * 3 * -1); dm.updateMatrix(); head.setMatrixAt(k, dm.matrix); }); dscene.add(pole); dscene.add(arm); dscene.add(head); }
    const sigLamp = new THREE.InstancedMesh(new THREE.SphereGeometry(.17, 8, 8), new THREE.MeshBasicMaterial({ color: 0xe0562a }), SIG.length); dscene.add(sigLamp);
    { const L = []; for (const c of AVE_C) for (let z = Z0 + 20; z > Z0 - ZLEN - 20; z -= 18) for (const o of [-(AVE_W / 2 + 1.3), AVE_W / 2 + 1.3]) L.push([sx(c) + o, z]); for (const r of AVE_R) for (let x = X0 - 20; x < X0 + NX * PITCH + 20; x += 18) for (const o of [-(AVE_W / 2 + 1.3), AVE_W / 2 + 1.3]) L.push([x, sz(r) + o]); const lampP = new THREE.InstancedMesh(new THREE.CylinderGeometry(.08, .13, 7.5, 6), std(0xc9c4ba), L.length), lampH = new THREE.InstancedMesh(new THREE.SphereGeometry(.34, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff6e6 }), L.length); L.forEach(([x, z], k) => { dm.position.set(x, 3.75, z); dm.rotation.set(0, 0, 0); dm.scale.set(1, 1, 1); dm.updateMatrix(); lampP.setMatrixAt(k, dm.matrix); dm.position.y = 7.6; dm.updateMatrix(); lampH.setMatrixAt(k, dm.matrix); }); dscene.add(lampP); dscene.add(lampH); }
    // ---- trees: avenue rows (spaced, both sides), park groves, courtyard gardens, riverbanks
    const TP = []; for (const c of AVE_C) for (let z = Z0 + 10; z > Z0 - ZLEN - 10; z -= 9) for (const o of [-(AVE_W / 2 + 1.6), AVE_W / 2 + 1.6]) if (Math.abs(z - riverZ) > BLK) TP.push([sx(c) + o, z, rnd(1.5, 1.9)]); for (const r of AVE_R) for (let x = X0 - 10; x < X0 + NX * PITCH + 10; x += 9) for (const o of [-(AVE_W / 2 + 1.6), AVE_W / 2 + 1.6]) TP.push([x, sz(r) + o, rnd(1.5, 1.9)]); for (const p of PARK) { const n = p.inner ? 5 : 18, R = p.inner ? 3.4 : 8.5; for (let k = 0; k < n; k++) { const a = rnd(0, TAU), rr = rnd(1.5, R); TP.push([p.x + Math.cos(a) * rr, p.z + Math.sin(a) * rr, rnd(1.6, 2.8)]); } } for (let x = X0 - 100; x < X0 + NX * PITCH + 100; x += 5) for (const s of [-(BLK / 2 + 3.6), BLK / 2 + 3.6]) if (Math.random() < .7) TP.push([x + rnd(-1, 1), riverZ + s + rnd(-.6, .6), rnd(1.6, 2.6)]);
    const NT = TP.length, canopy = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 14, 12), std(0xffffff), NT), trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(.14, .2, 1, 6), std(0xd2ccc1), NT); dscene.add(canopy); dscene.add(trunk);
    const T = TP.map(([x, z, r], k) => { canopy.setColorAt(k, bc.setHex([0xd0dbcb, 0xc1cfbb, 0xdbe4d6, 0xc9d5c4][k % 4])); return { x, z, r, ph: rnd(0, TAU) }; }); canopy.instanceColor.needsUpdate = true;
    // ---- traffic network: lanes on every avenue and street; a car picks a lane, drives to the end, respawns
    const LANES = []; for (let c = 0; c <= NX; c++) { const w = isAveC(c) ? AVE_W : ST; const offs = isAveC(c) ? [-4.6, -2.2, 2.2, 4.6] : [-1.6, 1.6]; for (const o of offs) LANES.push({ axis: 'z', x: sx(c) + o, a: Z0 + 40, b: Z0 - ZLEN - 40, dir: o > 0 ? -1 : 1, aveL: isAveC(c) }); } for (let r = 0; r <= NZ; r++) { if (r === RIVER_R + 1) continue; if (r === RIVER_R) continue; const offs = isAveR(r) ? [-4.6, -2.2, 2.2, 4.6] : [-1.6, 1.6]; for (const o of offs) LANES.push({ axis: 'x', z: sz(r) + o, a: X0 - 40, b: X0 + NX * PITCH + 40, dir: o > 0 ? 1 : -1, aveL: isAveR(r) }); } for (const f of FLY) for (const o of [-3.2, -1.1, 1.1, 3.2]) LANES.push({ axis: 'x', z: f.z + o, a: f.xa - 30, b: f.xb + 30, dir: o > 0 ? 1 : -1, y: FLY_Y + .5, fly: f, aveL: true });
    const NCAR = LOW ? 160 : 520, carBody = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 1, 1, 2, .22), std(0xffffff, .4, .2), NCAR), carCab = new THREE.InstancedMesh(new RoundedBoxGeometry(1, 1, 1, 2, .3), std(0x9fb0ba, .15, .4), NCAR); dscene.add(carBody); dscene.add(carCab);
    const carCols = [0xffffff, 0x2a2622, 0xe0562a, 0xbfc7cf, 0xf5f2ea, 0x8d949a, 0xffffff, 0xd9c9b8, 0x5a6670]; const CARS = [];
    for (let k = 0; k < NCAR; k++) { const kind = k % 13 === 0 ? 'bus' : k % 17 === 0 ? 'truck' : 'car'; const dims = kind === 'bus' ? [2.3, 2.6, 10] : kind === 'truck' ? [2.3, 2.8, 8] : [1.8, 1, 4.2]; const lane = LANES[Math.floor(Math.random() * LANES.length)]; CARS.push({ lane, s: Math.random(), sp: (kind === 'car' ? rnd(14, 22) : rnd(10, 15)) * (lane.aveL ? 1.4 : 1), dims, kind, col: carCols[k % carCols.length] }); carBody.setColorAt(k, bc.setHex(CARS[k].col)); } carBody.instanceColor.needsUpdate = true;
    // ---- pedestrians on footpaths (both sides of every avenue and street) + plazas
    const WALKS = []; for (let c = 0; c <= NX; c++) { const w = isAveC(c) ? AVE_W : ST; for (const o of [-(w / 2 + 1), w / 2 + 1]) WALKS.push({ axis: 'z', x: sx(c) + o, a: Z0, b: Z0 - ZLEN }); } for (let r = 0; r <= NZ; r++) { if (r === RIVER_R || r === RIVER_R + 1) continue; const w = isAveR(r) ? AVE_W : ST; for (const o of [-(w / 2 + 1), w / 2 + 1]) WALKS.push({ axis: 'x', z: sz(r) + o, a: X0, b: X0 + NX * PITCH }); }
    const NP = LOW ? 260 : 900, ped = new THREE.InstancedMesh(new THREE.CapsuleGeometry(.22, .95, 4, 8), std(0xffffff, .9), NP); dscene.add(ped); const pedCols = [0x2a2622, 0xe0562a, 0xffffff, 0x8d949a, 0xd9c9b8, 0x4a4740, 0xbfc7cf, 0x5a6670]; const PED = [];
    for (let k = 0; k < NP; k++) { if (k % 5 === 0) { const pl = PLAZA[k % PLAZA.length]; PED.push({ plaza: true, cx: pl.x, cz: pl.z, a: rnd(0, TAU), r: rnd(3.5, 9), sp: rnd(.05, .14) * (k % 2 ? 1 : -1) }); } else { const w = WALKS[Math.floor(Math.random() * WALKS.length)]; PED.push({ w, s: Math.random(), sp: rnd(1.1, 1.7) * (k % 2 ? 1 : -1) }); } ped.setColorAt(k, bc.setHex(pedCols[k % pedCols.length])); } ped.instanceColor.needsUpdate = true;
    // ---- rail: a straight line along the west edge (x = X0 - 40) with a terminus station; train shuttles
    const RAIL_X = X0 - 44, RAIL_A = Z0 + 80, RAIL_B = Z0 - ZLEN - 80;
    { plane(5, RAIL_A - RAIL_B, RAIL_X, (RAIL_A + RAIL_B) / 2, .01, std(0xe4e0d8)); for (const o of [-.9, .9]) box(.18, .1, RAIL_A - RAIL_B, RAIL_X + o, .4, (RAIL_A + RAIL_B) / 2, std(0x9d978d)); const tie = new THREE.InstancedMesh(new THREE.BoxGeometry(2.6, .1, .4), std(0xcfc9be), Math.floor((RAIL_A - RAIL_B) / 1.6)); let n = 0; for (let z = RAIL_A; z > RAIL_B; z -= 1.6) { dm.position.set(RAIL_X, .3, z); dm.rotation.set(0, 0, 0); dm.scale.set(1, 1, 1); dm.updateMatrix(); tie.setMatrixAt(n++, dm.matrix); } tie.count = n; dscene.add(tie); const stz = cz(RIVER_R - 4); const platform = new THREE.Mesh(new THREE.BoxGeometry(5, 1, 46), std(0xf4f2ed)); platform.position.set(RAIL_X + 4.5, .5, stz); dscene.add(platform); const hall = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 22), std(0xffffff)); hall.position.set(RAIL_X + 12, 3, stz); hall.castShadow = true; dscene.add(hall); const can = new THREE.Mesh(new THREE.BoxGeometry(6.5, .35, 42), std(0xe0562a)); can.position.set(RAIL_X + 4.5, 4.8, stz); dscene.add(can); for (let k = -3; k <= 3; k++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, 3.8, 6), std(0xffffff)); c.position.set(RAIL_X + 4.5, 2.9, stz + k * 6); dscene.add(c); } box(6, 2.2, ST, RAIL_X + 22, 1.1, stz, std(0xffffff)); plane(44, ST, RAIL_X + 22, stz, .02, asphalt); }
    const TRAIN_N = 8, train = new THREE.InstancedMesh(new RoundedBoxGeometry(2.5, 3, 10, 2, .6), std(0xffffff, .4), TRAIN_N); train.castShadow = true; dscene.add(train); for (let i = 0; i < TRAIN_N; i++) train.setColorAt(i, bc.setHex(i === 0 || i === TRAIN_N - 1 ? 0xe0562a : 0xffffff)); train.instanceColor.needsUpdate = true; let trainS = 0, trainDir = 1;
    // ---- metro: elevated straight line above avenue c=AVE_C[1] on the east footpath side; station per district row
    const METRO_X = sx(AVE_C[1]) + AVE_W / 2 + 6, METRO_Y = 13;
    { const via = new THREE.Mesh(new THREE.BoxGeometry(4, 1.2, ZLEN + 160), std(0xffffff, .6)); via.position.set(METRO_X, METRO_Y - .6, Z0 - ZLEN / 2); via.castShadow = true; dscene.add(via); for (const o of [-.9, .9]) box(.16, .1, ZLEN + 160, METRO_X + o, METRO_Y + .05, Z0 - ZLEN / 2, std(0x9d978d)); const pill = new THREE.InstancedMesh(new THREE.CylinderGeometry(.7, 1, METRO_Y - 1.2, 10), std(0xf0ede6), Math.ceil((ZLEN + 160) / 14)); let n = 0; for (let z = Z0 + 80; z > Z0 - ZLEN - 80; z -= 14) { dm.position.set(METRO_X, (METRO_Y - 1.2) / 2, z); dm.rotation.set(0, 0, 0); dm.scale.set(1, 1, 1); dm.updateMatrix(); pill.setMatrixAt(n++, dm.matrix); } pill.count = n; dscene.add(pill); for (let i = 0; i < N_D; i++) { const z = DC[i].z; const s = new THREE.Mesh(new THREE.BoxGeometry(9, 3.6, 24), std(0xffffff)); s.position.set(METRO_X, METRO_Y + 1.9, z); dscene.add(s); const roof = new THREE.Mesh(new THREE.BoxGeometry(10, .35, 25), std(0xe0562a)); roof.position.set(METRO_X, METRO_Y + 3.9, z); dscene.add(roof); const stair = new THREE.Mesh(new THREE.BoxGeometry(2.4, METRO_Y, 8), std(0xf4f2ed)); stair.position.set(METRO_X + 5.5, METRO_Y / 2, z); dscene.add(stair); } }
    const METRO_N = 5, metroM = new THREE.InstancedMesh(new RoundedBoxGeometry(2.2, 2.3, 8, 2, .6), std(0xffffff, .35, .1), METRO_N * 2); dscene.add(metroM); for (let i = 0; i < METRO_N * 2; i++) metroM.setColorAt(i, bc.setHex(i % METRO_N === 0 ? 0x2a2622 : 0xffffff)); metroM.instanceColor.needsUpdate = true; const metroS = [0, .5];
    // ---- helicopters
    const HELI = [], padBusy = new Set(); { const mm = std(0x2a2622, .45, .2), gm = std(0x9fb0ba, .1, .5), rm = new THREE.MeshBasicMaterial({ color: 0x555049, transparent: true, opacity: .55 }); for (let k = 0; k < Math.min(6, Math.max(1, HP.length >> 1)); k++) { const g = new THREE.Group(); const fus = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), mm); fus.scale.set(.8, .75, 1.8); g.add(fus); const cnp = new THREE.Mesh(new THREE.SphereGeometry(.66, 16, 12), gm); cnp.position.set(0, .2, 1.1); cnp.scale.set(.9, .7, .9); g.add(cnp); const boom = new THREE.Mesh(new THREE.CylinderGeometry(.14, .28, 3.4, 8), mm); boom.rotation.x = Math.PI / 2; boom.position.set(0, .15, -3.1); g.add(boom); const fin = new THREE.Mesh(new THREE.BoxGeometry(.08, 1.2, .6), mm); fin.position.set(0, .75, -4.7); g.add(fin); const hub = new THREE.Mesh(new THREE.CylinderGeometry(.12, .16, .5, 8), mm); hub.position.y = .9; g.add(hub); const rotor = new THREE.Group(); rotor.position.y = 1.1; for (const a of [0, Math.PI / 2]) { const bl = new THREE.Mesh(new THREE.BoxGeometry(6.6, .04, .3), rm); bl.rotation.y = a; rotor.add(bl); } g.add(rotor); const tr = new THREE.Mesh(new THREE.BoxGeometry(.05, 1.3, .16), rm); tr.position.set(.18, .75, -4.75); g.add(tr); for (const s of [-.6, .6]) { const skid = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 2.8, 6), mm); skid.rotation.x = Math.PI / 2; skid.position.set(s, -.9, 0); g.add(skid); for (const zz of [-.85, .85]) { const leg = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .55, 6), mm); leg.position.set(s, -.62, zz); g.add(leg); } } dscene.add(g); const from = k % Math.max(1, HP.length); padBusy.add(from); HELI.push({ g, rotor, tr, from, to: from, s: 0, sp: rnd(.035, .05), wait: rnd(1, 3), yaw: 0 }); } }
    // ---- signage: LED display per plaza, banners on avenue lamp posts
    const mkCanvasTex = (w, hgt, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = hgt; const x = c.getContext('2d'); draw(x, w, hgt); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
    const DISPLAYS = []; const chapterTitles = (this.state.d ? this.state.d.timeline : []).map(t => [t.y, t.t]);
    PLAZA.forEach((l, k) => { const g = new THREE.Group(); g.position.set(l.x, 0, l.z - 6.5); const [yr, title] = chapterTitles[l.i] || ['', '']; const tex = mkCanvasTex(1024, 512, (x, w, hh) => { x.fillStyle = '#0f0e0c'; x.fillRect(0, 0, w, hh); x.fillStyle = '#e0562a'; x.font = '600 60px DM Sans Variable, sans-serif'; x.fillText(yr, 60, 130); x.fillStyle = '#f0efe9'; x.font = '400 88px Instrument Serif, Georgia, serif'; const words = String(title).split(' '); let line = '', yy = 260; for (const w0 of words) { const test = line + w0 + ' '; if (x.measureText(test).width > w - 120) { x.fillText(line, 60, yy); line = w0 + ' '; yy += 96; } else line = test; } x.fillText(line, 60, yy); }); const scr = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), new THREE.MeshBasicMaterial({ map: tex })); scr.position.y = 12; const frame = new THREE.Mesh(new THREE.BoxGeometry(17, 9, .6), std(0x2a2622, .6, .2)); frame.position.set(0, 12, -.35); for (const s of [-6, 6]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(.5, 7.6, .5), std(0x2a2622)); leg.position.set(s, 3.8, -.35); g.add(leg); } g.add(frame); g.add(scr); dscene.add(g); DISPLAYS.push({ g, i: l.i }); });
    { const banTex = mkCanvasTex(256, 768, (x, w, hh) => { x.fillStyle = '#e0562a'; x.fillRect(0, 0, w, hh); x.fillStyle = '#ffffff'; x.font = '600 54px DM Sans Variable, sans-serif'; x.save(); x.translate(w / 2 + 20, hh - 40); x.rotate(-Math.PI / 2); x.fillText('KISHORE.DEV', 0, 0); x.restore(); }); const banM = new THREE.MeshBasicMaterial({ map: banTex, side: THREE.DoubleSide }); const BANS = []; for (const c of AVE_C) for (let z = Z0; z > Z0 - ZLEN; z -= 36) for (const o of [-(AVE_W / 2 + 1.3), AVE_W / 2 + 1.3]) BANS.push([sx(c) + o + (o > 0 ? .6 : -.6), z, 0]); const banI = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.1, 3.3), banM, BANS.length); BANS.forEach(([x, z, yaw], k) => { dm.position.set(x, 5.4, z); dm.rotation.set(0, yaw, 0); dm.scale.set(1, 1, 1); dm.updateMatrix(); banI.setMatrixAt(k, dm.matrix); }); dscene.add(banI); }
    for (const [m, gs] of MERGE) { const merged = mergeGeometries(gs, false); gs.forEach(g => g.dispose()); const mesh = new THREE.Mesh(merged, m); mesh.receiveShadow = true; dscene.add(mesh); }
    const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(48, 48), new THREE.MeshBasicMaterial({ color: 0xfff1e4, transparent: true, opacity: .5, fog: false })); dscene.add(sunDisc);
    // ---- drone route: straight legs along avenues with 90° turns; waypoints per chapter. Route line drawn along it.
    const WP = [new THREE.Vector3(sx(AVE_C[0]), 0, Z0 + 60), new THREE.Vector3(sx(AVE_C[0]), 0, sz(AVE_R[1])), new THREE.Vector3(sx(AVE_C[1]), 0, sz(AVE_R[1])), new THREE.Vector3(sx(AVE_C[1]), 0, sz(AVE_R[2])), new THREE.Vector3(sx(AVE_C[0]), 0, sz(AVE_R[2])), new THREE.Vector3(sx(AVE_C[0]), 0, Z0 - ZLEN - 60)];
    const ROUTE = WP; const segLen = []; let routeLen = 0; for (let i = 1; i < ROUTE.length; i++) { const l = ROUTE[i].distanceTo(ROUTE[i - 1]); segLen.push(l); routeLen += l; }
    const routeAt = (u, out) => { let d = u * routeLen; for (let i = 0; i < segLen.length; i++) { if (d <= segLen[i] || i === segLen.length - 1) { const f = segLen[i] ? Math.min(1, d / segLen[i]) : 0; return out.lerpVectors(ROUTE[i], ROUTE[i + 1], f); } d -= segLen[i]; } return out.copy(ROUTE[ROUTE.length - 1]); };
    const ROUTE_N = ROUTE.length, routePos = new Float32Array(ROUTE_N * 3); ROUTE.forEach((p, i) => { routePos[i * 3] = p.x; routePos[i * 3 + 1] = .8; routePos[i * 3 + 2] = p.z; });
    const routeGeo = new THREE.BufferGeometry(); routeGeo.setAttribute('position', new THREE.BufferAttribute(routePos, 3)); dscene.add(new THREE.Line(routeGeo, new THREE.LineBasicMaterial({ color: 0xe0562a })));
    const routeDot = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 16), new THREE.MeshBasicMaterial({ color: 0xe0562a })); dscene.add(routeDot);
    const chapterU = [0]; { for (let i = 0; i < N_D; i++) { const tz = sz(DCB[i][1]) + PITCH * .5; let acc = 0, best = routeLen; for (let k = 1; k < ROUTE.length; k++) { const a = ROUTE[k - 1], b = ROUTE[k]; if (Math.abs(b.z - a.z) > 1 && ((a.z - tz) * (b.z - tz) <= 0)) { best = acc + Math.abs(a.z - tz); break; } acc += segLen[k - 1]; } chapterU.push(Math.min(1, best / routeLen)); } }
    const J = this.J = { u: .0, yaw: 0, tyaw: 0, pitch: 0, tpitch: 0, drag: false, moved: 0, lx: 0, ly: 0, wake: new Float32Array(N_D), sx: 0, sy: 0 };
    dcv.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') return; J.drag = true; J.moved = 0; J.lx = e.clientX; J.ly = e.clientY; dcv.style.cursor = 'grabbing'; dcv.setPointerCapture(e.pointerId); });
    dcv.addEventListener('pointermove', e => { if (!J.drag) return; const dx = e.clientX - J.lx, dy = e.clientY - J.ly; J.lx = e.clientX; J.ly = e.clientY; J.moved += Math.abs(dx) + Math.abs(dy); J.tyaw = Math.max(-1.3, Math.min(1.3, J.tyaw + dx * .004)); J.tpitch = Math.max(-.45, Math.min(.5, J.tpitch + dy * .003)); });
    const endDrag = () => { if (!J.drag) return; J.drag = false; dcv.style.cursor = 'grab'; if (J.moved < 6 && this._activeD >= 0) J.wake[this._activeD] = 1; };
    dcv.addEventListener('pointerup', endDrag); dcv.addEventListener('pointercancel', endDrag);
    const N_CH = N_D + 1; this._NCH = N_CH; J.grow = new Float32Array(N_D); J.ch = 0;
    const viewOf = i => { if (i === 0) return [new THREE.Vector3(sx(AVE_C[0]) - 30, 110, Z0 + 120), new THREE.Vector3(sx(AVE_C[0]), 0, Z0 - 60)]; const d = i - 1, c = DC[d], s = distSide(d); return [new THREE.Vector3(c.x - s * 55, 58 + d * 3, c.z + 110), new THREE.Vector3(c.x + s * 12, 18, c.z - 40)]; };
    this._views = Array.from({ length: N_CH }, (_, i) => viewOf(i));
    this._goCh = i => { const el = this.R('diveSec').current; if (!el) return; i = Math.max(0, Math.min(N_CH - 1, i)); const r = el.getBoundingClientRect(), top = window.scrollY + r.top; this.sc.target = top + (r.height - innerHeight) * (i / (N_CH - 1)); this._jLast = performance.now(); };
    this._jStep = dy => { const el = this.R('diveSec').current; if (!el) return false; const r = el.getBoundingClientRect(); if (r.top > 2 || r.bottom < innerHeight - 2) return false; const now = performance.now(); if (now - (this._jLast || 0) < 900) return true; const p = -r.top / (r.height - innerHeight), i = Math.round(p * (N_CH - 1)), dir = dy > 0 ? 1 : -1; if ((i === 0 && dir < 0) || (i === N_CH - 1 && dir > 0)) return false; this._goCh(i + dir); return true; };
    const back = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };

    const size = () => {
      const r = canvas.parentElement.getBoundingClientRect(); renderer.setSize(r.width, r.height, false); camera.aspect = r.width / r.height; camera.updateProjectionMatrix(); trail.width = r.width; trail.height = r.height;
      const q = dcv.parentElement.getBoundingClientRect(); drend.setSize(q.width, q.height, false); dcam.aspect = q.width / q.height; dcam.updateProjectionMatrix();
    };
    size(); window.addEventListener('resize', size);

    let t0 = performance.now(), hue = 20;
    const prog = el => { if (!el) return 0; const r = el.getBoundingClientRect(); return Math.min(1, Math.max(0, -r.top / (r.height - innerHeight))); };
    const smooth = p => p * p * (3 - 2 * p), clamp01 = x => Math.max(0, Math.min(1, x));
    const loop = now => {
      if (!this._alive) return;
      this._raf = requestAnimationFrame(loop);
      const dt = Math.min(.05, (now - t0) / 1000); t0 = now; const t = now / 1000;
      const prev = this.sc.cur;
      if (this.state.caseIdx < 0 && !this.state.menuOpen) {
        this.sc.cur += (this.sc.target - this.sc.cur) * (1 - Math.exp(-dt * (this.inJ ? 4.5 : 6.5)));
        if (Math.abs(this.sc.cur - window.scrollY) > .3) { this.sc.last = Math.round(this.sc.cur); window.scrollTo(0, this.sc.cur); }
      }
      const v = (this.sc.cur - prev) / Math.max(dt, .001); this.sc.vel += (v - this.sc.vel) * .15; const vn = Math.max(-1, Math.min(1, this.sc.vel / 2500));
      const sy = window.scrollY, H = innerHeight;
      const bar = this.R('bar').current; if (bar) bar.style.transform = `scaleX(${sy / Math.max(1, document.documentElement.scrollHeight - H)})`;
      const grid = this.R('grid').current; if (grid) grid.style.transform = `skewY(${vn * 1.8}deg)`;
      const hA = this.R('hazeA').current, hB = this.R('hazeB').current; if (hA) hA.style.top = (-10 * innerWidth / 100 - sy * .06) + 'px'; if (hB) hB.style.top = (H * .3 - sy * .03) + 'px';
      if (this._pars) for (const el of this._pars) { const r = el.parentElement.getBoundingClientRect(); if (r.bottom > 0 && r.top < H) el.style.transform = `translateY(${((r.top + r.height / 2 - H / 2) / H) * -9}%)`; }
      if (this._floats) for (const el of this._floats) { const r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > H + 200) continue; const c = (r.top + r.height / 2 - H / 2) / (H / 2); const a = clamp01(1 - Math.max(0, Math.abs(c) - .35) / .7); el.style.opacity = String(.08 + a * .92); el.style.transform = `translateY(${c * 40}px) scale(${.96 + a * .04})`; }
      if (this._tilts) for (const el of this._tilts) { const r = el.getBoundingClientRect(); if (r.bottom < 0 || r.top > H || r.right < 0 || r.left > innerWidth) continue; const inside = this.m.tx > r.left && this.m.tx < r.right && this.m.ty > r.top && this.m.ty < r.bottom; const dx = inside ? (this.m.tx - (r.left + r.width / 2)) / r.width : 0, dy = inside ? (this.m.ty - (r.top + r.height / 2)) / r.height : 0; el.style.transform = `perspective(1200px) rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg) translateY(${inside ? -6 : 0}px)`; this.animCard(el, inside, t, dt); }
      const tilt = this.R('tilt').current; if (tilt) { const r = tilt.getBoundingClientRect(); if (r.bottom > 0 && r.top < H) { const dx = (this.m.tx - (r.left + r.width / 2)) / r.width, dy = (this.m.ty - (r.top + r.height / 2)) / r.height; tilt.style.transform = `perspective(1200px) rotateY(${dx * 10}deg) rotateX(${-dy * 10}deg)`; } }

      const m = this.m; m.px = m.x; m.py = m.y; m.x += (m.tx - m.x) * .22; m.y += (m.ty - m.y) * .22;

      // hero
      const hs = this.R('heroSec').current, hr = hs && hs.getBoundingClientRect();
      if (hr && hr.bottom > 0 && hr.top < H) {
        const p = prog(hs), e = smooth(p), spread = 1 + (1 - smooth(Math.min(1, p * 1.6))) * 1.6;
        camera.position.z = 18 - e * 14;
        group.rotation.y += ((m.nx * .3 + e * 1.6) - group.rotation.y) * .06; group.rotation.x += ((m.ny * .2 - vn * .15) - group.rotation.x) * .06; group.rotation.z += (vn * .12 - group.rotation.z) * .08;
        camera.position.x += (m.nx * .7 - camera.position.x) * .05; camera.position.y += (-m.ny * .5 - camera.position.y) * .05;
        for (const it of items) { it.mesh.position.set(it.base.x * spread + Math.cos(t * .35 + it.ph) * .18, it.base.y * spread + Math.sin(t * .5 + it.ph) * .25 - vn * .6, it.base.z * spread); it.mesh.rotation.x += it.spin.x * dt; it.mesh.rotation.y += (it.spin.y + vn * 1.5) * dt; it.mesh.rotation.z += it.spin.z * dt; }
        renderer.render(scene, camera);
        const cap = this.R('heroCap').current; if (cap) { const o = p > .7 ? Math.min(1, (p - .7) / .18) : 0; cap.style.opacity = String(o); cap.style.transform = `scale(${.92 + o * .08})`; }
        tctx.globalCompositeOperation = 'destination-out'; tctx.fillStyle = 'rgba(0,0,0,.08)'; tctx.fillRect(0, 0, trail.width, trail.height); tctx.globalCompositeOperation = 'lighter';
        const pr = canvas.parentElement.getBoundingClientRect(), lx = m.x - pr.left, ly = m.y - pr.top, lpx = m.px - pr.left, lpy = m.py - pr.top;
        if (m.x > -9000 && lx > -200 && ly > -200 && lx < pr.width + 200 && ly < pr.height + 200) { const spd = Math.hypot(m.tx - m.x, m.ty - m.y); hue = (hue + 2 + spd * .1) % 360; tctx.lineCap = 'round'; tctx.lineWidth = 8 + Math.min(26, spd * .4); tctx.strokeStyle = `hsla(${hue},70%,55%,.7)`; tctx.beginPath(); tctx.moveTo(lpx, lpy); tctx.lineTo(lx, ly); tctx.stroke(); }
      }

      // chaptered city
      const ds = this.R('diveSec').current, dr = ds && ds.getBoundingClientRect();
      if (dr && dr.bottom > 0 && dr.top < H) {
        const live = dr.top <= 2; if (live) { J.clock = (J.clock || 0) + dt; } const tC = J.clock || 0; const dtC = live ? dt : 0;
        const p = live ? prog(ds) : 0, fCh = p * (N_CH - 1), ch = Math.round(fCh), local = fCh - ch; J.ch = ch;
        J.sx += (m.nx - J.sx) * .04; J.sy += (m.ny - J.sy) * .04; if (!J.drag) { J.tyaw *= 1 - dt * .9; J.tpitch *= 1 - dt * .9; } J.yaw += (J.tyaw - J.yaw) * .06; J.pitch += (J.tpitch - J.pitch) * .06;
        const [vp, vt] = this._views[ch]; { const i0 = Math.min(N_CH - 2, Math.floor(fCh)), f = fCh - i0; const target = chapterU[i0] + (chapterU[i0 + 1] - chapterU[i0]) * clamp01(f); J.ru = J.ru === undefined ? target : J.ru + (target - J.ru) * (1 - Math.exp(-dt * 4)); }
        // one continuous camera model: always on the route, always looking ahead. No separate "arrived" viewpoint, so stopping never re-frames the view.
        routeAt(J.ru, cp); routeAt(Math.min(1, J.ru + .003), tmpB); const heading = Math.atan2(tmpB.x - cp.x, tmpB.z - cp.z);
        cp.y = 60; cp.x += J.sx * 3; cp.y += -J.sy * 2 + Math.sin(t * .4) * .4; dcam.position.lerp(cp, 1 - Math.exp(-dt * 4));
        routeAt(Math.min(1, J.ru + .08), tmpB); tmpB.y = 22; tn.set(Math.cos(heading), 0, -Math.sin(heading)); tmpB.addScaledVector(tn, Math.sin(J.yaw) * 40 + J.sx * 8); tmpB.y += Math.max(-6, -J.pitch * 30 - J.sy * 3);
        J.la = J.la || tmpB.clone(); J.la.lerp(tmpB, 1 - Math.exp(-dt * 3.5));
        const dh = (((heading - (J.hPrev === undefined ? heading : J.hPrev) + Math.PI * 3) % (Math.PI * 2)) - Math.PI); J.hPrev = heading; J.bank = (J.bank || 0) + (dh * 2.5 - (J.bank || 0)) * .08; J.uRoute = J.ru;
        dcam.up.set(Math.sin(J.bank || 0), Math.cos(J.bank || 0), 0); dcam.lookAt(J.la); dcam.fov = 44 + Math.abs(vn) * 3; dcam.updateProjectionMatrix();
        sunDisc.position.copy(dcam.position).add(tmpA.set(-160, 95, -520)); sunDisc.lookAt(dcam.position);
        this._activeD = ch - 1;
        if (!J.built) { J.built = true; J.shadowAt = t + .2;
          boxes.forEach((o, k) => { const hh = o.shape === 'tiered' ? o.h * .66 : o.h; dm.position.set(o.x, hh / 2, o.z); dm.scale.set(o.w, hh, o.d); dm.rotation.set(0, 0, 0); dm.updateMatrix(); bld.setMatrixAt(k, dm.matrix); }); bld.instanceMatrix.needsUpdate = true;
          rounds.forEach((o, k) => { const dd = Math.min(o.w, o.d); if (o.shape === 'oval') { dm.position.set(o.x, o.h / 2, o.z); dm.scale.set(dd * 1.5, o.h, dd * .8); } else if (o.shape === 'drum') { dm.position.set(o.x, o.h * .72, o.z); dm.scale.set(dd * 1.5, o.h * .56, dd * 1.5); } else { dm.position.set(o.x, o.h / 2, o.z); dm.scale.set(dd, o.h, dd); } dm.rotation.set(0, 0, 0); dm.updateMatrix(); rnd_.setMatrixAt(k, dm.matrix); }); rnd_.instanceMatrix.needsUpdate = true; STEM.forEach((o, k) => { dm.position.set(o.x, o.h * .22, o.z); dm.scale.set(Math.min(o.w, o.d) * .55, o.h * .44, Math.min(o.w, o.d) * .55); dm.rotation.set(0, 0, 0); dm.updateMatrix(); stemM.setMatrixAt(k, dm.matrix); }); stemM.instanceMatrix.needsUpdate = true;
          { let a = 0, b = 0; FL.forEach(f => { const o = f.o; if (o.shape === 'round') { const dd = Math.min(o.w, o.d) * 1.06; dm.position.set(o.x, f.y, o.z); dm.scale.set(dd, 1, dd); dm.rotation.set(0, 0, 0); dm.updateMatrix(); slabR.setMatrixAt(b++, dm.matrix); } else { const tiered = o.shape === 'tiered' && f.y > o.h * .66; dm.position.set(o.x, f.y, o.z); dm.scale.set(o.w * (tiered ? .62 : 1) + .5, 1, o.d * (tiered ? .62 : 1) + .5); dm.rotation.set(0, 0, 0); dm.updateMatrix(); slabM.setMatrixAt(a++, dm.matrix); } }); slabM.count = a; slabR.count = b; slabM.instanceMatrix.needsUpdate = true; slabR.instanceMatrix.needsUpdate = true; }
          { let a = 0, b = 0; B.forEach(o => { if (o.kind !== 'tower' || !['box', 'slim', 'tiered', 'round'].includes(o.shape)) return; if (o.shape === 'round') { const dd = Math.min(o.w, o.d) * 1.01; dm.position.set(o.x, o.h / 2, o.z); dm.scale.set(dd, o.h - .6, dd); dm.updateMatrix(); glassR.setMatrixAt(b++, dm.matrix); } else { const hh = o.shape === 'tiered' ? o.h * .66 : o.h; dm.position.set(o.x, hh / 2, o.z); dm.scale.set(o.w * 1.012, hh - .6, o.d * 1.012); dm.rotation.set(0, 0, 0); dm.updateMatrix(); glassB.setMatrixAt(a++, dm.matrix); } }); glassB.count = a; glassR.count = b; glassB.instanceMatrix.needsUpdate = true; glassR.instanceMatrix.needsUpdate = true; }
          MUL.forEach((mu, k) => { dm.position.set(mu.x, mu.h / 2, mu.z); dm.scale.set(1, mu.h, 1); dm.rotation.set(0, 0, 0); dm.updateMatrix(); mulM.setMatrixAt(k, dm.matrix); }); mulM.instanceMatrix.needsUpdate = true;
          TIER.forEach((o, k) => { const base = o.h * .66; dm.position.set(o.x, base + o.h * .17, o.z); dm.scale.set(o.w * .62, o.h * .34, o.d * .62); dm.rotation.set(0, 0, 0); dm.updateMatrix(); tierM.setMatrixAt(k, dm.matrix); }); tierM.instanceMatrix.needsUpdate = true;
          SHOP.forEach((o, k) => { dm.position.set(o.x, 2.2, o.z); dm.scale.set(o.w * 1.02, 1, o.d * 1.02); dm.rotation.set(0, 0, 0); dm.updateMatrix(); shopM.setMatrixAt(k, dm.matrix); }); shopM.instanceMatrix.needsUpdate = true;
          { let a = 0; TALL.forEach(o => { if (o.shape && !['box', 'slim', 'tiered'].includes(o.shape)) return; const tiered = o.shape === 'tiered'; dm.position.set(o.x, o.h + .45, o.z); dm.scale.set(o.w * (tiered ? .62 : 1) + .3, 1, o.d * (tiered ? .62 : 1) + .3); dm.rotation.set(0, 0, 0); dm.updateMatrix(); parM.setMatrixAt(a++, dm.matrix); }); parM.count = a; parM.instanceMatrix.needsUpdate = true; }
          { let a = 0, b = 0; ROOF.forEach(r => { const o = r.o; const top = o.h + .9; if (r.kind === 'tank') { dm.position.set(o.x + r.ox, top + r.h / 2 + .4, o.z + r.oz); dm.scale.set(r.w, r.h, r.w); dm.rotation.set(0, 0, 0); dm.updateMatrix(); roofTank.setMatrixAt(b++, dm.matrix); } else { const core = r.kind === 'core'; dm.position.set(o.x + (core ? 0 : r.ox), top + (core ? 2.2 : r.h / 2), o.z + (core ? 0 : r.oz)); dm.scale.set(core ? o.w * .4 : r.w, core ? 4.4 : r.h, core ? o.d * .4 : r.d); dm.rotation.set(0, 0, 0); dm.updateMatrix(); roofBox.setMatrixAt(a++, dm.matrix); } }); roofBox.count = a; roofTank.count = b; roofBox.instanceMatrix.needsUpdate = true; roofTank.instanceMatrix.needsUpdate = true; }
          SOLAR.forEach((o, k) => { dm.position.set(o.x, o.h + 1.1, o.z); dm.scale.set(o.w * .6, 1, o.d * .6); dm.rotation.set(.12, 0, 0); dm.updateMatrix(); solarM.setMatrixAt(k, dm.matrix); }); solarM.instanceMatrix.needsUpdate = true;
          CROWN.forEach((o, k) => { const y0 = o.shape === 'tiered' ? o.h : o.h; dm.position.set(o.x, y0 + 5, o.z); dm.scale.set(1, 10, 1); dm.rotation.set(0, 0, 0); dm.updateMatrix(); crownM.setMatrixAt(k, dm.matrix); }); crownM.instanceMatrix.needsUpdate = true;
          HP.forEach((o, k) => { const y = o.h, ww = o.w * (o.shape === 'tiered' ? .62 : 1), ddp = o.d * (o.shape === 'tiered' ? .62 : 1); dm.position.set(o.x, y + .25, o.z); dm.scale.set(ww * .98, 1, ddp * .98); dm.rotation.set(0, 0, 0); dm.updateMatrix(); padDeck.setMatrixAt(k, dm.matrix); dm.position.set(o.x, y + .56, o.z); dm.scale.set(1, 1, 1); dm.updateMatrix(); pad.setMatrixAt(k, dm.matrix); dm.position.y = y + .64; dm.rotation.set(Math.PI / 2, 0, 0); dm.updateMatrix(); padRing.setMatrixAt(k, dm.matrix); dm.rotation.set(0, 0, 0); for (const s of [-.6, .6]) { dm.position.set(o.x + s, y + .66, o.z); dm.updateMatrix(); padH1.setMatrixAt(k * 2 + (s > 0 ? 1 : 0), dm.matrix); } dm.position.set(o.x, y + .66, o.z); dm.updateMatrix(); padH2.setMatrixAt(k, dm.matrix); [[ww / 2 + .9, 0], [-ww / 2 - .9, 0], [0, ddp / 2 + .9], [0, -ddp / 2 - .9]].forEach(([ox, oz], j) => { dm.position.set(o.x + ox, y + .3, o.z + oz); dm.scale.set(j < 2 ? 1.8 : ww + 1.8, 1, j < 2 ? ddp + 1.8 : 1.8); dm.updateMatrix(); net.setMatrixAt(k * 4 + j, dm.matrix); }); for (let q = 0; q < 8; q++) { const a = q / 8 * TAU; dm.position.set(o.x + Math.cos(a) * 3.9, y + .8, o.z + Math.sin(a) * 3.9); dm.scale.set(1, 1, 1); dm.updateMatrix(); padLight.setMatrixAt(k * 8 + q, dm.matrix); } }); [padDeck, pad, padRing, padH1, padH2, net, padLight].forEach(mm => mm.instanceMatrix.needsUpdate = true);
          T.forEach((o, k) => { const s = o.r; dm.position.set(o.x, 1 + s, o.z); dm.scale.set(s, s * .95, s); dm.rotation.set(0, 0, 0); dm.updateMatrix(); canopy.setMatrixAt(k, dm.matrix); dm.position.set(o.x, .6 + s * .25, o.z); dm.scale.set(1, 1.2 + s * .5, 1); dm.updateMatrix(); trunk.setMatrixAt(k, dm.matrix); }); canopy.instanceMatrix.needsUpdate = true; trunk.instanceMatrix.needsUpdate = true;
        }
        if (J.shadowAt && t > J.shadowAt) { J.shadowAt = 0; drend.shadowMap.needsUpdate = true; } if (J.chPrev !== ch) { J.chPrev = ch; J.shadowT = t + 3; } if (J.shadowT && t > J.shadowT) { J.shadowT = 0; drend.shadowMap.needsUpdate = true; }
        SIG.forEach((s, k) => { const phase = Math.floor((tC * .5 + k * .37) % 3); dm.position.set(s.x + .26 * Math.cos(s.yaw), 4.45 - (phase - 1) * .42, s.z + 3 * Math.cos(s.yaw) + .26 * Math.sin(s.yaw)); dm.rotation.set(0, 0, 0); dm.scale.set(1, 1, 1); dm.updateMatrix(); sigLamp.setMatrixAt(k, dm.matrix); }); sigLamp.instanceMatrix.needsUpdate = true;
        { routeAt(clamp01(J.uRoute || 0), tmpA); routeDot.position.set(tmpA.x, 1.6 + Math.sin(tC * 4) * .3, tmpA.z); routeDot.scale.setScalar(1 + Math.sin(tC * 4) * .2); }
        for (let k = 0; k < NCAR; k++) { const c = CARS[k], L = c.lane; const len = Math.abs(L.b - L.a); c.s += c.sp * dtC / len; if (c.s > 1) { c.s = 0; c.lane = LANES[Math.floor(Math.random() * LANES.length)]; } const pos = L.dir > 0 ? L.a + c.s * (L.b - L.a) : L.b - c.s * (L.b - L.a); const y = (L.y || 0) + c.dims[1] / 2 + .1; let px, pz, yaw; if (L.axis === 'z') { px = L.x; pz = pos; yaw = (L.b - L.a) * L.dir > 0 ? 0 : Math.PI; } else { px = pos; pz = L.z; yaw = (L.b - L.a) * L.dir > 0 ? Math.PI / 2 : -Math.PI / 2; } let yy = y; if (L.fly) { const f = L.fly; const dxa = px - f.xa, dxb = f.xb - px; if (dxa < 0) yy = Math.max(c.dims[1] / 2 + .1, y + dxa / 60 * FLY_Y); else if (dxb < 0) yy = Math.max(c.dims[1] / 2 + .1, y + dxb / 60 * FLY_Y); } dm.position.set(px, yy, pz); dm.rotation.set(0, yaw, 0); dm.scale.set(c.dims[0], c.dims[1], c.dims[2]); dm.updateMatrix(); carBody.setMatrixAt(k, dm.matrix); if (c.kind === 'car') { dm.position.y += c.dims[1] * .72; dm.scale.set(c.dims[0] * .85, c.dims[1] * .7, c.dims[2] * .5); } else dm.scale.set(.001, .001, .001); dm.updateMatrix(); carCab.setMatrixAt(k, dm.matrix); } carBody.instanceMatrix.needsUpdate = true; carCab.instanceMatrix.needsUpdate = true;
        J.pf = (J.pf || 0) ^ 1; for (let k = J.pf; k < NP; k += 2) { const p = PED[k], pdt = dtC * 2; if (p.plaza) { p.a += p.sp * pdt; dm.position.set(p.cx + Math.cos(p.a) * p.r, .78, p.cz + Math.sin(p.a) * p.r); } else { const w = p.w, len = Math.abs(w.b - w.a); p.s += p.sp * pdt / len; if (p.s > 1 || p.s < 0) { p.s = p.s > 1 ? 0 : 1; p.w = WALKS[Math.floor(Math.random() * WALKS.length)]; } const pos = w.a + p.s * (w.b - w.a); if (w.axis === 'z') dm.position.set(w.x, .78 + Math.abs(Math.sin(tC * 6 + k)) * .04, pos); else dm.position.set(pos, .78 + Math.abs(Math.sin(tC * 6 + k)) * .04, w.z); } dm.rotation.set(0, 0, 0); dm.scale.set(1, 1, 1); dm.updateMatrix(); ped.setMatrixAt(k, dm.matrix); } ped.instanceMatrix.needsUpdate = true;
        { trainS += trainDir * dtC * .028; if (trainS > 1) { trainS = 1; trainDir = -1; } if (trainS < 0) { trainS = 0; trainDir = 1; } const ease = smooth(trainS); for (let i = 0; i < TRAIN_N; i++) { const z = RAIL_A - 40 - ease * (RAIL_A - RAIL_B - 80) - i * 10.6; dm.position.set(RAIL_X, 1.95, z); dm.rotation.set(0, 0, 0); dm.scale.set(1, 1, 1); dm.updateMatrix(); train.setMatrixAt(i, dm.matrix); } train.instanceMatrix.needsUpdate = true; }
        for (let s = 0; s < 2; s++) { metroS[s] = (metroS[s] + dtC * .03 * (s ? -1 : 1) + 1) % 1; for (let i = 0; i < METRO_N; i++) { const u = (metroS[s] + (s ? 1 : -1) * i * .014 + 1) % 1; dm.position.set(METRO_X + (s ? .9 : -.9), METRO_Y + 1.2, Z0 + 60 - u * (ZLEN + 120)); dm.rotation.set(0, 0, 0); dm.scale.set(1, 1, 1); dm.updateMatrix(); metroM.setMatrixAt(s * METRO_N + i, dm.matrix); } } metroM.instanceMatrix.needsUpdate = true;
        for (const hc of HELI) { const A = HP[hc.from]; if (!A) { hc.g.visible = false; continue; } hc.g.visible = true; hc.rotor.rotation.y += dtC * 38; hc.tr.rotation.x += dtC * 60; const topY = o => o.h + 1.2 + .95; if (hc.wait > 0) { hc.wait -= dtC; hc.g.position.set(A.x, topY(A), A.z); hc.g.rotation.set(0, hc.yaw, 0); if (hc.wait <= 0) { let tries = 0, nx = hc.from; while (tries++ < 12) { const cand = Math.floor(Math.random() * HP.length); if (cand !== hc.from && !padBusy.has(cand)) { nx = cand; break; } } if (nx === hc.from) { hc.wait = 1; continue; } padBusy.add(nx); hc.to = nx; hc.s = 0; } continue; } const Bp = HP[hc.to]; hc.s += dtC * hc.sp; const s = smooth(clamp01(hc.s)); const lift = Math.sin(s * Math.PI) * 26; const x = A.x + (Bp.x - A.x) * s, y = topY(A) + (topY(Bp) - topY(A)) * s + lift, z = A.z + (Bp.z - A.z) * s; const tyaw = Math.atan2(Bp.x - A.x, Bp.z - A.z); hc.yaw += (((tyaw - hc.yaw + Math.PI * 3) % (Math.PI * 2)) - Math.PI) * Math.min(1, dtC * 2); hc.g.position.set(x, y, z); const pitch = -Math.cos(s * Math.PI) * .16; hc.g.rotation.set(pitch, hc.yaw, 0); if (hc.s >= 1) { padBusy.delete(hc.from); hc.from = hc.to; hc.wait = rnd(2, 5); } }
        if (this._crane) this._crane.rotation.y = Math.sin(tC * .12) * .9; if (specMeshes.twist) { specMeshes.twist.rotation.y = 0; }
        DISPLAYS.forEach(d => { tmpA.set(dcam.position.x, 12, dcam.position.z); d.g.lookAt(tmpA); });
        drend.render(dscene, dcam);
        const yrs = this._yrs; if (yrs) for (const el of yrs) { const key = el.getAttribute('data-yr'), k = key === 'open' ? 0 : +key + 1; const o = k === ch ? clamp01(1 - (Math.abs(local) - .18) / .22) : 0; el.style.opacity = String(o); el.style.transform = `translateY(calc(-50% + ${(1 - o) * 26 * (local > 0 ? -1 : 1)}px))`; }
        const railEl = this.R('rail').current; if (railEl) Array.from(railEl.children).forEach((el, k) => { el.style.color = k === ch ? '#0f0e0c' : k < ch ? '#8a857c' : '#b3aea5'; const tk = el.querySelector('[data-tick]'); if (tk) tk.style.width = k === ch ? '44px' : '18px'; });
        const ctr = this.R('counter').current; if (ctr) ctr.textContent = String(ch + 1).padStart(2, '0') + ' / ' + String(N_CH).padStart(2, '0');
      }

      // method horizontal
      const ms = this.R('methSec').current, tr = this.R('track').current;
      if (ms && tr) { const r = ms.getBoundingClientRect(); if (r.bottom > 0 && r.top < H) { const p = prog(ms); tr.style.transform = `translateX(${-p * (tr.scrollWidth - innerWidth + innerWidth * .045)}px)`; } }
    };
    this._raf = requestAnimationFrame(loop);
  }

  animCard(el, inside, t, dt) {
    const q = s => el.querySelector('[data-v="' + s + '"]'), qa = s => el.querySelectorAll('[data-v="' + s + '"]'), type = el.getAttribute('data-card'), r = el.getBoundingClientRect(), mx = (this.m.tx - r.left) / r.width - .5, my = (this.m.ty - r.top) / r.height - .5;
    if (type === 'observe') { const p = q('pupil'), l = q('lid'); if (p) p.style.transform = `translate(${(inside ? mx : Math.sin(t) * .3) * 60}px,${(inside ? my : Math.cos(t * .7) * .3) * 22}px)`; if (l) l.style.transform = `scaleY(${(t % 4) > 3.8 ? 1 : 0})`; }
    else if (type === 'reproduce') { const a = q('a'), b = q('b'); const f = x => `rotate(${Math.sin(x) * 40}deg) scale(${1 + Math.sin(x * 2) * .12})`; if (a) a.style.transform = f(t * 1.6); if (b) b.style.transform = f(t * 1.6 - .8); }
    else if (type === 'investigate') { const lens = q('lens'), bars = qa('bar'); const W = r.width - 64 - 92, x = (Math.sin(t * .9) * .5 + .5) * W; if (lens) lens.style.transform = `translate(${inside ? (mx + .5) * W : x}px,${inside ? Math.max(0, my * 60) : 20 + Math.sin(t * 1.8) * 16}px)`; const cx = (inside ? (mx + .5) * W : x) + 46; bars.forEach((b, i) => { const bx = 24 + i * ((r.width - 48) / bars.length) - 24 + 10; const hot = Math.abs(bx - cx) < 34; b.style.background = hot ? '#e0562a' : '#c9c5ba'; }); }
    else if (type === 'hypothesise') { const dots = qa('dot'), line = q('line'); const a = inside ? 1 : (Math.sin(t * .8) * .5 + .5); dots.forEach((d, i) => { const sx = 40 + i * ((r.width - 64 - 100) / 6) + Math.sin(i * 3.1) * 30, sy = 40 + ((i * 53) % 110); const fx = 36 + i * ((r.width - 64 - 88) / 6), fy = 92; d.style.transform = `translate(${sx + (fx - sx) * a}px,${sy + (fy - sy) * a}px)`; }); if (line) line.style.transform = `scaleX(${Math.max(0, a - .6) / .4})`; }
    else if (type === 'test') { const on = inside ? (Math.floor(t * 1.2) % 2 === 0) : (Math.floor(t * .6) % 2 === 0), k = q('knob'), tr = q('track'), lb = q('label'); if (k) { k.style.transform = `translateX(${on ? 106 : 0}px)`; k.textContent = on ? '✓' : '✕'; } if (tr) tr.style.background = on ? '#e0562a' : '#0f0e0c'; if (lb) lb.textContent = on ? 'HYPOTHESIS · PROVEN' : 'HYPOTHESIS · KILLED'; }
    else if (type === 'change') { const ph = (t * (inside ? 1.4 : .6)) % 3, o = q('old'), ns = q('new'), rp = q('ripple'); const olds = qa('old')[2]; const y = ph < 1 ? 0 : ph < 1.5 ? -(ph - 1) * 2 * 110 : -110; if (olds) olds.style.transform = `translateY(${y}%)`; if (ns) ns.style.transform = `translateY(${110 + y}%)`; if (rp) { const rr = ph > 1.5 ? Math.min(1, (ph - 1.5) / 1) : 0; rp.style.opacity = String(rr ? 1 - rr : 0); rp.style.transform = `scale(${1 + rr * 5})`; } }
    else if (type === 'verify') { const ring = q('ring'), pct = q('pct'), ck = q('check'); const p = Math.min(1, ((t * (inside ? .5 : .25)) % 1.4)); if (ring) ring.style.background = `conic-gradient(${p >= 1 ? '#e0562a' : '#0f0e0c'} ${p * 100}%,#dedbd2 0)`; if (pct) pct.textContent = p >= 1 ? 'VERIFIED · UAT + PROD' : Math.round(p * 100) + '%'; if (ck) ck.style.opacity = String(p >= 1 ? 1 : .12); }
    else if (type === 'ai') { const ph = (t * (inside ? 1.3 : .7)) % 6; const w = (a, b) => Math.max(0, Math.min(1, (ph - a) / (b - a))) * 100 + '%'; const l2 = q('l2'), l3 = q('l3'), l4 = q('l4'), cur = q('cur'); if (l2) l2.style.width = w(1, 1.8); if (l3) l3.style.width = w(2, 2.8); if (l4) l4.style.width = w(3.2, 4.4); if (cur) cur.style.opacity = String(Math.floor(t * 3) % 2); }
  }
  openCase(i, push = true) { if (push) history.pushState(null, '', '/work/' + this.state.d.projects[i].slug); this.setState({ caseIdx: i }, () => { const c = this.R('case').current; if (c) c.scrollTop = 0; const im = this.R('caseImg').current; if (im) im.style.backgroundImage = `url(${this.state.d.projects[i].img})`; const close = c && c.querySelector('[role="button"]'); if (close) close.focus({ preventScroll: true }); }); }
  closeCase() { history.pushState(null, '', '/'); this.setState({ caseIdx: -1 }); }

  renderVals() {
    const s = this.state, d = s.d, W = str => str.split(' ').map(t => ({ t }));
    const P = d ? d.projects : [], cs0 = P[s.caseIdx >= 0 ? s.caseIdx : 0];
    const cs = cs0 ? { ...cs0, built: cs0.built.map((t, i) => ({ n: i + 1, t })), results: cs0.results.map(([v, l]) => ({ v, l })), nextName: P[(s.caseIdx + 1) % P.length].name } : {};
    const spans = ['7', '5', '5', '7', '6', '6', '5', '7', '7', '5'], ratios = ['3/2', '4/3', '4/3', '3/2', '4/3', '4/3', '4/3', '3/2', '3/2', '4/3'];
    const kSpan = ['3', '3', '4', '2', '6'], kRatio = ['4/3', '4/3', '16/9', '3/4', '21/9'], kOff = ['0', '8vh', '0', '6vh', '0'];
    return {
      loaderOn: s.phase !== 'ready', topT: s.phase === 'exit' ? 'translateY(-101%)' : 'translateY(0)', botT: s.phase === 'exit' ? 'translateY(101%)' : 'translateY(0)', loaderTextO: s.phase === 'exit' ? '0' : '1',
      count: s.count, word: s.word, time: s.time, menuOpen: s.menuOpen, menuLabel: s.menuOpen ? 'Close' : 'Menu',
      toggleMenu: () => this.setState(x => ({ menuOpen: !x.menuOpen })),
      toTop: () => { this.sc.target = 0; },
      caseOpen: s.caseIdx >= 0 && !!d, cs, closeCase: () => this.closeCase(), nextCase: () => this.openCase((s.caseIdx + 1) % P.length),
      glRef: this.R('gl'), trailRef: this.R('trail'), heroSecRef: this.R('heroSec'), heroCapRef: this.R('heroCap'), gridRef: this.R('grid'), caseRef: this.R('case'), caseImgRef: this.R('caseImg'), barRef: this.R('bar'),
      diveSecRef: this.R('diveSec'), diveGlRef: this.R('diveGl'), diveDotsRef: this.R('diveDots'), diveHintRef: this.R('diveHint'), railRef: this.R('rail'), counterRef: this.R('counter'), goOpen: () => this._goCh && this._goCh(0), prevChapter: () => this._goCh && this._goCh((this.J ? this.J.ch : 0) - 1), nextChapter: () => this._goCh && this._goCh((this.J ? this.J.ch : 0) + 1), methSecRef: this.R('methSec'), trackRef: this.R('track'), tiltRef: this.R('tilt'), hazeARef: this.R('hazeA'), hazeBRef: this.R('hazeB'),
      wIntro: W('Frontend engineer. Angular, TypeScript, secure delivery.'), wStatement: W('Built to ship, index and pass review.'), wWork: W('Selected work.'), wStack: W('Tools in production use.'), wLikes: W('Off the clock.'), wContact: W('Start a conversation.'),
      projects: P.map((p, i) => ({ ...p, href: '/work/' + p.slug, open: e => { if (e && (e.metaKey || e.ctrlKey)) return; if (e) e.preventDefault(); this.openCase(i); }, span: spans[i], ratio: ratios[i], offset: i % 2 ? '10vh' : '0' })),
      contributed: d ? d.contributed.map(([name, share, desc]) => ({ name, share, desc })) : [],
      timeline: d ? d.timeline.map((y, i) => ({ ...y, chips: (y.tags || []).map(t => ({ t })), go: () => this._goCh && this._goCh(i + 1), short: (y.k || '').split('·').pop().trim() })) : [],
      stacks: d ? d.stacks.map(([name, items]) => ({ name, items: items.map(t => ({ t })) })) : [],
      method: d ? d.method.map(([name, desc], i) => ({ n: i + 1, name, desc })) : [],
      traits: d ? d.traits.map(([name, desc]) => ({ name, desc })) : [],
      interests: d ? d.interests.map((k, i) => ({ ...k, span: kSpan[i], ratio: kRatio[i], offset: kOff[i] })) : [],
    };
  }

  render() { return <PageMarkup v={this.renderVals()} />; }
}
