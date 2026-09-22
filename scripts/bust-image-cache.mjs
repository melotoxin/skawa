import fs from 'fs'

const path = 'src/data.ts'
let s = fs.readFileSync(path, 'utf8')
s = s.replace(/\?v=cut\d+/g, '')
s = s.replace(/(\/images\/products\/[^"'?]+\.(?:png|jpe?g|webp))/g, '$1?v=cut3')
fs.writeFileSync(path, s)
console.log('busts', (s.match(/\?v=cut3/g) || []).length)
