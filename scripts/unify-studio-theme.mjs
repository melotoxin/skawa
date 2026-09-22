/**
 * Unify all shop product images to the Short Sleeves dark-studio theme:
 * pure black plate + soft red radial glow + product cutout with drop depth.
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const productsDir = 'D:/SKAWA/public/images/products'
const rawDir = path.join(productsDir, '_raw')
const W = 864
const H = 1152

/** Short-Sleeves style plate: #000 + crimson radial glow behind product. */
async function makeStudioPlate(width = W, height = H) {
  const channels = 3
  const buf = Buffer.alloc(width * height * channels, 0)
  const cx = width * 0.5
  const cy = height * 0.42
  const rx = width * 0.38
  const ry = height * 0.32
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const nx = (x - cx) / rx
      const ny = (y - cy) / ry
      const d = Math.sqrt(nx * nx + ny * ny)
      const t = Math.max(0, 1 - d)
      // Match Short Sleeves intensity (center crimson ~80R)
      const glow = Math.pow(t, 1.6) * 0.85
      const i = (y * width + x) * channels
      buf[i] = Math.min(255, Math.round(226 * glow * 0.42))
      buf[i + 1] = Math.min(255, Math.round(20 * glow * 0.2))
      buf[i + 2] = Math.min(255, Math.round(28 * glow * 0.22))
    }
  }
  return sharp(buf, { raw: { width, height, channels } }).png().toBuffer()
}

/**
 * Edge flood-fill key for white/near-white studio plates.
 * Strict luminance so light fabric panels (white sleeves ~210–230) survive.
 */
async function edgeKeyLight(inputPath, opts = {}) {
  const hardLum = opts.hardLum ?? 248
  const softLum = opts.softLum ?? 236
  const maxDist = opts.maxDist ?? 28

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width: w, height: h, channels: c } = info
  const N = w * h
  const visited = new Uint8Array(N)
  const queue = new Int32Array(N)
  let qh = 0
  let qt = 0
  const idx = (x, y) => y * w + x

  const corners = [idx(1, 1), idx(w - 2, 1), idx(1, h - 2), idx(w - 2, h - 2)]
  let sr = 0
  let sg = 0
  let sb = 0
  for (const p of corners) {
    const i = p * c
    sr += data[i]
    sg += data[i + 1]
    sb += data[i + 2]
  }
  sr /= 4
  sg /= 4
  sb /= 4

  const matchesHard = (p) => {
    const i = p * c
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    if (a < 8) return true
    const lum = (r + g + b) / 3
    if (lum < hardLum) return false
    const dr = r - sr
    const dg = g - sg
    const db = b - sb
    return Math.sqrt(dr * dr + dg * dg + db * db) <= maxDist
  }

  // seed from full border
  for (let x = 0; x < w; x++) {
    const top = idx(x, 0)
    const bot = idx(x, h - 1)
    if (!visited[top] && matchesHard(top)) {
      visited[top] = 1
      queue[qt++] = top
    }
    if (!visited[bot] && matchesHard(bot)) {
      visited[bot] = 1
      queue[qt++] = bot
    }
  }
  for (let y = 0; y < h; y++) {
    const left = idx(0, y)
    const right = idx(w - 1, y)
    if (!visited[left] && matchesHard(left)) {
      visited[left] = 1
      queue[qt++] = left
    }
    if (!visited[right] && matchesHard(right)) {
      visited[right] = 1
      queue[qt++] = right
    }
  }

  while (qh < qt) {
    const p = queue[qh++]
    const x = p % w
    const y = (p / w) | 0
    const neighbors = []
    if (x > 0) neighbors.push(p - 1)
    if (x + 1 < w) neighbors.push(p + 1)
    if (y > 0) neighbors.push(p - w)
    if (y + 1 < h) neighbors.push(p + w)
    for (const n of neighbors) {
      if (visited[n]) continue
      if (!matchesHard(n)) continue
      visited[n] = 1
      queue[qt++] = n
    }
  }

  for (let p = 0; p < N; p++) {
    if (visited[p]) {
      data[p * c + 3] = 0
      continue
    }
    // soft fringe: near-white adjacent to keyed bg
    const i = p * c
    const lum = (data[i] + data[i + 1] + data[i + 2]) / 3
    if (lum < softLum) continue
    const x = p % w
    const y = (p / w) | 0
    let touch = false
    if (x > 0 && visited[p - 1]) touch = true
    if (x + 1 < w && visited[p + 1]) touch = true
    if (y > 0 && visited[p - w]) touch = true
    if (y + 1 < h && visited[p + w]) touch = true
    if (!touch) continue
    const t = (lum - softLum) / (255 - softLum)
    data[i + 3] = Math.round(data[i + 3] * (1 - t * 0.85))
  }

  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer()
}

