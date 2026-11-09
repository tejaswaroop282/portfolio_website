import { skillGroups } from '../data/skills'
import { select, closePanel } from '../hooks/useWorldProgress'
import PanelShell from './PanelShell'

/** Body of a skill category (also used by the classic view). */
export function SkillDetail({ group }) {
  return (
    <div className="detail">
      <section>
        <h3 className="sec-title">Technologies</h3>
        <ul className="chip-row">
          {group.items.map((t) => (
            <li key={t} className="chip">
              {t}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h3 className="sec-title">Where I have used it</h3>
        <ul className="bullets">
          {group.evidence.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      </section>
      <p className="fineprint">No self-rated percentages: each line above points to work that exists in my resume or repositories.</p>
    </div>
  )
}

export default function SkillPanel({ id }) {
  const i = skillGroups.findIndex((g) => g.id === id)
  const group = skillGroups[i]
  if (!group) return null
  const prev = skillGroups[i - 1]
  const next = skillGroups[i + 1]
  return (
    <PanelShell
      kicker="The Enchanted Forest · Skills"
      title={group.name}
      onClose={closePanel}
      onPrev={prev && (() => select('skill', prev.id))}
      onNext={next && (() => select('skill', next.id))}
      prevLabel={prev?.name}
      nextLabel={next?.name}
    >
      <SkillDetail group={group} />
    </PanelShell>
  )
}
