import { useEffect, useRef } from 'react'
import { locations, profile } from '../data/profile'
import { useUI, setUI, world } from '../hooks/useWorldProgress'
import { travelTo } from '../animations/scrollController'
import { Crest, IconDownload } from './Icons'

/**
 * Persistent navigation: HOME | SKILLS | PROJECTS | JOURNEY | CONTACT.
 * In the 3D world it sends the explorer walking to the chosen place (the page scrolls, he follows);
 * in the classic view it scrolls to the matching section.
 */
export default function Navbar({ classic = false, canEnterWorld = false }) {
  const section = useUI((s) => s.section)
  const bar = useRef()

  useEffect(() => {
    if (classic) return
    let raf
    const tick = () => {
      if (bar.current) bar.current.style.transform = `scaleX(${world.target})`
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [classic])

  const go = (e, id) => {
    if (classic) return // plain #anchor links
    e.preventDefault()
    travelTo(id)
  }

  return (
    <>
      <header className="nav-top">
        <a className="nav-brand" href="#home" onClick={(e) => go(e, 'home')} aria-label="The Kingdom of Code — home">
          <Crest size={34} />
          <span className="display nav-brand-text">
            <span>The Kingdom</span>
            <span>of Code</span>
          </span>
        </a>
        <nav className="nav-links nav-desktop" aria-label="Locations">
          {locations.map((l, i) => (
            <a key={l.id} href={`#${l.id}`} onClick={(e) => go(e, l.id)} className={!classic && section === i ? 'active' : ''} aria-current={!classic && section === i ? 'location' : undefined}>
              {l.nav}
            </a>
          ))}
        </nav>
        <div className="nav-actions">
          {classic && canEnterWorld && (
            <button type="button" className="nav-mini" onClick={() => setUI({ mode: 'world' })}>
              Enter the kingdom
            </button>
          )}
          {!classic && (
            <button type="button" className="nav-mini" onClick={() => setUI({ mode: 'classic' })} title="Plain, fast, fully readable version of everything on this site">
              Classic view
            </button>
          )}
          <a className="nav-mini nav-resume" href={profile.links.resume} download>
            <IconDownload width={14} height={14} /> <span>Resume</span>
          </a>
        </div>
        {!classic && <div className="nav-progress" aria-hidden="true"><div ref={bar} className="nav-progress-bar" /></div>}
      </header>
      <nav className="nav-bottom" aria-label="Locations (mobile)">
        {locations.map((l, i) => (
          <a key={l.id} href={`#${l.id}`} onClick={(e) => go(e, l.id)} className={!classic && section === i ? 'active' : ''}>
            {l.nav}
          </a>
        ))}
      </nav>
    </>
  )
}
