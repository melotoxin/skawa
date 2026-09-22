import sharp from 'sharp'

const file = 'public/images/products/_raw/ranked-rashguard-white-belt-1.jpeg'
const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h, channels: c } = info

function at(x, y) {
  const i = (y * w + x) * c
  return [data[i], data[i + 1], data[i + 2]]
}

console.log('corners', at(2, 2), at(w - 3, 2), at(2, h - 3), at(w - 3, h - 3))
// sample likely sleeve region (upper left of garment) and torso center
console.log('center', at((w / 2) | 0, (h / 2) | 0))
console.log('left mid', at((w * 0.28) | 0, (h * 0.4) | 0))
console.log('right mid', at((w * 0.72) | 0, (h * 0.4) | 0))
console.log('top center', at((w / 2) | 0, (h * 0.18) | 0))

// histogram of near-white
let pure = 0,
  soft = 0,
  mid = 0
for (let p = 0; p < w * h; p++) {
  const i = p * c
  const lum = (data[i] + data[i + 1] + data[i + 2]) / 3
  if (lum >= 250) pure++
  else if (lum >= 230) soft++
  else if (lum >= 200) mid++
}
console.log({ pure, soft, mid, total: w * h })
