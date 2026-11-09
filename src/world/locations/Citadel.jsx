import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getMats, rng } from '../materials'
import { Wall, Cyl, Torch, Banner, Battlements, Tower, Floor, Ribbon, Column, Chandelier, Barrel, Crate } from '../primitives'
import { Motes } from '../Environment'
import { ProjectBook } from '../InteractiveObjects'
import { bookSpots } from '../journey'

/**
 * LOCATION 3 — THE CITADEL (fortress, ancient library and engineering workshop).
 * Footprint x[-36,46] z[-126,-78]. Enter by the south door (x≈36), walk west through the library, leave
 * by the west door (z≈-106). The five project tomes stand on lecterns beside the walking line.
 */

const H = 16
const T = 3

/** All the book spines on all the shelves — one instanced mesh. */
function Shelves({ list }) {
  const ref = useRef()
  const books = useMemo(() => {
    const r = rng(5)
    const out = []
    const palette = ['#5a2d27', '#2d3b4a', '#3b4a2d', '#6b5a2a', '#2e2320', '#4a3a55', '#7a6a4a']
    for (const s of list) {
      for (let row = 0; row < 5; row++) {
        let x = -s.w / 2 + 0.3
        while (x < s.w / 2 - 0.3) {
          const w = 0.14 + r() * 0.18
          const h = 0.8 + r() * 0.5
          out.push({ s, x: x + w / 2, y: 0.55 + row * 1.35 + h / 2, w, h, c: palette[Math.floor(r() * palette.length)] })
          x += w + 0.02
        }
      }
    }
    return out
  }, [list])
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const c = new THREE.Color()
    const e = new THREE.Euler()
    books.forEach((b, i) => {
      e.set(0, b.s.rot, 0)
      const q = new THREE.Quaternion().setFromEuler(e)
      const local = new THREE.Vector3(b.x, b.y, 0.05).applyQuaternion(q)
      m.compose(new THREE.Vector3(b.s.x + local.x, local.y, b.s.z + local.z), q, new THREE.Vector3(b.w, b.h, 0.62))
      ref.current.setMatrixAt(i, m)
      ref.current.setColorAt(i, c.set(b.c))
    })
    ref.current.instanceMatrix.needsUpdate = true
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true
  }, [books])
  const mats = getMats()
  return (
    <group>
      {list.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]} rotation={[0, s.rot, 0]}>
          <mesh material={mats.woodDark} position={[0, 3.6, -0.2]} castShadow receiveShadow>
            <boxGeometry args={[s.w, 7.2, 0.4]} />
          </mesh>
          {[-s.w / 2, s.w / 2].map((x) => (
            <mesh key={x} material={mats.wood} position={[x, 3.6, 0.35]}>
              <boxGeometry args={[0.25, 7.2, 1.0]} />
            </mesh>
          ))}
          {[0.2, 1.55, 2.9, 4.25, 5.6, 7.1].map((y) => (
            <mesh key={y} material={mats.wood} position={[0, y, 0.35]}>
              <boxGeometry args={[s.w, 0.12, 1.0]} />
            </mesh>
          ))}
        </group>
      ))}
      <instancedMesh key={books.length} ref={ref} args={[undefined, undefined, books.length]} castShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
    </group>
  )
}

function Gear({ pos, r = 0.7, teeth = 12, speed = 0.5, mat = 'gold' }) {
  const ref = useRef()
  const m = getMats()[mat]
  useFrame((_, dt) => {
    ref.current.rotation.y += dt * speed
  })
  return (
    <group ref={ref} position={pos}>
      <mesh material={m}>
        <cylinderGeometry args={[r, r, 0.14, teeth * 2]} />
      </mesh>
      {Array.from({ length: teeth }).map((_, i) => {
        const a = (i / teeth) * Math.PI * 2
        return (
          <mesh key={i} material={m} position={[Math.sin(a) * (r + 0.07), 0, Math.cos(a) * (r + 0.07)]} rotation={[0, a, 0]}>
            <boxGeometry args={[0.16, 0.14, 0.16]} />
          </mesh>
        )
      })}
      <mesh material={getMats().iron}>
        <cylinderGeometry args={[r * 0.22, r * 0.22, 0.22, 8]} />
      </mesh>
    </group>
  )
}

function Armillary({ pos }) {
  const mats = getMats()
  const a = useRef()
  const b = useRef()
  const c = useRef()
  useFrame((_, dt) => {
    a.current.rotation.y += dt * 0.3
    b.current.rotation.x += dt * 0.22
    c.current.rotation.z += dt * 0.15
  })
  return (
    <group position={pos}>
      <Cyl r={0.9} h={0.3} mat="stoneDark" seg={10} />
      <Cyl r={0.18} h={1.4} mat="woodDark" seg={8} pos={[0, 0.3, 0]} />
      <group position={[0, 2.6, 0]}>
        <mesh ref={a} material={mats.gold}>
          <torusGeometry args={[1.3, 0.04, 6, 36]} />
        </mesh>
        <mesh ref={b} material={mats.gold} rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[1.05, 0.04, 6, 36]} />
        </mesh>
        <mesh ref={c} material={mats.gold} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.04, 6, 36]} />
        </mesh>
        <mesh material={mats.rune}>
          <sphereGeometry args={[0.2, 12, 10]} />
        </mesh>
      </group>
    </group>
  )
}