/** Dark-plate remapper: replace edge-connected charcoal with transparency (safe thresholds). */
async function edgeKeyDark(inputPath, opts = {}) {
  const maxLum = opts.maxLum ?? 42
  const maxDist = opts.maxDist ?? 22

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width: w, height: h, channels: c } = info
  const N = w * h
  const visited = new Uint8Array(N)
  const queue = new Int32Array(N)
  let qh = 0
  let qt = 0
  const idx = (x, y) => y * w + x

  const corners = [idx(2, 2), idx(w - 3, 2), idx(2, h - 3), idx(w - 3, h - 3)]
  let sr = 0
  let sg = 0
  let sb = 0
  for (const p of corners) {
    const i = p * c
    sr += data[i]
    sg += data[i + 1]
    sb += data[i + 2]
  }
  sr /= 4
  sg /= 4
  sb /= 4
  const seedLum = (sr + sg + sb) / 3
  // Skip if corners aren't a dark plate (already cut out / bright)
  if (seedLum > 60) {
    return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer()
  }

  const matches = (p) => {
    const i = p * c
    if (data[i + 3] < 8) return true
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const lum = (r + g + b) / 3
    if (lum > maxLum) return false
    const dr = r - sr
    const dg = g - sg
    const db = b - sb
    return Math.sqrt(dr * dr + dg * dg + db * db) <= maxDist
  }

  for (let x = 0; x < w; x++) {
    for (const p of [idx(x, 0), idx(x, h - 1)]) {
      if (!visited[p] && matches(p)) {
        visited[p] = 1
        queue[qt++] = p
      }
    }
  }
  for (let y = 0; y < h; y++) {
    for (const p of [idx(0, y), idx(w - 1, y)]) {
      if (!visited[p] && matches(p)) {
        visited[p] = 1
        queue[qt++] = p
      }
    }
  }

  while (qh < qt) {
    const p = queue[qh++]
    const x = p % w
    const y = (p / w) | 0
    for (const n of [p - 1, p + 1, p - w, p + w]) {
      if (n < 0 || n >= N) continue
      if (visited[n]) continue
      // stay in bounds for left/right
      const nx = n % w
      if (Math.abs(nx - x) > 1 && Math.abs(n - p) !== w) continue
      if (!matches(n)) continue
      visited[n] = 1
      queue[qt++] = n
    }
  }

  let cleared = 0
  for (let p = 0; p < N; p++) {
    if (!visited[p]) continue
    data[p * c + 3] = 0
    cleared++
  }
  // If we cleared almost everything, abort (ate the product)
  if (cleared / N > 0.82) {
    const fresh = await sharp(inputPath).ensureAlpha().png().toBuffer()
    return fresh
  }

  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer()
}

