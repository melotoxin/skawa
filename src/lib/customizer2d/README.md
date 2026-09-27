# 2D customizer templates

The Design Lab's 2D mode renders a product from a **template**: a set of registered image layers plus printable zones. Products without a template fall back to an honest photo preview. The 3D mode is separate and never reads these files.

## Asset spec

Every layer of one view shares **one canvas and one registration** (the garment sits in exactly the same pixels in every file).

| Layer | File | Content |
|---|---|---|
| base | `<view>-base.webp` | Opaque neutral light-grey garment. Supplies parts that are never recoloured (lining, stitching, hardware). |
| shading | `<view>-shading.webp` | Opaque multiply map: white = no change, darker = folds, seams and shadow. |
| highlight | `<view>-highlight.webp` | Optional opaque screen map for sheen (black = none). |
| silhouette | `<view>-mask-silhouette.webp` | Garment outline with anti-aliased edges. Cut once, after every other layer. |
| body mask | `<view>-mask-body.webp` | Recolourable fabric (opaque/white = included). |
| trim mask | `<view>-mask-trim.webp` | Waistbands, bindings, cuffs, collars. |
| pattern mask | `<view>-mask-pattern.webp` | Panels that take sublimated patterns. |

- Canvas: **1200 × 1500 px (4:5)**, garment centred with a small margin.
- Colour layers (base, shading, highlight) are opaque, with their colours bled a few pixels past the garment edge. The silhouette mask supplies the outline, so edges never pick up a halo from the background.
- Body, trim and pattern masks hold **straight coverage inside the silhouette** (a pixel on the outer edge that is fully body reads 100 %, not its edge coverage).
- Masks are lossless WebP; colour layers are high-quality lossy WebP.
- Path: `public/images/customizer/<template-id>/<view>-<layer>.webp`.
- Garment templates are rendered from the approved GLB models by `scripts/customizer-render/` (read-only use of the models) and optimized by `scripts/build-customizer-assets.mjs`.

## Coordinates

Zones (`Zone2D.polygon`) and saved placements are **normalized to the view canvas**: `[0, 0]` is the top-left, `[1, 1]` the bottom-right. Artwork width is expressed as a fraction of the view width, so everything scales with the preview.

## Adding a product

1. Produce the layers above for each view (front, and back when the product has one).
2. Register a `Template2D` in `templates.ts` with the zones measured on the base image.
3. If several products share the same cut, map their slugs to the template in `aliases`.
4. Set `supports` honestly: a control that has no visible effect on the product must be `false`.

## Templates in this repo

| Template | Products | Source | Notes |
|---|---|---|---|
| `fight-short` | Fight Short, Elite Fight Shorts, Shadow Series, Reign Fight Shorts, Stealth Pro, Academy Gold Shorts, Crimson Training Shorts | `fight-short.glb` | Satin sheen; the waistband band is trim |
| `rashguard-long` | Full Sleeves | `rash-guard.glb` | Collar, cuffs and hem are trim |
| `rashguard-short` | Short Sleeves | `rash-guard.glb`, sleeves cut at render time | A hem band above the cut is trim |
| `gi` | BJJ Gi, Kids BJJ Gi | `bjj-gi.glb` (single textured mesh) | Regions derived from the image; baked-in third-party marks removed; competition palette; no trim or pattern |

## Producing layers

1. Run `npm run dev` and `node scripts/customizer-render/receive.mjs`.
2. Open `/scripts/customizer-render/render.html?template=<id>&save=1`. For single-mesh models, add `&original=1` to render the model's own materials.
3. Run `node scripts/build-customizer-assets.mjs <id>`. Templates with material regions use `MASKS` (ID-pass channels). Single-mesh templates use `DERIVED` (fabric/mark detection plus authored cleanup boxes).

## Checking a template

In the dev server console on `/customize`:

- `await (await import('/qa/customizer-2d/verify-template.js')).verifyTemplate('<product-slug>')` checks, by pixel sampling, that every control changes pixels only inside its own mask or zone, on every view.
- `await (await import('/qa/customizer-2d/release-check.js')).runReleaseCheck()` drives the full UI for all customizable products. The results are in `qa/customizer-2d-release.md`.

The composited proof, the zone placements and the downloaded PNG share one code path (`compose.ts`, `art.ts`, `export.ts`), so the export matches the screen.
