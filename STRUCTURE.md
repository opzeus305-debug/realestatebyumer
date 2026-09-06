# REAL ESTATE BY UMER — SITE STRUCTURE, COPY & CHOREOGRAPHY
**Concept: MEASURED ASCENT** · Version 1.1 · 6 September 2026 (revised for the live Emaar inventory)
Companion: `DIRECTION.md` (tokens, type, motion, WebGL material spec) · `prototype/crystal.html`

Everything in `[square brackets]` is a fact to confirm with Umer before launch (list in §10). Nothing in this document is placeholder prose: every headline and paragraph is final draft copy unless bracketed. **Inventory figures are from `_research/INVENTORY.md` (master list, supplied 6 Sep 2026), are "starting from", indicative, and dated. `†` marks a figure on which his two lists disagree — the site shows the master figure with the marker; it never silently resolves.**

---

## 0. SITEMAP

```
/                          Home — the ascent (10 levels)
/projects                  The Ledger — every line currently for sale, as a data instrument
/projects/montiva          Project room — Montiva by Vida, Dubai Creek Harbour       (set-piece 1 at full depth)
/projects/silva            Project room — Silva, Dubai Creek Harbour
/projects/altan            Project room — Altan, Dubai Creek Harbour
/projects/baystar          Project room — Baystar by Vida, Rashid Yachts & Marina
/projects/sera-2           Project room — SERA 2, Rashid Yachts & Marina
/projects/vida-hillside    Project room — Vida Residences Hillside, Dubai Hills Estate
/projects/rosehill         Project room — Rosehill Golf Collection, Dubai Hills Estate
/projects/selvara          Project room — Selvara 3 & 4, Grand Polo Club & Resorts
/projects/emaar-beachfront Project room — Emaar Beachfront [tower name to confirm]
/communities/[slug]        Community pages ×5 — the masterplan set-piece per community (Creek Harbour, Dubai Hills, Rashid Yachts & Marina, Grand Polo Club, Emaar Beachfront)
/method                    How I work — the four steps, and a sample ledger to download
/market                    Dubai in numbers — the data page that replaces the blog; quarterly notes
/market/[note]             A single market note
/about                     Muhammad Umer Riaz — banker to consultant; credentials; the logo
/invest                    Send "INVEST" — WhatsApp, form, 20-minute call
/privacy  /disclaimer      Legal
```

Six primary destinations. Navigation shows five plus the CTA; `/invest` *is* the CTA. Community pages are reached from the Ledger and the masterplan, not from the nav.

---

## 1. NAVIGATION MODEL

### 1.1 Primary nav (all pages)
`[mark]  ·  PROJECTS   METHOD   MARKET   ABOUT   ·   [ SEND "INVEST" ]`

- The mark (small logo, flat champagne) links home. No "HOME" link.
- Desktop: links right-aligned, Jost 500 caps +0.16em; active page has a standing champagne underline.
- Mobile (`< lg`): the mark, the CTA pill (label shortens to `INVEST`), and a two-line menu glyph (two 18px hairlines, 6px apart; on open they rotate into an ×). The menu is a full-screen `night-0` panel; links in Fraunces `--t-2xl`, staggered line-mask; contact details in DM Mono beneath.
- The nav never hides on scroll. It compresses (72→56px) and gains a blurred ground.

### 1.2 The spire progress line (homepage, `lg+`)
A 1px vertical line in the left margin fills bottom→top with scroll progress. Ten notches, one per level; hovering a notch shows the level name in DM Mono; clicking scrolls there. It is the homepage's secondary navigation and the only permanent motion on the site.

### 1.3 Elevation markers
Each section announces itself in column 1: `LVL 04 · THE ASSET`. Inner pages carry a single marker for the page (`PROJECTS · MONTIVA`). The page-transition curtain shows the destination's marker.

### 1.4 Footer nav
Projects · Method · Market · About · Invest · Privacy · Disclaimer, plus contact and social. The footer is where the "Motion: On / Reduced" toggle lives.

### 1.5 The as-at stamp (site-wide freshness device — DIRECTION component 28)
`● PRICES INDICATIVE · STARTING FROM · CORRECT AS AT 06 SEP 2026 · UPDATED DAILY BY UMER`
It sits in the foot row of every inventory table, under every from-price in a project room, inside every masterplan data card, and on the Ledger PDF. The date is a single CMS timestamp Umer touches when he updates prices; if it is older than seven days the stamp downgrades itself to `LAST CONFIRMED`. Where a figure differs between his two releases it carries `†` and the foot row explains it. This is not a disclaimer. It is the reason to trust the table.

---

## 2. HOMEPAGE — THE ASCENT, LEVEL BY LEVEL

Reference viewport 1440×900. "vh" = viewport heights of scroll. Total ≈ 15 vh. Grid columns refer to the 12-column grid; the *setback rule* (DIRECTION §4.2) narrows the content column as the page ascends.

---

### LVL 00 · GROUND — HERO
**Purpose.** Establish in four seconds: this is a wealth office, the man reads numbers, and the brand is the tower of light. Deliver the spine sentence. Offer the one-word CTA.
**Scroll length.** Pinned 200vh. **Set-piece: #2, The Spire Prism.**

**Copy**
- Eyebrow: `DUBAI PROPERTY & INVESTMENT · MUHAMMAD UMER RIAZ, MBA`
- H1 (`--t-4xl`, Fraunces 300): **The numbers first.** *Then the view.* ← "Then the view." set in italic, `champagne-200`.
- Lead (`--t-md`, Jost 300, 44ch): Emaar's current releases, read the way a banker reads a balance sheet. Sixteen years across finance and real estate. Seventy-plus clients who bought on evidence, not enthusiasm.
- Primary CTA: `SEND "INVEST"` (WhatsApp deep link) · Secondary: `READ THE NUMBERS ↓` (anchors to LVL 01)
- Micro-rail (appears at 55% of hero scroll, bottom edge, DM Mono `--t-2xs`): `26 LINES · 5 COMMUNITIES · FROM AED 1.61M · CORRECT AS AT [DATE]`

**Layout.** Copy occupies columns 2–6, vertically centred. The prism occupies columns 7–12 and bleeds off the right edge and top, its base reflected in the floor plane at roughly the copy's baseline. On `< md` the prism sits behind the copy at 55% opacity, cropped to its upper half so the spire is visible above the headline.

**Motion.** Preloader (DIRECTION §5.10) hands off to the hero at ≤1.4s: the wordmark dissolves and the prism is already rotating. Eyebrow rule draws → eyebrow fades → H1 word-mask (the one word-level split on the site, stagger 40ms) → lead fade-rise → CTAs fade-rise. Total 2000ms `--d-epic`.

