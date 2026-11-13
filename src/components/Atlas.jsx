import { lazy, Suspense, useEffect, useLayoutEffect, useRef } from 'react'
import { flushSync } from 'react-dom'
import { motion, useReducedMotion } from 'framer-motion'
import Threads from './Threads'
import Timeline from './Timeline'
import Trails from './Trails'
import ColourTab from './atlas/ColourTab'
import JourneyCard from './atlas/JourneyCard'
import { threadsFor } from '../lib/threads'
import { useT } from '../lib/i18n'
import { EASE_IN, EASE_IN_OUT, narrowScreen } from '../lib/motion'
import { rinseChange, rinseIn, rinseOut, atlasCloser } from '../lib/cyanotype/rinse'

// The full map library is large, so it loads only when the full map is opened.
const WorldMap = lazy(() => import('./WorldMap'))

const ATLAS_TABS = ['colour', 'journey', 'threads', 'trails', 'timeline']
const NAMES = { colour: 'Colour', journey: 'Journey', threads: 'Echoes', trails: 'Trails', timeline: 'Timeline' }

// The Atlas, printed in the book's colours as in the Cyanotype mockup: word tabs, the
// chosen one underlined in the third colour, and Close in words. Changing tab, opening
// and closing all run the Rinse: a wavy waterline washes the old print away.
export default function Atlas({
  tab, onTab, book, chapter, verse, threads, trail, onTrail, onChapterChange, onNavigate, expanded, onToggleExpand, onClose,
}) {
  const t = useT()
  const count = verse ? threadsFor(threads, chapter, verse).length : 0
  const reduced = useReducedMotion()
  const card = useRef(null), body = useRef(null)

  // The column narrows to nothing once the print has been washed away.
  const exit = reduced
    ? { opacity: 0, transition: { duration: 0 } }
    : narrowScreen()
      ? { opacity: 0, transition: { duration: 0.2, ease: EASE_IN } }
      : { flexBasis: 0, paddingRight: 0, opacity: 0, transition: { flexBasis: { duration: 0.42, ease: EASE_IN_OUT }, paddingRight: { duration: 0.42, ease: EASE_IN_OUT }, opacity: { duration: 0.2, ease: EASE_IN } } }

  // Opening: the water runs down and leaves the Atlas behind it.
  useLayoutEffect(() => { rinseIn(card.current) }, [])

  // Every way of closing washes the print away first.
  const latest = useRef(onClose)
  useEffect(() => { latest.current = onClose })
  useEffect(() => {
    atlasCloser.current = (close) => rinseOut(card.current, close)
    return () => { atlasCloser.current = null }
  }, [])
  const close = () => rinseOut(card.current, () => latest.current())

  const choose = (next) => {
    if (next === tab) return
    rinseChange(card.current, body.current, () => flushSync(() => onTab(next)))
  }

  // Escape leaves the expanded view.
  useEffect(() => {
    if (!expanded) return
    const onKey = (e) => { if (e.key === 'Escape' && !document.querySelector('dialog[open]')) onToggleExpand() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded, onToggleExpand])

  const onTabKey = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const next = ATLAS_TABS[(ATLAS_TABS.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : ATLAS_TABS.length - 1)) % ATLAS_TABS.length]
    choose(next)
    document.getElementById(`tab-${next}`)?.focus()
  }

  const fullMap = expanded && tab === 'journey'

  return (
    <motion.aside className="atlas" id="atlas" aria-label={t('Atlas')} exit={exit}>
      <div className="atlas-card" ref={card}>
        <div className="atlas-head">
          <div role="tablist" aria-label={t('Atlas')} onKeyDown={onTabKey} className="atlas-tabs">
            {ATLAS_TABS.map(id => (
              <button key={id} className="atlas-tab" type="button" role="tab" id={`tab-${id}`} aria-controls={`pane-${id}`}
                aria-selected={tab === id} tabIndex={tab === id ? 0 : -1} onClick={() => choose(id)}>
                {t(NAMES[id])}{id === 'threads' && count > 0 && <span className="n">{count}</span>}
              </button>
            ))}
          </div>
          <div className="atlas-tools">
            <button className="atlas-word expand-btn" type="button" onClick={onToggleExpand} aria-pressed={expanded}
              title={t(expanded ? 'Back to the verses (Esc)' : 'Expand the atlas over the verses')}>
              {t(expanded ? 'Narrow' : 'Expand')}
            </button>
            <button className="atlas-word" type="button" onClick={close} aria-label={t('Close the atlas')}>{t('Close')}</button>
          </div>
        </div>
        <div className="atlas-body" ref={body}>
          <div className="pane" id="pane-colour" role="tabpanel" aria-labelledby="tab-colour" hidden={tab !== 'colour'}>
            {tab === 'colour' && <ColourTab book={book} />}
          </div>
          <div className="pane" id="pane-journey" role="tabpanel" aria-labelledby="tab-journey" hidden={tab !== 'journey'}>
            {tab === 'journey' && (fullMap ? (
              <Suspense fallback={<div className="empty-pane">{t('Unrolling the map…')}</div>}>
                <WorldMap book={book} chapter={chapter} onChapterChange={onChapterChange} expanded={expanded} onToggleExpand={onToggleExpand}
                  onOpenTimeline={() => choose('timeline')} onNavigate={onNavigate} />
              </Suspense>
            ) : (
              <JourneyCard book={book} chapter={chapter} onChapterChange={onChapterChange} onOpenMap={onToggleExpand} />
            ))}
          </div>
          <div className="pane" id="pane-threads" role="tabpanel" aria-labelledby="tab-threads" hidden={tab !== 'threads'}>
            {tab === 'threads' && <Threads key={`${book}-${chapter}-${verse}`} book={book} chapter={chapter} verse={verse} data={threads} onNavigate={onNavigate} />}
          </div>
          <div className="pane" id="pane-trails" role="tabpanel" aria-labelledby="tab-trails" hidden={tab !== 'trails'}>
            {tab === 'trails' && <Trails book={book} chapter={chapter} verse={verse} trail={trail} onTrail={onTrail} onNavigate={onNavigate} />}
          </div>
          <div className="pane" id="pane-timeline" role="tabpanel" aria-labelledby="tab-timeline" hidden={tab !== 'timeline'}>
            {tab === 'timeline' && <Timeline book={book} chapter={chapter} verse={verse} onNavigate={onNavigate} />}
          </div>
        </div>
      </div>
    </motion.aside>
  )
}
