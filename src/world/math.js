import * as THREE from 'three'

export const damp = THREE.MathUtils.damp

/** Frame-rate independent smoothing of an angle (shortest way round). */
export function dampAngle(a, b, lambda, dt) {
  let d = (b - a) % (Math.PI * 2)
  if (d > Math.PI) d -= Math.PI * 2
  if (d < -Math.PI) d += Math.PI * 2
  return a + d * (1 - Math.exp(-lambda * dt))
}
