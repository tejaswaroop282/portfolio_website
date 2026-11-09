/**
 * Generic architecture diagram. Data shape (see data/projects.js):
 *   { nodes: [{ id, label, sub, col, row }], edges: [[fromId, toId]], caption }
 * Colours use currentColor so the same diagram works on parchment and on dark panels.
 */
const W = 176
const H = 78
const GX = 44
const GY = 26

function wrap(text = '', max) {
  const words = text.split(' ')
  const lines = []
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      lines.push(cur)
      cur = w
    } else cur = (cur + ' ' + w).trim()
  }
  if (cur) lines.push(cur)
  return lines
}

export default function ArchDiagram({ arch, title = 'Architecture' }) {
  const cols = Math.max(...arch.nodes.map((n) => n.col)) + 1
  const rows = Math.max(...arch.nodes.map((n) => n.row)) + 1
  const width = cols * W + (cols - 1) * GX
  const height = rows * H + (rows - 1) * GY
  const pos = Object.fromEntries(arch.nodes.map((n) => [n.id, { x: n.col * (W + GX), y: n.row * (H + GY), n }]))

  const edge = ([a, b], i) => {
    const A = pos[a]
    const B = pos[b]
    if (!A || !B) return null
    let x1, y1, x2, y2, d
    if (A.n.col < B.n.col) {
      x1 = A.x + W
      y1 = A.y + H / 2
      x2 = B.x
      y2 = B.y + H / 2
      const mx = (x1 + x2) / 2
      d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`
    } else if (A.n.col > B.n.col) {
      x1 = A.x
      y1 = A.y + H / 2
      x2 = B.x + W
      y2 = B.y + H / 2
      const mx = (x1 + x2) / 2
      d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`
    } else {
      const down = A.n.row < B.n.row
      x1 = x2 = A.x + W / 2
      y1 = down ? A.y + H : A.y
      y2 = down ? B.y : B.y + H
      d = `M${x1},${y1} L${x2},${y2}`
    }
    return <path key={i} d={d} fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1.5" markerEnd="url(#arrow)" />
  }

  return (
    <figure className="arch-figure">
      <div className="arch-scroll thin-scroll">
        <svg viewBox={`-6 -6 ${width + 12} ${height + 12}`} width={width + 12} height={height + 12} role="img" aria-label={`${title}: ${arch.nodes.map((n) => n.label).join(', ')}`} style={{ minWidth: Math.min(width, 980) }}>
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="currentColor" fillOpacity="0.7" />
            </marker>
          </defs>
          {arch.edges.map(edge)}
          {arch.nodes.map((n) => {
            const { x, y } = pos[n.id]
            const label = wrap(n.label, 22)
            const sub = wrap(n.sub, 29).slice(0, 3)
            const total = label.length + sub.length
            const lh = 14
            const start = y + H / 2 - (total * lh) / 2 + 10
            return (
              <g key={n.id}>
                <rect x={x} y={y} width={W} height={H} rx="2" fill="currentColor" fillOpacity="0.07" stroke="currentColor" strokeOpacity="0.5" />
                <rect x={x} y={y} width="3" height={H} fill="#c9a24a" />
                {label.map((t, i) => (
                  <text key={'l' + i} x={x + W / 2} y={start + i * lh} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="currentColor" fontFamily="var(--font-sans)">
                    {t}
                  </text>
                ))}
                {sub.map((t, i) => (
                  <text key={'s' + i} x={x + W / 2} y={start + (label.length + i) * lh} textAnchor="middle" fontSize="10.5" fill="currentColor" fillOpacity="0.72" fontFamily="var(--font-sans)">
                    {t}
                  </text>
                ))}
              </g>
            )
          })}
        </svg>
      </div>
      {arch.caption && <figcaption className="arch-caption">{arch.caption}</figcaption>}
    </figure>
  )
}
