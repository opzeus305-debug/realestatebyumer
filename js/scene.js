/* Hero set-piece: THE SPIRE PRISM — ported from prototype/crystal.html.
   Art direction and scene by Fable 5.1 (DIRECTION.md §6.1). ES module. */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/* ───────────────────────── params & flags ───────────────────────── */
const q = new URLSearchParams(location.search);
const STILL = q.get('still') === '1';
const STILL_T = parseFloat(q.get('t') ?? '5.2');
const EXPOSURE = parseFloat(q.get('exposure') ?? '1.08');
const LOCK_TIER = (q.get('tier') || '').toUpperCase();
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let motion = !reduced && !STILL;          // idle rotation, parallax, sweep, dust
let tier = LOCK_TIER || 'A';

/* palette in linear-workflow THREE.Color (hex are sRGB; three converts) */
const C = {
  night0: 0x05060A, night1: 0x0A0B12, night2: 0x10121B,
  ch50: 0xFBF7F0, ch100: 0xF4EADD, ch200: 0xEAD2AE, ch300: 0xDEC6A2, ch400: 0xD9B484, ch500: 0xC6A06C, ch600: 0xA8834F,
  dusk: 0x2B2F4A, mauve: 0x5A4356, rim: 0x6E7BB0,
};
const col = (hex, k = 1) => new THREE.Color(hex).multiplyScalar(k);

/* ───────────────────────── renderer ─────────────────────────────── */
const mount = document.getElementById('scene');
if (!mount) throw new Error('no #scene mount');
const canvas = document.createElement('canvas');
canvas.setAttribute('aria-hidden', 'true');
mount.appendChild(canvas);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance', stencil: false });
renderer.toneMapping = THREE.NoToneMapping;        // we tone-map ourselves in the composite pass
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.setClearColor(C.night0, 1);
if ('transmissionResolutionScale' in renderer) renderer.transmissionResolutionScale = 0.8;

const DPR = () => Math.min(devicePixelRatio || 1, tier === 'A' ? 1.5 : 1);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
const camBase = new THREE.Vector3(0, 1.9, 11.2);
const camLook = new THREE.Vector3(0, 3.35, 0);

/* ───────────────────────── environment: procedural studio (§6 common law) ── */
function buildEnvironment() {
  const studio = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.SphereGeometry(40, 24, 16), new THREE.MeshBasicMaterial({ color: col(C.night1, 0.35), side: THREE.BackSide }));
  studio.add(room);
  const panel = (w, h, color, k, pos, look = new THREE.Vector3(0, 2, 0)) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col(color, k), side: THREE.DoubleSide }));
    m.position.copy(pos); m.lookAt(look); studio.add(m); return m;
  };
  panel(7, 3.4, C.ch200, 7.0, new THREE.Vector3(-7, 8.5, 4.5));        // KEY — warm champagne softbox, upper-left
  panel(1.2, 9, C.rim, 3.2, new THREE.Vector3(7.5, 4, -6));           // RIM — cool indigo strip, behind-right
  panel(26, 0.7, C.ch500, 1.4, new THREE.Vector3(0, 0.6, -14));       // HORIZON — faint warm band
  panel(2, 2, C.ch50, 1.2, new THREE.Vector3(1, 12, 1));              // TOP — small white fill for the spire tip
  panel(3, 1.2, C.mauve, 0.8, new THREE.Vector3(10, 1.5, 6));         // a whisper of dusk mauve, low right
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(studio, 0.035).texture;
  pmrem.dispose();
  return env;
}
scene.environment = buildEnvironment();
if ('environmentIntensity' in scene) scene.environmentIntensity = 1.0;

/* ───────────────────────── geometry: the logo's massing as faceted prisms ── */
/* Each shaft: an n-gon cross-section (slightly irregular but identical for every ring, so every
   side facet is a planar trapezoid), a stack of tiers stepping inward (setbacks) joined by short
   chamfers, a flat top cap. The tallest shaft carries the needle spire. Non-indexed → flat facets. */