**WebGL script (scroll 0 → 200vh, scrub 0.8):**
| Scroll | Prism | Camera | Copy |
|---|---|---|---|
| 0% | Idle rotation 0.05 rad/s; pointer parallax on | FOV 32°, eye level ~1/3 up the object, slight upward tilt (+6°) | H1 + lead + CTAs |
| 0–40% | Rotation eases to 0.02; specular sweep peaks (key ×1.3 at 25%) | Dolly back 15%, tilt up to +14° — we begin to look *up* the tower | Copy holds; fades out 30–40% (opacity only) |
| 40–70% | **Facets separate into floors**: setback rings slide apart 0.15 units and 14 horizontal slabs light bottom→top inside the glass (emissive `#F4EADD` @ 0.6) — abstraction becomes architecture | Tilt to +22°, orbit 30° | Micro-rail fades in at 55% |
| 70–100% | Slabs dim; the object dissolves into ~6,000 champagne points that drift *upward* and disperse | Camera settles level for LVL 01 | Points become the light-field behind the LVL 01 stat tiles |

**Static/reduced.** Poster AVIF of the prism at frame 0 (exported from the prototype), copy fully visible, no pin (section is 100vh).

---

### LVL 01 · GROUND TRUTH — THE DATA BAND
**Purpose.** Prove the thesis before any biography: the market is public and legible. Six numbers, sourced and dated.
**Scroll length.** ~120vh free-scrolling. **Set-piece:** none; the hero's dispersed points linger as a dim, slowly drifting field behind the tiles (fade to 0 by end of section).

**Copy**
- Eyebrow: `GROUND TRUTH`
- H2 (`--t-2xl`): **Dubai does not need selling. It needs reading.**
- Lead: The market publishes everything. Most people never look. These are the figures I start every conversation with, and I will update them here when they change.
- Stat tiles (3×2 desktop, 2×3 tablet, 1×6 mobile):

| Numeral | Label | Sub-label |
|---|---|---|
| **85,223** | Transactions | +59.7% year on year |
| **AED 232.3B** | Transaction value | +79.1% year on year |
| **~11%** | Average capital growth | across the market |
| **5–7%** | Forecast annual growth | consensus estimate |
| **+20%** | Rents, trailing twelve months | occupancy 60% → 70% |
| **0%** | Tax on property, income and gains | since freehold opened in 2002 |

- Body (columns 2–7, after tiles): Three structural facts sit underneath the numbers: freehold ownership for foreigners since 2002, a ten-year Golden Visa for qualifying property buyers, and no tax on what you earn from an asset or what you sell it for. They are not a pitch. They are the terms.
- Footnote (DM Mono `--t-2xs`, `cream-300`): Source: Dubai Land Department transaction data, [period — confirm year/half]. Growth forecasts are estimates and not a guarantee. Method and full tables on the Market page.
- Link: `SEE THE MARKET PAGE →`

**Layout.** 12 columns (Ground level: full width). Headline on column 2, spanning 8. Tiles span columns 2–12 with hairline top edges only. The two largest figures may take `--t-4xl`; the rest `--t-3xl`.

**Motion.** Section hairline draws. H2 line-mask. Tiles: hairline draw → label fade-rise → count-up 1200ms, stagger 110ms capped at 600ms. Numbers lock.

---

### LVL 02 · STRUCTURE — THE ANALYST
**Purpose.** Introduce Umer as the differentiator: the banker, not the salesman. Short, first person, no CV dump.
**Scroll length.** ~110vh. **Set-piece:** none. Portrait (Grade B duotone).

**Copy**
- Eyebrow: `THE ANALYST`
- H2: **An ex-banker in a market of salesmen.**
- Body (two paragraphs, columns 2–6):
  I spent the first part of my career inside the exchange houses — UAE Exchange, then Al Rostamani — where a decimal point was the difference between a good day and a resignation. I moved into Dubai property because I kept watching intelligent people buy on enthusiasm and sell on panic.

  My job now is to be the person in the room who has already read the file: the developer's record, the payment schedule, the service charges, the rental comparables, the exit. Then to tell you, plainly, whether it holds.
- Pull line (Fraunces italic `--t-xl`, columns 8–12, beside the portrait): *If the numbers do not work, I will tell you. That is most of the job.*
- Credential chips: `MBA · BANKING & FINANCE` · `RERA CERTIFIED` · `AX CAPITAL REAL ESTATE` · `16+ YEARS` · `70+ CLIENTS`
- Link: `ABOUT UMER →`

**Layout.** 10 columns (first setback: offset 1). Portrait in columns 8–12, 3:4, mask-wipe from bottom; the pull line overlaps the portrait's lower-left corner by one column. Mobile: portrait first, then copy.

**Motion.** Portrait mask-wipe 900ms with 1.08→1.0 settle. Chips stagger 60ms.

---

### LVL 03 · STRUCTURE — THE METHOD (paper band)
**Purpose.** Show the process as a document. This is the only inverted (paper) band on the site: the page becomes the ledger he hands you.
**Scroll length.** ~130vh. **Set-piece:** none.

**Copy**
- Eyebrow (`gilt` on paper): `THE METHOD`
- H2 (`ink-1`): **Four steps. No step skipped.**
- Steps (a 4-row ledger; numeral in DM Mono, title in Fraunces `--t-lg`, body in Jost):

  **01 · READ** — Your position, not a product. Budget, currency, timeline; whether you want yield, growth, a residence visa, a home, or several of those. Twenty minutes, usually on WhatsApp.

  **02 · MODEL** — The shortlist as a ledger: entry price, price per square foot, payment schedule to handover, expected rent, service charges, projected exit. Every assumption written down where you can see it.

  **03 · SELECT** — One or two recommendations, with reasons. What could go wrong, and what we would do about it.

  **04 · HOLD & EXIT** — Handover, tenant, management, and the moment to sell or refinance. I stay on the file.

- Closing line: You receive the model as a one-page document — the same page I would want if I were the buyer.
- CTA (secondary, ink border): `REQUEST A SAMPLE LEDGER` → opens the lead-capture sheet (§5.2).

**Layout.** Full-bleed `paper-1` band; content 10 columns. Steps as four hairline-separated rows (`ink-1 @ 12%`): numeral (col 2), title (cols 3–5), body (cols 6–11). A faint dot-grid (`ink-1 @ 4%`, 24px pitch) textures the paper so it reads as a document, not a white section.

**Motion.** Band edge enters as a hard cut. Rows fade-rise stagger 90ms. On row hover the hairline warms to `gilt`.

---

### LVL 04 · MASSING — THE ASSET (featured project: Montiva by Vida, Dubai Creek Harbour)
**Purpose.** Demonstrate the method on a real tower. Make the price driver — the view — visible as light. The hook: the best view in the building is of something that has not been built yet.
**Scroll length.** Pinned 300vh. **Set-piece: #1, the rotatable building.**

**Copy**
- Eyebrow: `FEATURED · MONTIVA BY VIDA · DUBAI CREEK HARBOUR · EMAAR`
- H2: **One tower, read floor by floor.**
- Stage captions (Jost `--t-md`, columns 2–5, crossfade as scroll passes each third):
  - Stage 1 — A Vida-branded residence on the creek. One-bedrooms from 765 sq ft; three-bedrooms to 1,835. Handover September 2029.
  - Stage 2 — Three products in one address. One-bedrooms from AED 1.92M, two-bedrooms from 2.85M, three-bedrooms from 4.10M. On a per-square-foot basis the three-bedroom is the cheapest line in the building: AED 2,234 against 2,510 for the one-bedroom. Size is discounted here. [Umer to confirm his read.]
  - Stage 3 — Every face sees something the market prices: the golf course, the Downtown skyline, and the site of the Future Creek Tower. You are buying a view of a building that does not exist yet. That is either the risk or the reason. My job is to tell you which.
