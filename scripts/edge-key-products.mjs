import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import https from 'https'
import http from 'http'

const productsDir = 'D:/SKAWA/public/images/products'

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http
    const file = fs.createWriteStream(dest)
    mod
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close()
          fs.unlinkSync(dest)
          return download(res.headers.location, dest).then(resolve, reject)
        }
        if (res.statusCode !== 200) {
          reject(new Error(`${url} ${res.statusCode}`))
          return
        }
        res.pipe(file)
        file.on('finish', () => file.close(() => resolve(dest)))
      })
      .on('error', reject)
  })
}

/**
 * Remove only background connected to image edges (flood fill).
 * Safe for garments with white/grey panels.
 */
async function edgeKey(inputPath, outputPath, opts = {}) {
  const {
    maxDist = 48, // color distance from seed
    maxLum = 250, // only treat seed-like pixels below/above depending mode
    mode = 'light', // 'light' for white plates, 'dark' for charcoal plates
  } = opts

  const image = sharp(inputPath)
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h, channels: c } = info
  const N = w * h
  const visited = new Uint8Array(N)
  const queue = new Int32Array(N)
  let qh = 0
  let qt = 0

  const idx = (x, y) => y * w + x
  const colorAt = (p) => {
    const i = p * c
    return [data[i], data[i + 1], data[i + 2], data[i + 3]]
  }

  const seeds = []
  for (let x = 0; x < w; x++) {
    seeds.push(idx(x, 0), idx(x, h - 1))
  }
  for (let y = 0; y < h; y++) {
    seeds.push(idx(0, y), idx(w - 1, y))
  }

  // average seed color from corners
  const corners = [idx(1, 1), idx(w - 2, 1), idx(1, h - 2), idx(w - 2, h - 2)]
  let sr = 0
  let sg = 0
  let sb = 0
  for (const p of corners) {
    const [r, g, b] = colorAt(p)
    sr += r
    sg += g
    sb += b
  }
  sr /= 4
  sg /= 4
  sb /= 4
  const seedLum = (sr + sg + sb) / 3

  const matchesBg = (p) => {
    const [r, g, b, a] = colorAt(p)
    if (a < 8) return true
    const lum = (r + g + b) / 3
    const dr = r - sr
    const dg = g - sg
    const db = b - sb
    const dist = Math.sqrt(dr * dr + dg * dg + db * db)
    if (mode === 'light') {
      // white / pale gray plate
      return lum >= 200 && dist <= maxDist + (lum - 200) * 0.35
    }
    // dark charcoal plate — only very dark + close to seed
    return lum <= 55 && dist <= maxDist && Math.abs(lum - seedLum) < 35
  }

  for (const p of seeds) {
    if (!visited[p] && matchesBg(p)) {
      visited[p] = 1
      queue[qt++] = p
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
      if (!matchesBg(n)) continue
      visited[n] = 1
      queue[qt++] = n
    }
  }

  // feather: clear visited + soft-edge neighbors
  for (let p = 0; p < N; p++) {
    if (!visited[p]) continue
    const i = p * c
    data[i + 3] = 0
  }
  // light feather on border of mask
  for (let p = 0; p < N; p++) {
    if (visited[p]) continue
    const x = p % w
    const y = (p / w) | 0
    let touch = false
    if (x > 0 && visited[p - 1]) touch = true
    if (x + 1 < w && visited[p + 1]) touch = true
    if (y > 0 && visited[p - w]) touch = true
    if (y + 1 < h && visited[p + w]) touch = true
    if (!touch) continue
    const i = p * c
    data[i + 3] = Math.min(data[i + 3], 90)
  }

  const tmp = outputPath + '.tmp.png'
  await sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toFile(tmp)
  fs.renameSync(tmp, outputPath)
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

async function main() {
  const rawDir = path.join(productsDir, '_raw')
  fs.mkdirSync(rawDir, { recursive: true })

  for (const [name, url] of Object.entries(remotes)) {
    const ext = path.extname(url.split('?')[0]) || '.jpg'
    const raw = path.join(rawDir, name + ext)
    if (!fs.existsSync(raw)) {
      process.stdout.write(`DL ${name}\n`)
      await download(url, raw)
    }
    const out = path.join(productsDir, `${name}.png`)
    await edgeKey(raw, out, { mode: 'light', maxDist: 55 })
    console.log('edge-key', name)
  }

  // Restore studio products from generated assets (dark theme, no aggressive white punch)
  const assetsDir = 'C:/Users/4star/.cursor/projects/d-SKAWA/assets'
  const studio = [
    ['bjj-gi-studio.png', 'bjj-gi-1.png'],
    ['fight-short-studio.png', 'fight-short-1.png'],
    ['full-sleeves-studio.png', 'full-sleeves-1.png'],
    ['short-sleeves-studio.png', 'short-sleeves-1.png'],
  ]
  for (const [from, to] of studio) {
    const src = path.join(assetsDir, from)
    const dest = path.join(productsDir, to)
    if (!fs.existsSync(src)) continue
    // Soft light-edge only (near-white fringe), keep dark plate
    await edgeKey(src, dest, { mode: 'light', maxDist: 30 })
    console.log('studio restore', to)
  }

  console.log('done')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