const positions = [];
function ringPts(n, r, y, theta0, sx, sz, jit) {
  const pts = [];
  for (let k = 0; k < n; k++) {
    const a = theta0 + (k / n) * Math.PI * 2 + jit[k];
    pts.push(new THREE.Vector3(Math.cos(a) * r * sx, y, Math.sin(a) * r * sz));
  }
  return pts;
}
function tri(a, b, c) { positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z); }
const _ab = new THREE.Vector3(), _ac = new THREE.Vector3(), _n = new THREE.Vector3(), _out = new THREE.Vector3();
function quadOut(a, b, c, d, axis) {         // a,b on lower ring; c,d on upper ring (same k order)
  const cx = (a.x + b.x + c.x + d.x) / 4, cy = (a.y + b.y + c.y + d.y) / 4, cz = (a.z + b.z + c.z + d.z) / 4;
  _out.set(cx - axis.x, 0, cz - axis.z);
  _ab.subVectors(b, a); _ac.subVectors(c, a); _n.crossVectors(_ab, _ac);
  if (_n.dot(_out) >= 0) { tri(a, b, c); tri(a, c, d); } else { tri(a, c, b); tri(a, d, c); }
}
function capUp(ring, axisY) {
  const cx = ring.reduce((s, p) => s + p.x, 0) / ring.length, cz = ring.reduce((s, p) => s + p.z, 0) / ring.length;
  const c = new THREE.Vector3(cx, ring[0].y, cz);
  for (let k = 0; k < ring.length; k++) {
    const a = ring[k], b = ring[(k + 1) % ring.length];
    _ab.subVectors(a, c); _ac.subVectors(b, c); _n.crossVectors(_ab, _ac);
    if (_n.y >= 0) tri(c, a, b); else tri(c, b, a);
  }
}
function shaft({ x, z, n, theta0, sx, sz, tiers, spire, seed }) {
  // deterministic angular jitter so facets differ shaft to shaft but rings stay planar
  const jit = []; let s = seed;
  for (let k = 0; k < n; k++) { s = (s * 9301 + 49297) % 233280; jit.push(((s / 233280) - 0.5) * (Math.PI * 2 / n) * 0.34); }
  const axis = new THREE.Vector3(x, 0, z);
  let y = -0.6;                                   // start below the floor so the base is grounded
  let prev = ringPts(n, tiers[0].r, y, theta0, sx, sz, jit).map(p => p.add(axis));
  const CH = 0.14;                                // chamfer height between setbacks
  tiers.forEach((t, i) => {
    const rTop = t.r * 0.965;                     // slight taper within each tier
    const top = ringPts(n, rTop, y + t.h, theta0, sx, sz, jit).map(p => p.add(axis));
    for (let k = 0; k < n; k++) quadOut(prev[k], prev[(k + 1) % n], top[(k + 1) % n], top[k], axis);
    y += t.h; prev = top;
    const next = tiers[i + 1];
    if (next) {                                   // chamfer down to the next tier radius
      const ring2 = ringPts(n, next.r, y + CH, theta0, sx, sz, jit).map(p => p.add(axis));
      for (let k = 0; k < n; k++) quadOut(prev[k], prev[(k + 1) % n], ring2[(k + 1) % n], ring2[k], axis);
      y += CH; prev = ring2;
    }
  });
  if (spire) {                                    // needle: long tapered prism, then a tiny cap
    const base = ringPts(n, spire.r0, y, theta0, sx, sz, jit).map(p => p.add(axis));
    // small flat shoulder from the last tier to the spire base
    for (let k = 0; k < n; k++) quadOut(prev[k], prev[(k + 1) % n], base[(k + 1) % n], base[k], axis);
    capUp(prev.map((p, k) => p), y); // shoulder cap ring (overdrawn by spire base; harmless)
    const tip = ringPts(n, spire.r1, y + spire.h, theta0, sx, sz, jit).map(p => p.add(axis));
    for (let k = 0; k < n; k++) quadOut(base[k], base[(k + 1) % n], tip[(k + 1) % n], tip[k], axis);
    capUp(tip, y + spire.h);
    return { top: y + spire.h, axis, tiers, y };
  }
  capUp(prev, y);
  return { top: y, axis, tiers, y };
}

// U · M · E · R — heights and setbacks proportioned from the logo (spire ≈ 1/3 of the total height)
const shafts = [
  shaft({ x: -1.62, z: 0.35, n: 6, theta0: 0.3, sx: 1.0, sz: 0.78, seed: 11, tiers: [{ h: 2.35, r: 0.60 }, { h: 0.70, r: 0.44 }, { h: 0.34, r: 0.30 }] }),
  shaft({ x: -0.42, z: -0.05, n: 8, theta0: 0.1, sx: 1.0, sz: 0.86, seed: 23, tiers: [{ h: 2.85, r: 0.74 }, { h: 1.25, r: 0.58 }, { h: 0.85, r: 0.44 }, { h: 0.55, r: 0.30 }], spire: { r0: 0.12, r1: 0.035, h: 2.55 } }),
  shaft({ x: 0.72, z: -0.40, n: 7, theta0: 0.6, sx: 0.92, sz: 1.0, seed: 37, tiers: [{ h: 2.55, r: 0.54 }, { h: 0.95, r: 0.40 }, { h: 0.45, r: 0.27 }] }),
  shaft({ x: 1.70, z: 0.25, n: 5, theta0: 0.9, sx: 1.0, sz: 0.9, seed: 51, tiers: [{ h: 1.95, r: 0.52 }, { h: 0.65, r: 0.36 }, { h: 0.30, r: 0.24 }] }),
];
const crystalGeo = new THREE.BufferGeometry();
crystalGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
crystalGeo.computeVertexNormals();               // non-indexed → one normal per facet
crystalGeo.computeBoundingBox();

/* ───────────────────────── materials ────────────────────────────── */
const glass = new THREE.MeshPhysicalMaterial({
  color: col(C.ch100, 1.0),
  roughness: 0.07, metalness: 0.0,
  transmission: 1.0, ior: 2.05, thickness: 1.6,
  attenuationColor: new THREE.Color(C.ch200), attenuationDistance: 3.2,
  specularIntensity: 1.0, specularColor: new THREE.Color(C.ch50),
  clearcoat: 1.0, clearcoatRoughness: 0.08,
  iridescence: 0.18, iridescenceIOR: 1.6, iridescenceThicknessRange: [120, 380],
  envMapIntensity: 1.15, side: THREE.FrontSide,
});
if ('dispersion' in glass) glass.dispersion = 0.42;   // chromatic splitting at facet edges (three ≥ r163)

/* facet sparkle: an additive overlay whose light direction sweeps in world space, so specular
   flashes travel across the facets one at a time — the "light breaking" the brief asks for */
