import { useEffect, useRef } from 'react'
import { useUI, closePanel } from '../hooks/useWorldProgress'
import SkillPanel from './SkillPanel'
import ProjectPanel from './ProjectPanel'
import AchievementPanel from './AchievementPanel'

const BODIES = { skill: SkillPanel, project: ProjectPanel, achievement: AchievementPanel }

/** The information layer: a parchment dialog that opens when a 3D object (or its DOM twin) is chosen. */
export default function InfoPanel() {
  const selection = useUI((s) => s.selection)
  const ref = useRef()
  const lastFocus = useRef(null)

  useEffect(() => {
    document.body.classList.toggle('panel-open', !!selection)
    if (selection) {
      lastFocus.current = document.activeElement
      requestAnimationFrame(() => ref.current?.querySelector('.panel-close')?.focus())
    } else if (lastFocus.current) {
      lastFocus.current.focus?.()
      lastFocus.current = null
    }
    return () => document.body.classList.remove('panel-open')
  }, [selection])

  useEffect(() => {
    if (!selection) return
    const onKey = (e) => {
      if (e.key === 'Escape') closePanel()
      if (e.key === 'Tab' && ref.current) {
        const f = ref.current.querySelectorAll('a[href],button:not([disabled])')
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selection])

  if (!selection) return null
  const Body = BODIES[selection.type]
  if (!Body) return null
  return (
    <div className="panel-backdrop fadein" onMouseDown={(e) => e.target === e.currentTarget && closePanel()}>
      <div ref={ref} className={`panel parchment rise panel-${selection.type}`} role="dialog" aria-modal="true" aria-labelledby="panel-title">
        <Body id={selection.id} />
      </div>
    </div>
  )
}
