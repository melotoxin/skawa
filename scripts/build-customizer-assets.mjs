// Builds the optimized 2D template layers from the raw renders in scripts/customizer-render/out/.
// 1. npm run dev  +  node scripts/customizer-render/receive.mjs
// 2. open /scripts/customizer-render/render.html?template=<id>&save=1
// 3. node scripts/build-customizer-assets.mjs [template-id ...]
//
// Colour layers (base, shading, highlight) are written opaque, with their colours bled past the
// garment edge; masks hold straight (un-premultiplied) coverage. The renderer composites everything
// at full strength and cuts the silhouette once at the end, so edges never pick up a halo.
import sharp from 'sharp'
import {existsSync, mkdirSync, readdirSync} from 'node:fs'
import {join} from 'node:path'

const RAW = 'scripts/customizer-render/out'
const OUT = 'public/images/customizer'
const SIZE = [1200, 1500]
/** Highlight levels: keep only real sheen above the ambient reflection floor. */
const SHEEN = {floor: 58, top: 150}
/** How far (px) colours are extended past the silhouette. */
const BLEED = 8

/** Which ID channel feeds which mask. The pattern area defaults to the body. */
const MASKS = {
  'fight-short': {body: 0, trim: 1, pattern: 0},
  'rashguard-long': {body: 0, trim: 1, pattern: 0},
  'rashguard-short': {body: 0, trim: 1, pattern: 0},
}

/**
 * Single-mesh models rendered with their own materials (render.html?original=1): the layers are derived from
 * that one image. Fabric = light, low-saturation pixels; small dark marks fully enclosed by fabric (baked-in
 * logos and labels) are removed so a customer's proof never shows another brand.
 */
const DERIVED = {
  // Marks fully inside fabric go anywhere; marks touching the outline only on the upper body (shoulder logos),
  // never at belt height where the jacket's side vents look alike.
  // `clean`: authored boxes (x0, y0, x1, y1 of the view) where every mark except the belt is erased: shoulder
  // logos that wrap past the sleeve outline, the collar label, and the mark on the belt's end label.
  gi: {dark: 110, fabric: [70, 135], maxLogo: 9000, enclosed: 0.97, edgeMarksAbove: 0.3, grow: {below: 222, steps: 8},
    clean: {front: [[0.25, 0.12, 0.33, 0.23], [0.67, 0.12, 0.75, 0.23]], back: [[0.25, 0.12, 0.33, 0.23], [0.65, 0.12, 0.73, 0.23], [0.46, 0.05, 0.54, 0.12]]},
    // Light patches of at least this area enclosed by the belt (its branded end label) are repainted as plain belt.
    beltLabel: 200},
}

const ids = process.argv.slice(2).length ? process.argv.slice(2) : readdirSync(RAW).filter(id => MASKS[id] || DERIVED[id])
const log = (file, info) => console.log(`${file}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)}KB`)
const [W, H] = SIZE

/** Straight-alpha RGBA at the template size (sharp premultiplies around the resize). */
async function raw(file) {
  const {data} = await sharp(file).ensureAlpha().resize(W, H).raw().toBuffer({resolveWithObject: true})
  return data
}

/** Extends colours into transparent pixels so lossy compression and scaling never pull in black. */
function bleed(data) {
  const filled = new Uint8Array(W * H)
  for (let p = 0; p < W * H; p++) filled[p] = data[p * 4 + 3] > 0 ? 1 : 0
  for (let pass = 0; pass < BLEED; pass++) {
    const next = []
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const p = y * W + x
      if (filled[p]) continue
      let r = 0, g = 0, b = 0, n = 0
      for (const q of [x > 0 && p - 1, x < W - 1 && p + 1, y > 0 && p - W, y < H - 1 && p + W]) {
        if (q === false || !filled[q]) continue
        r += data[q * 4]; g += data[q * 4 + 1]; b += data[q * 4 + 2]; n++
      }
      if (n) next.push([p, r / n, g / n, b / n])
    }
    for (const [p, r, g, b] of next) { data[p * 4] = r; data[p * 4 + 1] = g; data[p * 4 + 2] = b; filled[p] = 1 }
  }
  return data
}

