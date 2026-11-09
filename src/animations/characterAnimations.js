/**
 * Procedural animation library for the explorer rig. Each animation returns a *pose* (joint angles in
 * radians). Poses are blended by weight and then damped in Character.jsx, so transitions between
 * idle / walking / looking / pointing / interacting / celebrating are always smooth.
 *
 * Rig conventions (character faces +z, "L" is the +x side, "R" the -x side):
 *   rotation.x < 0 swings a hanging limb FORWARD; rotation.z > 0 swings the L arm outward.
 *
 * If a rigged Mixamo GLB is dropped in later, keep the same animation names ('idle','walk','look',
 * 'point','interact','celebrate') and map them to AnimationMixer clips instead of these functions.
 */

export const ANIMS = ['idle', 'walk', 'look', 'point', 'interact', 'celebrate']

export const POSE_KEYS = [
  'hipsY', 'spineX', 'spineY', 'headX', 'headY',
  'lHip', 'rHip', 'lKnee', 'rKnee',
  'lShX', 'lShZ', 'lElb', 'rShX', 'rShZ', 'rElb',
  'cloakX', 'book',
]

const BASE_HIPS = 0.95

const make = () => Object.fromEntries(POSE_KEYS.map((k) => [k, 0]))

export function idle(t) {
  const p = make()
  const b = Math.sin(t * 1.7)
  p.hipsY = BASE_HIPS + 0.004 * b
  p.spineX = 0.012 * b
  p.headY = Math.sin(t * 0.5) * 0.55 * (0.4 + 0.6 * Math.sin(t * 0.13) ** 2)
  p.headX = 0.05 * Math.sin(t * 0.37)
  p.lShZ = 0.09 + 0.01 * b
  p.rShZ = -0.09 - 0.01 * b
  p.lShX = 0.03 * b
  p.rShX = -0.03 * b
  p.lElb = -0.14
  p.rElb = -0.14
  p.cloakX = 0.03 + 0.015 * b
  return p
}

export function walk(t, phase) {
  const p = make()
  const s = Math.sin(phase)
  const c = Math.cos(phase)
  p.hipsY = BASE_HIPS - 0.018 - 0.022 * Math.cos(phase * 2)
  p.lHip = -s * 0.62
  p.rHip = s * 0.62
  p.lKnee = Math.max(0, c) * 0.95 + 0.06
  p.rKnee = Math.max(0, -c) * 0.95 + 0.06
  p.lShX = s * 0.5
  p.rShX = -s * 0.5
  p.lShZ = 0.07
  p.rShZ = -0.07
  p.lElb = -0.3 - Math.max(0, -s) * 0.35
  p.rElb = -0.3 - Math.max(0, s) * 0.35
  p.spineX = 0.09
  p.spineY = -s * 0.12
  p.headY = s * 0.1
  p.headX = -0.04
  p.cloakX = 0.14 + 0.08 * Math.sin(phase * 2 - 1)
  return p
}

export function look(t) {
  const p = idle(t)
  p.headY = Math.sin(t * 0.7) * 0.95
  p.headX = -0.2 + 0.05 * Math.sin(t * 1.1)
  p.spineY = Math.sin(t * 0.7) * 0.18
  // R hand shades the eyes, L hand rests on the belt
  p.rShX = -2.15
  p.rShZ = -0.18
  p.rElb = -1.45
  p.lShZ = 0.35
  p.lElb = -1.25
  return p
}

export function point(t) {
  const p = idle(t)
  p.rShX = -1.5 + 0.04 * Math.sin(t * 3)
  p.rShZ = -0.12
  p.rElb = -0.06
  p.spineY = -0.22
  p.headY = -0.1
  p.headX = -0.06
  p.lShZ = 0.16
  p.lElb = -0.3
  return p
}

export function interact(t) {
  const p = idle(t)
  p.lShX = -0.95
  p.rShX = -0.95
  p.lShZ = 0.14
  p.rShZ = -0.14
  p.lElb = -1.25
  p.rElb = -1.25
  p.headX = 0.38
  p.headY = 0.05 * Math.sin(t * 0.8)
  p.spineX = 0.14
  p.book = 1
  return p
}

export function celebrate(t) {
  const p = idle(t)
  const pump = 0.22 * Math.sin(t * 8)
  p.hipsY = BASE_HIPS + 0.07 * Math.abs(Math.sin(t * 4))
  p.lShZ = 2.5 + pump
  p.rShZ = -2.5 - pump
  p.lElb = -0.25
  p.rElb = -0.25
  p.lHip = -0.12
  p.rHip = 0.12
  p.lKnee = 0.2
  p.rKnee = 0.2
  p.headX = -0.25
  p.spineX = -0.05
  p.cloakX = 0.18
  return p
}

export const poseFns = { idle, walk, look, point, interact, celebrate }

/** Weighted blend of poses into `out` (mutates and returns it). */
export function blend(out, weights, t, phase) {
  for (const k of POSE_KEYS) out[k] = 0
  let total = 0
  for (const name of ANIMS) total += weights[name]
  if (total < 1e-4) return out
  for (const name of ANIMS) {
    const w = weights[name] / total
    if (w < 1e-3) continue
    const pose = name === 'walk' ? walk(t, phase) : poseFns[name](t)
    for (const k of POSE_KEYS) out[k] += pose[k] * w
  }
  return out
}
