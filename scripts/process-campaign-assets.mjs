/**
 * Process SKAWA campaign assets:
 * - light studio products → edge-key transparent cutouts
 * - fighters / complex scenes → rembg (Python) when available, else keep full frame
 */
import {spawnSync} from 'child_process'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const root = 'D:/SKAWA/public/images'
const incoming = path.join(root, '_incoming')
const products = path.join(root, 'products')
const outDir = path.join(root, 'campaign')

fs.mkdirSync(products, {recursive: true})
fs.mkdirSync(outDir, {recursive: true})

async function edgeKeyLight(inputPath, opts = {}) {
  const hardLum = opts.hardLum ?? 245
  const softLum = opts.softLum ?? 232
  const maxDist = opts.maxDist ?? 36

  const {data, info} = await sharp(inputPath).ensureAlpha().raw().toBuffer({resolveWithObject: true})
  const {width: w, height: h, channels: c} = info
  const N = w * h
  const visited = new Uint8Array(N)
  const queue = new Int32Array(N)
  let qh = 0
  let qt = 0
  const idx = (x, y) => y * w + x

  const corners = [idx(1, 1), idx(w - 2, 1), idx(1, h - 2), idx(w - 2, h - 2)]
  let sr = 0, sg = 0, sb = 0
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
    const r = data[i], g = data[i + 1], b = data[i + 2]
    if (data[i + 3] < 8) return true
    const lum = (r + g + b) / 3
    if (lum < hardLum) return false
    const dr = r - sr, dg = g - sg, db = b - sb
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

  return sharp(data, {raw: {width: w, height: h, channels: 4}})
    .trim({threshold: 8})
    .png()
    .toBuffer()
}

function rembgCutout(inputPath, outputPath) {
  const py = 'C:/Users/4star/AppData/Local/Programs/Python/Python312/python.exe'
  const script = `
from rembg import remove
from PIL import Image
im = Image.open(r'''${inputPath.replace(/\\/g, '/')}''').convert('RGBA')
out = remove(im)
out.save(r'''${outputPath.replace(/\\/g, '/')}''')
print('rembg ok')
`
  const result = spawnSync(py, ['-c', script], {encoding: 'utf8', maxBuffer: 50 * 1024 * 1024})
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout)
    throw new Error('rembg failed for ' + inputPath)
  }
  console.log((result.stdout || '').trim())
}

async function writeProduct(name, buf) {
  const dest = path.join(products, `${name}.png`)
  await sharp(buf)
    .resize(1200, 1200, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}})
    .png()
    .toFile(dest)
  console.log('product', name)
}

async function main() {
  // Light studio products → cutouts
  const light = [
    ['gloves-raw.jpg', 'boxing-gloves', {hardLum: 242, softLum: 228}],
    ['gi-white-raw.jpg', 'bjj-gi-white', {hardLum: 248, softLum: 236, maxDist: 28}],
    ['rashguard-raw.jpg', 'rashguard-shard', {hardLum: 245, softLum: 230}],
    ['trackjacket-raw.jpg', 'trackjacket', {hardLum: 245, softLum: 230}],
    ['duffel-raw.jpg', 'gear-bag-campaign', {hardLum: 248, softLum: 235}],
  ]

  for (const [file, name, opts] of light) {
    const src = path.join(incoming, file)
    if (!fs.existsSync(src)) {
      console.log('missing', file)
      continue
    }
    const cut = await edgeKeyLight(src, opts)
    await writeProduct(name, cut)
    await sharp(cut).png().toFile(path.join(outDir, `${name}.png`))
  }

  // Fighters → rembg cutouts + keep cinematic full frames for hero
  const fighters = [
    ['fighter-front-raw.jpg', 'hero-fighter-front'],
    ['fighter-back-raw.jpg', 'hero-fighter-back'],
  ]
  for (const [file, name] of fighters) {
    const src = path.join(incoming, file)
    if (!fs.existsSync(src)) continue
    // Full cinematic (resized webp/jpg for hero)
    await sharp(src)
      .resize(1920, 2400, {fit: 'cover'})
      .jpeg({quality: 88})
      .toFile(path.join(outDir, `${name}.jpg`))
    const cutPath = path.join(outDir, `${name}-cut.png`)
    try {
      rembgCutout(src, cutPath)
      await sharp(cutPath)
        .trim({threshold: 6})
        .resize(1400, 1800, {fit: 'contain', background: {r: 0, g: 0, b: 0, alpha: 0}})
        .png()
        .toFile(path.join(outDir, `${name}-cutout.png`))
      console.log('fighter cutout', name)
    } catch (e) {
      console.warn('fighter rembg skipped', name, e.message)
    }
  }

  // Collection lineup — keep editorial scene for client/academy
  const lineup = path.join(incoming, 'collection-lineup-raw.jpg')
  if (fs.existsSync(lineup)) {
    await sharp(lineup)
      .resize(1800, 1200, {fit: 'cover'})
      .jpeg({quality: 88})
      .toFile(path.join(outDir, 'collection-lineup.jpg'))
    console.log('collection lineup')
  }

  console.log('done')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
