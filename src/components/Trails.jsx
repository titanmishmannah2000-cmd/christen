import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TRAILS, TRAILS_BY_ID } from '../data/trails'
import { TRAIL_STOPS, stopsAt } from '../lib/trails'
import { threadText } from '../lib/threads'
import { cite } from '../lib/sources'
import { CitedText, SourceList } from './Cited'
import { useFade } from '../lib/motion'

// Promise trails: follow one promise of God from Genesis to Revelation. With no
// trail chosen, the list of trails (those passing through this chapter first);
// with one chosen, its stops in order, with the reader's place marked.
export default function Trails({ book, chapter, verse, trail, onTrail, onNavigate }) {
  const here = useMemo(() => stopsAt(book, chapter), [book, chapter])
  const t = trail && TRAILS_BY_ID[trail]
  if (!t) return <TrailList here={here} onTrail={onTrail} />
  return <TrailView key={t.id} t={t} book={book} chapter={chapter} verse={verse} onTrail={onTrail} onNavigate={onNavigate} />
}

function TrailList({ here, onTrail }) {
  const ids = new Set(here.map(h => h.trail.id))
  const order = [...TRAILS.filter(t => ids.has(t.id)), ...TRAILS.filter(t => !ids.has(t.id))]
  return (
    <div className="trails">
      <p className="echo-how">Each trail follows one of God’s promises from Genesis to Revelation. <b>Pick a trail</b> to walk it stop by stop.</p>
      {ids.size > 0 && <p className="trail-here-note">This chapter is a stop on {ids.size === 1 ? 'one trail' : `${ids.size} trails`}, shown first.</p>}
      <ul className="trail-cards">
        {order.map((t, k) => (
          <li key={t.id} style={{ '--i': k }}>
            <button type="button" className={`trail-card${ids.has(t.id) ? ' is-here' : ''}`} onClick={() => onTrail(t.id)}>
              <span className="trail-title">{t.title}</span>
              <span className="trail-short">{t.short}</span>
              <span className="trail-meta">{t.stops.length} stops · {TRAIL_STOPS[t.id][0].ref} to {TRAIL_STOPS[t.id].at(-1).ref}{ids.has(t.id) ? ' · passes through this chapter' : ''}</span>
            </button>
          </li>
        ))}
      </ul>
      <p className="threads-src">The trails are our own summary of themes that Bible scholars trace through the whole Bible. Every stop opens in the reader.</p>
    </div>
  )
}

function TrailView({ t, book, chapter, verse, onTrail, onNavigate }) {
  const stops = TRAIL_STOPS[t.id]
  const at = stops.findIndex(s => s.book === book && s.chapter === chapter && (verse == null || (verse >= s.v1 && verse <= s.v2)))
  const near = at >= 0 ? at : stops.findIndex(s => s.book === book && s.chapter === chapter)
  const [open, setOpen] = useState(near >= 0 ? near : null)
  const [texts, setTexts] = useState({})
  const reveal = useFade({ y: -4, enter: 0.3, leave: 0.16 })

  useEffect(() => {
    let live = true
    Promise.all(stops.map(s => threadText(s, 'web').then(x => [s.i, x]).catch(() => [s.i, ''])))
      .then(pairs => { if (live) setTexts(Object.fromEntries(pairs)) })
    return () => { live = false }
  }, [stops])

  useEffect(() => {
    if (near < 0) return
    requestAnimationFrame(() => document.querySelector(`.stop-row[data-i="${near}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }))
  }, [near])

  const { parts, sources } = cite([t.intro, ...stops.map(s => s.note)])
  const firstNt = stops.findIndex(s => s.nt)
  const next = near >= 0 ? stops[near + 1] : stops[0]

  return (
    <div className="trails">
      <button type="button" className="link-btn trail-back" onClick={() => onTrail(null)}>← All promise trails</button>
      <h3 className="trail-h">{t.title}</h3>
      <p className="trail-intro"><CitedText parts={parts[0]} idPrefix="trail-src" /></p>
      <p className="echo-how">
        {near >= 0
          ? <>You are at <b>stop {near + 1} of {stops.length}</b>. Tap any stop to see it, or read it in the Bible.</>
          : <>Tap any stop to see it, or read it in the Bible. Start at the first stop to walk the whole trail.</>}
      </p>
      {next && (
        <button type="button" className="chip solid trail-next" onClick={() => onNavigate(next.book, next.chapter, next.v1)}>
          {near >= 0 ? 'Next stop' : 'Start the trail'}: {next.ref} →
        </button>
      )}
      <ol className="stop-list">
        {stops.map((s, k) => (
          <li key={s.i} className={`stop-row${k === near ? ' is-here' : ''}${open === k ? ' is-open' : ''}${s.nt ? ' nt' : ''}`} data-i={k} style={{ '--i': Math.min(k, 14) }}>
            {k === 0 && <span className="stop-era">Before Jesus</span>}
            {k === firstNt && <span className="stop-era">After Jesus</span>}
            <button type="button" aria-expanded={open === k} onClick={() => setOpen(open === k ? null : k)}>
              <span className="stop-top"><b>{k + 1}</b><span className="echo-ref">{s.ref}</span>{k === near && <em className="stop-you">You are here</em>}</span>
              <span className="stop-note"><CitedText parts={parts[k + 1]} idPrefix="trail-src" /></span>
            </button>
            <AnimatePresence initial={false}>
              {open === k && (
                <motion.div key="text" className="stop-text" {...reveal}>
                  <p>{texts[s.i] ?? '…'}</p>
                  <button type="button" className="chip" onClick={() => onNavigate(s.book, s.chapter, s.v1)}>Read {s.ref} in the Bible →</button>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        ))}
      </ol>
      <SourceList sources={sources} idPrefix="trail-src" onVerse={onNavigate} />
    </div>
  )
}