async function opaque(data, dest, quality) {
  const info = await sharp(bleed(data), {raw: {width: W, height: H, channels: 4}}).removeAlpha().webp({quality, effort: 5}).toFile(dest)
  log(dest, info)
}

/** Opaque grayscale layer from a luminance mapping. */
async function grayLayer(src, map, dest, quality) {
  const data = await raw(src)
  for (let i = 0; i < data.length; i += 4) {
    const v = map(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2])
    data[i] = data[i + 1] = data[i + 2] = v
  }
  await opaque(data, dest, quality)
}

/** White image whose alpha is the mask (lossless, anti-aliased edges kept). */
async function writeMask(alphaOf, dest) {
  const out = Buffer.alloc(W * H * 4)
  for (let p = 0; p < W * H; p++) { out[p * 4] = out[p * 4 + 1] = out[p * 4 + 2] = 255; out[p * 4 + 3] = alphaOf(p) }
  const info = await sharp(out, {raw: {width: W, height: H, channels: 4}}).webp({lossless: true, effort: 6}).toFile(dest)
  log(dest, info)
}

const smooth = (lo, hi, v) => { const t = Math.min(1, Math.max(0, (v - lo) / (hi - lo))); return t * t * (3 - 2 * t) }

/** Connected components (4-neighbour) of a boolean mask. */
function components(mask) {
  const label = new Int32Array(W * H).fill(-1), list = []
  for (let p = 0; p < W * H; p++) {
    if (!mask[p] || label[p] >= 0) continue
    const pixels = [p]; label[p] = list.length
    for (let k = 0; k < pixels.length; k++) {
      const q = pixels[k], x = q % W
      for (const n of [x > 0 && q - 1, x < W - 1 && q + 1, q >= W && q - W, q < W * (H - 1) && q + W]) if (n !== false && mask[n] && label[n] < 0) { label[n] = list.length; pixels.push(n) }
    }
    list.push(pixels)
  }
  return list
}

/** Fills the marked pixels from the surrounding garment (iterative diffusion inward; transparent pixels never count). */
function inpaint(data, hole) {
  const known = new Uint8Array(W * H)
  for (let p = 0; p < W * H; p++) known[p] = hole[p] || data[p * 4 + 3] < 128 ? 0 : 1
  let left = hole.reduce((n, v) => n + v, 0)
  while (left > 0) {
    const next = []
    for (let p = 0; p < W * H; p++) {
      if (known[p] || !hole[p]) continue
      const x = p % W
      let r = 0, g = 0, b = 0, n = 0
      for (const q of [x > 0 && p - 1, x < W - 1 && p + 1, p >= W && p - W, p < W * (H - 1) && p + W]) if (q !== false && known[q]) { r += data[q * 4]; g += data[q * 4 + 1]; b += data[q * 4 + 2]; n++ }
      if (n) next.push([p, r / n, g / n, b / n])
    }
    if (!next.length) break
    for (const [p, r, g, b] of next) { data[p * 4] = r; data[p * 4 + 1] = g; data[p * 4 + 2] = b; known[p] = 1; left-- }
  }
}

