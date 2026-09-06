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
| `js/scene.js` | WebGL hero — Burj Khalifa, lighting rig, cursor light, reflection probe |
| `js/main.js` | Reveals, line-splitting, counters, nav, parallax |
| `js/mark.js` | The logo traced to SVG paths |
| `DIRECTION.md` | Art direction bible — concept, palette, type, motion, WebGL law |
| `STRUCTURE.md` | Site architecture, copy, and choreography |
| `prototype/` | Design prototypes: nav, logo motion system, crystal hero |
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

## Outstanding

- Optimise `assets/burj.glb` (23.8MB, 661k triangles — needs Draco/decimation)
- Integrate the elevation-rail nav and full logo motion system from `prototype/`
- Replace remaining stock photography
- Confirm the seven disputed price figures with the client
- Replace `assets/lens/` with versions free of the "rawr." sticker
