/* Hero — 'Burj at Blue Hour'. Materials, lighting, water base and the shimmer
   fixes designed by Fable 5.1 (see prototype/tower-v2.html header for the full
   rationale and the diagnosis). Ported to production. ES module. */
import * as THREE from 'three';
const q = new URLSearchParams(location.search), P = (k, d) => q.has(k) ? q.get(k) : d;
const STILL = P('still', '0') === '1', FLAT = P('flat', '0') === '1', SAA = P('saa', '1') !== '0', TAA = P('taa', '1') !== '0' && !STILL, OFFSET = P('offset', '1') !== '0', DOF = P('dof', '1') !== '0';
const BASE = P('base', 'lake'), NOMODEL = P('nomodel', '0') === '1', S_OVER = q.has('s') ? +q.get('s') : null, EXPOSURE = +P('exposure', '1.0');
if (STILL) document.documentElement.classList.add('still'); if (P('nocopy', '0') === '1') document.documentElement.classList.add('nocopy');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = matchMedia('(max-width: 767px), (max-width: 1023px) and (pointer: coarse)').matches;
let motion = !reduced && !STILL && !mobile;
let tier = (P('tier', '') || (mobile ? 'C' : 'A')).toUpperCase();
const col = (h, k = 1) => new THREE.Color(h).multiplyScalar(k); let needsRender = true;
const H = 6.15;

/* ── renderer / scene / camera ── */
const mount = document.getElementById('scene');
if (!mount) throw new Error('no #scene mount');
let unavailable = false;
function usePhoto() {
  unavailable = true;
  document.querySelector('.hero').classList.add('scene-unavailable');
  document.querySelector('.hero__interaction').removeAttribute('tabindex');
  document.querySelector('.hero__explorer').hidden = true;
  const status = document.querySelector('.hero__status'); status.hidden = false;
  status.querySelector('span').textContent = 'The 3D view is temporarily unavailable.';
  document.getElementById('sceneRetry').hidden = false;
}
const canvas = document.createElement('canvas');
canvas.setAttribute('aria-hidden', 'true');
mount.appendChild(canvas);
canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); usePhoto(); });
canvas.addEventListener('webglcontextrestored', () => {
  try {
    buildEnvironment(); layout(); histValid = false; needsRender = true;
    unavailable = false;
    document.querySelector('.hero').classList.remove('scene-unavailable');
    document.querySelector('.hero__interaction').setAttribute('tabindex', '0');
    document.querySelector('.hero__status').hidden = towerReady;
    document.querySelector('.hero__explorer').hidden = !towerReady;
  } catch (e) { console.warn('[scene] restoration failed', e); usePhoto(); }
});
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: mobile ? 'low-power' : 'high-performance', stencil: false, preserveDrawingBuffer: STILL });
renderer.toneMapping = THREE.NoToneMapping; renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(36, 1, 1.5, 700);

/* ── sky dome (from hero-v2) — physically ordered dusk, no stars ── */
const SUN = new THREE.Vector3(-0.72, -0.08, -0.69).normalize();
let skyReady = false;
/* The sky is a photograph, not a gradient. A real blue-hour frame carries cloud
   structure and colour transitions no shader ramp reproduces, and because the
   dome is also the reflection environment, the tower's aluminium mirrors real
   sky. Equirectangular, seamless at the wrap, 21 KB.
   Source: assets/stock/dusk-wide.jpg (Unsplash), sky band only, house grade. */
