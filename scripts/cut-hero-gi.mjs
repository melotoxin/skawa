import sharp from 'sharp'
import fs from 'fs'

const src = 'public/images/ref/cat-bjj-gi-white.jpg'
const out = 'public/images/ref/hero-gi.png'
const {data, info} = await sharp(src).ensureAlpha().raw().toBuffer({resolveWithObject: true})
const {width: w, height: h} = info
const px = w * h
const lum = new Uint8Array(px)
for (let i = 0; i < px; i++) lum[i] = data[i * 4]

const fg = new Uint8Array(px)
for (let i = 0; i < px; i++) {
  const o = i * 4
  const r = data[o]
  const g = data[o + 1]
  const b = data[o + 2]
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  fg[i] = lum[i] < 234 || (max - min) > 14 ? 1 : 0
}

const dilate = 4
const grown = new Uint8Array(px)
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    let on = 0
    for (let dy = -dilate; dy <= dilate && !on; dy++) {
      const yy = y + dy
      if (yy < 0 || yy >= h) continue
      for (let dx = -dilate; dx <= dilate; dx++) {
        const xx = x + dx
        if (xx < 0 || xx >= w) continue
        if (fg[yy * w + xx]) { on = 1; break }
      }
    }
    grown[y * w + x] = on
  }
}

const visited = new Uint8Array(px)
const queue = new Int32Array(px)
let qh = 0
let qt = 0
function push(i) {
  if (i < 0 || i >= px || visited[i] || grown[i]) return
  visited[i] = 1
  queue[qt++] = i
}
for (let x = 0; x < w; x++) {
  push(x)
  push((h - 1) * w + x)
}
for (let y = 0; y < h; y++) {
  push(y * w)
  push(y * w + w - 1)
}
while (qh < qt) {
  const i = queue[qh++]
  data[i * 4 + 3] = 0
  const x = i % w
  const y = (i / w) | 0
  if (x > 0) push(i - 1)
  if (x < w - 1) push(i + 1)
  if (y > 0) push(i - w)
  if (y < h - 1) push(i + w)
}

const opaque = new Uint8Array(px)
for (let i = 0; i < px; i++) opaque[i] = data[i * 4 + 3] ? 1 : 0
const erode = 5
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = y * w + x
    if (!opaque[i]) continue
    let keep = 1
    for (let dy = -erode; dy <= erode && keep; dy++) {
      const yy = y + dy
      if (yy < 0 || yy >= h) { keep = 0; break }
      for (let dx = -erode; dx <= erode; dx++) {
        const xx = x + dx
        if (xx < 0 || xx >= w || !opaque[yy * w + xx]) { keep = 0; break }
      }
    }
    if (!keep) data[i * 4 + 3] = 0
  }
}

visited.fill(0)
qh = 0
qt = 0
function pushSoft(i) {
  if (i < 0 || i >= px || visited[i] || !data[i * 4 + 3] || lum[i] < 222) return
  visited[i] = 1
  queue[qt++] = i
}
for (let x = 0; x < w; x++) {
  pushSoft(x)
  pushSoft((h - 1) * w + x)
}
for (let y = 0; y < h; y++) {
  pushSoft(y * w)
  pushSoft(y * w + w - 1)
}
while (qh < qt) {
  const i = queue[qh++]
  data[i * 4 + 3] = 0
  const x = i % w
  const y = (i / w) | 0
  if (x > 0) pushSoft(i - 1)
  if (x < w - 1) pushSoft(i + 1)
  if (y > 0) pushSoft(i - w)
  if (y < h - 1) pushSoft(i + w)
}

const columnDark = new Int16Array(w).fill(-1)
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = y * w + x
    if (data[i * 4 + 3] && lum[i] < 175 && y > columnDark[x]) columnDark[x] = y
  }
}
const lowestDark = new Int16Array(w).fill(-1)
const reach = 16
for (let x = 0; x < w; x++) {
  let bottom = -1
  for (let xx = Math.max(0, x - reach); xx <= Math.min(w - 1, x + reach); xx++) {
    if (columnDark[xx] > bottom) bottom = columnDark[xx]
  }
  lowestDark[x] = bottom
}
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = y * w + x
    if (!data[i * 4 + 3]) continue
    if (lowestDark[x] < 0 || y > lowestDark[x] + 4) data[i * 4 + 3] = 0
  }
}

const alpha = new Uint8Array(px)
for (let i = 0; i < px; i++) alpha[i] = data[i * 4 + 3] ? 1 : 0
const closed = new Uint8Array(px)
const closeR = 7
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    let on = 0
    for (let dy = -closeR; dy <= closeR && !on; dy++) {
      const yy = y + dy
      if (yy < 0 || yy >= h) continue
      for (let dx = -closeR; dx <= closeR; dx++) {
        const xx = x + dx
        if (xx < 0 || xx >= w) continue
        if (alpha[yy * w + xx]) { on = 1; break }
      }
    }
    closed[y * w + x] = on
  }
}
for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const i = y * w + x
    if (!closed[i]) { data[i * 4 + 3] = 0; continue }
    let keep = 1
    for (let dy = -closeR; dy <= closeR && keep; dy++) {
      const yy = y + dy
      if (yy < 0 || yy >= h) { keep = 0; break }
      for (let dx = -closeR; dx <= closeR; dx++) {
        const xx = x + dx
        if (xx < 0 || xx >= w || !closed[yy * w + xx]) { keep = 0; break }
      }
    }
    data[i * 4 + 3] = keep ? 255 : 0
  }
}

await sharp(data, {raw: {width: w, height: h, channels: 4}})
  .trim({threshold: 1})
  .png()
  .toFile(out)

const meta = await sharp(out).metadata()
console.log('wrote', out, meta.width, meta.height, fs.statSync(out).size)
