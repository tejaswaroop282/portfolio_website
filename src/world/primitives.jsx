import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getMats, tiledBox } from './materials'
import { world } from '../hooks/useWorldProgress'
import { wpAt, posAt, tanAt, F, TOTAL } from './WorldPath'

/** Small declarative building blocks shared by every location. All use shared materials/geometries. */

export function Wall({ pos = [0, 0, 0], size = [1, 1, 1], mat = 'stone', rot = 0, tile = 3, shadow = false }) {
  const m = getMats()[mat]
  return (
    <mesh
      geometry={tiledBox(size[0], size[1], size[2], tile)}
      material={m}
      position={[pos[0], pos[1] + size[1] / 2, pos[2]]}
      rotation={[0, rot, 0]}
      castShadow={shadow}
      receiveShadow
    />
  )
}

export function Cyl({ pos = [0, 0, 0], r = 1, rTop, h = 1, mat = 'stone', seg = 14, rot, open = false, shadow = false }) {
  const m = getMats()[mat]
  return (
    <mesh position={[pos[0], pos[1] + h / 2, pos[2]]} rotation={rot} material={m} castShadow={shadow} receiveShadow>
      <cylinderGeometry args={[rTop ?? r, r, h, seg, 1, open]} />
    </mesh>
  )
}

export function Cone({ pos = [0, 0, 0], r = 1, h = 1, mat = 'slate', seg = 12, shadow = false }) {
  const m = getMats()[mat]
  return (
    <mesh position={[pos[0], pos[1] + h / 2, pos[2]]} material={m} castShadow={shadow}>
      <coneGeometry args={[r, h, seg]} />
    </mesh>
  )
}

export function Torch({ pos = [0, 0, 0], height = 1.6 }) {
  const mats = getMats()
  const flame = useRef()
  const seed = (pos[0] * 7.13 + pos[2] * 3.77) % 10
  useFrame(({ clock }) => {
    if (!flame.current) return
    const t = clock.elapsedTime * 9 + seed
    const s = 1 + Math.sin(t) * 0.14 + Math.sin(t * 2.3) * 0.08
    flame.current.scale.set(s * 0.9, s * 1.15, s * 0.9)
  })
  return (
    <group position={pos}>
      <mesh material={mats.woodDark} position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.07, height, 6]} />
      </mesh>
      <mesh material={mats.iron} position={[0, height + 0.02, 0]}>
        <cylinderGeometry args={[0.12, 0.07, 0.14, 8]} />
      </mesh>
      <mesh ref={flame} material={mats.flame} position={[0, height + 0.24, 0]}>
        <coneGeometry args={[0.1, 0.34, 7]} />
      </mesh>
    </group>
  )
}

export function Banner({ pos = [0, 0, 0], rot = 0, w = 1.3, h = 3.2, mat = 'banner', sway = true }) {
  const mats = getMats()
  const ref = useRef()
  const seed = (pos[0] * 5.31 + pos[2] * 2.17) % 6
  useFrame(({ clock }) => {
    if (sway && ref.current) ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.9 + seed) * 0.035
  })
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh material={mats.iron} position={[0, h + 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, w + 0.3, 6]} />
      </mesh>
      <group ref={ref} position={[0, h, 0]}>
        <mesh material={mats[mat]} position={[0, -h / 2, 0]}>
          <planeGeometry args={[w, h]} />
        </mesh>
        {/* original crest: gold diamond over a gold stripe */}
        <mesh material={mats.gold} position={[0, -h * 0.32, 0.01]} scale={[w * 0.28, w * 0.36, 0.02]}>
          <octahedronGeometry args={[1, 0]} />
        </mesh>
        <mesh material={mats.gold} position={[0, -h * 0.72, 0.01]}>
          <planeGeometry args={[w * 0.82, 0.07]} />
        </mesh>
        <mesh material={mats.gold} position={[0, -h * 0.9, 0.01]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[w * 0.1, 0.22, 3]} />
        </mesh>
      </group>
    </group>
  )
}

/** Row of merlons along a straight wall top. */
export function Battlements({ from, to, y, count, size = [1.1, 1.2, 1.2], mat = 'stone' }) {
  const ref = useRef()
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const a = new THREE.Vector3(from[0], y, from[1])
    const b = new THREE.Vector3(to[0], y, to[1])
    const dir = b.clone().sub(a)
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.atan2(dir.x, dir.z))
    const p = new THREE.Vector3()
    for (let i = 0; i < count; i++) {
      p.copy(a).lerp(b, count === 1 ? 0.5 : i / (count - 1))
      p.y = y + size[1] / 2
      m.compose(p, q, new THREE.Vector3(1, 1, 1))
      ref.current.setMatrixAt(i, m)
    }
    ref.current.instanceMatrix.needsUpdate = true
  }, [from, to, y, count, size])
  return (
    <instancedMesh ref={ref} args={[tiledBox(size[0], size[1], size[2], 2), getMats()[mat], count]} castShadow receiveShadow />
  )
}