const sparkle = new THREE.ShaderMaterial({
  transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true,
  uniforms: {
    uL1: { value: new THREE.Vector3(-0.6, 0.6, 0.5).normalize() },
    uL2: { value: new THREE.Vector3(0.7, 0.2, -0.6).normalize() },
    uWarm: { value: col(C.ch200, 1) }, uCool: { value: col(C.rim, 1) }, uGain: { value: 1.0 },
  },
  vertexShader: `
    varying vec3 vN; varying vec3 vW;
    void main(){ vN = normalize(mat3(modelMatrix) * normal); vec4 wp = modelMatrix * vec4(position,1.0); vW = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`,
  fragmentShader: `
    uniform vec3 uL1, uL2, uWarm, uCool; uniform float uGain; varying vec3 vN; varying vec3 vW;
    void main(){
      vec3 N = normalize(vN); vec3 V = normalize(cameraPosition - vW);
      float fres = pow(1.0 - clamp(dot(N,V),0.0,1.0), 3.5);
      vec3 H1 = normalize(uL1 + V); float s1 = pow(max(dot(N,H1),0.0), 320.0);
      vec3 H2 = normalize(uL2 + V); float s2 = pow(max(dot(N,H2),0.0), 180.0);
      vec3 c = uWarm * (s1 * 3.2) + uCool * (s2 * 0.9) + uWarm * fres * 0.22;
      gl_FragColor = vec4(c * uGain, 1.0);
    }`,
});

/* ───────────────────────── the object ───────────────────────────── */
const group = new THREE.Group();
scene.add(group);
const crystal = new THREE.Mesh(crystalGeo, glass);
crystal.renderOrder = 1;
group.add(crystal);
const sparkleMesh = new THREE.Mesh(crystalGeo, sparkle);
sparkleMesh.renderOrder = 3;
group.add(sparkleMesh);

/* internal light: strands along each shaft's axis + floor slabs in the two tallest — opaque emissive
   objects render into the transmission pass, so they are refracted/dispersed through the facets and
   the crystal reads as a lit tower at night */
const inner = new THREE.Group(); group.add(inner);
const slabMats = [];
shafts.forEach((s, i) => {
  const h = s.top - (-0.6);
  const strandH = (s.tiers.reduce((a, t) => a + t.h, 0)) * 0.92;
  const strand = new THREE.Mesh(new THREE.BoxGeometry(0.028, strandH, 0.028), new THREE.MeshBasicMaterial({ color: col(C.ch100, i === 1 ? 5.5 : 3.6) }));
  strand.position.set(s.axis.x, -0.6 + strandH / 2 + 0.05, s.axis.z);
  inner.add(strand);
  if (i === 1) {                                     // the spire light: a thinner, brighter needle
    const sp = new THREE.Mesh(new THREE.BoxGeometry(0.014, 2.2, 0.014), new THREE.MeshBasicMaterial({ color: col(C.ch50, 7.0) }));
    sp.position.set(s.axis.x, s.top - 1.25, s.axis.z); inner.add(sp);
  }
  // floor slabs
  const slabCount = i === 1 ? 13 : i === 2 ? 9 : i === 0 ? 8 : 6;
  const r0 = s.tiers[0].r * 0.62;
  for (let k = 0; k < slabCount; k++) {
    const y = -0.2 + k * 0.30;
    const tierH = s.tiers.reduce((a, t) => a + t.h, 0);
    if (y > tierH - 0.75) break;
    const m = new THREE.MeshBasicMaterial({ color: col(C.ch200, 1.0) });
    m.userData = { base: 0.55 + 0.9 * Math.abs(Math.sin(k * 1.7 + i)), phase: k * 0.9 + i * 2.3 };
    slabMats.push(m);
    const slab = new THREE.Mesh(new THREE.CylinderGeometry(r0 * (1 - k / (slabCount * 1.8)), r0 * (1 - k / (slabCount * 1.8)), 0.018, 6), m);
    slab.position.set(s.axis.x, y, s.axis.z);
    inner.add(slab);
  }
});

/* ───────────────────────── floor + reflection ───────────────────── */
const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshPhysicalMaterial({
  color: col(C.night0, 1), roughness: 0.42, metalness: 0.0, clearcoat: 0.7, clearcoatRoughness: 0.45,
  transparent: true, opacity: 0.92, envMapIntensity: 0.35,
}));
floor.rotation.x = -Math.PI / 2; floor.position.y = -0.001; floor.renderOrder = 2;
scene.add(floor);
// mirrored ghost of the crystal + its lights below the floor (cheap stand-in for a planar reflector)
const mirror = new THREE.Group(); mirror.scale.y = -1; group.add(mirror);
const ghostMat = new THREE.MeshPhysicalMaterial({ color: col(C.night2, 1), roughness: 0.14, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.1, transparent: true, opacity: 0.55, envMapIntensity: 0.9 });
mirror.add(new THREE.Mesh(crystalGeo, ghostMat));
const innerGhost = inner.clone(true);
innerGhost.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.color.multiplyScalar(0.45); } });
mirror.add(innerGhost);

