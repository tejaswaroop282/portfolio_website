import { useMemo } from 'react'
import { getMats, rng } from '../materials'
import { Cyl, Wall, Torch } from '../primitives'
import { Motes } from '../Environment'
import { SkillStone } from '../InteractiveObjects'
import { stoneSpots } from '../journey'
import { F, offsetAt, posAt, tanAt } from '../WorldPath'

/**
 * LOCATION 2 — THE ENCHANTED FOREST.
 * Trees/rocks/river are global instanced scenery (Environment.jsx). Here: ancient ruins, the bridge and
 * the six glowing skill stones the explorer walks between.
 */

function Ruins() {
  const items = useMemo(() => {
    const r = rng(31)
    const out = []
    for (let i = 0; i < 9; i++) {
      const f = F(5.0) + (F(7.0) - F(5.0)) * (i / 8)
      const side = (i % 2 ? 1 : -1) * (9.5 + r() * 3)
      const p = offsetAt(f, side)
      out.push({ p, h: 2.2 + r() * 4.5, r: 0.6 + r() * 0.3, broken: r() > 0.5, ry: r() * 6 })
    }
    return out
  }, [])
  const arch = useMemo(() => {
    const f = F(6.35)
    return { a: offsetAt(f, -12.5), b: offsetAt(f, -17.5), yaw: Math.atan2(tanAt(f).x, tanAt(f).z) }
  }, [])
  return (
    <group>
      {items.map((it, i) => (
        <group key={i} position={[it.p.x, 0, it.p.z]} rotation={[0, it.ry, 0]}>
          <Cyl r={it.r} h={it.h} mat="stoneDark" seg={8} shadow />
          <Cyl r={it.r * 1.25} rTop={it.r * 1.25} h={0.4} mat="stone" seg={8} />
          {it.broken && (
            <mesh material={getMats().stoneDark} position={[1.1, 0.35, 0.6]} rotation={[0.4, 0.5, 1.4]} castShadow>
              <cylinderGeometry args={[it.r * 0.95, it.r * 0.95, 1.6, 8]} />
            </mesh>
          )}
        </group>
      ))}
      {/* a ruined archway */}
      <group rotation={[0, arch.yaw, 0]} position={[(arch.a.x + arch.b.x) / 2, 0, (arch.a.z + arch.b.z) / 2]}>
        <Wall pos={[-2.2, 0, 0]} size={[1.2, 7, 1.2]} mat="stoneDark" shadow />
        <Wall pos={[2.2, 0, 0]} size={[1.2, 5.2, 1.2]} mat="stoneDark" shadow />
        <Wall pos={[-0.4, 7, 0]} size={[3.8, 0.9, 1.2]} mat="stone" shadow />
        <Wall pos={[3.8, 0, 1.6]} size={[1.4, 0.8, 1.2]} mat="stone" />
        <Wall pos={[4.6, 0, -0.8]} size={[1, 0.5, 1]} mat="stoneDark" />
      </group>
    </group>
  )
}

function Bridge() {
  const mats = getMats()
  const { pos, yaw } = useMemo(() => {
    const f = F(7)
    const p = posAt(f)
    const t = tanAt(f)
    return { pos: p, yaw: Math.atan2(t.x, t.z) }
  }, [])
  return (
    <group position={[pos.x, 0, pos.z]} rotation={[0, yaw, 0]}>
      {/* deck (local +z = direction of travel) */}
      <mesh material={mats.woodLight} position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.4, 0.28, 13]} />
      </mesh>
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh key={i} material={mats.woodDark} position={[0, 0.28, -5.9 + i * 1.07]}>
          <boxGeometry args={[3.5, 0.06, 0.08]} />
        </mesh>
      ))}
      {[-1.65, 1.65].map((x) => (
        <group key={x}>
          <mesh material={mats.wood} position={[x, 1.0, 0]}>
            <boxGeometry args={[0.14, 0.14, 12.6]} />
          </mesh>
          {Array.from({ length: 7 }).map((_, i) => (
            <mesh key={i} material={mats.wood} position={[x, 0.55, -6 + i * 2]} castShadow>
              <boxGeometry args={[0.18, 1.1, 0.18]} />
            </mesh>
          ))}
        </group>
      ))}
      {[-6.2, 6.2].map((z) => (
        <group key={z} position={[0, 0, z]}>
          <Wall pos={[0, -1.4, 0]} size={[4.2, 1.7, 1.6]} mat="stoneDark" shadow />
          <Torch pos={[1.9, 0.25, 0.7]} height={1.9} />
        </group>
      ))}
    </group>
  )
}

export default function Forest({ lite }) {
  return (
    <group>
      <Ruins />
      <Bridge />
      {stoneSpots.map((s) => (
        <SkillStone key={s.id} spot={s} />
      ))}
      <Motes center={[46, 2.2, -38]} size={[46, 5, 56]} count={lite ? 70 : 170} color="#c9f0a6" />
      <Motes center={[44, 3.2, -22]} size={[36, 6, 30]} count={lite ? 30 : 80} color="#9fd8e6" pointSize={0.12} speed={0.1} />
    </group>
  )
}
