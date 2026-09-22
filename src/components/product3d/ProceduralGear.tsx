import {useMemo,useRef} from 'react'
import {useFrame} from '@react-three/fiber'
import type {Group} from 'three'
import type {GearKind} from '../../lib/productModels'

type Props={
  kind:GearKind
  color:string
  accent:string
  hover:boolean
  reducedMotion:boolean
}

function DarkMetal({color,accent,metalness=0.72,roughness=0.28}:{color:string;accent?:string;metalness?:number;roughness?:number}){
  return <meshStandardMaterial
    color={color}
    metalness={metalness}
    roughness={roughness}
    emissive={accent||'#e2232a'}
    emissiveIntensity={0.08}
  />
}

function AccentTrim({accent}:{accent:string}){
  return <meshStandardMaterial color={accent} metalness={0.55} roughness={0.35} emissive={accent} emissiveIntensity={0.35}/>
}

/** Clean procedural fightwear stand-ins until Blender GLBs land in /public/models. */
export function ProceduralGear({kind,color,accent,hover,reducedMotion}:Props){
  const root=useRef<Group>(null)
  const baseY=0.05
  const phase=useMemo(()=>Math.random()*Math.PI*2,[])

  useFrame((state)=>{
    const g=root.current
    if(!g)return
    const t=state.clock.elapsedTime
    const spin=hover?0.85:0.28
    if(!reducedMotion){
      g.rotation.y=t*spin+phase*0.15
      g.position.y=baseY+Math.sin(t*1.4+phase)*0.06
    }else{
      g.rotation.y=phase*0.2
      g.position.y=baseY
    }
    const target=hover?1.12:1
    g.scale.x+=(target-g.scale.x)*0.12
    g.scale.y=g.scale.x
    g.scale.z=g.scale.x
  })

  return <group ref={root} position={[0,baseY,0]}>
    {kind==='gi'&&<GiMesh color={color} accent={accent}/>}
    {kind==='rashguard'&&<RashMesh color={color} accent={accent}/>}
    {kind==='shorts'&&<ShortsMesh color={color} accent={accent}/>}
    {kind==='trunks'&&<ShortsMesh color={color} accent={accent} flare/>}
    {kind==='gloves'&&<GlovesMesh color={color} accent={accent}/>}
    {kind==='mma-gloves'&&<MmaGlovesMesh color={color} accent={accent}/>}
    {kind==='belt'&&<BeltMesh color={color} accent={accent}/>}
    {kind==='bag'&&<BagMesh color={color} accent={accent}/>}
    {kind==='shin'&&<ShinMesh color={color} accent={accent}/>}
    {kind==='mitt'&&<MittMesh color={color} accent={accent}/>}
    {kind==='wrap'&&<WrapMesh color={color} accent={accent}/>}
    {kind==='mouthguard'&&<MouthMesh color={color} accent={accent}/>}
    {kind==='spats'&&<SpatsMesh color={color} accent={accent}/>}
    {kind==='uniform'&&<UniformMesh color={color} accent={accent}/>}
  </group>
}

function GiMesh({color,accent}:{color:string;accent:string}){
  return <group>
    <mesh position={[0,0.55,0]} castShadow>
      <boxGeometry args={[0.72,0.95,0.32]}/>
      <DarkMetal color={color} accent={accent}/>
    </mesh>
    <mesh position={[-0.52,0.62,0]} rotation={[0,0,0.35]} castShadow>
      <boxGeometry args={[0.28,0.7,0.22]}/>
      <DarkMetal color={color} accent={accent}/>
    </mesh>
    <mesh position={[0.52,0.62,0]} rotation={[0,0,-0.35]} castShadow>
      <boxGeometry args={[0.28,0.7,0.22]}/>
      <DarkMetal color={color} accent={accent}/>
    </mesh>
    <mesh position={[0,0.05,0]} castShadow>
      <boxGeometry args={[0.55,0.55,0.28]}/>
      <DarkMetal color={color} accent={accent} roughness={0.4}/>
    </mesh>
    <mesh position={[0,0.35,0.17]}>
      <boxGeometry args={[0.78,0.08,0.04]}/>
      <AccentTrim accent={accent}/>
    </mesh>
  </group>
}

