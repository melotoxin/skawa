# 2D Design Lab — release gate

Date: 2026-09-26 · Build: local working tree (not committed, not deployed) · Tested in: Chromium 152 (Claude in-app browser; no GPU and no WebGL, so canvas renders in software)

## Summary

| Area | Result |
|---|---|
| Functional matrix (24 products × 14 features) | **289 pass · 47 n/a · 0 fail** |
| Export parity (Part A) | **Pass**: on-screen proof and export differ by **0** pixel values at identical scale |
| Breakpoints (8 widths) | **Pass**: no overflow, no clipped controls, 4:5 preview preserved. One bug found and fixed (see below) |
| Region isolation (pixel sampling, 4 templates × 2 views) | **Pass**: every control changes pixels only inside its own mask or zone |
| Accessibility (automated) | **Pass**: 0 unlabeled controls; hints and status messages use `role="status"` |
| Backward compatibility | **Pass**: pre-change designs validate and load; `textPlacement`/`logoPlacement` untouched |
| 3D untouched | **Pass**: `node scripts/check-3d-baseline.mjs` reports 15 files unchanged and `paintDesign()`/`outline()` unchanged |
| Cross-browser, real devices, 3D visual compare | **Not run**: needs devices and WebGL (owners below) |
| Performance budget | **Partly met** in this GPU-less environment; re-measure on a GPU laptop (owner below) |

`npx tsc -b` ✓ · `npm run build` ✓ (the existing three.js chunk-size warning is unchanged) · `node scripts/check-3d-baseline.mjs` ✓

## Coverage

- **Full-colour 2D proof (11 products, 4 templates)**: Fight Short and its six Muay Thai variants (`fight-short`), Full Sleeves (`rashguard-long`), Short Sleeves (`rashguard-short`), BJJ Gi and Kids BJJ Gi (`gi`).
- **Honest photo preview (13 products)**: the clean photo with a "Photo preview" badge and colour chips. What's needed to template each is in [docs/customizer-2d/template-brief.md](../docs/customizer-2d/template-brief.md) and [docs/customizer-2d/photo-requests.md](../docs/customizer-2d/photo-requests.md).

## Part A — export parity

- **Download front & back PNG** now builds a proof sheet with a SKAWA header, the product name, the design ID (or "Unsaved design"), the date, colour chips with hex values, pattern, fabric and method, both views, and the disclaimer *"Design concept — final fit, colour and print placement subject to production approval."*
- **Templated products:** the views are composed by the same `composeView()`, with the same inputs (`composeInput()` in `src/lib/customizer2d/art.ts`) as the on-screen proof, at the native 1200 × 1500 layer resolution, cropped to the garment.
  - Parity check: a saved design recomposed through the export path at the on-screen scale gave **0 differing values** on both views.
  - Why not "scale 2": the layers are 1200 × 1500, so a 2× export would only upsample them without adding detail.
- **Photo-preview products:** the clean photo, the same text and logo overlay rules as the screen, colour chips, and "back view not available yet" when there is no true back photo.
- 3D is unchanged: the `paintDesign()` frames still feed the 3D preview exactly as before; the download no longer uses them.

## Part B1 — functional matrix

Driven through the real UI by `qa/customizer-2d/release-check.js` (2D mode). ✓ = pass. "chip"/"overlay" means the photo preview shows the choice as a colour chip or overlay. Views: ⇄ = front + back, F = front only.

