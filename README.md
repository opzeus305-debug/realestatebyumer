# Real Estate by Umer

Marketing site for **Muhammad Umer Riaz** — property investment consultant, Dubai.

> **The numbers first. Then the view.**

A static site: no build step, no framework. Open `index.html` or serve the
folder and it runs.

```bash
python -m http.server 5173
# → http://localhost:5173
```

## Structure

| Path | What it is |
|---|---|
| `index.html` | The homepage — the whole site so far |
| `css/tokens.css` | Design tokens: colour, type scale, spacing, easing, duration |
| `css/base.css` | Reset, typography, grid, the four reveal animations |
| `css/sections.css` | Per-section layout |
| `css/mark.css` | The UMER mark (traced SVG) and its motion |
| `js/scene.js` | WebGL hero — Burj Khalifa at blue hour over Burj Lake; aluminium/glass shading, per-window lights, specular anti-aliasing, drag/zoom/viewpoints |
| `js/main.js` | Reveals, line-splitting, counters, nav, parallax |
| `js/mark.js` | The logo traced to SVG paths |
| `DIRECTION.md` | Art direction bible — concept, palette, type, motion, WebGL law |
| `STRUCTURE.md` | Site architecture, copy, and choreography |
| `prototype/` | Design prototypes: nav (elevation instrument), logo motion system, crystal hero, hero-v2 (background), tower-v2 (realistic tower + shimmer diagnosis) |
| `_research/` | Research dossier, live inventory, extracted developer PDFs |

## Design

Concept: **Measured Ascent** — the site is a climb up the tower in the logo.
Evidence at the base, method in the middle, the view at the top.

- **Ground** `#0A0B12` · **Champagne** `#EAD2AE` (sampled from the logo's own pixels)
- **Fraunces** display · **Jost** text · **DM Mono** data
- 16px type floor throughout; hierarchy below ~20px comes from weight, tracking and colour
- Full rationale in [`DIRECTION.md`](DIRECTION.md)

## Data

Market figures are Dubai Land Department, January–August 2026
(AED 523.44B across 148,564 transactions), verified September 2026.
Project prices are indicative starting prices supplied by the agent and
change frequently — see [`_research/INVENTORY.md`](_research/INVENTORY.md).

## Assets

- Logo: the client's own
- Portraits: the client's own
- `assets/lens/`: photographs taken by Umer
- `assets/emaar/`: official developer renders (Marèva at The Oasis)
- `assets/stock/`, `assets/img/`: Unsplash — free for commercial use — **placeholders**,
  to be replaced with the client's own photography
- `assets/burj.glb`: free Burj Khalifa model via Sketchfab

## Interaction

The hero tower has drag-to-rotate, double-click to reset, and three viewpoints:
Waterfront / Full height / Crown. The focused model area also accepts arrow
keys, 1/2/3 for viewpoints, and Space to pause or resume automatic rotation.
The model sits on a paved waterfront promenade with planting, palms and edge
lighting, under a dusk sky. The setting is an artistic interpretation.

Desktop retains the original **661,662-triangle model** and native rendering
resolution up to **2× device pixel ratio**, with antialiasing and adaptive post
effects. Reducing desktop effects never substitutes the mobile geometry or
lowers the desktop pixel ratio.

Phones use `assets/burj.mobile.glb.gz`: **56,334 triangles, 705 KB compressed,
two model draw calls**. This LOD is derived from the original attributed model;
rebuild with `python _research/build_mobile_model.py` (numpy and
fast-simplification required). It uses one direct render pass, a 1× pixel ratio,
and a 30 fps interaction cap. Automatic rotation starts paused on phones and
for reduced-motion visitors; the renderer rests once interaction settles and
when its area leaves the screen. The phone model download waits until its area
approaches the viewport. A photographic hero remains available if WebGL or
the model fails, with a visible reload control. Temporary WebGL context loss
recovers automatically when the browser restores it. Three.js r180 is vendored
under `assets/vendor/three/` with its MIT license, so the model does not depend
on an external JavaScript CDN.

Append `?diagnostics=1` during development to inspect model selection, quality,
actual rendered-frame count, triangles and draw calls in `#scene` data attributes.

## Outstanding

- The full desktop GLB remains intentionally detailed; the mobile LOD ships separately.
- Integrate the elevation-rail nav and the full logo motion system from
  `prototype/nav.html` and `prototype/logo.html`
- Replace remaining stock photography with the client's own
- Confirm the seven disputed price figures with the client
  (see `_research/INVENTORY.md`)
- Replace `assets/lens/` with versions free of the "rawr." sticker
- Remaining items on the ordered fix list in [`REVIEW.md`](REVIEW.md) §B.11

## Credits

3D model: ["( FREE ) Burj Khalifa Dubai"](https://sketchfab.com/3d-models/free-burj-khalifa-dubai-c1d6f5884c9c4a56b8d8f9c5555f1902)
by [SDC PERFORMANCE™](https://sketchfab.com/3Duae), licensed
[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). **Attribution is a
condition of this licence** — the credit in the site footer must not be removed.

The model ships optimised: indices narrowed from uint32 to uint16 (every
primitive is under 65,536 vertices), which is lossless and takes it from
22.7MB to 18.9MB, then gzipped to **4.1MB**. `js/scene.js` inflates it in the
browser with `DecompressionStream`, so no host configuration is required, and
falls back to the plain file where that API is missing. Rebuild with
`python _research/optimize_glb.py`.

Sky: `assets/img/sky-dusk.webp` supplies subtle photographic cloud detail to
the dusk shader, with a directional warm horizon and cool upper atmosphere.
The same sky supplies the reflection environment. The source is
`assets/stock/dusk-wide.jpg` (Unsplash), processed by `_research/make_sky.py`.
