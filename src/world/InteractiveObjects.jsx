import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { getMats } from './materials'
import { world, select } from '../hooks/useWorldProgress'
import { Banner } from './primitives'

/**
 * Clickable 3D objects. Each one:
 *  - glows and shows a label when the explorer is near (or when hovered),
 *  - opens the matching information panel when clicked,
 *  - has a DOM equivalent in the overlay, so nothing is locked behind a 3D click.
 */

const NEAR = 7.5

function useNearness(pos, radius = NEAR) {
  const near = useRef(0)
  const [label, setLabel] = useState(false)
  const flag = useRef(false)
  useFrame((_, dt) => {
    const d = Math.hypot(world.charPos.x - pos.x, world.charPos.z - pos.z)
    const target = d < radius ? 1 : 0
    near.current += (target - near.current) * (1 - Math.exp(-5 * dt))
    const on = near.current > 0.35
    if (on !== flag.current) {
      flag.current = on
      setLabel(on)
    }
  })
  return { near, label }
}

function Label({ children, y = 3, sub }) {
  return (
    <Html center position={[0, y, 0]} distanceFactor={10} zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
      <div className="world-label">
        <span className="world-label-title">{children}</span>
        {sub && <span className="world-label-sub">{sub}</span>}
      </div>
    </Html>
  )
}

/* ----------------------------------------------------------------------------- skill stones */