/* ───────────────────────── background light: horizon band + dusk haze (refracted through the glass) ── */
function gradientTexture(w, h, paint) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); paint(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const horizonTex = gradientTexture(512, 128, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(234,210,174,0)'); gr.addColorStop(0.5, 'rgba(234,210,174,1)'); gr.addColorStop(1, 'rgba(234,210,174,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const gx = g.createLinearGradient(0, 0, w, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(0.5, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)');
  g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, w, h);
});
const horizon = new THREE.Mesh(new THREE.PlaneGeometry(30, 0.62), new THREE.MeshBasicMaterial({ map: horizonTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, color: col(C.ch400, 0.30) }));
horizon.position.set(0.5, 0.34, -9); scene.add(horizon);
const hazeTex = gradientTexture(256, 256, (g, w, h) => {
  const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(58,52,78,0.20)'); gr.addColorStop(0.45, 'rgba(30,34,56,0.13)'); gr.addColorStop(1, 'rgba(20,23,40,0)');
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
});
const haze = new THREE.Mesh(new THREE.PlaneGeometry(30, 18), new THREE.MeshBasicMaterial({ map: hazeTex, transparent: true, depthWrite: false }));
haze.position.set(1.5, 3.0, -12); scene.add(haze);

/* ───────────────────────── dust in the light ────────────────────── */
const DUST_N = 520;
const dustGeo = new THREE.BufferGeometry();
const dustPos = new Float32Array(DUST_N * 3), dustSeed = new Float32Array(DUST_N);
for (let i = 0; i < DUST_N; i++) { dustPos[i * 3] = (Math.random() - 0.5) * 9; dustPos[i * 3 + 1] = Math.random() * 8.5 - 0.5; dustPos[i * 3 + 2] = (Math.random() - 0.5) * 6; dustSeed[i] = Math.random(); }
dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
const dustTex = gradientTexture(64, 64, (g, w, h) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.35)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({ map: dustTex, color: col(C.ch200, 1), size: 0.055, sizeAttenuation: true, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending }));
scene.add(dust);

/* ───────────────────────── post: bloom + composite (no addons; cdnjs carries core only) ── */
const RT = (w, h, samples = 0, depth = true) => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, depthBuffer: depth, samples, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
let rtScene, rtHalfA, rtHalfB, rtQuartA, rtQuartB;
const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
const quadScene = new THREE.Scene();
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null);
quad.frustumCulled = false; quadScene.add(quad);
const VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const brightMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { tDiffuse: { value: null }, uThreshold: { value: 0.78 }, uKnee: { value: 0.32 } }, vertexShader: VS, fragmentShader: `
  uniform sampler2D tDiffuse; uniform float uThreshold, uKnee; varying vec2 vUv;
  void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb; float l = dot(c, vec3(0.2126,0.7152,0.0722));
    float w = smoothstep(uThreshold - uKnee, uThreshold + uKnee, l); gl_FragColor = vec4(c * w, 1.0); }` });
const blurMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { tDiffuse: { value: null }, uDir: { value: new THREE.Vector2(1, 0) }, uTexel: { value: new THREE.Vector2() } }, vertexShader: VS, fragmentShader: `
  uniform sampler2D tDiffuse; uniform vec2 uDir, uTexel; varying vec2 vUv;
  void main(){ vec2 o1 = uDir * uTexel * 1.3846153846, o2 = uDir * uTexel * 3.2307692308;
    vec4 c = texture2D(tDiffuse, vUv) * 0.2270270270;
    c += (texture2D(tDiffuse, vUv + o1) + texture2D(tDiffuse, vUv - o1)) * 0.3162162162;
    c += (texture2D(tDiffuse, vUv + o2) + texture2D(tDiffuse, vUv - o2)) * 0.0702702703;
    gl_FragColor = c; }` });
const compMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: {
    tScene: { value: null }, tBloomA: { value: null }, tBloomB: { value: null },
    uBloom: { value: 0.62 }, uExposure: { value: EXPOSURE }, uTime: { value: 0 }, uGrain: { value: 0.0 }, uVignette: { value: 0.55 }, uAberration: { value: 0.0015 }, uRes: { value: new THREE.Vector2() },
  }, vertexShader: VS, fragmentShader: `
  uniform sampler2D tScene, tBloomA, tBloomB; uniform float uBloom, uExposure, uTime, uGrain, uVignette, uAberration; uniform vec2 uRes; varying vec2 vUv;
  vec3 RRTAndODTFit(vec3 v){ vec3 a = v * (v + 0.0245786) - 0.000090537; vec3 b = v * (0.983729 * v + 0.4329510) + 0.238081; return a / b; }
  vec3 aces(vec3 c){
    const mat3 IN = mat3(0.59719,0.07600,0.02840, 0.35458,0.90834,0.13383, 0.04823,0.01566,0.83777);
    const mat3 OUT = mat3(1.60475,-0.10208,-0.00327, -0.53108,1.10813,-0.07276, -0.07367,-0.00605,1.07602);
    c = IN * c; c = RRTAndODTFit(c); c = OUT * c; return clamp(c, 0.0, 1.0); }
  vec3 toSRGB(vec3 c){ return mix(12.92 * c, 1.055 * pow(c, vec3(1.0/2.4)) - 0.055, step(vec3(0.0031308), c)); }
  float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
  void main(){
    vec2 d = vUv - 0.5; float r2 = dot(d, d);
    vec2 off = d * r2 * uAberration;                              // chromatic aberration only toward the edges
    vec3 c; c.r = texture2D(tScene, vUv + off).r; c.g = texture2D(tScene, vUv).g; c.b = texture2D(tScene, vUv - off).b;
    vec3 bloom = texture2D(tBloomA, vUv).rgb * 0.55 + texture2D(tBloomB, vUv).rgb * 0.95;
    c += bloom * uBloom;
    c *= uExposure / 0.6; c = aces(c);
    float v = smoothstep(0.30, 1.05, length(d * vec2(1.0, 0.92)) * 1.35);
    c *= 1.0 - uVignette * v;
    float n = hash(vUv * uRes + fract(uTime * 0.37) * 100.0) - 0.5;
    c += n * uGrain * (0.35 + 0.65 * (1.0 - c.g));                // grain sits in the shadows, not the highlights
    gl_FragColor = vec4(toSRGB(clamp(c, 0.0, 1.0)), 1.0); }` });

