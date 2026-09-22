# SKAWA FIGHT — 3D model pipeline

Catalog cards look for GLB files under this folder. If a file is missing, the shop
renders a procedural Three.js mesh (dark metallic fightwear) automatically.

## Expected files

| File | Used for |
|------|----------|
| `bjj-gi.glb` | Gis |
| `rash-guard.glb` | Rash guards |
| `fight-short.glb` | Fight shorts |
| `gloves.glb` | Boxing gloves |
| `mma-gloves.glb` | MMA gloves |
| `belt.glb` | Belts |
| `gear-bag.glb` | Bags |
| `shin-pads.glb` | Shin pads |
| `focus-mitts.glb` | Focus mitts |
| `hand-wraps.glb` | Hand wraps |
| `mouth-guard.glb` | Mouth guards |
| `spats.glb` | Spats |
| `boxing-trunks.glb` | Boxing trunks |
| `uniform.glb` | Karate / judo uniforms |

## Blender export (quick)

1. Model at ~1 unit tall, origin at ground center.
2. Apply transforms (`Ctrl+A` → All Transforms).
3. Export → glTF 2.0 (`.glb`), Y-up, +Z forward, apply modifiers.
4. Drop the file here using the name from the table above.
5. Hard-refresh `/shop` — `HEAD` probe will pick it up and replace the procedural mesh.

Optional Blender batch:

```python
import bpy
# Select object, then:
bpy.ops.export_scene.gltf(
    filepath="//rash-guard.glb",
    export_format="GLB",
    use_selection=True,
    export_yup=True,
)
```