function RashMesh({color,accent}:{color:string;accent:string}){
  return <group>
    <mesh position={[0,0.35,0]} castShadow>
      <cylinderGeometry args={[0.28,0.3,0.7,18]}/>
      <DarkMetal color={color} accent={accent} metalness={0.55} roughness={0.4}/>
    </mesh>
    <mesh position={[0,0.72,0]} castShadow>
      <sphereGeometry args={[0.28,16,16]}/>
      <DarkMetal color={color} accent={accent}/>
    </mesh>
    <mesh position={[-0.38,0.42,0]} rotation={[0,0,0.55]} castShadow>
      <cylinderGeometry args={[0.09,0.1,0.55,12]}/>
      <DarkMetal color={color} accent={accent}/>
    </mesh>
    <mesh position={[0.38,0.42,0]} rotation={[0,0,-0.55]} castShadow>
      <cylinderGeometry args={[0.09,0.1,0.55,12]}/>
      <DarkMetal color={color} accent={accent}/>
    </mesh>
    <mesh position={[0,0.55,0.22]}>
      <boxGeometry args={[0.22,0.22,0.03]}/>
      <AccentTrim accent={accent}/>
    </mesh>
  </group>
}

function ShortsMesh({color,accent,flare}:{color:string;accent:string;flare?:boolean}){
  const w=flare?0.72:0.62
  return <group position={[0,-0.05,0]}>
    <mesh castShadow>
      <boxGeometry args={[w,0.42,0.38]}/>
      <DarkMetal color={color} accent={accent}/>
    </mesh>
    <mesh position={[-0.2,-0.28,0]} castShadow>
      <boxGeometry args={[0.28,0.28,0.34]}/>
      <DarkMetal color={color} accent={accent}/>
    </mesh>
    <mesh position={[0.2,-0.28,0]} castShadow>
      <boxGeometry args={[0.28,0.28,0.34]}/>
      <DarkMetal color={color} accent={accent}/>
    </mesh>
    <mesh position={[0,0.18,0.2]}>
      <boxGeometry args={[w*0.92,0.06,0.03]}/>
      <AccentTrim accent={accent}/>
    </mesh>
  </group>
}

function GlovesMesh({color,accent}:{color:string;accent:string}){
  return <group>
    <mesh position={[-0.32,0.1,0]} rotation={[0.2,0.4,0.3]} castShadow>
      <sphereGeometry args={[0.28,20,20]}/>
      <DarkMetal color={color} accent={accent}/>
    </mesh>
    <mesh position={[-0.32,-0.18,0]} castShadow>
      <cylinderGeometry args={[0.14,0.16,0.28,16]}/>
      <DarkMetal color="#1a1a1a" accent={accent}/>
    </mesh>
    <mesh position={[0.32,0.1,0]} rotation={[0.2,-0.4,-0.3]} castShadow>
      <sphereGeometry args={[0.28,20,20]}/>
      <DarkMetal color={color==='#111111'?accent:color} accent={accent}/>
    </mesh>
    <mesh position={[0.32,-0.18,0]} castShadow>
      <cylinderGeometry args={[0.14,0.16,0.28,16]}/>
      <DarkMetal color="#1a1a1a" accent={accent}/>
    </mesh>
  </group>
}

function MmaGlovesMesh({color,accent}:{color:string;accent:string}){
  return <group>
    {([-0.28,0.28] as const).map((x,i)=>(
      <group key={i} position={[x,0.05,0]} rotation={[0.15,i? -0.35:0.35,0]}>
        <mesh castShadow>
          <boxGeometry args={[0.26,0.22,0.34]}/>
          <DarkMetal color={color} accent={accent}/>
        </mesh>
        <mesh position={[0,-0.18,0.02]} castShadow>
          <cylinderGeometry args={[0.1,0.11,0.22,12]}/>
          <DarkMetal color="#151515" accent={accent}/>
        </mesh>
        <mesh position={[0,0.02,0.18]}>
          <boxGeometry args={[0.18,0.08,0.04]}/>
          <AccentTrim accent={accent}/>
        </mesh>
      </group>
    ))}
  </group>
}

function BeltMesh({color,accent}:{color:string;accent:string}){
  return <group rotation={[0.4,0.2,0.1]}>
    <mesh castShadow>
      <torusGeometry args={[0.42,0.08,12,48]}/>
      <DarkMetal color={color} accent={accent} metalness={0.4} roughness={0.5}/>
    </mesh>
    <mesh position={[0.42,0,0]} rotation={[0,0,Math.PI/2]} castShadow>
      <boxGeometry args={[0.12,0.35,0.08]}/>
      <AccentTrim accent={accent}/>
    </mesh>
  </group>
}