- Data rail (DM Mono, under caption): `FROM AED 1.92M · 765–1,835 SQ FT · HANDOVER SEP 2029 · VIDA · ● AS AT [DATE]`
- Affordance label near canvas: `DRAG TO ROTATE` (+ preset chips `CREEK` `GOLF` `SKYLINE`)
- CTAs: `READ MONTIVA'S NUMBERS →` (project room) · `SEND "INVEST"`

**Layout.** Canvas bleeds right, columns 5–12, full viewport height; copy panel columns 2–5. Mobile: building in the upper 60vh, copy below with a 40vh sticky footer.

**WebGL script (0 → 300vh):**
| Scroll | Building | Camera | HTML |
|---|---|---|---|
| 0–10% | Fades in from `night-0` with creek reflection; auto-rotate 0.03 rad/s | "Creek" preset: eye at podium height, 35° yaw, +8° pitch | Eyebrow, H2, Stage 1 caption |
| 10–33% | Drag enabled; interior lights on ~30% of windows randomly | Slow orbit +25° | — |
| 33–66% | **Exploded view**: floors separate to 0.35 storey-heights apart over 1200ms; three stack labels draw: `1 BED · 765 SQ FT · FROM AED 1.92M`, `2 BED · 1,143 SQ FT · FROM AED 2.85M`, `3 BED · 1,835 SQ FT · FROM AED 4.10M` [floor ranges per type to confirm] | Pitch to +18°, dolly back 20% so the stack fits | Stage 2 caption |
| 66–95% | Floors return; **the view as light**: as the camera orbits 120°, each facade group illuminates when it faces the camera — `FACES · CREEK GOLF` → `FACES · DOWNTOWN SKYLINE` → `FACES · FUTURE CREEK TOWER SITE` — with a 1px leader from the facade centroid; on the last beat a single tall light-line rises on the horizon where the Creek Tower will stand, and the whole tower lights with `HANDOVER · SEPT 2029` stamped at the roof | Orbit; ends on the Creek Tower face | Stage 3 caption |
| 95–100% | Holds lit; auto-rotate resumes | Holds | CTAs fade-rise |

**Fallback.** Tier C: 36-frame WebP turntable, drag scrubs frames; stages 2–3 become a static labelled line-art elevation with the three stacks and three faces as HTML.

---

### LVL 05 · MASSING — WHERE THE NUMBERS POINT (Dubai Creek Harbour masterplan)
**Purpose.** Show that he chooses *places*, not units. One masterplan, read as infrastructure: what is built, what is coming, and where the three Creek Harbour projects sit inside it.
**Scroll length.** Pinned 250vh. **Set-piece: #3, the rotating WebGL masterplan.**

**Copy**
- Eyebrow: `THE MASTERPLAN · DUBAI CREEK HARBOUR`
- H2: **Where the numbers point.**
- Lead: Dubai is not one market. It is thirty, moving at different speeds. I work in Emaar's masterplans because the infrastructure is drawn before the towers are sold — you can read what is coming.
- Layer captions (crossfade with scroll):
  - L1 (creek + sanctuary) — Six square kilometres on the creek, facing the Ras Al Khor sanctuary. Water on one side, a protected flamingo reserve on the other. Neither can be built on. [area to confirm]
  - L2 (bridges, roads, transit) — Two bridges to Downtown and Business Bay [confirm]; Ras Al Khor Road; a planned transit link. Ten minutes to Downtown, fifteen to the airport. [drive times to confirm]
  - L3 (districts + Creek Tower site) — Creek Island, Creek Beach, the marina, the golf course, and the site reserved for the Creek Tower. The plan is published. The pieces are dated.
  - L4 (project pins) — Three current releases: Altan on the water, Silva and Montiva behind it. Eight lines, AED 1.81M to 4.21M, all handing over between July and September 2029.
  - L5 (drive-time rings) — The distance to Downtown is ten minutes. The price difference per square foot is not ten per cent. That gap is the investment. [confirm against Downtown comparables before publishing the second sentence]
- Pins (3): `ALTAN · WATERFRONT · JUL 2029` · `SILVA · UNSCRIPTED VIEW COLLECTION · SEP 2029` · `MONTIVA BY VIDA · SEP 2029`
- Data card fields (per pin, CMS): Project · brand chip · From (AED) · Size range · Handover · View · `● AS AT [DATE]` · `READ →`
- Affordance: `DRAG TO TURN` · Link beneath: `SEE ALL FIVE COMMUNITIES →` (`/projects`)

**Layout.** Canvas full-bleed; copy panel columns 8–12 (right side — the zig-zag). Pins' data cards project into the canvas area.

**WebGL script (0 → 250vh):**
| Scroll | Map | Camera |
|---|---|---|
| 0–15% | Creek edge and sanctuary boundary draw as champagne lines (Draw reveal along the path, 1200ms); water plane fades to reflective | Top-down plan, FOV 20°, north up |
| 15–35% | Bridges, roads, transit draw (0.6 opacity hairlines; transit as a brighter dashed line) | Rotating clockwise; tilt to 10° |
| 35–55% | District footprints extrude 0.4 units with edge glow, staggered from the water inward; the Creek Tower site rises as a single tall light-line | Rotate to 45°, tilt to 22° |
| 55–75% | Three pins rise; data cards attach; active pin cycles every 60vh unless hovered | Rotate to 75°, tilt to 30° |
| 75–100% | Drive-time rings (10/15/20 min) draw around the active pin as dashed circles | Settles at 90° rotation, 35° isometric; drag ±30° allowed |

**Fallback.** Static SVG masterplan, identical line style; pins as buttons with hover/focus cards.

---

### LVL 06 · MASSING — THE LEDGER
**Purpose.** Everything for sale, as one instrument. The user's budget becomes a line on the table. This section is the brand's argument made physical: real sizes, real from-prices, real dates, derived per-square-foot, stamped and dated.
**Scroll length.** ~180vh. **Set-piece:** none (the table *is* the set-piece).

**Copy**
- Eyebrow: `CURRENT RELEASES · EMAAR`
- H2: **Five communities. Twenty-six lines. One developer.**
- Lead: Every line below is a current Emaar release I have read in full — sizes, from-prices, handover, what the windows face. The per-square-foot column is mine: it is the number the brochures leave out.
- **The Instrument** (DIRECTION component 15). Filter row: `COMMUNITY` · `BEDROOMS` · `HANDOVER` · `BRAND (ALL / VIDA)`. Budget finder: `WHAT DOES AED 3.0M BUY TODAY?` Output line: `AT AED 3.0M · 11 OF 26 LINES · FROM ROSEHILL 1 BED TO ALTAN 2 BED`.
- The table (grouped by community; master list; `†` = differs between his two releases; AED/sq ft derived from the master figures):

