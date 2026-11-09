import { distToPath } from './WorldPath'

/** Axis-aligned footprints of the built areas (x0, x1, z0, z1). The terrain is flattened beneath them. */
export const FOOTPRINTS = {
  castle: [-30, 36, -14, 44],
  citadel: [-36, 46, -126, -78],
  hall: [-62, -30, -162, -109],
  gate: [-80, -10, -214, -194],
}

export function rectDist(x, z, [x0, x1, z0, z1]) {
  const dx = Math.max(x0 - x, 0, x - x1)
  const dz = Math.max(z0 - z, 0, z - z1)
  return Math.hypot(dx, dz)
}

/** River polyline (x, z). It crosses the path next to waypoint 7, where the bridge stands. */
export const RIVER = [
  [-30, -64],
  [10, -58],
  [38, -56],
  [62, -61],
  [110, -52],
]
export const RIVER_HALF_WIDTH = 3.2

function distToSegment(px, pz, ax, az, bx, bz) {
  const dx = bx - ax
  const dz = bz - az
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz)))
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz))
}

export function riverDist(x, z) {
  let best = 1e9
  for (let i = 0; i < RIVER.length - 1; i++) {
    best = Math.min(best, distToSegment(x, z, RIVER[i][0], RIVER[i][1], RIVER[i + 1][0], RIVER[i + 1][1]))
  }
  return best
}

const smooth = (a, b, v) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export const CENTER = [0, -95]

function rawNoise(x, z) {
  return (
    Math.sin(x * 0.045) * Math.cos(z * 0.04) +
    Math.sin(x * 0.11 + 1.3) * Math.sin(z * 0.09) * 0.5 +
    Math.sin((x + z) * 0.021) * 1.6 +
    Math.sin(x * 0.23 + z * 0.17) * 0.18
  )
}

/** Terrain height; `pathD` may be passed in when already known (terrain build) to avoid recomputing. */
export function heightAt(x, z, pathD = distToPath(x, z)) {
  let flat = pathD - 2
  for (const k in FOOTPRINTS) flat = Math.min(flat, rectDist(x, z, FOOTPRINTS[k]) + 4)
  const mask = smooth(6, 28, flat)
  const hills = (rawNoise(x, z) * 0.5 + 0.5) * 7
  const dc = Math.hypot(x - CENTER[0], z - CENTER[1])
  const rim = Math.pow(smooth(150, 330, dc), 1.6) * 46
  let h = (hills + rim) * mask
  const rd = riverDist(x, z)
  h -= (1 - smooth(RIVER_HALF_WIDTH * 0.35, RIVER_HALF_WIDTH + 2.5, rd)) * 1.5
  return h
}

export function riverCarve(x, z) {
  return 1 - smooth(RIVER_HALF_WIDTH * 0.35, RIVER_HALF_WIDTH + 2.5, riverDist(x, z))
}
