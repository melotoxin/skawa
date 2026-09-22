import sharp from 'sharp'
import path from 'path'

const file = process.argv[2] || 'public/images/products/ranked-rashguard-black-belt-1.png'
const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h, channels: c } = info

// Sample a horizontal midline outside the garment (left edge inward)
const y = Math.floor(h * 0.15)
let row = []
for (let x = 0; x < w; x += Math.floor(w / 30)) {
  const i = (y * w + x) * c
  row.push({ x, r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] })
}
console.log('file', file, w + 'x' + h)
console.log('row y=15%', row)

// Count semi-opaque mid-grey pixels (likely leftover plate/shadow)
let plate = 0
let soft = 0
for (let p = 0; p < w * h; p++) {
  const i = p * c
  const a = data[i + 3]
  const lum = (data[i] + data[i + 1] + data[i + 2]) / 3
  if (a > 20 && a < 200 && lum > 40 && lum < 200) soft++
  if (a > 200 && lum > 30 && lum < 90) plate++
}
console.log('soft fringe px', soft, 'opaque mid-dark plate-ish', plate)
