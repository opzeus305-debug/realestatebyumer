/* Hero — 'Blue hour over Downtown'. Background, city, atmosphere and 3D
   interaction designed by Fable 5.1 (REVIEW.md §A.2). Ported from
   prototype/hero-v2.html. ES module. */
import * as THREE from 'three';

/* ───────────────────────── params ───────────────────────── */
const q = new URLSearchParams(location.search);
const STILL = q.get('still') === '1';
if (STILL) document.documentElement.classList.add('still');
const S_OVERRIDE = q.has('s') ? Math.min(1, Math.max(0, parseFloat(q.get('s')))) : null;
const EXPOSURE = parseFloat(q.get('exposure') ?? '1.0');
const DOF_ON = q.get('dof') !== '0';
const NOMODEL = q.get('nomodel') === '1';
const LOCK_TIER = (q.get('tier') || '').toUpperCase();
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let motion = !reduced && !STILL;
let tier = LOCK_TIER || 'A';
const col = (hex, k = 1) => new THREE.Color(hex).multiplyScalar(k);

/* ───────────────────────── renderer / scene ───────────────────────── */
const mount = document.getElementById('scene');
if (!mount) throw new Error('no #scene mount');
const canvas = document.createElement('canvas');
canvas.setAttribute('aria-hidden', 'true');
mount.appendChild(canvas);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'high-performance', stencil: false, preserveDrawingBuffer: STILL });
renderer.toneMapping = THREE.NoToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 600);
const H = 6.15;                                             // tower height in scene units (≈135 m per unit)

/* ───────────────────────── SKY — a blue-hour dome, physically ordered, no stars ───────────────────────── */
const SUN = new THREE.Vector3(-0.72, -0.08, -0.69).normalize();   // where the sun set: left, behind the skyline
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: {
    cZenith: { value: col(0x0A0D1B) }, cUpper: { value: col(0x141A36) }, cLower: { value: col(0x252B4C) },
    cDusk: { value: col(0x4E4560) }, cHorizon: { value: col(0x8D6B4E) }, cBelow: { value: col(0x0A0B12) },
    uSun: { value: SUN }, uGlow: { value: 1.0 },
  },
  vertexShader: `varying vec3 vDir; void main(){ vDir = (modelMatrix * vec4(position,1.)).xyz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }`,
  fragmentShader: `
    uniform vec3 cZenith,cUpper,cLower,cDusk,cHorizon,cBelow,uSun; uniform float uGlow; varying vec3 vDir;
    void main(){
      vec3 d = normalize(vDir); float e = d.y;
      float warm = 0.5 + 0.5 * dot(normalize(vec3(d.x,0.,d.z)), normalize(vec3(uSun.x,0.,uSun.z)));   // 1 toward the set sun
      warm = pow(warm, 1.6) * uGlow;
      vec3 c = mix(cLower, cUpper, smoothstep(0.05, 0.32, e));
      c = mix(c, cZenith, smoothstep(0.32, 0.85, e));
      vec3 dusk = mix(cDusk, cDusk * 1.15 + cHorizon * 0.35, warm);
      c = mix(dusk, c, smoothstep(0.014, 0.10, e));
      vec3 hz = mix(cHorizon * 0.45, cHorizon * 1.35, warm);
      c = mix(hz, c, smoothstep(0.0, 0.022, e));
      c = mix(cBelow, c, smoothstep(-0.02, 0.0, e));
      gl_FragColor = vec4(c, 1.0);
    }`,
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 48, 24), skyMat);
sky.renderOrder = -10;
scene.add(sky);

/* the environment IS the sky — every reflection on the facade mirrors this dome, not a studio box */
(function env() {
  const s = new THREE.Scene(); s.add(sky.clone());
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(s, 0.04).texture; pm.dispose();
})();
if ('environmentIntensity' in scene) scene.environmentIntensity = 0.9;

/* ───────────────────────── AIR — aerial perspective ───────────────────────── */
const FOG = col(0x2A2C45);
scene.fog = new THREE.FogExp2(FOG.getHex(), 0.0125);

/* ───────────────────────── GROUND ───────────────────────── */
/* The real tower stands on Burj Lake, so the base is water: near-black, almost
   mirror-smooth so it takes the dusk sky, with a slow ripple in the normal. */
function rippleTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = '#8080ff'; g.fillRect(0, 0, 256, 256);           // flat normal
  for (let i = 0; i < 340; i++) {
    const x = Math.random() * 256, y = Math.random() * 256, r = 6 + Math.random() * 26;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    const a = 0.05 + Math.random() * 0.07;
    gr.addColorStop(0, `rgba(150,150,255,${a})`);
    gr.addColorStop(1, 'rgba(128,128,255,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(26, 26);
  return t;
}
const waterNormal = rippleTex();
const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), new THREE.MeshStandardMaterial({
  color: col(0x05060C), roughness: 0.10, metalness: 0.86, envMapIntensity: 1.85,
  normalMap: waterNormal, normalScale: new THREE.Vector2(0.16, 0.16),
}));
ground.rotation.x = -Math.PI / 2; ground.position.y = -0.002; scene.add(ground);

