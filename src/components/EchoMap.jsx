import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { echoStrength } from '../lib/threads'
import { B, derive, hex2, toHex } from '../lib/cyanotype/print'
import { bookId, usePrintInfo } from '../lib/cyanotype/theme'

// The echoes, in columns (the approved Cyanotype layout): the passage being read is the
// medallion in the middle; echoes from before Jesus stand in a column on the left and
// from after Jesus on the right, each in Bible order on its own row, so no circle or
// name ever sits on another. Nearer the centre is a stronger echo. Each circle is in
// the colour of the book it comes from.
const MED = 28, RMAX = 9
const G = [MED + RMAX + 12, MED + RMAX + 32, MED + RMAX + 52]   // Strong, Clear, Light
const R = [0, 4, 6, 8.5]
const SHORT = ['Gen', 'Exod', 'Lev', 'Num', 'Deut', 'Josh', 'Judg', 'Ruth', '1 Sam', '2 Sam', '1 Kgs', '2 Kgs', '1 Chr', '2 Chr',
  'Ezra', 'Neh', 'Esth', 'Job', 'Ps', 'Prov', 'Eccl', 'Song', 'Isa', 'Jer', 'Lam', 'Ezek', 'Dan', 'Hos', 'Joel', 'Amos', 'Obad',
  'Jonah', 'Mic', 'Nah', 'Hab', 'Zeph', 'Hag', 'Zech', 'Mal', 'Matt', 'Mark', 'Luke', 'John', 'Acts', 'Rom', '1 Cor', '2 Cor',
  'Gal', 'Eph', 'Phil', 'Col', '1 Thess', '2 Thess', '1 Tim', '2 Tim', 'Titus', 'Phlm', 'Heb', 'Jas', '1 Pet', '2 Pet',
  '1 John', '2 John', '3 John', 'Jude', 'Rev']
const ROW = 22

let ctx
function measure(text, size) {
  ctx ||= document.createElement('canvas').getContext('2d')
  ctx.font = `italic 400 ${size}px Newsreader, serif`
  return ctx.measureText(text).width
}

function layout(items, W) {
  const sides = [items.filter(t => !t.nt), items.filter(t => t.nt)]
  const most = Math.max(1, ...sides.map(s => s.length))
  const H = Math.max(300, Math.min(30 + 26 + most * ROW + 10, 2000))
  const cx = W / 2, cy = H / 2 + 6, top = 30, bot = H - 26
  const nodes = []
  sides.forEach((list, k) => {
    const sd = k === 0 ? -1 : 1
    const sorted = list.slice().sort((p, q) => p.bookIndex - q.bookIndex || p.chapter - q.chapter || p.v1 - q.v1)
    const n = sorted.length, stepY = n > 1 ? Math.min(42, (bot - top) / (n - 1)) : 0, y0 = cy - stepY * (n - 1) / 2
    sorted.forEach((t, i) => {
      const s = echoStrength(t.votes)[0]
      const x = cx + sd * G[3 - s], y = y0 + i * stepY, r = R[s]
      const sp = t.ref.lastIndexOf(' '), book = t.ref.slice(0, sp), verse = t.ref.slice(sp + 1)
      const lx = x + sd * (r + 5), room = sd < 0 ? lx - 4 : W - 4 - lx
      // the full name if it fits, else a little smaller, else the usual short form
      let name = `${book} ${verse}`, size = 12
      const w = measure(name, 12)
      if (w > room) {
        if (12 * room / w >= 10.5) size = 12 * room / w
        else { name = `${SHORT[t.bookIndex] || book} ${verse}`; size = Math.min(12, Math.max(8.5, 12 * room / measure(name, 12))) }
      }
      nodes.push({ key: t.key, t, s, sd, x, y, r, lx, name, full: t.ref, size })
    })
  })
  return { nodes, H, cx, cy }
}

