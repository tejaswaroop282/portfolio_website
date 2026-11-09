import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { world } from '../hooks/useWorldProgress'
import { navTargets, sToF } from '../world/journey'
import { TOTAL } from '../world/WorldPath'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
// Real-time tweens even when frames are slow (a heavy 3D frame must not stretch the intro/travel durations).
gsap.ticker.lagSmoothing(0)

const WALK_MAX = 7.5 // m/s while following ordinary scrolling
const SPRINT_MAX = 26 // m/s while travelling to a nav target

/**
 * Binds the page scroll to world.target using GSAP ScrollTrigger. The 3D scene never reads the DOM:
 * it reads world.target and eases towards it (see stepWorld).
 */
export function createScrollController(trigger) {
  const st = ScrollTrigger.create({
    trigger,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      world.target = self.progress
    },
  })
  world.target = st.progress
  return () => st.kill()
}

/** Smoothly scroll the page to a location; the character keeps walking along the path to follow. */
export function travelTo(id) {
  const s = navTargets[id]
  if (s == null) return
  const max = document.documentElement.scrollHeight - window.innerHeight
  const from = window.scrollY
  const to = s * max
  const dist = Math.abs(to - from) / Math.max(1, max)
  world.fast = dist > 0.04
  world.travelling = world.fast
  gsap.to(window, {
    scrollTo: { y: to, autoKill: true },
    duration: Math.min(2.4, 0.7 + dist * 3),
    ease: 'power2.inOut',
    // The page scroll finishes quickly; the explorer keeps sprinting until he has actually caught up (see stepWorld).
    onComplete: () => {
      world.travelling = false
    },
    onInterrupt: () => {
      world.travelling = false
    },
  })
}

/** Advance the smoothed path fraction towards the scroll target. Returns the new speed (m/s). */
export function stepWorld(dt, reduced) {
  const targetF = sToF(world.target)
  const diff = targetF - world.f
  if (reduced) {
    world.f = targetF
    world.speed = 0
    return
  }
  const maxStep = ((world.fast ? SPRINT_MAX : WALK_MAX) * dt) / TOTAL
  const eased = diff * (1 - Math.exp(-3.2 * dt))
  const step = Math.max(-maxStep, Math.min(maxStep, eased))
  world.f += step
  if (world.fast && !world.travelling && Math.abs(targetF - world.f) < 0.0006) world.fast = false
  const inst = (Math.abs(step) * TOTAL) / Math.max(dt, 1e-4)
  world.speed += (inst - world.speed) * (1 - Math.exp(-10 * dt))
}
