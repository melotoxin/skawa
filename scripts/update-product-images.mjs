import fs from 'fs'

const path = 'D:/SKAWA/src/data.ts'
let s = fs.readFileSync(path, 'utf8')
const map = {
  'kids-bjj-gi': '/images/products/kids-bjj-gi.png',
  'grappling-shorts': '/images/products/grappling-shorts.png',
  'jiu-jitsu-belts': '/images/products/jiu-jitsu-belts.png',
  'mouth-guard': '/images/products/mouth-guard.png',
  'spats-compression-pants': '/images/products/spats-compression-pants.png',
  'sports-bags': '/images/products/sports-bags.png',
  'boxing-gloves': '/images/products/boxing-gloves.png',
  'mma-gloves': '/images/products/mma-gloves.png',
  'shin-pads': '/images/products/shin-pads.png',
  'focus-mitts': '/images/products/focus-mitts.png',
  'hand-wraps': '/images/products/hand-wraps.png',
  'boxing-trunks': '/images/products/boxing-trunks.png',
  'karate-uniform': '/images/products/karate-uniform.png',
  'judo-uniform': '/images/products/judo-uniform.png',
  'gear-bags': '/images/products/gear-bags.png',
}

for (const [slug, img] of Object.entries(map)) {
  const re = new RegExp(
    `("slug": "${slug}"[\\s\\S]*?"image": ")[^"]+("[\\s\\S]*?"secondaryImage": ")[^"]+"`,
  )
  if (!re.test(s)) {
    console.log('no match', slug)
    continue
  }
  s = s.replace(re, `$1${img}$2${img}"`)
  console.log('updated', slug)
}

fs.writeFileSync(path, s)
