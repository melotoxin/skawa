import {writeFileSync} from 'node:fs'
import * as THREE from 'three'

if(typeof globalThis.FileReader==='undefined'){
  globalThis.FileReader=class FileReader{
    readAsArrayBuffer(blob){
      blob.arrayBuffer().then(buf=>{
        this.result=buf
        this.onloadend?.()
      })
    }
    readAsDataURL(blob){
      blob.arrayBuffer().then(buf=>{
        this.result=`data:application/octet-stream;base64,${Buffer.from(buf).toString('base64')}`
        this.onloadend?.()
      })
    }
  }
}

const {GLTFExporter}=await import('three/examples/jsm/exporters/GLTFExporter.js')

/** Same silhouettes as src/lib/customDesign.ts outline() so the GLB matches the customizer. */
const rashGuard=[
  [-.34,1.12],[-.67,1.16],[-1.38,-.22],[-1.04,-.44],[-.65,.55],[-.64,-1.2],
  [.64,-1.2],[.65,.55],[1.04,-.44],[1.38,-.22],[.67,1.16],[.34,1.12],[.22,.86],[-.22,.86],
]
const fightShort=[
  [-1,1.1],[1,1.1],[1.22,-1.2],[.22,-1.2],[0,-.3],[-.22,-1.2],[-1.22,-1.2],
]

function garment(points, name){
  const shape=new THREE.Shape()
  points.forEach(([x,y],i)=>i?shape.lineTo(x,y):shape.moveTo(x,y))
  shape.closePath()
  const geometry=new THREE.ExtrudeGeometry(shape,{
    depth:.36,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.045,bevelThickness:.07,curveSegments:12,
  })
  geometry.translate(0,0,-.18)
  const pos=geometry.attributes.position
  const normal=geometry.attributes.normal
  const uv=geometry.attributes.uv
  geometry.clearGroups()
  for(let i=0;i<pos.count;i++){
    uv.setXY(i,((normal.getZ(i)<-.5?-pos.getX(i):pos.getX(i))+1.65)/3.3,(pos.getY(i)+1.65)/3.3)
  }
  let start=0
  let previous=-1
  for(let i=0;i<pos.count;i+=3){
    const z=normal.getZ(i)
    const material=z>.99?0:z<-.99?1:2
    if(material!==previous){
      if(previous!==-1)geometry.addGroup(start,i-start,previous)
      start=i
      previous=material
    }
  }
  geometry.addGroup(start,pos.count-start,previous)
  const fabric={color:'#111111',roughness:.78,metalness:.04}
  const mesh=new THREE.Mesh(geometry,[
    new THREE.MeshStandardMaterial({name:'front',...fabric}),
    new THREE.MeshStandardMaterial({name:'back',...fabric}),
    new THREE.MeshStandardMaterial({name:'fabric',...fabric}),
  ])
  mesh.name=name
  return mesh
}

function accentBar(width, height, depth, x, y, z){
  const mesh=new THREE.Mesh(
    new THREE.BoxGeometry(width,height,depth),
    new THREE.MeshStandardMaterial({name:'accent',color:'#e2232a',roughness:.42,metalness:.08}),
  )
  mesh.position.set(x,y,z)
  mesh.name='accent'
  return mesh
}

function shirt(){
  const group=new THREE.Group()
  group.name='rash-guard'
  group.add(garment(rashGuard,'rash-guard'))
  group.add(accentBar(.16,1.35,.08,.55,-.05,.28))
  group.add(accentBar(.22,.16,.1,-1.15,-.28,.16))
  group.add(accentBar(.22,.16,.1,1.15,-.28,.16))
  const collar=new THREE.Mesh(
    new THREE.TorusGeometry(.2,.045,8,20),
    new THREE.MeshStandardMaterial({name:'accent',color:'#e2232a',roughness:.42,metalness:.08}),
  )
  collar.position.set(0,.98,.02)
  collar.rotation.x=Math.PI/2
  collar.name='accent'
  group.add(collar)
  return group
}

function shorts(){
  const group=new THREE.Group()
  group.name='fight-short'
  group.add(garment(fightShort,'fight-short'))
  group.add(accentBar(.14,1.55,.08,.72,-.08,.28))
  const band=new THREE.Mesh(
    new THREE.BoxGeometry(2.05,.16,.42),
    new THREE.MeshStandardMaterial({name:'accent',color:'#e2232a',roughness:.42,metalness:.08}),
  )
  band.position.set(0,1.02,0)
  band.name='accent'
  group.add(band)
  return group
}

const exporter=new GLTFExporter()
function exportGroup(group, file){
  return new Promise((resolve,reject)=>{
    exporter.parse(group, result=>{
      const buf=result instanceof ArrayBuffer?Buffer.from(result):Buffer.from(JSON.stringify(result))
      writeFileSync(file, buf)
      console.log('wrote', file, buf.length)
      resolve()
    }, reject, {binary:true})
  })
}

await exportGroup(shirt(), 'public/models/rash-guard.glb')
await exportGroup(shorts(), 'public/models/fight-short.glb')