function setupTargets() {
  const w = Math.max(2, Math.floor(innerWidth * DPR())), h = Math.max(2, Math.floor(innerHeight * DPR()));
  [rtScene, rtHalfA, rtHalfB, rtQuartA, rtQuartB].forEach(t => t && t.dispose());
  rtScene = RT(w, h, tier === 'A' ? 4 : 0, true);
  rtHalfA = RT(w >> 1, h >> 1, 0, false); rtHalfB = RT(w >> 1, h >> 1, 0, false);
  rtQuartA = RT(w >> 2, h >> 2, 0, false); rtQuartB = RT(w >> 2, h >> 2, 0, false);
  compMat.uniforms.uRes.value.set(w, h);
}
function pass(mat, target) { quad.material = mat; renderer.setRenderTarget(target); renderer.render(quadScene, quadCam); }
function blur(src, tmp, radius) {
  const w = src.width, h = src.height;
  blurMat.uniforms.uTexel.value.set(radius / w, radius / h);
  blurMat.uniforms.tDiffuse.value = src.texture; blurMat.uniforms.uDir.value.set(1, 0); pass(blurMat, tmp);
  blurMat.uniforms.tDiffuse.value = tmp.texture; blurMat.uniforms.uDir.value.set(0, 1); pass(blurMat, src);
}

/* ───────────────────────── layout / resize ──────────────────────── */
function layout() {
  const aspect = innerWidth / innerHeight;
  camera.aspect = aspect; camera.updateProjectionMatrix();
  renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight, false);
  canvas.width = Math.floor(innerWidth * DPR()); canvas.height = Math.floor(innerHeight * DPR());
  renderer.setViewport(0, 0, canvas.width, canvas.height);
  // Object sits right of the copy on landscape; centred and further away on portrait
  const fit = Math.max(1, 0.78 / aspect);
  // Copy owns columns 2–8; the object sits clear of it and bleeds off the right.
  camBase.set(0, 2.15, 12.6 * fit);
  group.position.x = aspect > 1.15 ? 2.75 + (aspect - 1.6) * 1.1 : 0.15;
  group.position.x = Math.min(group.position.x, 4.1);
  horizon.position.x = group.position.x - 0.6; haze.position.x = group.position.x;
  setupTargets();
  needsRender = true;
}
let needsRender = true;
addEventListener('resize', layout);

/* ───────────────────────── interaction ──────────────────────────── */
let yaw = -0.35, yawVel = 0, dragging = false, lastX = 0, lastY = 0, lastDrag = -1e9;
let pitch = 0, pitchTarget = 0;   // clamped -0.09..0.42 rad
let parTX = 0, parTY = 0, parX = 0, parY = 0;
const ring = document.createElement('div');
ring.className = 'ring'; ring.setAttribute('aria-hidden', 'true'); ring.textContent = 'Drag';
document.body.appendChild(ring);
let scrollN = 0;
addEventListener('scroll', () => {
  const hero = document.querySelector('.hero');
  const h = (hero && hero.offsetHeight) || innerHeight;
  const n = Math.min(1, Math.max(0, scrollY / h));
  if (Math.abs(n - scrollN) > 0.0005) { scrollN = n; needsRender = true; }
}, { passive: true });

let ringX = innerWidth * 0.7, ringY = innerHeight * 0.5, ringTX = ringX, ringTY = ringY, ringOn = false;
canvas.addEventListener('pointerenter', () => { ringOn = true; ring.classList.add('on'); });
canvas.addEventListener('pointerleave', () => { ringOn = false; ring.classList.remove('on'); parTX = 0; parTY = 0; });
canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; yawVel = 0; canvas.setPointerCapture(e.pointerId); ring.classList.add('grab'); });
canvas.addEventListener('pointermove', e => {
  ringTX = e.clientX; ringTY = e.clientY;
  if (dragging) {
    const dx = e.clientX - lastX; lastX = e.clientX;
    const dy = e.clientY - lastY; lastY = e.clientY;
    yawVel = dx * 0.0045; yaw += yawVel;
    pitchTarget = Math.max(-0.09, Math.min(0.42, pitchTarget + dy * 0.0022));
    lastDrag = performance.now(); needsRender = true;
  }
  else if (motion) { parTX = (e.clientX / innerWidth - 0.5) * 2; parTY = (e.clientY / innerHeight - 0.5) * 2; }
});
const endDrag = () => { if (dragging) { dragging = false; lastDrag = performance.now(); ring.classList.remove('grab'); } };
canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') { yaw -= Math.PI / 12; lastDrag = performance.now(); needsRender = true; }
  if (e.key === 'ArrowRight') { yaw += Math.PI / 12; lastDrag = performance.now(); needsRender = true; }
  if (e.key === 'ArrowUp')   { pitchTarget = Math.max(-0.09, pitchTarget - 0.06); needsRender = true; }
  if (e.key === 'ArrowDown') { pitchTarget = Math.min(0.42, pitchTarget + 0.06); needsRender = true; }
  if (e.key === ' ') { motion = !motion; e.preventDefault(); }
});

