import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

/**
 * Dark-studio edge key: flood-fill near-black edge pixels to transparent
 * so fight-short-1 matches the light-cut shorts on dark stages.
 */
const input = 'D:/SKAWA/public/images/products/fight-short-1.png'
const output = 'D:/SKAWA/public/images/products/fight-short-1.png'

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h, channels: c } = info
const out = Buffer.from(data)
const visited = new Uint8Array(w * h)
const stack = []

const idx = (x, y) => y * w + x
const isBg = (i) => {
  const o = i * c
  const r = out[o]
  const g = out[o + 1]
  const b = out[o + 2]
  const a = out[o + 3]
  if (a < 8) return true
  // near-black / deep charcoal studio plate
  return r < 28 && g < 28 && b < 28
}

const push = (x, y) => {
  if (x < 0 || y < 0 || x >= w || y >= h) return
  const i = idx(x, y)
  if (visited[i]) return
  if (!isBg(i)) return
  visited[i] = 1
  stack.push(i)
}

// seed from edges
for (let x = 0; x < w; x++) {
  push(x, 0)
  push(x, h - 1)
}
for (let y = 0; y < h; y++) {
  push(0, y)
  push(w - 1, y)
}

while (stack.length) {
  const i = stack.pop()
  const o = i * c
  out[o + 3] = 0
  const x = i % w
  const y = (i / w) | 0
  push(x + 1, y)
  push(x - 1, y)
  push(x, y + 1)
  push(x, y - 1)
}

await sharp(out, { raw: { width: w, height: h, channels: 4 } })
  .png()
  .toFile(output)

const check = await sharp(output).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
let trans = 0
for (let i = 3; i < check.data.length; i += 4) if (check.data[i] < 8) trans++
console.log('fight-short-1 cutout ready, trans%', ((100 * trans) / (w * h)).toFixed(1))
