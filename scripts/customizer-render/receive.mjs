// Tiny local receiver for render.html: writes posted PNG layers to scripts/customizer-render/out/.
// Run: node scripts/customizer-render/receive.mjs   (listens on 127.0.0.1:5199, dev only)
import {createServer} from 'node:http'
import {mkdirSync, writeFileSync} from 'node:fs'
import {dirname, join} from 'node:path'

const OUT = 'scripts/customizer-render/out'
const NAME = /^[a-z0-9-]+\/((front|back)-(base|shading|highlight|id)|preview)\.png$/

createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'content-type')
  if (req.method === 'OPTIONS') return res.end()
  const name = new URL(req.url, 'http://local').searchParams.get('file') || ''
  if (req.method !== 'POST' || !NAME.test(name)) { res.statusCode = 400; return res.end('rejected') }
  const chunks = []
  req.on('data', chunk => chunks.push(chunk))
  req.on('end', () => {
    const file = join(OUT, name)
    mkdirSync(dirname(file), {recursive: true})
    writeFileSync(file, Buffer.concat(chunks))
    console.log('saved', file)
    res.end('ok')
  })
}).listen(5199, '127.0.0.1', () => console.log('receiver on http://127.0.0.1:5199'))