function Table({ pos, rot = 0, len = 7 }) {
  const mats = getMats()
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh material={mats.wood} position={[0, 1.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[len, 0.18, 1.8]} />
      </mesh>
      {[-len / 2 + 0.4, len / 2 - 0.4].map((x) =>
        [-0.7, 0.7].map((z) => (
          <mesh key={x + '' + z} material={mats.woodDark} position={[x, 0.5, z]}>
            <boxGeometry args={[0.2, 1, 0.2]} />
          </mesh>
        )),
      )}
      {[-1.6, 1.6].map((z) => (
        <mesh key={z} material={mats.woodDark} position={[0, 0.55, z]}>
          <boxGeometry args={[len - 0.6, 0.12, 0.5]} />
        </mesh>
      ))}
      {/* candles and loose parchment */}
      {[-len * 0.3, 0, len * 0.3].map((x, i) => (
        <group key={i} position={[x, 1.14, i % 2 ? 0.3 : -0.3]}>
          <mesh material={mats.candle} position={[0, 0.16, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.32, 6]} />
          </mesh>
          <mesh material={mats.flame} position={[0, 0.4, 0]}>
            <coneGeometry args={[0.05, 0.16, 5]} />
          </mesh>
        </group>
      ))}
      <mesh material={mats.parchment} position={[len * 0.15, 1.15, 0.2]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.8, 0.02, 0.55]} />
      </mesh>
    </group>
  )
}

function Forge({ pos }) {
  const mats = getMats()
  const glow = useRef()
  useFrame(({ clock }) => {
    glow.current.material.emissiveIntensity = 1.6 + Math.sin(clock.elapsedTime * 7) * 0.4
  })
  return (
    <group position={pos}>
      <Wall pos={[0, 0, 0]} size={[3.2, 1.2, 2.4]} mat="stoneDark" shadow />
      <mesh ref={glow} position={[0, 1.22, 0]}>
        <boxGeometry args={[2.4, 0.1, 1.6]} />
        <meshStandardMaterial color="#2a0e04" emissive="#ff6a1a" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      <Wall pos={[0, 1.2, -1.1]} size={[3.2, 3.6, 0.5]} mat="stoneDark" />
      {/* anvil */}
      <group position={[3.6, 0, 0.4]}>
        <Cyl r={0.6} h={0.7} mat="woodDark" seg={8} />
        <mesh material={mats.iron} position={[0, 1.0, 0]}>
          <boxGeometry args={[1.5, 0.35, 0.5]} />
        </mesh>
        <mesh material={mats.iron} position={[0.95, 1.05, 0]} rotation={[0, 0, -0.3]}>
          <coneGeometry args={[0.2, 0.7, 4]} />
        </mesh>
      </group>
    </group>
  )
}

function Workbench({ pos }) {
  return (
    <group position={pos}>
      <Table pos={[0, 0, 0]} len={6} />
      <Gear pos={[-1.2, 1.3, 0]} r={0.6} speed={0.6} />
      <Gear pos={[-0.05, 1.3, 0.02]} r={0.45} speed={-0.8} mat="iron" />
      <Gear pos={[0.95, 1.3, -0.1]} r={0.7} speed={0.5} />
      <Gear pos={[2.1, 1.3, 0.1]} r={0.38} teeth={9} speed={-1.0} mat="iron" />
    </group>
  )
}

function Globe({ pos }) {
  const mats = getMats()
  const g = useRef()
  useFrame((_, dt) => {
    g.current.rotation.y += dt * 0.25
  })
  return (
    <group position={pos}>
      <Cyl r={0.5} h={0.2} mat="woodDark" seg={8} />
      <Cyl r={0.1} h={1} mat="woodDark" seg={6} pos={[0, 0.2, 0]} />
      <mesh ref={g} material={mats.leatherDark} position={[0, 1.8, 0]}>
        <icosahedronGeometry args={[0.65, 1]} />
      </mesh>
      <mesh material={mats.gold} position={[0, 1.8, 0]} rotation={[0.4, 0, 0]}>
        <torusGeometry args={[0.8, 0.03, 6, 28]} />
      </mesh>
    </group>
  )
}

