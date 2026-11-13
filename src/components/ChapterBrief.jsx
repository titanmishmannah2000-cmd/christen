import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GLOSSARY_BY_ID } from '../data/glossary'
import { PATHS_BY_ID } from '../data/paths'
import { useDepth, setDepth } from '../lib/prefs'
import { usePaths, setStep, leavePath } from '../lib/paths'
import { useChapterNotes, useBookContext, partOf } from '../lib/notes'
import { useT, placeName, bookName } from '../lib/i18n'
import { cite } from '../lib/sources'
import { CitedText, SourceList, Unchecked } from './Cited'
import { useUnfold } from '../lib/motion'
import BigStory from './BigStory'
import { PlanStep } from './Plans'
import { IconDown } from './Icons'
import { openSheet } from '../lib/ui'
import { useTranslationId, TRANSLATIONS } from '../lib/translations'
import { storage } from '../lib/prefs'
import { isDeutero } from '../data/canon'

// Whether the rest of the brief is open is remembered, so a reader who always
// wants the notes keeps them, and everyone else meets the verses first.
const BRIEF_KEY = 'verbum-brief-open'
function useBriefOpen() {
  const [open, setOpen] = useState(() => storage.get(BRIEF_KEY) === true)
  return [open, (v) => { setOpen(v); storage.set(BRIEF_KEY, v) }]
}

const BOOK_FACTS = [['author', 'Who wrote it'], ['date', 'When'], ['to', 'For whom'], ['genre', 'Kind of writing']]

const refLabel = placeName

export function DepthSwitch() {
  const depth = useDepth()
  const t = useT()
  return (
    <div className="depth" role="radiogroup" aria-label={t('Reading depth')}>
      {['simple', 'deeper'].map(d => (
        <button key={d} type="button" role="radio" aria-checked={depth === d} onClick={() => setDepth(d)}>
          {t(d === 'simple' ? 'Simple' : 'Deeper')}
        </button>
      ))}
    </div>
  )
}

// One glossary entry: the plain sentence, and in Deeper the original word and its story.
export function Term({ id, deeper }) {
  const g = GLOSSARY_BY_ID[id]
  if (!g) return null
  const [lang, word, translit] = g.root
  return (
    <div className="term-def">
      <b>{g.term}</b> {g.simple}
      {deeper && (
        <span className="term-root">
          <span className="root-word" lang={lang === 'Hebrew' || lang === 'Aramaic' ? 'he' : lang === 'Greek' ? 'el' : undefined}>{word}</span>
          {' '}<i>{translit}</i> · {lang}. {g.grew}
        </span>
      )}
    </div>
  )
}

// Where a Start here path meets this chapter.
function PathStep({ book, chapter, onNavigate, onOpenPaths }) {
  const { active, step } = usePaths()
  const t = useT()
  const path = active && PATHS_BY_ID[active]
  if (!path) return null
  const at = step[active] || 0
  const here = path.steps.findIndex(([b, c]) => b === book && c === chapter)
  const total = path.steps.length

  if (here < 0) {
    const [b, c] = path.steps[Math.min(at, total - 1)]
    return (
      <div className="path-chip">
        <span><b>{path.title}</b> · {t('step {n} of {total}', { n: Math.min(at, total - 1) + 1, total })}</span>
        <button type="button" className="link-btn" onClick={() => onNavigate(b, c)}>{t('Back to {place} →', { place: refLabel(b, c) })}</button>
      </div>
    )
  }

  const [, , note] = path.steps[here]
  const next = path.steps[here + 1]
  const done = () => {
    if (next) { setStep(active, here + 1); onNavigate(next[0], next[1]) }
    else { setStep(active, total); leavePath() }
  }
  return (
    <section className="path-step" aria-label={t('{title}, step {n} of {total}', { title: path.title, n: here + 1, total })}>
      <div className="path-top">
        <span className="eyebrow">{t('{title} · Step {n} of {total}', { title: path.title, n: here + 1, total })}</span>
        <button type="button" className="link-btn" onClick={onOpenPaths}>{t('Change path')}</button>
      </div>
      <div className="path-bar" aria-hidden="true"><b style={{ width: `${(100 * (here + 1)) / total}%` }} /></div>
      <p>{note}</p>
      <button type="button" className="chip solid" onClick={done}>
        {next ? t('Done · next, {place} →', { place: refLabel(next[0], next[1]) }) : t('Finish this path')}
      </button>
    </section>
  )
}