| Community | Project | Type | Size (sq ft) | From (AED) | AED / sq ft (derived) | Handover | View |
|---|---|---|---|---|---|---|---|
| **Dubai Hills Estate** | Rosehill — Golf Collection | 1 Bed | 745 † | 1.61M † | 2,161 | Jun 2029 | Golf course |
| | Rosehill — Golf Collection | 2 Bed | 1,191 | 2.62M | 2,200 | Jun 2029 | Golf course |
| | Rosehill — Golf Collection | 3 Bed | 1,670 † | 3.67M † | 2,198 | Jun 2029 | Golf course |
| | Vida Residences Hillside · VIDA | 1 Bed | 764 † | 1.88M † | 2,461 | May 2029 | Park |
| | Vida Residences Hillside · VIDA | 2 Bed | 1,311 † | 3.23M † | 2,464 | May 2029 | Park |
| | Vida Residences Hillside · VIDA | 3 Bed | 1,583 | 4.06M † | 2,565 | May 2029 | Park |
| **Dubai Creek Harbour** | Silva — Unscripted View Collection | 1 Bed | 744 | 1.81M | 2,433 | Sep 2029 | Creek Tower, golf |
| | Silva — Unscripted View Collection | 2 Bed | 1,154 | 2.83M † | 2,452 | Sep 2029 | Creek Tower, golf |
| | Silva — Unscripted View Collection | 3 Bed | 1,834 | 4.04M | 2,203 | Sep 2029 | Creek Tower, golf |
| | Montiva by Vida · VIDA | 1 Bed | 765 | 1.92M | 2,510 | Sep 2029 | Creek Tower, golf, skyline |
| | Montiva by Vida · VIDA | 2 Bed | 1,143 | 2.85M | 2,493 | Sep 2029 | Creek Tower, golf, skyline |
| | Montiva by Vida · VIDA | 3 Bed | 1,835 | 4.10M | 2,234 | Sep 2029 | Creek Tower, golf, skyline |
| | Altan — waterfront | 2 Bed | 1,180 † | 3.08M † | 2,610 | Jul 2029 | Creek, golf |
| | Altan — waterfront | 3 Bed | 1,848 | 4.21M | 2,278 | Jul 2029 | Creek, golf |
| **Rashid Yachts & Marina** | SERA 2 | 1 Bed | 728 | 2.10M | 2,885 | [confirm] | Marina |
| | SERA 2 | 2 Bed | 1,328 | 3.20M | 2,410 | [confirm] | Marina |
| | SERA 2 | 3 Bed | ~1,700 | 4.36M | 2,565 | [confirm] | Marina |
| | Baystar by Vida · VIDA | 1 Bed | 728 | 2.10M | 2,885 | Dec 2029 | Marina |
| | Baystar by Vida · VIDA | 2 Bed | 1,226 | 4.40M | 3,589 | Dec 2029 | Marina |
| | Baystar by Vida · VIDA | 3 Bed | 1,700 | 6.57M | 3,865 | Dec 2029 | Marina |
| | Baystar by Vida · VIDA | 4 Bed | 2,900 | 11.30M | 3,897 | Dec 2029 | Marina |
| **Grand Polo Club & Resorts** | Selvara 3 & 4 — semi-detached villa | Villa | 3,830 BUA / 3,229 plot | 6.50M | 1,697 (on BUA) | [confirm] | Polo, resort |
| | Selvara 3 & 4 — detached villa | Villa | 3,830 BUA / 3,229 plot | 6.80M | 1,775 (on BUA) | [confirm] | Polo, resort |
| **Emaar Beachfront** | [Tower — confirm] | 2 Bed | 1,383 | 5.04M | 3,644 | [confirm] | Sea, Palm |
| | [Tower — confirm] | 3 Bed | 1,790 | 9.20M | 5,140 | [confirm] | Sea, Palm |
| | [Tower — confirm] | 4 Bed | 4,462 | 26.00M | 5,827 | [confirm] | Sea, Palm |

  Foot rows (DM Mono `--t-2xs`):
  `● PRICES INDICATIVE · STARTING FROM · CORRECT AS AT [DATE] · UPDATED DAILY BY UMER`
  `† FIGURE DIFFERS BETWEEN RELEASES · MASTER LIST SHOWN · CONFIRMING` (dagger tooltips carry the alternates: Vida Hillside 1 Bed `ALT 728 SQ FT · AED 1.902M`; 2 Bed `ALT 1,182 SQ FT · AED 2.756M`; 3 Bed `ALT AED 4.07M`; Rosehill 1 Bed `ALT 750 SQ FT · AED 1.62M`; 3 Bed `ALT 1,656 SQ FT · AED 3.68M`; Altan 2 Bed `ALT 1,453 SQ FT · AED 3.29M`; Silva 2 Bed `ALT AED 2.65M`)
  `AED / SQ FT DERIVED FROM THE FIGURES ABOVE · VILLAS ON BUILT-UP AREA · SOURCE: EMAAR BROKER RELEASES`

- **Three reads under the table** (Fraunces `--t-lg` numerals, Jost body; the analyst speaking; each ≤ 40 words):
  1. **AED 1.61M → 26M.** The same developer, a sixteen-fold price range. The cheapest line and the dearest are both on this page, on purpose.
  2. **728 to 765 sq ft.** Six one-bedrooms, almost the same size, from AED 1.61M to 2.10M — a 30 per cent spread for twenty square feet. The spread is the address and the view, and it is the whole conversation.
  3. **2029.** Every dated handover falls between May and December 2029. This is a three-year position. Price it like one.
- **The Vida line** (a sub-block with its own eyebrow `THE VIDA LINE · BRANDED RESIDENCES`; Fraunces `--t-xl` headline; 3 project chips): **Ten of the twenty-six lines carry a name.** Body: Vida is Emaar's branded residence line — Baystar at the marina, Montiva on the creek, Hillside in Dubai Hills. A brand on the door changes the buyer at resale and the operator in the lobby. Whether it is worth its premium on a given line is a number, not a feeling; it is in the ledger I send you. [Umer to confirm the branded-residence terms — management, furnishing, service charges — before any claim beyond this paragraph.]
- CTA row: `SEND ME THESE LINES` (WhatsApp, prefilled with the filtered set) · `REQUEST THE FULL LEDGER (PDF)`

**Layout.** 12 columns; the table spans 2–12 and scrolls horizontally inside its own container below `lg` (the page never scrolls sideways). Group headers in Fraunces `--t-lg` occupy a full row. Filter row is sticky under the nav while the table is in view.

**Motion.** Rows fade-rise in reading order, stagger 60ms capped at 600ms. Filter and budget interactions per component 15. Nothing in the table ever slides.

---

### LVL 07 · SPIRE — THE VIEW
**Purpose.** The reward. This is where lifestyle lives — at the top, earned. Three short beats over a layered illustration of a Creek Harbour terrace at blue hour.
**Scroll length.** ~200vh, parallax (not pinned). **Set-piece: #4, layered 3D illustration — "The Terrace" plate (Creek Harbour, looking toward Downtown across the water).**

**Copy**
- Eyebrow: `THE VIEW`
- H2 (`--t-3xl`, 8 columns, offset 2): **This is what the numbers are for.**
- Beats (Fraunces 300 `--t-xl`, one at a time, each pinned ~50vh while the layers drift):
  1. A terrace at seven in the evening, when the city turns the colour of the logo.
  2. A key that is also a ten-year residence. Twenty-two of the twenty-six lines clear the Golden Visa threshold. [confirm current AED 2M threshold]
  3. An asset that pays its own way while you decide what comes next.
