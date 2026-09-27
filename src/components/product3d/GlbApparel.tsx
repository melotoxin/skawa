import {useEffect,useLayoutEffect,useMemo,useRef} from 'react'
import {useFrame,useThree} from '@react-three/fiber'
import {useGLTF} from '@react-three/drei'
import {Box3,BufferAttribute,BufferGeometry,CanvasTexture,Mesh,MeshStandardMaterial,SRGBColorSpace,Vector3,type Group} from 'three'


type Props={
  url:string
  color:string
  accent:string
  hover?:boolean
  reducedMotion?:boolean
  /** Max dimension in scene units. Omit to keep the exported customizer scale. */
  fit?:number
  /** Starting turn, in radians, so a portrait frame still shows sleeves and trim. */
  yaw?:number
  /** Which design canvas is shown on a model whose front and back share one shell texture. */
  view?:string
  trim?:string
  front?:HTMLCanvasElement
  back?:HTMLCanvasElement
}

function paint(material:MeshStandardMaterial, color:string, accent:string, front?:CanvasTexture, back?:CanvasTexture){
  const name=material.name
  if(name==='accent'){
    material.color.set(accent)
    material.map=null
    return
  }
  if(name==='front'&&front){
    material.map=front
    material.color.set('#ffffff')
    return
  }
  if(name==='back'&&back){
    material.map=back
    material.color.set('#ffffff')
    return
  }
  material.map=null
  material.color.set(color)
}

const printMaterials=new Set(['M_SatinGold','M_BlackBlueTorso'])

function paintPrint(material:MeshStandardMaterial, art:CanvasTexture){
  art.flipY=false
  art.needsUpdate=true
  material.map=art
  material.color.set('#ffffff')
  material.metalness=0.02
  material.roughness=0.68
  material.metalnessMap=null
  material.roughnessMap=null
  material.needsUpdate=true
}

function paintAuthored(material:MeshStandardMaterial, color:string, accent:string, trim:string){
  const name=material.name
  if(name==='M_GoldFacing'||name==='M_WaistPanel'||name==='M_RoyalBlueSleeve')material.color.set(accent)
  else if(name==='M_Burgundy'||name==='M_HemBinding'||name==='M_BlackThread'||name==='M_BlackSleeve')material.color.set(color)
  else if(name==='M_DarkCollar'||name==='M_RoyalBlueBinding')material.color.set(trim)
  else return
  material.map=null
  material.metalnessMap=null
  material.roughnessMap=null
  material.needsUpdate=true
}

/** Front faces keep left-to-right U. Back faces flip U so a name reads correctly when you look at the back. */
function buildPanel(source:BufferGeometry, indices:number[], flipU:boolean){
  const position=source.getAttribute('position')
  const normals=source.getAttribute('normal')
  const count=indices.length
  const nextPosition=new Float32Array(count*3)
  const nextNormal=new Float32Array(count*3)
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity
  for(let i=0;i<count;i++){
    const vertex=indices[i]
    const x=position.getX(vertex),y=position.getY(vertex),z=position.getZ(vertex)
    nextPosition[i*3]=x
    nextPosition[i*3+1]=y
    nextPosition[i*3+2]=z
    if(normals){nextNormal[i*3]=normals.getX(vertex);nextNormal[i*3+1]=normals.getY(vertex);nextNormal[i*3+2]=normals.getZ(vertex)}
    if(x<minX)minX=x
    if(x>maxX)maxX=x
    if(y<minY)minY=y
    if(y>maxY)maxY=y
  }
  const spanX=Math.max(maxX-minX,1e-4),spanY=Math.max(maxY-minY,1e-4)
  const uv=new Float32Array(count*2)
  for(let i=0;i<count;i++){
    const x=nextPosition[i*3],y=nextPosition[i*3+1]
    uv[i*2]=flipU?(maxX-x)/spanX:(x-minX)/spanX
    uv[i*2+1]=(maxY-y)/spanY
  }
  const geometry=new BufferGeometry()
  geometry.setAttribute('position',new BufferAttribute(nextPosition,3))
  geometry.setAttribute('normal',new BufferAttribute(nextNormal,3))
  geometry.setAttribute('uv',new BufferAttribute(uv,2))
  return geometry
}