function BagMesh({color,accent}:{color:string;accent:string}){
  return <group>
    <mesh castShadow>
      <cylinderGeometry args={[0.28,0.3,0.95,18]}/>
      <DarkMetal color={color} accent={accent} roughness={0.45}/>
    </mesh>
    <mesh position={[0,0.55,0]} castShadow>
      <torusGeometry args={[0.18,0.03,8,24]}/>
      <AccentTrim accent={accent}/>
    </mesh>
    <mesh position={[0,0,0.29]}>
      <boxGeometry args={[0.35,0.12,0.02]}/>
      <AccentTrim accent={accent}/>
    </mesh>
  </group>
}

function ShinMesh({color,accent}:{color:string;accent:string}){
  return <group>
    {([-0.28,0.28] as const).map((x,i)=>(
      <group key={i} position={[x,0,0]} rotation={[0.15,0,i?-0.12:0.12]}>
        <mesh castShadow>
          <boxGeometry args={[0.22,0.7,0.16]}/>
          <DarkMetal color={color} accent={accent}/>
        </mesh>
        <mesh position={[0,-0.42,0.02]} castShadow>
          <boxGeometry args={[0.24,0.18,0.2]}/>
          <DarkMetal color="#1a1a1a" accent={accent}/>
        </mesh>
        <mesh position={[0,0.2,0.09]}>
          <boxGeometry args={[0.16,0.35,0.02]}/>
          <AccentTrim accent={accent}/>
        </mesh>
      </group>
    ))}
  </group>
}

function MittMesh({color,accent}:{color:string;accent:string}){
  return <group>
    {([-0.3,0.3] as const).map((x,i)=>(
      <group key={i} position={[x,0.05,0]} rotation={[0.2,i?-0.5:0.5,0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.22,0.2,0.12,20]}/>
          <DarkMetal color={color} accent={accent}/>
        </mesh>
        <mesh position={[0,-0.18,0]} castShadow>
          <boxGeometry args={[0.14,0.28,0.1]}/>
          <DarkMetal color="#151515" accent={accent}/>
        </mesh>
      </group>
    ))}
  </group>
}

function WrapMesh({color,accent}:{color:string;accent:string}){
  return <group rotation={[0.5,0.3,0.2]}>
    <mesh castShadow>
      <torusGeometry args={[0.28,0.1,10,32]}/>
      <DarkMetal color={color} accent={accent} roughness={0.55}/>
    </mesh>
    <mesh position={[0.28,0,0]} castShadow>
      <cylinderGeometry args={[0.08,0.08,0.35,12]}/>
      <AccentTrim accent={accent}/>
    </mesh>
  </group>
}

function MouthMesh({color,accent}:{color:string;accent:string}){
  return <group>
    <mesh castShadow>
      <boxGeometry args={[0.55,0.18,0.28]}/>
      <DarkMetal color={color} accent={accent} metalness={0.3} roughness={0.55}/>
    </mesh>
    <mesh position={[0,0.02,0.08]}>
      <boxGeometry args={[0.4,0.06,0.12]}/>
      <AccentTrim accent={accent}/>
    </mesh>
  </group>
}

function SpatsMesh({color,accent}:{color:string;accent:string}){
  return <group position={[0,-0.15,0]}>
    <mesh position={[-0.16,0.05,0]} castShadow>
      <cylinderGeometry args={[0.11,0.13,0.85,12]}/>
      <DarkMetal color={color} accent={accent}/>
    </mesh>
    <mesh position={[0.16,0.05,0]} castShadow>
      <cylinderGeometry args={[0.11,0.13,0.85,12]}/>
      <DarkMetal color={color} accent={accent}/>
    </mesh>
    <mesh position={[0,0.45,0]} castShadow>
      <boxGeometry args={[0.42,0.22,0.26]}/>
      <DarkMetal color={color} accent={accent}/>
    </mesh>
    <mesh position={[0,0.42,0.14]}>
      <boxGeometry args={[0.38,0.05,0.02]}/>
      <AccentTrim accent={accent}/>
    </mesh>
  </group>
}

function UniformMesh({color,accent}:{color:string;accent:string}){
  return <group>
    <GiMesh color={color==='#111111'?'#f2f2f0':color} accent={accent}/>
  </group>
}
