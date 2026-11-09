import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { world } from '../hooks/useWorldProgress'
import { envAt } from './envProfiles'
import { PATH_SAMPLES, distToPath, wpAt, F, posAt } from './WorldPath'
import { CENTER, FOOTPRINTS, RIVER, heightAt, rectDist, riverCarve } from './terrain'
import { getMats, rng } from './materials'

const smooth = (a, b, v) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/* ------------------------------------------------------------------------------------------ SKY */

const skyVert = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`
const skyFrag = /* glsl */ `
  uniform vec3 top; uniform vec3 bottom; uniform vec3 sunDir; uniform vec3 sunColor; uniform float sunAmt;
  varying vec3 vDir;
  void main() {
    float h = clamp(vDir.y, 0.0, 1.0);
    float k = pow(smoothstep(0.0, 0.75, h), 0.7);
    vec3 col = mix(bottom, top, k);
    float s = max(dot(normalize(vDir), normalize(sunDir)), 0.0);
    col += sunColor * (pow(s, 24.0) * 0.55 + pow(s, 400.0) * 1.2) * sunAmt;
    gl_FragColor = vec4(col, 1.0);
  }
`

function SkyDome({ sunDir }) {
  const ref = useRef()
  const uniforms = useMemo(
    () => ({
      top: { value: new THREE.Color() },
      bottom: { value: new THREE.Color() },
      sunDir: { value: sunDir },
      sunColor: { value: new THREE.Color() },
      sunAmt: { value: 1 },
    }),
    [sunDir],
  )
  useFrame(({ camera }) => {
    const e = envAt(world.f)
    uniforms.top.value.copy(e.skyTop)
    uniforms.bottom.value.copy(e.skyBot)
    uniforms.sunColor.value.copy(e.sun)
    uniforms.sunAmt.value = 0.55 + 0.45 * smooth(18.5, 20.5, wpAt(world.f)) + 0.2 * (1 - smooth(0, 3, wpAt(world.f)))
    ref.current.position.copy(camera.position)
  })
  return (
    <mesh ref={ref} renderOrder={-10} frustumCulled={false}>
      <sphereGeometry args={[700, 24, 16]} />
      <shaderMaterial vertexShader={skyVert} fragmentShader={skyFrag} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} fog={false} />
    </mesh>
  )
}

/* -------------------------------------------------------------------------------------- LIGHTING */

export function Lighting({ lite }) {
  const scene = useThree((s) => s.scene)
  const sun = useRef()
  const hemi = useRef()
  const torch = useRef()
  const sunDir = useMemo(() => new THREE.Vector3(0.35, 0.8, 0.45), [])
  const hi = useMemo(() => new THREE.Vector3(0.35, 0.8, 0.45).normalize(), [])
  const hero = useMemo(() => new THREE.Vector3(0.62, 0.5, -0.55).normalize(), [])
  const lo = useMemo(() => new THREE.Vector3(-0.15, 0.2, -0.95).normalize(), [])

  useLayoutEffect(() => {
    scene.fog = new THREE.FogExp2('#8b949c', 0.007)
    sun.current.target.position.set(0, 0, 0)
    const target = sun.current.target
    scene.add(target)
    return () => {
      scene.remove(target)
    }
  }, [scene])

  useFrame(() => {
    const e = envAt(world.f)
    const w = wpAt(world.f)
    scene.fog.color.copy(e.fog)
    scene.fog.density = e.density
    hemi.current.color.copy(e.hemiSky)
    hemi.current.groundColor.copy(e.hemiGround)
    hemi.current.intensity = e.hemi
    sunDir.copy(hero).lerp(hi, smooth(1.2, 3.6, w)).lerp(lo, smooth(19.0, 20.6, w)).normalize()
    sun.current.color.copy(e.sun)
    sun.current.intensity = e.sunI
    const c = world.charPos
    sun.current.position.set(c.x + sunDir.x * 70, c.y + sunDir.y * 70, c.z + sunDir.z * 70)
    sun.current.target.position.copy(c)
    sun.current.target.updateMatrixWorld()
    if (torch.current) {
      torch.current.intensity = e.torch * 9 * (0.92 + 0.08 * Math.sin(performance.now() * 0.013))
      torch.current.position.set(c.x, c.y + 3.2, c.z)
    }
  })

  return (
    <>
      <SkyDome sunDir={sunDir} />
      <hemisphereLight ref={hemi} />
      <ambientLight color="#8c97b0" intensity={0.32} />
      <directionalLight
        ref={sun}
        castShadow={!lite}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={5}
        shadow-camera-far={170}
        shadow-bias={-0.0006}
        shadow-normalBias={0.04}
      />
      {/* warm torchlight that travels with the explorer (interiors, hall and gate) */}
      <pointLight ref={torch} color="#ffb067" distance={26} decay={1.6} intensity={0} />
    </>
  )
}

/* ------------------------------------------------------------------------------------- TERRAIN */

function buildTerrain(segs) {
  const SIZE = 680
  const g = new THREE.PlaneGeometry(SIZE, SIZE, segs, segs)
  g.rotateX(-Math.PI / 2)
  g.translate(CENTER[0], 0, CENTER[1])
  const pos = g.attributes.position
  const colors = new Float32Array(pos.count * 3)
  const grassA = new THREE.Color('#34452a')
  const grassB = new THREE.Color('#4b5c35')
  const moss = new THREE.Color('#2a3a26')
  const dirt = new THREE.Color('#6c5e4a')
  const rock = new THREE.Color('#5d5951')
  const sand = new THREE.Color('#4b4638')
  const tmp = new THREE.Color()
  const r = rng(99)
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const pd = distToPath(x, z)
    const h = heightAt(x, z, pd)
    pos.setY(i, h)
    const n = Math.sin(x * 0.3) * Math.cos(z * 0.27) * 0.5 + 0.5
    tmp.copy(grassA).lerp(grassB, n * 0.8 + r() * 0.2)
    // forest floor is darker and mossier
    const forest = smooth(10, 25, x) * (1 - smooth(-10, 5, z + 5)) * smooth(-95, -60, z) * (1 - smooth(80, 120, x))
    tmp.lerp(moss, forest * 0.7)
    tmp.lerp(rock, smooth(6, 20, h) * 0.85)
    tmp.lerp(dirt, 1 - smooth(1.5, 3.1, pd))
    const rc = riverCarve(x, z)
    tmp.lerp(sand, smooth(0.35, 0.8, rc))
    colors[i * 3] = tmp.r
    colors[i * 3 + 1] = tmp.g
    colors[i * 3 + 2] = tmp.b
  }
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  g.computeVertexNormals()
  return g
}

export function Terrain({ lite }) {
  const geo = useMemo(() => buildTerrain(lite ? 130 : 200), [lite])
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} flatShading={false} />
    </mesh>
  )
}

export function River() {
  const mats = getMats()
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = -0.55 + Math.sin(clock.elapsedTime * 0.8) * 0.02
  })
  const segs = useMemo(
    () =>
      RIVER.slice(0, -1).map(([ax, az], i) => {
        const [bx, bz] = RIVER[i + 1]
        return { c: [(ax + bx) / 2, (az + bz) / 2], len: Math.hypot(bx - ax, bz - az) + 6, rot: Math.atan2(bx - ax, bz - az) }
      }),
    [],
  )
  return (
    <group ref={ref}>
      {segs.map((s, i) => (
        <mesh key={i} material={mats.water} position={[s.c[0], 0, s.c[1]]} rotation={[-Math.PI / 2, 0, s.rot - Math.PI / 2]}>
          <planeGeometry args={[s.len, 9]} />
        </mesh>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------------------------ MOUNTAINS */

export function Mountains({ lite }) {
  const mats = getMats()
  const list = useMemo(() => {
    const r = rng(4242)
    const out = []
    const ring = lite ? 14 : 24
    for (let i = 0; i < ring; i++) {
      const a = (i / ring) * Math.PI * 2 + r() * 0.3
      const d = 215 + r() * 70
      out.push({ x: CENTER[0] + Math.cos(a) * d, z: CENTER[1] + Math.sin(a) * d, h: 55 + r() * 60, rad: 40 + r() * 35, rot: r() * 6 })
    }
    // dramatic range framing the Northern Gate
    for (let i = 0; i < 7; i++) {
      out.push({ x: -95 + i * 26 + r() * 10, z: -262 - r() * 38, h: 95 + r() * 55, rad: 52 + r() * 30, rot: r() * 6 })
    }
    return out
  }, [lite])
  return (
    <group>
      {list.map((m, i) => (
        <group key={i} position={[m.x, -2, m.z]} rotation={[0, m.rot, 0]}>
          <mesh material={mats.rockDark} position={[0, m.h / 2, 0]} scale={[1, 1, 0.8]}>
            <coneGeometry args={[m.rad, m.h, 7, 1]} />
          </mesh>
          <mesh material={mats.snow} position={[0, m.h * 0.82, 0]} scale={[1, 1, 0.8]}>
            <coneGeometry args={[m.rad * 0.3, m.h * 0.36, 7, 1]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* --------------------------------------------------------------------------------------- TREES */

function colorize(geo, hex) {
  const c = new THREE.Color(hex)
  const n = geo.attributes.position.count
  const arr = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    arr[i * 3] = c.r
    arr[i * 3 + 1] = c.g
    arr[i * 3 + 2] = c.b
  }
  geo.setAttribute('color', new THREE.BufferAttribute(arr, 3))
  return geo
}

function pineGeometry() {
  const parts = [
    colorize(new THREE.CylinderGeometry(0.22, 0.32, 2.4, 6).translate(0, 1.2, 0), '#3a2a1c'),
    colorize(new THREE.ConeGeometry(2.1, 3.4, 7).translate(0, 3.4, 0), '#23402a'),
    colorize(new THREE.ConeGeometry(1.7, 3.0, 7).translate(0, 5.2, 0), '#2a4a2e'),
    colorize(new THREE.ConeGeometry(1.15, 2.6, 7).translate(0, 6.9, 0), '#33593a'),
  ].map((g) => g.toNonIndexed())
  return mergeGeometries(parts)
}
function oakGeometry() {
  const parts = [
    colorize(new THREE.CylinderGeometry(0.28, 0.4, 2.6, 6).translate(0, 1.3, 0), '#3b2c1d'),
    colorize(new THREE.IcosahedronGeometry(2.0, 0).translate(0, 3.9, 0), '#2f4d2a'),
    colorize(new THREE.IcosahedronGeometry(1.5, 0).translate(1.0, 4.9, 0.5), '#3a5c30'),
    colorize(new THREE.IcosahedronGeometry(1.4, 0).translate(-0.9, 3.2, -0.7), '#274226'),
  ].map((g) => g.toNonIndexed())
  return mergeGeometries(parts)
}

function scatter(count, seed, accept) {
  const r = rng(seed)
  const out = []
  let guard = 0
  while (out.length < count && guard++ < count * 40) {
    const x = CENTER[0] + (r() - 0.5) * 520
    const z = CENTER[1] + (r() - 0.5) * 520
    if (accept(x, z, r)) out.push({ x, z, s: 0.75 + r() * 0.8, ry: r() * 6.28 })
  }
  return out
}

export function Trees({ lite }) {
  const pineRef = useRef()
  const oakRef = useRef()
  const pineGeo = useMemo(() => pineGeometry(), [])
  const oakGeo = useMemo(() => oakGeometry(), [])
  const { pines, oaks } = useMemo(() => {
    const stonesZone = (x, z) => distToPath(x, z)
    const accept = (forestBias) => (x, z, r) => {
      for (const k in FOOTPRINTS) if (rectDist(x, z, FOOTPRINTS[k]) < 8) return false
      const pd = stonesZone(x, z)
      const inForest = x > 18 && x < 96 && z > -92 && z < -4
      const minPath = inForest ? 6.8 : 7
      if (pd < minPath) return false
      if (riverCarve(x, z) > 0.05) return false
      const dc = Math.hypot(x - CENTER[0], z - CENTER[1])
      if (dc > 235) return false
      // dense inside the forest, sparse elsewhere
      const p = inForest ? forestBias : 0.12
      return r() < p
    }
    const n = lite ? 0.45 : 1
    return {
      pines: scatter(Math.round(900 * n), 7, accept(1)),
      oaks: scatter(Math.round(380 * n), 11, accept(0.8)),
    }
  }, [lite])

  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    const q = new THREE.Quaternion()
    const e = new THREE.Euler()
    const fill = (mesh, list) => {
      list.forEach((t, i) => {
        e.set(0, t.ry, 0)
        q.setFromEuler(e)
        m.compose(new THREE.Vector3(t.x, heightAt(t.x, t.z) - 0.2, t.z), q, new THREE.Vector3(t.s, t.s * (0.9 + (i % 5) * 0.06), t.s))
        mesh.setMatrixAt(i, m)
      })
      mesh.instanceMatrix.needsUpdate = true
    }
    fill(pineRef.current, pines)
    fill(oakRef.current, oaks)
  }, [pines, oaks])

  const mat = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 1 }), [])
  return (
    <group>
      <instancedMesh key={`p${pines.length}`} ref={pineRef} args={[pineGeo, mat, pines.length]} castShadow={!lite} />
      <instancedMesh key={`o${oaks.length}`} ref={oakRef} args={[oakGeo, mat, oaks.length]} castShadow={!lite} />
    </group>
  )
}

/** Boulders scattered along the road edges. */
export function Rocks({ lite }) {
  const ref = useRef()
  const list = useMemo(
    () =>
      scatter(lite ? 60 : 140, 23, (x, z, r) => {
        for (const k in FOOTPRINTS) if (rectDist(x, z, FOOTPRINTS[k]) < 3) return false
        const pd = distToPath(x, z)
        return pd > 3.5 && pd < 40 && riverCarve(x, z) < 0.05 && r() < 0.5
      }),
    [lite],
  )
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    list.forEach((t, i) => {
      m.compose(
        new THREE.Vector3(t.x, heightAt(t.x, t.z) + 0.1, t.z),
        new THREE.Quaternion().setFromEuler(new THREE.Euler(t.s, t.ry, t.s * 2)),
        new THREE.Vector3(t.s * 1.3, t.s * 0.9, t.s * 1.1),
      )
      ref.current.setMatrixAt(i, m)
    })
    ref.current.instanceMatrix.needsUpdate = true
  }, [list])
  return (
    <instancedMesh key={list.length} ref={ref} args={[undefined, getMats().rock, list.length]} castShadow={!lite}>
      <dodecahedronGeometry args={[1, 0]} />
    </instancedMesh>
  )
}

/** Drifting motes (fireflies, dust, embers). One draw call. */
export function Motes({ center, size, count = 120, color = '#bfe6a0', pointSize = 0.16, speed = 0.15 }) {
  const ref = useRef()
  const geo = useMemo(() => {
    const r = rng(Math.round(center[0] * 13 + center[2] * 7))
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (r() - 0.5) * size[0]
      arr[i * 3 + 1] = r() * size[1]
      arr[i * 3 + 2] = (r() - 0.5) * size[2]
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
  }, [center, size, count])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed
    ref.current.position.set(center[0] + Math.sin(t * 2.1) * 1.2, center[1] + Math.sin(t * 3.3) * 0.5, center[2] + Math.cos(t * 1.7) * 1.2)
  })
  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <pointsMaterial color={color} size={pointSize} sizeAttenuation transparent opacity={0.85} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
    </points>
  )
}

export { F, posAt, PATH_SAMPLES }
