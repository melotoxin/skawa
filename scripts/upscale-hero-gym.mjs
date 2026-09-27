import sharp from 'sharp'

const src = 'public/images/ref/hero-gym-2k.png'
const out = 'public/images/ref/hero-gym.jpg'

await sharp(src)
  .resize({ width: 3840, kernel: 'lanczos3', withoutEnlargement: false })
  .sharpen({ sigma: 0.8 })
  .jpeg({ quality: 86, chromaSubsampling: '4:4:4' })
  .toFile(out)

const meta = await sharp(out).metadata()
const stat = (await import('fs')).statSync(out)
console.log(meta.width, meta.height, stat.size)