const skyTex = new THREE.TextureLoader().load('assets/img/sky-dusk.webp', () => { skyReady = true; });
skyTex.colorSpace = THREE.SRGBColorSpace;
skyTex.wrapS = THREE.RepeatWrapping;
skyTex.minFilter = THREE.LinearFilter;
skyTex.generateMipmaps = false;
const skyMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { uSky: { value: skyTex } },
  vertexShader: `varying vec3 vDirection; varying vec2 vUv;
    void main(){ vDirection = normalize(position); vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
  fragmentShader: `uniform sampler2D uSky; varying vec3 vDirection; varying vec2 vUv;
    void main(){ vec3 d = normalize(vDirection); float h = max(d.y, 0.);
      vec3 horizon = vec3(.095, .105, .135);
      vec3 c = mix(horizon, vec3(.025, .048, .082), smoothstep(0., .48, h));
      c = mix(c, vec3(.009, .018, .036), smoothstep(.3, .95, h));
      float glow = pow(max(0., dot(d, normalize(vec3(-.3, .035, -.95)))), 7.);
      c += vec3(.13, .068, .027) * glow * exp(-h * 5.);
      vec3 photo = texture2D(uSky, vUv).rgb;
      c += (photo - vec3(.2)) * .035 * smoothstep(0., .16, h);
      c = mix(vec3(.025, .042, .051), c, smoothstep(-.12, .01, d.y));
      gl_FragColor = vec4(c, 1.);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
    }`,
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(500, 48, 24), skyMat); sky.renderOrder = -10; scene.add(sky);
/* The dome is the reflection environment, so it must be rebuilt once the sky
   photograph has decoded — otherwise every metal surface reflects a black sky. */
function buildEnvironment() {
  const s = new THREE.Scene();
  s.add(sky.clone());
  const pm = new THREE.PMREMGenerator(renderer);
  const prev = scene.userData.environmentTarget;
  scene.userData.environmentTarget = pm.fromScene(s, 0.04);
  scene.environment = scene.userData.environmentTarget.texture;
  pm.dispose();
  if (prev && prev.dispose) prev.dispose();
  needsRender = true;
}
buildEnvironment();
scene.fog = new THREE.FogExp2(new THREE.Color(.095, .105, .135), .028);

/* ── shared shader helpers injected via onBeforeCompile ── */
const GLSL_HASH = `float h21(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }`;
function injectCommon(mat, opts) {                    // opts: { saa, brush, ao, haze, bands, windows, glass }
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uH = { value: H }; sh.uniforms.uSaa = { value: SAA ? 1 : 0 }; sh.uniforms.uTime = { value: 0 }; sh.uniforms.uHaze = { value: col(0x3A3C58) }; sh.uniforms.uBand = { value: col(0xF6E2C2) }; sh.uniforms.uWarm = { value: col(0xFFD9A3) }; sh.uniforms.uCool = { value: col(0xCFE0FF) };
    sh.vertexShader = `varying vec3 vWP; varying float vDist;\n${sh.vertexShader}`.replace('#include <begin_vertex>', `#include <begin_vertex>\n vWP = (modelMatrix * vec4(transformed, 1.0)).xyz; vDist = length(cameraPosition - vWP);`);
    sh.fragmentShader = `varying vec3 vWP; varying float vDist; uniform float uH, uSaa, uTime; uniform vec3 uHaze, uBand, uWarm, uCool;\n${GLSL_HASH}\n${sh.fragmentShader}`
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        { float hh = clamp(vWP.y / uH, 0.0, 1.0);
          ${opts.brush ? `roughnessFactor += (h21(floor(vWP.xz * 160.0)) - 0.5) * 0.10;` : ''}
          roughnessFactor += 0.14 * smoothstep(9.0, 40.0, vDist);                                   // distance LOD: far parts stop sparkling
          if (uSaa > 0.5) { vec3 dx = dFdx(vNormal), dy = dFdy(vNormal); float variance = 0.25 * (dot(dx,dx) + dot(dy,dy)); roughnessFactor = sqrt(roughnessFactor*roughnessFactor + min(0.22, variance * 3.0)); }
          roughnessFactor = clamp(roughnessFactor, ${opts.glass ? '0.04' : '0.30'}, 1.0); }`)
      .replace('#include <color_fragment>', `#include <color_fragment>
        { float hh = clamp(vWP.y / uH, 0.0, 1.0);
          ${opts.ao ? `diffuseColor.rgb *= mix(0.58, 1.0, smoothstep(0.0, 0.17, hh)); diffuseColor.rgb *= 1.0 - 0.12 * h21(floor(vWP.xy * 40.0)) * (1.0 - smoothstep(0.0, 0.14, hh));` : ''} }`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        { float hh = clamp(vWP.y / uH, 0.0, 1.0);
          ${opts.bands ? `float fl = vWP.y * 9.0; float b = fract(fl); float w = fwidth(fl); float lit = smoothstep(0.62 - w, 0.70 + w, b) * (1.0 - smoothstep(0.80 - w, 0.90 + w, b)); lit = mix(0.25, lit, 1.0 - smoothstep(0.4, 1.4, w)); lit *= mix(1.0, 0.35, smoothstep(0.55, 1.0, hh)); totalEmissiveRadiance += uBand * lit * 0.22;` : ''}
          ${opts.windows ? `float fy = vWP.y * 38.0; float storey = floor(fy); float ang = atan(vWP.z, vWP.x); float bay = floor(ang * 14.0); vec2 id = vec2(storey, bay);
            float p = 0.24 - 0.14 * hh; float on = step(h21(id), p); float warm = step(0.3, h21(id + 7.0));
            float fw = max(fwidth(fy), fwidth(ang * 14.0)); float aa = 1.0 - smoothstep(0.25, 0.9, fw);      // storeys under ~4px blend to their average glow
            float inPane = smoothstep(0.08, 0.2, fract(fy)) * (1.0 - smoothstep(0.82, 0.94, fract(fy)));
            float lit = mix(p * 0.5, on * inPane, aa);
            float breathe = 0.92 + 0.08 * sin(uTime * (0.3 + h21(id + 3.0) * 0.5) + h21(id) * 40.0);
            totalEmissiveRadiance += mix(uCool, uWarm, warm) * lit * breathe * 0.42;` : ''} }`)
      .replace('#include <fog_fragment>', `#include <fog_fragment>
        ${opts.haze ? `{ float hh = clamp(vWP.y / uH, 0.0, 1.0); gl_FragColor.rgb = mix(gl_FragColor.rgb, uHaze, smoothstep(0.35, 1.0, hh) * 0.11); }` : ''}`);
    mat.userData.shader = sh;
  };
  mat.customProgramCacheKey = () => JSON.stringify(opts) + SAA;
  return mat;
}

/* ── materials ── */
const rebord = injectCommon(new THREE.MeshPhysicalMaterial({ color: col(0xbec8cf), metalness: 0.68, roughness: 0.46, envMapIntensity: 1.3 }), { saa: 1, ao: 1, haze: 1, bands: 1 });
const vitres = injectCommon(new THREE.MeshPhysicalMaterial({ color: col(0x0A0E15), metalness: 0.0, roughness: 0.05, ior: 1.52, specularIntensity: 1.0, envMapIntensity: 1.3, polygonOffset: OFFSET, polygonOffsetFactor: 1, polygonOffsetUnits: 2 }), { saa: 1, haze: 1, windows: 1, glass: 1 });
const flatRebord = new THREE.MeshBasicMaterial({ color: 0x9A9A9A }), flatVitres = new THREE.MeshBasicMaterial({ color: 0xE04040, polygonOffset: OFFSET, polygonOffsetFactor: 1, polygonOffsetUnits: 2 });
const reflMat = new THREE.MeshStandardMaterial({ color: col(0x6A6E78), metalness: 0.9, roughness: 0.55, envMapIntensity: 0.6 });

/* ── point lights helper (lamps, beacon) — declared before the base, which uses it ── */
const lightShader = { vertexShader: `attribute vec3 aCol; attribute float aSeed; uniform float uTime, uSize, uFogD; varying vec3 vC; varying float vA;
    void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); float dist = length(mv.xyz); float breathe = 0.9 + 0.1 * sin(uTime * (0.4 + aSeed * 0.6) + aSeed * 40.); vA = breathe * exp(-uFogD * dist); vC = aCol; gl_Position = projectionMatrix * mv; gl_PointSize = clamp(uSize / dist, 1.0, 8.0); }`,
  fragmentShader: `uniform vec3 uTint; varying vec3 vC; varying float vA; void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, .12, d) * vA; gl_FragColor = vec4(vC * uTint * a, a); }` };
const lightMats = [];
function makeLights(pos, cols, seeds, size, tint) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aCol', new THREE.Float32BufferAttribute(cols, 3)); g.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
  const m = new THREE.ShaderMaterial({ ...lightShader, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uSize: { value: size }, uFogD: { value: 0.012 }, uTint: { value: tint } } }); lightMats.push(m); const p = new THREE.Points(g, m); p.frustumCulled = false; scene.add(p); return p; }

