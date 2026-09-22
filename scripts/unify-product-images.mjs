import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const root = 'D:/SKAWA'
const productsDir = path.join(root, 'public/images/products')
const assetsDir = 'C:/Users/4star/.cursor/projects/d-SKAWA/assets'

/** Knock out near-white / light-gray studio boxes into true transparency. */
async function cutWhiteBackground(inputPath, outputPath, threshold = 235) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const px = info.channels
  for (let i = 0; i < data.length; i += px) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    // Near-white / pale gray box
    if (r >= threshold && g >= threshold && b >= threshold) {
      data[i + 3] = 0
      continue
    }
    // Soft edge: fade very light pixels
    const min = Math.min(r, g, b)
    if (min > 210) {
      const t = (min - 210) / (255 - 210)
      data[i + 3] = Math.round((1 - t) * data[i + 3])
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(outputPath)
}

async function compositeOnDark(inputPath, outputPath) {
  // Ensure transparent cutouts sit on matching #0d0d0d then re-export as PNG with alpha
  // Actually we want transparent for blend - just cut white
  await cutWhiteBackground(inputPath, outputPath)
}

const whiteBgSources = [
  'ranked-rashguard-black-belt-1.jpeg',
  'ranked-rashguard-black-belt-2.jpg',
  'ranked-rashy-blue-belt-1.jpeg',
  'ranked-rashy-blue-belt-2.jpg',
  'ranked-rashguard-brown-belt-1.jpeg',
  'ranked-rashguard-brown-belt-2.jpg',
  'ranked-rashguard-purple-belt-1.jpeg',
  'ranked-rashguard-purple-belt-2.jpg',
  'ranked-rashguard-white-belt-1.jpeg',
  'ranked-rashguard-white-belt-2.jpg',
  'samurai-rashguard-1.jpg',
  'samurai-rashguard-2.jpg',
]

const studioCopies = [
  ['bjj-gi-studio.png', 'bjj-gi-1.png'],
  ['fight-short-studio.png', 'fight-short-1.png'],
  ['full-sleeves-studio.png', 'full-sleeves-1.png'],
  ['short-sleeves-studio.png', 'short-sleeves-1.png'],
]

async function main() {
  for (const [from, to] of studioCopies) {
    const src = path.join(assetsDir, from)
    const dest = path.join(productsDir, to)
    if (!fs.existsSync(src)) {
      console.log('missing studio', from)
      continue
    }
    // Also knock any residual light edges from generated studio shots
    await cutWhiteBackground(src, dest, 248)
    console.log('studio →', to)
  }

  for (const file of whiteBgSources) {
    const src = path.join(productsDir, file)
    if (!fs.existsSync(src)) {
      console.log('missing', file)
      continue
    }
    const base = file.replace(/\.(jpe?g|png|webp)$/i, '')
    const dest = path.join(productsDir, `${base}.png`)
    await cutWhiteBackground(src, dest, 232)
    console.log('cutout →', path.basename(dest))
  }

  // Process shorts webp if they have light backgrounds
  const shorts = ['shorts-gold.webp', 'shorts-red.webp', 'shorts-white.webp', 'shorts-camo.webp']
  for (const file of shorts) {
    const src = path.join(root, 'public/images', file)
    if (!fs.existsSync(src)) continue
    const dest = path.join(productsDir, file.replace('.webp', '-cut.png'))
    await cutWhiteBackground(src, dest, 240)
    console.log('shorts cut →', path.basename(dest))
  }

  console.log('done')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
