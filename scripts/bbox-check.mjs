import sharp from 'sharp'

const file = process.argv[2]
const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h, channels: c } = info

// Find bounding box of non-black content
let minX = w,
  minY = h,
  maxX = 0,
  maxY = 0
let nonBlack = 0
let greyish = 0
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = (y * w + x) * c
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const lum = (r + g + b) / 3
    if (lum > 8) {
      nonBlack++
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
    }
    // charcoal plate band: mid dark grey, low chroma
    if (lum > 18 && lum < 55 && Math.abs(r - g) < 8 && Math.abs(g - b) < 8) greyish++
  }
}
console.log({
  file,
  size: `${w}x${h}`,
  nonBlack,
  greyish,
  bbox: [minX, minY, maxX, maxY],
  bboxRatio: (((maxX - minX) * (maxY - minY)) / (w * h)).toFixed(3),
})

// sample just outside bbox
const ox = Math.max(0, minX - 5)
const oy = Math.max(0, minY - 5)
const i = (oy * w + ox) * c
console.log('just outside bbox', [data[i], data[i + 1], data[i + 2]])