/* ── waterfront: limestone terraces, planted beds and a continuous lake ── */
let water = null, rippleTex = null, reflection = null;
function gradTex(w, h, paint) { const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); return t; }

// long-wavelength ripple: enough to break the mirror, never enough to sparkle
rippleTex = (() => {
  const N = 256, c = document.createElement('canvas'); c.width = c.height = N;
  const g = c.getContext('2d'), img = g.createImageData(N, N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const u = x / N * 6.283, v = y / N * 6.283;
    const dx = Math.cos(u * 2) * 0.6 + Math.cos(u * 3 + v) * 0.4;
    const dy = Math.cos(v * 2) * 0.6 + Math.cos(v * 3 + u) * 0.4;
    const i = (y * N + x) * 4;
    img.data[i] = 128 + dx * 12; img.data[i + 1] = 128 + dy * 12;
    img.data[i + 2] = 255; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(14, 14);
  return t;
})();

const land = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.MeshStandardMaterial({
  color: col(0x17343b), roughness: 0.23, metalness: 0.58, envMapIntensity: 1.1,
  normalMap: rippleTex, normalScale: new THREE.Vector2(0.16, 0.12),
}));
land.rotation.x = -Math.PI / 2; land.position.y = 0; scene.add(land);
water = land;                       // the ripple animator drives this

/* A soft contact shadow, not a spotlight: the ground DARKENS under the tower,
   so the building is seated rather than lit from below like an exhibit. */
const contact = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshBasicMaterial({
  map: gradTex(256, 256, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0.00, 'rgba(2,3,6,0.92)');
    gr.addColorStop(0.22, 'rgba(3,4,8,0.66)');
    gr.addColorStop(0.55, 'rgba(4,5,10,0.26)');
    gr.addColorStop(1.00, 'rgba(6,7,12,0)');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }),
  transparent: true, depthWrite: false, fog: false,
}));
contact.rotation.x = -Math.PI / 2; contact.position.y = 0.007; scene.add(contact);

const paving = gradTex(512, 512, (g, w, h) => {
  g.fillStyle = '#8f8980'; g.fillRect(0, 0, w, h);
  for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
    const v = 126 + ((x * 7 + y * 11) % 14);
    g.fillStyle = `rgb(${v + 12},${v + 7},${v})`;
    g.fillRect(x * 64 + (y % 2) * 32 + 1, y * 64 + 1, 62, 62);
  }
});
paving.colorSpace = THREE.SRGBColorSpace;
paving.wrapS = paving.wrapT = THREE.RepeatWrapping; paving.repeat.set(1.2, 1.2);
const stone = new THREE.MeshStandardMaterial({ map: paving, color: 0xb8b2a6, roughness: .86, metalness: .03 });
const edgeStone = new THREE.MeshStandardMaterial({ color: 0x555a56, roughness: .82 });
const planting = new THREE.MeshStandardMaterial({ color: 0x263c30, roughness: 1 });
const warmEdge = new THREE.MeshBasicMaterial({ color: col(0xe8ba7e, .65) });
function shorePoint(a, scale = 1) {
  const r = 1 + .12 * Math.sin(a * 3 + .5) + .055 * Math.cos(a * 5);
  return new THREE.Vector2(Math.cos(a) * r * 2.35 * scale, Math.sin(a) * r * 1.55 * scale);
}
function terrace(scale, bottom, depth, material) {
  const points = Array.from({length: 96}, (_, i) => shorePoint(i / 96 * Math.PI * 2, scale));
  const geometry = new THREE.ExtrudeGeometry(new THREE.Shape(points), { depth, bevelEnabled: false, steps: 1, curveSegments: 1 });
  geometry.rotateX(-Math.PI / 2);
  const mesh = new THREE.Mesh(geometry, material); mesh.position.y = bottom; scene.add(mesh); return mesh;
}
terrace(1.05, -.025, .07, edgeStone);
terrace(1, .035, .065, stone);
// A curved arrival promenade connects the building to land beyond the lake.
const approach = new THREE.Shape();
approach.moveTo(-1.8, -.15);
approach.bezierCurveTo(-4.1, -.2, -5, 4.4, -14, 5.0);
approach.lineTo(-14, 6.1);
approach.bezierCurveTo(-4.3, 5.6, -3.8, 1.05, -1.6, .5);
approach.closePath();
const approachGeometry = new THREE.ExtrudeGeometry(approach, {depth: .075, bevelEnabled: false, curveSegments: 36});
approachGeometry.rotateX(-Math.PI / 2);
const promenade = new THREE.Mesh(approachGeometry, stone); promenade.position.y = .017; scene.add(promenade);
// Recessed shoreline lighting follows the irregular edge of the promenade.
const edgePoints = Array.from({length: 129}, (_, i) => {
  const p = shorePoint(i / 128 * Math.PI * 2, 1.012); return new THREE.Vector3(p.x, .055, -p.y);
});
const edgeCurve = new THREE.CatmullRomCurve3(edgePoints);
scene.add(new THREE.Mesh(new THREE.TubeGeometry(edgeCurve, 128, .006, 4, false), warmEdge));

// Small landscaped islands leave a clear paved arrival at the foot of the tower.
const beds = [[-1.28, -.22, .52, .30], [.95, -.67, .62, .23], [1.15, .60, .48, .24]];
for (const [x, z, sx, sz] of beds) {
  const bed = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.025, .035, 24), planting);
  bed.scale.set(sx, 1, sz); bed.position.set(x, .118, z); scene.add(bed);
}
const palmSites = [[-1.5, -.2], [-1.1, -.37], [1.0, -.62], [1.4, -.58], [.96, .59], [1.37, .64], [-1.5, .65], [-1.77, .40]];
const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(.009, .015, .26, 5),
  new THREE.MeshStandardMaterial({color: 0x72604a, roughness: 1}), palmSites.length);
const frondGeometry = new THREE.BufferGeometry();
frondGeometry.setAttribute('position', new THREE.Float32BufferAttribute([0,0,0, .065,.022,.026, .17,-.037,0, .065,.022,-.026], 3));
frondGeometry.setIndex([0,1,2,0,2,3]); frondGeometry.computeVertexNormals();
const fronds = new THREE.InstancedMesh(frondGeometry,
  new THREE.MeshStandardMaterial({ color: 0x365440, roughness: .9, side: THREE.DoubleSide }), palmSites.length * 7);
