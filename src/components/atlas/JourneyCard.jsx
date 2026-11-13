import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { getJourney } from '../../data/journeys'
import { GEO } from '../../data/coast'
import { toHex, rgba, DRN } from '../../lib/cyanotype/print'
import { useTranslationId } from '../../lib/translations'
import { bookId, usePrintInfo } from '../../lib/cyanotype/theme'
import { useT } from '../../lib/i18n'

// The books found only in Catholic Bibles have short journeys of their own.
const DEUTERO = {
  66: { n: 'Tobias’ journey', s: [['Nineveh', 36.36, 43.15, 'Tobit 1:10', 1], ['River Tigris', 35.2, 43.9, 'Tobit 6:2', 6], ['Ecbatana', 34.8, 48.52, 'Tobit 7:1', 7], ['Rages', 35.59, 51.43, 'Tobit 9:2', 9], ['Nineveh', 36.36, 43.15, 'Tobit 11:1', 11]] },
  67: { n: 'Holofernes’ campaign', s: [['Nineveh', 36.36, 43.15, 'Judith 2:4', 2], ['Damascus', 33.51, 36.29, 'Judith 2:27', 2], ['Bethulia', 32.4, 35.3, 'Judith 7:1', 7], ['Jerusalem', 31.778, 35.235, 'Judith 16:18', 16]] },
  68: { n: 'Where it was written', s: [['Alexandria', 31.2, 29.92, 'Wisdom 19:22', 19]] },
  69: { n: 'From Jerusalem to Alexandria', s: [['Jerusalem', 31.778, 35.235, 'Sirach 50:27', 50], ['Alexandria', 31.2, 29.92, 'Prologue', 1]] },
  70: { n: 'The letter from exile', s: [['Babylon', 32.54, 44.42, 'Baruch 1:1', 1], ['Jerusalem', 31.778, 35.235, 'Baruch 1:7', 1]] },
  71: { n: 'The Maccabean revolt', s: [['Modein', 31.93, 35.03, '1 Maccabees 2:1', 2], ['Emmaus', 31.84, 34.99, '1 Maccabees 3:57', 3], ['Jerusalem', 31.778, 35.235, '1 Maccabees 4:36', 4], ['Antioch', 36.2, 36.16, '1 Maccabees 6:63', 6]] },
  72: { n: 'Letters and martyrs', s: [['Jerusalem', 31.778, 35.235, '2 Maccabees 1:1', 1], ['Egypt', 31.2, 29.92, '2 Maccabees 1:1', 1], ['Antioch', 36.2, 36.16, '2 Maccabees 4:33', 4]] },
}

// [name, lat, lng, reference, chapter] for each stop of the journey being read.
function journeyOf(book, chapter) {
  const id = bookId(book)
  if (id >= 66) return DEUTERO[id] || null
  const j = getJourney(book, chapter)
  if (!j) return null
  return { n: j.name, s: j.waypoints.map(w => [w.name, w.lat, w.lng, (w.scripture || '').split(' — ')[0] || `${book} ${w.chapter}`, w.chapter]) }
}

function hiDpi(cv, W, H) {
  cv.width = W * 2; cv.height = H * 2; cv.style.width = `${W}px`; cv.style.height = `${H}px`
  const k = cv.getContext('2d'); k.scale(2, 2); return k
}

