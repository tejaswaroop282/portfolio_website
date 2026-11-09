import { IconClose, IconArrow } from './Icons'

/** Chrome shared by every information panel: kicker, title, close and prev/next controls. */
export default function PanelShell({ kicker, title, subtitle, onClose, onPrev, onNext, prevLabel, nextLabel, children }) {
  return (
    <>
      <header className="panel-head">
        <div>
          <p className="panel-kicker">{kicker}</p>
          <h2 id="panel-title" className="display panel-title">
            {title}
          </h2>
          {subtitle && <p className="panel-sub">{subtitle}</p>}
        </div>
        <button type="button" className="panel-close" onClick={onClose} aria-label="Close panel">
          <IconClose width={20} height={20} />
        </button>
      </header>
      <hr className="gold-rule" />
      <div className="panel-body thin-scroll">{children}</div>
      {(onPrev || onNext) && (
        <footer className="panel-foot">
          <button type="button" className="panel-step" onClick={onPrev} disabled={!onPrev}>
            <IconArrow dir="left" /> <span>{prevLabel || 'Previous'}</span>
          </button>
          <button type="button" className="panel-step" onClick={onNext} disabled={!onNext}>
            <span>{nextLabel || 'Next'}</span> <IconArrow />
          </button>
        </footer>
      )}
    </>
  )
}