const dummy = new THREE.Object3D();
palmSites.forEach(([x,z], i) => {
  dummy.position.set(x, .25, z); dummy.rotation.set(0,0,0); dummy.updateMatrix(); trunks.setMatrixAt(i, dummy.matrix);
  for (let j=0; j<7; j++) { dummy.position.y = .385; dummy.rotation.y = j / 7 * Math.PI * 2 + i;
    dummy.updateMatrix(); fronds.setMatrixAt(i * 7 + j, dummy.matrix); }
});
scene.add(trunks, fronds);
const lampPos = [], lampCols = [], lampSeeds = [];
for (let i = 0; i < 34; i++) {
  const a = i / 34 * Math.PI * 2, p = shorePoint(a, .93);
  lampPos.push(p.x, .135, -p.y); lampCols.push(1, .71, .39); lampSeeds.push(i / 34);
}
makeLights(lampPos, lampCols, lampSeeds, 22, new THREE.Color(1, 1, 1));

// Low-cost background context: one instanced skyline, with understated windows.
const cityTex = gradTex(64, 128, (g,w,h) => {
  g.fillStyle = '#101923'; g.fillRect(0,0,w,h);
  for(let y=4;y<h;y+=8) for(let x=4;x<w;x+=8) {
    g.fillStyle = ((x * 13 + y * 7) % 19 < 6) ? '#9a8566' : '#172531';
    g.fillRect(x,y,2,3);
  }
});
cityTex.colorSpace = THREE.SRGBColorSpace;
const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),
  new THREE.MeshStandardMaterial({color: 0x75808b, map: cityTex, emissiveMap: cityTex,
    emissive: 0x8e795d, emissiveIntensity: .28, roughness: .85}), 128);
for(let i=0;i<128;i++) {
  const a = i / 128 * Math.PI * 2, r = 34 + (i * 17 % 13), h = .35 + (i * 7 % 13) * .12;
  dummy.position.set(Math.cos(a)*r, h/2-.07, Math.sin(a)*r);
  dummy.rotation.set(0,a,0); dummy.scale.set(.45+(i%3)*.22,h,.45+(i%4)*.2); dummy.updateMatrix(); city.setMatrixAt(i,dummy.matrix);
}
scene.add(city);

/* ── lights — the rig ── */
scene.add(new THREE.HemisphereLight(0x9aaec8, 0x39332c, 1.6));
const rimL = new THREE.DirectionalLight(0xffd8a5, 2.0); rimL.position.set(-4, 7, 5); scene.add(rimL);
const fillL = new THREE.DirectionalLight(0xa4c3e3, .7); fillL.position.set(6, 5, 8); scene.add(fillL);
const floods = []; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.3, x = Math.cos(a) * 1.75, z = Math.sin(a) * 1.75; const s = new THREE.SpotLight(0xF1D4A6, 26, 14, 0.5, 0.9, 1.5); s.position.set(x, 0.1, z); s.target.position.set(x * 0.3, 2.6, z * 0.3); scene.add(s, s.target); floods.push(s); }
const crown = new THREE.PointLight(0xF4EADD, 1.2, 3, 2); crown.position.set(0, 0.9 * H, 0); scene.add(crown);
const cursorLight = new THREE.PointLight(0xF4EADD, 12, 24, 1.6); cursorLight.position.set(5, 4, 6); scene.add(cursorLight);

/* ── aviation beacon ── */
const beaconMat = new THREE.SpriteMaterial({ color: col(0xFF3B2F, 1.0), transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, map: gradTex(64, 64, (g, w, h) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }) });
const beacon = new THREE.Sprite(beaconMat); beacon.scale.setScalar(0.09); beacon.position.set(0, H + 0.02, 0); scene.add(beacon);

/* ── tower: minimal GLB reader (2 materials, POSITION/NORMAL, uint32 indices, no textures) ── */
const tower = new THREE.Group(); scene.add(tower); let towerReady = false; const hint = (function () {
  const el = document.createElement('div');
  el.className = 'ring'; el.setAttribute('aria-hidden', 'true'); el.textContent = 'Drag';
  document.body.appendChild(el); return el;
})();
/* Transport: the model ships pre-gzipped (18.9 MB -> 4.1 MB) and is inflated in
   the browser with DecompressionStream, so no host configuration is needed. If
   the host has already applied Content-Encoding, the bytes arrive as a GLB and
   we detect that by its magic and skip inflation. Falls back to the plain file
   on any browser without DecompressionStream. */
const GLB_MAGIC = 0x46546C67;
async function fetchModel(onProgress) {
  const asset = mobile ? 'assets/burj.mobile.glb' : 'assets/burj.opt.glb';
  mount.dataset.model = mobile ? 'mobile' : 'full';
  const gzUrl = `${asset}.gz`, rawUrl = asset;
  if (typeof DecompressionStream === 'function') {
    try {
      const r = await fetch(gzUrl);
      if (r.ok) {
        const total = +r.headers.get('content-length') || 0;
        let got = 0;
        const counted = new TransformStream({
          transform(c, ctl) { got += c.length; onProgress && onProgress(total ? got / total : 0); ctl.enqueue(c); }
        });
        const head = await new Response(r.body.pipeThrough(counted)).arrayBuffer();
        const probe = new DataView(head);
        if (head.byteLength >= 4 && probe.getUint32(0, true) === GLB_MAGIC) {
          return new Uint8Array(head);                    // host already inflated it
        }
        const inflated = await new Response(
          new Blob([head]).stream().pipeThrough(new DecompressionStream('gzip'))
        ).arrayBuffer();
        onProgress && onProgress(1);
        return new Uint8Array(inflated);
      }
    } catch (e) { console.warn('[scene] gzip transport unavailable, using the plain model', e); }
  }
  const res = await fetch(rawUrl);
  if (!res.ok) throw new Error(res.status);
  const total = +res.headers.get('content-length') || 0;
  const reader = res.body.getReader(); const chunks = []; let got = 0;
  for (;;) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); got += value.length; onProgress && onProgress(total ? got / total : 0); }
  const out = new Uint8Array(got); let o = 0; for (const c of chunks) { out.set(c, o); o += c.length; }
  return out;
}

