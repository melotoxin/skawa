import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'

const root = 'D:/SKAWA'
const products = JSON.parse(fs.readFileSync(path.join(root, 'scripts/products-clean.json'), 'utf8'))
const order = [
  'bjj-gi',
  'fight-short',
  'full-sleeves',
  'ranked-rashguard-black-belt',
  'ranked-rashy-blue-belt',
  'ranked-rashguard-brown-belt',
  'ranked-rashguard-purple-belt',
  'ranked-rashguard-white-belt',
  'samurai-rashguard',
  'short-sleeves',
]
const bySlug = Object.fromEntries(products.map((p) => [p.slug, p]))
const ordered = order.map((s) => bySlug[s]).filter(Boolean)
if (ordered.length !== 10) {
  console.error('Missing slugs', order.filter((s) => !bySlug[s]))
  process.exit(1)
}

const imgDir = path.join(root, 'public/images/products')
fs.mkdirSync(imgDir, { recursive: true })

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
          reject(new Error(`${url} -> ${res.statusCode}`))
          return
        }
        res.pipe(file)
        file.on('finish', () => file.close(() => resolve(dest)))
      })
      .on('error', reject)
  })
}

function ext(url) {
  const clean = url.split('?')[0]
  const e = path.extname(clean).toLowerCase()
  return e && e.length <= 5 ? e : '.jpg'
}

const palette = {
  'bjj-gi': { color: '#111111', accent: '#e2232a', colors: ['#111111', '#e2232a', '#f5f5f2'] },
  'fight-short': { color: '#111111', accent: '#c9a048', colors: ['#111111', '#c9a048', '#e2232a'] },
  'full-sleeves': { color: '#111111', accent: '#e2232a', colors: ['#111111', '#e2232a', '#f5f5f2'] },
  'short-sleeves': { color: '#111111', accent: '#e2232a', colors: ['#111111', '#e2232a', '#f5f5f2'] },
  'ranked-rashguard-black-belt': { color: '#0a0a0a', accent: '#111111', colors: ['#0a0a0a', '#222222', '#f5f5f2'] },
  'ranked-rashy-blue-belt': { color: '#1c4f9c', accent: '#0a2f6b', colors: ['#1c4f9c', '#0a2f6b', '#f5f5f2'] },
  'ranked-rashguard-brown-belt': { color: '#6b3b1f', accent: '#3d2110', colors: ['#6b3b1f', '#3d2110', '#f5f5f2'] },
  'ranked-rashguard-purple-belt': { color: '#5b2d8e', accent: '#2f114f', colors: ['#5b2d8e', '#2f114f', '#f5f5f2'] },
  'ranked-rashguard-white-belt': { color: '#f2f2f0', accent: '#111111', colors: ['#f2f2f0', '#111111', '#c9a048'] },
  'samurai-rashguard': { color: '#111111', accent: '#c9a048', colors: ['#111111', '#c9a048', '#e2232a'] },
}

function mapCategory(p) {
  const cats = (p.categories || []).map((c) => c.toLowerCase())
  if (cats.includes('shorts') || p.slug === 'fight-short') return 'Fight Shorts'
  if (cats.includes('gis') || p.slug === 'bjj-gi') return 'GIs'
  return 'Rash Guards'
}

function mapSports(category, custom) {
  if (category === 'Fight Shorts') return ['MMA', 'BJJ', 'No-Gi']
  if (category === 'GIs') return ['BJJ', 'Gi']
  if (custom) return ['BJJ', 'MMA', 'No-Gi']
  return ['BJJ', 'Gi', 'No-Gi', 'MMA']
}

function mapMaterial(category, custom) {
  if (category === 'Fight Shorts') return 'Performance fight short shell'
  if (category === 'GIs') return 'BJJ gi fabric'
  if (custom) return 'Performance rash guard knit'
  return 'Moisture-wicking performance knit'
}

function sizesOf(p) {
  const sizeAttr = (p.attributes || []).find((a) => /size/i.test(a.name))
  const options = sizeAttr?.options || []
  // de-dupe while preserving order
  return [...new Set(options)]
}

function blurb(p) {
  return (
    p.short_description ||
    p.description ||
    `${p.name} from Skawa Fight.`
  ).replace(/\s+/g, ' ').trim()
}

const mapped = []
for (const p of ordered) {
  const local = []
  const imgs = p.images || []
  for (let j = 0; j < Math.min(imgs.length, 2); j++) {
    const file = `${p.slug}-${j + 1}${ext(imgs[j].src)}`
    const dest = path.join(imgDir, file)
    process.stdout.write(`DL ${file}\n`)
    await download(imgs[j].src, dest)
    local.push(`/images/products/${file}`)
  }
  if (!local.length) local.push('/images/shorts-gold.webp', '/images/shorts-white.webp')
  mapped.push({ ...p, localImages: local })
}

fs.writeFileSync(path.join(root, 'scripts/products-mapped.json'), JSON.stringify(mapped, null, 2))

const catalog = mapped.map((p, index) => {
  const category = mapCategory(p)
  const custom = (p.categories || []).some((c) => /custom/i.test(c)) || ['bjj-gi', 'fight-short', 'full-sleeves', 'short-sleeves'].includes(p.slug)
  const look = palette[p.slug] || { color: '#111111', accent: '#e2232a', colors: ['#111111', '#e2232a', '#f5f5f2'] }
  const price = p.priceLabel || 'Quote only'
  return {
    id: index + 1,
    sourceId: p.id,
    slug: p.slug,
    name: p.name,
    category,
    price,
    color: look.color,
    accent: look.accent,
    custom,
    wholesale: custom,
    tag: custom ? 'CUSTOMIZE' : 'READY TO ORDER',
    image: p.localImages[0],
    secondaryImage: p.localImages[1] || p.localImages[0],
    sports: mapSports(category, custom),
    material: mapMaterial(category, custom),
    availability: custom ? 'Custom order' : 'In stock',
    colors: look.colors,
    sizes: sizesOf(p),
    description: blurb(p),
  }
})

const ts = `import type { Product } from './types'

/** Exact catalog mirrored from https://skawafight.com/shop/ (WooCommerce store API). */
export const products: Product[] = ${JSON.stringify(catalog, null, 2)}

export const steps = ['Concept', 'Customization', 'Sample', 'Quote', 'Design approval', 'Production', 'Quality control', 'Shipping', 'Reorder']
`

fs.writeFileSync(path.join(root, 'src/data.ts'), ts)
console.log('Wrote data.ts with', catalog.length, 'products')
console.log(catalog.map((p) => `${p.id}. ${p.name} — ${p.price}`).join('\n'))