async function buildDerived(id, spec, dir) {
  for (const view of ['front', 'back']) {
    const src = join(RAW, id, `${view}-base.png`)
    if (!existsSync(src)) continue
    const data = await raw(src)
    const lum = new Float32Array(W * H), sat = new Float32Array(W * H), inside = new Uint8Array(W * H)
    for (let p = 0; p < W * H; p++) {
      const r = data[p * 4], g = data[p * 4 + 1], b = data[p * 4 + 2]
      lum[p] = 0.2126 * r + 0.7152 * g + 0.0722 * b
      const max = Math.max(r, g, b), min = Math.min(r, g, b)
      sat[p] = max ? (max - min) / max : 0
      inside[p] = data[p * 4 + 3] > 127 ? 1 : 0
    }
    // Baked-in marks: dark blobs bordered (almost) entirely by fabric. Belt, linings and cuffs are large or touch the outline.
    const dark = new Uint8Array(W * H)
    for (let p = 0; p < W * H; p++) dark[p] = inside[p] && (lum[p] < spec.dark || sat[p] > 0.45) ? 1 : 0
    const hole = new Uint8Array(W * H)
    let logos = 0
    const blobs = components(dark)
    // Pixels of other small dark blobs count as part of the same mark (logos break into nearby fragments).
    const small = new Uint8Array(W * H)
    for (const pixels of blobs) if (pixels.length <= spec.maxLogo) for (const q of pixels) small[q] = 1
    for (const pixels of blobs) {
      if (pixels.length > spec.maxLogo || pixels.length < 4) continue
      const own = new Set(pixels)
      let ring = 0, fabric = 0, outside = 0, top = H
      for (const q of pixels) {
        const x = q % W
        top = Math.min(top, (q - x) / W)
        for (const n of [x > 1 && q - 2, x < W - 2 && q + 2, q >= 2 * W && q - 2 * W, q < W * (H - 2) && q + 2 * W]) {
          if (n === false || own.has(n)) continue
          ring++
          if (!inside[n]) outside++
          else if (!dark[n] || small[n]) fabric++
        }
      }
      const enclosed = fabric / Math.max(1, ring) >= spec.enclosed
      const edgeMark = top / H < spec.edgeMarksAbove && pixels.length < 3000 && (fabric + outside) / Math.max(1, ring) >= spec.enclosed
      if (!enclosed && !edgeMark) continue
      logos++
      // Grow the mark by 2 px so its anti-aliased rim goes too.
      for (const q of pixels) { const x = q % W, y = (q - x) / W; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && xx < W && yy >= 0 && yy < H && inside[yy * W + xx]) hole[yy * W + xx] = 1 } }
    }
    for (const [x0, y0, x1, y1] of spec.clean?.[view] ?? []) {
      const big = new Uint8Array(W * H)
      for (const pixels of blobs) if (pixels.length > spec.maxLogo) for (const q of pixels) big[q] = 1
      for (let y = Math.floor(y0 * H); y < Math.ceil(y1 * H); y++) for (let x = Math.floor(x0 * W); x < Math.ceil(x1 * W); x++) {
        const p = y * W + x
        if (inside[p] && !big[p] && lum[p] < spec.grow.below) hole[p] = 1
      }
    }
    // A mark's anti-aliased and mid-tone strokes go with it: grow into connected mid-tones (never into dark parts).
    let frontier = []
    for (let p = 0; p < W * H; p++) if (hole[p]) frontier.push(p)
    for (let step = 0; step < spec.grow.steps && frontier.length; step++) {
      const next = []
      for (const q of frontier) {
        const x = q % W
        for (const n of [x > 0 && q - 1, x < W - 1 && q + 1, q >= W && q - W, q < W * (H - 1) && q + W]) {
          if (n === false || hole[n] || !inside[n] || lum[n] < spec.dark || lum[n] >= spec.grow.below) continue
          hole[n] = 1; next.push(n)
        }
      }
      frontier = next
    }
    inpaint(data, hole)
    // Small light patches enclosed by dark (a label on the belt) are not garment fabric.
    const label = new Uint8Array(W * H)
    const darkAfter = new Uint8Array(W * H)
    for (let p = 0; p < W * H; p++) { const l = 0.2126 * data[p * 4] + 0.7152 * data[p * 4 + 1] + 0.0722 * data[p * 4 + 2]; darkAfter[p] = inside[p] && l < spec.dark ? 1 : 0 }
    const light = new Uint8Array(W * H)
    for (let p = 0; p < W * H; p++) light[p] = inside[p] && !darkAfter[p] ? 1 : 0
    let labels = 0
    for (const pixels of components(light)) {
      if (pixels.length > spec.maxLogo) continue
      const own = new Set(pixels)
      let ring = 0, darkRing = 0
      for (const q of pixels) { const x = q % W; for (const n of [x > 1 && q - 2, x < W - 2 && q + 2, q >= 2 * W && q - 2 * W, q < W * (H - 2) && q + 2 * W]) { if (n === false || own.has(n)) continue; ring++; if (darkAfter[n]) darkRing++ } }
      if (darkRing / Math.max(1, ring) < 0.9) continue
      labels++
      for (const q of pixels) label[q] = 1
      if (pixels.length < spec.beltLabel) continue
      // Repaint in the belt's own colour (mean of the dark border), including a 1 px anti-aliased rim.
      let r = 0, g = 0, b = 0, n = 0
      for (const q of pixels) { const x = q % W; for (const m of [x > 1 && q - 2, x < W - 2 && q + 2, q >= 2 * W && q - 2 * W, q < W * (H - 2) && q + 2 * W]) if (m !== false && darkAfter[m]) { r += data[m * 4]; g += data[m * 4 + 1]; b += data[m * 4 + 2]; n++ } }
      const paint = q => { data[q * 4] = r / n; data[q * 4 + 1] = g / n; data[q * 4 + 2] = b / n; label[q] = 1 }
      for (const q of pixels) { paint(q); const x = q % W; for (const m of [x > 0 && q - 1, x < W - 1 && q + 1, q >= W && q - W, q < W * (H - 1) && q + W]) if (m !== false && inside[m] && !own.has(m) && !darkAfter[m]) paint(m) }
    }
    console.log(`${id}/${view}: removed ${logos} baked-in marks, kept ${labels} belt labels out of the fabric`)
    // Fabric coverage (soft at anti-aliased edges), shading = the textured render's own luminance.
    const shade = Buffer.from(data), fabricCoverage = new Uint8Array(W * H)
    const values = []
    for (let p = 0; p < W * H; p++) {
      const l = 0.2126 * data[p * 4] + 0.7152 * data[p * 4 + 1] + 0.0722 * data[p * 4 + 2]
      const r = data[p * 4], g = data[p * 4 + 1], b = data[p * 4 + 2], max = Math.max(r, g, b)
      const s2 = max ? (max - Math.min(r, g, b)) / max : 0
      fabricCoverage[p] = label[p] ? 0 : Math.round(255 * (hole[p] ? 1 : smooth(spec.fabric[0], spec.fabric[1], l) * (1 - smooth(0.25, 0.4, s2))))
      lum[p] = l
      if (inside[p] && fabricCoverage[p] > 250) values.push(l)
    }
    values.sort((a, b) => a - b)
    const white = values[Math.floor(values.length * 0.97)] || 255
    for (let p = 0; p < W * H; p++) { const v = Math.round(Math.min(255, lum[p] / white * 255)); shade[p * 4] = shade[p * 4 + 1] = shade[p * 4 + 2] = v }
    await writeMask(p => data[p * 4 + 3], join(dir, `${view}-mask-silhouette.webp`))
    await opaque(data, join(dir, `${view}-base.webp`), 88)
    await opaque(shade, join(dir, `${view}-shading.webp`), 90)
    await writeMask(p => data[p * 4 + 3] ? fabricCoverage[p] : 0, join(dir, `${view}-mask-body.webp`))
  }
}

