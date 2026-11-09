import { Suspense, useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Character from './Character'
import CameraRig from './Camera'
import { Lighting, Terrain, River, Mountains, Trees, Rocks } from './Environment'
import Locations from './Locations'
import { world, getUI, setUI } from '../hooks/useWorldProgress'
import { sectionAt, sToF, stoneSpots, bookSpots, hallSpots } from './journey'

/** Tells the DOM layer which location is active and when the scene has rendered enough to reveal. */
const SPOTS = [
  ...stoneSpots.map((s) => ({ type: 'skill', id: s.id, pos: s.pos })),
  ...bookSpots.map((s) => ({ type: 'project', id: s.id, pos: s.pos })),
  ...hallSpots.map((s) => ({ type: 'achievement', id: s.id, pos: s.pos })),
]

function Bridge() {
  const frames = useRef(0)
  useFrame(() => {
    frames.current++
    world.frame = frames.current
    const ui = getUI()
    if (frames.current === 20 && !ui.loaded) setUI({ loaded: true })
    const section = sectionAt(world.f)
    const hero = world.target < 0.16
    // which interactive object (if any) is the explorer standing beside?
    let best = null
    let bd = 6.8
    for (const s of SPOTS) {
      const d = Math.hypot(world.charPos.x - s.pos.x, world.charPos.z - s.pos.z)
      if (d < bd) {
        bd = d
        best = s
      }
    }
    const f = ui.focus
    const focusChanged = (best?.id ?? null) !== (f?.id ?? null)
    if (section !== ui.section || hero !== ui.hero || focusChanged) {
      setUI({ section, hero, focus: best ? { type: best.type, id: best.id } : null })
    }
  })
  return null
}

export default function World({ lite }) {
  useEffect(() => {
    if (import.meta.env.DEV) {
      // dev-only test hooks: inspect state and teleport (instantly) to a scroll position
      window.__world = world
      window.__jump = (s) => {
        world.target = s
        world.f = sToF(s)
      }
    }
  }, [])
  return (
    <Canvas
      className="world-canvas"
      style={{ touchAction: 'pan-y' }}
      dpr={lite ? [1, 1.25] : [1, 1.75]}
      shadows={!lite}
      camera={{ fov: 42, near: 0.1, far: 1500, position: [3, 3, 14] }}
      gl={{ antialias: !lite, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      onCreated={({ gl }) => {
        gl.setClearColor('#0b0b0d')
        // if the GPU drops the context, fall back to the readable classic view instead of a black screen
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          setUI({ webgl: false, mode: 'classic' })
        })
      }}
    >
      <Suspense fallback={null}>
        <Lighting lite={lite} />
        <Terrain lite={lite} />
        <River />
        <Mountains lite={lite} />
        <Trees lite={lite} />
        <Rocks lite={lite} />
        <Locations lite={lite} />
        <Character />
        <CameraRig />
        <Bridge />
      </Suspense>
    </Canvas>
  )
}
