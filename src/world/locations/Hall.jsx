import { useMemo } from 'react'
import { getMats } from '../materials'
import { Wall, Torch, Banner, Battlements, Tower, Floor, Ribbon, Column, Brazier, Chandelier, LightShaft } from '../primitives'
import { Motes } from '../Environment'
import { HallArtifact } from '../InteractiveObjects'
import { hallSpots } from '../journey'

/**
 * LOCATION 4 — THE HALL OF ACHIEVEMENTS (throne hall).
 * Footprint x[-58,-34] z[-158,-113]. South door and north archway at x∈[-50,-42] so the explorer walks
 * straight through. Each milestone is a collectible artifact on a pedestal beside the walking line.
 */

const H = 19

function Throne({ pos }) {
  const mats = getMats()
  return (
    <group position={pos} rotation={[0, Math.PI / 2, 0]}>
      {[0, 1, 2].map((i) => (
        <Wall key={i} pos={[0, i * 0.35, -i * 0.9]} size={[7 - i * 1.4, 0.35, 5 - i * 0.9]} mat="stoneDark" shadow />
      ))}
      <group position={[0, 1.05, -1.4]}>
        <mesh material={mats.woodDark} position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[1.9, 0.9, 1.5]} />
        </mesh>
        <mesh material={mats.woodDark} position={[0, 2.9, -0.6]} castShadow>
          <boxGeometry args={[1.9, 3.4, 0.3]} />
        </mesh>
        {[-0.95, 0.95].map((x) => (
          <mesh key={x} material={mats.woodDark} position={[x, 1.45, 0]}>
            <boxGeometry args={[0.25, 0.7, 1.5]} />
          </mesh>
        ))}
        {[-0.7, -0.35, 0, 0.35, 0.7].map((x, i) => (
          <mesh key={x} material={mats.gold} position={[x, 4.9 + (i === 2 ? 0.5 : i % 2 ? 0 : 0.25), -0.6]}>
            <coneGeometry args={[0.14, 0.9, 4]} />
          </mesh>
        ))}
        <mesh material={mats.gold} position={[0, 3.1, -0.42]} scale={[0.5, 0.7, 0.06]}>
          <octahedronGeometry args={[1, 0]} />
        </mesh>
        <mesh material={mats.banner} position={[0, 1.3, 0.2]}>
          <boxGeometry args={[1.5, 0.08, 1.2]} />
        </mesh>
      </group>
    </group>
  )
}

function Windows() {
  const mats = getMats()
  const zs = [-122, -131, -140, -149]
  return (
    <group>
      {zs.map((z) =>
        [-57.05, -34.95].map((x, i) => (
          <group key={z + '' + x} position={[x, 0, z]} rotation={[0, i ? -Math.PI / 2 : Math.PI / 2, 0]}>
            <mesh material={mats.window} position={[0, 7.2, 0]}>
              <planeGeometry args={[2.4, 8.4]} />
            </mesh>
            <mesh material={mats.window} position={[0, 11.4, 0]}>
              <circleGeometry args={[1.2, 16, 0, Math.PI]} />
            </mesh>
            {[-0.6, 0.6].map((dx) => (
              <mesh key={dx} material={mats.iron} position={[dx, 7.2, 0.02]}>
                <boxGeometry args={[0.1, 8.4, 0.05]} />
              </mesh>
            ))}
            <mesh material={mats.iron} position={[0, 7.6, 0.02]}>
              <boxGeometry args={[2.4, 0.1, 0.05]} />
            </mesh>
          </group>
        )),
      )}
    </group>
  )
}

