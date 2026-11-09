import * as THREE from 'three'

/**
 * The single curve the character walks along. Coordinates are [x, z] in metres; north (towards the
 * Northern Gate) is -z. Everything in the kingdom is laid out around this path.
 *
 *   0-3   King's Landing courtyard, out through the east gate
 *   4-8   Enchanted Forest (clearing at 6, river bridge at ~7)
 *   9-14  The Citadel (door at 9, library 10-13, west door at 14)
 *   15-18 Hall of Achievements
 *   19-21 Road to the Northern Gate
 */
export const WAYPOINTS_XZ = [
  [4, 6], // 0 start (courtyard)
  [11, -1],
  [19, -4],
  [27, -6],
  [40, -7], // 4 outside the east gate
  [52, -20],
  [48, -40], // 6 forest clearing
  [38, -56], // 7 bridge
  [38, -70],
  [36, -82], // 9 citadel door
  [30, -98],
  [14, -102],
  [-6, -102],
  [-22, -104], // 13
  [-33, -106], // 14 citadel west door
  [-44, -111],
  [-46, -124], // 16
  [-46, -140],
  [-46, -156], // 18 end of hall
  [-46, -168],
  [-41, -176],
  [-44, -187], // 21 on the road before the gate
]

const pts = WAYPOINTS_XZ.map(([x, z]) => new THREE.Vector3(x, 0, z))
export const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal')
curve.arcLengthDivisions = 3000

const SEG = 300
const n = pts.length
const cum = [0]
{
  let prev = curve.getPoint(0)
  const total = (n - 1) * SEG
  for (let i = 1; i <= total; i++) {
    const p = curve.getPoint(i / total)
    cum.push(cum[i - 1] + p.distanceTo(prev))
    prev = p
  }
}
export const TOTAL = cum[cum.length - 1]
export const wpFrac = pts.map((_, i) => cum[i * SEG] / TOTAL)

/** Fraction along the path for a (possibly fractional) waypoint index. */
export function F(wp) {
  const i = Math.max(0, Math.min(n - 1, Math.floor(wp)))
  if (i >= n - 1) return 1
  return wpFrac[i] + (wpFrac[i + 1] - wpFrac[i]) * (wp - i)
}

/** Inverse of F: fractional waypoint index for a path fraction. */
export function wpAt(f) {
  if (f <= 0) return 0
  if (f >= 1) return n - 1
  let i = 0
  while (i < n - 2 && wpFrac[i + 1] < f) i++
  return i + (f - wpFrac[i]) / (wpFrac[i + 1] - wpFrac[i])
}

const clamp01 = (f) => Math.min(1, Math.max(0, f))
export const posAt = (f, out = new THREE.Vector3()) => curve.getPointAt(clamp01(f), out)
export const tanAt = (f, out = new THREE.Vector3()) => curve.getTangentAt(clamp01(f), out)

/** Position `side` metres to the right (+) / left (-) of the path at fraction f. */
export function offsetAt(f, side, out = new THREE.Vector3()) {
  posAt(f, out)
  const t = tanAt(f, new THREE.Vector3())
  // Right of travel for a walker facing t (y up, right-handed): t × up = (-t.z, 0, t.x)
  out.x += -t.z * side
  out.z += t.x * side
  return out
}

/** Dense sample of the path (x,z) for terrain shaping and tree exclusion. */
export const PATH_SAMPLES = (() => {
  const count = Math.ceil(TOTAL / 0.75)
  const arr = new Float32Array(count * 2)
  const v = new THREE.Vector3()
  for (let i = 0; i < count; i++) {
    curve.getPointAt(i / (count - 1), v)
    arr[i * 2] = v.x
    arr[i * 2 + 1] = v.z
  }
  return arr
})()

export function distToPath(x, z) {
  let best = 1e9
  for (let i = 0; i < PATH_SAMPLES.length; i += 2) {
    const dx = PATH_SAMPLES[i] - x
    const dz = PATH_SAMPLES[i + 1] - z
    const d = dx * dx + dz * dz
    if (d < best) best = d
  }
  return Math.sqrt(best)
}
