import fs from 'fs'

const path = 'D:/SKAWA/src/data.ts'
let s = fs.readFileSync(path, 'utf8')

const replacements = [
  ['/images/products/ranked-rashguard-black-belt-1.jpeg', '/images/products/ranked-rashguard-black-belt-1.png'],
  ['/images/products/ranked-rashguard-black-belt-2.jpg', '/images/products/ranked-rashguard-black-belt-2.png'],
  ['/images/products/ranked-rashy-blue-belt-1.jpeg', '/images/products/ranked-rashy-blue-belt-1.png'],
  ['/images/products/ranked-rashy-blue-belt-2.jpg', '/images/products/ranked-rashy-blue-belt-2.png'],
  ['/images/products/ranked-rashguard-brown-belt-1.jpeg', '/images/products/ranked-rashguard-brown-belt-1.png'],
  ['/images/products/ranked-rashguard-brown-belt-2.jpg', '/images/products/ranked-rashguard-brown-belt-2.png'],
  ['/images/products/ranked-rashguard-purple-belt-1.jpeg', '/images/products/ranked-rashguard-purple-belt-1.png'],
  ['/images/products/ranked-rashguard-purple-belt-2.jpg', '/images/products/ranked-rashguard-purple-belt-2.png'],
  ['/images/products/ranked-rashguard-white-belt-1.jpeg', '/images/products/ranked-rashguard-white-belt-1.png'],
  ['/images/products/ranked-rashguard-white-belt-2.jpg', '/images/products/ranked-rashguard-white-belt-2.png'],
  ['/images/products/samurai-rashguard-1.jpg', '/images/products/samurai-rashguard-1.png'],
  ['/images/products/samurai-rashguard-2.jpg', '/images/products/samurai-rashguard-2.png'],
  ['/images/shorts-gold.webp', '/images/products/shorts-gold-cut.png'],
  ['/images/shorts-red.webp', '/images/products/shorts-red-cut.png'],
  ['/images/shorts-white.webp', '/images/products/shorts-white-cut.png'],
  ['/images/shorts-camo.webp', '/images/products/shorts-camo-cut.png'],
]

for (const [from, to] of replacements) {
  const count = s.split(from).length - 1
  if (!count) {
    console.log('skip', from)
    continue
  }
  s = s.split(from).join(to)
  console.log('replace', count, from, '→', to)
}

fs.writeFileSync(path, s)
console.log('data.ts updated')
