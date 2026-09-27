# Customizer baseline (captured before the 2D rebuild)

Proof that the 3D customizer is untouched and a record of how 2D behaved before the rebuild.

| File | What it is |
|---|---|
| `3d-files.sha256` | SHA-256 of every 3D file: `src/components/three/*`, `src/components/product3d/*`, `public/models/*`, `src/lib/productModels.ts` |
| `paint-outline.txt` | Exact source of `paintDesign()` and `outline()` in `src/lib/customDesign.ts` (they feed the 3D textures) |
| `2d-dom.json` | 2D preview state for all 24 customizable products at 1440×900: front/back image per product, default wash and art |

## Check

```bash
node scripts/check-3d-baseline.mjs
```

Exits 0 when every 3D file and both painter functions are byte-identical to the baseline; exits 1 and lists what changed otherwise. `src/lib/customDesign.ts` may gain new optional fields — only `paintDesign()` and `outline()` are locked.

Screenshots were not stored: the capture tool used during the rebuild returns images to the session but cannot write them to disk. `2d-dom.json` records the same state in a form that can be compared automatically.
