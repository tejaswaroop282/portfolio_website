import { hallItems } from '../data/achievements'
import { select, closePanel } from '../hooks/useWorldProgress'
import PanelShell from './PanelShell'
import { IconExternal } from './Icons'

const KIND = { degree: 'Education', school: 'Education', internship: 'Experience', certification: 'Certification', achievement: 'Achievement' }

export function AchievementDetail({ item }) {
  return (
    <div className="detail">
      <dl className="facts">
        {item.org && (
          <>
            <dt>{item.kind === 'achievement' ? 'Platforms' : 'Institution'}</dt>
            <dd>{item.org}</dd>
          </>
        )}
        {item.place && (
          <>
            <dt>Location</dt>
            <dd>{item.place}</dd>
          </>
        )}
        {item.period && (
          <>
            <dt>Period</dt>
            <dd>{item.period}</dd>
          </>
        )}
        {item.detail && (
          <>
            <dt>{item.kind === 'degree' || item.kind === 'school' ? 'Result' : 'Detail'}</dt>
            <dd>{item.detail}</dd>
          </>
        )}
      </dl>
      {item.bullets && (
        <section>
          <h3 className="sec-title">What I did</h3>
          <ul className="bullets">
            {item.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>
      )}
      {item.link && (
        <div className="link-row">
          <a className="btn-gold" href={item.link} target="_blank" rel="noreferrer noopener">
            <IconExternal /> {item.linkLabel || 'Open'}
          </a>
        </div>
      )}
    </div>
  )
}

export default function AchievementPanel({ id }) {
  const i = hallItems.findIndex((h) => h.id === id)
  const item = hallItems[i]
  if (!item) return null
  const prev = hallItems[i - 1]
  const next = hallItems[i + 1]
  return (
    <PanelShell
      kicker={`The Hall of Achievements · ${KIND[item.kind]}`}
      title={item.title}
      onClose={closePanel}
      onPrev={prev && (() => select('achievement', prev.id))}
      onNext={next && (() => select('achievement', next.id))}
      prevLabel={prev?.label}
      nextLabel={next?.label}
    >
      <AchievementDetail item={item} />
    </PanelShell>
  )
}
