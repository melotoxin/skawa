// Builds the optimized WebP derivatives used by the homepage into public/images/home/.
// Run: node scripts/build-home-assets.mjs
// Sources stay untouched; every output is regenerated from the originals in public/images.
import sharp from 'sharp'
import {mkdirSync} from 'node:fs'
import {join} from 'node:path'

const SRC = 'public/images'
const OUT = 'public/images/home'
mkdirSync(OUT, {recursive: true})

/** name, source, widths, optional crop (source px) and per-asset processing */
const jobs = [
  // Three audience paths
  {name: 'aud-athletes', src: 'ref/hero-fighter-front.jpg', widths: [820, 560]},
  {name: 'aud-academy', src: 'ref/client-team-skawa.jpg', widths: [1024, 640]},
  {name: 'aud-brands', src: 'path-brands.jpg', widths: [682, 480]},

  // Craftsmanship
  {name: 'craft-stitch', src: 'ref/manufacturing-sewing.jpg', widths: [1024, 640]},
  {name: 'craft-gi', src: 'ref/atmos-belt-tie.jpg', widths: [1024, 560]},
  {name: 'craft-embroidery', src: 'discipline-manufacture.png', crop: {left: 0, top: 0, width: 1024, height: 460}, widths: [1024, 560]},

  // Product showcase (studio shots on light backgrounds)
  ...['bjj-gi-white', 'rashguard', 'fight-shorts', 'boxing-gloves', 'trackjacket', 'gear-bag'].map(key => ({
    name: `cat-${key}`, src: `ref/cat-${key}.jpg`, widths: [1024, 640],
  })),

  // Customization preview: real colorways with transparency
  ...['red', 'gold', 'white', 'camo'].map(color => ({
    name: `shorts-${color}`, src: `products/shorts-${color}-cut.png`, widths: [720, 440], alpha: true,
  })),

  // Academy collection
  {name: 'academy-lineup', src: 'campaign/collection-lineup.jpg', widths: [1600, 900]},
  {name: 'academy-team', src: 'academy-team.webp', widths: [1400, 800]},

  // Private label
  {name: 'pl-collection', src: 'about-product-lineup.png', widths: [1024, 640]},
  {name: 'pl-label', src: 'private-label.webp', widths: [1400, 700]},
  {name: 'pl-design', src: 'discipline-design.png', crop: {left: 0, top: 0, width: 1024, height: 465}, widths: [1024, 560]},
  {name: 'pl-fulfill', src: 'discipline-fulfill.png', crop: {left: 0, top: 0, width: 1024, height: 465}, widths: [1024, 560]},

  // Proof section backdrop: desaturated team walk-in
  {name: 'proof-bg', src: 'academy-team.webp', widths: [1400, 900], grayscale: true},

  // Final CTA
  {name: 'final-athletes', src: 'path-athletes.jpg', widths: [682, 480]},
]

const log = (file, info) => console.log(`${file}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)}KB`)

for (const job of jobs) {
  for (const width of job.widths) {
    let img = sharp(join(SRC, job.src))
    if (job.crop) img = img.extract(job.crop)
    img = img.resize({width, withoutEnlargement: true})
    if (job.grayscale) img = img.grayscale().linear(0.9, 18)
    const file = join(OUT, `${job.name}-${width}.webp`)
    log(file, await img.webp(job.alpha ? {quality: 82, alphaQuality: 90, effort: 5} : {quality: 76, effort: 5}).toFile(file))
  }
}

// —— Hero ——
// Foreground: the campaign athlete cut out of his dark gym (see scripts/cut-hero-athlete.py).
const ATHLETE = join(SRC, 'campaign/hero-fighter-back-cut.webp')
for (const width of [1400, 960, 640]) {
  const file = join(OUT, `hero-athlete-${width}.webp`)
  log(file, await sharp(ATHLETE).resize({width}).webp({quality: 84, alphaQuality: 90, effort: 5}).toFile(file))
}

// Background: the SKAWA gym, desaturated and lifted into a bright, softly blurred training facility.
const GYM = join(SRC, 'ref/hero-gym.jpg')
const lightGym = (crop, width, blur) => sharp(GYM).extract(crop).resize({width}).grayscale().linear(0.5, 128).blur(blur)
const WIDE = {left: 0, top: 700, width: 3840, height: 2160}
const TALL = {left: 300, top: 600, width: 2700, height: 3600}
for (const [width, blur] of [[1920, 6], [1280, 4]]) {
  const file = join(OUT, `hero-bg-${width}.webp`)
  log(file, await lightGym(WIDE, width, blur).webp({quality: 70, effort: 5}).toFile(file))
}
{
  const file = join(OUT, 'hero-bg-mobile-900.webp')
  log(file, await lightGym(TALL, 900, 4).webp({quality: 70, effort: 5}).toFile(file))
}

// Social share card (1200x630): hero composite with a light wash behind the logo.
{
  const bg = await lightGym(WIDE, 1200, 4).extract({left: 0, top: 0, width: 1200, height: 630}).toBuffer()
  const tall = await sharp(ATHLETE).resize({height: 760}).toBuffer()
  const {width: aw = 608} = await sharp(tall).metadata()
  const athlete = await sharp(tall).extract({left: 0, top: 0, width: aw, height: 630}).toBuffer()
  const wash = Buffer.from(`<svg width="1200" height="630"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#f5f5f3" stop-opacity=".96"/><stop offset=".55" stop-color="#f5f5f3" stop-opacity=".55"/><stop offset=".8" stop-color="#f5f5f3" stop-opacity="0"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><rect x="72" y="300" width="56" height="6" fill="#e50920"/></svg>`)
  const logo = await sharp(join(SRC, 'brand/skawa-logo-dark.png')).resize({width: 360}).toBuffer()
  const file = join(OUT, 'og-home.jpg')
  log(file, await sharp(bg).composite([
    {input: athlete, left: 1200 - aw + 40, top: 0},
    {input: wash, left: 0, top: 0},
    {input: logo, left: 72, top: 200},
  ]).jpeg({quality: 82, mozjpeg: true}).toFile(file))
}
