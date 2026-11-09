import { wpAt } from '../world/WorldPath'

/**
 * Third-person camera profiles keyed by waypoint index.
 *   az     orbit angle around the character (0 = directly behind, ±π/2 = side, π = in front)
 *   r      orbit radius, h height above ground, lookY height of the look target on the character
 *   ahead  look-target offset along the direction of travel (lets the world appear ahead of us)
 */
const keys = [
  { wp: 0, az: 2.9, r: 9.5, h: 2.4, lookY: 3.3, ahead: 0, fov: 52 }, // hero: low three-quarter front view
  { wp: 0.9, az: 1.3, r: 6.4, h: 2.2, lookY: 1.7, ahead: 1.5, fov: 44 },
  { wp: 1.8, az: 0.25, r: 6.6, h: 2.6, lookY: 1.4, ahead: 3.5, fov: 44 },
  { wp: 3.2, az: -0.15, r: 7.4, h: 2.9, lookY: 1.8, ahead: 5, fov: 46 }, // gate
  { wp: 4.6, az: 0.5, r: 6.6, h: 2.5, lookY: 1.5, ahead: 3, fov: 46 },
  { wp: 5.6, az: -0.35, r: 7.2, h: 2.7, lookY: 1.4, ahead: 1.5, fov: 46 },
  { wp: 6, az: -1.15, r: 8.6, h: 3.0, lookY: 1.5, ahead: 0.5, fov: 46 }, // clearing: side view of the stones
  { wp: 6.8, az: 0.3, r: 7.4, h: 2.8, lookY: 1.5, ahead: 2.5, fov: 46 },
  { wp: 8.3, az: 0.1, r: 7.2, h: 3.4, lookY: 2.6, ahead: 6, fov: 48 },
  { wp: 9, az: 0.0, r: 7.4, h: 2.3, lookY: 3.6, ahead: 6, fov: 50 }, // gaze up at the Citadel
  { wp: 10, az: 0.85, r: 6.0, h: 2.3, lookY: 1.5, ahead: 1.5, fov: 48 },
  { wp: 12, az: -0.85, r: 6.2, h: 2.4, lookY: 1.5, ahead: 1.5, fov: 48 },
  { wp: 13.5, az: 0.3, r: 6.4, h: 2.4, lookY: 1.5, ahead: 3, fov: 48 },
  { wp: 15.3, az: 0.05, r: 7.2, h: 2.4, lookY: 2.2, ahead: 6, fov: 50 }, // hall entrance
  { wp: 17, az: 0.0, r: 7.0, h: 2.6, lookY: 1.8, ahead: 5, fov: 50 },
  { wp: 18, az: 0.35, r: 6.4, h: 2.3, lookY: 1.8, ahead: 4, fov: 50 },
  { wp: 19.5, az: 0.0, r: 8.2, h: 3.0, lookY: 2.4, ahead: 8, fov: 50 },
  { wp: 21, az: 0.22, r: 11.5, h: 4.4, lookY: 6.2, ahead: 18, fov: 54 }, // approach the gate
]

const out = { az: 0, r: 0, h: 0, lookY: 0, ahead: 0, fov: 0 }
export function cameraProfileAt(f) {
  const w = wpAt(f)
  let i = 0
  while (i < keys.length - 2 && keys[i + 1].wp < w) i++
  const a = keys[i]
  const b = keys[i + 1]
  const t = Math.min(1, Math.max(0, (w - a.wp) / (b.wp - a.wp)))
  const k = t * t * (3 - 2 * t)
  for (const key of Object.keys(out)) out[key] = a[key] + (b[key] - a[key]) * k
  return out
}