/* ───────────────────────── CITY — Downtown massing in three depth rings ───────────────────────── */
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const cityMat = new THREE.MeshStandardMaterial({ color: col(0x161925), roughness: 0.82, metalness: 0.08, envMapIntensity: 0.5 });
const lightPos = [], lightCol = [], lightSeed = [];
function addWindowLights(x, z, w, d, h, density) {
  const floors = Math.floor(h / 0.062);
  for (let f = 1; f < floors - 1; f++) {
    const y = 0.03 + f * 0.062;
    for (let side = 0; side < 4; side++) {
      const n = Math.max(1, Math.floor((side % 2 ? d : w) / 0.09));
      for (let k = 0; k < n; k++) {
        if (rnd() > density) continue;
        const u = (k + 0.5) / n - 0.5;
        let px = x, pz = z;
        if (side === 0) { px = x + u * w; pz = z + d / 2 + 0.005; } else if (side === 1) { px = x + w / 2 + 0.005; pz = z + u * d; }
        else if (side === 2) { px = x + u * w; pz = z - d / 2 - 0.005; } else { px = x - w / 2 - 0.005; pz = z + u * d; }
        lightPos.push(px, y, pz);
        const warm = rnd() < 0.78;
        lightCol.push(warm ? 0.96 : 0.72, warm ? 0.84 : 0.80, warm ? 0.62 : 1.0);
        lightSeed.push(rnd());
      }
    }
  }
}
function cityRing(count, rMin, rMax, hMin, hMax, density) {
  const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0);
  const mesh = new THREE.InstancedMesh(geo, cityMat, count);
  const m = new THREE.Matrix4(), p = new THREE.Vector3(), qt = new THREE.Quaternion(), sc = new THREE.Vector3(), c = new THREE.Color();
  let i = 0, guard = 0;
  while (i < count && guard++ < count * 40) {
    const a = rnd() * Math.PI * 2, r = rMin + Math.sqrt(rnd()) * (rMax - rMin);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (z > -1.5 && Math.abs(x) < 5.5) continue;            // keep the sightline to the tower open
    if (Math.hypot(x, z) < 3.2) continue;                    // the Burj has its park
    if (z > 6) continue;                                     // nothing behind the camera
    const h = hMin + Math.pow(rnd(), 2.4) * (hMax - hMin);
    const w = 0.32 + rnd() * 0.9, d = 0.32 + rnd() * 0.9;
    p.set(x, 0, z); qt.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.round(rnd() * 3) * Math.PI / 2 + (rnd() - 0.5) * 0.25); sc.set(w, h, d);
    m.compose(p, qt, sc); mesh.setMatrixAt(i, m);
    c.setHex(0x161925).offsetHSL((rnd() - 0.5) * 0.04, 0, (rnd() - 0.5) * 0.06); mesh.setColorAt(i, c);
    if (density > 0) addWindowLights(x, z, w, d, h, density);
    i++;
  }
  mesh.count = i; mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  scene.add(mesh); return mesh;
}
const rings = [
  // Only a distant silhouette band remains: enough to give the tower scale and
  // a horizon that belongs somewhere, without a city competing with the type.
  cityRing(90, 62, 150, 0.18, 1.5, 0.04),
];

/* window lights — additive points with fog attenuation and a slow breathe (light may breathe; nothing else loops) */
const lightShader = {
  vertexShader: `attribute vec3 aCol; attribute float aSeed; uniform float uTime, uSize, uFogD; varying vec3 vC; varying float vA;
    void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); float dist = length(mv.xyz);
      float breathe = 0.86 + 0.14 * sin(uTime * (0.4 + aSeed * 0.6) + aSeed * 40.);
      vA = breathe * exp(-uFogD * dist); vC = aCol;
      gl_Position = projectionMatrix * mv; gl_PointSize = clamp(uSize / dist, 1.0, 9.0); }`,
  fragmentShader: `uniform vec3 uTint; varying vec3 vC; varying float vA;
    void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, .1, d) * vA; gl_FragColor = vec4(vC * uTint * a, a); }`,
};
function makeLights(pos, cols, seeds, size, tint) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aCol', new THREE.Float32BufferAttribute(cols, 3)); g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
  const m = new THREE.ShaderMaterial({ ...lightShader, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uSize: { value: size }, uFogD: { value: 0.0125 }, uTint: { value: tint } } });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; scene.add(pts); return pts;
}
const cityLights = makeLights(lightPos, lightCol, lightSeed, 46, col(0xFFFFFF, 1.15));

