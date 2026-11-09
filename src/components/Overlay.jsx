import { useEffect, useState } from 'react'
import { locations, profile } from '../data/profile'
import { skillGroups } from '../data/skills'
import { projects, archive } from '../data/projects'
import { hallItems } from '../data/achievements'
import { useUI, select } from '../hooks/useWorldProgress'
import { travelTo } from '../animations/scrollController'
import ContactPanel from './ContactPanel'
import { IconGithub, IconLinkedin, IconDownload, IconArrow, IconExternal } from './Icons'

/**
 * LAYER B — the information interface that floats over the 3D world. The key facts of every location are
 * always visible here (no need to click a 3D object); clicking a row opens the same panel as the 3D object.
 */

function Hero() {
  const { links } = profile
  return (
    <section className="hero" aria-label="Introduction">
      <p className="hero-kicker display">Welcome, traveller.</p>
      <h1 className="display hero-name">{profile.name}</h1>
      <p className="hero-title">{profile.title}</p>
      <p className="hero-intro">{profile.intro}</p>
      <ul className="chip-row hero-chips" aria-label="Core interests">
        {profile.interests.map((i) => (
          <li key={i} className="chip">
            {i}
          </li>
        ))}
      </ul>
      <div className="link-row">
        <a className="btn-gold" href={links.resume} download>
          <IconDownload /> Resume
        </a>
        <a className="btn-ghost" href={links.github} target="_blank" rel="noreferrer noopener">
          <IconGithub /> GitHub
        </a>
        <a className="btn-ghost" href={links.linkedin} target="_blank" rel="noreferrer noopener">
          <IconLinkedin /> LinkedIn
        </a>
      </div>
      <button type="button" className="hero-scroll scroll-hint" onClick={() => travelTo('skills')}>
        <span>Scroll to follow the journey</span>
        <IconArrow dir="right" style={{ transform: 'rotate(90deg)' }} />
      </button>
    </section>
  )
}

function Row({ title, sub, active, onClick, tag }) {
  return (
    <li>
      <button type="button" className={`card-row ${active ? 'is-focus' : ''}`} onClick={onClick}>
        <span className="card-row-main">
          <span className="card-row-title">{title}</span>
          {sub && <span className="card-row-sub">{sub}</span>}
        </span>
        {tag && <span className="card-row-tag">{tag}</span>}
        <IconArrow />
      </button>
    </li>
  )
}

function SectionCard({ index, focus }) {
  const loc = locations[index]
  if (index === 1)
    return (
      <>
        <p className="card-lead">Six ancient stones, each holding a craft. Click a stone in the forest, or pick one here.</p>
        <ul className="card-list">
          {skillGroups.map((g) => (
            <Row key={g.id} title={g.name} sub={g.items.slice(0, 4).join(' · ') + (g.items.length > 4 ? ' …' : '')} active={focus?.type === 'skill' && focus.id === g.id} onClick={() => select('skill', g.id)} />
          ))}
        </ul>
      </>
    )
  if (index === 2)
    return (
      <>
        <p className="card-lead">Each tome on a lectern is a project I engineered. Walk up to one, click it, or choose below.</p>
        <ul className="card-list">
          {projects.map((p) => (
            <Row key={p.id} title={p.name} sub={p.subtitle} active={focus?.type === 'project' && focus.id === p.id} onClick={() => select('project', p.id)} />
          ))}
        </ul>
        <details className="card-more">
          <summary>More scrolls in the archive</summary>
          <ul>
            {archive.map((a) => (
              <li key={a.name}>
                <a href={a.repo} target="_blank" rel="noreferrer noopener">
                  {a.name} <IconExternal width={12} height={12} />
                </a>
              </li>
            ))}
          </ul>
        </details>
      </>
    )
  if (index === 3)
    return (
      <>
        <p className="card-lead">Degrees, experience and certifications, kept as artifacts. Approach one, click it, or pick below.</p>
        <ul className="card-list">
          {hallItems.map((h) => (
            <Row key={h.id} title={h.title} sub={[h.org, h.kind === 'degree' || h.kind === 'school' ? h.detail : null, h.period].filter(Boolean).join(' · ')} active={focus?.type === 'achievement' && focus.id === h.id} onClick={() => select('achievement', h.id)} />
          ))}
        </ul>
      </>
    )
  if (index === 4) return <ContactPanel compact />
  return <p className="card-lead">{loc.blurb}</p>
}

export default function Overlay() {
  const section = useUI((s) => s.section)
  const hero = useUI((s) => s.hero)
  const entered = useUI((s) => s.entered)
  const focus = useUI((s) => s.focus)
  const [hidden, setHidden] = useState(false)
  const [banner, setBanner] = useState(null)

  // Location title banner on arrival
  useEffect(() => {
    if (!entered || section === 0) return
    setBanner(section)
    const t = setTimeout(() => setBanner(null), 3600)
    return () => clearTimeout(t)
  }, [section, entered])
  useEffect(() => setHidden(false), [section])

  if (!entered) return null
  const loc = locations[section]
  return (
    <div className="overlay" aria-live="polite">
      {hero && section === 0 && <Hero />}
      {banner != null && !hero && (
        <div key={banner} className="location-banner" aria-hidden="true">
          <span className="location-banner-small">{String(banner + 1).padStart(2, '0')} · {locations[banner].nav}</span>
          <span className="display location-banner-name">{locations[banner].name}</span>
        </div>
      )}
      {section > 0 && (
        <aside className={`card stone-panel ${hidden ? 'card-hidden' : ''}`} aria-label={loc.name} id={loc.id}>
          <header className="card-head">
            <div>
              <p className="card-kicker">{loc.nav}</p>
              <h2 className="display card-title">{loc.name}</h2>
            </div>
            <button type="button" className="card-toggle" onClick={() => setHidden((h) => !h)} aria-expanded={!hidden}>
              {hidden ? 'Show' : 'Hide'}
            </button>
          </header>
          {!hidden && (
            <div className="card-body thin-scroll">
              <SectionCard index={section} focus={focus} />
            </div>
          )}
        </aside>
      )}
    </div>
  )
}
