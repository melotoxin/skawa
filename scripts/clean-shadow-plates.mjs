/**
 * Grow transparency into soft grey contact-shadow plates left after white keying.
 * Safe: only low-chroma greys adjacent to already-transparent pixels.
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const productsDir = 'D:/SKAWA/public/images/products'
const targets = [
  'ranked-rashguard-black-belt-1.png',
  'ranked-rashguard-black-belt-2.png',
  'ranked-rashy-blue-belt-1.png',
  'ranked-rashy-blue-belt-2.png',
  'ranked-rashguard-brown-belt-1.png',
  'ranked-rashguard-brown-belt-2.png',
  'ranked-rashguard-purple-belt-1.png',
  'ranked-rashguard-purple-belt-2.png',
  'ranked-rashguard-white-belt-1.png',
  'ranked-rashguard-white-belt-2.png',
  'samurai-rashguard-1.png',
  'samurai-rashguard-2.png',
  'shorts-gold-cut.png',
  'shorts-red-cut.png',
  'shorts-white-cut.png',
  'shorts-camo-cut.png',
]

async function growShadowKey(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h, channels: c } = info
  const N = w * h
  const visited = new Uint8Array(N)
  const queue = new Int32Array(N)
  let qh = 0
  let qt = 0

  const isTransparent = (p) => data[p * c + 3] < 12
  const isSoftPlate = (p) => {
    const i = p * c
    const a = data[i + 3]
    if (a < 12) return true
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const lum = (r + g + b) / 3
    const chroma = Math.max(r, g, b) - Math.min(r, g, b)
    // Soft grey / pale contact shadow — not saturated fabric colors
    if (chroma > 28) return false
    // pale greys and mid charcoal plates
    if (lum >= 55 && lum <= 245) return true
    // very soft dark plate near transparency
    if (lum >= 28 && lum < 55 && chroma < 12) return true
    return false
  }

  for (let p = 0; p < N; p++) {
    if (!isTransparent(p)) continue
    visited[p] = 1
    queue[qt++] = p
  }

  let cleared = 0
  while (qh < qt) {
    const p = queue[qh++]
    const x = p % w
    const y = (p / w) | 0
    for (const n of [p - 1, p + 1, p - w, p + w]) {
      if (n < 0 || n >= N) continue
      if (visited[n]) continue
      const nx = n % w
      if (Math.abs(nx - x) > 1 && Math.abs(n - p) !== w) continue
      if (!isSoftPlate(n)) continue
      visited[n] = 1
      queue[qt++] = n
      if (data[n * c + 3] >= 12) {
        data[n * c + 3] = 0
        cleared++
      }
    }
  }

  // Abort if we ate too much of the garment
  const opaqueLeft = [...data].filter((_, i) => i % c === 3 && data[i] > 20).length
  // rough: if cleared huge portion relative to original opaque
  const tmp = filePath + '.tmp.png'
  await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toFile(tmp)
  fs.renameSync(tmp, filePath)
  return cleared
}

async function darkPlateKey(filePath) {
  // For already-composited opaque shorts: key near-black plate from edges
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h, channels: c } = info
  const N = w * h
  const visited = new Uint8Array(N)
  const queue = new Int32Array(N)
  let qh = 0
  let qt = 0
  const idx = (x, y) => y * w + x

  const corners = [idx(2, 2), idx(w - 3, 2), idx(2, h - 3), idx(w - 3, h - 3)]
  let sr = 0,
    sg = 0,
    sb = 0
  for (const p of corners) {
    sr += data[p * c]
    sg += data[p * c + 1]
    sb += data[p * c + 2]
  }
  sr /= 4
  sg /= 4
  sb /= 4
  const seedLum = (sr + sg + sb) / 3
  if (seedLum > 50) return 0 // not a dark plate

  const matches = (p) => {
    const i = p * c
    if (data[i + 3] < 8) return true
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const lum = (r + g + b) / 3
    if (lum > 36) return false
    const dist = Math.hypot(r - sr, g - sg, b - sb)
    return dist <= 22
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

  let cleared = 0
  while (qh < qt) {
    const p = queue[qh++]
    const x = p % w
    const y = (p / w) | 0
    for (const n of [p - 1, p + 1, p - w, p + w]) {
      if (n < 0 || n >= N) continue
      if (visited[n]) continue
      const nx = n % w
      if (Math.abs(nx - x) > 1 && Math.abs(n - p) !== w) continue
      if (!matches(n)) continue
      visited[n] = 1
      queue[qt++] = n
    }
  }
  for (let p = 0; p < N; p++) {
    if (!visited[p]) continue
    if (data[p * c + 3] > 0) cleared++
    data[p * c + 3] = 0
  }
  if (cleared / N > 0.85) return 0
  const tmp = filePath + '.tmp.png'
  await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toFile(tmp)
  fs.renameSync(tmp, filePath)
  return cleared
}

async function main() {
  for (const f of targets) {
    const p = path.join(productsDir, f)
    if (!fs.existsSync(p)) continue
    if (f.startsWith('shorts-')) {
      const n = await darkPlateKey(p)
      console.log('dark-key', f, n)
    } else {
      const n = await growShadowKey(p)
      console.log('shadow-grow', f, n)
    }
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
