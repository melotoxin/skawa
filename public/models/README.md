# SKAWA Fight 3D assets

The product model router (`src/lib/productModels.ts`) uses these Blender-authored
GLBs for the matching catalog products. These are real geometry, not rotating
product photographs:

| Catalog product | Web asset | Blender source |
| --- | --- | --- |
| Full Sleeves | `rash-guard.glb` | `D:/blender/blender/shirt/output/skawa_rashguard_web.glb` |
| Fight Short | `fight-short.glb` | `D:/blender/blender/shorts/output/muay_thai_shorts_web.glb` |
| Sports Bags | `gear-bag.glb` | `D:/blender/blender/bag/output/black_duffel_bag.glb` |
| BJJ Gi / Kids BJJ Gi | `bjj-gi.glb` | `E:/Video Promo/bjj-gi-scene/bjj_gi_clothes.blend` |

The two apparel models also appear in the live customizer. The duffel keeps
its distinct nylon, leather and gold materials in both product and customizer
3D views. Its 3D view currently previews the base color; the 2D proof remains
the artwork-placement reference until production UV/print zones are approved.

`fight-short.glb` is a web-optimized repack of the supplied model. Its opaque
4K PNG textures were resized to 2K JPEG using
`scripts/optimize-glb-images.mjs`; geometry, materials and source Blender files
were not changed. The original export remains in the Blender folder.

Other catalog items use their own models in `products/` or a procedural
fallback. The Gear Bags catalog image depicts a backpack, so it deliberately
does **not** use the duffel model.