/* ───────────────────────── quality tiers (DIRECTION §10.3) ───────── */

let frames = 0, accum = 0, fpsShown = 0, tierDecided = !!LOCK_TIER;
function applyTier(t) {
  tier = t;
  if (t === 'A') { glass.transmission = 1; if ('dispersion' in glass) glass.dispersion = 0.42; dust.visible = true; }
  if (t === 'B') { glass.transmission = 1; if ('dispersion' in glass) glass.dispersion = 0; dust.visible = true; }
  if (t === 'C') { glass.transmission = 0; glass.transparent = true; glass.opacity = 0.62; glass.color.set(C.night2).multiplyScalar(1.6); glass.envMapIntensity = 1.6; dust.visible = false; }
  glass.needsUpdate = true;
  layout();
}
applyTier(tier);

/* ───────────────────────── frame ────────────────────────────────── */
const clock = new THREE.Clock();
let t = STILL ? STILL_T : 0;
const lerp = (a, b, k) => a + (b - a) * k;
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (!STILL) t += dt;

  // tier auto-detect over the first ~90 frames
  if (!tierDecided && !STILL) {
    frames++; accum += dt;
    if (frames === 90) { const ms = (accum / frames) * 1000; tierDecided = true; if (ms > 42) applyTier('C'); else if (ms > 24) applyTier('B'); }
  }

  // object rotation: drag inertia → idle rotation after 4s
  if (!dragging) {
    yaw += yawVel; yawVel *= 0.92;
    if (motion && performance.now() - lastDrag > 4000) yaw += 0.05 * dt;
  }
  group.rotation.y = yaw;

  // pointer parallax on the camera (the tower never tilts)
  parX = lerp(parX, parTX, 0.06); parY = lerp(parY, parTY, 0.06);
  pitch = lerp(pitch, pitchTarget, 0.08);

  // ease the tower in once it has loaded — no morph, no placeholder swap
  if (burjReady && morphT < 1) {
    morphT = Math.min(1, morphT < 0 ? 0 : morphT + dt * 1.6);
    const e = morphT * morphT * (3 - 2 * morphT);
    fadeSubtree(burj, e);
    fadeSubtree(burjMirror, e);
    burj.position.y = (1 - e) * -0.55;
    burjMirror.position.y = burj.position.y;
    needsRender = true;
  }

  // cursor-driven key: azimuth from pointer X, elevation from pointer Y
  {
    const az = parX * 2.1;
    const gx = group.position.x;
    const ry = 4.4 - parY * 2.6;
    cursorLight.position.set(gx + Math.sin(az) * 5.6, ry, Math.cos(az) * 5.6 + 1.2);
    cursorFill.position.set(gx - Math.sin(az) * 5.0, 3.4 + ry * 0.25, -Math.cos(az) * 5.0);
  }

  // Ascent: as the hero scrolls away the camera rises, eases back and orbits
  // a few degrees, so the tower is a place you move through, not a picture.
  const sn = scrollN;
  const orbit = sn * 0.32;
  const rise  = sn * 3.1;
  const dolly = sn * 2.6;
  const radius = camBase.z + dolly;

  camera.position.set(
    camBase.x + Math.sin(orbit) * radius + parX * 0.55,
    camBase.y + rise - parY * 0.30 + pitch * 4.0,
    Math.cos(orbit) * radius
  );
  camera.lookAt(camLook.x + parX * 0.2, camLook.y + rise * 0.72 + pitch * 1.2, camLook.z);

  // light sweep across the facets
  const a1 = t * 0.31, a2 = -t * 0.17 + 2.0;
  sparkle.uniforms.uL1.value.set(Math.cos(a1) * 0.85, 0.55, Math.sin(a1) * 0.85).normalize();
  sparkle.uniforms.uL2.value.set(Math.cos(a2) * 0.9, 0.18, Math.sin(a2) * 0.9).normalize();
  sparkle.uniforms.uGain.value = tier === 'C' ? 1.6 : 1.0;

  // slabs breathe like windows at night
  for (const m of slabMats) { const u = m.userData; const f = 0.72 + 0.28 * Math.sin(t * 0.9 + u.phase) * Math.sin(t * 0.37 + u.phase * 1.7); m.color.set(C.ch200).multiplyScalar(u.base * f * 1.35); }

  // dust drifts upward (the ascent)
  if (motion) {
    const p = dustGeo.attributes.position.array;
    for (let i = 0; i < DUST_N; i++) { p[i * 3 + 1] += dt * (0.04 + dustSeed[i] * 0.08); p[i * 3] += Math.sin(t * 0.3 + dustSeed[i] * 10) * dt * 0.02; if (p[i * 3 + 1] > 8.2) p[i * 3 + 1] = -0.5; }
    dustGeo.attributes.position.needsUpdate = true;
  }
  dust.position.x = group.position.x;

  // drag ring follows the pointer
  ringX = lerp(ringX, ringTX, 0.15); ringY = lerp(ringY, ringTY, 0.15);
  ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%,-50%) scale(${dragging ? 0.72 : ringOn ? 1 : 0.6})`;

  // render (in reduced/still mode only when something changed)
  const active = (heroOnScreen && tabVisible) &&
    (motion || dragging || needsRender || Math.abs(yawVel) > 1e-4);
  if (active) {
    renderer.setRenderTarget(rtScene); renderer.render(scene, camera);
    brightMat.uniforms.tDiffuse.value = rtScene.texture; pass(brightMat, rtHalfA);
    blur(rtHalfA, rtHalfB, 1.6); blur(rtHalfA, rtHalfB, 1.6);
    blurMat.uniforms.tDiffuse.value = rtHalfA.texture; blurMat.uniforms.uDir.value.set(0, 0); pass(blurMat, rtQuartA);   // downsample (uDir 0 = plain copy)
    blur(rtQuartA, rtQuartB, 2.4); blur(rtQuartA, rtQuartB, 2.4); blur(rtQuartA, rtQuartB, 2.4);
    compMat.uniforms.tScene.value = rtScene.texture; compMat.uniforms.tBloomA.value = rtHalfA.texture; compMat.uniforms.tBloomB.value = rtQuartA.texture; compMat.uniforms.uTime.value = t;
    pass(compMat, null);
    needsRender = false;
  }

  if (!(STILL && frames > 8)) requestAnimationFrame(frame);
  if (STILL) frames++;
}

/* ───────────────────────── real building swap ───────────────────────
   The procedural crystal is the instant-on placeholder. When the Burj
   Khalifa GLB finishes loading we hand the scene over to it — same glass,
   same rig, same mirror. Model: Sketchfab, free/royalty-free. */
const BURJ_URL = 'assets/burj.glb';
let burjReady = false;
let morphT = -1;

/* Fade a subtree by scaling each material's own base opacity, so materials that
   were already semi-transparent (the mirrored ghosts) keep their relationship. */
function fadeSubtree(root, k) {
  // Only force transparency WHILE fading. Opaque emissive objects are what the
  // transmission pass refracts through the glass; making them transparent
  // drops them out of that pass and the crystal goes dark.
  const mid = k > 0.002 && k < 0.998;
  root.traverse((n) => {
    if (!n.isMesh || !n.material) return;
    const mats = Array.isArray(n.material) ? n.material : [n.material];
    mats.forEach((m) => {
      if (m.userData._base === undefined) {
        m.userData._base = m.opacity;
        m.userData._baseTransparent = m.transparent;
        m.userData._baseDepthWrite = m.depthWrite;
      }
      if (mid) {
        m.transparent = true;
        m.opacity = m.userData._base * k;
        m.depthWrite = false;
      } else {
        m.transparent = m.userData._baseTransparent;
        m.opacity = m.userData._base;
        m.depthWrite = m.userData._baseDepthWrite;
      }
    });
  });
}
const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const burj = new THREE.Group();
burj.visible = false;
group.add(burj);
const burjMirror = new THREE.Group();
burjMirror.scale.y = -1; burjMirror.visible = false;
group.add(burjMirror);

/* Building materials. NOTE: this model is 99% "Rebord" (the structure and
   slab edges) and only 1% "Vitres" — so Rebord is the tower's SKIN, and
   painting it champagne turns the whole building into a gold blob. Rebord is
   therefore the dark facade; the champagne arrives as LIGHT: lit floor bands
   injected per-fragment from world height, plus the key on the edges. §6.2 */

const BAND_LIGHT = new THREE.Color(0xF6E2C2);

/* Pointer light: a champagne lamp that orbits the tower with the cursor, so the
   slab edges flare from whichever side you are looking. Decays with distance so
   it grazes rather than floods. */
const cursorLight = new THREE.PointLight(0xF4EADD, 42, 34, 1.6);
cursorLight.position.set(5, 4.2, 6);
scene.add(cursorLight);
const cursorFill = new THREE.PointLight(0x8FA0D8, 3.2, 22, 2.2);
cursorFill.position.set(-5, 2.4, -4);
scene.add(cursorFill);

function litFloors(mat, freq, strength) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uFreq = { value: freq };
    sh.uniforms.uStrength = { value: strength };
    sh.uniforms.uBandCol = { value: BAND_LIGHT };

    sh.vertexShader = `varying vec3 vWP;