function splitPrintMesh(mesh:Mesh){
  const source=mesh.geometry
  const position=source.getAttribute('position')
  if(!position||!mesh.parent)return
  const index=source.getIndex()
  const groups=source.groups.length?source.groups:[{start:0,count:index?index.count:position.count,materialIndex:0}]
  const front:number[]=[]
  const back:number[]=[]
  const rest:number[]=[]
  // Signed volume tells the winding: positive = outward-facing triangles (the glTF convention), so
  // triangles facing +z are the front. Solid meshes put both sides at similar average depths, so depth can't decide.
  let volume=0
  for(const group of groups){
    for(let cursor=group.start;cursor<group.start+group.count;cursor+=3){
      const a=index?index.getX(cursor):cursor
      const b=index?index.getX(cursor+1):cursor+1
      const c=index?index.getX(cursor+2):cursor+2
      if((group.materialIndex??0)!==0){rest.push(a,b,c);continue}
      const [px,py,pz]=[position.getX(a),position.getY(a),position.getZ(a)]
      const [qx,qy,qz]=[position.getX(b),position.getY(b),position.getZ(b)]
      const [rx,ry,rz]=[position.getX(c),position.getY(c),position.getZ(c)]
      volume+=px*(qy*rz-qz*ry)-py*(qx*rz-qz*rx)+pz*(qx*ry-qy*rx)
      const facing=((qx-px)*(ry-py)-(qy-py)*(rx-px))>=0
      if(facing)front.push(a,b,c)
      else back.push(a,b,c)
    }
  }
  const frontFaces=volume<0?back:front
  const backFaces=frontFaces===front?back:front
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material]
  const print=materials[0] as MeshStandardMaterial
  const inside=(materials[1] as MeshStandardMaterial|undefined)||print
  const parent=mesh.parent
  const add=(geometry:BufferGeometry,side:'front'|'back'|null,material:MeshStandardMaterial)=>{
    const child=new Mesh(geometry,material.clone())
    child.name=`${mesh.name}-${side||'inside'}`
    child.castShadow=true
    child.position.copy(mesh.position)
    child.quaternion.copy(mesh.quaternion)
    child.scale.copy(mesh.scale)
    if(side){child.userData.artUv='direct';child.userData.artSide=side}
    else child.userData.keptInside=true
    parent.add(child)
  }
  if(frontFaces.length)add(buildPanel(source,frontFaces,false),'front',print)
  if(backFaces.length)add(buildPanel(source,backFaces,true),'back',print)
  if(rest.length)add(buildPanel(source,rest,false),null,inside)
  parent.remove(mesh)
}

/** SKAWA rash guard, or the authored fight-short model. Generated meshes recolor by material name. The shorts shell takes the live design canvas. */
export function GlbApparel({url,color,accent,trim=color,hover=false,reducedMotion=false,fit,yaw=0,front,back}:Props){
  const {scene}=useGLTF(url)
  const invalidate=useThree(state=>state.invalidate)
  const root=useRef<Group>(null)
  const model=useMemo(()=>{
    const cloned=scene.clone(true)
    cloned.traverse(obj=>{
      const mesh=obj as Mesh
      if(!mesh.isMesh)return
      mesh.material=Array.isArray(mesh.material)?mesh.material.map(item=>item.clone()):mesh.material.clone()
      mesh.castShadow=true
    })
    return cloned
  },[scene])
  const textures=useMemo(()=>{
    return [front,back].map(canvas=>{
      if(!canvas)return undefined
      const texture=new CanvasTexture(canvas)
      texture.colorSpace=SRGBColorSpace
      texture.anisotropy=4
      return texture
    })
  },[front,back])

  useLayoutEffect(()=>{
    model.scale.setScalar(1)
    model.position.set(0,0,0)
    const box=new Box3().setFromObject(model)
    const size=box.getSize(new Vector3())
    const max=Math.max(size.x,size.y,size.z,0.001)
    const target=fit??(max<1.2||max>3.6?2.15:max)
    if(Math.abs(target-max)>0.001){
      model.scale.setScalar(target/max)
      box.setFromObject(model)
    }
    const center=box.getCenter(new Vector3())
    model.position.set(-center.x,-center.y,-center.z)
  },[model,fit])

  useLayoutEffect(()=>{
    const [frontMap,backMap]=textures
    if(frontMap&&backMap){
      const pending:Mesh[]=[]
      let largest:Mesh|null=null
      let largestCount=0
      model.traverse(obj=>{
        const mesh=obj as Mesh
        if(!mesh.isMesh||mesh.userData.artSide||mesh.userData.keptInside)return
        const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material]
        if(printMaterials.has(materials[0]?.name))pending.push(mesh)
        const count=mesh.geometry.getAttribute('position')?.count??0
        if(count>largestCount){largest=mesh;largestCount=count}
      })
      if(!pending.length&&largest)pending.push(largest)
      pending.forEach(splitPrintMesh)
    }
    model.traverse(obj=>{
      const mesh=obj as Mesh
      if(!mesh.isMesh)return
      const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material]
      const side=mesh.userData.artSide
      if(side==='front'&&frontMap)paintPrint(materials[0] as MeshStandardMaterial,frontMap)
      else if(side==='back'&&backMap)paintPrint(materials[0] as MeshStandardMaterial,backMap)
      else materials.forEach(material=>{
        const std=material as MeshStandardMaterial
        if(std.name.startsWith('M_')){if(frontMap)paintAuthored(std,color,accent,trim)}
        else if(!frontMap&&!backMap&&std.map)return
        else paint(std,color,accent,frontMap,backMap)
        if(std.name==='front'||std.name==='back')mesh.userData.artUv='flipped'
      })
    })
    textures.forEach(texture=>{if(texture)texture.needsUpdate=true})
    invalidate()
  },[model,color,accent,trim,textures,invalidate])

  useEffect(()=>()=>{textures.forEach(texture=>texture?.dispose())},[textures])

  useLayoutEffect(()=>{
    if(root.current)root.current.rotation.y=yaw
  },[yaw])

  useFrame(state=>{
    textures.forEach(texture=>{if(texture)texture.needsUpdate=true})
    const group=root.current
    if(!group||reducedMotion||front||back)return
    group.rotation.y=yaw+state.clock.elapsedTime*(hover?0.7:0.22)
  })

  return <group ref={root}><primitive object={model}/></group>
}
