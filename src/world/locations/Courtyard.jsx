import { useMemo } from 'react'
import { getMats } from '../materials'
import { Wall, Cyl, Torch, Banner, Battlements, Tower, Floor, Ribbon, Barrel, Crate, Gable } from '../primitives'
import { posAt, F } from '../WorldPath'

/**
 * LOCATION 1 — THE KING'S LANDING (courtyard of an original fortress).
 * Footprint x[-30,33] z[-14,42]. The explorer starts at (0,12), looks back at the keep (south-west of him
 * in the opening shot) and leaves through the great east gate at x=33.
 */

const WALL_H = 9
const T = 2.4

function Window({ pos, rot = 0 }) {
  return (
    <mesh material={getMats().window} position={pos} rotation={[0, rot, 0]}>
      <planeGeometry args={[0.7, 1.5]} />
    </mesh>
  )
}

function Keep() {
  // keep body x[-25,-3] z[17,35], front (courtyard) face looks toward -z
  const cx = -14
  const cz = 26
  const wins = useMemo(() => {
    const out = []
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 6; c++) out.push([cx - 9.2 + c * 3.7, 6 + r * 4.2, 17 - 0.06])
    }
    return out
  }, [cx])
  const wins2 = useMemo(() => {
    const out = []
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) out.push([-3 + 0.06, 6 + r * 4.2, 19.5 + c * 4.4])
    return out
  }, [])
  return (
    <group>
      <Wall pos={[cx, 0, cz]} size={[22, 22, 18]} shadow />
      {/* lower plinth and buttresses */}
      <Wall pos={[cx, 0, 16.2]} size={[24, 2.2, 1.6]} mat="stoneDark" />
      {[-24, -19, -9, -4].map((x) => (
        <Wall key={x} pos={[x, 0, 16.2]} size={[1.4, 14, 1.4]} mat="stoneDark" />
      ))}
      {/* crown of the keep */}
      <Wall pos={[cx, 22, cz]} size={[23.4, 1.4, 19.4]} mat="stoneDark" />
      <Battlements from={[cx - 11.4, 16.5]} to={[cx + 11.4, 16.5]} y={23.4} count={13} />
      <Battlements from={[cx - 11.4, 35.5]} to={[cx + 11.4, 35.5]} y={23.4} count={13} />
      <Battlements from={[cx - 11.4, 17]} to={[cx - 11.4, 35]} y={23.4} count={10} />
      <Battlements from={[cx + 11.4, 17]} to={[cx + 11.4, 35]} y={23.4} count={10} />
      {/* great central tower */}
      <Tower pos={[cx, 23, cz]} r={5} h={13} roof={9} />
      {[[-25, 17], [-3, 17], [-25, 35], [-3, 35]].map(([x, z], i) => (
        <Tower key={i} pos={[x, 0, z]} r={2.7} h={26} roof={7} />
      ))}
      {/* great door: dark arch with gold trim, facing the courtyard */}
      <mesh material={getMats().dark} position={[cx, 3.4, 16.9]}>
        <planeGeometry args={[5.2, 6.8]} />
      </mesh>
      <mesh material={getMats().dark} position={[cx, 6.8, 16.9]}>
        <circleGeometry args={[2.6, 20, 0, Math.PI]} />
      </mesh>
      <Wall pos={[cx - 2.9, 0, 16.4]} size={[0.6, 7.4, 1]} mat="stoneDark" />
      <Wall pos={[cx + 2.9, 0, 16.4]} size={[0.6, 7.4, 1]} mat="stoneDark" />
      <Wall pos={[cx, 7.4, 16.4]} size={[6.4, 0.7, 1]} mat="stoneDark" />
      {wins.map((p, i) => (
        <Window key={i} pos={p} rot={Math.PI} />
      ))}
      {wins2.map((p, i) => (
        <Window key={i} pos={p} rot={-Math.PI / 2} />
      ))}
      <Banner pos={[cx - 7.5, 8, 16.2]} rot={Math.PI} h={7.5} w={2.2} />
      <Banner pos={[cx + 7.5, 8, 16.2]} rot={Math.PI} h={7.5} w={2.2} mat="bannerGreen" />
    </group>
  )
}

function CurtainWalls() {
  return (
    <group>
      {/* south, north, west, east (east leaves the gate gap) */}
      <Wall pos={[1.5, 0, -14]} size={[63, WALL_H, T]} shadow />
      <Wall pos={[1.5, 0, 42]} size={[63, WALL_H, T]} shadow />
      <Wall pos={[-30, 0, 14]} size={[T, WALL_H, 56]} shadow />
      <Wall pos={[33, 0, 22.5]} size={[T, WALL_H, 38]} shadow />
      <Battlements from={[-29, -14]} to={[32, -14]} y={WALL_H} count={33} />
      <Battlements from={[-29, 42]} to={[32, 42]} y={WALL_H} count={33} />
      <Battlements from={[-30, -12]} to={[-30, 40]} y={WALL_H} count={28} />
      <Battlements from={[33, 3.8]} to={[33, 41]} y={WALL_H} count={20} />
      {[[-30, -14], [-30, 42], [33, 42]].map(([x, z], i) => (
        <Tower key={i} pos={[x, 0, z]} r={4} h={15} roof={6} />
      ))}
    </group>
  )
}