export default function EchoMap({ center, items, focus, onFocus, onPick, label }) {
  const box = useRef(null)
  const [W, setW] = useState(0)
  const [ready, setReady] = useState(0)
  const info = usePrintInfo()
  const [line1, line2] = center

  useLayoutEffect(() => {
    const ro = new ResizeObserver(([e]) => { if (e.contentRect.width) setW(Math.round(e.contentRect.width)) })
    ro.observe(box.current)
    document.fonts?.ready.then(() => setReady(r => r + 1))
    return () => ro.disconnect()
  }, [])

  const map = useMemo(() => (W ? layout(items, W) : null), [items, W, ready]) // eslint-disable-line react-hooks/exhaustive-deps
  const on = focus && map?.nodes.some(n => n.key === focus) ? focus : null
  const book = info?.book || 'Genesis'
  const hex = B[bookId(book)][5]
  const medInk = toHex(derive(hex, hex2(hex)).ink.c)
  const medSize = Math.min(12, 12 * (MED * 2 - 8) / Math.max(1, measure(line1, 12)))

  return (
    <figure className={`echo-map${on ? ' has-focus' : ''}`}>
      <div ref={box} className="em-box">
        {map && (
          <svg width={W} height={map.H} viewBox={`0 0 ${W} ${map.H}`} role="img" aria-label={label}>
            <text x="4" y="11" className="em-side">BEFORE JESUS</text>
            <text x={W - 4} y="11" className="em-side" textAnchor="end">AFTER JESUS</text>
            {[-1, 1].map(sd => G.map((g, k) => (
              <line key={`${sd}${k}`} x1={map.cx + sd * g} x2={map.cx + sd * g} y1="22" y2={map.H - 16}
                className={`em-guide g${k}`} strokeDasharray={k === 2 ? '2 4' : undefined} />
            )))}
            <text x={map.cx} y={map.H - 3} className="em-side" textAnchor="middle">NEARER THE CENTRE = A STRONGER ECHO</text>

            {map.nodes.map(n => {
              const sx = map.cx + n.sd * MED, ex = n.x - n.sd * n.r, k = n.s / 3
              return <path key={`l${n.key}`} className={`em-line${on === n.key ? ' on' : ''}`} fill="none"
                d={`M${sx} ${map.cy} C${sx + n.sd * 18} ${map.cy} ${ex - n.sd * 18} ${n.y} ${ex} ${n.y}`}
                style={{ opacity: 0.22 + 0.45 * k + (on === n.key ? 0.3 : 0) }} strokeWidth={0.6 + 1.4 * k} />
            })}

            {map.nodes.map(n => (
              <g key={n.key} className={`em-star s${n.s}${on === n.key ? ' on' : ''}`} tabIndex={-1}
                onPointerEnter={() => onFocus(n.key)} onClick={() => onPick(n.key)}>
                <rect x={n.sd < 0 ? 0 : n.x - n.r - 3} y={n.y - 10} width={n.sd < 0 ? n.x + n.r + 3 : W - (n.x - n.r - 3)} height="20" className="em-hit" />
                <circle cx={n.x} cy={n.y} r={n.r} fill={B[n.t.bookIndex]?.[5] || 'currentColor'} className="em-dot" />
                <text x={n.lx} y={n.y + 4} textAnchor={n.sd < 0 ? 'end' : 'start'} className="em-name" style={{ fontSize: `${n.size.toFixed(1)}px` }}>
                  {n.name}{n.name !== n.full && <title>{n.full}</title>}
                </text>
              </g>
            ))}

            <circle cx={map.cx} cy={map.cy} r={MED} fill={hex} className="em-med" />
            <text x={map.cx} y={map.cy + 4} textAnchor="middle" fill={medInk} className="em-med-t" style={{ fontSize: `${medSize.toFixed(1)}px` }}>{line1}</text>
            <text x={map.cx} y={map.cy + MED + 13} textAnchor="middle" className="em-side">{String(line2).toUpperCase()}</text>
          </svg>
        )}
      </div>
      <figcaption className="em-key">Tap a name to read it</figcaption>
    </figure>
  )
}
