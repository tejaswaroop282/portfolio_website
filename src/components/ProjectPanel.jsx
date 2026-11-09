import { projects } from '../data/projects'
import { select, closePanel } from '../hooks/useWorldProgress'
import PanelShell from './PanelShell'
import ArchDiagram from './ArchDiagram'
import { IconGithub, IconExternal } from './Icons'

/** Full project write-up (also used by the classic view). */
export function ProjectDetail({ project: p }) {
  return (
    <div className="detail">
      <p className="status-line">
        <strong>Status:</strong> {p.status}
      </p>

      <div className="two-col">
        <section>
          <h3 className="sec-title">The problem</h3>
          <p>{p.problem}</p>
        </section>
        <section>
          <h3 className="sec-title">Why it exists</h3>
          <p>{p.why}</p>
        </section>
      </div>

      <section>
        <h3 className="sec-title">Technology</h3>
        <ul className="chip-row">
          {p.stack.map((t) => (
            <li key={t} className="chip">
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="sec-title">Architecture</h3>
        <ArchDiagram arch={p.arch} title={`${p.name} architecture`} />
      </section>

      <section>
        <h3 className="sec-title">Engineering decisions</h3>
        <ul className="bullets">
          {p.decisions.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="sec-title">Technical challenges</h3>
        <div className="challenge-list">
          {p.challenges.map((c) => (
            <div key={c.title} className="challenge">
              <h4>{c.title}</h4>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {p.results?.length > 0 && (
        <section>
          <h3 className="sec-title">Results</h3>
          <div className="stat-grid">
            {p.results.map((r) => (
              <div key={r.label} className="stat">
                <div className="stat-value">{r.value}</div>
                <div className="stat-label">{r.label}</div>
              </div>
            ))}
          </div>
          {p.resultsNote && <p className="fineprint">{p.resultsNote}</p>}
        </section>
      )}

      <div className="link-row">
        <a className="btn-gold" href={p.repo} target="_blank" rel="noreferrer noopener">
          <IconGithub /> View repository
        </a>
        {p.live && (
          <a className="btn-ghost" href={p.live} target="_blank" rel="noreferrer noopener">
            <IconExternal /> Live demo
          </a>
        )}
      </div>
    </div>
  )
}

export default function ProjectPanel({ id }) {
  const i = projects.findIndex((p) => p.id === id)
  const p = projects[i]
  if (!p) return null
  const prev = projects[i - 1]
  const next = projects[i + 1]
  return (
    <PanelShell
      kicker={`The Citadel · Project ${i + 1} of ${projects.length}`}
      title={p.name}
      subtitle={p.subtitle}
      onClose={closePanel}
      onPrev={prev && (() => select('project', prev.id))}
      onNext={next && (() => select('project', next.id))}
      prevLabel={prev?.name}
      nextLabel={next?.name}
    >
      <ProjectDetail project={p} />
    </PanelShell>
  )
}