| Product | 2D proof | Views | Base | Trim | Accent | Pattern | Text | Logo | Zone change | Cross-view drag | Mirror | Undo/redo | Save | Reload | JSON export/import | Download PNG |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| BJJ GI | gi | ⇄ | ✓ | n/a | n/a | n/a | ✓ | ✓ | ✓ 5 zones | ✓ | n/a¹ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Fight Short | fight-short | ⇄ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ 6 zones | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Full Sleeves | rashguard-long | ⇄ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ 4 zones | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Short Sleeves | rashguard-short | ⇄ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ 4 zones | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Elite Fight Shorts | fight-short | ⇄ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ 6 zones | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Shadow Series | fight-short | ⇄ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ 6 zones | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Reign Fight Shorts | fight-short | ⇄ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ 6 zones | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Stealth Pro | fight-short | ⇄ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ 6 zones | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Academy Gold Shorts | fight-short | ⇄ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ 6 zones | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Crimson Training Shorts | fight-short | ⇄ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ 6 zones | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Kids BJJ Gi | gi | ⇄ | ✓ | n/a | n/a | n/a | ✓ | ✓ | ✓ 5 zones | ✓ | n/a¹ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Grappling Shorts | photo | F | chip | chip | chip | chip | overlay | overlay | n/a² | n/a³ | n/a³ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Jiu Jitsu Belts | photo | F | chip | chip | chip | chip | overlay | overlay | n/a² | n/a³ | n/a³ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Spats / Compression Pants | photo | F | chip | chip | chip | chip | overlay | overlay | n/a² | n/a³ | n/a³ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Sports Bags | photo | F | chip | chip | chip | chip | overlay | overlay | n/a² | n/a³ | n/a³ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Boxing Gloves | photo | F | chip | chip | chip | chip | overlay | overlay | n/a² | n/a³ | n/a³ | ✓ | ✓ | ✓ | ✓ | ✓ |
| MMA Gloves | photo | F | chip | chip | chip | chip | overlay | overlay | n/a² | n/a³ | n/a³ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Shin Pads | photo | F | chip | chip | chip | chip | overlay | overlay | n/a² | n/a³ | n/a³ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Focus Mitts / Focus Pads | photo | F | chip | chip | chip | chip | overlay | overlay | n/a² | n/a³ | n/a³ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Hand Wraps | photo | F | chip | chip | chip | chip | overlay | overlay | n/a² | n/a³ | n/a³ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Boxing Trunks | photo | F | chip | chip | chip | chip | overlay | overlay | n/a² | n/a³ | n/a³ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Karate Uniform | photo | F | chip | chip | chip | chip | overlay | overlay | n/a² | n/a³ | n/a³ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Judo Uniform | photo | F | chip | chip | chip | chip | overlay | overlay | n/a² | n/a³ | n/a³ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Gear Bags | photo | F | chip | chip | chip | chip | overlay | overlay | n/a² | n/a³ | n/a³ | ✓ | ✓ | ✓ | ✓ | ✓ |

1. After the cross-view drag the name sat in "Lower back (above belt)", which has no front counterpart, so the mirror control is disabled with an explanation. Mirroring between Upper back and Left chest works (verified separately).
2. Photo previews keep the shared placement (print side + sliders); there are no zones to change.
3. There is no true back photo yet, so the preview shows the front only, captioned "Back view not available yet".

- **Front/back:** for the 11 templated products, every colour, pattern, text and logo check ran on both views (`qa/customizer-2d/verify-template.js`).
- **Reload:** besides record validation for all 24, a full page reload (`/customize?design=<id>`) restored Fight Short (text on the left rear leg, logo on the left leg), BJJ GI (white; text on the lower back, logo on the thigh) and Boxing Gloves (chips and camo pattern) exactly.
- **Product switch:** placements are remembered per template (fight-short → left leg, rashguard-long → lower back, rashguard-short → its own default) across switches.

## Part B2 — breakpoints

Checked while shrinking the live page from 1920 px down to 375 px.

| Width | Horizontal overflow | Clipped controls | Preview aspect | Proof inside its column |
|---|---|---|---|---|
| 1920 | none | 0 | 0.800 / 0.800 | ✓ |
| 1440 | none | 0 | 0.800 / 0.800 | ✓ |
| 1280 | none | 0 | 0.800 / 0.800 | ✓ |
| 1024 | none | 0 | 0.800 / 0.800 | ✓ |
| 768 | none | 0 | 0.800 / 0.800 | ✓ |
| 430 | none | 0 | 0.800 / 0.800 | ✓ |
| 390 | none | 0 | 0.800 / 0.800 | ✓ |
| 375 | none | 0 | 0.800 / 0.800 | ✓ |

**Fixed during the gate:**
- **Cause:** proof figures were centred rather than stretched inside their grid column, so a proof box sized at a wide window could never shrink.
- **Symptom:** at 768 px it overflowed its column by about 90 px.
- **Fix:** `.dl-proof2d>figure{width:100%}` and a max size on the box (in `src/design-lab.css`).

## Part B3 — browsers

| Browser | Status | Owner / reason |
|---|---|---|
| Chromium 152 desktop | **Pass** (everything in this report) | — |
| Firefox desktop | **Not run** | QA: not available in this environment |
| Safari desktop | **Not run** | QA: not available in this environment |
| iOS Safari | **Not run** | QA: needs a device |
| Android Chrome | **Not run** | QA: needs a device (mobile layout was emulated at 375/390/430 in Chromium) |

