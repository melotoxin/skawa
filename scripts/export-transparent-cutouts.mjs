/**
 * Export transparent cutouts (no opaque plate) so CSS drop-shadow
 * follows the garment silhouette. Card stage + orb supply the studio theme.
 */
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const productsDir = 'D:/SKAWA/public/images/products'
const rawDir = path.join(productsDir, '_raw')

async function edgeKeyLight(inputPath, opts = {}) {
  const hardLum = opts.hardLum ?? 248
  const softLum = opts.softLum ?? 238
  const maxDist = opts.maxDist ?? 30

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
    if (data[i + 3] < 8) return true
    const lum = (r + g + b) / 3
    if (lum < hardLum) return false
    const dr = r - sr
    const dg = g - sg
    const db = b - sb
    return Math.sqrt(dr * dr + dg * dg + db * db) <= maxDist
  }

  for (let x = 0; x < w; x++) {
    for (const p of [idx(x, 0), idx(x, h - 1)]) {
      if (!visited[p] && matchesHard(p)) {
        visited[p] = 1
        queue[qt++] = p
      }
    }
  }
  for (let y = 0; y < h; y++) {
    for (const p of [idx(0, y), idx(w - 1, y)]) {
      if (!visited[p] && matchesHard(p)) {
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
      const nx = n % w
      if (Math.abs(nx - x) > 1 && Math.abs(n - p) !== w) continue
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

  // Fit to studio canvas size with transparent padding
  const cut = await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .resize(864, 1152, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()
  return cut
}

const names = [
  'ranked-rashguard-black-belt-1',
  'ranked-rashguard-black-belt-2',
  'ranked-rashy-blue-belt-1',
  'ranked-rashy-blue-belt-2',
  'ranked-rashguard-brown-belt-1',
  'ranked-rashguard-brown-belt-2',
  'ranked-rashguard-purple-belt-1',
  'ranked-rashguard-purple-belt-2',
  'ranked-rashguard-white-belt-1',
  'ranked-rashguard-white-belt-2',
  'samurai-rashguard-1',
  'samurai-rashguard-2',
]

async function main() {
  for (const name of names) {
    const raws = fs.readdirSync(rawDir).filter((f) => f.startsWith(name + '.'))
    if (!raws.length) {
      console.log('missing', name)
      continue
    }
    const raw = path.join(rawDir, raws[0])
    const cut = await edgeKeyLight(raw)
    const out = path.join(productsDir, `${name}.png`)
    const tmp = out + '.tmp.png'
    await sharp(cut).toFile(tmp)
    fs.renameSync(tmp, out)
    console.log('cutout', name)
  }
  console.log('done')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