// The small engraved map, exactly as in the mockup: graticule, coasts and rivers, the
// route in the second colour, the stop being read ringed in the third.
function drawMap(cv, W, H, stops, here, o) {
  const k = hiDpi(cv, W, H), lo = stops.map(s => s[2]), la = stops.map(s => s[1])
  const cx = (Math.min(...lo) + Math.max(...lo)) / 2, cy = (Math.min(...la) + Math.max(...la)) / 2, cos = Math.cos(cy * Math.PI / 180)
  let spanX = Math.max((Math.max(...lo) - Math.min(...lo)) * 1.5, 2.2), spanY = Math.max((Math.max(...la) - Math.min(...la)) * 1.5, 1.6)
  if (spanX * cos / spanY < W / H) spanX = spanY * (W / H) / cos; else spanY = spanX * cos / (W / H)
  const P = (x, y) => [(x - cx + spanX / 2) / spanX * W, (cy + spanY / 2 - y) / spanY * H]
  const ink = toHex(o.ink.c), step = spanX > 16 ? 5 : spanX > 6 ? 2 : spanX > 2.5 ? 1 : 0.5
  k.strokeStyle = rgba(o.ink.c, 0.12); k.fillStyle = rgba(o.ink.c, 0.5); k.lineWidth = 1; k.font = '9px "Red Hat Mono", monospace'
  for (let gx = Math.ceil((cx - spanX / 2) / step) * step; gx < cx + spanX / 2; gx += step) { const a = P(gx, 0)[0]; k.beginPath(); k.moveTo(a, 0); k.lineTo(a, H); k.stroke() }
  for (let gy = Math.ceil((cy - spanY / 2) / step) * step; gy < cy + spanY / 2; gy += step) { const b = P(0, gy)[1]; k.beginPath(); k.moveTo(0, b); k.lineTo(W, b); k.stroke(); if (b > 16) k.fillText(`${+gy.toFixed(1)}°N`, 4, b - 3) }
  const trace = (l) => { k.beginPath(); l.forEach((p, n) => { const q = P(p[0], p[1]); if (n) k.lineTo(q[0], q[1]); else k.moveTo(q[0], q[1]) }); k.stroke() }
  k.strokeStyle = rgba(o.ink.c, 0.7); k.lineWidth = 1.1; k.lineJoin = 'round'; GEO.c.forEach(trace)
  k.strokeStyle = rgba(o.ash.c, 0.8); k.lineWidth = 1; k.setLineDash([]); GEO.r.forEach(trace)
  const pts = stops.map(s => P(s[2], s[1]))
  if (pts.length > 1) {
    k.strokeStyle = toHex(o.hi.c); k.lineWidth = 2.4; k.shadowColor = rgba(o.hi.c, 0.6); k.shadowBlur = 6; k.setLineDash([7, 5]); k.beginPath(); k.moveTo(pts[0][0], pts[0][1])
    for (let i = 1; i < pts.length; i++) { const p0 = pts[i - 1], p1 = pts[i], mx = (p0[0] + p1[0]) / 2 - (p1[1] - p0[1]) * 0.18, my = (p0[1] + p1[1]) / 2 + (p1[0] - p0[0]) * 0.18; k.quadraticCurveTo(mx, my, p1[0], p1[1]) }
    k.stroke(); k.setLineDash([]); k.shadowBlur = 0
  }
  const boxes = [], named = {}
  pts.forEach((p, i) => {
    const on = i === here
    k.fillStyle = on ? toHex(o.nav.c) : ink; k.beginPath(); k.arc(p[0], p[1], on ? 5 : 3.5, 0, 6.29); k.fill()
    if (on) { k.strokeStyle = toHex(o.nav.c); k.lineWidth = 1.4; k.beginPath(); k.arc(p[0], p[1], 11, 0, 6.29); k.stroke() }
    boxes.push([p[0] - 6, p[1] - 6, p[0] + 6, p[1] + 6])
  })
  const hit = (b) => (b[0] < 2 || b[2] > W - 2 || b[1] < 2 || b[3] > H - 2) || boxes.some(q => b[0] < q[2] && b[2] > q[0] && b[1] < q[3] && b[3] > q[1])
  const put = (t, p, f) => {
    k.font = f
    const w = k.measureText(t).width
    const c = [[p[0] + 9, p[1] - 6], [p[0] + 9, p[1] + 15], [p[0] - 9 - w, p[1] - 6], [p[0] - 9 - w, p[1] + 15], [p[0] - w / 2, p[1] - 14], [p[0] - w / 2, p[1] + 24]]
    for (const q of c) { const b = [q[0], q[1] - 12, q[0] + w, q[1] + 3]; if (!hit(b)) { boxes.push(b); k.fillText(t, q[0], q[1]); return true } }
    return false
  }
  k.fillStyle = ink
  const order = pts.map((p, i) => i)
  order.splice(order.indexOf(here), 1); order.unshift(here)   // the stop being read is labelled first
  order.forEach(i => {
    const p = pts[i], t = stops[i][0]
    if (named[t]) return
    // short name first: drop anything in brackets or after "and"
    if (put(t, p, 'italic 14px Newsreader, serif') || put(t.replace(/\s*\(.*\)/, '').replace(/ and the .*/, ''), p, 'italic 13px Newsreader, serif')) { named[t] = 1; return }
    put(String(i + 1), p, '10px "Red Hat Mono", monospace')
  })
}

export default function JourneyCard({ book, chapter, onChapterChange, onOpenMap }) {
  const t = useT()
  const info = usePrintInfo()
  const tr = useTranslationId()
  const j = useMemo(() => journeyOf(book, chapter), [book, chapter])
  const here = useMemo(() => {
    if (!j) return -1
    let idx = 0
    j.s.forEach((s, i) => { if (s[4] <= chapter) idx = i })
    return idx
  }, [j, chapter])
  const box = useRef(null), cv = useRef(null)
  const [W, setW] = useState(0)
  const [fonts, setFonts] = useState(0)

  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setW(Math.floor(e.contentRect.width)))
    ro.observe(el)
    document.fonts?.ready.then(() => setFonts(f => f + 1))
    return () => ro.disconnect()
  }, [j])

  useEffect(() => {
    if (!j || !cv.current || !W || !info) return
    const H = Math.round(Math.min(330, Math.max(220, W * (j.s.length > 4 ? 0.78 : 0.92))))
    drawMap(cv.current, W, H, j.s, here, info.o)
  }, [j, W, here, info, fonts])

  if (!j) return <div className="atl"><div className="atl-h"><span>{t('JOURNEY')}</span></div><div className="atl-none">{t('No journey for this book yet.')}</div></div>
  const dr = tr === 'dra' ? DRN[bookId(book)] : null
  return (
    <div className="atl atl-journey" ref={box}>
      <div className="atl-h"><span>{t('JOURNEY')}</span><span>{j.s.length} {t(j.s.length > 1 ? 'STOPS' : 'STOP')}</span></div>
      <div className="atl-t">{j.n}</div>
      <canvas className="jmap" ref={cv} role="img" aria-label={t('Map of {name}, with {n} stops', { name: j.n, n: j.s.length })} />
      <ol className="stops">
        {j.s.map((s, i) => (
          <li key={`${s[0]}-${i}`} className={i === here ? 'on' : ''}>
            <button type="button" onClick={() => onChapterChange?.(s[4])} aria-current={i === here ? 'step' : undefined}
              title={t('Go to chapter {n}', { n: s[4] })}>
              <span className="n">{i + 1}</span><span className="pl">{s[0]}</span><span className="rf">{dr ? s[3].replace(book, dr[0]) : s[3]}</span>
            </button>
          </li>
        ))}
      </ol>
      {onOpenMap && bookId(book) < 66 && (
        <button type="button" className="atl-more" onClick={onOpenMap}>{t('Open the full map, with terrain and satellite views')}</button>
      )}
    </div>
  )
}
