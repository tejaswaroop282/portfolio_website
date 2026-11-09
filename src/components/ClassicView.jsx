import { profile, locations } from '../data/profile'
import { skillGroups } from '../data/skills'
import { projects, archive } from '../data/projects'
import { education, experience, certifications, milestones, hallItems } from '../data/achievements'
import { SkillDetail } from './SkillPanel'
import { ProjectDetail } from './ProjectPanel'
import { AchievementDetail } from './AchievementPanel'
import ContactPanel from './ContactPanel'
import Navbar from './Navbar'
import { setUI } from '../hooks/useWorldProgress'
import { IconGithub, IconLinkedin, IconDownload, IconExternal } from './Icons'

/**
 * The classic view: every piece of information on the site as a plain, fast, accessible page — no WebGL,
 * no scroll-driven motion. Used for reduced-motion users, devices without WebGL, and as an opt-in toggle.
 */
export default function ClassicView({ reason, canEnterWorld }) {
  const { links } = profile
  return (
    <div className="classic">
      <Navbar classic canEnterWorld={canEnterWorld} />
      <main>
        {reason && (
          <p className="classic-notice" role="note">
            {reason}
            {canEnterWorld && (
              <>
                {' '}
                <button type="button" className="link-btn" onClick={() => setUI({ mode: 'world' })}>
                  Enter the 3D kingdom anyway
                </button>
              </>
            )}
          </p>
        )}

        <section id="home" className="classic-section classic-hero">
          <p className="hero-kicker display">Welcome, traveller.</p>
          <h1 className="display hero-name">{profile.name}</h1>
          <p className="hero-title">{profile.title}</p>
          <p className="hero-intro">{profile.intro}</p>
          <ul className="chip-row hero-chips">
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
        </section>

        <section id="skills" className="classic-section">
          <SectionHead loc={locations[1]} />
          <div className="classic-grid">
            {skillGroups.map((g) => (
              <article key={g.id} className="stone-panel classic-card">
                <h3 className="display card-title">{g.name}</h3>
                <SkillDetail group={g} />
              </article>
            ))}
          </div>
        </section>

        <section id="projects" className="classic-section">
          <SectionHead loc={locations[2]} />
          <div className="classic-stack">
            {projects.map((p) => (
              <article key={p.id} className="stone-panel classic-card" id={`project-${p.id}`}>
                <header className="classic-card-head">
                  <h3 className="display card-title">{p.name}</h3>
                  <p className="panel-sub">{p.subtitle}</p>
                </header>
                <ProjectDetail project={p} />
              </article>
            ))}
          </div>
          <h3 className="display archive-title">More scrolls in the archive</h3>
          <ul className="archive-list">
            {archive.map((a) => (
              <li key={a.name} className="stone-panel">
                <a href={a.repo} target="_blank" rel="noreferrer noopener">
                  <strong>
                    {a.name} <IconExternal width={13} height={13} />
                  </strong>
                </a>
                <p>{a.text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section id="journey" className="classic-section">
          <SectionHead loc={locations[3]} />
          <div className="classic-grid">
            {[...education, ...experience, ...certifications, ...milestones].map((item) => {
              const full = hallItems.find((h) => h.id === item.id) || item
              return (
                <article key={item.id} className="stone-panel classic-card">
                  <h3 className="display card-title">{item.title}</h3>
                  <AchievementDetail item={full} />
                </article>
              )
            })}
          </div>
        </section>

        <section id="contact" className="classic-section classic-contact">
          <SectionHead loc={locations[4]} />
          <div className="stone-panel classic-card">
            <ContactPanel />
          </div>
        </section>
      </main>
      <footer className="classic-foot">
        <p>{profile.name} · Portfolio</p>
      </footer>
    </div>
  )
}

function SectionHead({ loc }) {
  return (
    <header className="classic-head">
      <p className="card-kicker">{loc.nav}</p>
      <h2 className="display classic-h2">{loc.name}</h2>
      <hr className="gold-rule" />
    </header>
  )
}
