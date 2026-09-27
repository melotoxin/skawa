// Renders registered 2D template layers from the approved GLB models (read-only use of the models).
// Every pass uses the same camera, so all layers of a view share one registration.
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js'

const ROLE = {body: new THREE.Color(1, 0, 0), trim: new THREE.Color(0, 1, 0), other: new THREE.Color(0, 0, 1)}
const NEUTRAL = {body: 0xd4d4d2, trim: 0xd4d4d2, lining: 0x2c2c2e, thread: 0x5c5c5e, piping: 0xb9bcc0}

/**
 * Per template: which mesh/material plays which role.
 * role: 'body' (recolour + pattern), 'trim', 'lining' (dark, never recoloured), 'thread' (stitching), 'piping' (fixed accent) or 'hide'.
 * trimAbove: parts of body meshes above this height (0–1 of the model's height) become trim (e.g. a waistband band on the shell).
 */
const CONFIG = {
  'fight-short': {
    glb: '/models/fight-short.glb',
    // three.js renames nodes on load (spaces → underscores), so roles key off material names.
    role(mesh, material) {
      if (['M_BlackInterior', 'M_Burgundy', 'M_WaistLining'].includes(material.name)) return 'lining'
      if (material.name === 'M_BlackThread') return 'thread'
      if (['M_HemBinding', 'M_GoldFacing', 'M_WaistPanel'].includes(material.name)) return 'trim'
      return 'body'
    },
    trimAbove: 0.84,
  },
  'rashguard-long': {
    glb: '/models/rash-guard.glb',
    role(mesh, material) {
      if (material.name === 'M_DarkTextileInterior') return 'lining'
      if (material.name === 'M_SilverPiping') return /cuff|hem/i.test(mesh.name) ? 'trim' : 'thread'
      if (['M_DarkCollar', 'M_RoyalBlueBinding'].includes(material.name)) return 'trim'
      return 'body'
    },
  },
  // Single textured mesh: render with ?original=1 (regions are derived from the image at build time).
  'gi': {glb: '/models/bjj-gi.glb', role: () => 'body'},
  // Same raglan body with the sleeves cut to short length (render-time clipping; the model file is untouched).
  'rashguard-short': {
    glb: '/models/rash-guard.glb',
    role(mesh, material) {
      if (/cuff/i.test(mesh.name)) return 'hide'
      if (material.name === 'M_DarkTextileInterior') return 'lining'
      if (material.name === 'M_SilverPiping') return /hem/i.test(mesh.name) ? 'trim' : 'thread'
      if (['M_DarkCollar', 'M_RoyalBlueBinding'].includes(material.name)) return 'trim'
      return 'body'
    },
    // Sleeve meshes end at this image height (0–1 from the top); the band above the cut is the hem binding.
    sleeveCut: {match: /sleeve/i, at: 0.5, band: 0.018},
  },
}

const params = new URLSearchParams(location.search)
const id = params.get('template') || 'fight-short'
const config = CONFIG[id]
const SIZE = [1200, 1500], SS = Number(params.get('ss') || 2)
const W = SIZE[0] * SS, H = SIZE[1] * SS
const log = text => { document.getElementById('log').textContent += `\n${text}` }

const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, preserveDrawingBuffer: true})
renderer.setPixelRatio(1)
renderer.setSize(W, H, false)
renderer.setClearColor(0x000000, 0)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.NoToneMapping

const scene = new THREE.Scene()
const pmrem = new THREE.PMREMGenerator(renderer)
const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
const key = new THREE.DirectionalLight(0xffffff, 0.62); key.position.set(-2, 3, 4)
const fill = new THREE.DirectionalLight(0xffffff, 0.22); fill.position.set(3, 1, 2)
const rim = new THREE.DirectionalLight(0xffffff, 0.16); rim.position.set(0, 2, -4)

const gltf = await new GLTFLoader().loadAsync(config.glb)
const model = gltf.scene
const pivot = new THREE.Group()
pivot.add(model)
scene.add(pivot)

// Centre the model and size an orthographic camera that fits every view with a margin.
const box = new THREE.Box3().setFromObject(model)
const centre = box.getCenter(new THREE.Vector3()), dims = box.getSize(new THREE.Vector3())
model.position.sub(centre)
// Views are straight front/back (yaw 0 or π), so the visible width is the model's X extent.
const halfH = dims.y / 2 * 1.08, halfW = Math.max(dims.x / 2 * 1.06, halfH * SIZE[0] / SIZE[1])
const fitH = Math.max(halfH, halfW * SIZE[1] / SIZE[0])
const camera = new THREE.OrthographicCamera(-fitH * SIZE[0] / SIZE[1], fitH * SIZE[0] / SIZE[1], fitH, -fitH, -50, 50)
camera.position.set(0, 0, 10)
camera.lookAt(0, 0, 0)
const cutY = config.trimAbove == null ? Infinity : -dims.y / 2 + dims.y * config.trimAbove
// Image height (0–1 from the top) → world Y for the orthographic camera.
const worldY = f => fitH - f * 2 * fitH
const sleeve = config.sleeveCut && {match: config.sleeveCut.match, cut: worldY(config.sleeveCut.at), hem: worldY(config.sleeveCut.at - config.sleeveCut.band)}
if (sleeve) renderer.localClippingEnabled = true
const sleevePlane = sleeve && new THREE.Plane(new THREE.Vector3(0, 1, 0), -sleeve.cut)

