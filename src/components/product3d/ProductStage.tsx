import {Suspense,useEffect,useState} from 'react'
import {Canvas} from '@react-three/fiber'
import {ContactShadows,OrbitControls} from '@react-three/drei'
import type {Product} from '../../types'
import {resolveGearKind,resolveModelPath} from '../../lib/productModels'
import {ProceduralGear} from './ProceduralGear'

type StageProps={
  product:Product
  hover:boolean
  active:boolean
}

function StudioLights(){
  return <>
    <ambientLight intensity={0.4}/>
    <directionalLight position={[2.4,3.2,1.6]} intensity={1.2}/>
    <directionalLight position={[-2.2,1.4,-1.8]} intensity={0.55} color="#e2232a"/>
    <pointLight position={[0,1.6,2]} intensity={0.65}/>
  </>
}

function StageLoader(){
  return <div className="sf-card__stage-loader" aria-hidden="true"><i/><span>Loading 3D</span></div>
}

/** Interactive R3F product stage — pauses when off-screen for catalog scroll performance. */
export default function ProductStage({product,hover,active}:StageProps){
  const [reducedMotion,setReducedMotion]=useState(false)
  const kind=resolveGearKind(product)
  const color=product.color||'#111111'
  const accent=product.accent||'#e2232a'
  // Reserved for future GLB swap — resolve path kept in sync with catalog data
  void resolveModelPath(product)

  useEffect(()=>{
    const media=window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync=()=>setReducedMotion(media.matches)
    sync()
    media.addEventListener('change',sync)
    return()=>media.removeEventListener('change',sync)
  },[])

  if(!active){
    return <img className="sf-card__poster" src={product.image} alt="" loading="lazy" decoding="async" draggable={false}/>
  }

  return <div className="sf-card__canvas-wrap">
    <Suspense fallback={<StageLoader/>}>
      <Canvas
        className="sf-card__canvas"
        dpr={[1,1.25]}
        frameloop={reducedMotion?'demand':'always'}
        camera={{position:[0,0.2,2.4],fov:40,near:0.1,far:40}}
        gl={{antialias:true,alpha:false,powerPreference:'default'}}
        onCreated={({gl})=>{
          gl.setClearColor('#050505',1)
        }}
      >
        <StudioLights/>
        <ProceduralGear kind={kind} color={color} accent={accent} hover={hover} reducedMotion={reducedMotion}/>
        <ContactShadows position={[0,-0.75,0]} opacity={0.5} scale={3} blur={2.2} far={2.2} color="#000"/>
        <OrbitControls
          enablePan={false}
          enableZoom={hover}
          minDistance={1.6}
          maxDistance={3.2}
          maxPolarAngle={Math.PI*0.62}
          minPolarAngle={Math.PI*0.3}
          rotateSpeed={0.65}
        />
      </Canvas>
    </Suspense>
    {!hover&&<div className="sf-card__hint" aria-hidden="true">DRAG TO SPIN</div>}
  </div>
}