- Closing line (Jost `--t-md`, `cream-200`): The lifestyle is real. It is simply the second thing we discuss.

**Layout.** Illustration full-bleed behind; copy centred in 8→6 columns (the spire narrowing). Type is always 1.0× scroll; layers move around it.

**WebGL script (0 → 200vh):** layers translate at ratios 0.15 (sky) · 0.30 (far Downtown skyline) · 0.55 (Creek Tower site light-line and mid towers) · 0.75 (near towers) · 1.00 (the terrace) · 1.15 (balustrade, plants) · 1.25 (haze). Pointer pan ±3%, lerp 0.06. At 40% the city's windows begin to light (flicker shader, random stagger over 1.5s); at 70% the creek surface gains a slow ripple normal-map. Haze drifts from mauve (`#5A4356`) to indigo (`#2B2F4A`) across the section — dusk turning to night.

**Fallback.** Flattened AVIF with two-layer CSS parallax; reduced motion = flat.

---

### LVL 08 · SPIRE — ON RECORD
**Purpose.** Social proof without stock faces: numbers, real quotes, credentials.
**Scroll length.** ~90vh. **Set-piece:** none.

**Copy**
- Eyebrow: `ON RECORD`
- H2 (6 columns, offset 3 — the narrowest column on the page): **Seventy clients. Sixteen years. One method.**
- Testimonials (component 16): **three real client quotes, to be collected** — no quote is to be written by the studio. Format when collected: quote in Fraunces italic; attribution as `PRIVATE INVESTOR · [CITY] · [YEAR]` (no names unless the client insists; discretion is the product). Until three are collected, the section renders the **numbers-only variant** and the testimonial block is omitted. Never ship a placeholder quote.
- Numbers row (DM Mono): `70+ CLIENTS ADVISED` · `16+ YEARS IN FINANCE & PROPERTY` · `RERA BRN [number]` · `AX CAPITAL REAL ESTATE · ORN [number]`

**Layout.** 6 columns centred. Testimonials as a vertical stack (no carousel), separated by hairlines.

---

### LVL 09 · RETURN — INVEST
**Purpose.** Convert. One word.
**Scroll length.** ~100vh. **Set-piece:** none; the hero prism returns as a faint, distant silhouette on the horizon behind the form (the same object, seen from the ground again — the loop closes).

**Copy**
- Eyebrow: `BEGIN`
- H2 (`--t-3xl`): **Send one word.**
- Body: Message **INVEST** on WhatsApp and I will reply personally, usually within the hour during Dubai business hours. Tell me your budget and your objective — or tell me nothing yet. The first twenty minutes are for me to listen.
- Primary CTA: `SEND "INVEST" ON WHATSAPP` · Secondary: `OR LEAVE YOUR DETAILS` (reveals the form inline, 320ms)
- Form (component 18): Name · WhatsApp number · Email · Budget (select: `UNDER AED 2M` / `AED 2M – 4M` / `AED 4M – 7M` / `AED 7M+` / `PREFER TO DISCUSS`) · Objective (select: `RENTAL YIELD` / `CAPITAL GROWTH` / `RESIDENCE VISA` / `A HOME TO LIVE IN` / `SEVERAL OF THESE`) · Message (optional) · Consent checkbox · `SEND`
- Success state (`role="status"`): **Received.** I will reply on WhatsApp, usually within the hour. — Umer
- Contact line (DM Mono): `+971 56 241 9511 · INFO@REALESTATEBYUMER.COM · DUBAI, UAE · @UMERDUBAIINVESTMENTS`

**Layout.** 10 columns (the return to the wider base). Copy columns 2–6, form columns 7–11.

---

### FOOTER
Tall lockup logo (SVG redraw of `umer-logo-gradient1-e1702547865254.png`, 96px) with the spine sentence beneath · contact block · credentials & legal: `Muhammad Umer Riaz · Property Investment Consultant · AX Capital Real Estate LLC · RERA BRN [n] · ORN [n]` · disclaimer: *Market figures are drawn from Dubai Land Department data as of the date shown. Project figures are Emaar's published starting prices and sizes, indicative, correct as at the date shown, and subject to availability and the developer's sale and purchase agreement. Forecasts are estimates, not guarantees. Nothing on this site is financial advice. Real Estate by Umer is independent of Emaar Properties PJSC; Emaar and Vida are trademarks of their owners.* · Motion toggle · © 2026 Real Estate by Umer.

---

## 3. THE FOUR SET-PIECES — WHERE THEY LIVE

| # | Set-piece | Homepage | Elsewhere | Scroll behaviour summary |
|---|---|---|---|---|
| 2 | **Spire Prism** (abstract faceted object, champagne light) | LVL 00 hero (200vh pin); returns as horizon silhouette in LVL 09 | `/about` hero (static, slowly rotating, behind the logo story); page-transition curtain glint; 404 | Idle rotation + pointer parallax → facets separate into lit floors → dissolves to points |
| 1 | **Rotatable building** — Montiva by Vida | LVL 04 (300vh pin) | Every `/projects/[slug]` room hero at full depth (exterior → exploded stack → view-as-light → unit picker); Baystar and Vida Hillside get GLBs next, the rest turntables until modelled | Drag-rotate with inertia; 3 view presets; keyboard; scroll drives stages |
| 3 | **WebGL masterplan** — Dubai Creek Harbour | LVL 05 (250vh pin) | `/projects` index (Dubai-wide variant: five community footprints, one pin per project, drag only); `/communities/[slug]` (that community's masterplan with its pins and rings); project rooms (zoomed to the project's pin) | Plan → 35° isometric over 90° rotation; layers stack in; drag ±30° |
| 4 | **Layered illustrations** | LVL 07 "The Terrace" (Creek Harbour, 200vh parallax) | `/about` "The Window" plate behind the biography; community pages "The Drive"/"The Marina"/"The Fairway" plates as commissioned | Depth ratios 0.15→1.25; pointer pan; window lights and haze react to scroll |

---

## 4. INNER PAGES

### 4.1 `/projects` — The Ledger
- Marker `PROJECTS`. H1: **Everything currently for sale, as a ledger.** Lead: Twenty-six lines across five Emaar communities. Sizes, from-prices, handover, what the windows face, and the per-square-foot figure the brochures leave out.
- Dubai-wide masterplan (set-piece 3 variant) at 60vh: five community footprints on the coast-to-inland relief, nine pins, drag only. Clicking a community filters the Instrument below and offers `SEE THE MASTERPLAN →` (community page).
- The Instrument (full LVL 06 table), the three reads, the Vida line, the as-at stamp → project cards (nine) → CTA band.
- Filters are the Instrument's own (community / bedrooms / handover / brand + budget). No separate "property finder" (Likova's finder is its weakest score; we are not repeating it).

