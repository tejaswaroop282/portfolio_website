import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { getMats } from '../materials'
import { Wall, Torch, Banner, Battlements, Tower, Ribbon, Brazier } from '../primitives'
import { Motes } from '../Environment'
import { world } from '../../hooks/useWorldProgress'
import { F, offsetAt } from '../WorldPath'

/**
 * LOCATION 5 — THE NORTHERN GATE.
 * A great wall across the road at z=-206, opening at x∈[-51.5,-40.5]. The explorer ends the journey on the road
 * before it at sunset; at the very end of the scroll the great doors swing open on the glow beyond.
 */

const X = -46
const Z = -206
const OPEN = 5.5 // half-width of the opening
const GATE_H = 11
const WALL_H = 15
const smooth = (a, b, v) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

const glowTex = (() => {
  let t
  return () => {
    if (t) return t
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const g = c.getContext('2d')
    const r = g.createRadialGradient(64, 78, 4, 64, 70, 64)
    r.addColorStop(0, 'rgba(255,236,190,1)')
    r.addColorStop(0.35, 'rgba(255,170,90,0.75)')
    r.addColorStop(1, 'rgba(255,120,50,0)')
    g.fillStyle = r
    g.fillRect(0, 0, 128, 128)
    t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }
})()

function Doors() {
  const mats = getMats()
  const left = useRef()
  const right = useRef()
  const glow = useRef()
  useFrame(() => {
    const open = smooth(0.975, 1.0, world.target)
    const a = open * 1.4
    left.current.rotation.y = -a
    right.current.rotation.y = a
    glow.current.material.opacity = open * 0.9
  })
  const leaf = (
    <>
      <mesh material={mats.wood} position={[0, GATE_H / 2, 0]} castShadow>
        <boxGeometry args={[OPEN, GATE_H, 0.6]} />
      </mesh>
      {[1.5, 4.2, 7.0, 9.8].map((y) => (
        <mesh key={y} material={mats.iron} position={[0, y, 0.34]}>
          <boxGeometry args={[OPEN, 0.4, 0.1]} />
        </mesh>
      ))}
      {[-1.8, 0, 1.8].map((x) => (
        <mesh key={x} material={mats.iron} position={[x, GATE_H / 2, 0.34]}>
          <boxGeometry args={[0.16, GATE_H, 0.1]} />
        </mesh>
      ))}
    </>
  )
  return (
    <group position={[X, 0, Z + 0.5]}>
      {/* the light spilling through the gate once it opens */}
      <mesh ref={glow} position={[0, GATE_H / 2 + 1, -2.5]}>
        <planeGeometry args={[OPEN * 3.4, GATE_H + 8]} />
        <meshBasicMaterial map={glowTex()} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} />
      </mesh>
      <group ref={left} position={[-OPEN, 0, 0]}>
        <group position={[OPEN / 2, 0, 0]}>{leaf}</group>
      </group>
      <group ref={right} position={[OPEN, 0, 0]}>
        <group position={[-OPEN / 2, 0, 0]}>{leaf}</group>
      </group>
    </group>
  )
}

export default function NorthernGate({ lite }) {
  const mats = getMats()
  const props = useMemo(() => {
    const torches = []
    for (let i = 0; i < 6; i++) {
      const f = F(19.2) + ((F(21) - F(19.2)) * i) / 5
      torches.push(offsetAt(f, i % 2 ? 3.6 : -3.6))
    }
    return { torches, b1: offsetAt(F(21), 4.6), b2: offsetAt(F(21), -4.6) }
  }, [])
  const TW = OPEN + 5.5 // tower centre offset
  return (
    <group>
      {/* long wall both sides of the opening */}
      <Wall pos={[X - OPEN - 28, 0, Z]} size={[56, WALL_H, 6]} shadow />
      <Wall pos={[X + OPEN + 28, 0, Z]} size={[56, WALL_H, 6]} shadow />
      <Battlements from={[X - OPEN - 56, Z]} to={[X - OPEN, Z]} y={WALL_H} count={28} size={[1.4, 1.6, 1.6]} />
      <Battlements from={[X + OPEN, Z]} to={[X + OPEN + 56, Z]} y={WALL_H} count={28} size={[1.4, 1.6, 1.6]} />

      {/* lintel, arch ring and keystone */}
      <Wall pos={[X, GATE_H, Z]} size={[OPEN * 2 + 1.2, WALL_H - GATE_H, 6.4]} mat="stoneDark" shadow />
      <mesh material={mats.stoneDark} position={[X, GATE_H, Z + 3.3]}>
        <torusGeometry args={[OPEN, 0.55, 8, 28, Math.PI]} />
      </mesh>
      <mesh material={mats.gold} position={[X, GATE_H + 0.2, Z + 3.5]} scale={[0.5, 0.9, 0.15]}>
        <octahedronGeometry args={[1, 0]} />
      </mesh>
      <Wall pos={[X - OPEN - 0.5, 0, Z + 3.3]} size={[1.2, GATE_H, 0.8]} mat="stoneDark" />
      <Wall pos={[X + OPEN + 0.5, 0, Z + 3.3]} size={[1.2, GATE_H, 0.8]} mat="stoneDark" />

      {/* flanking towers */}
      <Tower pos={[X - TW, 0, Z]} r={5.5} h={26} roof={10} />
      <Tower pos={[X + TW, 0, Z]} r={5.5} h={26} roof={10} />
      <Tower pos={[X - 52, 0, Z]} r={4.2} h={21} roof={8} />
      <Tower pos={[X + 52, 0, Z]} r={4.2} h={21} roof={8} />
      <Banner pos={[X - TW, 24, Z + 5.7]} rot={0} h={11} w={3.2} />
      <Banner pos={[X + TW, 24, Z + 5.7]} rot={0} h={11} w={3.2} mat="bannerGreen" />
      <Doors />

      {/* the final road: torches and braziers lead to the gate */}
      <Ribbon fromWp={18.8} toWp={21} width={4.2} y={0.05} mat="stoneDark" />
      <Wall pos={[-45, 0, -196.5]} size={[4.2, 0.1, 19]} mat="stoneDark" tile={4} />
      {props.torches.map((p, i) => (
        <Torch key={i} pos={[p.x, 0, p.z]} height={2.8} />
      ))}
      <Brazier pos={[props.b1.x, 0, props.b1.z]} scale={1.3} />
      <Brazier pos={[props.b2.x, 0, props.b2.z]} scale={1.3} />
      <Motes center={[X, 6, -190]} size={[26, 12, 30]} count={lite ? 40 : 110} color="#ffc27a" pointSize={0.11} speed={0.09} />
    </group>
  )
}
