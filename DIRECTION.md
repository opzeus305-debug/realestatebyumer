# REAL ESTATE BY UMER — ART DIRECTION BIBLE
**Concept: MEASURED ASCENT**
Version 1.0 · 6 September 2026 · Art direction & design lead document
Companion: `STRUCTURE.md` (architecture, copy, scroll choreography) · `prototype/crystal.html` (proof of visual language)

This document is the source of truth for every visual and motion decision on realestatebyumer.com. It is written to be built from. Where a value is given, use the value. Where a rule is given, it is a rule, not a suggestion. Deviations require a reason written down.

---

## 0. HOW TO READ THIS

| Section | What it settles |
|---|---|
| 1 | The one idea the whole site expresses, and its five laws |
| 2 | Colour: tokens, hex, contrast, usage rules |
| 3 | Type: three families, modular scale with `clamp()`, weights, tracking, numerals |
| 4 | Space, grid, breakpoints, the "setback" composition rule |
| 5 | Motion: curves, durations, scroll choreography, stagger, what never moves |
| 6 | WebGL: material, light and camera specification for the four set-pieces |
| 7 | Photography and render treatment |
| 8 | Component inventory with visual specs |
| 9 | Accessibility and reduced-motion strategy |
| 10 | Performance budget and quality tiers |
| 11 | Reference canon and what we take from each |

---

## 1. CONCEPT — MEASURED ASCENT

### 1.1 The idea in one sentence
**The site is a climb up the tower in the logo: you start on the ground with the numbers, and you earn the view.**

The logo already contains the whole story. "UMER" is drawn as Burj Khalifa massing: four shafts of different heights, Art-Deco setbacks stepping inward as they rise, a needle spire growing out of the M. Read as a diagram, it says: *wide, solid base → disciplined narrowing → a single point at the top.* That is exactly how Umer works. Evidence at the base. Method in the middle. A precise recommendation at the top. Then, from the top, the view.

So the site is structured as an ascent. Each section is a level. The user scrolls upward through the argument. The lifestyle imagery, the terraces, the water, the blue-hour skyline, is placed near the *top* of the ascent, not the bottom, because on this site lifestyle is the reward for a good decision, not the bait for a bad one.

### 1.2 The spine sentence
> **The numbers first. Then the view.**

This is the hero headline, the brand line on the business card, and the ordering principle for every page. If a section cannot be placed on the ascent from evidence to view, it does not belong.

### 1.3 Five laws (test every screen against these)

1. **Evidence before adjectives.** A number, a date, a source, or a plan appears before any descriptive word. The word "luxury" is never used in body copy. The site *is* luxurious; it does not say so.
2. **Space is the luxury.** Minimum 40% of any viewport is empty ground. Where a competitor puts a second image, we put nothing.
3. **One light source.** Every scene, photograph, and 3D object is lit by a single warm champagne key from above-left with a cool indigo rim from behind-right. This consistency is what makes disparate assets feel like one house.
4. **Gold is light, never paint.** Champagne is used as *illumination* (glows, edges, highlights on glass, hairlines, a single word) and never as large flat fills, never as backgrounds, never as gold-plated decoration. If more than 8% of a viewport is champagne, something is wrong.
5. **Motion has a reason.** Everything that moves either (a) reveals structure, (b) responds to the user, or (c) tells the ascent story. Nothing loops for decoration. Text never moves once it is read.

### 1.4 Tone words
Measured · Quiet · Architectural · Evidential · Warm at the edges · Unhurried

### 1.5 Anti-tone (what this site is not)
Not a lifestyle agent's Instagram. Not a developer's launch microsite. Not a fintech dashboard. Not a "Dubai glamour" reel. Not Likova with the colours swapped.

---

## 2. COLOUR SYSTEM

### 2.1 Philosophy
Two materials only: **night** and **champagne glass**. Night is the ground; champagne is light hitting glass. A warm cream carries the words. There is no second hue in the UI. A single atmospheric mauve-indigo is permitted *only* inside WebGL fog and photographic grading, because Dubai's blue hour is not neutral and pretending otherwise looks cheap.

The ground is deliberately **not** Likova's navy (#070B20). Ours is a warm-black with a trace of indigo, so the champagne sits on it like light on a night window rather than gold on blue.

### 2.2 Sampled from the logo
Pure-Python decode of `_research/assets/umer-logo-gradient1-1.png`, opaque pixels only, quantised. These are the brand's actual champagne, not an approximation:

| Sample | Hex | Where it appears in the logo |
|---|---|---|
| Deepest gold (p02 luminance) | `#D9B484` | Left edge of the U, shadow side of shafts |
| Body gold (dominant) | `#DEC6A2` / `#EAD2AE` | The main surface of every letterform |
| Highlight (p75) | `#F4EADD` | The specular sweep through the M and E |
| Specular (p90+) | `#FDFBF9` → `#FFFFFF` | The white flash across the M's arch |