### 4.2 `/communities/[slug]` — The Masterplan (template ×5)
Marker `COMMUNITY · DUBAI CREEK HARBOUR`. H1 = community name. Lead = one sentence of infrastructure fact [Umer/Emaar masterplan to confirm each]. Set-piece 3 pinned 250vh with the LVL 05 layer script adapted to that plan (Dubai Hills: the park, the golf course, the mall, Al Khail Road; Rashid Yachts & Marina: the marina basin, the canal, Mina Rashid; Grand Polo Club: the polo fields, the villa clusters; Beachfront: the island, the two beaches, the marina). Then the community's lines from the Instrument (pre-filtered), a plate (set-piece 4) where commissioned, and the CTA.

### 4.3 `/projects/[slug]` — The Room (template; worked example: Montiva by Vida)
Marker `PROJECTS · MONTIVA`. Scroll is a sequence of "rooms" (the Cartier principle applied per project):
1. **Room 1 — The Tower.** Set-piece 1 at full depth, pinned 350vh. H1: **Montiva.** Sub: **By Vida, for Emaar, on Dubai Creek Harbour. Handover September 2029.** Stages as LVL 04 plus a fourth: **unit picker** — hovering a floor group highlights the type; clicking opens a floor-plate drawer (SVG plans from the broker pack, DM Mono dimensions) [plans to source].
2. **Room 2 — The Numbers.** The project's ledger:

| Line | Size | From | AED / sq ft | Handover | Faces |
|---|---|---|---|---|---|
| 1 Bed | 765 sq ft | AED 1.92M | 2,510 | Sep 2029 | Creek Tower site, golf, skyline |
| 2 Bed | 1,143 sq ft | AED 2.85M | 2,493 | Sep 2029 | Creek Tower site, golf, skyline |
| 3 Bed | 1,835 sq ft | AED 4.10M | 2,234 | Sep 2029 | Creek Tower site, golf, skyline |

   Plus: payment plan [Emaar schedule per SPA — confirm], service charge [AED/sq ft — confirm], expected rent range and indicative gross yield [confirm], Vida brand terms [confirm], Emaar delivery record [confirm figures]. Every cell has a source footnote; the as-at stamp sits under the table.
3. **Room 3 — The Plan.** Payment timeline as a hairline-drawn horizontal ledger from reservation to September 2029, ticks per instalment [from the Emaar schedule once confirmed]; the budget finder preset to this project's three lines.
4. **Room 4 — The Place.** Set-piece 3 zoomed to Creek Harbour with Montiva's pin active and drive-time rings; captions: the creek, the sanctuary, the bridges, the Creek Tower site, the golf course.
5. **Room 5 — The Read.** Umer's analysis, first person, 250–400 words, under the heading **What I would want to know before signing.** Structure: *What is good · What is not · Who this is for · Who it is not for.* [Umer writes; studio edits.] Seed for the "good" paragraph, from the figures: the three-bedroom's AED 2,234/sq ft is the lowest in the building and among the lowest in Creek Harbour's current releases (only Silva's 3 Bed at 2,203 is lower).
6. **Room 6 — The View.** Set-piece 4 "The Terrace" plate or re-graded broker-pack interiors as a layered plate.
7. **Room 7 — Begin.** `REQUEST MONTIVA'S LEDGER` (gated PDF) · `SEND "INVEST"` (prefilled `INVEST — Montiva`).

### 4.4 `/method` — How I Work
H1: **Four steps. No step skipped.** The LVL 03 content at essay length (each step 120–180 words), then **What the ledger contains** (an annotated sample page rendered as a paper document, with callouts in DM Mono), then **What I charge** — [confirm: commission paid by developer; no fee to buyer] stated plainly — then the sample-ledger download (gated). Paper band throughout the ledger portion.