// The card above the text: path step, a plain summary or deeper note, the
// part of the book, and the chapter's key words.
export default function ChapterBrief({ book, chapter, termIds, onNavigate, onOpenPaths, onOpenAbout }) {
  const depth = useDepth()
  const t = useT()
  const textId = useTranslationId()
  const deeper = depth === 'deeper'
  const notes = useChapterNotes(book)
  const context = useBookContext(book)
  const [openTerm, setOpenTerm] = useState(null)
  const note = notes?.[chapter]
  const part = partOf(context, chapter)
  const words = termIds.slice(0, deeper ? 14 : 8)
  const bookLine = chapter === 1 && context ? context.why : ''
  const storyLine = chapter === 1 && context ? context.story : ''
  // Deeper on a book's first chapter adds the background facts from the book card.
  const facts = chapter === 1 && context && deeper ? BOOK_FACTS.filter(([key]) => context[key]) : []
  const factText = BOOK_FACTS.map(([key]) => facts.some(([k]) => k === key) ? context[key] : '')
  const { parts: [whyParts, storyParts, ...rest], sources } = cite([bookLine, storyLine, ...factText, deeper ? note?.d : ''])
  const factParts = rest.slice(0, BOOK_FACTS.length)
  const deepParts = rest[BOOK_FACTS.length]
  const sourced = notes?._sourced && (chapter !== 1 || context?.sourced)
  const toVerse = (b, c, v) => onNavigate(b, c, v)
  const unfold = useUnfold()

  const [more, setMore] = useBriefOpen()
  const hasMore = !!(storyLine || facts.length || (deeper && (note?.d || part)) || words.length || (chapter === 1 && context))
  // A citation number in the short summary opens the rest, where its source is listed.
  const openForCite = (e) => {
    const a = e.target.closest?.('sup.cite a')
    if (!a || more) return
    e.preventDefault()
    e.stopPropagation()
    setMore(true)
    const id = a.getAttribute('href')
    setTimeout(() => document.querySelector(id)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 380)
  }

  // Christen's notes are written for the 66 books; the seven Catholic books have the text alone for now.
  if (isDeutero(book)) {
    return (
      <div className="brief-wrap">
        <section className="brief" aria-label={t('About this chapter')}>
          <div className="brief-top"><span className="eyebrow">{t('In brief')}</span></div>
          <p className="brief-sum">{t('The notes in this app do not cover {book} yet, so this page shows the {text} on its own.', { book: bookName(book), text: TRANSLATIONS[textId].name })}</p>
        </section>
      </div>
    )
  }

  return (
    <div className="brief-wrap">
      <PathStep book={book} chapter={chapter} onNavigate={onNavigate} onOpenPaths={onOpenPaths} />
      <PlanStep book={book} chapter={chapter} onNavigate={onNavigate} place="top" />
      <section className={`brief${deeper ? ' is-deeper' : ''}`} aria-label={t('About this chapter')} onClickCapture={openForCite}>
        <div className="brief-top">
          <span className="eyebrow">{t('In brief')}</span>
          <button type="button" className="mode-badge" onClick={() => openSheet('settings')}
            aria-label={t('Showing {mode} notes. Change this in Settings', { mode: t(deeper ? 'Deeper' : 'Simple') })}>
            {t(deeper ? 'Deeper' : 'Simple')} <span>{t('· change')}</span>
          </button>
        </div>
        {chapter === 1 && context && (
          <p className="brief-book">
            <b>{bookName(book)}</b> <CitedText parts={whyParts} idPrefix="brief-src" />
          </p>
        )}
        {note ? <p className="brief-sum">{note.s}</p> : <p className="brief-sum muted">{notes ? '' : '…'}</p>}
        <AnimatePresence initial={false}>
          {more && (
            <motion.div key="more" className="fold brief-rest" {...unfold}>
              {chapter === 1 && context && (
                <>
                  <p className="brief-story"><CitedText parts={storyParts} idPrefix="brief-src" /> <button type="button" className="link-btn" onClick={onOpenAbout}>{t('About this book →')}</button></p>
                  {facts.length > 0 && (
                    <dl className="facts brief-facts">
                      {BOOK_FACTS.map(([key, label], i) => context[key] && (
                        <div key={key} className="fact-row"><dt>{t(label)}</dt><dd><CitedText parts={factParts[i]} idPrefix="brief-src" /></dd></div>
                      ))}
                    </dl>
                  )}
                  <BigStory book={book} acts={context.acts} />
                </>
              )}
              {deeper && note?.d && <p className="brief-deep"><CitedText parts={deepParts} idPrefix="brief-src" /></p>}
              {deeper && part && (
                <p className="brief-part">
                  <span className="eyebrow">{t('In the book')}</span> {part[0]} <span className="muted nowrap">({book === 'Psalms' ? bookName(book) : t(part[2] > part[1] ? 'chapters' : 'chapter')} {part[1]}{part[2] > part[1] ? `–${part[2]}` : ''})</span>
                  {chapter !== 1 && <button type="button" className="link-btn" onClick={onOpenAbout}>{t('Outline →')}</button>}
                </p>
              )}
              {words.length > 0 && (
                <div className="brief-words">
                  <span className="eyebrow">{t('Key words')}</span>
                  <div className="word-chips">
                    {words.map(id => (
                      <button key={id} type="button" className="word-chip" aria-expanded={openTerm === id}
                        onClick={() => setOpenTerm(openTerm === id ? null : id)}>{GLOSSARY_BY_ID[id].term}</button>
                    ))}
                  </div>
                  <AnimatePresence initial={false} mode="wait">
                    {openTerm && (
                      <motion.div key={openTerm} className="fold" {...unfold}><Term id={openTerm} deeper={deeper} /></motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              {note && (deeper || bookLine) && (
                sourced
                  ? <SourceList sources={sources} idPrefix="brief-src" onVerse={toVerse} />
                  : <>{bookLine && <SourceList sources={sources} idPrefix="brief-src" onVerse={toVerse} />}<Unchecked /></>
              )}
              {note && !deeper && !bookLine && sourced && <p className="muted small">{t('Summarised from the chapter itself. Choose Deeper in Settings for notes with sources.')}</p>}
              {note && !deeper && bookLine && <p className="muted small">{t('Choose Deeper in Settings to add who wrote this book, when and for whom, plus notes on this chapter with sources.')}</p>}
            </motion.div>
          )}
        </AnimatePresence>
        {hasMore && (
          <button type="button" className="brief-more" aria-expanded={more} onClick={() => setMore(!more)}>
            <span>{t(more ? 'Show less' : chapter === 1 && context ? 'More about this book and chapter' : 'More about this chapter')}</span>
            <IconDown />
          </button>
        )}
      </section>
    </div>
  )
}