/* ground haze at two depths, and the city glow pool — the "air" */
function gradTex(w, h, paint) { const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const hazeTex = gradTex(16, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(120,110,140,0)'); gr.addColorStop(0.55, 'rgba(120,110,140,0.35)'); gr.addColorStop(1, 'rgba(120,110,140,0.55)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
function hazePlane(z, h, alpha) { const m = new THREE.Mesh(new THREE.PlaneGeometry(400, h), new THREE.MeshBasicMaterial({ map: hazeTex, transparent: true, depthWrite: false, opacity: alpha, fog: false, color: col(0xFFFFFF) })); m.position.set(0, h / 2 - 0.05, z); scene.add(m); return m; }
const hazeNear = hazePlane(-40, 3.0, 0.22), hazeFar = hazePlane(-95, 8, 0.42);
const glowTex = gradTex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(226,176,120,0.85)'); gr.addColorStop(0.4, 'rgba(226,176,120,0.28)'); gr.addColorStop(1, 'rgba(226,176,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
const cityGlow = new THREE.Mesh(new THREE.PlaneGeometry(160, 60), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.5, fog: false }));
cityGlow.rotation.x = -Math.PI / 2; cityGlow.position.set(0, 0.02, -46); cityGlow.material.opacity = 0.34; scene.add(cityGlow);
const basePool = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 5.4), new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.30, color: col(0xC9B48E), fog: false }));
basePool.rotation.x = -Math.PI / 2; basePool.position.set(0, 0.01, 0); scene.add(basePool);

/* ───────────────────────── LIGHTS — the rig ───────────────────────── */
scene.add(new THREE.HemisphereLight(0x2E3560, 0x0B0C13, 0.75));
const rim = new THREE.DirectionalLight(0x6E7BB0, 0.55); rim.position.set(6, 9, -8); scene.add(rim);
function flood(x, z) { const s = new THREE.SpotLight(0xF2DCB8, 60, 34, 0.30, 0.75, 1.3); s.position.set(x, 0.15, z); s.target.position.set(0, 3.2, 0); scene.add(s, s.target); return s; }
const floodL = flood(-3.6, 3.2), floodR = flood(3.4, 2.6);
// the crown: the real tower's spire carries a light of its own
const crown = new THREE.PointLight(0xF6E2C2, 4.2, 5.5, 2.2); crown.position.set(0, H * 0.90, 0); scene.add(crown);
const cursorLight = new THREE.PointLight(0xF4EADD, 26, 30, 1.6); cursorLight.position.set(5, 4, 6); scene.add(cursorLight);

/* ───────────────────────── TOWER ───────────────────────── */
const facade = new THREE.MeshPhysicalMaterial({ color: col(0x1E1D23), metalness: 0.42, roughness: 0.30, envMapIntensity: 1.05, clearcoat: 0.5, clearcoatRoughness: 0.24, sheen: 0.4, sheenColor: col(0xE6C79A), sheenRoughness: 0.5 });
const glazing = new THREE.MeshPhysicalMaterial({ color: col(0x120F14), metalness: 0.62, roughness: 0.10, envMapIntensity: 1.35, emissive: col(0xE8C398), emissiveIntensity: 0.55, clearcoat: 1, clearcoatRoughness: 0.05 });
/* restrained lit floor bands — the champagne arrives as light (production's technique, dimmer and warmer) */
(function litFloors(mat, freq, strength) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uFreq = { value: freq }; sh.uniforms.uStrength = { value: strength }; sh.uniforms.uBand = { value: col(0xF6E2C2) };
    sh.vertexShader = `varying vec3 vWP;\n${sh.vertexShader}`.replace('#include <begin_vertex>', `#include <begin_vertex>\n vWP = (modelMatrix * vec4(transformed, 1.0)).xyz;`);
    sh.fragmentShader = `varying vec3 vWP; uniform float uFreq, uStrength; uniform vec3 uBand;\n${sh.fragmentShader}`.replace('#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>\n float b = fract(vWP.y * uFreq); float lit = smoothstep(0.62, 0.70, b) * (1.0 - smoothstep(0.80, 0.90, b));\n float hh = clamp(vWP.y / ${H.toFixed(2)}, 0.0, 1.0); lit *= mix(1.0, 0.35, smoothstep(0.55, 1.0, hh));\n totalEmissiveRadiance += uBand * lit * uStrength;`);
  };
  mat.needsUpdate = true;
})(facade, 9.0, 0.62);

const tower = new THREE.Group(); scene.add(tower);
let towerLights = null, towerReady = false;
const hint = document.createElement('div');
hint.className = 'ring'; hint.setAttribute('aria-hidden', 'true'); hint.textContent = 'Drag';
document.body.appendChild(hint);

