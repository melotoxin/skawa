// Optimizes generated product GLBs for the web: orientation fix, weld, normals, WebP textures, meshopt.
// Not part of the app build and not a project dependency. Run it from a scratch folder that has the tools:
//   npm i @gltf-transform/core@4 @gltf-transform/extensions@4 @gltf-transform/functions@4 meshoptimizer sharp
//   node optimize-glb.mjs <rawDir> <repo>/public/models/products [names...]
import {NodeIO} from '@gltf-transform/core'
import {ALL_EXTENSIONS} from '@gltf-transform/extensions'
import {dedup, meshopt, normals, prune, textureCompress, transformMesh, weld} from '@gltf-transform/functions'
import {MeshoptDecoder, MeshoptEncoder} from 'meshoptimizer'
import sharp from 'sharp'
import {readdirSync, statSync, mkdirSync} from 'node:fs'
import {join} from 'node:path'

const [inDir, outDir, ...only] = process.argv.slice(2)
/** Orientation fixes (degrees about X, Y, Z), baked into the vertices. */
const ROTATE = {'mma-gloves': [-90, 0, 0], 'focus-mitts': [90, 0, 0]}

function rotation([x, y, z]) {
  const [a, b, c] = [x, y, z].map(d => d * Math.PI / 180)
  const [ca, sa, cb, sb, cc, sc] = [Math.cos(a), Math.sin(a), Math.cos(b), Math.sin(b), Math.cos(c), Math.sin(c)]
  // Column-major 4×4 for R = Rz · Ry · Rx (glTF/three.js convention).
  const m = [
    cb * cc, cb * sc, -sb, 0,
    sa * sb * cc - ca * sc, sa * sb * sc + ca * cc, sa * cb, 0,
    ca * sb * cc + sa * sc, ca * sb * sc - sa * cc, ca * cb, 0,
    0, 0, 0, 1,
  ]
  return m
}

await MeshoptEncoder.ready
await MeshoptDecoder.ready
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder})
mkdirSync(outDir, {recursive: true})
const names = only.length ? only : readdirSync(inDir).filter(f => f.endsWith('.glb')).map(f => f.slice(0, -4))
for (const name of names) {
  const src = join(inDir, `${name}.glb`), dest = join(outDir, `${name}.glb`)
  const doc = await io.read(src)
  const root = doc.getRoot()
  if (ROTATE[name]) for (const mesh of root.listMeshes()) transformMesh(mesh, rotation(ROTATE[name]))
  const missingNormals = root.listMeshes().some(mesh => mesh.listPrimitives().some(p => !p.getAttribute('NORMAL')))
  await doc.transform(
    dedup(),
    weld(),
    ...(missingNormals ? [normals()] : []),
    prune(),
    textureCompress({encoder: sharp, targetFormat: 'webp', resize: [1024, 1024], quality: 88}),
    meshopt({encoder: MeshoptEncoder, level: 'medium'}),
  )
  await io.write(dest, doc)
  const tris = root.listMeshes().flatMap(m => m.listPrimitives()).reduce((n, p) => n + (p.getIndices()?.getCount() ?? p.getAttribute('POSITION').getCount()) / 3, 0)
  console.log(`${name.padEnd(24)} ${(statSync(src).size / 1024).toFixed(0).padStart(5)} KB → ${(statSync(dest).size / 1024).toFixed(0).padStart(4)} KB  ${Math.round(tris)} tris${ROTATE[name] ? '  rotated ' + ROTATE[name] : ''}${missingNormals ? '  +normals' : ''}`)
}
