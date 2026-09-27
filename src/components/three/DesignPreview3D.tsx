import {Suspense,useRef} from 'react'
import {Canvas,useThree} from '@react-three/fiber'
import {OrbitControls} from '@react-three/drei'
import {useEffect,useMemo} from 'react'
import {CanvasTexture,ExtrudeGeometry,Mesh,Raycaster,Shape,SRGBColorSpace,Vector2,type Intersection} from 'three'
import type {Product} from '../../types'
import {outline,type DesignSide,type Placement} from '../../lib/customDesign'
import {moveArt,pickArt,type ArtKey,type ArtTarget} from '../../lib/artPlacement'
import {apparelModelUrl} from '../../lib/productModels'
import {GlbApparel} from '../product3d/GlbApparel'

type Props={product:Product;front:HTMLCanvasElement;back:HTMLCanvasElement;bagFront?:HTMLCanvasElement;bagBack?:HTMLCanvasElement;color:string;accent?:string;trim?:string;view:string;zoom:number;spin:boolean;onUnavailable:()=>void;art:ArtTarget;onArtGrab:(key:ArtKey)=>void;onArtMove:(key:ArtKey,placement:Placement)=>void;onArtEnd:()=>void}
function Garment({product,front,back,color}:Props){
  const geometry=useMemo(()=>{
    const s=new Shape();outline(product).forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath()
    const g=new ExtrudeGeometry(s,{depth:.36,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.055,bevelThickness:.09,curveSegments:12})
    g.translate(0,0,-.18)
    const pos=g.attributes.position,normal=g.attributes.normal,uv=g.attributes.uv
    g.clearGroups()
    for(let i=0;i<pos.count;i++)uv.setXY(i,((normal.getZ(i)<-.5?-pos.getX(i):pos.getX(i))+1.65)/3.3,(pos.getY(i)+1.65)/3.3)
    let start=0,previous=-1
    for(let i=0;i<pos.count;i+=3){const z=normal.getZ(i),material=z>.99?0:z<-.99?1:2;if(material!==previous){if(previous!==-1)g.addGroup(start,i-start,previous);start=i;previous=material}}
    g.addGroup(start,pos.count-start,previous)
    return g
  },[product])
  const textures=useMemo(()=>[front,back].map(c=>{const t=new CanvasTexture(c);t.colorSpace=SRGBColorSpace;t.anisotropy=4;return t}),[front,back])
  useEffect(()=>()=>geometry.dispose(),[geometry])
  useEffect(()=>()=>textures.forEach(t=>t.dispose()),[textures])
  return <mesh geometry={geometry} userData={{artUv:'flipped',artSplit:true}}>
    <meshStandardMaterial attach="material-0" map={textures[0]} roughness={.82}/>
    <meshStandardMaterial attach="material-1" map={textures[1]} roughness={.82}/>
    <meshStandardMaterial attach="material-2" color={color} roughness={.82}/>
  </mesh>
}
function Camera({view,zoom}:{view:string;zoom:number}){
  const {camera,invalidate}=useThree()
  useEffect(()=>{const distance=5.4/zoom;const angle=view==='back'?Math.PI:view==='left'?-Math.PI/2:view==='right'?Math.PI/2:view==='perspective'?.35:0;camera.position.set(Math.sin(angle)*distance,view==='perspective'?.55:.12,Math.cos(angle)*distance);camera.lookAt(0,0,0);camera.updateProjectionMatrix();invalidate()},[view,zoom,camera,invalidate])
  return null
}
function canvasPoint(hit:Intersection){
  const mesh=hit.object as Mesh
  const uv=hit.uv
  if(!uv||!mesh.userData.artUv)return null
  const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material]
  const material=materials[hit.face?.materialIndex??0]
  if(mesh.userData.artUv==='direct'&&(mesh.userData.artSide==='front'||mesh.userData.artSide==='back')){
    return {x:uv.x*1024,y:uv.y*1024,side:mesh.userData.artSide as DesignSide}
  }
  let side:DesignSide|null=null
  if(mesh.userData.artSplit){
    const index=hit.face?.materialIndex
    side=index===0?'front':index===1?'back':null
  }else if(material?.name==='front'||material?.name==='back')side=material.name
  if(!side)return null
  return {x:uv.x*1024,y:(1-uv.y)*1024,side}
}