### 4.5 `/market` — Dubai in Numbers
Replaces the blog. Marker `MARKET`. H1: **Dubai in numbers.** Lead: The figures I check before every recommendation, updated when the Land Department publishes.
- Dashboard: the six Ground-Truth tiles plus small charts (12-month transaction volume; price/sq ft by community for the five Emaar communities against the Instrument's derived from-prices; rent index). Chart rules: DIRECTION §2 palette only — champagne series on night, hairline axes, DM Mono labels, no gridlines heavier than `--hairline`, direct labels not legends.
- Notes list (CMS): title in Fraunces `--t-xl`, date + read-time in DM Mono, one-line summary. Launch set (Umer writes, studio edits, each 600–900 words, each with at least one sourced table):
  1. **The Golden Visa, in numbers** — the threshold, what qualifies, which of the current lines clear it, the maths of a ten-year residence.
  2. **Zero tax is not the whole story** — service charges, DLD fees, what actually leaves your pocket on a AED 3M line.
  3. **Price per square foot, explained** — why the same one-bedroom costs AED 1.61M in one community and 2.10M in another, and when the spread is worth paying.
  4. **Branded or not** — what a Vida name does to resale and rent, with the current lines side by side.
  5. **The quarterly note — [Qn 2026]** — what moved, what didn't, what I'm watching.
- No categories, no tags, no author box, no comments.

### 4.6 `/about` — Muhammad Umer Riaz
Marker `ABOUT`. Hero: portrait frame 3 (profile at the window) with H1 over it: **The numbers first.** Then the copy of LVL 02 at length (400–600 words), a **timeline** as a vertical hairline ledger (bottom→top, the ascent): `UAE Exchange · [years]` → `Al Rostamani International Exchange · [years]` → `MBA, Banking & Finance · [institution, year]` → `fäm Properties · [years]` → `AX Capital Real Estate · 2023–` → `RERA certification · [year]`. Then **The mark** — the logo story with the Spire Prism rotating slowly behind the actual logo; copy: *The mark is the Burj Khalifa drawn as four letters. Wide at the base, disciplined as it rises, a single point at the top. It is also how a good decision is shaped.* Then credentials, affiliations (AX Capital, RERA; Emaar as the developer whose releases he currently sells — text only), languages [confirm], and the CTA.

### 4.7 `/invest` — Send "INVEST"
The LVL 09 section as a full page, with an embedded 20-minute booking (Cal.com, styled to tokens) titled **Book the first twenty minutes** and a WhatsApp QR (for desktop visitors). This is the Instagram bio link target (`/invest?utm_source=instagram&utm_medium=bio`).

### 4.8 Legal
`/privacy` and `/disclaimer` on the paper band, DM Mono headings, Jost body, no motion. The disclaimer page carries the full independence statement (not Emaar's official site; trademarks; indicative prices; as-at mechanism explained in one paragraph).

### 4.9 404
Marker `LVL ?? · NOT ON THE PLAN`. H1: **This floor does not exist.** The prism rotates behind; links to Projects and Invest.

---

## 5. CONVERSION PATH & LEAD CAPTURE

### 5.1 The hook, adapted
Umer's Instagram CTA is *DM "INVEST"*. On the site the same word does the same job, so a follower who arrives from Instagram meets a familiar instruction:

- **Primary — WhatsApp deep link**, everywhere the pill appears: `https://wa.me/971562419511?text=INVEST` (the message body is exactly the one word; Umer's phone shows the trigger he already uses). Clicks fire an analytics event `cta_invest` with the section as a property.
- Mobile: after the hero, a fixed 56px champagne circle bottom-right (component 10) carries the WhatsApp glyph; tap = same link.
- Desktop: the nav pill + a QR on `/invest`.

### 5.2 Secondary — "Request the ledger" (gated document)
Because the brand is evidence, the lead magnet is evidence: a one-page **Investment Ledger** per project (PDF, paper-band design: the lines with derived AED/sq ft, the payment timeline, the community's drive-time rings, Umer's four-line read, sources, the as-at stamp). Gate: WhatsApp number + email (name optional). Delivery: instant email via Resend **and** a WhatsApp message from Umer's number within business hours. Fields → CRM with `project` tag.

### 5.3 Tertiary — the Instrument hand-off
`SEND ME THESE LINES` prefills WhatsApp with the filtered set, e.g. `INVEST — Budget AED 3.0M · Dubai Creek Harbour · 2 Bed · Silva 2.83M, Montiva 2.85M, Altan 3.08M`. This is the highest-intent action on the site (the user has already told us the budget and the place) and is tracked separately (`cta_lines`).

### 5.4 Booking
Cal.com event "The Read — 20 minutes" embedded on `/invest`, WhatsApp-first reminder.

### 5.5 Form handling
`/api/lead` (serverless) → validate → Resend email to `info@realestatebyumer.com` (+ auto-reply to user, plain text, signed "— Umer") → WhatsApp Business API notification to +971 56 241 9511 [confirm availability; fallback: email only] → row in CRM (HubSpot Free or Notion database — Umer's choice) with UTM, page, section, budget band, objective, filtered lines → analytics event. Spam: Turnstile (invisible). Consent: explicit checkbox; privacy link.

### 5.6 Measurement
Plausible (privacy-first, no banner needed) for pageviews and the events above; Meta Pixel **only after consent** for Instagram retargeting (his audience lives there). Funnel: `view_hero → view_ground_truth → view_ledger → cta_invest | lead_ledger | cta_lines`. Scroll-depth by level (the elevation markers make this trivially instrumentable). Budget-finder value distribution is the single most useful analytic on the site: it tells Umer what his audience can spend.

### 5.7 Response promise
Copy says "usually within the hour during Dubai business hours." Umer must be able to keep that; if not, change the copy, not the truth. The same applies to `UPDATED DAILY` on the as-at stamp: the CMS downgrades the wording automatically after seven days, but a stale ledger is a broken promise.

---

## 6. RECOMMENDED TECH STACK

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 15 (App Router), React 19, TypeScript** | A persistent WebGL canvas across route transitions needs a client-side router with layout persistence; App Router layouts give us that. Static generation for every page; ISR for `/projects`, community pages and `/market` when the CMS changes (daily price updates must not need a deploy). Alternative if the team prefers minimal JS: Astro 5 with a React island for the canvas — viable, but route-persistent canvas is harder. |
| 3D | **three.js (≥ r180) via React Three Fiber + drei** | R3F gives declarative scene composition and a single `<Canvas>` mounted once in the root layout; drei supplies `MeshTransmissionMaterial` (higher-quality transmission than core, for the prism), `useGLTF` with Draco, `Html` for anchored labels, `PerformanceMonitor` for tier detection. Post-processing via `@react-three/postprocessing` (Bloom, Noise, Vignette, ChromaticAberration) at 0.75× resolution. |
| Scroll | **Lenis** (desktop only) + **GSAP 3 + ScrollTrigger** | Industry standard for pinned scroll scenes; single clock (`lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker`). GSAP is free including plugins since 2025. `gsap.matchMedia()` for mobile timelines and reduced motion. |
| Type | Self-hosted woff2 via `next/font/local` | Zero third-party requests, `size-adjust` fallbacks, preload control. |
| Styling | **CSS Modules + CSS custom properties** (tokens from DIRECTION), no Tailwind | The design is token-heavy and bespoke; a utility framework would fight the setback grid and fluid type. Container queries via native CSS. |
| CMS | **Sanity** (free tier) | Umer edits prices daily from his phone (Sanity Studio is mobile-usable); one `inventoryAsAt` timestamp drives the stamp; structured content (§8); real-time preview; image pipeline with AVIF. Alternative: Payload if the team wants it in-repo. |
| Forms / email | Next route handler + **Resend** + **Cloudflare Turnstile** | Simple, reliable, no PHP. |
| PDF | `@react-pdf/renderer` on a route handler | The Ledger PDF generated from CMS data at request time so it always carries the current as-at date. |
| Booking | **Cal.com** embed | Free, brandable, WhatsApp reminders. |
| Analytics | **Plausible** (+ Meta Pixel behind consent) | Privacy-first; no cookie banner needed for Plausible alone. |
| Hosting | **Vercel** (or Cloudflare Pages) | Edge network reaches UAE/GCC well; image optimisation; preview deployments for design review; ISR. |
| 3D asset pipeline | Blender → glTF (Draco) → KTX2 (toktx) via `gltf-transform` | Blender models the Montiva tower and the Creek Harbour relief; renders the illustration plates in layers via View Layers/Cryptomatte. |
| Quality gates | Lighthouse CI on PRs; axe-core in Playwright; a `budget.json` enforcing DIRECTION §10 | Budget regressions block merges. |

**Repo shape (suggested):** `app/` routes · `components/` DOM components (incl. `Instrument/`) · `scenes/` R3F scenes (`Prism`, `Tower`, `Masterplan`, `Plates`) · `motion/` GSAP timelines + `useReveal` · `tokens/` CSS + TS · `content/` Sanity schemas · `public/fonts`, `public/3d`, `public/plates`.

---

## 7. ASSET MANIFEST

### 7.1 Brand
| Asset | Spec | Source / action |
|---|---|---|
| Primary logo (SVG) | Redraw `umer-logo-gradient1-1.png` as vector: paths for the four shafts + spire; gradient as SVG `linearGradient` (#D9B484 → #EAD2AE → #F4EADD → #FFFFFF → #DEC6A2); a flat `champagne-300` variant for ≤120px | Studio, from PNG |
| Tall lockup (SVG) | Same from `umer-logo-gradient1-e1702547865254.png` | Studio |
| Small mark (SVG) | From `home-page-umer-logo.png`; simplified strokes for 24–32px | Studio |
| Favicon set | Spire-only mark on `night-1`; 32/180/512 + `.ico` | Studio |
| OG image | 1200×630, prism poster + spine sentence | From prototype render |

### 7.2 Photography (commission; brief in DIRECTION §7)
| Shot | Frames | Format |
|---|---|---|
| Umer portrait set (3 frames) | Half-body to camera; seated with document; profile at window | RAW → AVIF/WebP at 640/960/1440/1920/2560 + duotone variants |
| Office / hands / documents details | 4–6 | Grade B |
| Blue-hour exteriors: Creek Harbour from the water toward Downtown; Dubai Hills park edge; Rashid Yachts & Marina basin; Emaar Beachfront from the marina; Grand Polo fields at dusk | 8–10 | Grade A; horizon level; no fireworks |
| Optional: 6-second muted loop of the creek at dusk | 1 | Only if ≤1.2 MB; not in v1 |

### 7.3 3D (build)
| Asset | Spec |
|---|---|
| **Spire Prism** | Procedural in code (no file) — port `prototype/crystal.html`; export a 2560×1440 AVIF poster and a 1200×630 OG |
| **Montiva GLB** | ≤120k tris, Draco; per-floor meshes `floor_01..floor_NN` [storeys to confirm], `podium`, `roof`, `fins`, `glazing`, facade groups `face_creek`, `face_golf`, `face_skyline`, emissive `lights_floor_NN_[face]`; origin at ground centre; +Y up; metres; no logotypes |
| **Baystar, Vida Hillside GLBs** | Same spec, second priority |
| **Turntables ×9** | 36 frames, 1200×1200 WebP, all projects (tier-C fallback and rooms without GLBs) |
| **Creek Harbour relief** | ≤40k tris; creek edge, sanctuary boundary, bridges, roads, transit as polylines (GeoJSON → line geometry); district footprints (Creek Island, Creek Beach, marina, golf course, Creek Tower site); pin coordinates ×3 from CMS |
| **Dubai-wide relief** | Coast-to-inland; five community footprints; nine pins; roads as reference only |
| **Community reliefs ×4** | Dubai Hills, Rashid Yachts & Marina, Grand Polo Club, Emaar Beachfront — same spec as Creek Harbour |
| **Illustration plates ×3 (v1)** | "The Terrace" (Creek Harbour → Downtown), "The Window" (interior, dusk), "The Marina" (Rashid Yachts) — Blender renders 3840×2160, 5–7 depth layers each as PNG-alpha → AVIF, plus window-light and haze masks; house grade in render, 2% grain in compositor |
| **SVG masterplan fallbacks** | Same geometry flattened, per community |
| **Line-art elevations ×9** | SVG per project, hairline strokes, unit stacks labelled (tier-C tower fallback) |

### 7.4 Documents
| Asset | Spec |
|---|---|
| Investment Ledger PDF template | A4, paper-band design, DM Mono + Jost + Fraunces embedded; generated per project from CMS data with the as-at stamp |
| Sample ledger (Method page) | Anonymised real example, Umer to supply figures |

### 7.5 Data
| Data | Source | Cadence |
|---|---|---|
| Ground-truth figures (6) with period | DLD / DXBinteract | Quarterly, with "as of" date |
| Inventory lines (26) with alternates where they differ | Emaar broker releases via Umer | Daily; one `inventoryAsAt` touch |
| Per-community: drive times, infrastructure facts, footprint geometry | Emaar masterplans / Umer | On change |
| Per-project: payment plan, service charge, rent range, yield, brand terms | Emaar SPA / broker pack | On change |
| RERA BRN, AX Capital ORN | Umer | Once |

---

## 8. CMS CONTENT MODEL (Sanity)

- `siteSettings` — spine sentence, contact, socials, RERA/ORN, disclaimer, response-promise text, motion default, **`inventoryAsAt` (datetime — the one field Umer touches daily)**.
- `groundTruth[]` — `value`, `unit`, `label`, `subLabel`, `period`, `source`, `order`.
- `community` — `name`, `slug`, `developer` ("Emaar"), `geo` (centroid), `driveDowntownMin`, `driveDXBMin`, `infrastructureFacts[]`, `masterplanAssets {relief, svg, districts[]}`, `plate`.
- `project` — `name`, `slug`, `brand` (enum: none / Vida), `community` (ref), `storeys`, `handover` (month/year or TBC), `views[]`, `paymentPlan[] {milestone, pct, date}`, `serviceChargeSqft`, `rentRange`, `yieldIndicative`, `umersRead {good, notGood, forWhom, notForWhom}`, `glb`, `turntable[]`, `plates[]`, `ledgerPdf`, `sources[]`.
- `inventoryLine` — `project` (ref), `type` (1 Bed … 4 Bed / Villa), `sizeSqft`, `plotSqft` (villas), `priceFromAED`, **`altSizeSqft`, `altPriceFromAED`, `altSource`** (populated only where releases disagree → renders `†`), `view`, `order`. `pricePerSqft` is computed, never stored.
- `marketNote` — `title`, `slug`, `date`, `summary`, `body` (portable text with table blocks), `sources[]`.
- `testimonial` — `quote`, `descriptor`, `city`, `year`, `consentOnFile` (boolean, required true to publish).
- `timelineEntry` (About) — `org`, `role`, `from`, `to`.

---

## 9. VOICE — RULES FOR ANYONE WRITING FOR THIS SITE

1. First person singular. He is "I". Never "we" (there is no we). Never "Umer" in his own voice except in the signature.
2. Short sentences. One idea per sentence. Full stops, not dashes, most of the time.
3. A number before an adjective. If a sentence has no number, ask why.
4. British spelling. "Per cent" in prose; "%" in data. "Sq ft" not "sqft" in prose.
5. Banned words: luxury, luxurious, exclusive, stunning, breathtaking, dream, opportunity, hurry, limited, guaranteed, passive income, hot, boom, skyrocket, don't miss, unlock, elevate, seamless, bespoke, curated, world-class, iconic, prestigious, VIP, last units.
6. Allowed once per page, if earned: "the view."
7. Every price is "from". Every figure carries a source and an as-at where it appears, or on the same screen.
8. Forecasts are always framed as estimates. Never "will"; "is expected to" or "the consensus estimate is".
9. No exclamation marks. No emoji on the site (Instagram is a different medium).
10. Developer and brand names as text only, and the site never implies it is Emaar's.
11. Sign-offs and auto-replies are signed "— Umer".

---

## 10. VERIFY WITH UMER BEFORE LAUNCH

1. **The seven disagreements** between his two lists (Vida Hillside 1/2/3 Bed; Rosehill 1/3 Bed; Altan 2 Bed; Silva 2 Bed) — which is current. Until resolved, the site shows the master figure with `†`.
2. Missing handovers: Selvara 3 & 4, SERA 2, Emaar Beachfront.
3. Emaar Beachfront: which tower(s) the three lines belong to.
4. Montiva: storey count, facade orientation (which faces see the Creek Tower site / golf / skyline), floor ranges per unit type; broker-pack floor plans and licence to reproduce renders.
5. Payment plans per project (Emaar schedule and milestones) — needed for Room 3 and the Ledger PDF.
6. Service charges, expected rents and indicative yields per project; Vida brand terms (management, furnishing) before any claim in "The Vida line".
7. Golden Visa threshold as currently applied (AED 2M) and whether off-plan qualifies at the stated price — governs the LVL 07 beat "twenty-two of twenty-six".
8. Creek Harbour facts: area, bridges, transit status, drive times to Downtown and DXB; Downtown price/sq ft comparable for the L5 caption.
9. Period and exact source for the six ground-truth figures.
10. RERA BRN; AX Capital ORN; legal entity name for the footer.
11. Years for each timeline entry (UAE Exchange, Al Rostamani, MBA institution, fäm, AX Capital, RERA).
12. Three real client testimonials with written consent (or omit the block).
13. Fee model statement for the Method page.
14. WhatsApp Business API availability for lead notifications.
15. Languages spoken.
16. Photography and 3D commissioning approval; Emaar's position on re-modelling Montiva's massing and re-grading broker-pack renders.
17. That the Imtiaz "Beach Walk Residence" link in his message is excluded (not Emaar; outside the current positioning) — or, if he sells it, how it enters the Ledger.
