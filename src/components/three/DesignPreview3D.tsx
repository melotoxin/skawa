import {Canvas,useThree} from '@react-three/fiber'
import {OrbitControls} from '@react-three/drei'
import {useEffect,useMemo} from 'react'
import {CanvasTexture,ExtrudeGeometry,Shape,SRGBColorSpace} from 'three'
import type {Product} from '../../types'
import {outline} from '../../lib/customDesign'

type Props={product:Product;front:HTMLCanvasElement;back:HTMLCanvasElement;color:string;view:string;zoom:number;spin:boolean;onUnavailable:()=>void}
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
  return <mesh geometry={geometry}>
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
export default function DesignPreview3D(props:Props){
  return <Canvas camera={{position:[0,.12,5.4],fov:38}} dpr={[1,1.5]} frameloop={props.spin?'always':'demand'} gl={{antialias:true,powerPreference:'low-power'}} onCreated={({gl})=>{gl.domElement.addEventListener('webglcontextlost',props.onUnavailable,{once:true})}}>
    <ambientLight intensity={1.6}/><directionalLight position={[3,4,5]} intensity={2.2}/><directionalLight position={[-3,1,-4]} intensity={1.7}/>
    <Garment {...props}/><Camera view={props.view} zoom={props.zoom}/>
    <OrbitControls makeDefault enablePan={false} enableZoom={false} autoRotate={props.spin} autoRotateSpeed={1.6} minPolarAngle={Math.PI*.2} maxPolarAngle={Math.PI*.8}/>
  </Canvas>
}