The logo gold is **pale**. Anyone who introduces a saturated "Dubai gold" (#D4AF37 and friends) has left the brand.

### 2.3 Tokens

```css
:root {
  /* ─── NIGHT (ground) ─────────────────────────────────────────── */
  --night-0: #05060A;   /* WebGL canvas floor, vignette core, deepest ground */
  --night-1: #0A0B12;   /* PAGE GROUND — every page background */
  --night-2: #10121B;   /* raised surface: cards, nav bar when scrolled */
  --night-3: #171A26;   /* hover surface, table row hover, input fill */
  --night-4: #222636;   /* solid hairline where alpha is unusable (e.g. on images) */

  /* ─── CHAMPAGNE (light) — 200–400 sampled from logo, rest extended ── */
  --champagne-50:  #FBF7F0;  /* specular; large-numeral highlight; 1 word per screen max */
  --champagne-100: #F4EADD;  /* sampled highlight; primary-button hover fill */
  --champagne-200: #EAD2AE;  /* sampled dominant; BRAND CHAMPAGNE; stat numerals, focus */
  --champagne-300: #DEC6A2;  /* sampled body; ACCENT — links, active nav, hairlines on hover, buttons */
  --champagne-400: #D9B484;  /* sampled deep; pressed states, icon strokes */
  --champagne-500: #C6A06C;  /* extended; small text on night must use ≥500 for AA (see 2.5) */
  --champagne-600: #A8834F;  /* extended; WebGL facet shadow side, never UI text */
  --champagne-700: #7D5F36;  /* extended; WebGL deep bronze occlusion only */
  --champagne-800: #4A3820;  /* extended; WebGL contact shadow only */

  /* ─── CREAM (words) — warm to sit with champagne, NOT Likova's cool #E3E6EB ── */
  --cream-100: #F1ECE3;  /* primary text on night (17.4:1) */
  --cream-200: #CFC9BE;  /* secondary text, lead paragraphs (12.5:1) */
  --cream-300: #8F8A80;  /* tertiary: captions, sources, footnotes (5.8:1 — AA) */
  --cream-400: #5C584F;  /* disabled text, hairlines when alpha unusable (decorative only) */

  /* ─── ATMOSPHERE (WebGL fog + photo grade ONLY — never a UI colour) ── */
  --dusk:  #2B2F4A;   /* horizon haze in 3D scenes; shadow tint in blue-hour photography */
  --mauve: #5A4356;   /* the blue-hour sky in the developer renders; ≤10% opacity gradients in WebGL backgrounds */

  /* ─── PAPER (the inverted "document" band — Method section, Ledger PDF) ── */
  --paper-1: #F1ECE3;  /* paper ground */
  --paper-2: #E6DFD3;  /* paper raised / table header */
  --ink-1:   #0A0B12;  /* text on paper */
  --ink-2:   #4A4740;  /* secondary text on paper (8.7:1) */
  --ink-3:   #7A756B;  /* tertiary on paper (4.6:1 — AA large only) */
  --gilt:    #A8834F;  /* champagne on paper must darken to 600 to be legible (4.0:1 large text) */

  /* ─── SEMANTIC ───────────────────────────────────────────────── */
  --bg:             var(--night-1);
  --bg-raised:      var(--night-2);
  --bg-hover:       var(--night-3);
  --fg:             var(--cream-100);
  --fg-muted:       var(--cream-200);
  --fg-subtle:      var(--cream-300);
  --accent:         var(--champagne-300);
  --accent-strong:  var(--champagne-200);
  --accent-pressed: var(--champagne-400);
  --on-accent:      var(--night-1);       /* text on champagne fills — 11.9:1 */
  --hairline:       rgba(241, 236, 227, 0.10);   /* cream-100 @ 10% — THE divider */
  --hairline-strong:rgba(241, 236, 227, 0.18);
  --hairline-gold:  rgba(222, 198, 162, 0.35);   /* champagne-300 @ 35% — active/hover divider */
  --overlay:        rgba(10, 11, 18, 0.72);      /* over photography for type */
  --scrim:          linear-gradient(180deg, rgba(10,11,18,0) 0%, rgba(10,11,18,0.85) 100%);
  --focus:          var(--champagne-200);
  --positive:       var(--champagne-200);  /* growth is gold. There is deliberately no green. */
  --negative:       #B87C74;               /* muted rose; data tables ONLY; never UI */
  --error:          #C98A7F;               /* form validation; 5.1:1 on night-1 */
  --glow:           rgba(234, 210, 174, 0.22); /* champagne-200 @ 22% — box-shadow bloom on CTAs */
}
```

### 2.4 Usage rules
- **Backgrounds:** `night-1` only. Sections are separated by space and hairlines, never by alternating background colours. The single exception is the Paper band (Method section) which inverts to `paper-1`.
- **Gradients:** permitted in exactly three places: (1) the logo itself, (2) WebGL materials, (3) `--scrim` over photography. No gradient buttons, no gradient text, no gradient borders.
- **Champagne text:** at body sizes (<24px) use `champagne-200` minimum; `champagne-300` at 16px on night-1 is 9.9:1, fine; never `champagne-500+` for UI text on night, they are WebGL shading tones.
- **Champagne fills:** primary buttons and the spire progress line only. Never card backgrounds. Never section backgrounds.
- **Hairlines:** `--hairline` (1px, cream @ 10%) is the site's primary dividing device. Under hover or "active" it warms to `--hairline-gold`. This warming is the single most-used micro-interaction on the site.
- **Photography** carries its own colour (blue hour: indigo, mauve, warm window light) and is the *only* place saturated colour is allowed to appear, always under a `--scrim` or `--overlay` when type sits on it.

### 2.5 Contrast table (computed, WCAG 2.x)

| Foreground | Background | Ratio | Use |
|---|---|---|---|
| cream-100 `#F1ECE3` | night-1 `#0A0B12` | 17.4:1 | Body, headings — AAA |
| cream-200 `#CFC9BE` | night-1 | 12.5:1 | Secondary — AAA |
| cream-300 `#8F8A80` | night-1 | 5.8:1 | Captions ≥12px — AA |
| champagne-200 `#EAD2AE` | night-1 | 13.5:1 | Numerals, links — AAA |
| champagne-300 `#DEC6A2` | night-1 | 11.9:1 | Accent text — AAA |
| night-1 | champagne-300 | 11.9:1 | Button labels — AAA |
| ink-1 `#0A0B12` | paper-1 `#F1ECE3` | 17.4:1 | Paper band — AAA |
| gilt `#A8834F` | paper-1 | 4.0:1 | Large text / hairlines on paper only |
| error `#C98A7F` | night-1 | 5.1:1 | Validation text — AA |

---

## 3. TYPE SYSTEM

### 3.1 The pairing and why
Three families. Each has one job.

| Role | Family | Source | Why this and not the obvious alternative |
|---|---|---|---|
| **Display** (headlines, hero, stat numerals) | **Fraunces** — variable, `wght 100–900`, `opsz 9–144`, `SOFT 0–100`, `WONK 0–1` | Google Fonts | High-contrast Old-style/transitional serif with an **optical-size axis**, so the same family renders as a razor-fine display at 120px and a sturdy text face at 14px footnotes. At `opsz 144 / wght 300 / SOFT 0 / WONK 0` it has the poise of PP Editorial New or Canela without the licence, and its italics are the most beautiful free italics on the web. Rejected: *Cormorant Garamond* (over-used in Dubai real estate; hairlines vanish on dark), *Instrument Serif* (only Regular + Italic, no weight range), *Bodoni Moda* (period-Deco-correct but hairlines shimmer at large size on night). |
| **Text & UI** (body, nav, labels, buttons) | **Jost** — variable `wght 100–900` + italics | Google Fonts | A Futura revival. Futura is the letterform of Art Deco, and the logo's U, M and R (geometric arches, monoline, rounded terminals) are drawn in exactly this vocabulary. Jost in wide-tracked caps *is* the logo's voice as a label. Rejected: *Inter* (default), *Manrope* (rounder than the logo), *Hanken Grotesk* (excellent but neutral, no relationship to the mark). |
| **Data** (tables, tickers, sources, elevation markers) | **DM Mono** — `wght 300, 400, 500` + italic | Google Fonts | Tabular by nature, slightly typewriter, the texture of a bank statement. It makes every figure feel *recorded* rather than *claimed*. Rejected: *JetBrains Mono* (developer connotations), *IBM Plex Mono* (corporate), *Space Mono* (novelty). |

**Fallback stacks** (used in `size-adjust`-tuned `@font-face` fallbacks to kill CLS):
```css
--font-display: "Fraunces", "Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif;
--font-text:    "Jost", "Futura", "Century Gothic", "Avenir Next", "Helvetica Neue", Arial, sans-serif;
--font-data:    "DM Mono", "SF Mono", "Menlo", "Consolas", "Liberation Mono", monospace;
```

**Files to ship (self-host from Google Fonts, woff2, `font-display: swap`):**
Fraunces variable roman (opsz+wght+SOFT+WONK) · Fraunces variable italic · Jost variable roman · Jost variable italic (optional, drop if budget tight) · DM Mono 300 · DM Mono 400. Six files, ~190 KB total. Subset to Latin + Latin Extended (Arabic transliteration marks not needed; Arabic UI is out of scope v1).

### 3.2 Fraunces axis settings by role
```css
.display   { font-variation-settings: "opsz" 144, "SOFT" 0,  "WONK" 0; font-weight: 300; }
.heading   { font-variation-settings: "opsz" 72,  "SOFT" 0,  "WONK" 0; font-weight: 400; }
.numeral   { font-variation-settings: "opsz" 144, "SOFT" 0,  "WONK" 0; font-weight: 300;
             font-variant-numeric: lining-nums tabular-nums; }
.emphasis  { font-style: italic; font-weight: 300; font-variation-settings: "opsz" 144, "SOFT" 20, "WONK" 1; }
/* WONK 1 only in italics — the quirk belongs to the "aside", never to the argument. */
```

### 3.3 Modular scale (fluid, `clamp()`)
Base 16→18px. Ratio 1.25 (major third) through the text sizes; display sizes step faster because negative space is the medium.

| Token | `clamp()` | Renders at 375px → 1440px → 1920px | Family / weight / lh / tracking | Use |
|---|---|---|---|---|
| `--t-2xs` | `0.6875rem` | 11 fixed | Data 400 / 1.4 / +0.04em | Legal, source footnotes, table units |
| `--t-xs` | `clamp(0.75rem, 0.72rem + 0.15vw, 0.8125rem)` | 12 → 13 → 13 | Text 500 caps / 1.2 / **+0.16em** | Eyebrows, labels, nav, button labels, elevation markers (data) |
| `--t-sm` | `clamp(0.875rem, 0.85rem + 0.15vw, 0.9375rem)` | 14 → 15 → 15 | Text 400 / 1.5 / 0 · Data 400 / 1.5 / 0 | UI, table cells, captions |
| `--t-base` | `clamp(1rem, 0.95rem + 0.3vw, 1.125rem)` | 16 → 17.5 → 18 | Text 400 / **1.6** / 0 | Body copy. Max measure **64ch** |
| `--t-md` | `clamp(1.125rem, 1.05rem + 0.4vw, 1.375rem)` | 18 → 21 → 22 | Text 300 / 1.55 / 0 · or Display 400 opsz 24 / 1.45 | Lead paragraphs, testimonials body |
| `--t-lg` | `clamp(1.375rem, 1.2rem + 0.9vw, 1.875rem)` | 22 → 26 → 30 | Display 400 opsz 48 / 1.2 / -0.005em | Card titles, h4 |
| `--t-xl` | `clamp(1.75rem, 1.4rem + 1.6vw, 2.75rem)` | 28 → 34 → 44 | Display 400 opsz 72 / 1.12 / -0.01em | h3, pull quotes |
| `--t-2xl` | `clamp(2.25rem, 1.6rem + 3vw, 4rem)` | 36 → 51 → 64 | Display 300 opsz 144 / 1.05 / -0.015em | h2 section headlines. Max measure **22ch** |
| `--t-3xl` | `clamp(3rem, 1.8rem + 5.5vw, 6.5rem)` | 48 → 76 → 104 | Display 300 opsz 144 / 0.98 / -0.02em | h1 on inner pages, section display moments |
| `--t-4xl` | `clamp(4rem, 1.5rem + 11vw, 11rem)` | 64 → 131 → 176 | Display 300 opsz 144 / 0.92 / -0.025em | Hero headline, giant stat numerals. **Max 2 instances per page** |

### 3.4 Rules
- **Display**: Fraunces 300 at `opsz 144`. Sentence case, never all-caps (Fraunces caps at display size read as a wedding invitation). Emphasis = one italic word or phrase per headline, maximum. Tracking tightens as size rises (see table). Line-height under 1.0 at 3xl/4xl; set `text-box-trim: both; text-box-edge: cap alphabetic` where supported so the cap-height sits on the grid.
- **Headings h2–h4**: Fraunces 400, `opsz` matched to rendered size (the browser does this automatically with `font-optical-sizing: auto`; force it with `font-variation-settings` only where you need a mismatch for effect).
- **Body**: Jost 400, `--t-base`, `line-height 1.6`, measure 52–64ch, `text-wrap: pretty`. Paragraph spacing = 1 line (`1em × 1.6`), never indented. Left-aligned only; never justified; never centred except a single-line lead under a centred headline.
- **Labels / eyebrows / nav / buttons**: Jost 500, `--t-xs`, ALL CAPS, `letter-spacing: 0.16em` (0.20em at 11px, 0.14em at 13px+). This is the logo's voice.
- **Data / numerals**:
  - *Ledger scale* (tables, tickers, footnotes, elevation markers): DM Mono 400 (300 on paper), `font-variant-numeric: tabular-nums`, right-aligned in columns, units set in `--t-2xs` after a thin space (`AED 1.92M`, `2,510 / sq ft`).
  - *Display scale* (stat tiles, the giant figures): Fraunces `.numeral` — 300, opsz 144, `tabular-nums lining-nums`. Thousands separators always. Currency as "AED" in Jost caps `--t-xs` set as a superscript-like prefix at 0.28em of the numeral size, baseline-aligned to the numeral's x-height. Percentages: the `%` glyph at 0.6em. Plus sign for growth, never an arrow icon.
  - Numbers in running body copy: Jost proportional (do not mono-ify body text).
- **Wordmark**: the logo is the only place its letterforms appear. Never typeset "UMER" in Fraunces or Jost as a substitute. In running text the brand is "Real Estate by Umer" (title case) and he is "Umer" after first mention of "Muhammad Umer Riaz".
- **Links in body**: cream-100, 1px underline `text-underline-offset: 0.18em`, `text-decoration-color: var(--hairline-strong)`; on hover the decoration colour transitions to `--accent` (180ms). Never champagne-coloured link text in body; the underline carries the colour.

### 3.5 Loading strategy
`<link rel="preload">` the two Fraunces files and Jost roman. Use `@font-face { size-adjust; ascent-override; descent-override }` on the local fallbacks (Georgia → Fraunces: `size-adjust: 104%`; Arial → Jost: `size-adjust: 96%`) so layout shift on swap is < 0.02 CLS. Hero headline waits for Fraunces (`document.fonts.load`) up to 800ms before revealing; if not loaded, reveal in fallback and let swap happen under a 200ms opacity crossfade.

---

## 4. SPACE, GRID, BREAKPOINTS

### 4.1 Spacing scale
Base 8. Named so the engineer never invents a value.

```css
--s-1: 4px;  --s-2: 8px;  --s-3: 12px; --s-4: 16px; --s-5: 24px; --s-6: 32px;
--s-7: 48px; --s-8: 64px; --s-9: 96px; --s-10: 128px; --s-11: 192px; --s-12: 256px;

--section-y:   clamp(96px, 12vw, 192px);   /* vertical padding of every section */
--section-gap: clamp(64px, 8vw, 128px);    /* between a headline block and its content */
--stack-gap:   clamp(24px, 3vw, 48px);     /* between sibling blocks in a column */
```

### 4.2 Grid
- **12 columns**, `gap: clamp(16px, 2vw, 32px)`.
- **Outer margin** `clamp(20px, 5vw, 96px)`. Content max-width **1600px**; WebGL canvases and photography bleed to viewport edges.
- **Setback rule** (the compositional signature, derived from the logo's massing): as the page ascends, the content column narrows.

| Ascent level | Sections | Columns used (desktop) | Reads as |
|---|---|---|---|
| Ground | Hero, Ground Truth (data) | 12 of 12, full bleed canvas | The wide base |
| Structure | The Analyst, The Method | 10 of 12 (offset 1) | First setback |
| Massing | The Asset, Where the Numbers Point, The Ledger | 12 (canvas) with copy in 4–5 col side panels; the Ledger table spans 2–12 | The shafts |
| Spire | The View, Trust | 8 of 12 (offset 2), then 6 (offset 3) | Narrowing to the point |
| Return | Invest, Footer | 10 of 12 | Back to earth |

Section headlines sit on **column 2** (not 1) on desktop; the left column 1 is reserved for the elevation marker and the spire progress line. This slight indentation is the site's "left margin of a ledger."

- **Rhythm rule**: copy and canvas alternate sides within Massing sections (copy left / canvas right, then canvas left / copy right) so the eye zig-zags upward — the reading path *is* a staircase.
- **Vertical rhythm**: everything snaps to a 8px baseline. Headline blocks use `--section-gap` below; body paragraphs 1lh apart.

### 4.3 Breakpoints (min-width, mobile-first) and behaviour

| Token | Range | Grid | Notes |
|---|---|---|---|
| `xs` | < 480 | 4 col, margin 20px | Single column. WebGL scenes at DPR 1, quality tier C. No pinned scenes longer than 150vh. Stat numerals `--t-3xl` not 4xl. |
| `sm` | 480–767 | 4 col | Same as xs, larger type via clamp |
| `md` | 768–1023 | 8 col, margin 32px | Two-column copy/canvas becomes stacked (canvas above copy). Nav still condensed. |
| `lg` | 1024–1439 | 12 col | Full layout. Spire progress line appears. |
| `xl` | 1440–1919 | 12 col, max 1600 | Reference design size (1440). |
| `2xl` | ≥ 1920 | 12 col, max 1600 centred, canvas still bleeds | Type stops scaling at 1920 via clamp max. |

Container queries (`@container`) govern card internals so cards reflow by their own width, not the viewport.

### 4.4 Vertical scale of the homepage (desktop)
Total document height ≈ **14–16 viewports**. Pinned scenes account for ~7.5 of those (hero 2, building 3, masterplan 2.5). The ratio of pinned to free-scrolling is capped at 55% so the page never feels like a slideshow.

---

## 5. MOTION DESIGN SYSTEM

### 5.1 Philosophy
Motion on this site is **architectural**: heavy things move slowly, light things move quickly, nothing bounces, nothing overshoots more than the eye can catch. The reference is a well-damped door on a bank vault, not a phone UI. Two exceptions: light (glow, specular) may flicker and breathe because light does; and the user's own hand (drag, hover) gets immediate, springy response because latency reads as cheap.

### 5.2 Easing curves

```css
/* ENTRANCES & REVEALS — always decelerate INTO rest */
--ease-out-expo:   cubic-bezier(0.16, 1.00, 0.30, 1.00);  /* THE workhorse: reveals, image masks, card entrances */
--ease-out-quint:  cubic-bezier(0.22, 1.00, 0.36, 1.00);  /* text line reveals (a touch softer than expo) */

/* MOVES — things already on screen changing place or state */
--ease-in-out-soft:      cubic-bezier(0.65, 0.00, 0.35, 1.00);  /* camera tweens, layout shifts, accordion */
--ease-in-out-cinematic: cubic-bezier(0.83, 0.00, 0.17, 1.00);  /* page curtains, section-level wipes, preloader exit */

/* STATE COLOUR — fast in, lingering out (feels like warmth, not a switch) */
--ease-silk:       cubic-bezier(0.40, 0.00, 0.10, 1.00);

/* EXITS — the only place ease-in is allowed */
--ease-in-quart:   cubic-bezier(0.50, 0.00, 0.75, 0.00);  /* dismissals, modal close, tooltip hide */

/* CONTINUOUS — linear only for rotation and progress */
--ease-linear:     linear;
```

**Forbidden**: `ease`, `ease-in` on entrances, `ease-in-out` (the CSS default, too symmetric), any `back`/`elastic`/`bounce`, spring physics on layout. Springs are allowed only in WebGL for pointer-following (frame lerp `0.06–0.10`) and drag inertia (damping `0.92/frame`).

### 5.3 Duration scale

| Token | ms | Use |
|---|---|---|
| `--d-instant` | 80 | Focus ring, button press scale |
| `--d-fast` | 180 | Hover colour, hairline warming, underline draw |
| `--d-base` | 320 | UI state changes, tooltips, tab switch, nav compress |
| `--d-slow` | 640 | Single element reveal (card, image mask), accordion |
| `--d-cinematic` | 1200 | Section-level reveal, camera preset tween, headline line-mask sequence total |
| `--d-epic` | 2000 | Hero first entrance, preloader→hero handoff. **Once per session.** |

Rule of thumb: distance × mass. A 1px hairline colours in 180ms; a full-bleed image mask takes 640ms; a camera orbit of 90° takes 1200ms. Never exceed 2000ms for anything the user is waiting on.

### 5.4 Reveal grammar (the only four reveals)

1. **Line-mask** (headlines): split by *line* (not char, not word — char splits are the visual tell of a template). Each line sits in an `overflow:hidden` wrapper; translates `translateY(110%) → 0` and `opacity 0 → 1` over 900ms `--ease-out-quint`, stagger 90ms per line. Hero is the *only* word-level split, once.
2. **Fade-rise** (body, cards, data tiles): `opacity 0→1`, `translateY(24px) → 0`, 640ms `--ease-out-expo`. Body paragraphs rise as a block, never line by line.
3. **Mask-wipe** (images, canvases): `clip-path: inset(0 0 100% 0) → inset(0)` from bottom (things *rise* on this site) over 900ms `--ease-out-expo`, with the image inside counter-scaling `1.08 → 1.0` over 1400ms so it "settles".
4. **Draw** (hairlines, underline, spire line, SVG strokes): `scaleX/Y 0 → 1` from the origin edge, 640ms `--ease-out-expo`. Hairlines draw left→right; vertical lines draw bottom→top (ascent).

Trigger: element top crosses 85% of viewport height; play once; never re-play on scroll-up.

### 5.5 Stagger logic
- Siblings stagger by `--stagger-base`: 40ms (words), 60ms (lines in a short list), 90ms (headline lines), 110ms (cards/tiles).
- **Cap**: total stagger never exceeds 600ms. After the 6th sibling, delay stops increasing (items 7+ inherit item 6's delay). A 12-card grid does not take a second to appear.
- Stagger direction follows reading order, except vertical stacks in the Spire levels, which stagger bottom→top (ascent).
- Data numerals count up over 1200ms `--ease-out-expo`, starting *after* their tile's fade-rise (delay 200ms). Counting uses tabular figures so the tile doesn't jitter. Once counted, the number is locked; it never re-animates.

### 5.6 Scroll choreography
- **Smooth scroll**: Lenis, `lerp: 0.08`, `wheelMultiplier: 0.9`, desktop pointer devices only. Touch devices use native scroll (Lenis off) — synthetic smooth scroll on touch is the fastest way to feel broken.
- **Scrub**: WebGL scene timelines are driven by GSAP ScrollTrigger with `scrub: 0.8` (a damped follow, the camera arrives ~0.8s after the finger). Copy inside pinned sections uses `scrub: true` (immediate) so words stay readable.
- **Pinning**: hero 200vh · The Asset 300vh · Where the Numbers Point 250vh · The View 200vh (parallax, not strictly pinned). Nothing else pins.
- **Progress evidence rule**: inside a pinned scene, *something legible must change at least every 60vh of scroll* (a caption, an elevation marker, a data label). Users must never wonder whether the page is stuck.
- **Parallax ratios** (translateY as a multiple of scroll delta): sky/far 0.15–0.30 · mid 0.55–0.75 · near 0.90–1.00 · foreground 1.10–1.25. **Type is always 1.00** — typography is the anchor everything else moves against.
- **Snap**: none. No scroll-snapping anywhere. Snapping steals the scroll from the user.
- **Section transitions**: hairline draws across the top edge of the incoming section when it reaches 90% viewport; the elevation marker in column 1 updates with a 320ms crossfade.
- **Spire progress line** (desktop `lg+`): 1px vertical line in the left margin, `--hairline` for the track, `--accent` for progress, filling bottom→top as the page scrolls (ascent again). Notches at each section (clickable, `title` = section name). It is the site's only persistent motion, and it moves at exactly scroll speed.

### 5.7 Pointer & hover
- **Hairline warming**: on hover, any hairline adjacent to the target transitions `--hairline → --hairline-gold` over 180ms `--ease-silk`. This replaces background-colour hover states everywhere.
- **Buttons**: primary fill `champagne-300 → champagne-100` (180ms), arrow glyph `translateX(4px)`, `box-shadow: 0 0 0 0 → 0 0 32px var(--glow)` over 320ms. Press: `scale(0.98)` 80ms. Magnetic pull on primary CTA only: max 6px toward pointer, lerp 0.12, released with `--ease-out-expo` 400ms.
- **Cards**: image inside scales `1.0 → 1.04` over 900ms `--ease-out-expo`; card border warms; title does not move.
- **Cursor**: **no custom cursor**. Native cursor everywhere. Exception: over drag-enabled WebGL canvases a 56px champagne ring with the label "DRAG" (Jost 500, 10px, +0.2em) follows the pointer (lerp 0.15) and shrinks to 40px while dragging. This is a state affordance, not decoration.
- **Nav**: links get a 1px underline drawing left→right (180ms). Active link has a standing underline in `--accent`.

### 5.8 What must NEVER move
- Body paragraphs and list items, once revealed.
- Data tables and ledger rows (they may reveal; they may not shift, reflow, or parallax).
- Button and link labels (the container may glow/scale; the text stays put).
- The nav wordmark and the "Send INVEST" CTA (they may compress with the bar; they never bob, slide or hide).
- Focus indicators.
- Headlines during scroll (no scroll-linked scaling of set type; above-the-clouds does this and it is the one thing we do *not* take from them — the analyst's words do not stretch).
- No marquees, no auto-playing carousels, no infinite text loops, no ticker of headlines. A *data* ticker (Ground Truth) is permitted only as a scroll-driven strip, not a self-running one.

### 5.9 Page transitions
Route change: a `night-0` curtain wipes up from the bottom (900ms `--ease-in-out-cinematic`), the elevation marker of the destination page fades in centred at 60%, then the curtain continues up and off (600ms). Total 1500ms. The persistent WebGL canvas survives underneath (single renderer across routes). Back/forward navigation skips the curtain (200ms crossfade) — the browser's own controls must feel instant.

### 5.10 Preloader
No progress bar, no percentage counter. First visit only (sessionStorage flag):
1. `night-0` screen. 0–500ms: the logo's **spire line draws upward** (`Draw` reveal, 500ms `--ease-out-expo`).
2. 400–900ms: the four shafts of the wordmark **rise** into place from below with the Line-mask grammar (stagger 90ms, U→R).
3. 900–1400ms: the wordmark's specular sweep plays once (a `champagne-50` gradient mask crossing left→right, 500ms `--ease-in-out-soft`), then the mark dissolves (opacity 400ms) while the hero crystal is already rotating behind it.
Hard cap 1400ms. If fonts + hero canvas aren't ready by then, fade out anyway and let the hero finish loading behind copy.

---

## 6. WEBGL — ART DIRECTION OF THE FOUR SET-PIECES

Common law for all scenes (scroll behaviour and copy per position live in `STRUCTURE.md` §3):

- **One renderer, one canvas**, fixed behind the DOM (`position: fixed; inset: 0; z-index: 0`), scenes swapped/blended by scroll position. DOM sits on top with `pointer-events: none` where the canvas needs drag.
- **Lighting rig (identical in all four):** Key — warm champagne `#EAD2AE` from upper-left (azimuth −35°, elevation 40°). Rim — cool `#6E7BB0` (a lit version of `--dusk`) from behind-right (azimuth 150°, elevation 15°), intensity 0.4× key. Fill — none; ambient `#0A0B12` at 0.15 via environment. Fog `#0A0B12 → #2B2F4A` (dusk) only near the horizon.
- **Environment**: a procedurally built PMREM "studio" — a dark room with one wide warm softbox above-left, a narrow cool strip behind-right, and a faint horizon band. No HDRI photographs (they leak colour we did not choose). The prototype builds exactly this.
- **Tone**: ACES filmic, exposure 1.0–1.15. Output sRGB.
- **Post**: soft bloom (threshold 0.85, strength 0.35–0.5, radius large) — light must *bleed* a little; 1.5–2.5% film grain, animated; vignette to `night-0` at the corners. Optional very light chromatic aberration (≤1.5px) at the edges only.
- **Ground**: every object stands on a **dark reflective plane** (roughness 0.25–0.35, colour `night-0`, reflection strength 0.35) so it is grounded — objects floating in a void read as clip-art. The reflection is the object's "evidence."

### 6.1 Set-piece 2 — THE SPIRE PRISM (hero) — *built in `prototype/crystal.html`*
**What it is**: the logo's massing abstracted into a single object cut from champagne glass. Four tall prismatic shafts of different heights with Deco setbacks stepping inward as they rise, the tallest tapering to a needle spire. It is unmistakably *the tower* and unmistakably *a crystal* — a gesture toward everything the decision makes possible before it is a building.
**Geometry**: shafts built from convex polygonal prisms (6–10-gon cross-sections, irregularly scaled) with chamfered setback rings; flat-shaded normals (each facet is a plane, so light *breaks* rather than smears). Spire = elongated tapered prism, ~40% of total height (matching the logo's proportion).
**Material**: `MeshPhysicalMaterial` — `transmission 1.0`, `ior 1.9–2.2` (gem, not window glass), `thickness 1.2–2.4` per shaft, `roughness 0.05–0.12`, `dispersion 0.35` (three ≥ r163; true chromatic splitting at facet edges, kept subtle), `attenuationColor #EAD2AE`, `attenuationDistance 2.5–4` (long path through glass goes champagne), `specularColor #FBF7F0`, `clearcoat 1, clearcoatRoughness 0.08`, `iridescence 0.15` with thickness range 120–380nm (a whisper of oil-slick only at grazing angles, tinted by the env so it reads champagne/ice, never rainbow).
**Light behaviour**: slow idle rotation 0.05 rad/s (a full turn in ~2 minutes) so specular flashes travel across facets one at a time. Pointer parallax: object yaw ±0.25 rad, pitch ±0.12 rad, lerp 0.06. A low, wide champagne "horizon" emissive band behind the object refracts through the shafts as a warm caustic sweep; a cool rim panel gives the edges an ice-blue line.
**Reads at a glance as**: a lit skyscraper made of glass, seen from below at night.
**Reduced motion**: single rendered frame, no idle rotation; pointer parallax off; drag still allowed.

### 6.2 Set-piece 1 — THE ASSET (rotatable building; featured project **Montiva by Vida, Dubai Creek Harbour**)
**What it is**: a stylised architectural model of the Montiva tower (Emaar's Vida-branded residence at Dubai Creek Harbour, handover Sept 2029) standing on a dark reflective creek plane, at model-scale, lit like a night render. Chosen over the other seven because it is Vida-branded (the portfolio's distinguishing line), sits in the densest community (three of eight projects), and faces the three things the inventory sells as views: the Future Creek Tower site, the golf course, the skyline.
**Geometry**: GLB, ≤120k triangles. House-modelled abstraction of Emaar's published massing [storey count and orientation to confirm from the broker pack]. Floors are **separate meshes** (or one mesh with per-floor instance IDs) because the scene explodes and lights them individually; the facade is split into **three orientation groups** (`face_creek`, `face_golf`, `face_skyline`) so each can be lit independently.
**Material**: slab edges `cream-100` matte (roughness 0.7); vertical fins `champagne-600` metallic (metalness 0.9, roughness 0.35) catching the key light; glazing `night-2` with 0.2 reflectivity; interior lights as emissive `#F4EADD` quads behind glazing, switched per floor and per face. No Vida or Emaar logotype is modelled onto the building (trademark; text mention only).
**Interaction**: drag to rotate about Y with inertia (damping 0.92); auto-rotate resumes after 4s idle at 0.03 rad/s. Three camera presets named for the views — "Creek", "Golf", "Skyline" — tween over 1200ms `--ease-in-out-soft`. Keyboard: ←/→ rotate 15°; ↑/↓ cycle presets. Pitch is user-locked between −5° and 25° (never a drone shot from above; never a worm's-eye).
**Scroll stages (visual)**: (1) exterior at blue hour, creek reflection; (2) **exploded floors** — floors separate 0.35 storey-heights apart and the unit stack labels draw as DOM labels anchored to 3D positions (`1 BED · 765 SQ FT · FROM AED 1.92M`, `2 BED · 1,143 SQ FT · FROM AED 2.85M`, `3 BED · 1,835 SQ FT · FROM AED 4.10M`) [floor ranges per type to confirm]; (3) **the view as light** — as the camera orbits, the facade group facing each view illuminates in turn (`FACES · FUTURE CREEK TOWER`, `FACES · CREEK GOLF`, `FACES · DOWNTOWN SKYLINE`) with the label anchored to that face; the last beat lights the whole tower and stamps `HANDOVER · SEPT 2029` at the roof. View is the price driver in this inventory; the scene makes that visible.
**Fallback (tier C)**: 36-frame pre-rendered turntable as a WebP sprite sheet; drag scrubs frames; exploded/lighting stages become a static labelled elevation (line-art).

### 6.3 Set-piece 3 — WHERE THE NUMBERS POINT (rotating WebGL masterplan — **Dubai Creek Harbour**)
**What it is**: one Emaar masterplan as a **night relief drawn in light** — not a satellite view. Dubai Creek Harbour is the homepage subject because three of the eight projects sit in it and its infrastructure is legible at a glance: the creek and Ras Al Khor sanctuary, the bridges to Downtown, the Creek Tower site, the golf course, the marina and Creek Beach. A second, Dubai-wide variant (five community footprints on the coast-to-inland relief, one pin per project) serves `/projects` and the community pages.
**Geometry**: a low-poly relief mesh (~40k tris) with a `LineSegments2`-style contour overlay (custom shader lines with screen-space width 1.0–1.5px so they never alias into mush). Roads and bridges as a second line layer at 0.6 opacity; the planned metro/transit line as a brighter dashed line. Water (creek, lagoon) as a reflective plane (roughness 0.2). District footprints (Creek Island, Creek Beach, the golf course, the marina) as flat extrusions 0.4 units high in `night-3` with a `champagne-300` edge glow; the Creek Tower site as a single tall 1px light-line (the logo's spire, again). Project pins (Montiva, Silva, Altan) as shorter 1px vertical light-lines with a small champagne sphere at the top.
**Camera**: starts top-down (a plan, 2D-feeling, orthographic-ish FOV 20°) and, with scroll, **rotates about the map's centre by 90° while tilting to 35° isometric**, so the map turns from "diagram" into "place". Drag rotates ±30° from the scroll-driven yaw; released, it eases back.
**Layers stack in with scroll** (each with a Draw reveal along the line): (1) creek, sanctuary edge + water → (2) bridges, roads, transit → (3) district footprints + Creek Tower site → (4) the three project pins → (5) drive-time rings (10/15/20 min) to Downtown and DXB from the active pin, as dashed champagne circles on the ground.
**Data cards**: DOM elements anchored to pins (CSS2D-style projection): project, brand chip (`VIDA` where applicable), from-price, size range, handover, view, and the as-at stamp; from the CMS.
**Fallback**: static SVG masterplan, same line style, same pins, hover/focus cards.

### 6.4 Set-piece 4 — THE VIEW (layered 3D illustrations with depth drift)
**What it is**: the reward at the top of the ascent. Three bespoke illustrated scenes (commissioned 3D renders, delivered as depth-separated layers): *the terrace* (pool edge, glass balustrade, skyline at blue hour), *the window* (an interior at dusk, warm lamp, the city beyond), *the drive* (Sheikh Zayed Road towers from a moving car's height, light streaks). Each scene is 5–7 PNG/WebP layers with alpha: sky · far skyline · mid towers · the architecture we're standing in · foreground objects · a glass-reflection layer · a light-haze layer.
**Composition in WebGL**: layers as planes at increasing Z with `MeshBasicMaterial` (unlit — the lighting is baked in the illustration) plus a custom haze shader (animated 2-octave noise, 0.05 speed) on the haze layer and a flicker shader on a window-lights mask (lights come *on* as scroll progress passes 0.4, staggered randomly over 1.5s).
**Depth drift**: on scroll, layers translate Y at ratios 0.15 (sky) · 0.30 · 0.55 · 0.75 · 1.0 (architecture) · 1.15 (foreground) · 1.25 (haze). On pointer move, the camera pans ±3% with lerp 0.06 so layers slide against each other — this is what makes it *depth* rather than a poster.
**Grade**: all three illustrations share the house grade (§7): shadows to `--dusk`, highlights to `champagne-100`, mauve in the sky at ≤15% saturation, 2% grain.
**Fallback**: the composite flattened as a single AVIF with CSS-only parallax on two layers.

---

## 7. PHOTOGRAPHY & RENDER TREATMENT

### 7.1 Two grades, one house
**Grade A — "Blue Hour"** (exteriors, skyline, projects): shot or rendered 15–25 minutes after sunset. Sky indigo → mauve at the horizon; interior lights warm and already on. In post: shadows lifted and tinted toward `--dusk #2B2F4A` (never pure black — black point sits at `#0F1119`); highlights pulled toward `champagne-100`; saturation −15% globally, −30% in greens; sky mauve kept but capped at 15% saturation. Horizon level to 0.2°.
**Grade B — "Morning Ledger"** (Umer's portraits, office, hands, documents, interiors by day): soft single-window light from camera-left (the same upper-left key as WebGL). Warm-neutral white balance (5200K), very low saturation, blacks lifted to `#14151C`, whites held under `#F1ECE3`. Feels like a good broadsheet's weekend magazine, not a corporate headshot.

**Unifier**: 2–3% fine monochrome grain on *everything*, including developer renders. It is what makes CGI, photography and illustration read as one house.

### 7.2 The portrait brief (Umer)
- Environmental portrait, 85mm-equivalent, f/2.8–4, eye-level. He is at a desk or a window; the Dubai skyline soft and *small* behind him (it is context, not a billboard).
- Dress: dark suit, open collar or knit, no tie, no pocket square. Watch fine; no visible logos.
- Direction: looking to camera, at rest, mouth closed or the beginning of a smile. He has read the file and knows what's in it. Never arms-crossed, never pointing, never holding keys, never a phone to the ear.
- Set: three frames — (1) half-body to camera; (2) three-quarter, seated, hands on an open document with a pen; (3) profile at the window, city beyond (this one carries type over it in the About page hero).
- Treatment: Grade B. On the homepage a **night-and-champagne duotone** variant (shadows `night-1`, highlights `champagne-200`, 100% desaturated) is used where type overlays the image.

### 7.3 Project imagery
- Emaar broker-pack renders may be used **only** after re-grading to Grade A and with all developer branding, skies and floating text removed, and only within the licence terms of the broker pack [confirm]. The building is cut out onto alpha so it can be placed on our night ground with our reflection.
- Preferred: commission our own night renders of each project's massing (the 3D team needs the Montiva model anyway for set-piece 1; Baystar and Vida Hillside next, then the rest).
- Interiors: broker-pack imagery re-graded; crop tight on materials and light, never the whole show-flat.
- Brand names: "Emaar" and "Vida" appear as text only. No Emaar or Vida logotypes anywhere on the site unless written permission is on file; the site is Umer's, not the developer's, and must never read as an official Emaar page.

### 7.4 Forbidden imagery
Handshakes · keys · "for sale" signs · drone selfies · anyone pointing at a skyline · HDR-looking sunsets · lens flares · stock people laughing at laptops · Burj Khalifa fireworks · gold bars, coins, charts-going-up clip art · any image with a watermark or a developer logo.

### 7.5 People
Only as scale (a figure on a terrace, a silhouette at a window), never as models, never looking at camera except Umer himself. Clients are never pictured; discretion *is* the product.

---

## 8. COMPONENT INVENTORY

All components are dark-first. Sizes given at `lg` (1440 reference); use the scale tokens.

| # | Component | Visual spec | Motion |
|---|---|---|---|
| 1 | **Nav bar (Spire nav)** | Fixed top. Height 72 → 56 on scroll (>80px). Left: small mark (`home-page-umer-logo.png` redrawn as SVG, flat `champagne-300`, 28px tall — gradient only ≥120px). Right: 4 links (Jost 500 `--t-xs` caps +0.16em, `cream-200`) + **Send INVEST** pill. Background transparent → `night-1 @ 80%` with `backdrop-filter: blur(12px)` and a `--hairline` bottom edge when scrolled. | Compress 320ms `--ease-in-out-soft`. Link underline draw 180ms. Never hides on scroll. |
| 2 | **Spire progress line** | 1px, left margin (col 1 centre), full viewport height minus 2×`--s-8`. Track `--hairline`; fill `--accent` from bottom. Section notches: 5px ticks; current notch has a 3px champagne dot. `lg+` only. | Fill = scroll progress (linear). Notch dot crossfade 320ms. |
| 3 | **Elevation marker** | DM Mono 400 `--t-2xs` +0.04em `cream-300`: `LVL 03 · THE METHOD`. Sits in col 1 at the top of each section, rotated −90° on `xl+`. | Crossfade 320ms on section change. |
| 4 | **Eyebrow** | Jost 500 `--t-xs` caps +0.16em `champagne-300`, preceded by a 24px `--hairline-gold` rule. | Rule draws (640ms) then text fade-rise. |
| 5 | **Display headline** | Fraunces `.display`, `--t-2xl`/`3xl`/`4xl`, `cream-100`, one italic phrase in `champagne-200` allowed. Max 22ch. | Line-mask reveal. |
| 6 | **Lead paragraph** | Jost 300 `--t-md` `cream-200`, measure 48ch. | Fade-rise 640ms, delay 200ms after headline. |
| 7 | **Body** | Jost 400 `--t-base` `cream-100`, measure 64ch. | Fade-rise as a block. |
| 8 | **Button — Primary** | Height 48 (44 on xs). Padding 0 28px. `champagne-300` fill, `--on-accent` label Jost 500 `--t-xs` caps +0.16em, radius 2px (Deco = hard corners softened by a hair), optional trailing arrow glyph (→, 14px, stroke 1.25). | Hover: fill → `champagne-100`, arrow +4px, glow 32px. Press `scale(0.98)`. Magnetic ≤6px. |
| 9 | **Button — Secondary** | Same geometry; transparent fill, 1px `--hairline-strong` border, `cream-100` label. | Hover: border → `--accent`, label → `champagne-200`. |
| 10 | **Button — WhatsApp "Send INVEST"** | Primary geometry; label `SEND "INVEST"`; leading 16px WhatsApp glyph drawn in a single 1.25px stroke (no green — glyph is `--on-accent`). On mobile becomes a fixed bottom-right 56px circle after the hero. | As primary; the mobile FAB fades in after 100vh. |
| 11 | **Text link** | `cream-100`, underline 1px offset 0.18em `--hairline-strong`. | Underline colour → `--accent` 180ms `--ease-silk`. |
| 12 | **Stat tile** | Numeral Fraunces `.numeral` `--t-3xl` `champagne-200` (`4xl` for the two hero stats); prefix "AED" / suffix "%" in Jost caps at 0.28em; label Jost 500 `--t-xs` caps `cream-200` below; source line DM Mono `--t-2xs` `cream-300` (`DLD · 2025`). Tile has a `--hairline` top edge only, no box. | Hairline draws, label fade-rise, numeral counts up 1200ms after 200ms. Locked thereafter. |
| 13 | **Ledger table** | DM Mono 400 `--t-sm`; header Jost 500 `--t-xs` caps `cream-300`; rows separated by `--hairline`; numerals right-aligned `tabular-nums`; growth in `--positive`, decline in `--negative`; a "Source / As of" row at the foot in `--t-2xs`. On paper band: `ink-1` on `paper-1`, hairlines `ink-1 @ 12%`. | Rows fade-rise stagger 60ms (capped). Hover row: hairline warms. **Never sortable-animated.** |
| 14 | **Project card** | 16:10 image (Grade A, cut-out building on night ground) in a `--hairline` frame; below: project name Fraunces `--t-lg` `cream-100` with an optional `VIDA` chip (component 17 style, `champagne-300` border) after it; community · view Jost `--t-xs` caps `cream-300`; three data cells DM Mono `--t-sm` (`FROM AED 1.92M · 765–1,835 SQ FT · HANDOVER SEP 2029`); a text link "Read the numbers →". | Mask-wipe on image, fade-rise on copy. Hover: image `scale 1.04` 900ms, frame → `--hairline-gold`. |
| 15 | **The Instrument (inventory ledger + budget finder)** | The portfolio as a filterable data instrument. Filter row: four segmented groups in Jost `--t-xs` caps — `COMMUNITY` (5) · `BEDROOMS` (1/2/3/4/Villa) · `HANDOVER` (2029 by quarter / TBC) · `BRAND` (All / Vida). Budget finder: one range control (`champagne-300` 1px track, 12px thumb with `--glow`, AED 1.5M → 26M, log scale) labelled `WHAT DOES AED 3.0M BUY TODAY?`; rows at or under the budget stay `cream-100`, rows above dim to `cream-400` (never hidden — the ladder must stay visible). Table (component 13) grouped by community with a Fraunces `--t-lg` group header; columns: Project · Type · Size (sq ft) · From (AED) · **AED/sq ft (derived)** · Handover · View. Derived column header carries `(DERIVED)` in `--t-2xs`. Every table carries the as-at stamp (component 28) in its foot row and dagger markers (component 29) where a figure is under confirmation. Output line under the finder: `AT AED 3.0M · 11 OF 26 LINES · FROM ROSEHILL 1 BED TO ALTAN 2 BED` in DM Mono. CTA: `SEND ME THESE` → WhatsApp prefilled with the filtered lines. | Filter change: rows re-sort with `--ease-in-out-soft` 320ms, opacity only (no sliding rows — DIRECTION §5.8). Budget change: dim/undim 180ms `--ease-silk`; the count in the output line tweens. |
| 16 | **Testimonial** | Quote in Fraunces italic 300 `--t-xl` `cream-100` with the opening quotation mark in `champagne-200` hanging in the left gutter; attribution Jost 500 `--t-xs` caps `cream-300`: `PRIVATE INVESTOR · LONDON · 2025`. No photos, no stars, no logos. | Line-mask. |
| 17 | **Credential chip** | Jost 500 `--t-xs` caps `cream-200`, 1px `--hairline-strong` border, radius 2px, padding 8px 12px: `MBA · BANKING & FINANCE`, `RERA CERTIFIED`, `AX CAPITAL`. | Fade-rise stagger 60ms. |
| 18 | **Form field** | Underline-only: label Jost `--t-xs` caps `cream-300` above; input Jost `--t-base` `cream-100` on transparent; 1px bottom border `--hairline-strong`; focus: border → `--accent` 2px via `box-shadow: 0 1px 0 var(--accent)`; error: border `--error`, message DM Mono `--t-2xs`. Selects styled the same with a 1.25px stroke chevron. | Border colour 180ms `--ease-silk`. Label lifts 8px on focus 320ms. |
| 19 | **Data card (masterplan pin)** | 240px wide; `night-2 @ 92%` + blur 8px; 1px `--hairline-strong`; title Fraunces `--t-lg`; rows DM Mono `--t-sm`. Anchored to pin with a 1px `--accent` leader line. | Leader draws 320ms; card fade-rise 320ms. |
| 20 | **Floor / face label (building)** | DM Mono `--t-2xs` `champagne-200` with a 1px `--accent` leader from the floor edge or facade centroid; e.g. `1 BED · 765 SQ FT · FROM AED 1.92M` or `FACES · FUTURE CREEK TOWER`. | Draw + fade, follows 3D anchor each frame. |
| 21 | **WebGL drag ring** | 56px ring, 1px `champagne-200`, label `DRAG` centred Jost 500 10px +0.2em; 40px while dragging. | Follows pointer lerp 0.15. |
| 22 | **Section hairline** | 1px `--hairline` across content width at top of each section. | Draw left→right 640ms at 90% viewport. |
| 23 | **Footer** | `night-0`. Three columns: (1) tall lockup logo (`umer-logo-gradient1-e1702547865254.png` as SVG) at 96px tall + "The numbers first. Then the view."; (2) contact: +971 56 241 9511, info@realestatebyumer.com, @umerdubaiinvestments, LinkedIn — all in DM Mono `--t-sm`; (3) "Muhammad Umer Riaz · Property Investment Consultant · AX Capital Real Estate · RERA BRN [number]" + legal links + disclaimer in `--t-2xs` `cream-300`. Motion toggle (`MOTION · ON / REDUCED`) lives here. | Fade-rise only. |
| 24 | **Motion toggle** | Jost 500 `--t-xs` caps; two-state text button; persists to `localStorage('rebu-motion')`. | Immediate (80ms). |
| 25 | **Cookie / consent** | Bottom-left card, `night-2`, `--hairline-strong`, DM Mono `--t-sm`; two secondary buttons. No banner across the bottom. | Fade-rise 640ms, 2s after load. |
| 26 | **Page curtain** | `night-0` full-viewport layer with centred elevation marker of the destination. | §5.9. |
| 27 | **Preloader** | §5.10. | §5.10. |
| 28 | **As-at stamp** | The freshness device — a bank statement's issue line, not a disclaimer buried in a footer. DM Mono 400 `--t-2xs` +0.04em `cream-300`, preceded by a 3px `champagne-200` dot: `● PRICES INDICATIVE · STARTING FROM · CORRECT AS AT 06 SEP 2026 · UPDATED DAILY BY UMER`. Date from the CMS `inventoryAsAt` timestamp, formatted `DD MMM YYYY` in `en-AE`. Appears in the foot row of every inventory table, under every from-price on project rooms, inside masterplan data cards, and on the Ledger PDF. If `inventoryAsAt` is older than 7 days the dot turns `cream-400` and the text reads `LAST CONFIRMED` instead of `CORRECT AS AT` — the design tells the truth about its own age. | Dot pulses once (opacity 1→0.4→1, 1200ms) when the section reveals, then is still. |
| 29 | **Under-confirmation marker** | A dagger `†` in `champagne-300` DM Mono after any figure whose two source lists disagree; the table foot carries `† FIGURE DIFFERS BETWEEN RELEASES · MASTER LIST SHOWN · CONFIRMING` in `--t-2xs`. Hover/focus on the dagger shows a tooltip with the alternate figure in `cream-300` (`ALT · 728 SQ FT · AED 1.902M`). The site never silently picks a number. | Tooltip fade 180ms. |

---

## 9. ACCESSIBILITY & REDUCED MOTION

### 9.1 Non-negotiables
- Every text/background pair in §2.5 or better. Body AAA, captions AA.
- Full keyboard operability. Visible focus everywhere: 2px `--focus` outline, `outline-offset: 3px`, radius 2px; on champagne fills the focus ring is `cream-100`.
- Skip link ("Skip to content") as the first focusable element; a second skip link *out of* each pinned WebGL section ("Skip this scene").
- Every canvas has `role="img"` and an `aria-label` describing what it depicts, plus an adjacent visually-hidden HTML description of the *information* it carries. **WebGL never carries information that isn't also in HTML** (masterplan data is a list; the payment-plan-as-light is a table; floor stacks are a table).
- Drag interactions have keyboard equivalents (arrow keys) and visible buttons ("Rotate ‹ ›", preset chips).
- Headings are a strict outline (one h1 per page; sections are h2). Landmarks: `header`, `nav`, `main`, `footer`, `section[aria-labelledby]`.
- Forms: labels always visible (no placeholder-as-label), errors linked via `aria-describedby`, submission status announced via `role="status"`.
- Touch targets ≥ 44×44. Line length ≤ 80ch. Text resizable to 200% without loss (fluid type + container queries handle this).
- Language `en-AE`. Numbers formatted with `Intl.NumberFormat('en-AE')`.

### 9.2 Reduced motion — three tiers, one preference
Motion preference resolves as: user's `prefers-reduced-motion` → site toggle in footer (`localStorage`) → default *full*.

| Behaviour | Full | Reduced |
|---|---|---|
| Lenis smooth scroll | On (desktop) | Off |
| Preloader | 1.4s sequence | 300ms fade, logo static |
| Reveals | Line-mask / fade-rise / mask-wipe / draw | Opacity only, 200ms, no translate |
| Scroll-scrubbed WebGL | Scrub 0.8 | Scenes render their **50% keyframe as a static frame**; captions still change with scroll (they are HTML) |
| Idle rotation / pointer parallax | On | Off |
| Drag-to-rotate | On | **On** (user-initiated motion is fine) |
| Count-up numerals | 1200ms | Instant |
| Parallax layers | Ratios in §5.6 | All 1.0 (flat) |
| Page curtain | 1.5s | 200ms crossfade |
| Hover glow / hairline warming | On | On (colour changes are not motion) |
| Film grain animation | Animated | Static grain frame |

Autoplaying video: none on the site. (If a hero video is ever added, it must be muted, ≤ 6s loop, paused under reduced motion, and ≤ 1.2 MB.)

---

## 10. PERFORMANCE BUDGET & QUALITY TIERS

### 10.1 Budget (homepage, cold, Moto G Power-class on 4G, and M1 laptop on cable)

| Metric | Mobile | Desktop |
|---|---|---|
| LCP | ≤ 2.5s | ≤ 1.8s |
| INP | ≤ 200ms | ≤ 120ms |
| CLS | ≤ 0.05 | ≤ 0.05 |
| Total JS (gz) incl. three.js | ≤ 380 KB | ≤ 380 KB |
| Critical CSS inline | ≤ 14 KB | ≤ 14 KB |
| Fonts | ≤ 190 KB total, 3 preloaded | same |
| Hero images/posters above the fold | ≤ 220 KB | ≤ 350 KB |
| 3D assets on first load (hero only) | ≤ 60 KB (procedural crystal — no GLB) | same |
| Lazy 3D per scene | Building GLB ≤ 900 KB Draco; masterplan ≤ 600 KB; illustration layers ≤ 1.8 MB per scene AVIF | same |
| Frame rate | ≥ 30 fps sustained, ≥ 45 in hero | ≥ 60 fps |
| GPU memory | ≤ 256 MB | ≤ 512 MB |

### 10.2 Techniques (required)
- three.js as tree-shaken ESM (~120 KB gz); no `examples/jsm` kitchen sink — import only what is used.
- **Single WebGLRenderer** for the whole site; `setPixelRatio(min(devicePixelRatio, 1.5))`; render only when a scene is in view and something changed (`invalidate` pattern), never a free-running loop off-screen; `requestAnimationFrame` paused on `visibilitychange`.
- Scenes lazy-instantiated when their section is within 1.5 viewports; disposed (geometry/textures) when > 3 viewports away.
- GLB with Draco; textures KTX2/Basis; ≤ 2048² per texture; mipmaps on.
- Post-processing at 0.75× resolution for the bloom pass; grain/vignette in the final composite pass only.
- Images: AVIF with WebP fallback, `srcset` at 640/960/1440/1920/2560, LQIP as a 24px blurred inline data URI, `fetchpriority="high"` on the hero poster only.
- Fonts: preload three, `size-adjust` fallbacks, `unicode-range` subset.
- Above-the-fold HTML complete without JS: the hero headline, lead and CTA render from server HTML; the canvas is an enhancement over a static AVIF poster of the crystal (exported from the prototype).

### 10.3 Quality tiers (auto-detected in the first 1.5s of the hero: GPU tier heuristic via `WEBGL_debug_renderer_info` + measured frame time)

| Tier | Trigger | Settings |
|---|---|---|
| **A** | Desktop dGPU/Apple Silicon, ≥ 55 fps | DPR 1.5, bloom on, dispersion on, transmission samples full, reflective floors, all four scenes live |
| **B** | Integrated GPU / flagship phone, 35–55 fps | DPR 1.25, bloom at 0.5× res, dispersion off, floor reflection off (matte with baked AO), illustrations at 5 layers |
| **C** | < 35 fps or `navigator.deviceMemory ≤ 4` or `saveData` | DPR 1, no post, crystal as `MeshStandardMaterial` with matcap-style env, building = sprite turntable, masterplan = SVG, illustrations = flat AVIF + CSS parallax |
| **Static** | No WebGL / reduced-motion + tier C | Poster images for all four scenes; page is fully functional |

Tier is re-evaluated if 20 consecutive frames exceed 33ms; step down one tier, never back up mid-session.

---

## 11. REFERENCE CANON — what we take, what we refuse

| Reference | Take | Refuse |
|---|---|---|
| **Likova — The Crystallisation of Possibility** (Awwwards SOTD Aug 2026; user's stated favourite) | The *discipline*: one dark ground, one light accent, type-forward, WebGL as focal illustration rather than wallpaper, heavy negative space. The four set-piece *types*. | Its navy/cream palette (we are warm-black/champagne), its generic property-finder UI, its treatment of 3D as demonstration rather than argument. |
| **above-the-clouds.nyc** | Alternating exterior/interior rhythm as you ascend; the sense that scroll is elevation. | Scroll-scaled headlines (our type never stretches). |
| **Hubtown — Unseen Studio** | The glowing monolith on a dark reflective landscape — our reflective ground plane and single-key lighting come from here. | The sci-fi coolness; our light is warm. |
| **Ever — Vide Infra** | WebGL as *narrative device*: every scroll position tells one beat of the property's story. Our building's "payment plan as light" is this principle applied to finance. | Nothing — but do not copy its transitions. |
| **Private-bank / wealth-office web (Pictet, Rothschild & Co, Lombard Odier)** | Restraint, documentary photography, the "as of" line under every number, the absence of exclamation marks. | Their motion poverty; we move, they don't. |
| **Deco architecture itself (Chrysler Building setbacks, Burj Khalifa's Y-plan and tiered spire)** | The setback grid (§4.2), the vertical ascent, the spire as progress line. | Ornament. Not one sunburst, not one zigzag border. |

Additional references from the design-research sweep are appended in §11.1 as they are verified.

### 11.1 Research addenda (September 2026 sweep — verified against Awwwards case pages)

**Corrections to the brief.** Likova is by **Vide Infra** (Awwwards SOTD + Developer Award, 19 Aug 2026; 7.33 overall, Animation 8.20, Usability 7.13 — its weakest leg). Its hero object is described by the studio as a *faceted glass cube* echoing the building's stepped facade; its layout motif is "stepped panels that flow into each other" — i.e. it, too, derived a grid from setbacks. Above the Clouds now lives at **quadplex80.com** (Outpost, SOTD 15 May 2025; Accessibility 6.40 — the sound-gated intro cost it). Ever won in **Aug 2023**.

**What the winners agree on (and how we respond):**

| Observation | Source | Our response |
|---|---|---|
| Every 2025–26 RE winner constrains 3D rotation to scroll/cursor; none ship free orbit controls | Likova, Hubtown, Sobha Privy Collection, ERA | Building yaw is free, pitch is clamped (−5°…25°), no zoom; masterplan drag is ±30° around the scroll-driven yaw |
| Gated intros ("Enter with sound") and self-running motion get punished on Usability/Accessibility | quadplex80 (6.40 A11y), Hubtown (7.22 Usability) | No gate, no sound, preloader ≤1.4s and skippable, one persistent motion only (the spire line) |
| Deep-green + bone is the current RE cliché (#205435/#ECE8E8, #162D24, #456A4B/#FFFBE7) | 25 Residences, Springs, Primland | Warm-black + champagne + warm cream — nobody in the category owns it |
| **Canela** is the display serif of the category (McAlpine House, Horizonte Village, Boyd) | Locomotive, The First The Last | Fraunces is Canela's nearest free relative (soft-contrast Old-style with an optical axis); we set SOFT 0 so it reads sharper than Canela, i.e. more "analyst" |
| Vertex-only line-drawn building silhouettes reacting to the cursor are tiny in payload and read as Deco "light-lines" | ERA (Vide Infra, triple SOTD Jan 2025) | Adopted for the masterplan's project pins and community edges, and as the tier-C fallback for the building |
| One hero object + cursor-reveal "dignifies an unglamorous brand" | Hubtown (Unseen) | The Spire Prism is that object; hover reveals are limited to hairline warming and the drag ring |
| A location map as the portfolio index, with a zoom transition into it | Hubtown (45 projects), Sobha 3D map, Primland terrain | Where the Numbers Point is the index of everything he sells |
| One "room" per hero item, scroll moves between rooms rather than down a page | Cartier W&W 2026 (Immersive Garden, Animation 9.0) | Rejected for the homepage (we need the vertical ascent to be literal) but adopted for project detail pages: each project is a room |
| Motion stack consensus: Lenis `duration 1.2`, `easing 1.001 − 2^(−10t)`, desktop only; single clock (`lenis.on('scroll', ScrollTrigger.update)`; `gsap.ticker.add`; `lagSmoothing(0)`); `scrub 0.6–1`, never `true` for cinematic; cursor/scroll lerp 0.07–0.12; inertia decay ×0.88–0.92/frame | Trionn/Codrops 2026, Cartier, Likova | Adopted verbatim in §5.6–5.7; our `scrub 0.8` and lerp 0.06–0.12 sit inside the consensus band |
| Reduced-motion best practice on 3D: slow rather than kill where the motion is informational | Utsubo 2026 survey | We go further (static 50% keyframe) because a wealth-office audience skews older and more motion-sensitive |

**Named palettes of the field, for contrast:** Likova `#070B20/#E3E6EB` · Hubtown `#020A19` · quadplex80 `#7C7262` · McAlpine `#241C19` · Silver Pinewood `#282828/#998170` · Ever `#DCE2EB/#95A3AE`. Ours: `#0A0B12 / #EAD2AE / #F1ECE3`.

---

## 12. DELIVERY CHECKLIST FOR THE ENGINEER

1. Build the token layer first (§2.3, §3.3, §4.1, §5.2, §5.3) as CSS custom properties and a TS `tokens.ts`. Nothing is hard-coded.
2. Type: self-host the six font files; verify `size-adjust` fallbacks with a font-blocked reload (CLS ≤ 0.05).
3. Implement the four reveals (§5.4) as a single `useReveal` hook / `[data-reveal]` attribute set; refuse ad-hoc animations.
4. Stand up the single-canvas WebGL host with tier detection *before* any scene work; port `prototype/crystal.html` into it as Scene 2 first — if the hero is right, the language is right.
5. Build Ground Truth (real DLD figures with period) and The Instrument (the 26-line Emaar inventory with derived AED/sq ft, the as-at stamp and dagger markers wired from the CMS). These two data components are the brand; get them right before any 3D beyond the hero.
6. Then the building (needs the Montiva GLB), then the Creek Harbour masterplan (needs the relief, district footprints and pin coordinates), then the illustrations (needs the commissioned plates).
7. Run the §9 audit and the §10 budget on every PR; block merges on CLS/LCP regressions.