export default function Hall({ lite }) {
  const cols = useMemo(() => {
    const out = []
    for (let z = -120; z >= -152; z -= 8) out.push([-55.4, z], [-36.6, z])
    return out
  }, [])
  return (
    <group>
      <Floor x0={-57} x1={-35} z0={-158} z1={-113} />
      <Ribbon fromWp={15} toWp={18.6} width={3.4} y={0.06} mat="carpet" />
      <Ribbon fromWp={15} toWp={18.6} width={0.18} y={0.065} mat="gold" offset={1.55} />
      <Ribbon fromWp={15} toWp={18.6} width={0.18} y={0.065} mat="gold" offset={-1.55} />

      {/* walls: side walls solid, south wall with door, north wall with archway */}
      <Wall pos={[-58, 0, -135.5]} size={[2, H, 46]} shadow />
      <Wall pos={[-34.8, 0, -135.5]} size={[2, H, 46]} shadow />
      <Wall pos={[-54, 0, -113]} size={[10, H, 2]} shadow />
      <Wall pos={[-38.5, 0, -113]} size={[7, H, 2]} shadow />
      <Wall pos={[-46, 12, -113]} size={[9, 7, 2]} mat="stoneDark" shadow />
      <Wall pos={[-54, 0, -158]} size={[10, H, 2]} shadow />
      <Wall pos={[-38.5, 0, -158]} size={[7, H, 2]} shadow />
      <Wall pos={[-46, 12, -158]} size={[9, 7, 2]} mat="stoneDark" shadow />
      <Battlements from={[-58, -158]} to={[-58, -113]} y={H} count={20} />
      <Battlements from={[-34.8, -158]} to={[-34.8, -113]} y={H} count={20} />
      <Tower pos={[-58, 0, -113]} r={3.4} h={24} roof={8} />
      <Tower pos={[-58, 0, -158]} r={3.4} h={24} roof={8} />
      <Tower pos={[-34.8, 0, -158]} r={3.4} h={24} roof={8} />

      <Windows />
      {cols.map(([x, z], i) => (
        <Column key={i} pos={[x, 0, z]} r={0.85} h={13.5} />
      ))}

      {/* hanging banners between the columns */}
      {[-124, -132, -140, -148].map((z, i) => (
        <group key={z}>
          <Banner pos={[-54.6, 15.5, z]} rot={Math.PI / 2} h={7} w={2.2} mat={i % 2 ? 'bannerGreen' : 'banner'} />
          <Banner pos={[-36.2, 15.5, z]} rot={-Math.PI / 2} h={7} w={2.2} mat={i % 2 ? 'bannerGreen' : 'banner'} />
        </group>
      ))}
      <Banner pos={[-46, 17, -112.3]} rot={Math.PI} h={9} w={3} />

      {/* roof timbers */}
      {[-118, -128, -138, -148].map((z) => (
        <mesh key={z} material={getMats().woodDark} position={[-46, 16.6, z]}>
          <boxGeometry args={[24, 0.9, 0.9]} />
        </mesh>
      ))}
      {[-130, -146].map((z, i) => (
        <Chandelier key={i} pos={[-46, 10.5, z]} r={1.8} candles={12} />
      ))}

      <Throne pos={[-55.6, 0, -135]} />
      {[[-52.5, -124], [-39.5, -124], [-52.5, -150], [-39.5, -150]].map(([x, z], i) => (
        <Brazier key={i} pos={[x, 0, z]} scale={1.2} />
      ))}
      {[[-57.2, -118], [-34.8, -118]].map(([x, z], i) => (
        <Torch key={i} pos={[x + (i ? -1 : 1), 0, z]} height={3} />
      ))}

      {/* golden shafts of light falling through the tall windows */}
      {[-122, -131, -140, -149].map((z, i) => (
        <LightShaft key={z} pos={[-50.2 + (i % 2) * 0.8, 8, z]} rot={[0, Math.PI / 2, -0.55]} w={3.2} h={20} opacity={0.55} />
      ))}
      {[-122, -131, -140, -149].map((z, i) => (
        <LightShaft key={'b' + z} pos={[-41.8 - (i % 2) * 0.8, 8, z]} rot={[0, Math.PI / 2, 0.55]} w={3.2} h={20} opacity={0.45} />
      ))}

      <Motes center={[-46, 5, -136]} size={[20, 10, 40]} count={lite ? 40 : 120} color="#ffe0a0" pointSize={0.1} speed={0.07} />

      {hallSpots.map((h) => (
        <HallArtifact key={h.id} spot={h} />
      ))}
    </group>
  )
}
