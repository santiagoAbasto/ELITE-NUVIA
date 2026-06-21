import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import type * as THREE from 'three'

function GoldParticles() {
  const groupRef = useRef<THREE.Group>(null)
  const particles = useMemo(() =>
    Array.from({ length: 200 }, () => ({
      position: [
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
      ] as [number, number, number],
      speed: Math.random() * 0.3 + 0.1,
      size: Math.random() * 0.04 + 0.01,
    })), [])

  useFrame((_, delta) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += delta * 0.04
    groupRef.current.rotation.x += delta * 0.01
  })

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.position}>
          <sphereGeometry args={[p.size, 4, 4]} />
          <meshBasicMaterial color="#C9A84C" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

export function ParticlesCanvas() {
  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches
  if (!isDesktop) return null

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} style={{ background: 'transparent' }}>
        <ambientLight intensity={0.5} />
        <GoldParticles />
      </Canvas>
    </div>
  )
}
