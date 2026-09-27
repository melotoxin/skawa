// Renders GLBs (their own materials) from four angles into one contact sheet, for reviewing generated models.
//   ?glb=/path/a.glb&name=x            one model
//   ?dir=/path/&list=a,b,c&name=sheet  one row per model
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {MeshoptDecoder} from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js'

const params = new URLSearchParams(location.search)
const name = params.get('name') || 'model'
const urls = params.get('list') ? params.get('list').split(',').map(n => `${params.get('dir')}${n}.glb`) : [params.get('glb')]
const log = text => { document.getElementById('log').textContent += `\n${text}` }
const T = Number(params.get('tile') || (urls.length > 1 ? 240 : 480))
const renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true})
renderer.setSize(T * 4, T * urls.length, false)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.setScissorTest(true)
document.body.append(renderer.domElement)
renderer.domElement.style.width = '100%'
const scene = new THREE.Scene()
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2))
const sun = new THREE.DirectionalLight(0xffffff, 1.4); sun.position.set(2, 3, 4); scene.add(sun)
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
const views = [['front', 0], ['three-quarter', -Math.PI / 4], ['side', -Math.PI / 2], ['back', Math.PI]]
for (const [row, url] of urls.entries()) {
  const gltf = await loader.loadAsync(url)
  const model = gltf.scene
  // Optional orientation fix to try before baking it (?rx=-90 degrees about X, ?ry, ?rz).
  model.rotation.set(...['rx', 'ry', 'rz'].map(k => Number(params.get(k) || 0) * Math.PI / 180))
  model.updateMatrixWorld(true)
  const box = new THREE.Box3().setFromObject(model), size = box.getSize(new THREE.Vector3()), centre = box.getCenter(new THREE.Vector3())
  model.position.sub(centre)
  const pivot = new THREE.Group(); pivot.add(model); scene.add(pivot)
  let tris = 0; const maps = new Set()
  model.traverse(o => { if (o.isMesh) { tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.map && maps.add(m.map.image?.width)) } })
  log(`${url.split('/').pop()}: ${Math.round(tris)} tris, size ${size.toArray().map(v => v.toFixed(2)).join(' × ')}, texture ${[...maps].join('/')}`)
  const r = Math.max(size.x, size.y, size.z) * 0.62
  const camera = new THREE.OrthographicCamera(-r, r, r, -r, -50, 50)
  camera.position.set(0, 0, 10); camera.lookAt(0, 0, 0)
  const y = (urls.length - 1 - row) * T
  views.forEach(([, yaw], i) => {
    pivot.rotation.y = yaw
    renderer.setViewport(i * T, y, T, T); renderer.setScissor(i * T, y, T, T)
    renderer.setClearColor((i + row) % 2 ? 0xdedede : 0xe8e8e8, 1)
    renderer.render(scene, camera)
  })
  scene.remove(pivot)
}
if (params.get('save') === '1') {
  const blob = await new Promise(resolve => renderer.domElement.toBlob(resolve, 'image/png'))
  const res = await fetch(`http://127.0.0.1:5199/save?file=${encodeURIComponent(`${name}/preview.png`)}`, {method: 'POST', body: blob})
  log(`saved: ${res.status}`)
}
window.__previewDone = true
