import { useSyncExternalStore } from 'react'
import * as THREE from 'three'

/**
 * Two kinds of state:
 *  - `world`: a mutable object read/written every frame by the 3D systems (no React renders).
 *  - `ui`: a tiny reactive store for things the DOM overlay needs (active section, open panel, mode).
 */
export const world = {
  target: 0, // raw scroll progress 0..1 (written by ScrollTrigger)
  f: 0, // smoothed fraction along the path (the character's actual position)
  speed: 0, // character speed in world units / second
  fast: false, // true while a nav-jump is running (character sprints)
  travelling: false, // true while the page-scroll tween of a nav-jump is still running
  charPos: new THREE.Vector3(),
  charYaw: 0,
  introT: 0, // 0..1 camera intro sweep
  act: 'idle',
  frame: 0, // frames rendered (zones stay visible during the first few so shaders warm up)
}

const listeners = new Set()
let ui = {
  section: 0, // index into locations
  selection: null, // { type: 'skill'|'project'|'achievement'|'contact', id }
  loaded: false, // scene rendered its first frames
  entered: false, // loading screen dismissed
  mode: 'pending', // 'pending' (detecting) | 'world' | 'classic'
  hero: true, // still in the opening scene (hero text visible)
  focus: null, // { type, id } of the interactive object the explorer is standing next to
  webgl: true,
  reducedMotion: false,
  lite: false, // simplified 3D for phones / low power
}

export const getUI = () => ui
export function setUI(patch) {
  const next = { ...ui, ...(typeof patch === 'function' ? patch(ui) : patch) }
  // shallow equality check to avoid useless renders
  let changed = false
  for (const k in next) if (next[k] !== ui[k]) changed = true
  if (!changed) return
  ui = next
  listeners.forEach((l) => l())
}

export function useUI(selector = (s) => s) {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => selector(ui),
  )
}

export const select = (type, id) => setUI({ selection: { type, id } })
export const closePanel = () => setUI({ selection: null })