for (const id of ids) {
  if (DERIVED[id]) { const dir = join(OUT, id); mkdirSync(dir, {recursive: true}); await buildDerived(id, DERIVED[id], dir); continue }
  const channels = MASKS[id]
  if (!channels) { console.warn(`skip ${id}: no mask channels configured`); continue }
  const dir = join(OUT, id)
  mkdirSync(dir, {recursive: true})
  for (const view of ['front', 'back']) {
    const src = name => join(RAW, id, `${view}-${name}.png`)
    if (!existsSync(src('base'))) continue
    const base = await raw(src('base'))
    await writeMask(p => base[p * 4 + 3], join(dir, `${view}-mask-silhouette.webp`))
    await opaque(base, join(dir, `${view}-base.webp`), 88)
    await grayLayer(src('shading'), v => Math.round(v), join(dir, `${view}-shading.webp`), 90)
    await grayLayer(src('highlight'), v => Math.round(Math.min(1, Math.max(0, (v - SHEEN.floor) / (SHEEN.top - SHEEN.floor))) * 255), join(dir, `${view}-highlight.webp`), 82)
    // Masks use the ID colour itself (straight coverage within the silhouette), not colour × alpha.
    const idPass = await raw(src('id'))
    for (const [name, channel] of Object.entries(channels)) await writeMask(p => idPass[p * 4 + 3] ? idPass[p * 4 + channel] : 0, join(dir, `${view}-mask-${name}.webp`))
  }
}