${sh.vertexShader}`.replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
  vWP = (modelMatrix * vec4(transformed, 1.0)).xyz;`
    );

    sh.fragmentShader = `varying vec3 vWP;
uniform float uFreq;
uniform float uStrength;
uniform vec3 uBandCol;
${sh.fragmentShader}`.replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
  float b = fract(vWP.y * uFreq);
  float lit = smoothstep(0.58, 0.68, b) * (1.0 - smoothstep(0.82, 0.93, b));
  float hh = clamp(vWP.y / 6.2, 0.0, 1.0);
  lit *= mix(1.0, 0.25, smoothstep(0.62, 1.0, hh));
  totalEmissiveRadiance += uBandCol * lit * uStrength;`
    );

    mat.userData.shader = sh;
  };
  mat.needsUpdate = true;
  return mat;
}

// The facade: dark, polished, reflective. The champagne is reflected, not painted.
const facade = new THREE.MeshPhysicalMaterial({
  color: col(C.night1, 0.62),
  metalness: 0.78, roughness: 0.26,
  envMapIntensity: 1.45,
  clearcoat: 0.6, clearcoatRoughness: 0.28,
  reflectivity: 0.7,
});

// The glazing panels: warm interior, seen through glass
const glazing = new THREE.MeshPhysicalMaterial({
  color: col(C.night1, 1.0),
  metalness: 0.55, roughness: 0.12,
  envMapIntensity: 1.6,
  emissive: col(C.ch200, 1.0), emissiveIntensity: 0.85,
  clearcoat: 1.0, clearcoatRoughness: 0.06,
});

/* ── Live reflection probe ─────────────────────────────────────────────
   Renders the real surroundings into a cube map from the tower's position, so
   every slab edge mirrors the actual horizon and sky rather than a studio box.
   Refreshed on demand (scene is near-static), never per-frame. */
const probeRT = new THREE.WebGLCubeRenderTarget(256, {
  generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter,
});
const probeCam = new THREE.CubeCamera(0.4, 80, probeRT);
scene.add(probeCam);

function refreshProbe() {
  probeCam.position.set(group.position.x, 3.0, 0);
  const hidden = [burj, burjMirror, crystal, sparkleMesh, inner, mirror];
  const was = hidden.map(o => o && o.visible);
  hidden.forEach(o => { if (o) o.visible = false; });
  const prevTarget = renderer.getRenderTarget();
  probeCam.update(renderer, scene);
  renderer.setRenderTarget(prevTarget);
  hidden.forEach((o, i) => { if (o) o.visible = was[i]; });
  facade.envMap = probeRT.texture;
  glazing.envMap = probeRT.texture;
  facade.needsUpdate = true;
  glazing.needsUpdate = true;
}

const burjGhost = new THREE.MeshPhysicalMaterial({
  color: col(C.night2, 1), metalness: 0.9, roughness: 0.38,
  envMapIntensity: 1.0, transparent: true, opacity: 0.32, depthWrite: false,
});

/* ── Deferred load ───────────────────────────────────────────────────
   The Burj GLB is 23.8 MB. It must never be on the critical path:
   · phone / low tier  → never loaded. The glass mark IS the hero.
   · desktop           → fetched only once the visitor starts to scroll,
                         or after the page has been idle for a moment.
   Until it arrives the mark simply holds; nothing waits on it. */
let burjRequested = false;

/* The crystal wordmark is retired as the hero object — the Burj Khalifa is the
   hero. Keep the geometry out of the frame entirely so it costs nothing. */
crystal.visible = false;
sparkleMesh.visible = false;
inner.visible = false;
mirror.visible = false;

/* Render gating: the canvas is position:fixed, so once the hero has scrolled
   away there is nothing to draw. This is the single biggest saving on a long
   page — the GPU goes quiet for the other ~90% of the document. */
let heroOnScreen = true;
let tabVisible = !document.hidden;
document.addEventListener('visibilitychange', () => {
  tabVisible = !document.hidden;
  if (tabVisible) needsRender = true;
});
{
  const heroEl = document.querySelector('.hero');
  if (heroEl && 'IntersectionObserver' in window) {
    new IntersectionObserver((entries) => {
      heroOnScreen = entries[0].isIntersecting;
      if (heroOnScreen) needsRender = true;
      if (canvas) canvas.style.visibility = heroOnScreen ? '' : 'hidden';
    }, { rootMargin: '10% 0px' }).observe(heroEl);
  }
}

function loadBurj() {
  if (burjRequested) return;
  burjRequested = true;
  new GLTFLoader().load(BURJ_URL, (gltf) => {
    const src = gltf.scene;
    src.updateMatrixWorld(true);

    const box = new THREE.Box3().setFromObject(src);
    const size = box.getSize(new THREE.Vector3());
    const ctr = box.getCenter(new THREE.Vector3());
    const TARGET_H = 6.15;
    const k = TARGET_H / Math.max(size.y, 1e-6);

    const shell = new THREE.Group();
    src.traverse((o) => {
      if (!o.isMesh) return;
      const name = (o.material && o.material.name || '').toLowerCase();
      const mat = name.indexOf('vitres') >= 0 ? glazing : facade;
      const m = new THREE.Mesh(o.geometry, mat);
      m.applyMatrix4(o.matrixWorld);
      m.renderOrder = 1;
      shell.add(m);
    });
    shell.scale.setScalar(k);
    shell.position.set(-ctr.x * k, -(ctr.y - size.y / 2) * k, -ctr.z * k);
    burj.add(shell);

    const ghost = shell.clone(true);
    ghost.traverse((o) => { if (o.isMesh) o.material = burjGhost; });
    burjMirror.add(ghost);

    burj.visible = true;
    burjMirror.visible = true;
    burjReady = true;
    morphT = -1;
    refreshProbe();
    needsRender = true;
  }, undefined, (err) => {
    console.warn('[scene] Burj GLB unavailable; the mark remains the hero.', err);
  });
}

// fetch on first scroll intent, or when the browser is idle — whichever is first
addEventListener('scroll', function onFirstScroll() {
  removeEventListener('scroll', onFirstScroll);
  loadBurj();
}, { passive: true, once: true });

{
  const idle = window.requestIdleCallback || function (fn) { return setTimeout(fn, 300); };
  idle(function () { loadBurj(); }, { timeout: 800 });
}

layout();
frame();
