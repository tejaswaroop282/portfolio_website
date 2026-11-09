import { useEffect, useState } from 'react'
import gsap from 'gsap'
import { useUI, setUI, world } from '../hooks/useWorldProgress'
import { Crest } from './Icons'

const LINES = ['Raising the banners…', 'Lighting the torches…', 'Clearing the forest path…', 'Opening the Citadel…', 'Polishing the gates…']

/** Cinematic loading screen. Fades into the kingdom once the 3D scene has rendered; can be skipped at any time. */
export default function LoadingScreen() {
  const loaded = useUI((s) => s.loaded)
  const entered = useUI((s) => s.entered)
  const reduced = useUI((s) => s.reducedMotion)
  const [pct, setPct] = useState(4)
  const [gone, setGone] = useState(false)

  // Progress creeps towards 90% and completes when the scene is ready.
  useEffect(() => {
    let raf
    let p = 4
    const t0 = performance.now()
    const tick = () => {
      const target = getTarget()
      p += (target - p) * 0.06
      setPct(Math.round(p))
      raf = requestAnimationFrame(tick)
    }
    const getTarget = () => (window.__kingdomReady ? 100 : Math.min(90, 12 + (performance.now() - t0) / 40))
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])
  useEffect(() => {
    window.__kingdomReady = loaded
  }, [loaded])

  const enter = (skip = false) => {
    if (getEntered()) return
    setUI({ entered: true })
    gsap.killTweensOf(world)
    if (skip || reduced) world.introT = 1
    else gsap.to(world, { introT: 1, duration: 4, ease: 'power2.inOut', delay: 0.5 })
    setTimeout(() => setGone(true), 1100)
  }
  const getEntered = () => entered

  // Auto-enter shortly after the scene is ready and the bar has filled.
  useEffect(() => {
    if (loaded && pct >= 99 && !entered) {
      const t = setTimeout(() => enter(false), 650)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, pct, entered])

  // Any scroll / key during the camera sweep skips it, so the page never feels stuck.
  useEffect(() => {
    if (!entered) return
    const skip = () => {
      if (world.introT < 1) {
        gsap.killTweensOf(world)
        gsap.to(world, { introT: 1, duration: 0.6, ease: 'power2.out' })
      }
    }
    window.addEventListener('wheel', skip, { passive: true })
    window.addEventListener('touchmove', skip, { passive: true })
    window.addEventListener('keydown', skip)
    return () => {
      window.removeEventListener('wheel', skip)
      window.removeEventListener('touchmove', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [entered])

  useEffect(() => {
    document.body.classList.toggle('loading', !entered)
    return () => document.body.classList.remove('loading')
  }, [entered])

  if (gone) return null
  return (
    <div className={`loading ${entered ? 'loading-out' : ''}`} role="status" aria-live="polite">
      <div className="loading-inner">
        <div className="loading-crest">
          <Crest size={96} />
        </div>
        <h1 className="display loading-title">The Kingdom of Code</h1>
        <p className="loading-sub">An explorable portfolio of Tejaswaroop Reddy Yanamala</p>
        <div className="loading-bar" aria-hidden="true">
          <div style={{ width: `${pct}%` }} />
        </div>
        <p className="loading-line">{pct >= 99 ? 'The gates are open.' : LINES[Math.min(LINES.length - 1, Math.floor(pct / 20))]}</p>
        <div className="loading-actions">
          <button type="button" className="btn-ghost" onClick={() => enter(true)}>
            Skip intro
          </button>
          <button type="button" className="btn-ghost" onClick={() => setUI({ mode: 'classic' })}>
            Classic view
          </button>
        </div>
      </div>
    </div>
  )
}
