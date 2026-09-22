import { RoundedBox } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useRef } from 'react'
import { MathUtils, type Group } from 'three'

export type ProceduralFightShortsSceneProps = {
  reducedMotion?: boolean
  active?: boolean
}

const blackMaterial = (
  <meshStandardMaterial color="#111214" metalness={0.08} roughness={0.48} />
)

function BrandMark() {
  return (
    <group position={[0.55, -0.48, 0.34]} rotation={[0, 0, -0.08]}>
      {[0, 0.16, 0.32].map((offset, index) => (
        <group key={offset} position={[0, -offset, 0]}>
          <mesh position={[-0.11, 0, 0]} rotation={[0, 0, -0.52]}>
            <boxGeometry args={[0.27, 0.075, 0.035]} />
            <meshBasicMaterial color={index === 2 ? '#e3262e' : '#f5f5f2'} />
          </mesh>
          <mesh position={[0.11, 0, 0]} rotation={[0, 0, 0.52]}>
            <boxGeometry args={[0.27, 0.075, 0.035]} />
            <meshBasicMaterial color={index === 2 ? '#e3262e' : '#f5f5f2'} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function RedSlash({ x, y, rotation, length }: { x: number; y: number; rotation: number; length: number }) {
  return (
    <mesh position={[x, y, 0.337]} rotation={[0, 0, rotation]}>
      <boxGeometry args={[length, 0.055, 0.026]} />
      <meshStandardMaterial color="#e3262e" metalness={0.12} roughness={0.34} />
    </mesh>
  )
}

function FightShortsModel({ reducedMotion = false, active = true }: ProceduralFightShortsSceneProps) {
  const model = useRef<Group>(null)

  useFrame((state, delta) => {
    if (!model.current || reducedMotion || !active) return

    const time = state.clock.elapsedTime
    const targetX = -0.04 - state.pointer.y * 0.075 + Math.sin(time * 0.55) * 0.018
    const targetY = -0.28 + state.pointer.x * 0.2 + Math.sin(time * 0.36) * 0.035

    model.current.rotation.x = MathUtils.damp(model.current.rotation.x, targetX, 3.6, delta)
    model.current.rotation.y = MathUtils.damp(model.current.rotation.y, targetY, 3.6, delta)
    model.current.position.y = MathUtils.damp(
      model.current.position.y,
      Math.sin(time * 0.72) * 0.045,
      2.8,
      delta,
    )
  })

  return (
    <group
      ref={model}
      rotation={[-0.04, -0.28, 0]}
      scale={1.14}
      position={[0, 0, 0]}
    >
      <RoundedBox args={[2.5, 0.5, 0.72]} radius={0.13} smoothness={3} position={[0, 0.92, 0]} castShadow>
        <meshStandardMaterial color="#08090a" metalness={0.18} roughness={0.35} />
      </RoundedBox>

      <mesh position={[0, 0.91, 0.37]}>
        <boxGeometry args={[1.05, 0.18, 0.035]} />
        <meshBasicMaterial color="#efefeb" />
      </mesh>
      <mesh position={[0.21, 0.91, 0.394]}>
        <boxGeometry args={[0.5, 0.045, 0.018]} />
        <meshBasicMaterial color="#e3262e" />
      </mesh>

      <RoundedBox args={[2.18, 0.92, 0.63]} radius={0.11} smoothness={3} position={[0, 0.32, 0]} castShadow>
        {blackMaterial}
      </RoundedBox>

      <group position={[-0.56, -0.53, 0]} rotation={[0, 0, 0.075]}>
        <RoundedBox args={[1.12, 1.62, 0.61]} radius={0.12} smoothness={3} castShadow>
          <meshStandardMaterial color="#141518" metalness={0.06} roughness={0.5} />
        </RoundedBox>
        <mesh position={[-0.51, 0.04, 0.025]}>
          <boxGeometry args={[0.17, 1.35, 0.64]} />
          <meshStandardMaterial color="#bd171f" metalness={0.1} roughness={0.42} />
        </mesh>
      </group>

      <group position={[0.56, -0.53, 0]} rotation={[0, 0, -0.075]}>
        <RoundedBox args={[1.12, 1.62, 0.61]} radius={0.12} smoothness={3} castShadow>
          <meshStandardMaterial color="#101113" metalness={0.06} roughness={0.5} />
        </RoundedBox>
        <mesh position={[0.51, 0.04, 0.025]}>
          <boxGeometry args={[0.17, 1.35, 0.64]} />
          <meshStandardMaterial color="#bd171f" metalness={0.1} roughness={0.42} />
        </mesh>
      </group>

      <RedSlash x={-0.54} y={0.27} rotation={-0.64} length={0.78} />
      <RedSlash x={-0.66} y={0.03} rotation={-0.64} length={0.66} />
      <RedSlash x={-0.73} y={-0.19} rotation={-0.64} length={0.5} />
      <BrandMark />

      <mesh position={[-0.08, 0.59, 0.39]} rotation={[0, 0, 0.1]}>
        <cylinderGeometry args={[0.025, 0.025, 0.64, 10]} />
        <meshStandardMaterial color="#d6d6d2" roughness={0.7} />
      </mesh>
      <mesh position={[0.19, 0.58, 0.39]} rotation={[0, 0, -0.17]}>
        <cylinderGeometry args={[0.025, 0.025, 0.62, 10]} />
        <meshStandardMaterial color="#d6d6d2" roughness={0.7} />
      </mesh>
    </group>
  )
}

function Lighting() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 5]} intensity={3.6} color="#fffaf4" />
      <directionalLight position={[-4, 1, 2]} intensity={2.3} color="#ee2630" />
      <pointLight position={[0, -2, 4]} intensity={1.2} color="#ffffff" />
      <mesh position={[0, -1.72, -0.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.25, 40]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.36} depthWrite={false} />
      </mesh>
    </>
  )
}

export default function ProceduralFightShortsScene({ reducedMotion = false, active = true }: ProceduralFightShortsSceneProps) {
  return (
    <Canvas
      aria-hidden="true"
      camera={{ position: [0, 0.05, 4.9], fov: 34 }}
      dpr={[1, 1.4]}
      frameloop={reducedMotion || !active ? 'demand' : 'always'}
      gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      performance={{ min: 0.55 }}
    >
      <Suspense fallback={null}>
        <Lighting />
        <FightShortsModel reducedMotion={reducedMotion} active={active} />
      </Suspense>
    </Canvas>
  )
}