export function SkillStone({ spot }) {
  const mats = getMats()
  const { near, label } = useNearness(spot.pos)
  const [hover, setHover] = useState(false)
  useCursor(hover)
  const crystal = useRef()
  const ring = useRef()
  const group = useRef()
  const runeMat = useMemo(() => mats.rune.clone(), [mats])
  const yaw = (spot.side > 0 ? 0.6 : -0.6) + spot.f * 20

  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime
    const k = Math.max(near.current, hover ? 1 : 0)
    runeMat.emissiveIntensity = 0.9 + k * 2.4 + Math.sin(t * 2 + spot.f * 50) * 0.25
    crystal.current.position.y = 3.35 + Math.sin(t * 1.4 + spot.f * 30) * 0.12
    crystal.current.rotation.y += dt * (0.5 + k)
    ring.current.rotation.z += dt * 0.35
    const s = 1 + (hover ? 0.05 : 0)
    group.current.scale.setScalar(s)
  })

  return (
    <group
      ref={group}
      position={[spot.pos.x, 0, spot.pos.z]}
      rotation={[0, yaw, 0]}
      onClick={(e) => {
        e.stopPropagation()
        select('skill', spot.id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHover(true)
      }}
      onPointerOut={() => setHover(false)}
    >
      <mesh material={mats.rockDark} position={[0, 0.35, 0]} scale={[1.7, 0.7, 1.6]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
      </mesh>
      <mesh material={mats.rock} position={[0, 1.7, 0]} scale={[0.85, 1.9, 0.62]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
      </mesh>
      {/* carved glowing glyph band */}
      <mesh material={runeMat} position={[0, 1.65, 0.58]} scale={[0.34, 0.9, 0.05]}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      <mesh material={runeMat} position={[0, 1.3, 0.6]} rotation={[0, 0, 0.8]} scale={[0.3, 0.07, 0.05]}>
        <boxGeometry args={[1, 1, 1]} />
      </mesh>
      <mesh ref={ring} material={mats.gold} position={[0, 2.75, 0]} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[0.7, 0.04, 8, 28]} />
      </mesh>
      <mesh ref={crystal} material={runeMat} position={[0, 3.35, 0]} scale={[0.32, 0.5, 0.32]}>
        <octahedronGeometry args={[1, 0]} />
      </mesh>
      {(label || hover) && <Label y={4.6} sub="Click to read">{spot.name}</Label>}
    </group>
  )
}

/* --------------------------------------------------------------------------- project books */

export function ProjectBook({ spot }) {
  const mats = getMats()
  const { near, label } = useNearness(spot.pos, 6.5)
  const [hover, setHover] = useState(false)
  useCursor(hover)
  const book = useRef()
  const glow = useRef()
  const coverMat = useMemo(() => new THREE.MeshStandardMaterial({ color: spot.cover, roughness: 0.85, emissive: '#c9a24a', emissiveIntensity: 0 }), [spot])
  const yaw = spot.side > 0 ? -Math.PI / 2 - 0.2 : Math.PI / 2 + 0.2

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const k = Math.max(near.current, hover ? 1 : 0)
    coverMat.emissiveIntensity = k * 0.5
    book.current.position.y = 1.55 + Math.sin(t * 1.6 + spot.f * 40) * 0.05 + k * 0.12
    glow.current.material.opacity = 0.15 + k * 0.55
    glow.current.scale.setScalar(1 + Math.sin(t * 2) * 0.03)
  })

  return (
    <group
      position={[spot.pos.x, 0, spot.pos.z]}
      rotation={[0, yaw, 0]}
      onClick={(e) => {
        e.stopPropagation()
        select('project', spot.id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHover(true)
      }}
      onPointerOut={() => setHover(false)}
    >
      {/* lectern */}
      <mesh material={mats.woodDark} position={[0, 0.1, 0]} receiveShadow>
        <cylinderGeometry args={[0.8, 0.9, 0.2, 10]} />
      </mesh>
      <mesh material={mats.wood} position={[0, 0.65, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.34, 1.1, 8]} />
      </mesh>
      <mesh material={mats.woodLight} position={[0, 1.25, 0]} rotation={[-0.35, 0, 0]} castShadow>
        <boxGeometry args={[1.25, 0.1, 0.9]} />
      </mesh>
      {/* the tome */}
      <group ref={book} position={[0, 1.55, 0.02]} rotation={[-0.35, 0, 0]}>
        <mesh material={coverMat}>
          <boxGeometry args={[1.0, 0.1, 0.72]} />
        </mesh>
        <mesh material={mats.parchment} position={[0, 0.07, 0]}>
          <boxGeometry args={[0.9, 0.06, 0.64]} />
        </mesh>
        <mesh material={mats.gold} position={[0, 0.0, 0.365]}>
          <boxGeometry args={[1.02, 0.11, 0.03]} />
        </mesh>
        {[[-0.5, -0.36], [0.5, -0.36], [-0.5, 0.36], [0.5, 0.36]].map(([x, z], i) => (
          <mesh key={i} material={mats.gold} position={[x, 0.0, z]}>
            <boxGeometry args={[0.1, 0.115, 0.1]} />
          </mesh>
        ))}
      </group>
      {/* candle */}
      <mesh material={mats.candle} position={[0.55, 1.42, -0.2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.2, 6]} />
      </mesh>
      <mesh material={mats.flame} position={[0.55, 1.58, -0.2]}>
        <coneGeometry args={[0.04, 0.13, 5]} />
      </mesh>
      {/* floor glow when approached */}
      <mesh ref={glow} position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.0, 1.25, 40]} />
        <meshBasicMaterial color="#e0be6a" transparent opacity={0.2} depthWrite={false} toneMapped={false} />
      </mesh>
      {(label || hover) && <Label y={2.9} sub="Click to open">{spot.name}</Label>}
    </group>
  )
}

/* ------------------------------------------------------------------- hall artifact pedestals */

const shieldGeo = (() => {
  let g
  return () => {
    if (g) return g
    const s = new THREE.Shape()
    s.moveTo(-0.5, 0.55)
    s.lineTo(0.5, 0.55)
    s.lineTo(0.5, 0.05)
    s.quadraticCurveTo(0.48, -0.45, 0, -0.8)
    s.quadraticCurveTo(-0.48, -0.45, -0.5, 0.05)
    s.closePath()
    g = new THREE.ExtrudeGeometry(s, { depth: 0.08, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2 })
    return g
  }
})()