async function compositeOnStudio(cutoutPngBuffer, outPath) {
  const plate = await makeStudioPlate(W, H)
  const cutResized = await sharp(cutoutPngBuffer)
    .resize(W, H, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  const tmp = outPath + '.tmp.png'
  await sharp(plate)
    .composite([{ input: cutResized, gravity: 'centre' }])
    .png()
    .toFile(tmp)
  fs.renameSync(tmp, outPath)
}

const remotes = {
  'ranked-rashguard-black-belt-1': 'https://skawafight.com/wp-content/uploads/2020/03/black-front.jpeg',
  'ranked-rashguard-black-belt-2': 'https://skawafight.com/wp-content/uploads/2020/03/Black-3_4-left-copy-scaled.jpg',
  'ranked-rashy-blue-belt-1': 'https://skawafight.com/wp-content/uploads/2020/03/blue-front.jpeg',
  'ranked-rashy-blue-belt-2': 'https://skawafight.com/wp-content/uploads/2020/03/Blue-3_4-left-copy-1-scaled.jpg',
  'ranked-rashguard-brown-belt-1': 'https://skawafight.com/wp-content/uploads/2020/03/brown-front.jpeg',
  'ranked-rashguard-brown-belt-2': 'https://skawafight.com/wp-content/uploads/2020/03/Brown-3_4-left-copy-scaled.jpg',
  'ranked-rashguard-purple-belt-1': 'https://skawafight.com/wp-content/uploads/2020/03/purple-front.jpeg',
  'ranked-rashguard-purple-belt-2': 'https://skawafight.com/wp-content/uploads/2020/03/Purple-3_4-left-copy-scaled.jpg',
  'ranked-rashguard-white-belt-1': 'https://skawafight.com/wp-content/uploads/2020/03/white-front.jpeg',
  'ranked-rashguard-white-belt-2': 'https://skawafight.com/wp-content/uploads/2020/03/White-3_4-left-copy-scaled.jpg',
  'samurai-rashguard-1': 'https://skawafight.com/wp-content/uploads/2020/01/Samurai-left-shadow-3_4-1-scaled.jpg',
  'samurai-rashguard-2': 'https://skawafight.com/wp-content/uploads/2020/01/Samurai-rt-3_4-1-shadow.jpg',
}

const opaqueDark = [
  'boxing-gloves.png',
  'boxing-trunks.png',
  'focus-mitts.png',
  'gear-bags.png',
  'grappling-shorts.png',
  'hand-wraps.png',
  'jiu-jitsu-belts.png',
  'judo-uniform.png',
  'karate-uniform.png',
  'kids-bjj-gi.png',
  'mma-gloves.png',
  'mouth-guard.png',
  'shin-pads.png',
  'spats-compression-pants.png',
  'sports-bags.png',
  // leave bjj-gi / fight-short / full-sleeves / short-sleeves — already on-theme studio
]

const alreadyCut = [
  'shorts-gold-cut.png',
  'shorts-red-cut.png',
  'shorts-white-cut.png',
  'shorts-camo-cut.png',
]

async function main() {
  fs.mkdirSync(rawDir, { recursive: true })
  const platePreview = path.join(productsDir, '_studio-plate-preview.png')
  await sharp(await makeStudioPlate()).toFile(platePreview)

  // 1) Ranked / samurai from raw white plates
  for (const [name, url] of Object.entries(remotes)) {
    const ext = path.extname(url.split('?')[0]) || '.jpg'
    const raw = path.join(rawDir, name + ext)
    if (!fs.existsSync(raw)) {
      console.log('missing raw', name, '— skip (run edge-key first to download)')
      continue
    }
    const cut = await edgeKeyLight(raw, { hardLum: 248, softLum: 238, maxDist: 30 })
    const out = path.join(productsDir, `${name}.png`)
    await compositeOnStudio(cut, out)
    console.log('studio', name)
  }

  // 2) Existing alpha cut shorts → studio
  for (const file of alreadyCut) {
    const src = path.join(productsDir, file)
    if (!fs.existsSync(src)) continue
    // Re-key from current if already composited: use raw-like by dark-keying black plate first
    const cut = await edgeKeyDark(src, { maxLum: 18, maxDist: 14 })
    await compositeOnStudio(cut, src)
    console.log('studio', file)
  }

  // Skip opaque AI remap on re-runs (already plated); only touch when --all passed
  if (process.argv.includes('--all')) {
    for (const file of opaqueDark) {
      const src = path.join(productsDir, file)
      if (!fs.existsSync(src)) continue
      try {
        const cut = await edgeKeyDark(src, { maxLum: 38, maxDist: 20 })
        await compositeOnStudio(cut, src)
        console.log('studio-dark', file)
      } catch (e) {
        console.warn('skip', file, e.message)
      }
    }
  }

  console.log('done')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