async function loadGLB(onProgress) {
  const buf = await fetchModel(onProgress);
  const dv = new DataView(buf.buffer), len = dv.getUint32(8, true); let off = 12, json = null, bin = null;
  while (off < len) { const cl = dv.getUint32(off, true), ct = dv.getUint32(off + 4, true); const data = buf.buffer.slice(off + 8, off + 8 + cl); if (ct === 0x4E4F534A) json = JSON.parse(new TextDecoder().decode(data)); else if (ct === 0x004E4942) bin = data; off += 8 + cl; }
  const T = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array }, N = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
  const acc = i => { const a = json.accessors[i], bv = json.bufferViews[a.bufferView], C = T[a.componentType], n = N[a.type], bo = (bv.byteOffset || 0) + (a.byteOffset || 0); return new C(bin.slice(bo, bo + a.count * n * C.BYTES_PER_ELEMENT)); };
  const group = new THREE.Group();
  const visit = (ni, parent) => { const nd = json.nodes[ni], m = new THREE.Matrix4(); if (nd.matrix) m.fromArray(nd.matrix); else m.compose(new THREE.Vector3(...(nd.translation || [0, 0, 0])), new THREE.Quaternion(...(nd.rotation || [0, 0, 0, 1])), new THREE.Vector3(...(nd.scale || [1, 1, 1]))); const world = parent.clone().multiply(m);
    if (nd.mesh !== undefined) for (const pr of json.meshes[nd.mesh].primitives) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(acc(pr.attributes.POSITION), 3)); if (pr.attributes.NORMAL !== undefined) g.setAttribute('normal', new THREE.BufferAttribute(acc(pr.attributes.NORMAL), 3)); if (pr.indices !== undefined) g.setIndex(new THREE.BufferAttribute(acc(pr.indices), 1)); g.applyMatrix4(world); if (!g.attributes.normal) g.computeVertexNormals();
      const name = pr.material !== undefined ? (json.materials[pr.material].name || '') : ''; const mesh = new THREE.Mesh(g, /vitres/i.test(name) ? vitres : rebord); mesh.userData.kind = /vitres/i.test(name) ? 'vitres' : 'rebord'; group.add(mesh); }
    (nd.children || []).forEach(c => visit(c, world)); };
  json.scenes[json.scene || 0].nodes.forEach(n => visit(n, new THREE.Matrix4())); return group;
}
function fitTower(root) { const box = new THREE.Box3().setFromObject(root), size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3()); const k = H / Math.max(size.y, 1e-6);
  const m = new THREE.Matrix4().makeScale(k, k, k).multiply(new THREE.Matrix4().makeTranslation(-ctr.x, -(ctr.y - size.y / 2), -ctr.z)); root.traverse(o => { if (o.isMesh) { o.geometry.applyMatrix4(m); o.geometry.computeBoundingSphere(); } }); }
function standIn() { const g = new THREE.Group(); let y = 0; for (const [r, h] of [[1.3, 1.5], [1.0, 1.4], [0.78, 1.2], [0.56, 1.0], [0.35, 0.55], [0.14, 0.4]]) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.85, r, h, 6), rebord); m.userData.kind = 'rebord'; m.position.y = y + h / 2; g.add(m); y += h; } const s = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.08, H - y, 6), rebord); s.userData.kind = 'rebord'; s.position.y = y + (H - y) / 2; g.add(s); g.updateMatrixWorld(true); g.traverse(o => { if (o.isMesh) o.geometry.applyMatrix4(o.matrixWorld); }); g.children.forEach(c => { c.position.set(0, 0, 0); }); return g; }
(async () => {
  // Defer the phone model download until the model area approaches the screen.
  if (mobile && 'IntersectionObserver' in window) await new Promise(resolve => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) { observer.disconnect(); resolve(); }
    }, {rootMargin: '400px'}); observer.observe(mount);
  });
  let root;
  try { root = NOMODEL ? standIn() : await loadGLB(p => {
    document.querySelector('.hero__status > span').textContent = p > 0
      ? `Loading the tower · ${Math.round(p * 100)}%` : 'Preparing the view…';
  }); }
  catch (e) { console.warn('[scene] using the photographic fallback', e); usePhoto(); return; }
  fitTower(root); root.position.y = 0.105; tower.add(root);
  if (FLAT) root.traverse(o => { if (o.isMesh) o.material = o.userData.kind === 'vitres' ? flatVitres : flatRebord; });
  // the reflection is the tower's own lit glass, mirrored (the floods do not reach below the water, so the emissive windows must carry it); tier C skips it
  if (water && tier !== 'C' && BASE === 'reflection') { const reflGlass = vitres.clone(); reflGlass.polygonOffset = false; reflGlass.envMapIntensity = 0.8; reflGlass.onBeforeCompile = vitres.onBeforeCompile; reflGlass.customProgramCacheKey = vitres.customProgramCacheKey;
    reflection = root.clone(true); reflection.traverse(o => { if (o.isMesh) o.material = o.userData.kind === 'vitres' ? reflGlass : reflMat; }); reflection.scale.y = -1; reflection.position.y = -0.08; scene.add(reflection); }
  towerReady = true;
  if (!unavailable) {
    document.querySelector('.hero__explorer').hidden = false;
    document.querySelector('.hero__status').hidden = true;
  }
  hint.textContent = 'Drag to look around'; needsRender = true;
})();