function ArtDrag({art,onArtGrab,onArtMove,onArtEnd}:{art:ArtTarget;onArtGrab:(key:ArtKey)=>void;onArtMove:(key:ArtKey,placement:Placement)=>void;onArtEnd:()=>void}){
  const {camera,scene,gl,controls,invalidate}=useThree()
  const artRef=useRef(art)
  const grabRef=useRef(onArtGrab)
  const moveRef=useRef(onArtMove)
  const endRef=useRef(onArtEnd)
  artRef.current=art
  grabRef.current=onArtGrab
  moveRef.current=onArtMove
  endRef.current=onArtEnd
  useEffect(()=>{
    const el=gl.domElement
    const raycaster=new Raycaster()
    const pointer=new Vector2()
    let drag:{key:ArtKey;ox:number;oy:number}|null=null
    const locate=(event:PointerEvent,side?:DesignSide)=>{
      const rect=el.getBoundingClientRect()
      pointer.set(((event.clientX-rect.left)/rect.width)*2-1,-((event.clientY-rect.top)/rect.height)*2+1)
      raycaster.setFromCamera(pointer,camera)
      for(const hit of raycaster.intersectObjects(scene.children,true)){
        const point=canvasPoint(hit)
        if(!point||(side&&point.side!==side))continue
        return point
      }
      return null
    }
    const sample=(event:PointerEvent)=>{
      const point=locate(event)
      if(!point)return null
      const key=pickArt(point.x,point.y,artRef.current,point.side)
      return key?{key,point}:null
    }
    const down=(event:PointerEvent)=>{
      if(event.button!==0)return
      const found=sample(event)
      el.style.cursor=found?'grab':''
      if(!found)return
      event.stopPropagation()
      event.preventDefault()
      const placement=artRef.current[found.key]
      drag={key:found.key,ox:found.point.x-placement.x/100*1024,oy:found.point.y-placement.y/100*1024}
      const orbit=controls as {enabled?:boolean}|null
      if(orbit)orbit.enabled=false
      el.style.cursor='grabbing'
      try{el.setPointerCapture(event.pointerId)}catch{/* pointer capture needs a browser-generated event */}
      grabRef.current(found.key)
    }
    const move=(event:PointerEvent)=>{
      if(!drag){el.style.cursor=sample(event)?'grab':'';return}
      event.stopPropagation()
      const point=locate(event)
      if(!point)return
      const placement=artRef.current[drag.key]
      const mirrored=drag.key==='textPlacement'?artRef.current.mirrorText:artRef.current.mirrorLogo
      moveRef.current(drag.key,moveArt(placement,point.x,point.y,drag.ox,drag.oy,mirrored?placement.side:point.side))
      invalidate()
    }
    const up=()=>{
      if(!drag)return
      drag=null
      const orbit=controls as {enabled?:boolean}|null
      if(orbit)orbit.enabled=true
      el.style.cursor=''
      endRef.current()
    }
    el.addEventListener('pointerdown',down,true)
    el.addEventListener('pointermove',move)
    el.addEventListener('pointerup',up)
    el.addEventListener('pointercancel',up)
    return ()=>{el.removeEventListener('pointerdown',down,true);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);el.style.cursor=''}
  },[camera,scene,gl,controls,invalidate])
  return null
}

/** Reports a real WebGL context loss. The listener is removed before the canvas unmounts, because R3F
 * deliberately releases the context on unmount (switching to 2D), which is not a failure. */
function ContextLossWatch({onLost}:{onLost:()=>void}){
  const gl=useThree(state=>state.gl)
  const lostRef=useRef(onLost)
  lostRef.current=onLost
  useEffect(()=>{
    const el=gl.domElement
    const lost=()=>lostRef.current()
    el.addEventListener('webglcontextlost',lost,{once:true})
    return()=>el.removeEventListener('webglcontextlost',lost)
  },[gl])
  return null
}

export default function DesignPreview3D(props:Props){
  return <Canvas camera={{position:[0,.12,5.4],fov:38}} dpr={[1,1.5]} frameloop={props.spin?'always':'demand'} gl={{antialias:true,powerPreference:'low-power'}}>
    <ContextLossWatch onLost={props.onUnavailable}/>
    <ambientLight intensity={1.6}/><directionalLight position={[3,4,5]} intensity={2.2}/><directionalLight position={[-3,1,-4]} intensity={1.7}/>
    <Suspense fallback={null}>
      {apparelModelUrl(props.product)
        ?<GlbApparel url={apparelModelUrl(props.product)!} color={props.color} accent={props.accent||'#e2232a'} trim={props.trim||props.color} view={props.view} front={props.front} back={props.back} bagFront={props.bagFront} bagBack={props.bagBack} reducedMotion/>
        :<Garment {...props}/>}
    </Suspense>
    <Camera view={props.view} zoom={props.zoom}/>
    <ArtDrag art={props.art} onArtGrab={props.onArtGrab} onArtMove={props.onArtMove} onArtEnd={props.onArtEnd}/>
    <OrbitControls makeDefault enablePan={false} enableZoom={false} autoRotate={props.spin} autoRotateSpeed={4} minPolarAngle={Math.PI*.2} maxPolarAngle={Math.PI*.8}/>
  </Canvas>
}