export default function Citadel({ lite }) {
  const shelves = useMemo(() => {
    const list = []
    // north wall (facing south)
    for (let x = 36; x >= -28; x -= 6.4) list.push({ x, z: -121.6, rot: 0, w: 5.6 })
    // south wall (facing north), clear of the door
    for (let x = 22; x >= -28; x -= 6.4) list.push({ x, z: -81.9, rot: Math.PI, w: 5.6 })
    // east wall
    for (let z = -88; z >= -118; z -= 6.4) list.push({ x: 42.3, z, rot: -Math.PI / 2, w: 5.6 })
    return list
  }, [])
  const columns = useMemo(() => {
    const out = []
    for (let x = 34; x >= -28; x -= 12.4) {
      out.push([x, -90.5], [x, -113.5])
    }
    return out
  }, [])
  const beams = useMemo(() => {
    const out = []
    for (let x = 34; x >= -28; x -= 12.4) out.push(x)
    return out
  }, [])

  return (
    <group>
      <Floor x0={-33} x1={45} z0={-125} z1={-79} />
      <Ribbon fromWp={8.8} toWp={14.4} width={3.2} y={0.06} mat="carpet" />
      <Ribbon fromWp={8.8} toWp={14.4} width={0.16} y={0.065} mat="gold" offset={1.45} />
      <Ribbon fromWp={8.8} toWp={14.4} width={0.16} y={0.065} mat="gold" offset={-1.45} />

      {/* outer walls: south has the entrance (x 32..40), west has the exit (z -110..-102) */}
      <Wall pos={[-1.5, 0, -80]} size={[67, H, T]} shadow />
      <Wall pos={[43, 0, -80]} size={[4, H, T]} shadow />
      <Wall pos={[36, 11, -80]} size={[8.4, 5, T]} mat="stoneDark" shadow />
      <Wall pos={[5, 0, -124]} size={[82, H, T]} shadow />
      <Wall pos={[44.5, 0, -102]} size={[T, H, 46]} shadow />
      <Wall pos={[-34, 0, -92]} size={[T, H, 22]} shadow />
      <Wall pos={[-34, 0, -117.5]} size={[T, H, 15]} shadow />
      <Wall pos={[-34, 11, -106]} size={[T, 5, 9]} mat="stoneDark" shadow />
      <Battlements from={[-34, -79]} to={[28, -79]} y={H} count={32} />
      <Battlements from={[44, -79]} to={[44, -124]} y={H} count={22} />
      <Battlements from={[44, -124]} to={[-34, -124]} y={H} count={40} />
      <Battlements from={[-34, -124]} to={[-34, -80]} y={H} count={22} />

      {/* towers */}
      <Tower pos={[-34, 0, -80]} r={5.5} h={26} roof={11} />
      <Tower pos={[-34, 0, -124]} r={5.5} h={30} roof={12} />
      <Tower pos={[44, 0, -124]} r={5.5} h={26} roof={11} />
      <Tower pos={[29.5, 0, -80]} r={3.8} h={21} roof={8} />
      <Tower pos={[42.5, 0, -80]} r={3.8} h={21} roof={8} />

      {/* entrance details */}
      <Banner pos={[31.5, 14, -77.9]} rot={0} h={7} w={2} />
      <Banner pos={[40.5, 14, -77.9]} rot={0} h={7} w={2} mat="bannerGreen" />
      <Torch pos={[32.4, 0, -77.2]} height={3} />
      <Torch pos={[39.6, 0, -77.2]} height={3} />

      {/* ceiling beams, columns and chandeliers */}
      {beams.map((x) => (
        <mesh key={x} material={getMats().woodDark} position={[x, 13.2, -102]} castShadow>
          <boxGeometry args={[1.1, 1.1, 46]} />
        </mesh>
      ))}
      {[-91, -102, -113].map((z) => (
        <mesh key={z} material={getMats().woodDark} position={[5, 14.4, z]}>
          <boxGeometry args={[80, 0.9, 0.9]} />
        </mesh>
      ))}
      {columns.map(([x, z], i) => (
        <Column key={i} pos={[x, 0, z]} r={0.8} h={11} />
      ))}
      {[28, 8, -12].map((x, i) => (
        <Chandelier key={i} pos={[x, 8.6, -102]} r={1.5} candles={10} />
      ))}

      <Shelves list={shelves} />

      {/* the engineering laboratory */}
      <Armillary pos={[10, 0, -115]} />
      <Workbench pos={[-10, 0, -91.5]} />
      <Forge pos={[27, 0, -115.5]} />
      <Globe pos={[19, 0, -90.5]} />
      <Table pos={[-18, 0, -115.5]} rot={0} len={7} />
      <Table pos={[2, 0, -91.5]} rot={0} len={6} />
      <Barrel pos={[-30, 0, -96]} />
      <Barrel pos={[-30.9, 0, -97.2]} />
      <Crate pos={[-30, 0, -121]} />
      <Banner pos={[-31.5, 9, -86]} rot={Math.PI / 2} h={6} w={1.8} />
      <Banner pos={[-31.5, 9, -118]} rot={Math.PI / 2} h={6} w={1.8} mat="bannerGreen" />
      {[[-32, -97], [-32, -111], [43, -97], [43, -111], [14, -122.4], [-12, -122.4], [36, -122.4]].map(([x, z], i) => (
        <Torch key={i} pos={[x, 0, z]} height={3} />
      ))}
      <Motes center={[5, 4, -102]} size={[70, 8, 36]} count={lite ? 40 : 110} color="#ffd9a0" pointSize={0.1} speed={0.08} />

      {bookSpots.map((b) => (
        <ProjectBook key={b.id} spot={b} />
      ))}
    </group>
  )
}
