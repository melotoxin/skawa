import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const src =
  'C:/Users/4star/.cursor/projects/d-SKAWA/assets/c__Users_4star_AppData_Roaming_Cursor_User_workspaceStorage_3649a35abbfc622a5d4386f28aefd00f_images_image-12a46f2e-e725-41d4-af97-db73e75ec4b7.png'
const outDir = 'D:/SKAWA/public/images/brand'
fs.mkdirSync(outDir, { recursive: true })

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: w, height: h, channels: c } = info
const black = Buffer.alloc(w * h * 4)
const white = Buffer.alloc(w * h * 4)

for (let i = 0; i < w * h; i++) {
  const o = i * c
  const r = data[o]
  const g = data[o + 1]
  const b = data[o + 2]
  const lum = (r + g + b) / 3
  // White plate → transparent; dark ink → opaque logo
  const alpha = Math.max(0, Math.min(255, Math.round(((255 - lum) / 255) * 255)))
  // Soften near-white edges
  const a = lum > 245 ? 0 : alpha

  black[o] = 0
  black[o + 1] = 0
  black[o + 2] = 0
  black[o + 3] = a

  white[o] = 255
  white[o + 1] = 255
  white[o + 2] = 255
  white[o + 3] = a
}

const trim = async (buf, name) => {
  const trimmed = await sharp(buf, { raw: { width: w, height: h, channels: 4 } })
    .trim({ threshold: 8 })
    .png()
    .toBuffer()
  const dest = path.join(outDir, name)
  await sharp(trimmed).resize({ width: 640, withoutEnlargement: true }).png().toFile(dest)
  const meta = await sharp(dest).metadata()
  console.log(name, meta.width + 'x' + meta.height)
}

await trim(black, 'skawa-logo-dark.png') // black ink — for light backgrounds
await trim(white, 'skawa-logo-light.png') // white ink — for dark backgrounds
console.log('done')