/* minimal GLB reader — enough for this file (2 materials, POSITION/NORMAL, uint32 indices, no textures) */
async function loadGLB(url, onProgress) {
  const res = await fetch(url); if (!res.ok) throw new Error(res.status);
  const total = +res.headers.get('content-length') || 0; const reader = res.body.getReader(); const chunks = []; let got = 0;
  for (;;) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); got += value.length; onProgress && onProgress(total ? got / total : 0); }
  const buf = new Uint8Array(got); let o = 0; for (const c of chunks) { buf.set(c, o); o += c.length; }
  const dv = new DataView(buf.buffer); const len = dv.getUint32(8, true); let off = 12, json = null, bin = null;
  while (off < len) { const cl = dv.getUint32(off, true), ct = dv.getUint32(off + 4, true); const data = buf.buffer.slice(off + 8, off + 8 + cl); if (ct === 0x4E4F534A) json = JSON.parse(new TextDecoder().decode(data)); else if (ct === 0x004E4942) bin = data; off += 8 + cl; }
  const TYPES = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array }, N = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
  const acc = (i) => { const a = json.accessors[i], bv = json.bufferViews[a.bufferView], T = TYPES[a.componentType], n = N[a.type]; const bo = (bv.byteOffset || 0) + (a.byteOffset || 0); return { array: new T(bin.slice(bo, bo + a.count * n * T.BYTES_PER_ELEMENT)), n }; };
  const group = new THREE.Group();
  const visit = (ni, parent) => {
    const nd = json.nodes[ni], m = new THREE.Matrix4();
    if (nd.matrix) m.fromArray(nd.matrix); else m.compose(new THREE.Vector3(...(nd.translation || [0, 0, 0])), new THREE.Quaternion(...(nd.rotation || [0, 0, 0, 1])), new THREE.Vector3(...(nd.scale || [1, 1, 1])));
    const world = parent.clone().multiply(m);
    if (nd.mesh !== undefined) for (const pr of json.meshes[nd.mesh].primitives) {
      const g = new THREE.BufferGeometry(); const p = acc(pr.attributes.POSITION); g.setAttribute('position', new THREE.BufferAttribute(p.array, 3));
      if (pr.attributes.NORMAL !== undefined) { const nn = acc(pr.attributes.NORMAL); g.setAttribute('normal', new THREE.BufferAttribute(nn.array, 3)); }
      if (pr.indices !== undefined) g.setIndex(new THREE.BufferAttribute(acc(pr.indices).array, 1));
      g.applyMatrix4(world); if (!g.attributes.normal) g.computeVertexNormals();
      const name = pr.material !== undefined ? (json.materials[pr.material].name || '') : '';
      group.add(new THREE.Mesh(g, /vitres/i.test(name) ? glazing : facade));
    }
    (nd.children || []).forEach(c => visit(c, world));
  };
  json.scenes[json.scene || 0].nodes.forEach(n => visit(n, new THREE.Matrix4()));
  return group;
}
/* sample window lights on the facade (area-weighted over Rebord triangles, pushed out along the face normal) */
function sampleFacadeLights(meshes, count) {
  const tris = []; let total = 0; const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), ab = new THREE.Vector3(), ac = new THREE.Vector3();
  for (const mesh of meshes) { const g = mesh.geometry, pos = g.attributes.position, idx = g.index; const nT = idx ? idx.count / 3 : pos.count / 3; const step = Math.max(1, Math.floor(nT / 40000));
    for (let t = 0; t < nT; t += step) { const i0 = idx ? idx.getX(t * 3) : t * 3, i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1, i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
      a.fromBufferAttribute(pos, i0); b.fromBufferAttribute(pos, i1); c.fromBufferAttribute(pos, i2); ab.subVectors(b, a); ac.subVectors(c, a); const area = ab.cross(ac).length() / 2; if (area < 1e-7) continue; total += area; tris.push({ i0, i1, i2, pos, area, cum: total }); } }
  const P = [], C = [], Sd = [], n = new THREE.Vector3();
  for (let k = 0; k < count; k++) { let r = rnd() * total, lo = 0, hi = tris.length - 1; while (lo < hi) { const mid = (lo + hi) >> 1; if (tris[mid].cum < r) lo = mid + 1; else hi = mid; } const t = tris[lo];
    a.fromBufferAttribute(t.pos, t.i0); b.fromBufferAttribute(t.pos, t.i1); c.fromBufferAttribute(t.pos, t.i2); let u = rnd(), v = rnd(); if (u + v > 1) { u = 1 - u; v = 1 - v; }
    n.copy(ab.subVectors(b, a)).cross(ac.subVectors(c, a)).normalize(); if (Math.abs(n.y) > 0.6) { k--; continue; }   // walls, not floor plates
    const x = a.x + (b.x - a.x) * u + (c.x - a.x) * v + n.x * 0.012, y = a.y + (b.y - a.y) * u + (c.y - a.y) * v + n.y * 0.012, z = a.z + (b.z - a.z) * u + (c.z - a.z) * v + n.z * 0.012;
    P.push(x, y, z); const warm = rnd() < 0.85; C.push(warm ? 0.98 : 0.8, warm ? 0.88 : 0.86, warm ? 0.7 : 1.0); Sd.push(rnd()); }
  return makeLights(P, C, Sd, 30, col(0xFFFFFF, 1.05));
}
function fitTower(root) {
  const box = new THREE.Box3().setFromObject(root); const size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
  const k = H / Math.max(size.y, 1e-6); root.scale.setScalar(k); root.position.set(-ctr.x * k, -(ctr.y - size.y / 2) * k, -ctr.z * k); root.updateMatrixWorld(true);
  root.traverse(o => { if (o.isMesh) { o.geometry.applyMatrix4(o.matrixWorld); o.geometry.computeBoundingBox(); } }); root.scale.setScalar(1); root.position.set(0, 0, 0); root.updateMatrixWorld(true);
}
function standIn() {                                        // a tapered massing so the page still composes without the fetch
  const g = new THREE.Group(); const tiers = [[1.35, 1.5], [1.05, 1.4], [0.8, 1.2], [0.58, 1.0], [0.36, 0.55], [0.14, 0.4]]; let y = 0;
  for (const [r, h] of tiers) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.85, r, h, 6), facade); m.position.y = y + h / 2; g.add(m); y += h; }
  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.08, H - y, 6), facade); spire.position.y = y + (H - y) / 2; g.add(spire); return g;
}
async function bringTheTower() {
  let root;
  try {
    if (NOMODEL) throw new Error('nomodel');
    root = await loadGLB('assets/burj.glb', p => { hint.textContent = `Loading the tower · ${Math.round(p * 100)}%`; });
  } catch (e) { console.warn('[hero-v2] GLB unavailable, using the stand-in massing', e); root = standIn(); }
  fitTower(root); tower.add(root);
  const rebord = []; root.traverse(o => { if (o.isMesh && o.material === facade) rebord.push(o); });
  towerLights = sampleFacadeLights(rebord, tier === 'C' ? 900 : 3000);

  /* The reflection. A flipped copy under the waterline, dark and translucent,
     fading with depth so it dissolves rather than ending. */
  if (tier !== 'C') {
    const reflMat = new THREE.MeshBasicMaterial({
      color: col(0x2A2A33), transparent: true, opacity: 0.30,
      depthWrite: false, fog: true,
    });
    const refl = root.clone(true);
    refl.traverse(o => { if (o.isMesh) o.material = reflMat; });
    const mirror = new THREE.Group();
    mirror.scale.set(1, -1, 1); mirror.position.y = -0.004;
    mirror.add(refl);
    tower.add(mirror);

    // the reflected window lights, dimmer still
    if (towerLights) {
      const lr = towerLights.clone(true);
      lr.material = towerLights.material.clone();
      lr.material.opacity = (lr.material.opacity ?? 1) * 0.34;
      lr.material.transparent = true;
      mirror.add(lr);
    }

    // a haze sheet lying on the water kills the reflection with distance
    const fadeTex = gradTex(8, 128, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h);
      gr.addColorStop(0, 'rgba(8,9,16,0)'); gr.addColorStop(0.55, 'rgba(8,9,16,0.55)'); gr.addColorStop(1, 'rgba(8,9,16,0.92)');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    const veil = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshBasicMaterial({
      map: fadeTex, transparent: true, depthWrite: false, fog: false, opacity: 0.95,
    }));
    veil.rotation.x = Math.PI / 2; veil.position.set(0, -0.006, -14); scene.add(veil);
  }

  towerReady = true; hint.textContent = 'Drag · scroll to zoom'; needsRender = true;
}
bringTheTower();