export function Tower({ pos = [0, 0, 0], r = 3.2, h = 14, roof = 5, ring = 14 }) {
  const mats = getMats()
  return (
    <group position={pos}>
      <Cyl r={r} h={h} mat="stone" seg={16} shadow />
      <Cyl r={r + 0.5} rTop={r + 0.5} h={0.7} pos={[0, h, 0]} mat="stoneDark" seg={16} />
      <Cone r={r + 0.9} h={roof} pos={[0, h + 0.7, 0]} mat="slate" seg={16} shadow />
      {/* warm lit slit windows */}
      {[0, 1.7, 3.4, 5.1].map((a, i) => (
        <mesh key={i} material={mats.window} position={[Math.sin(a) * (r + 0.02), h * 0.62 - (i % 2) * 2.4, Math.cos(a) * (r + 0.02)]} rotation={[0, a, 0]}>
          <planeGeometry args={[0.35, 1.1]} />
        </mesh>
      ))}
      {ring > 0 && (
        <mesh material={mats.iron} position={[0, h + 0.7 + roof + 0.5, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 1, 4]} />
        </mesh>
      )}
    </group>
  )
}


/* ---------------------------------------------------------------- zone culling, floors, ribbons */

/** Renders its children only while the character is within [from, to] waypoints (all visible during warm-up). */
export function Zone({ from, to, children }) {
  const ref = useRef()
  useFrame(() => {
    if (!ref.current) return
    const w = wpAt(world.f)
    ref.current.visible = world.frame < 14 || (w >= from && w <= to)
  })
  return <group ref={ref}>{children}</group>
}

const floorGeoCache = new Map()
export function Floor({ x0, x1, z0, z1, y = 0.03, mat = 'floor', tile = 4 }) {
  const w = x1 - x0
  const d = z1 - z0
  const key = [w, d, tile].join('|')
  let g = floorGeoCache.get(key)
  if (!g) {
    g = new THREE.PlaneGeometry(w, d)
    g.rotateX(-Math.PI / 2)
    const uv = g.attributes.uv
    for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / tile, (uv.getY(i) * d) / tile)
    floorGeoCache.set(key, g)
  }
  return <mesh geometry={g} material={getMats()[mat]} position={[(x0 + x1) / 2, y, (z0 + z1) / 2]} receiveShadow />
}

/** A flat strip that follows the walking path between two waypoint indices. */
export function Ribbon({ fromWp, toWp, width = 3, y = 0.05, mat = 'stoneDark', offset = 0, steps = 90 }) {
  const geo = useMemo(() => {
    const pos = []
    const uvs = []
    const idx = []
    const a = new THREE.Vector3()
    const t = new THREE.Vector3()
    const f0 = F(fromWp)
    const f1 = F(toWp)
    for (let i = 0; i <= steps; i++) {
      const f = f0 + ((f1 - f0) * i) / steps
      posAt(f, a)
      tanAt(f, t)
      const nx = -t.z
      const nz = t.x
      const cx = a.x + nx * offset
      const cz = a.z + nz * offset
      pos.push(cx - nx * (width / 2), y, cz - nz * (width / 2), cx + nx * (width / 2), y, cz + nz * (width / 2))
      const v = ((f - f0) * TOTAL) / 4
      uvs.push(0, v, width / 4, v)
      if (i < steps) {
        const k = i * 2
        idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2)
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    g.setIndex(idx)
    g.computeVertexNormals()
    // make sure normals face up regardless of winding
    const n = g.attributes.normal
    for (let i = 0; i < n.count; i++) if (n.getY(i) < 0) n.setXYZ(i, -n.getX(i), -n.getY(i), -n.getZ(i))
    return g
  }, [fromWp, toWp, width, y, offset, steps])
  return <mesh geometry={geo} material={getMats()[mat]} receiveShadow />
}

export function Column({ pos = [0, 0, 0], r = 0.9, h = 12, cap = true }) {
  return (
    <group position={pos}>
      <Cyl r={r * 1.35} h={0.7} mat="stoneDark" seg={12} />
      <Cyl r={r} h={h} mat="stone" seg={12} pos={[0, 0.7, 0]} shadow />
      {cap && <Cyl r={r * 1.45} rTop={r * 1.45} h={0.6} mat="gold" seg={12} pos={[0, h + 0.7, 0]} />}
      {cap && <Cyl r={r * 1.7} rTop={r * 1.7} h={0.8} mat="stoneDark" seg={12} pos={[0, h + 1.3, 0]} />}
    </group>
  )
}

export function Brazier({ pos = [0, 0, 0], scale = 1 }) {
  const mats = getMats()
  const f = useRef()
  useFrame(({ clock }) => {
    if (!f.current) return
    const t = clock.elapsedTime * 8 + pos[0]
    f.current.scale.set(1 + Math.sin(t) * 0.12, 1 + Math.sin(t * 1.7) * 0.2, 1 + Math.cos(t) * 0.12)
  })
  return (
    <group position={pos} scale={scale}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} material={mats.iron} position={[Math.sin((i * Math.PI * 2) / 3) * 0.35, 0.55, Math.cos((i * Math.PI * 2) / 3) * 0.35]} rotation={[Math.cos((i * Math.PI * 2) / 3) * 0.25, 0, -Math.sin((i * Math.PI * 2) / 3) * 0.25]}>
          <cylinderGeometry args={[0.04, 0.05, 1.1, 5]} />
        </mesh>
      ))}
      <mesh material={mats.iron} position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.5, 0.28, 0.35, 10]} />
      </mesh>
      <mesh ref={f} material={mats.flame} position={[0, 1.55, 0]}>
        <coneGeometry args={[0.32, 0.85, 8]} />
      </mesh>
    </group>
  )
}

