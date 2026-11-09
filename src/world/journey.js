import * as THREE from 'three'
import { F, offsetAt, posAt } from './WorldPath'
import { skillGroups } from '../data/skills'
import { projects } from '../data/projects'
import { hallItems } from '../data/achievements'

/**
 * Maps scroll progress (s, 0..1) to a position along the path and decides what the character does.
 * Plateaus (equal f for a range of s) are the "slow down and appreciate it" moments.
 */

const lerp = (a, b, t) => a + (b - a) * t

// --- Interactive object placement (derived from the path so everything lines up) -----------------

export const stoneSpots = skillGroups.map((g, k) => {
  const f = lerp(F(5.2), F(7.0), k / (skillGroups.length - 1))
  const side = k % 2 === 0 ? 4.8 : -4.8
  const pos = offsetAt(f, side)
  return { ...g, f, side, pos }
})

const A0 = F(10)
const A1 = F(13)
export const bookSpots = projects.map((p, k) => {
  const f = lerp(A0, A1, 0.08 + k * 0.21)
  const side = k % 2 === 0 ? 3.4 : -3.4
  const pos = offsetAt(f, side)
  return { ...p, f, side, pos }
})

export const hallSpots = hallItems.map((h, j) => {
  const f = lerp(F(15.8), F(18), (j + 0.5) / hallItems.length)
  const side = j % 2 === 0 ? 4.8 : -4.8
  const pos = offsetAt(f, side)
  return { ...h, f, side, pos }
})

// --- Scroll keyframes -----------------------------------------------------------------------------

const keys = [
  [0.0, F(0)],
  [0.05, F(0)], // intro dwell
  [0.19, F(3)], // across the courtyard to the east gate
  [0.25, F(5)],
  [0.3, F(6)],
  [0.355, F(6)], // forest clearing dwell
  [0.41, F(7.5)],
  [0.47, F(9)],
  [0.495, F(9)], // Citadel door dwell
]
bookSpots.forEach((b, k) => {
  const s = 0.52 + k * 0.05
  keys.push([s, b.f], [s + 0.028, b.f])
})
keys.push(
  [0.78, F(14)],
  [0.795, F(15.3)],
  [0.815, F(15.3)], // hall entrance dwell
  [0.915, F(18)],
  [0.935, F(18)], // end of hall dwell
  [0.962, F(21)],
  [1.0, F(21)], // gate dwell
)

export function sToF(s) {
  if (s <= keys[0][0]) return keys[0][1]
  for (let i = 1; i < keys.length; i++) {
    if (s <= keys[i][0]) {
      const [s0, f0] = keys[i - 1]
      const [s1, f1] = keys[i]
      return s1 === s0 ? f1 : lerp(f0, f1, (s - s0) / (s1 - s0))
    }
  }
  return keys[keys.length - 1][1]
}

// --- Contextual animations ------------------------------------------------------------------------

/** When the character is standing still inside one of these scroll ranges, play `act`. */
export const dwells = [
  { s0: 0.0, s1: 0.03, act: 'idle' },
  { s0: 0.03, s1: 0.05, act: 'point', faceWp: 1.4 },
  { s0: 0.305, s1: 0.355, act: 'look' },
  { s0: 0.475, s1: 0.495, act: 'look' },
  ...bookSpots.map((b, k) => ({ s0: 0.52 + k * 0.05 + 0.002, s1: 0.52 + k * 0.05 + 0.028, act: 'interact', face: b.pos })),
  { s0: 0.797, s1: 0.815, act: 'look' },
  { s0: 0.917, s1: 0.935, act: 'celebrate' },
  { s0: 0.963, s1: 0.98, act: 'point' },
  { s0: 0.98, s1: 1.01, act: 'celebrate' },
]

export function dwellAt(s) {
  for (const d of dwells) if (s >= d.s0 && s <= d.s1) return d
  return null
}

// --- Sections & navigation ------------------------------------------------------------------------

const bounds = [F(3.6), F(8.6), F(14.2), F(18.9)]
export function sectionAt(f) {
  let i = 0
  while (i < bounds.length && f >= bounds[i]) i++
  return i
}

/** Scroll position (0..1) each navigation item travels to. */
export const navTargets = { home: 0, skills: 0.325, projects: 0.505, journey: 0.805, contact: 1 }

export const tmpV = new THREE.Vector3()
export const startPos = posAt(0)
