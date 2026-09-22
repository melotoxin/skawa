import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const dir = 'D:/SKAWA/public/images/products'
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.png') && !f.startsWith('_'))

for (const f of files.sort()) {
  const p = path.join(dir, f)
  const { data, info } = await sharp(p).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h, channels: c } = info
  const total = w * h
  let transparent = 0
  const sample = []
  for (let x = 0; x < w; x += Math.max(1, Math.floor(w / 40))) {
    sample.push([x, 0], [x, h - 1])
  }
  for (let y = 0; y < h; y += Math.max(1, Math.floor(h / 40))) {
    sample.push([0, y], [w - 1, y])
  }
  let edgeTrans = 0
  let edgeWhite = 0
  let edgeDark = 0
  let edgeMid = 0
  let midR = 0
  let midG = 0
  let midB = 0
  let midN = 0
  for (const [x, y] of sample) {
    const i = (y * w + x) * c
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const a = data[i + 3]
    if (a < 20) {
      edgeTrans++
      continue
    }
    const lum = (r + g + b) / 3
    if (lum > 220) edgeWhite++
    else if (lum < 40) edgeDark++
    else {
      edgeMid++
      midR += r
      midG += g
      midB += b
      midN++
    }
  }
  for (let p2 = 0; p2 < total; p2++) {
    if (data[p2 * c + 3] < 20) transparent++
  }
  const pct = ((transparent / total) * 100).toFixed(1)
  const midAvg = midN
    ? `midRGB=${Math.round(midR / midN)},${Math.round(midG / midN)},${Math.round(midB / midN)}`
    : 'midRGB=-'
  console.log(
    f.padEnd(42),
    'alpha%',
    pct.padStart(5),
    'eT',
    String(edgeTrans).padStart(3),
    'eW',
    String(edgeWhite).padStart(3),
    'eD',
    String(edgeDark).padStart(3),
    'eM',
    String(edgeMid).padStart(3),
    midAvg,
  )
}