export function Chandelier({ pos = [0, 7, 0], r = 1.3, candles = 8 }) {
  const mats = getMats()
  return (
    <group position={pos}>
      <mesh material={mats.iron} position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 5, 4]} />
      </mesh>
      <mesh material={mats.iron} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[r, 0.06, 6, 20]} />
      </mesh>
      {Array.from({ length: candles }).map((_, i) => {
        const a = (i / candles) * Math.PI * 2
        return (
          <group key={i} position={[Math.sin(a) * r, 0.05, Math.cos(a) * r]}>
            <mesh material={mats.candle} position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.07, 0.07, 0.3, 6]} />
            </mesh>
            <mesh material={mats.flame} position={[0, 0.42, 0]}>
              <coneGeometry args={[0.055, 0.17, 5]} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/** Cheap volumetric-looking light shaft: a soft additive quad. */
const shaftTex = (() => {
  let t
  return () => {
    if (t) return t
    const c = document.createElement('canvas')
    c.width = 64
    c.height = 256
    const g = c.getContext('2d')
    const grad = g.createLinearGradient(0, 0, 0, 256)
    grad.addColorStop(0, 'rgba(255,225,160,0.55)')
    grad.addColorStop(1, 'rgba(255,225,160,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 64, 256)
    const side = g.createLinearGradient(0, 0, 64, 0)
    side.addColorStop(0, 'rgba(0,0,0,1)')
    side.addColorStop(0.5, 'rgba(0,0,0,0)')
    side.addColorStop(1, 'rgba(0,0,0,1)')
    g.globalCompositeOperation = 'destination-out'
    g.fillStyle = side
    g.fillRect(0, 0, 64, 256)
    t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    return t
  }
})()

export function LightShaft({ pos, rot = [0, 0, 0], w = 3.5, h = 16, opacity = 0.6 }) {
  return (
    <mesh position={pos} rotation={rot}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={shaftTex()} transparent opacity={opacity} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} toneMapped={false} fog={false} />
    </mesh>
  )
}

/** Wooden barrel / crate props. */
export function Barrel({ pos }) {
  const mats = getMats()
  return (
    <group position={pos}>
      <mesh material={mats.wood} position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.42, 0.42, 1, 10]} />
      </mesh>
      {[0.25, 0.75].map((y) => (
        <mesh key={y} material={mats.iron} position={[0, y, 0]}>
          <cylinderGeometry args={[0.435, 0.435, 0.07, 10]} />
        </mesh>
      ))}
    </group>
  )
}
export function Crate({ pos, size = 0.9, rot = 0 }) {
  return (
    <mesh material={getMats().woodLight} position={[pos[0], pos[1] + size / 2, pos[2]]} rotation={[0, rot, 0]} castShadow receiveShadow>
      <boxGeometry args={[size, size, size]} />
    </mesh>
  )
}

const gableCache = new Map()
/** Pitched roof: ridge runs along local z. Sits on y = pos[1]. */
export function Gable({ pos = [0, 0, 0], w = 6, d = 8, h = 2.6, rot = 0, mat = 'slate' }) {
  const key = [w, d, h].join('|')
  let g = gableCache.get(key)
  if (!g) {
    const s = new THREE.Shape()
    s.moveTo(-w / 2 - 0.4, 0)
    s.lineTo(w / 2 + 0.4, 0)
    s.lineTo(0, h)
    s.closePath()
    g = new THREE.ExtrudeGeometry(s, { depth: d + 0.8, bevelEnabled: false })
    g.translate(0, 0, -(d + 0.8) / 2)
    gableCache.set(key, g)
  }
  return <mesh geometry={g} material={getMats()[mat]} position={pos} rotation={[0, rot, 0]} castShadow receiveShadow />
}
