// Proves the 3D customizer is untouched while the 2D system is rebuilt.
// Usage:  node scripts/check-3d-baseline.mjs          → verify (exit 1 on any change)
//         node scripts/check-3d-baseline.mjs --write  → record a new baseline
import {createHash} from 'node:crypto'
import {existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync} from 'node:fs'
import {join, relative} from 'node:path'

const OUT = 'qa/customizer-baseline'
const HASHES = join(OUT, '3d-files.sha256')
const SNIPPETS = join(OUT, 'paint-outline.txt')
const ROOTS = ['src/components/three', 'src/components/product3d', 'public/models', 'src/lib/productModels.ts']

const files = root => statSync(root).isDirectory()
  ? readdirSync(root).flatMap(name => files(join(root, name)))
  : [root]
const hash = file => createHash('sha256').update(readFileSync(file)).digest('hex')
const norm = p => relative('.', p).split('\\').join('/')

/** Source text of a top-level function, from its declaration to the matching closing brace. */
function extract(source, signature) {
  const start = source.indexOf(signature)
  if (start < 0) return null
  let depth = 0, i = source.indexOf('{', start)
  for (; i < source.length; i++) {
    if (source[i] === '{') depth++
    else if (source[i] === '}' && --depth === 0) break
  }
  return source.slice(start, i + 1)
}

const design = readFileSync('src/lib/customDesign.ts', 'utf8')
const snippets = ['export function outline(', 'export async function paintDesign(']
  .map(sig => extract(design, sig) ?? `MISSING: ${sig}`).join('\n\n/* ---- */\n\n')
const current = ROOTS.flatMap(files).map(norm).sort().map(f => `${hash(f)}  ${f}`).join('\n') + '\n'

if (process.argv.includes('--write')) {
  mkdirSync(OUT, {recursive: true})
  writeFileSync(HASHES, current)
  writeFileSync(SNIPPETS, snippets)
  console.log(`Baseline written: ${current.trim().split('\n').length} files + paintDesign()/outline().`)
  process.exit(0)
}

if (!existsSync(HASHES) || !existsSync(SNIPPETS)) {
  console.error('No baseline found. Run: node scripts/check-3d-baseline.mjs --write')
  process.exit(1)
}
const before = new Map(readFileSync(HASHES, 'utf8').trim().split('\n').map(line => line.split('  ').reverse()))
const after = new Map(current.trim().split('\n').map(line => line.split('  ').reverse()))
const problems = []
for (const [file, sum] of before) if (after.get(file) !== sum) problems.push(after.has(file) ? `changed: ${file}` : `removed: ${file}`)
for (const file of after.keys()) if (!before.has(file)) problems.push(`added: ${file}`)
if (readFileSync(SNIPPETS, 'utf8') !== snippets) problems.push('changed: paintDesign() or outline() in src/lib/customDesign.ts')

if (problems.length) {
  console.error('3D baseline check FAILED:\n  ' + problems.join('\n  '))
  process.exit(1)
}
console.log(`3D baseline OK: ${before.size} files unchanged, paintDesign()/outline() unchanged.`)
