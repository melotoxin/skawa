# Product 3D models

One model per customizable product, generated from that product's own catalog photo (`public/images/products/`) with **Higgsfield · SAM 3 3D Objects** (Meta), 1 credit each, textured GLB. Higgsfield project: "SKAWA 3D product models".

Used by the 3D Design Lab (`src/components/three/DesignPreview3D.tsx`) and the product pages (`src/components/product3d/ProductStage.tsx`); the slug → file map is `productModelBySlug` in `src/lib/productModels.ts`.

- In the Design Lab the customer's design (colours, pattern, trim, name, logo) is projected onto the model's front and back.
- On product pages the model keeps its own photographed texture.

## Processing

Raw downloads are optimized with `scripts/model-tools/optimize-glb.mjs` (glTF-Transform, run outside the app):

- orientation fixes are baked into the vertices;
- duplicate data is merged and vertex normals computed (the raw files have none);
- textures are converted to 1024 px WebP;
- meshes are compressed with meshopt (`EXT_meshopt_compression`, decoded by drei's `useGLTF`).

The raw files average about 1.7 MB; the optimized ones about 0.8 MB.

| File | Products | Source photo | Size | Higgsfield job | Notes |
|---|---|---|---|---|---|
| `bjj-gi.glb` | BJJ GI | `bjj-gi-1.png` | 814 KB | `8c702a12-3d51-44ab-896e-173e66e40399` |  |
| `kids-bjj-gi.glb` | Kids BJJ Gi | `kids-bjj-gi.png` | 468 KB | `a50cd41f-56cc-4648-9c7b-2a79ff03a83a` |  |
| `fight-short.glb` | Fight Short | `fight-short-1.png` | 1070 KB | `5ef5f9a6-75fe-4bca-bb06-4fe971e9e72b` |  |
| `shorts-gold.glb` | Elite Fight Shorts, Academy Gold Shorts | `shorts-gold-cut.png` | 1101 KB | `eba9f66c-608c-4d21-9b9e-650ae179d44c` | Shared photo, shared model |
| `shorts-red.glb` | Shadow Series, Crimson Training Shorts | `shorts-red-cut.png` | 1031 KB | `2c6e0d55-604a-4fd6-898b-e247f6eb807b` | Shared photo, shared model |
| `shorts-white.glb` | Reign Fight Shorts | `shorts-white-cut.png` | 963 KB | `f3201749-06d2-42ee-8e9e-f5ffb840c9c2` | Photo placed on dark grey (white shorts on white failed) |
| `shorts-camo.glb` | Stealth Pro | `shorts-camo-cut.png` | 894 KB | `34943e08-cda6-4022-98a8-a07609f7ddf7` |  |
| `grappling-shorts.glb` | Grappling Shorts | `grappling-shorts.png` | 1336 KB | `5df6a652-8e8b-4510-97b5-e89e495de9d5` |  |
| `boxing-trunks.glb` | Boxing Trunks | `boxing-trunks.png` | 1344 KB | `6ba0dfc0-648f-4b23-9a52-bd8261f0c7f3` |  |
| `spats-compression-pants.glb` | Spats / Compression Pants | `spats-compression-pants.png` | 482 KB | `01a9d728-0daf-4cf4-82a3-85d8f9c65b3f` |  |
| `full-sleeves.glb` | Full Sleeves | `full-sleeves-1.png` | 1012 KB | `507b65e6-c2cc-4171-9951-138d0e8ba62b` |  |
| `short-sleeves.glb` | Short Sleeves | `short-sleeves-1.png` | 1120 KB | `6603f2ca-e812-40e4-94da-933fca6fe54b` |  |
| `karate-uniform.glb` | Karate Uniform | `karate-uniform.png` | 1430 KB | `746bd554-32a5-4f55-8677-2082823bf21a` | Folded, as in the catalog photo |
| `judo-uniform.glb` | Judo Uniform | `judo-uniform.png` | 964 KB | `d8b4f08c-3766-43b4-94e9-38bd2997ee1a` |  |
| `jiu-jitsu-belts.glb` | Jiu Jitsu Belts | `jiu-jitsu-belts.png` | 1874 KB | `60187cfd-f1aa-4f5e-a262-911941880dfa` | Coiled, as in the catalog photo |
| `boxing-gloves.glb` | Boxing Gloves | `boxing-gloves.png` | 1562 KB | `c64b31de-6d7d-4c40-8f72-9572ee3b84b6` |  |
| `mma-gloves.glb` | MMA Gloves | `mma-gloves.png` | 461 KB | `69a2fd3c-9d8e-485b-9d4f-5fce9b927301` | Rotated −90° about X (generated lying flat) |
| `focus-mitts.glb` | Focus Mitts / Focus Pads | `focus-mitts.png` | 340 KB | `ee53026c-013a-40c6-aa12-909cac4f415a` | Single mitt (the photo shows two separate mitts); rotated +90° about X |
| `shin-pads.glb` | Shin Pads | `shin-pads.png` | 802 KB | `02a6dc60-5914-4cb5-8a11-66f4bc65483c` |  |
| `hand-wraps.glb` | Hand Wraps | `hand-wraps.png` | 564 KB | `8c68d892-7056-4264-8cba-61ac13410306` |  |
| `sports-bags.glb` | Sports Bags | `sports-bags.png` | 586 KB | `3c1b3ed0-3e73-4d62-bb1e-472334431757` |  |
| `gear-bags.glb` | Gear Bags | `gear-bags.png` | ~1.2 MB | `9d7239bd-66f0-4532-be44-2c944c96a716` | Original textured backpack mesh and UVs retained; gold front zipper teeth and pulls added in Blender |

The Gear Bags backpack now has an editable Blender source at
`D:/blender/blender/bag/output/black_gear_backpack.blend`. Its repeatable edit
script is `D:/blender/blender/bag/improve_backpack.py` and its untouched input
GLB is `D:/blender/blender/bag/source/gear-bags-original.glb`. The script exports
back to `public/models/products/gear-bags.glb` with meshopt and WebP. The Sports
Bags duffel is a different product and uses `public/models/gear-bag.glb`.

## Replacing a model

1. Generate a new GLB from a clean photo of the product (single object, plain or dark background).
2. Optimize it: `node optimize-glb.mjs <rawDir> public/models/products <name>`.
3. Keep the file name, or update `productModelBySlug` and bump the `?v=` cache key in `apparelModelUrl`.
