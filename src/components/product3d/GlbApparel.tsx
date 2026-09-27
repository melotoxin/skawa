import {useEffect,useLayoutEffect,useMemo,useRef} from 'react'
import {useFrame,useThree} from '@react-three/fiber'
import {useGLTF} from '@react-three/drei'
import {Box3,BufferAttribute,BufferGeometry,CanvasTexture,DoubleSide,Euler,Mesh,MeshBasicMaterial,MeshStandardMaterial,SRGBColorSpace,Vector3,type Group,type Texture} from 'three'
import {DecalGeometry} from 'three/addons/geometries/DecalGeometry.js'


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
  bagFront?:HTMLCanvasElement
  bagBack?:HTMLCanvasElement
}

/** Replace the baked black fabric albedo while retaining its folds and baked gold details. */
function recolorBackpack(source:Texture,color:string){
  const image=source.image as CanvasImageSource&{width:number;height:number}
  if(!image?.width||!image.height)return null
  const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height
  const ctx=canvas.getContext('2d',{willReadFrequently:true})!
  ctx.drawImage(image,0,0)
  const pixels=ctx.getImageData(0,0,canvas.width,canvas.height)
  const data=pixels.data
  const target=[1,3,5].map(n=>parseInt(color.slice(n,n+2),16))
  for(let i=0;i<data.length;i+=4){
    const r=data[i],g=data[i+1],b=data[i+2]
    // Gold details already present in the original texture stay warm gold.
    if(r>28&&r-b>12&&r>g*1.05&&g>b*1.12)continue
    const shade=(r+g+b)/3
    // The source fabric is almost black. Use its variation for detail, never as
    // a multiplier that can turn a selected fabric color back into black.
    const factor=Math.min(1.13,Math.max(.78,.93+(shade-25)/140))
    data[i]=Math.min(255,target[0]*factor)
    data[i+1]=Math.min(255,target[1]*factor)
    data[i+2]=Math.min(255,target[2]*factor)
  }
  ctx.putImageData(pixels,0,0)
  const texture=new CanvasTexture(canvas)
  texture.flipY=source.flipY
  texture.colorSpace=source.colorSpace
  texture.anisotropy=source.anisotropy
  return texture
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

const printMaterials=new Set(['M_SatinGold','M_BlackBlueTorso','M_GiJacket'])

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
  else if(name==='M_Burgundy'||name==='M_HemBinding'||name==='M_BlackThread'||name==='M_BlackSleeve'||name==='M_GiPants')material.color.set(color)
  else if(name==='M_DarkCollar'||name==='M_RoyalBlueBinding'||name==='M_GiLapel')material.color.set(trim)
  else if(name==='M_GiBelt')material.color.set('#151515')
  else if(name==='M_GiRankBar')material.color.set(accent||'#a5141c')
  else if(name==='M_GiJacket')material.color.set(color)
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

/** SKAWA authored models. Apparel accepts print canvases; bags retain their textured construction. */
export function GlbApparel({url,color,accent,trim=color,hover=false,reducedMotion=false,fit,yaw=0,front,back,bagFront,bagBack}:Props){
  const backpackHardware=url.startsWith('/models/products/gear-bags.glb')
  const authoredBag=url.startsWith('/models/gear-bag.glb')||backpackHardware
  const {scene}=useGLTF(url)
  const invalidate=useThree(state=>state.invalidate)
  const root=useRef<Group>(null)
  const bagDecals=useRef<Mesh[]>([])
  const bagSourceMap=useMemo(()=>{
    if(!backpackHardware)return null
    let map:Texture|null=null
    scene.traverse(obj=>{const mesh=obj as Mesh;if(!mesh.isMesh)return;const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];const fabric=materials.find(material=>material.name==='Material_0') as MeshStandardMaterial|undefined;if(fabric?.map)map=fabric.map})
    return map
  },[scene,backpackHardware])
  const hasBagArtwork=Boolean(bagFront&&bagBack)
  const bagFabricMap=useMemo(()=>bagSourceMap&&hasBagArtwork&&color.toLowerCase()!=='#151515'?recolorBackpack(bagSourceMap,color):null,[bagSourceMap,hasBagArtwork,color])
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

  const bagTextures=useMemo(()=>[bagFront,bagBack].map(canvas=>{
    if(!canvas)return undefined
    const texture=new CanvasTexture(canvas)
    texture.flipY=false
    texture.colorSpace=SRGBColorSpace
    texture.anisotropy=4
    return texture
  }),[bagFront,bagBack])

  const bagAlphaTextures=useMemo(()=>[bagFront,bagBack].map(canvas=>{
    if(!canvas)return undefined
    const source=canvas.getContext('2d')!.getImageData(0,0,canvas.width,canvas.height)
    const mask=document.createElement('canvas');mask.width=canvas.width;mask.height=canvas.height
    const ctx=mask.getContext('2d')!,pixels=ctx.createImageData(mask.width,mask.height)
    for(let i=0;i<source.data.length;i+=4){const alpha=source.data[i+3];pixels.data[i]=alpha;pixels.data[i+1]=alpha;pixels.data[i+2]=alpha;pixels.data[i+3]=255}
    ctx.putImageData(pixels,0,0)
    const texture=new CanvasTexture(mask)
    texture.flipY=false
    return texture
  }),[bagFront,bagBack])

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
    if(!backpackHardware||!hasBagArtwork)return
    let fabric:Mesh|null=null
    model.traverse(obj=>{const mesh=obj as Mesh;if(!mesh.isMesh)return;const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];if(materials.some(item=>item.name==='Material_0'))fabric=mesh})
    if(!fabric)return
    model.updateMatrixWorld(true)
    const bounds=new Box3().setFromObject(fabric)
    const center=bounds.getCenter(new Vector3()),size=bounds.getSize(new Vector3())
    const width=size.x*.68,height=size.y*.72,depth=size.z*.47
    const inverse=model.matrixWorld.clone().invert()
    const decals=(['front','back'] as const).map(side=>{
      const frontSide=side==='front'
      const projectionDepth=frontSide?depth:size.z*.7
      const position=new Vector3(center.x,center.y,frontSide?bounds.max.z-depth*.32:bounds.min.z+projectionDepth*.38)
      const geometry=new DecalGeometry(fabric!,position,new Euler(0,frontSide?0:Math.PI,0),new Vector3(width,height,projectionDepth))
      const uv=geometry.getAttribute('uv')
      for(let i=0;i<uv.count;i++)uv.setY(i,1-uv.getY(i))
      geometry.applyMatrix4(inverse)
      const material=new MeshBasicMaterial({transparent:true,alphaTest:.01,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,side:DoubleSide})
      const decal=new Mesh(geometry,material)
      decal.name=`Backpack ${side} artwork`
      decal.renderOrder=2
      decal.userData.artUv='direct';decal.userData.artSide=side
      model.add(decal)
      return decal
    })
    bagDecals.current=decals
    return()=>{decals.forEach(decal=>{model.remove(decal);decal.geometry.dispose();(decal.material as MeshBasicMaterial).dispose()});bagDecals.current=[]}
  },[model,backpackHardware,hasBagArtwork])

  useLayoutEffect(()=>{
    bagDecals.current.forEach((decal,index)=>{const material=decal.material as MeshBasicMaterial;material.map=bagTextures[index]??null;material.alphaMap=bagAlphaTextures[index]??null;material.needsUpdate=true;decal.visible=Boolean(material.map&&material.alphaMap)})
    invalidate()
  },[bagTextures,bagAlphaTextures,invalidate])

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
      if(!pending.length&&largest&&!authoredBag)pending.push(largest)
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
        if(backpackHardware&&(std.name.startsWith('Hardware |')||std.name.startsWith('Zipper teeth |'))){
          std.metalness=Math.min(std.metalness,.35)
          std.emissive.setRGB(.10,.052,.007)
          return
        }
        if(backpackHardware&&std.name.startsWith('Zipper tape |')){std.color.set(trim);return}
        if(authoredBag){
          // Keep the bag texture, pocket layout and gold hardware visible in 3D.
          // Artwork placement remains in the 2D proof until print zones are approved.
          if(frontMap&&std.name.startsWith('01 |'))std.color.set(color)
          if(backpackHardware&&std.name==='Material_0'){
            std.map=bagFabricMap??bagSourceMap
            std.color.set('#ffffff')
            std.emissiveMap=std.map
            std.emissive.set('#ffffff')
            std.emissiveIntensity=bagFabricMap?.18:2.5
            std.needsUpdate=true
          }
        }
        else if(std.name.startsWith('M_')){paintAuthored(std,color,accent,trim)}
        else if(!frontMap&&!backMap&&std.map)return
        else paint(std,color,accent,frontMap,backMap)
        if(std.name==='front'||std.name==='back')mesh.userData.artUv='flipped'
      })
    })
    textures.forEach(texture=>{if(texture)texture.needsUpdate=true})
    invalidate()
  },[model,color,accent,trim,textures,invalidate,authoredBag,backpackHardware,bagFabricMap,bagSourceMap])

  useEffect(()=>()=>{textures.forEach(texture=>texture?.dispose())},[textures])
  useEffect(()=>()=>{bagTextures.forEach(texture=>texture?.dispose())},[bagTextures])
  useEffect(()=>()=>{bagAlphaTextures.forEach(texture=>texture?.dispose())},[bagAlphaTextures])
  useEffect(()=>()=>{bagFabricMap?.dispose()},[bagFabricMap])

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