function Artifact({ type }) {
  const mats = getMats()
  if (type === 'scroll') {
    return (
      <group rotation={[0, 0, Math.PI / 2]}>
        <mesh material={mats.parchment}>
          <cylinderGeometry args={[0.2, 0.2, 1.0, 12]} />
        </mesh>
        {[-0.52, 0.52].map((y) => (
          <mesh key={y} material={mats.gold} position={[0, y, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.08, 10]} />
          </mesh>
        ))}
        <mesh material={mats.banner} position={[0, 0, 0]}>
          <cylinderGeometry args={[0.205, 0.205, 0.08, 12]} />
        </mesh>
      </group>
    )
  }
  if (type === 'medallion') {
    return (
      <group>
        <mesh material={mats.gold} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.55, 0.55, 0.1, 28]} />
        </mesh>
        <mesh material={mats.iron} position={[0, 0, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.04, 28]} />
        </mesh>
        <mesh material={mats.gold} position={[0, 0, 0.1]} scale={[0.24, 0.3, 0.05]}>
          <octahedronGeometry args={[1, 0]} />
        </mesh>
        <mesh material={mats.gold} position={[0, 0.66, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.1, 0.03, 6, 12]} />
        </mesh>
      </group>
    )
  }
  if (type === 'shield') {
    return (
      <group position={[0, 0.1, 0]}>
        <mesh geometry={shieldGeo()} material={mats.gold} scale={[1.15, 1.15, 0.7]} position={[0, 0, -0.03]} />
        <mesh geometry={shieldGeo()} material={mats.banner} scale={[1, 1, 1]} position={[0, 0, 0.02]} />
        <mesh material={mats.gold} position={[0, 0.1, 0.16]} scale={[0.18, 0.3, 0.05]}>
          <octahedronGeometry args={[1, 0]} />
        </mesh>
      </group>
    )
  }
  // banner
  return <Banner pos={[0, 0.2, 0]} w={1.2} h={1.9} sway />
}

export function HallArtifact({ spot }) {
  const mats = getMats()
  const { near, label } = useNearness(spot.pos, 6.5)
  const [hover, setHover] = useState(false)
  useCursor(hover)
  const holder = useRef()
  const ring = useRef()
  const baseY = spot.artifact === 'banner' ? 1.1 : 1.75
  // face the walking line
  const yaw = spot.side > 0 ? -Math.PI / 2 : Math.PI / 2

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const k = Math.max(near.current, hover ? 1 : 0)
    holder.current.position.y = baseY + Math.sin(t * 1.4 + spot.f * 30) * 0.05 + k * 0.1
    ring.current.material.opacity = 0.12 + k * 0.6
    if (spot.artifact === 'medallion') holder.current.rotation.y = Math.sin(t * 0.8) * 0.5
  })

  return (
    <group
      position={[spot.pos.x, 0, spot.pos.z]}
      rotation={[0, yaw, 0]}
      onClick={(e) => {
        e.stopPropagation()
        select('achievement', spot.id)
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHover(true)
      }}
      onPointerOut={() => setHover(false)}
    >
      <mesh material={mats.stoneDark} position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.4, 1.5]} />
      </mesh>
      <mesh material={mats.stone} position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.1, 0.7, 1.1]} />
      </mesh>
      <mesh material={mats.gold} position={[0, 1.08, 0]}>
        <boxGeometry args={[1.25, 0.08, 1.25]} />
      </mesh>
      <group ref={holder} position={[0, baseY, 0]}>
        <Artifact type={spot.artifact} />
      </group>
      <mesh ref={ring} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.4, 40]} />
        <meshBasicMaterial color="#e0be6a" transparent opacity={0.15} depthWrite={false} toneMapped={false} />
      </mesh>
      {(label || hover) && <Label y={3.1} sub="Click for details">{spot.label}</Label>}
    </group>
  )
}
