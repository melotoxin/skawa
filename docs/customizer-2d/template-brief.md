# 2D template brief — products still on photo preview

Status: open · Owner: SKAWA (photography) → development · Prepared 2026-09-26

The Design Lab's full-colour 2D proof covers 11 of the 24 customizable products. The other 13 show an honest **photo preview**: the clean catalog photo, a "Photo preview" badge and the customer's colours as chips. A product moves to full colour when it has a **template**: registered image layers plus print zones (spec: `src/lib/customizer2d/README.md`).

## Why these 13 are not templated yet

- No approved 3D model exists for them (the pilot templates are rendered from `public/models/*.glb`).
- Their catalog photos are three-quarter studio shots on dark backgrounds with the design printed on. They can't be recoloured without inventing the garment, and a proof must not show something we can't produce.
- Karate and judo uniforms were not derived from the BJJ gi model: the cut differs, and that model's belt carries a BJJ rank bar.

## What to shoot (per product)

Shoot **template plates** to the framing spec in [photo-requests.md](photo-requests.md): the undecorated product in white or light grey, on a locked tripod, with front and back (or the named second face) registered pixel for pixel. For each product, also shoot **one frame per recolourable region** with that region masked in green gaffer tape, or supply the pattern pieces. Development cuts clean masks from these.

| Product | Views | Recolourable regions (masks) | Print zones (planned) | 2D controls |
|---|---|---|---|---|
| Grappling Shorts | front, back | body, waistband + hem (trim), side panels (pattern) | front waistband; left/right leg; back waistband (default text) | all |
| Boxing Trunks | front, back | body, wide waistband (trim), side stripes (pattern) | front waistband (text, logo); left leg (logo); right leg (text); back waistband (default text) | all |
| Spats / Compression Pants | front, back | body, waistband + ankle cuffs (trim), side panels (pattern) | left thigh (default logo); right thigh (text); back waistband (default text) | all |
| Karate Uniform | front, back (jacket; pants if shot) | jacket + pants (body), lapel/collar (trim) | left chest (default logo); right chest (text); upper back (default text) | base, trim, logo, text. Palette: white, black |
| Judo Uniform | front, back | jacket + pants (body), lapel/collar (trim) | left chest (default logo); upper back (default text, the back-number area) | base, trim, logo, text. Palette: white, blue (competition) |
| Jiu Jitsu Belts | flat, full length | belt (body), rank bar (trim: black or red) | rank bar (embroidered name) | base limited to rank colours (white, blue, purple, brown, black; kids grey, yellow, orange, green), trim, text. No logo |
| Boxing Gloves | back of hand, palm | shell (body), cuff (trim) | back of hand (default logo); cuff (default text) | base, trim, logo, text. No pattern/accent |
| MMA Gloves | back of hand, palm | shell (body), cuff/strap (trim), knuckle panel (pattern) | back of hand (default logo); knuckle panel; cuff (default text) | base, trim, logo, text |
| Focus Mitts | pad face, hand side | pad (body), rim (trim) | pad centre (default logo); rim (text) | base, trim, logo, text. No pattern |
| Shin Pads | front | shell (body), binding (trim), front panel (pattern, sublimated models only) | shin (default logo); lower panel (text) | all (pattern only if the material is sublimated) |
| Hand Wraps | flat, thumb loop visible | wrap (body) | thumb-loop label (logo or text) | base, logo, text on the label only |
| Sports Bags | front, side | bag (body), straps + zips (trim) | front panel (default logo; text); side panel (text) | base, trim, logo, text |
| Gear Bags | front, side | bag (body), straps + zips (trim) | front panel (default logo; text); side panel (text) | base, trim, logo, text |

## How development adds a product once plates arrive

1. Build the layers with `scripts/build-customizer-assets.mjs`: base, shading and highlight from the plate, one mask per region, and a silhouette.
2. Register the template in `src/lib/customizer2d/templates.ts`, with zones measured on the base and `supports` set honestly.
3. Run the region check: `await (await import('/qa/customizer-2d/verify-template.js')).verifyTemplate('<slug>')` in the dev server console. Every control must change pixels, and only inside its region.
4. Run `npx tsc -b`, `npm run build` and `node scripts/check-3d-baseline.mjs`.
