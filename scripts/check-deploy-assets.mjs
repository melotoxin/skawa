// Pre-deploy check: every /images or /models path the site references exists and is not excluded by .vercelignore.
// Run: node scripts/check-deploy-assets.mjs   (exit 1 on a problem)
import {existsSync, readFileSync, readdirSync, statSync} from 'node:fs'
import {join, sep} from 'node:path'

const walk = dir => readdirSync(dir, {withFileTypes: true}).flatMap(e => e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)])
// Code and markup only; comment lines are skipped (they mention dev-only sources).
const text = [...walk('src').filter(f => /\.(tsx?|css)$/.test(f)), 'index.html'].map(f => readFileSync(f, 'utf8')).join('\n')
  .split('\n').filter(line => !/^\s*(\/\/|\*|\/\*)/.test(line)).join('\n')
const refs = new Set((text.match(/\/(images|models)\/[A-Za-z0-9_\-./${}]+/g) || []).map(r => r.replace(/[?#].*$/, '').replace(/[.,]$/, '')))
const escape = s => s.replace(/[.+^$()|[\]\\]/g, '\\$&')
const ignored = readFileSync('.vercelignore', 'utf8').split('\n').map(l => l.trim()).filter(l => l.startsWith('public/'))
  .map(p => new RegExp(`^${escape(p.replace(/^public/, '')).replace(/\*/g, '[^/]*')}(/.*)?$`))

const excluded = [...refs].filter(r => ignored.some(re => re.test(r)))
// Paths built from template strings (containing ${...}) can't be checked literally.
const missing = [...refs].filter(r => !r.includes('${') && !existsSync(join('public', r)))
console.log(`referenced asset paths: ${refs.size}`)
if (excluded.length) console.log('referenced but excluded from deploy:\n  ' + excluded.join('\n  '))
if (missing.length) console.log('referenced but missing:\n  ' + missing.join('\n  '))
// Size of what ships from public/ (after .vercelignore).
const files = walk('public').map(f => f.replaceAll(sep, '/'))
let shipped = 0, skipped = 0
const byFolder = {}
for (const file of files) {
  const size = statSync(file).size
  if (ignored.some(re => re.test(file.replace(/^public/, '')))) { skipped += size; continue }
  shipped += size
  const folder = file.split('/').slice(0, 3).join('/')
  byFolder[folder] = (byFolder[folder] || 0) + size
}
const mb = n => `${(n / 1048576).toFixed(1)} MB`
console.log(`public/ ships ${mb(shipped)} (excluded ${mb(skipped)}):`)
for (const [folder, size] of Object.entries(byFolder).sort((a, b) => b[1] - a[1]).slice(0, 8)) console.log(`  ${mb(size).padStart(8)}  ${folder}`)
if (excluded.length || missing.length) process.exit(1)
console.log('OK: every referenced asset exists and ships.')