function Gatehouse() {
  const mats = getMats()
  // opening between towers: z in (-10.3, -2.7), path crosses at z ≈ -6.5
  return (
    <group>
      <Tower pos={[33, 0, -13.5]} r={4} h={17} roof={7} />
      <Tower pos={[33, 0, 0.5]} r={4} h={17} roof={7} />
      <Wall pos={[33, 8, -6.5]} size={[T + 0.6, 3.2, 8]} mat="stoneDark" shadow />
      <Battlements from={[33, -10]} to={[33, -3]} y={11.2} count={5} />
      {/* arch ring */}
      <mesh material={mats.stoneDark} position={[33, 8, -6.5]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[3.7, 0.35, 8, 20, Math.PI]} />
      </mesh>
      {/* raised portcullis */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} material={mats.iron} position={[32.4, 8.6, -9.2 + i * 0.5 + 1.4]}>
          <boxGeometry args={[0.1, 2.0, 0.1]} />
        </mesh>
      ))}
      <mesh material={mats.iron} position={[32.4, 9.2, -6.5]}>
        <boxGeometry args={[0.1, 0.1, 5.4]} />
      </mesh>
      {/* two open gate leaves folded back against the towers */}
      {[-1, 1].map((s) => (
        <group key={s} position={[33.8, 0, -6.5 + s * 3.7]} rotation={[0, s * 1.2, 0]}>
          <mesh material={mats.wood} position={[0, 3.6, -s * 1.7]} castShadow>
            <boxGeometry args={[0.35, 7.2, 3.4]} />
          </mesh>
          {[1.4, 3.6, 5.8].map((y) => (
            <mesh key={y} material={mats.iron} position={[0.2, y, -s * 1.7]}>
              <boxGeometry args={[0.08, 0.3, 3.4]} />
            </mesh>
          ))}
        </group>
      ))}
      <Banner pos={[35.6, 11, -13.5]} rot={Math.PI / 2} h={6} w={1.8} />
      <Banner pos={[35.6, 11, 0.5]} rot={Math.PI / 2} h={6} w={1.8} mat="bannerGreen" />
      <Torch pos={[31.2, 0, -10.6]} height={2.6} />
      <Torch pos={[31.2, 0, -2.4]} height={2.6} />
    </group>
  )
}

function Outbuildings() {
  return (
    <group>
      {/* barracks along the south-west wall */}
      <Wall pos={[-17, 0, -9]} size={[16, 6, 7]} mat="stoneDark" shadow />
      <Gable pos={[-17, 6, -9]} w={8} d={16} h={3.4} rot={Math.PI / 2} />
      {/* stable with wooden walls */}
      <Wall pos={[20, 0, 34]} size={[14, 4.5, 6]} mat="woodDark" shadow />
      <Gable pos={[20, 4.5, 34]} w={7} d={14} h={3} rot={Math.PI / 2} />
    </group>
  )
}

function Props() {
  const mats = getMats()
  const poles = useMemo(() => {
    const out = []
    for (const wp of [0.4, 1.3, 2.2]) {
      const f = F(wp)
      const p = posAt(f)
      const q = posAt(Math.min(1, f + 0.004))
      const dx = q.x - p.x
      const dz = q.z - p.z
      const l = Math.hypot(dx, dz)
      out.push([p.x - (dz / l) * 5.2, p.z + (dx / l) * 5.2, 0], [p.x + (dz / l) * 5.2, p.z - (dx / l) * 5.2, 1])
    }
    return out
  }, [])
  return (
    <group>
      {/* the well */}
      <group position={[14, 0, 24]}>
        <Cyl r={1.5} h={1.1} mat="stoneDark" seg={14} shadow />
        <mesh material={mats.water} position={[0, 1.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[1.15, 14]} />
        </mesh>
        {[-1.35, 1.35].map((x) => (
          <Wall key={x} pos={[x, 1, 0]} size={[0.25, 2.8, 0.25]} mat="woodDark" />
        ))}
        <mesh material={mats.slate} position={[0, 4.2, 0]}>
          <coneGeometry args={[2.3, 1.3, 4]} />
        </mesh>
      </group>
      {poles.map(([x, z, g], i) => (
        <group key={i} position={[x, 0, z]}>
          <Cyl r={0.12} h={4.6} mat="woodDark" seg={6} />
          <Banner pos={[0, 4.4, 0]} rot={0.6} h={3} w={1.1} mat={g ? 'bannerGreen' : 'banner'} />
        </group>
      ))}
      {[[-8, -11], [8, -12.2], [-26, 6], [-26, 26], [29, 12], [29, 30], [-8, 39.8], [20, 39.8]].map(([x, z], i) => (
        <Torch key={i} pos={[x, 0, z]} height={2.2 + (i % 2) * 0.4} />
      ))}
      {[[-20, 0.5], [-19, 1.7], [-20.5, 2.2], [24, 38], [25.4, 38.4], [-27, 14], [-27, 15.2]].map(([x, z], i) => (
        <Barrel key={i} pos={[x, 0, z]} />
      ))}
      {[[-23, -4], [-22, -4.2], [5, 38.5], [6.1, 38.8], [-28, 31]].map(([x, z], i) => (
        <Crate key={i} pos={[x, 0, z]} rot={i} size={0.9 + (i % 2) * 0.3} />
      ))}
      {/* wooden cart */}
      <group position={[-6, 0, 6]} rotation={[0, 0.5, 0]}>
        <mesh material={mats.wood} position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[2.6, 0.5, 1.4]} />
        </mesh>
        {[-0.7, 0.7].map((z) => (
          <mesh key={z} material={mats.woodDark} position={[0.2, 0.6, z * 1.0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 0.1, 12]} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export default function Courtyard() {
  return (
    <group>
      <Floor x0={-29} x1={32} z0={-13} z1={41} />
      <Ribbon fromWp={0} toWp={3.5} width={3.4} mat="stoneDark" y={0.05} />
      <CurtainWalls />
      <Gatehouse />
      <Keep />
      <Outbuildings />
      <Props />
    </group>
  )
}