The renderer uses only standard Canvas 2D compositing (`multiply`, `screen`, `destination-in`, `lighter`), supported by all current evergreen browsers. Text uses Anton from Google Fonts, and the proof waits for it (up to 3 s) before drawing text. The delta-E ≤ 3 cross-browser comparison needs the devices above.

## Part B4 — performance

Measured in this environment. There's no GPU here, so canvas runs in software and the numbers are pessimistic. The timings were noisy. Worst case: camo pattern plus text.

| Template | Assets (both views) | Colour change, 1× | Colour change, 2× | Artwork drag, 1× | Artwork drag, 2× |
|---|---|---|---|---|---|
| fight-short | 268 KB | 15.9 ms | 33.2 ms | 15.9 ms | 27.9 ms |
| rashguard-long | 305 KB | 15.7 ms | 29.7 ms | 23 ms¹ | 7.8 ms |
| rashguard-short | 193 KB | 11.3 ms | 42.3 ms | 1.9 ms | 8.0 ms |
| gi | 375 KB | 3.6 ms | 17.1 ms | 1.5 ms | 6.9 ms |

¹ Outlier. The same template drags in under 8 ms at 2×.

- **Optimisations made during the gate:**
  - Layers are resampled once per render size and then copied 1:1. The cache is bounded to about 48 MB, least recently used out.
  - The garment (colours, pattern, trim) is cached per canvas, so dragging artwork only redraws the artwork.
  - The fabric mask is cached per view.
  - Recomposition is throttled to one per animation frame.
- **Assets:** every product is well under 1 MB (193–375 KB for both views).
- **Memory:** JS heap stayed flat across 50 product switches (166 → 169 → 167 MB), with only two proof canvases alive.
- **Open:** colour changes at 2× on fight-short (33 ms) and rashguard-short (42 ms) exceed the 33 ms budget in this software-rendered environment. **Owner: development**, to re-measure in GPU-accelerated Chrome on a mid-range laptop. If still over, cache the pattern layer per (pattern, colours, size).

## Part B5 — accessibility

- **Labels:** automated audit of every button, input and select in the Design Lab found 0 without an accessible name.
- **Proof views:** each is `role="img"`, with a live description: product, side, colours, pattern, and what prints where.
- **Status regions:** print hints (contrast below 2.5:1, soft artwork under 2× print resolution, text auto-fitted below 22 px) and the gi palette note sit in `role="status"` regions that are always rendered.
- **Drag alternatives:** dragging has full slider equivalents (zone select plus horizontal, vertical, size and rotation).
- **Keyboard:** every control is native (buttons, selects, inputs, a checkbox), and the tabs support arrow, Home and End keys.
- **Not run:** a complete keyboard-only, screen-reader walkthrough (design → save). **Owner: QA.**

## Part B6 — backward compatibility

- **Old designs load:** designs without `placements2d`, including legacy `mirrorArt` designs, pass `isDesign()`.
- **Malformed data is rejected:** out-of-range values, arrays, bad template ids and bad sides.
- **3D is unaffected:** 3D keeps reading `textPlacement`/`logoPlacement`, which are unchanged. 2D zone placements are an additive, optional field stored per template id.
- **Round trips:** saved and exported JSON load back in both directions (matrix above).

## Part B7 — 3D proof

- `node scripts/check-3d-baseline.mjs` exits 0: 15 files unchanged in `src/components/three`, `src/components/product3d`, `public/models` and `src/lib/productModels.ts`; `paintDesign()` and `outline()` are unchanged. GLB files were only read, by the offline renderer.
- **Not run:** a visual comparison of 3D screenshots (Fight Short, Full Sleeves, BJJ GI), because this environment has no WebGL. **Owner: QA**, on any WebGL machine.

## Open items

| Item | Owner | Notes |
|---|---|---|
| Photography for the 13 photo-preview products | SKAWA | [photo-requests.md](../docs/customizer-2d/photo-requests.md), [template-brief.md](../docs/customizer-2d/template-brief.md) |
| Gi lapel contrast (trim) | SKAWA + dev | The gi model has no separate lapel. Needs a model with a lapel part, or a lapel plate |
| Gi lapel text zone | dev | Needs zones that follow a diagonal strip; not in this release |
| Cross-browser and device pass | QA | Firefox, Safari, iOS Safari, Android Chrome |
| Performance re-measure on a GPU | dev | See B4 |
| Keyboard + screen reader walkthrough | QA | See B5 |
| 3D visual comparison | QA | See B7 |
