# Photography requests — catalog completeness and 2D customizer

Status: open · Owner: SKAWA (photography / catalog) · Prepared 2026-09-26

The shop and the Design Lab no longer show another product (or a team photo) as a product's back or alternate view. Where a true second view doesn't exist, the site now shows the front only (the Design Lab says "Back view not available yet"). The photos below close those gaps.

There are two kinds of request:

- **Catalog views**: photos of the product exactly as sold (same colourway and graphics), for the shop card hover, the product page gallery and the Design Lab's photo preview.
- **2D template plates**: the *undecorated* garment in white or light grey, which the Design Lab recolours per customer. Only needed where a product can't be rendered from an approved 3D model. Fight Short is already rendered this way from `public/models/fight-short.glb`.

## Framing spec (applies to every photo)

| Item | Spec |
|---|---|
| Aspect / size | 4:5 portrait, at least 3000 × 3750 px |
| Composition | Product centred, filling 80–85 % of the frame height, 7–10 % margin on every side |
| Angle | Straight-on (front, back, side at exactly 0° / 180° / 90°), camera at the product's vertical centre, 85–105 mm lens equivalent (no wide-angle distortion) |
| Front/back pairs | Tripod locked; rotate the product or ghost mannequin 180°, never move the camera. Both frames must line up pixel for pixel |
| Presentation | Apparel: ghost mannequin (invisible torso or legs), no model. Gear: product only, on a clear stand if needed |
| Background | Seamless light grey `#EEEEEB`, or pure white. Deliver a clean cutout PNG with alpha as well |
| Light | Large soft sources, 5000–5600 K, even and without hard shadows or coloured rim light; no vignette |
| Colour | Include a colour checker in the first frame of each set. sRGB, 16-bit TIFF masters plus PNG exports |
| Template plates only | Undecorated garment in white or light grey fabric, same cut and seams as production. No logos or prints. Same framing as the catalog views |

File naming: `<product-slug>-<view>.png` (views: `front`, `back`, `side`, `palm`, `detail`), for example `boxing-gloves-palm.png`.

## Requests by product

Priority: **P1** blocks an honest two-view preview for a customizable product. **P2** improves the catalog. **P3** is a nice-to-have.

| # | Product (slug) | Customizable | Current photos | Needed | Priority |
|---|---|---|---|---|---|
| 1 | BJJ GI (`bjj-gi`) | Yes | Front 3/4 only | Catalog **back**. Template plates: white gi jacket, front and back (unless rendered from `bjj-gi.glb`) | P1 |
| 2 | Fight Short (`fight-short`) | Yes | Front only | Catalog **back** (2D template already rendered from the 3D model) | P2 |
| 3 | Full Sleeves (`full-sleeves`) | Yes | Front only | Catalog **back** | P1 |
| 4–9 | Ranked rash guards, Samurai (`ranked-*`, `samurai-rashguard`) | No | Front 3/4 + second angle | Straight **back** view | P3 |
| 10 | Short Sleeves (`short-sleeves`) | Yes | Front only | Catalog **back**. Template plates: white short-sleeve rash guard, front and back (no 3D model exists) | P1 |
| 11 | Elite Fight Shorts (`elite-fight-shorts`) | Yes | Front only | Catalog **back** | P1 |
| 12 | Shadow Series (`shadow-series`) | Yes | Front only | Catalog **back** | P1 |
| 13 | Reign Fight Shorts (`reign-fight-shorts`) | Yes | Front only | Catalog **back** | P1 |
| 14 | Stealth Pro (`stealth-pro`) | Yes | Front only | Catalog **back** | P1 |
| 15 | Academy Gold Shorts (`academy-gold-shorts`) | Yes | Shares its photo with Elite Fight Shorts | Its **own front and back** (the previous "back" was a team photo) | P1 |
| 16 | Crimson Training Shorts (`crimson-training-shorts`) | Yes | Shares its photo with Shadow Series | Its **own front and back** | P1 |
| 17 | Kids BJJ Gi (`kids-bjj-gi`) | Yes | Front 3/4 only | Catalog **back** | P1 |
| 18 | Grappling Shorts (`grappling-shorts`) | Yes | Front 3/4 only | Catalog **back**. Template plates: white, front and back | P1 |
| 19 | Jiu Jitsu Belts (`jiu-jitsu-belts`) | Yes | Coiled belt | **Flat belt, full length**, plus a rank-bar **detail**. Template plate: white belt, flat | P1 |
| 20 | Mouth Guard (`mouth-guard`) | No | One angle | **Front** and **top** views | P3 |
| 21 | Spats / Compression Pants (`spats-compression-pants`) | Yes | Front 3/4 only | Catalog **back**. Template plates: white, front and back | P1 |
| 22 | Sports Bags (`sports-bags`) | Yes | One angle | **Front** and **side** views. Template plates: light grey bag, front and side | P1 |
| 23 | Boxing Gloves (`boxing-gloves`) | Yes | One angle | **Back-of-hand** and **palm** views. Template plates: white glove, both views | P1 |
| 24 | MMA Gloves (`mma-gloves`) | Yes | One angle | **Back-of-hand** and **palm** views. Template plates: white glove, both views | P1 |
| 25 | Shin Pads (`shin-pads`) | Yes | One angle | Straight **front** and the **strap side**. Template plate: white pad, front | P1 |
| 26 | Focus Mitts (`focus-mitts`) | Yes | One angle | **Pad face** and **hand side**. Template plates: white mitt, both views | P1 |
| 27 | Hand Wraps (`hand-wraps`) | Yes | Rolled wraps | **Flat wrap** with the thumb-loop **label detail**. Template plate: white wrap, flat | P1 |
| 28 | Boxing Trunks (`boxing-trunks`) | Yes | Front 3/4 only | Catalog **back**. Template plates: white, front and back | P1 |
| 29 | Karate Uniform (`karate-uniform`) | Yes | **Folded** garment | A true **front** view (jacket on a ghost mannequin, pants shown), plus the **back**. Template plates: white uniform, front and back (the BJJ gi model isn't reused: different cut, and its belt has a BJJ rank bar) | P1 |
| 30 | Judo Uniform (`judo-uniform`) | Yes | Front 3/4 only | Catalog **back**. Template plates: white judogi, front and back | P1 |
| 31 | Gear Bags (`gear-bags`) | Yes | One angle | **Front** and **side** views. Template plates: light grey bag, both views | P1 |

## Tracksuits

The catalog has no tracksuit product. We haven't invented one. To add tracksuits, SKAWA needs to supply:

- catalog data: name, category, price or price range, sizes, colourways, fabric, decoration methods and minimum order;
- catalog views: jacket front and back, and pants front and back, to the framing spec above;
- template plates (if tracksuits should be customizable in 2D): the undecorated jacket and pants in white or light grey, front and back.