/* ── post: depth pass → DoF · bloom with firefly clamp · ACES · temporal accumulation ── */
const RT = (w, h, samples = 0, depth = true) => new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, depthBuffer: depth, samples, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
let rtScene, rtDepth, rtHalfA, rtHalfB, rtQuartA, rtQuartB, rtBlurA, rtBlurB, rtOut, rtHistA, rtHistB, histValid = false;
const depthMat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), quadScene = new THREE.Scene(), quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null); quad.frustumCulled = false; quadScene.add(quad);
const VS = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }`;
const copyMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { tDiffuse: { value: null } }, vertexShader: VS, fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ gl_FragColor = texture2D(tDiffuse, vUv); }` });
const brightMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { tDiffuse: { value: null } }, vertexShader: VS, fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ vec3 c = min(texture2D(tDiffuse, vUv).rgb, vec3(3.0)); float l = dot(c, vec3(.2126,.7152,.0722)); gl_FragColor = vec4(c * smoothstep(0.85, 1.6, l), 1.); }` });
const blurMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { tDiffuse: { value: null }, uDir: { value: new THREE.Vector2(1, 0) }, uTexel: { value: new THREE.Vector2() } }, vertexShader: VS, fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 uDir, uTexel; varying vec2 vUv; void main(){ vec2 o1 = uDir*uTexel*1.3846153846, o2 = uDir*uTexel*3.2307692308; vec4 c = texture2D(tDiffuse, vUv)*.2270270270; c += (texture2D(tDiffuse, vUv+o1)+texture2D(tDiffuse, vUv-o1))*.3162162162; c += (texture2D(tDiffuse, vUv+o2)+texture2D(tDiffuse, vUv-o2))*.0702702703; gl_FragColor = c; }` });
const compMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { tScene: { value: null }, tBlur: { value: null }, tDepth: { value: null }, tBloomA: { value: null }, tBloomB: { value: null }, uFocus: { value: 11 }, uNear: { value: 1.5 }, uFar: { value: 700 }, uDof: { value: DOF ? 1 : 0 }, uBloom: { value: 0.32 }, uExposure: { value: EXPOSURE }, uVignette: { value: 0.3 } }, vertexShader: VS, fragmentShader: `
  #include <packing>
  uniform sampler2D tScene, tBlur, tDepth, tBloomA, tBloomB; uniform float uFocus, uNear, uFar, uDof, uBloom, uExposure, uVignette; varying vec2 vUv;
  vec3 fit(vec3 v){ vec3 a = v*(v+.0245786)-.000090537; vec3 b = v*(.983729*v+.4329510)+.238081; return a/b; }
  vec3 aces(vec3 c){ const mat3 I = mat3(.59719,.07600,.02840,.35458,.90834,.13383,.04823,.01566,.83777); const mat3 O = mat3(1.60475,-.10208,-.00327,-.53108,1.10813,-.07276,-.07367,-.00605,1.07602); return clamp(O*fit(I*c),0.,1.); }
  void main(){ vec3 sharp = texture2D(tScene, vUv).rgb; float z = unpackRGBAToDepth(texture2D(tDepth, vUv)); float dist = -perspectiveDepthToViewZ(z, uNear, uFar);
    float far = smoothstep(uFocus * 1.2, uFocus * 3.4, dist), near = smoothstep(uFocus * 0.6, uFocus * 0.26, dist); float coc = clamp(max(far * 0.85, near), 0., 1.) * uDof;
    vec3 c = mix(sharp, texture2D(tBlur, vUv).rgb, coc); c += (texture2D(tBloomA, vUv).rgb * .5 + texture2D(tBloomB, vUv).rgb * .9) * uBloom; c *= uExposure / .6; c = aces(c);
    vec2 d = vUv - .5; c *= 1. - uVignette * smoothstep(.35, 1.1, length(d * vec2(1., .9)) * 1.35); gl_FragColor = vec4(c, 1.); }` });
const taaMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { tCur: { value: null }, tHist: { value: null }, uK: { value: 0 } }, vertexShader: VS, fragmentShader: `uniform sampler2D tCur, tHist; uniform float uK; varying vec2 vUv; void main(){ gl_FragColor = mix(texture2D(tCur, vUv), texture2D(tHist, vUv), uK); }` });
const outMat = new THREE.ShaderMaterial({ depthTest: false, depthWrite: false, uniforms: { tDiffuse: { value: null } }, vertexShader: VS, fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv; vec3 srgb(vec3 c){ return mix(12.92*c, 1.055*pow(c, vec3(1./2.4))-.055, step(vec3(.0031308), c)); } void main(){ gl_FragColor = vec4(srgb(clamp(texture2D(tDiffuse, vUv).rgb, 0., 1.)), 1.); }` });
function pass(m, t) { quad.material = m; renderer.setRenderTarget(t); renderer.render(quadScene, quadCam); }
function blur(src, tmp, r) { blurMat.uniforms.uTexel.value.set(r / src.width, r / src.height); blurMat.uniforms.tDiffuse.value = src.texture; blurMat.uniforms.uDir.value.set(1, 0); pass(blurMat, tmp); blurMat.uniforms.tDiffuse.value = tmp.texture; blurMat.uniforms.uDir.value.set(0, 1); pass(blurMat, src); }
// Desktop keeps full geometry and native pixel density (up to 2x), even if
// expensive post effects adapt. Only phones use the dedicated lightweight path.
const DPR = () => Math.min(devicePixelRatio || 1, mobile ? 1 : 2);
let W = 2, Hh = 2;
function layout() { const d = DPR(), width = mount.clientWidth, height = mount.clientHeight;
  W = Math.max(2, Math.floor(width * d)); Hh = Math.max(2, Math.floor(height * d));
  renderer.setPixelRatio(1); renderer.setSize(width, height, false); canvas.width = W; canvas.height = Hh;
  renderer.setViewport(0, 0, W, Hh); camera.aspect = width / height; camera.updateProjectionMatrix();
  [rtScene, rtDepth, rtHalfA, rtHalfB, rtQuartA, rtQuartB, rtBlurA, rtBlurB, rtOut, rtHistA, rtHistB].forEach(t => t && t.dispose());
  // Mobile renders directly to screen: no full-screen render targets or post passes.
  if (tier === 'C') { needsRender = true; return; }
  rtScene = RT(W, Hh, tier === 'A' ? 4 : tier === 'B' ? 2 : 0); rtDepth = new THREE.WebGLRenderTarget(W >> 1, Hh >> 1, { depthBuffer: true }); rtHalfA = RT(W >> 1, Hh >> 1, 0, false); rtHalfB = RT(W >> 1, Hh >> 1, 0, false); rtQuartA = RT(W >> 2, Hh >> 2, 0, false); rtQuartB = RT(W >> 2, Hh >> 2, 0, false); rtBlurA = RT(W >> 1, Hh >> 1, 0, false); rtBlurB = RT(W >> 1, Hh >> 1, 0, false);
  rtOut = RT(W, Hh, 0, false); rtHistA = RT(W, Hh, 0, false); rtHistB = RT(W, Hh, 0, false); histValid = false;
  compMat.uniforms.uNear.value = camera.near; compMat.uniforms.uFar.value = camera.far; needsRender = true; }
addEventListener('resize', layout);
new ResizeObserver(layout).observe(mount);

/* ── the rig (from hero-v2): critically damped springs, momentum yaw, crane on scroll, wheel dolly, viewpoints ── */
class Spring { constructor(x, k, z = 1) { this.x = x; this.v = 0; this.t = x; this.k = k; this.c = 2 * Math.sqrt(k) * z; } step(dt) { const a = -this.k * (this.x - this.t) - this.c * this.v; this.v += a * dt; this.x += this.v * dt; return this.x; } }
const VIEWS = { 1: { dist: 8.4, look: .85, pitch: .28, lookX: 1.65 }, 2: { dist: 15.2, look: 2.8, pitch: .16, lookX: 3.0 }, 3: { dist: 5.8, look: 5.15, pitch: .09, lookX: 1.2 } };
const HOME = VIEWS[2];
const rig = { yaw: -0.42, yawVel: 0, pitch: new Spring(HOME.pitch, 26), dist: new Spring(HOME.dist, 12), look: new Spring(HOME.look, 12), lookX: new Spring(HOME.lookX, 10), panX: new Spring(0, 42), panY: new Spring(0, 42), scroll: new Spring(0, 9) };
let view = HOME, dragging = false, lastX = 0, lastY = 0, lastInput = -1e9, ptrX = 0, ptrY = 0, dollyZ = 0;
const viewButtons = [...document.querySelectorAll('[data-view]')];
const interaction = document.querySelector('.hero__interaction');
const setView = v => { view = v; rig.dist.t = v.dist; rig.look.t = v.look; rig.pitch.t = v.pitch; rig.lookX.t = v.lookX;
  viewButtons.forEach(b => b.setAttribute('aria-pressed', String(VIEWS[b.dataset.view] === v)));
  dollyZ = 0; lastInput = performance.now(); needsRender = true; };
viewButtons.forEach(b => b.addEventListener('click', () => setView(VIEWS[b.dataset.view])));
const motionButton = document.querySelector('.viewbtn--motion');
function syncMotion() { motionButton.textContent = motion ? 'Pause' : 'Rotate';
  motionButton.setAttribute('aria-label', motion ? 'Pause automatic rotation' : 'Start automatic rotation');
  motionButton.setAttribute('aria-pressed', String(!motion)); }
function toggleMotion() { motion = !motion; rig.yawVel = 0; syncMotion(); needsRender = true; }
motionButton.addEventListener('click', toggleMotion); syncMotion();
interaction.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY;
  interaction.setPointerCapture(e.pointerId); lastInput = performance.now(); });
interaction.addEventListener('pointermove', e => {
  const r = interaction.getBoundingClientRect(); ptrX = ((e.clientX-r.left) / r.width - .5) * 2;
  ptrY = ((e.clientY-r.top) / r.height - .5) * 2;
  if (dragging) { const dx = e.clientX-lastX, dy = e.clientY-lastY; lastX = e.clientX; lastY = e.clientY;
    rig.yaw += dx * .005; rig.yawVel = 0;
    if (e.pointerType === 'mouse') rig.pitch.t = THREE.MathUtils.clamp(rig.pitch.t + dy * .0016, -.08, .38);
    lastInput = performance.now(); } needsRender = true; });
const endDrag = () => { dragging = false; lastInput = performance.now(); };
interaction.addEventListener('pointerup', endDrag); interaction.addEventListener('pointercancel', endDrag);
interaction.addEventListener('pointerleave', () => { ptrX = 0; ptrY = 0; needsRender = true; });
interaction.addEventListener('dblclick', () => setView(HOME));
interaction.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { rig.yaw += e.key === 'ArrowLeft' ? -.12 : .12; e.preventDefault(); }
  if (VIEWS[e.key]) setView(VIEWS[e.key]);
  if (e.key === ' ') { toggleMotion(); e.preventDefault(); }
  lastInput = performance.now(); needsRender = true;
});
const heroEl = document.querySelector('.hero');
const copyEl = document.querySelector('.hero__copy'); let scrollN = 0;
function readScroll() { scrollN = S_OVER !== null ? S_OVER : 0; }
addEventListener('scroll', readScroll, { passive: true }); readScroll();

/* ── tiers ── */
let frames = 0, accum = 0, tierDecided = q.has('tier') || mobile;
let renderedFrames = 0;
function recordRender() {
  if (!q.has('diagnostics')) return;
  mount.dataset.frames = String(++renderedFrames);
  mount.dataset.triangles = String(renderer.info.render.triangles);
  mount.dataset.drawCalls = String(renderer.info.render.calls);
}
function applyTier(t) { tier = t; compMat.uniforms.uDof.value = (t === 'C' || !DOF) ? 0 : 1;
  mount.dataset.quality = t;
  compMat.uniforms.uBloom.value = t === 'C' ? 0 : .18;
  renderer.toneMapping = t === 'C' ? THREE.ACESFilmicToneMapping : THREE.NoToneMapping;
  renderer.toneMappingExposure = 1.25;
  floods.forEach((s, i) => s.visible = t === 'A' && i % 2 === 0);
  crown.visible = cursorLight.visible = t !== 'C'; layout(); }
applyTier(tier);

/* ── frame ── */
/* The canvas belongs to the hero. Offscreen, leave its last frame intact and
   stop GPU work; visibility must not depend on an observer callback. */
let heroOnScreen = true, tabVisible = !document.hidden;
document.addEventListener('visibilitychange', () => { tabVisible = !document.hidden; if (tabVisible) needsRender = true; });
if (heroEl && 'IntersectionObserver' in window) {
  new IntersectionObserver((en) => {
    heroOnScreen = en[0].isIntersecting;
    if (heroOnScreen) needsRender = true;
  }, { rootMargin: '0px' }).observe(mount);
}

const clock = new THREE.Clock(); let t = STILL ? 4 : 0; const prevCam = new THREE.Vector3(); let prevYaw = 0, lastFrame = 0;
function frame(now = 0) {
  requestAnimationFrame(frame);
  if (!heroOnScreen || !tabVisible || unavailable) { clock.getDelta(); return; }
  if (mobile && now - lastFrame < 32) return;
  lastFrame = now;
  if (skyReady) { skyReady = false; buildEnvironment(); }
  const dt = Math.min(clock.getDelta(), 0.05); if (!STILL) t += dt;
  if (!tierDecided && towerReady && !STILL) { frames++; accum += dt; if (frames === 90) { const ms = accum / frames * 1000; tierDecided = true; if (ms > 40) applyTier('C'); else if (ms > 24) applyTier('B'); } }
  if (!dragging) { const idle = motion && performance.now() - lastInput > 5000; rig.yawVel += ((idle ? 0.02 : 0) - rig.yawVel) * (1 - Math.exp(-dt / (idle ? 2.5 : 0.55))); }
  rig.yaw += rig.yawVel * dt;
  rig.scroll.t = scrollN; const s = rig.scroll.step(dt);
  const narrow = mount.clientWidth < 1024;
  const fit = narrow && view === HOME ? .92 * Math.max(1, .70 / camera.aspect) : 1;
  rig.dist.t = view.dist * fit + dollyZ + s * 4.6;
  rig.look.t = (narrow && view === HOME ? 2.35 : view.look) + s * 1.3;
  rig.lookX.t = narrow ? 0 : view.lookX - s * 1.2;
  rig.panX.t = motion && !mobile ? ptrX * .12 : 0; rig.panY.t = motion && !mobile ? -ptrY * .08 : 0;
  const dist = rig.dist.step(dt), lookY = rig.look.step(dt), lookX = rig.lookX.step(dt), pitch = rig.pitch.step(dt) + s * 0.16, panX = rig.panX.step(dt), panY = rig.panY.step(dt), yaw = rig.yaw + s * 0.42;
  const look = new THREE.Vector3(0, lookY, 0);
  camera.position.set(Math.sin(yaw) * Math.cos(pitch) * dist, Math.max(0.45, lookY + Math.sin(pitch) * dist), Math.cos(yaw) * Math.cos(pitch) * dist);
  const right = new THREE.Vector3().subVectors(look, camera.position).cross(camera.up).normalize(); camera.position.addScaledVector(right, -lookX + panX); look.addScaledVector(right, -lookX); camera.position.y += panY; camera.lookAt(look);
  compMat.uniforms.uFocus.value = camera.position.distanceTo(new THREE.Vector3(0, lookY, 0));
  const az = yaw + ptrX * 1.4; cursorLight.position.set(Math.sin(az) * 5.0, 3.6 - ptrY * 2.0, Math.cos(az) * 5.0);
  // slow lake drift (long wavelength, tiny amplitude) — under reduced motion the water is still
  if (rippleTex && motion) { rippleTex.offset.x += dt * 0.006; rippleTex.offset.y += dt * 0.004; }
  const shaders = [rebord, vitres].map(m => m.userData.shader).filter(Boolean); shaders.forEach(sh => sh.uniforms.uTime.value = t); lightMats.forEach(m => m.uniforms.uTime.value = t);
  beaconMat.opacity = motion ? 0.25 + 0.55 * Math.pow(Math.max(0, Math.sin(t * Math.PI / 1.5)), 6) : 0.35;   // a slow aviation beacon, dim
  copyEl.style.opacity = String(1 - Math.min(1, Math.max(0, (s - 0.12) / 0.3)));

  const camSpeed = prevCam.distanceTo(camera.position) / Math.max(dt, 1e-3) + Math.abs(rig.yaw - prevYaw) / Math.max(dt, 1e-3) * 4; prevCam.copy(camera.position); prevYaw = rig.yaw;
  const moving = dragging || camSpeed > .003 || Math.abs(rig.yawVel) > 1e-3 ||
    [rig.scroll, rig.panX, rig.panY, rig.pitch, rig.dist, rig.look, rig.lookX].some(spring => Math.abs(spring.x-spring.t) > 1e-3);
  if ((heroOnScreen && tabVisible) && (needsRender || moving || motion || STILL)) {
    if (tier === 'C') { renderer.setRenderTarget(null); renderer.render(scene, camera); recordRender(); needsRender = false; return; }
    renderer.setRenderTarget(rtScene); renderer.render(scene, camera);
    recordRender();
    if (compMat.uniforms.uDof.value > 0 && !FLAT) { scene.overrideMaterial = depthMat; const f = scene.fog; scene.fog = null; renderer.setRenderTarget(rtDepth); renderer.render(scene, camera); scene.overrideMaterial = null; scene.fog = f; copyMat.uniforms.tDiffuse.value = rtScene.texture; pass(copyMat, rtBlurA); blur(rtBlurA, rtBlurB, 1.8); blur(rtBlurA, rtBlurB, 1.8); }
    if (compMat.uniforms.uBloom.value > 0 && !FLAT) { brightMat.uniforms.tDiffuse.value = rtScene.texture; pass(brightMat, rtHalfA); blur(rtHalfA, rtHalfB, 1.5); copyMat.uniforms.tDiffuse.value = rtHalfA.texture; pass(copyMat, rtQuartA); blur(rtQuartA, rtQuartB, 2.2); blur(rtQuartA, rtQuartB, 2.2); }
    if (FLAT) { copyMat.uniforms.tDiffuse.value = rtScene.texture; pass(copyMat, null); }
    else {
      compMat.uniforms.tScene.value = rtScene.texture; compMat.uniforms.tBlur.value = rtBlurA.texture; compMat.uniforms.tDepth.value = rtDepth.texture; compMat.uniforms.tBloomA.value = rtHalfA.texture; compMat.uniforms.tBloomB.value = rtQuartA.texture;
      pass(compMat, rtOut);
      // temporal accumulation: strong when the camera is nearly still (kills sub-pixel sparkle), released on movement (no ghosting)
      const k = TAA && histValid ? THREE.MathUtils.clamp(0.62 - camSpeed * 0.9, 0, 0.62) : 0;
      taaMat.uniforms.tCur.value = rtOut.texture; taaMat.uniforms.tHist.value = rtHistA.texture; taaMat.uniforms.uK.value = k; pass(taaMat, rtHistB);
      outMat.uniforms.tDiffuse.value = rtHistB.texture; pass(outMat, null); [rtHistA, rtHistB] = [rtHistB, rtHistA]; histValid = true;
    }
    needsRender = false;
  }
}
layout(); frame();
