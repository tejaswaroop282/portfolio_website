import * as THREE from 'three'
import { wpAt } from './WorldPath'

/**
 * Atmosphere keyframes, interpolated by (fractional) waypoint index while the character travels.
 * Palette: obsidian, charcoal, weathered stone, antique gold, muted forest green, subtle blue haze.
 */
const c = (h) => new THREE.Color(h)

export const envKeys = [
  // King's Landing — overcast, cool blue-grey, wide visibility
  { wp: 0, skyTop: c('#2f3c52'), skyBot: c('#9aa3ab'), fog: c('#8b949c'), density: 0.0072, hemiSky: c('#aab8cc'), hemiGround: c('#585046'), hemi: 1.25, sun: c('#ffe2b8'), sunI: 2.1, torch: 0 },
  { wp: 3.5, skyTop: c('#2f3c52'), skyBot: c('#9aa3ab'), fog: c('#8b949c'), density: 0.0075, hemiSky: c('#aab8cc'), hemiGround: c('#585046'), hemi: 1.25, sun: c('#ffe2b8'), sunI: 2.0, torch: 0 },
  // Enchanted Forest — green, dense, filtered light
  { wp: 5, skyTop: c('#1d2c30'), skyBot: c('#6a8274'), fog: c('#4a5f55'), density: 0.026, hemiSky: c('#9fbca8'), hemiGround: c('#3a4a34'), hemi: 1.1, sun: c('#d6e8c4'), sunI: 1.2, torch: 0 },
  { wp: 8, skyTop: c('#1d2c30'), skyBot: c('#6a8274'), fog: c('#4a5f55'), density: 0.024, hemiSky: c('#9fbca8'), hemiGround: c('#3a4a34'), hemi: 1.1, sun: c('#d6e8c4'), sunI: 1.1, torch: 0 },
  // Citadel — candle-lit dusk
  { wp: 9.3, skyTop: c('#14161f'), skyBot: c('#4a3a2c'), fog: c('#2c241d'), density: 0.015, hemiSky: c('#6c7894'), hemiGround: c('#2a1f16'), hemi: 1.05, sun: c('#ffb979'), sunI: 0.5, torch: 16 },
  { wp: 14, skyTop: c('#14161f'), skyBot: c('#4a3a2c'), fog: c('#2c241d'), density: 0.015, hemiSky: c('#6c7894'), hemiGround: c('#2a1f16'), hemi: 1.05, sun: c('#ffb979'), sunI: 0.5, torch: 16 },
  // Hall of Achievements — golden
  { wp: 15.4, skyTop: c('#2d2216'), skyBot: c('#c79a52'), fog: c('#6b4f2d'), density: 0.012, hemiSky: c('#d9b87a'), hemiGround: c('#2b1f12'), hemi: 1.0, sun: c('#ffd18a'), sunI: 1.9, torch: 14 },
  { wp: 18.5, skyTop: c('#2d2216'), skyBot: c('#c79a52'), fog: c('#6b4f2d'), density: 0.012, hemiSky: c('#d9b87a'), hemiGround: c('#2b1f12'), hemi: 1.0, sun: c('#ffd18a'), sunI: 1.8, torch: 14 },
  // Northern Gate — sunset over the mountains
  { wp: 20.2, skyTop: c('#252b4d'), skyBot: c('#e08a4f'), fog: c('#9a6a58'), density: 0.0075, hemiSky: c('#ffb98a'), hemiGround: c('#2a2230'), hemi: 1.05, sun: c('#ff9a52'), sunI: 2.6, torch: 9 },
  { wp: 21, skyTop: c('#252b4d'), skyBot: c('#e08a4f'), fog: c('#9a6a58'), density: 0.0075, hemiSky: c('#ffb98a'), hemiGround: c('#2a2230'), hemi: 1.05, sun: c('#ff9a52'), sunI: 2.6, torch: 9 },
]

const out = {
  skyTop: new THREE.Color(),
  skyBot: new THREE.Color(),
  fog: new THREE.Color(),
  density: 0,
  hemiSky: new THREE.Color(),
  hemiGround: new THREE.Color(),
  hemi: 0,
  sun: new THREE.Color(),
  sunI: 0,
  torch: 0,
}

export function envAt(f) {
  const w = wpAt(f)
  let i = 0
  while (i < envKeys.length - 2 && envKeys[i + 1].wp < w) i++
  const a = envKeys[i]
  const b = envKeys[i + 1]
  const t = Math.min(1, Math.max(0, (w - a.wp) / (b.wp - a.wp)))
  const k = t * t * (3 - 2 * t)
  for (const key of ['skyTop', 'skyBot', 'fog', 'hemiSky', 'hemiGround', 'sun']) out[key].copy(a[key]).lerp(b[key], k)
  for (const key of ['density', 'hemi', 'sunI', 'torch']) out[key] = a[key] + (b[key] - a[key]) * k
  return out
}