/* ───────────────────────── POST — depth pass, DoF, soft bloom, ACES. No grain. ───────────────────────── */
const RT = (w, h, samples = 0, depth = true) => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, depthBuffer: depth, samples, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
let rtScene, rtDepth, rtHalfA, rtHalfB, rtQuartA, rtQuartB, rtBlurA, rtBlurB;
const depthMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), quadScene = new THREE.Scene(), quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null); quad.frustumCulled = false; quadScene.add(quad);
const VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
const copyMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { tDiffuse: { value: null } }, vertexShader: VS, fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ gl_FragColor = texture2D(tDiffuse, vUv); }` });
const brightMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { tDiffuse: { value: null } }, vertexShader: VS, fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ vec3 c = texture2D(tDiffuse, vUv).rgb; float l = dot(c, vec3(.2126,.7152,.0722)); gl_FragColor = vec4(c * smoothstep(0.72, 1.35, l), 1.); }` });
const blurMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { tDiffuse: { value: null }, uDir: { value: new THREE.Vector2(1, 0) }, uTexel: { value: new THREE.Vector2() } }, vertexShader: VS, fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 uDir, uTexel; varying vec2 vUv; void main(){ vec2 o1 = uDir*uTexel*1.3846153846, o2 = uDir*uTexel*3.2307692308; vec4 c = texture2D(tDiffuse, vUv)*.2270270270; c += (texture2D(tDiffuse, vUv+o1)+texture2D(tDiffuse, vUv-o1))*.3162162162; c += (texture2D(tDiffuse, vUv+o2)+texture2D(tDiffuse, vUv-o2))*.0702702703; gl_FragColor = c; }` });
const compMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: {
    tScene: { value: null }, tBlur: { value: null }, tDepth: { value: null }, tBloomA: { value: null }, tBloomB: { value: null },
    uFocus: { value: 11 }, uNear: { value: 0.1 }, uFar: { value: 600 }, uDof: { value: DOF_ON ? 1 : 0 }, uBloom: { value: 0.42 }, uExposure: { value: EXPOSURE }, uVignette: { value: 0.32 },
  }, vertexShader: VS, fragmentShader: `
  #include <packing>
  uniform sampler2D tScene, tBlur, tDepth, tBloomA, tBloomB; uniform float uFocus, uNear, uFar, uDof, uBloom, uExposure, uVignette; varying vec2 vUv;
  vec3 fit(vec3 v){ vec3 a = v*(v+.0245786)-.000090537; vec3 b = v*(.983729*v+.4329510)+.238081; return a/b; }
  vec3 aces(vec3 c){ const mat3 I = mat3(.59719,.07600,.02840,.35458,.90834,.13383,.04823,.01566,.83777); const mat3 O = mat3(1.60475,-.10208,-.00327,-.53108,1.10813,-.07276,-.07367,-.00605,1.07602); return clamp(O*fit(I*c),0.,1.); }
  vec3 srgb(vec3 c){ return mix(12.92*c, 1.055*pow(c, vec3(1./2.4))-.055, step(vec3(.0031308), c)); }
  void main(){
    vec3 sharp = texture2D(tScene, vUv).rgb;
    float z = unpackRGBAToDepth(texture2D(tDepth, vUv)); float dist = -perspectiveDepthToViewZ(z, uNear, uFar);
    float far = smoothstep(uFocus * 1.15, uFocus * 3.2, dist);            // the city softens with distance
    float near = smoothstep(uFocus * 0.62, uFocus * 0.28, dist);          // the ground in front softens too
    float coc = clamp(max(far * 0.9, near), 0., 1.) * uDof;
    vec3 c = mix(sharp, texture2D(tBlur, vUv).rgb, coc);
    c += (texture2D(tBloomA, vUv).rgb * .5 + texture2D(tBloomB, vUv).rgb * .9) * uBloom;
    c *= uExposure / .6; c = aces(c);
    vec2 d = vUv - .5; c *= 1. - uVignette * smoothstep(.35, 1.1, length(d * vec2(1., .9)) * 1.35);
    gl_FragColor = vec4(srgb(c), 1.); }` });
function pass(m, t) { quad.material = m; renderer.setRenderTarget(t); renderer.render(quadScene, quadCam); }
function blur(src, tmp, r) { blurMat.uniforms.uTexel.value.set(r / src.width, r / src.height); blurMat.uniforms.tDiffuse.value = src.texture; blurMat.uniforms.uDir.value.set(1, 0); pass(blurMat, tmp); blurMat.uniforms.tDiffuse.value = tmp.texture; blurMat.uniforms.uDir.value.set(0, 1); pass(blurMat, src); }

const DPR = () => Math.min(devicePixelRatio || 1, tier === 'A' ? 1.5 : tier === 'B' ? 1.2 : 1);
let W = 2, Hh = 2, needsRender = true;
function layout() {
  const dpr = DPR(); W = Math.max(2, Math.floor(innerWidth * dpr)); Hh = Math.max(2, Math.floor(innerHeight * dpr));
  renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight, false); canvas.width = W; canvas.height = Hh; renderer.setViewport(0, 0, W, Hh);
  camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  [rtScene, rtDepth, rtHalfA, rtHalfB, rtQuartA, rtQuartB, rtBlurA, rtBlurB].forEach(t => t && t.dispose());
  rtScene = RT(W, Hh, tier === 'A' ? 4 : tier === 'B' ? 2 : 0); rtDepth = new THREE.WebGLRenderTarget(W >> 1, Hh >> 1, { depthBuffer: true });
  rtHalfA = RT(W >> 1, Hh >> 1, 0, false); rtHalfB = RT(W >> 1, Hh >> 1, 0, false); rtQuartA = RT(W >> 2, Hh >> 2, 0, false); rtQuartB = RT(W >> 2, Hh >> 2, 0, false);
  rtBlurA = RT(W >> 1, Hh >> 1, 0, false); rtBlurB = RT(W >> 1, Hh >> 1, 0, false);
  compMat.uniforms.uNear.value = camera.near; compMat.uniforms.uFar.value = camera.far;
  needsRender = true;
}
addEventListener('resize', layout);

/* ───────────────────────── THE RIG — springs, momentum, a camera in a place ───────────────────────── */
class Spring { constructor(x, k, zeta = 1) { this.x = x; this.v = 0; this.t = x; this.k = k; this.c = 2 * Math.sqrt(k) * zeta; }   // zeta ≥ 1: never overshoots
  step(dt) { const a = -this.k * (this.x - this.t) - this.c * this.v; this.v += a * dt; this.x += this.v * dt; return this.x; } }
let zoom = 1, zoomT = 1;
const rig = {
  yaw: -0.42, yawVel: 0,                                       // free angle with momentum and friction
  pitch: new Spring(-0.075, 26), dist: new Spring(11.6, 12), look: new Spring(2.55, 12),
  panX: new Spring(0, 42), panY: new Spring(0, 42),            // pointer parallax as a camera translation
  scroll: new Spring(0, 9),                                    // the crane: heavy, lags the page
  lookX: new Spring(2.3, 10),                                  // the tower sits right of the copy
};
let dragging = false, lastX = 0, lastY = 0, lastInput = -1e9, ptrX = 0, ptrY = 0;
const heroEl = document.querySelector('.hero');
const copyEl = document.querySelector('.hero__copy');
canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); lastInput = performance.now(); });
canvas.addEventListener('pointermove', e => {
  ptrX = (e.clientX / innerWidth - 0.5) * 2; ptrY = (e.clientY / innerHeight - 0.5) * 2;
  if (dragging) { const dx = e.clientX - lastX, dy = e.clientY - lastY; lastX = e.clientX; lastY = e.clientY;
    rig.yawVel = THREE.MathUtils.lerp(rig.yawVel, dx * 0.16, 0.5);       // velocity in rad/s, smoothed — the tower has mass
    rig.pitch.t = THREE.MathUtils.clamp(rig.pitch.t + dy * 0.0016, -0.16, 0.30); lastInput = performance.now(); }
  needsRender = true;
});
const endDrag = () => { dragging = false; lastInput = performance.now(); };

/* Zoom: the wheel dollies the camera rather than scrolling the page while the
   pointer is over the object. Clamped so the tower can never be lost. */
canvas.addEventListener('wheel', (e) => {
  if (!motion) return;
  e.preventDefault();
  zoomT = THREE.MathUtils.clamp(zoomT + e.deltaY * 0.00075, 0.52, 1.45);
  lastInput = performance.now(); needsRender = true;
}, { passive: false });

/* Double-click returns the camera home. */
canvas.addEventListener('dblclick', () => {
  zoomT = 1; rig.yaw = -0.42; rig.yawVel = 0; rig.pitch.t = -0.075;
  lastInput = performance.now(); needsRender = true;
});

/* Three viewpoints, named for what they show. Keyboard 1/2/3 as well. */
const VIEWS = {
  base:  { yaw: -0.42, pitch:  0.06, zoom: 0.62 },
  full:  { yaw: -0.42, pitch: -0.075, zoom: 1.00 },
  crown: { yaw:  0.55, pitch: -0.20, zoom: 0.70 },
};
function goTo(name) {
  const v = VIEWS[name]; if (!v) return;
  rig.yaw = v.yaw; rig.yawVel = 0; rig.pitch.t = v.pitch; zoomT = v.zoom;
  lastInput = performance.now(); needsRender = true;
  document.querySelectorAll('.viewbtn').forEach(b =>
    b.setAttribute('aria-pressed', String(b.dataset.view === name)));
}
(function buildViewControls() {
  const host = document.querySelector('.hero');
  if (!host || !motion) return;
  const bar = document.createElement('div');
  bar.className = 'views';
  bar.innerHTML =
    '<button class="viewbtn" type="button" data-view="base">Base</button>' +
    '<button class="viewbtn" type="button" data-view="full" aria-pressed="true">Full height</button>' +
    '<button class="viewbtn" type="button" data-view="crown">Crown</button>';
  bar.addEventListener('click', e => {
    const b = e.target.closest('.viewbtn'); if (b) goTo(b.dataset.view);
  });
  host.appendChild(bar);
})();
canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag); canvas.addEventListener('pointerleave', () => { ptrX = 0; ptrY = 0; });
addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') { rig.yawVel -= 0.9; lastInput = performance.now(); } if (e.key === 'ArrowRight') { rig.yawVel += 0.9; lastInput = performance.now(); }
  if (e.key === '1') goTo('base'); if (e.key === '2') goTo('full'); if (e.key === '3') goTo('crown');
  if (e.key === 'ArrowUp') rig.pitch.t = Math.max(-0.16, rig.pitch.t - 0.05); if (e.key === 'ArrowDown') rig.pitch.t = Math.min(0.30, rig.pitch.t + 0.05);
  if (e.key === ' ') { motion = !motion; e.preventDefault(); } needsRender = true;
});
let scrollN = 0;
function readScroll() { const r = heroEl.getBoundingClientRect(); const range = r.height - innerHeight; scrollN = range > 0 ? Math.min(1, Math.max(0, -r.top / range)) : 0; if (S_OVERRIDE !== null) scrollN = S_OVERRIDE; needsRender = true; }
addEventListener('scroll', readScroll, { passive: true }); readScroll();

/* ───────────────────────── tiers ───────────────────────── */
let frames = 0, accum = 0, tierDecided = !!LOCK_TIER;
function applyTier(t) { tier = t; compMat.uniforms.uDof.value = (t === 'C' || !DOF_ON) ? 0 : 1; compMat.uniforms.uBloom.value = t === 'C' ? 0 : 0.42; layout(); }
applyTier(tier);

/* ───────────────────────── frame ───────────────────────── */
const clock = new THREE.Clock(); let t = STILL ? 4 : 0, fpsShown = 60;
const perf = null;
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05); if (!STILL) t += dt;
  if (!tierDecided && towerReady && !STILL) { frames++; accum += dt; if (frames === 90) { const ms = accum / frames * 1000; tierDecided = true; if (ms > 40) applyTier('C'); else if (ms > 24) applyTier('B'); } }

  // yaw: momentum with friction; after 5 s idle a slow drift so the city keeps breathing (off under reduced motion)
  if (!dragging) { const idle = motion && performance.now() - lastInput > 5000; rig.yawVel += ((idle ? 0.022 : 0) - rig.yawVel) * (1 - Math.exp(-dt / (idle ? 2.5 : 0.55))); }
  zoom += (zoomT - zoom) * (1 - Math.exp(-dt / 0.22));
  rig.yaw += rig.yawVel * dt;

  // the lake breathes: two slow drifts across the normal map
  if (motion) {
    waterNormal.offset.x = (t * 0.0045) % 1;
    waterNormal.offset.y = (t * 0.0031) % 1;
  }

  // the crane: scroll rises, orbits and dollies through a heavy spring
  rig.scroll.t = scrollN; const s = rig.scroll.step(dt);
  rig.dist.t = (11.6 + s * 4.6) * zoom; rig.look.t = 2.55 + s * 1.3; rig.lookX.t = 2.3 - s * 1.2;
  rig.panX.t = motion ? ptrX * 0.45 : 0; rig.panY.t = motion ? -ptrY * 0.28 : 0;
  const dist = rig.dist.step(dt), lookY = rig.look.step(dt), lookX = rig.lookX.step(dt), pitch = rig.pitch.step(dt) + s * 0.16, panX = rig.panX.step(dt), panY = rig.panY.step(dt);
  const yaw = rig.yaw + s * 0.42;
  const look = new THREE.Vector3(0, lookY, 0);
  camera.position.set(Math.sin(yaw) * Math.cos(pitch) * dist, Math.max(0.35, lookY + Math.sin(pitch) * dist), Math.cos(yaw) * Math.cos(pitch) * dist);
  // shift the framing so the tower sits right of the copy: translate camera and look point together (screen-space offset)
  const right = new THREE.Vector3().subVectors(look, camera.position).cross(camera.up).normalize();
  camera.position.addScaledVector(right, -lookX + panX); look.addScaledVector(right, -lookX);
  camera.position.y += panY;
  camera.lookAt(look);
  compMat.uniforms.uFocus.value = camera.position.distanceTo(new THREE.Vector3(0, lookY, 0));

  // the champagne lamp follows the pointer around the tower
  const az = yaw + ptrX * 1.4; cursorLight.position.set(Math.sin(az) * 5.2, 3.6 - ptrY * 2.0, Math.cos(az) * 5.2);
  cityLights.material.uniforms.uTime.value = t; if (towerLights) towerLights.material.uniforms.uTime.value = t;
  copyEl.style.opacity = String(1 - Math.min(1, Math.max(0, (s - 0.12) / 0.3)));

  const moving = dragging || Math.abs(rig.yawVel) > 1e-3 || Math.abs(rig.scroll.x - rig.scroll.t) > 1e-3 || Math.abs(rig.panX.x - rig.panX.t) > 1e-3 || Math.abs(rig.pitch.x - rig.pitch.t) > 1e-3;
  if (needsRender || moving || motion || STILL) {
    renderer.setRenderTarget(rtScene); renderer.render(scene, camera);
    if (compMat.uniforms.uDof.value > 0) { scene.overrideMaterial = depthMat; const fogWas = scene.fog; scene.fog = null; renderer.setRenderTarget(rtDepth); renderer.render(scene, camera); scene.overrideMaterial = null; scene.fog = fogWas;
      copyMat.uniforms.tDiffuse.value = rtScene.texture; pass(copyMat, rtBlurA); blur(rtBlurA, rtBlurB, 1.8); blur(rtBlurA, rtBlurB, 1.8); }
    if (compMat.uniforms.uBloom.value > 0) { brightMat.uniforms.tDiffuse.value = rtScene.texture; pass(brightMat, rtHalfA); blur(rtHalfA, rtHalfB, 1.5); copyMat.uniforms.tDiffuse.value = rtHalfA.texture; pass(copyMat, rtQuartA); blur(rtQuartA, rtQuartB, 2.2); blur(rtQuartA, rtQuartB, 2.2); }
    compMat.uniforms.tScene.value = rtScene.texture; compMat.uniforms.tBlur.value = rtBlurA.texture; compMat.uniforms.tDepth.value = rtDepth.texture; compMat.uniforms.tBloomA.value = rtHalfA.texture; compMat.uniforms.tBloomB.value = rtQuartA.texture;
    pass(compMat, null); needsRender = false;
  }
  if (!(STILL && towerReady && frames++ > 40)) requestAnimationFrame(frame);
}
layout(); frame();