// Remember every mesh's original materials and its role.
const parts = []
model.traverse(obj => {
  if (!obj.isMesh) return
  const originals = Array.isArray(obj.material) ? obj.material : [obj.material]
  const roles = originals.map(m => config.role(obj, m))
  parts.push({mesh: obj, originals, roles, sleeve: Boolean(sleeve && sleeve.match.test(obj.name))})
})
log(`${id}: ${parts.length} meshes · roles ${JSON.stringify(parts.map(p => `${p.mesh.name}:${p.roles.join('/')}`))}`)

const normalOf = m => m.normalMap ?? null
const litMaterial = (color, original, roughness = 0.82) => new THREE.MeshStandardMaterial({
  color, roughness, metalness: 0, normalMap: normalOf(original), envMap: environment, envMapIntensity: 0.42, side: THREE.DoubleSide,
})
/**
 * Flat role colours. Body geometry above cutY is painted as trim (waistband band); on cut sleeves,
 * geometry below the cut is discarded and the band just above it is the hem binding (trim).
 */
const idMaterial = (role, isSleeve) => role === 'body'
  ? new THREE.ShaderMaterial({
      uniforms: {cut: {value: cutY}, sleeveCut: {value: isSleeve ? sleeve.cut : -1e9}, sleeveHem: {value: isSleeve ? sleeve.hem : -1e9}},
      side: THREE.DoubleSide,
      vertexShader: 'varying float vy;void main(){vec4 w=modelMatrix*vec4(position,1.);vy=w.y;gl_Position=projectionMatrix*viewMatrix*w;}',
      fragmentShader: 'uniform float cut;uniform float sleeveCut;uniform float sleeveHem;varying float vy;void main(){if(vy<sleeveCut)discard;gl_FragColor=(vy>cut||vy<sleeveHem)?vec4(0.,1.,0.,1.):vec4(1.,0.,0.,1.);}',
    })
  : new THREE.MeshBasicMaterial({color: role === 'trim' ? ROLE.trim : ROLE.other, side: THREE.DoubleSide, clippingPlanes: isSleeve ? [sleevePlane] : null})

// ?original=1 renders the model's own materials as the base pass. Used for single-mesh models whose regions are
// derived from the image by scripts/build-customizer-assets.mjs (DERIVED), e.g. the gi.
const ORIGINAL = params.get('original') === '1'
const PASSES = ORIGINAL ? {base: (role, original) => original} : {
  base: (role, original) => role === 'hide' ? null : litMaterial(NEUTRAL[role] ?? NEUTRAL.body, original),
  shading: (role, original) => role === 'hide' ? null : litMaterial(['body', 'trim'].includes(role) ? 0xffffff : NEUTRAL[role], original),
  highlight: (role, original) => role === 'hide' ? null : new THREE.MeshStandardMaterial({color: 0x000000, roughness: 0.42, metalness: 0, normalMap: normalOf(original), envMap: environment, envMapIntensity: 1, side: THREE.DoubleSide}),
  id: (role, original, isSleeve) => role === 'hide' ? null : idMaterial(role, isSleeve),
}

function apply(pass) {
  const lit = pass !== 'id'
  scene.environment = lit ? environment : null
  for (const light of [key, fill, rim]) lit ? scene.add(light) : scene.remove(light)
  for (const {mesh, originals, roles, sleeve: isSleeve} of parts) {
    const mats = roles.map((role, i) => {
      const material = PASSES[pass](role, originals[i], isSleeve)
      if (material && isSleeve && pass !== 'id') material.clippingPlanes = [sleevePlane]
      return material
    })
    mesh.visible = mats.some(Boolean)
    mesh.material = Array.isArray(mesh.material) ? mats.map(m => m ?? new THREE.MeshBasicMaterial({visible: false})) : (mats[0] ?? new THREE.MeshBasicMaterial({visible: false}))
  }
}

const views = {front: 0, back: Math.PI}
const results = []
for (const [view, yaw] of Object.entries(views)) {
  pivot.rotation.y = yaw
  for (const pass of Object.keys(PASSES)) {
    apply(pass)
    renderer.render(scene, camera)
    const blob = await new Promise(resolve => renderer.domElement.toBlob(resolve, 'image/png'))
    results.push({name: `${view}-${pass}.png`, blob})
  }
}

const out = document.getElementById('out')
for (const {name, blob} of results) {
  const fig = document.createElement('figure')
  fig.innerHTML = `<img src="${URL.createObjectURL(blob)}"><figcaption>${name}</figcaption>`
  out.append(fig)
}

if (params.get('save') === '1') {
  for (const {name, blob} of results) {
    const res = await fetch(`http://127.0.0.1:5199/save?file=${encodeURIComponent(`${id}/${name}`)}`, {method: 'POST', body: blob})
    log(`${name}: ${res.status}`)
  }
}
log(`done: ${results.length} layers at ${W}x${H}`)
window.__renderDone = true
