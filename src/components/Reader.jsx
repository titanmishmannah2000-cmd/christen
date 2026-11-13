import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { annotate } from 'rough-notation'
import { AnimatePresence, motion } from 'framer-motion'
import useBible from '../hooks/useBible'
import { useHighlights, highlightKey, toggleHighlight } from '../lib/highlights'
import { ALL_BOOKS } from '../lib/bible'
import { TRANSLATIONS, bookNameIn, voiceFor, translationId, setTranslation } from '../lib/translations'
import { verseUrl } from '../lib/routes'
import { openSheet } from '../lib/ui'
import { threadsFor, threadText } from '../lib/threads'
import { toast, useDarkTheme, useDepth } from '../lib/prefs'
import { glossChapter, glossVerse, splitMarked } from '../lib/glossary'
import { useT, placeName, bookName, uiLang } from '../lib/i18n'
import Opening from './Opening'
import ChapterBrief, { Term } from './ChapterBrief'
import { PlanStep } from './Plans'
import OriginalWords from './OriginalWords'
import { TextNote, TranslatorNotes } from './TextNotes'
import CitePanel from './Cite'
import Reflect from './Reflect'
import { textNotesFor } from '../data/textNotes'
import { useVerseNotes, noteKey, saveNote } from '../lib/verseNotes'
import { useListen, listenToChapter, stopListening, canListen } from '../lib/listen'
import { useFade, useUnfold } from '../lib/motion'
import { neighbours, navLabel } from '../lib/nav'
import { storyFor } from '../data/stories'
import { stopsAt, trailVerses } from '../lib/trails'
import { useParallels, parallelsAt, otherAccounts, accountLabel } from '../lib/parallels'
import { useEvans, evansOn, EVANS_TITLE } from '../lib/evans'
import { EvansMarks, EvansVerse } from './Evans'
import { useGnb, gnbOn, figuresAt } from '../lib/gnb'
import { GnbFigure } from './Gnb'
import DropCap from './DropCap'
import useTextChange from '../lib/textChange/useTextChange'

// The margin column (painting, verse notes) only fits when the reading column
// itself is wide enough, so this follows the reader's width, not the window's:
// opening the Atlas narrows the reader and folds the margin into the text.
// Keep in step with the @container rule on .reader in index.css.
const WIDE_READER = 860
function useWide(ref) {
  const [wide, setWide] = useState(() => window.innerWidth > 1180)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setWide(entry.contentRect.width >= WIDE_READER))
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref])
  return wide
}
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches
// Scripts read right to left: the title and the line under it sit on the right.
const RTL = new Set(['ur', 'ar', 'fa', 'he'])
const GLOSSARY_TITLE = 'Tap the verse to see what this word means'
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
// Urdu letters that never join the letter after them.
const NON_JOINERS = 'اآأإدڈذرڑزژوؤےۓ'

// The illuminated first letter and the rest of the verse. In Urdu the first letter keeps
// its marks, and when it would join the next letter, the rest of the word starts with a
// zero-width joiner so it keeps its joined shape.
function firstLetter(text) {
  const m = text.match(/^\p{L}\p{M}*/u)
  if (!m) return null
  const letter = m[0]
  const arabic = /^\p{Script=Arabic}/u.test(letter)
  const joins = arabic && !NON_JOINERS.includes(letter[0]) && /^\p{L}/u.test(text.slice(letter.length))
  return { letter, rtl: arabic, cut: letter.length, prefix: joins ? '\u200D' : '' }
}


// The text with a small mark where each of the translators' footnotes sits.
const MARKS = ['*', '†', '‡', '§']
function withNoteMarks(text, notes) {
  if (!notes?.length) return text
  const out = []
  let from = 0
  notes.forEach((n, i) => {
    out.push(text.slice(from, n.at))
    out.push(<sup key={i} className="fn-mark" aria-hidden="true">{MARKS[i % MARKS.length]}</sup>)
    from = n.at
  })
  out.push(text.slice(from))
  return out
}

// The translators' footnotes on a verse or a psalm title, in the Bible's own language:
// the words a note is on in bold, another way to translate them in italics.
function Footnotes({ notes, lang, quiet }) {
  const t = useT()
  return (
    <div className={`translator-notes${quiet ? ' quiet' : ''}`}>
      {!quiet && <div className="eyebrow">{t('From the translators')}</div>}
      {notes.map((n, i) => (
        <p key={i} className="fn" lang={lang}>
          <span className="fn-mark">{MARKS[i % MARKS.length]}</span>{' '}
          {n.note.map(([kind, text], k) => {
            const piece = kind === 'fq' ? <b>{text}</b> : kind === 'fqa' ? <i>{text}</i> : text
            return <span key={k}>{k ? ' ' : ''}{piece}</span>
          })}
        </p>
      ))}
    </div>
  )
}

// Why a chapter could not be shown, in plain words, with the one step that helps.
function ChapterProblem({ code, book, tr, onNavigate }) {
  const t = useT()
  if (code === 'esther-additions') {
    // The Good News Translation reads Esther in its Greek version, whose additions (here
    // chapters 11–16, as in the Latin Bible) it weaves into chapters 1–10.
    return (
      <div className="status problem" role="alert">
        <p>{t('The {text} reads Esther in its Greek version, with the additions placed where they belong in the story, within chapters 1–10.', { text: tr.name })}</p>
        <button type="button" className="chip solid" onClick={() => onNavigate(book, 1)}>{t('Read Esther from the beginning')}</button>
      </div>
    )
  }
  if (code === 'not-in-text') {
    return (
      <div className="status problem" role="alert">
        <p>{t('{book} is one of the seven books found in Catholic Bibles. The {text} does not include it.', { book: bookName(book), text: tr.name })}</p>
        <button type="button" className="chip solid" onClick={() => setTranslation('dra')}>{t('Read it in the Douay-Rheims Bible')}</button>
      </div>
    )
  }
  if (tr.online) {
    const msg = code === 'offline'
      ? 'The {text} is read from its publisher over the internet, and this device is offline right now.'
      : 'The {text} could not be reached just now. Try again in a moment.'
    return (
      <div className="status problem" role="alert">
        <p>{t(msg, { text: tr.name })}</p>
        <button type="button" className="chip solid" onClick={() => setTranslation('web')}>{t('Read the World English Bible instead')}</button>
      </div>
    )
  }
  return <div className="status" role="alert">{t('Could not load this chapter. Check that the app’s files are all in place.')}</div>
}

export default function Reader({
  book, chapter, focusVerse, openVerse, onOpenVerse, onNavigate, threads, onFollowThreads, onFollowTrail, painting, onOpenPaths, onOpenAbout, onOpenPlate, onLearn, onOpenStory, onOpenCredits,
}) {
  const page = `${book}-${chapter}`
  // When the Bible text changes on this page, the old verses stay on screen until the
  // change animation swaps the new ones in: no reload, and no jump to the top.
  const live = useBible(book, chapter)
  const liveKey = `${live.translation}|${page}`
  const [shownKey, setShownKey] = useState(liveKey)
  const [kept, setKept] = useState(null)
  const changing = shownKey !== liveKey && shownKey.endsWith(`|${page}`) && kept?.key === shownKey
  if (!changing && shownKey !== liveKey) setShownKey(liveKey)
  if (!changing && !live.loading && !live.error && live.verses.length && kept?.key !== liveKey) setKept({ key: liveKey, data: live })
  const shown = changing ? kept.data : live
  const { verses, heading, loading, error, errorCode, douay, copyright, link, sections, titleNotes, translation } = shown
  const tr = TRANSLATIONS[translation]
  const english = translation === 'web'
  const evans = evansOn(translation)
  const evansData = useEvans(book, evans)
  // The Good News Bible brings its drawings, placed after the verse they follow.
  const gnb = gnbOn(translation)
  const gnbData = useGnb(book, gnb)
  // Key words are found in any English text; notes on the wording stay with the WEB.
  const englishWords = tr.lang === 'en'
  const highlights = useHighlights()
  const myNotes = useVerseNotes()
  const listening = useListen()
  const deeperMode = useDepth() === 'deeper'
  // The notes on ancient copies describe the English text's choices, so they show only with it.
  const textNotes = useMemo(() => new Map(english ? textNotesFor(book, chapter).map(n => [n.verse, n]) : []), [book, chapter, english])
  const listeningHere = listening.book === book && listening.chapter === chapter
  const readingVerse = listeningHere && listening.playing ? listening.verses[listening.at]?.verse : null
  const dark = useDarkTheme()
  const scrollRef = useRef(null)
  const wide = useWide(scrollRef)
  const versesRef = useRef(null)
  const [glossTop, setGlossTop] = useState(0)
  const glossColRef = useRef(null)
  const { prev, next } = neighbours(book, chapter)
  const glossary = useMemo(() => glossChapter(englishWords ? verses : []), [verses, englishWords])
  const onTrail = useMemo(() => trailVerses(book, chapter), [book, chapter])
  const marginFade = useFade({ x: 10, y: 0 })
  const unfold = useUnfold()
  const t = useT()
  const parallels = useParallels()
  const sameEvents = parallelsAt(parallels, book, chapter)
  const textChange = useTextChange({
    changing, target: liveKey, live, commit: () => setShownKey(liveKey), versesRef, scrollRef,
    rtl: RTL.has(TRANSLATIONS[live.translation].lang),
  })

  // Tell the page lights that the new chapter's words are on the page.
  useEffect(() => {
    if (!loading) window.dispatchEvent(new CustomEvent('verbum:chapter-shown', { detail: { book, chapter } }))
  }, [loading, book, chapter])

  // New chapter: back to the top, or to the verse we were sent to.
  useEffect(() => {
    if (loading) return
    const el = focusVerse && document.getElementById(`verse-${focusVerse}`)
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' })
      el.classList.remove('flash')
      void el.offsetWidth
      el.classList.add('flash')
    } else {
      scrollRef.current?.scrollTo({ top: 0 })
      if (window.scrollY > 0) window.scrollTo({ top: 0 })
    }
  }, [loading, book, chapter, focusVerse])

  // Illuminated verses get a hand-laid gold wash.
  useEffect(() => {
    if (loading || !versesRef.current) return
    const color = cssVar('--mark')
    const marks = []
    versesRef.current.querySelectorAll('.v.is-lit .words').forEach(words => {
      const a = annotate(words, { type: 'highlight', color, multiline: true, iterations: 1, animationDuration: reducedMotion() ? 0 : 700 })
      a.show()
      marks.push(a)
    })
    return () => marks.forEach(a => a.remove())
  }, [loading, highlights, book, chapter, dark, wide, translation])

  // The gloss sits in the margin beside its verse.
  useLayoutEffect(() => {
    if (!openVerse || !wide || !versesRef.current) return
    const el = document.getElementById(`verse-${openVerse}`)
    // Measured on screen, so the chapter's entrance (a small slide) cannot skew it.
    if (el) setGlossTop(el.getBoundingClientRect().top - (glossColRef.current ?? versesRef.current).getBoundingClientRect().top)
  }, [openVerse, wide, verses])

  // Reading aloud: keep the verse being read in view.
  useEffect(() => {
    if (!readingVerse) return
    document.getElementById(`verse-${readingVerse}`)?.scrollIntoView({ block: 'center', behavior: reducedMotion() ? 'auto' : 'smooth' })
  }, [readingVerse])
  useEffect(() => () => stopListening(), [book, chapter])

  // Arrow keys turn the page.
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return
      if (document.querySelector('dialog[open]')) return
      if (e.key === 'ArrowLeft' && prev) onNavigate(prev.book, prev.chapter)
      if (e.key === 'ArrowRight' && next) onNavigate(next.book, next.chapter)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next, onNavigate])

  const underline = useRef(new Map())
  useEffect(() => {
    const map = underline.current
    return () => { map.forEach(a => a.remove()); map.clear() }
  }, [book, chapter, dark, wide, translation])
  const hover = (el, on) => {
    if (!finePointer()) return
    const words = el.querySelector('.words')
    let a = underline.current.get(words)
    if (!a && on) {
      a = annotate(words, { type: 'underline', color: cssVar('--lapis'), strokeWidth: 1.3, padding: 1, multiline: true, iterations: 1, animationDuration: 420 })
      underline.current.set(words, a)
    }
    if (a) on ? a.show() : a.hide()
  }

  const toggle = (n) => onOpenVerse(openVerse === n ? null : n)
  const open = verses.find(v => v.verse === openVerse)
  const gloss = open && (
    <VerseGloss
      key={`${book}-${chapter}-${open.verse}`}
      book={book} chapter={chapter} verse={open}
      threads={threadsFor(threads, chapter, open.verse)}
      lit={!!highlights[highlightKey(book, chapter, open.verse)]}
      onFollow={() => onFollowThreads(open.verse)}
      onFollowTrail={onFollowTrail}
      onLearn={() => onLearn(open.verse)}
      onVerse={onNavigate}
      inline={!wide}
    />
  )

  return (
    <main className="reader" ref={scrollRef} id="reader">
      <div className="reader-inner">
        <div className="title-block page-in" key={`t-${page}`}>
          {/* The big title is the book's name as the chosen Bible prints it (یُوحنّا in Urdu,
              Juan in Spanish); buttons and menus follow Settings > Menus and buttons. */}
          <Opening book={book} chapter={chapter} translation={translation} rtl={RTL.has(tr.lang)} />
          {!english && (
            <p className="title-translation" lang={tr.lang}>
              {tr.name}{evans && ` · ${EVANS_TITLE}`}{' '}
              <button type="button" className="link-btn" lang={uiLang()} onClick={() => openSheet('texts')}>{t('Change the Bible text')}</button>
            </p>
          )}
          <div className="title-actions">
            {storyFor(book, chapter) && <button type="button" className="chip solid" onClick={onOpenStory}>{t('Read this chapter as a story')}</button>}
            {evans && <button type="button" className="chip" onClick={() => openSheet('evans')}>{t(EVANS_TITLE)}</button>}
            {gnb && <button type="button" className="chip" onClick={() => openSheet('gnb')}
              title={t('Reading guides, maps, a word list and an index from the Good News Bible')}>{t('Good News Bible helps')}</button>}
            {sameEvents.length > 0 && (
              <button type="button" className="chip" onClick={() => openSheet('compare', { compare: sameEvents.length === 1 ? sameEvents[0].i : null })}
                title={t('Events in this chapter that another book also tells, side by side')}>
                {t('Compare with the other accounts')}
              </button>
            )}
            <button type="button" className="chip" onClick={() => openSheet('versions', { versionsVerse: openVerse })}
              title={t('This chapter in other Bible versions, side by side')}>
              {t('Compare versions')}
            </button>
            {!wide && painting && <button type="button" className="chip" onClick={onOpenPlate}>{t('See this book’s painting')}</button>}
            {canListen() && verses.length > 0 && (
              <button type="button" className="chip" aria-pressed={listeningHere}
                onClick={() => (listeningHere ? stopListening() : listenToChapter(book, chapter, verses, placeName(book, chapter), Math.max(0, verses.findIndex(v => v.verse === (openVerse || 1))), tr.lang))}>
                {t(listeningHere ? 'Stop listening' : 'Listen to this chapter')}
              </button>
            )}
          </div>
        </div>
        <div className="hair" aria-hidden="true" />
        <ChapterBrief key={`b-${page}`} book={book} chapter={chapter} termIds={loading ? [] : glossary.ids}
          onNavigate={onNavigate} onOpenPaths={onOpenPaths} onOpenAbout={onOpenAbout} />
        {douay && !loading && <p className="douay-note">{t('This is {place}. Its verse numbers are shown beside each verse; the notes follow the usual numbering.', { place: douay })}</p>}
        {heading && !loading && (
          <div className="superscription" lang={tr.lang}>
            {withNoteMarks(heading, titleNotes)}
            {titleNotes && <Footnotes notes={titleNotes} lang={tr.lang} quiet />}
          </div>
        )}
        {loading && <div className="status" role="status">{t('Opening the page…')}</div>}
        {error && <ChapterProblem code={errorCode} book={book} tr={tr} onNavigate={onNavigate} />}

        {!loading && !error && (
          <div className="verses page-in" key={`v-${page}`} ref={versesRef} lang={tr.lang}>
            {verses.map((v, i) => {
              const lit = !!highlights[highlightKey(book, chapter, v.verse)]
              const initial = i === 0 ? firstLetter(v.text) : null
              const rest = initial ? initial.prefix + v.text.slice(initial.cut) : v.text
              const restNotes = initial && v.notes ? v.notes.map(n => ({ ...n, at: Math.max(0, n.at - initial.cut) + initial.prefix.length })) : v.notes
              return (
                <div key={v.verse}>
                  {sections[v.verse] && sections[v.verse].map((h, k) => <h3 key={k} className={`section-head${k ? ' sub' : ''}`} lang={tr.lang}>{h}</h3>)}
                  {textNotes.get(v.verse) && <TextNote note={textNotes.get(v.verse)} deeper={deeperMode} onVerse={onNavigate} />}
                  {evansData && <EvansMarks data={evansData} chapter={chapter} verse={v.verse} onOpen={() => onOpenVerse(v.verse)} />}
                  <div
                    id={`verse-${v.verse}`}
                    className={`v${lit ? ' is-lit has-notation' : ''}${openVerse === v.verse ? ' is-open' : ''}${readingVerse === v.verse ? ' is-reading' : ''}`}
                    role="button" tabIndex={0}
                    aria-expanded={openVerse === v.verse}
                    aria-roledescription="verse"
                    onClick={() => toggle(v.verse)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(v.verse) } }}
                    onMouseEnter={(e) => hover(e.currentTarget, true)}
                    onMouseLeave={(e) => hover(e.currentTarget, false)}
                  >
                    <span className="n"><span className="visually-hidden">{t('Verse')} </span>{v.label || v.verse}{onTrail.has(v.verse) && <i className="trail-mark" title={t('A stop on a promise trail')} />}{myNotes[noteKey(book, chapter, v.verse)] && <i className="note-mark" title={t('You wrote a note on this verse')}><span className="visually-hidden">, {t('has your note')}</span></i>}</span>
                    <span className="t">
                      {initial && <DropCap letter={initial.letter} rtl={initial.rtl} />}
                      {initial && <span className="visually-hidden">{v.text}</span>}
                      <span className="words" aria-hidden={initial ? 'true' : undefined}>
                        {v.notes && !englishWords ? withNoteMarks(rest, restNotes) : splitMarked(rest, glossary.marks[v.verse], initial ? initial.cut : 0)
                          .map((part, k) => (typeof part === 'string' ? part : <span key={k} className="term" title={GLOSSARY_TITLE}>{part.text}</span>))}
                      </span>
                    </span>
                  </div>
                  {!wide && (
                    <AnimatePresence initial={false}>
                      {openVerse === v.verse && gloss && (
                        <motion.div key="gloss" className="gloss-fold" {...unfold}>{gloss}</motion.div>
                      )}
                    </AnimatePresence>
                  )}
                  {gnbData && figuresAt(gnbData, chapter, v.verse).map((f, k) => <GnbFigure key={k} fig={f} />)}
                </div>
              )
            })}
          </div>
        )}

        {wide && !loading && !error && (
          <div className="gloss-col" ref={glossColRef}>
            <AnimatePresence mode="wait" initial={false}>
              {gloss
                ? <motion.div key={`g-${page}-${open.verse}`} className="gloss-slot" style={{ top: glossTop }} {...marginFade}>{gloss}</motion.div>
                : <motion.div key={`p-${book}`} className="plate-slot" {...marginFade}><MarginPlate painting={painting} onOpen={onOpenPlate} /></motion.div>}
            </AnimatePresence>
          </div>
        )}

        {!loading && !error && copyright && (
          <p className="text-copyright page-in">
            {copyright}{' '}
            {link && <a href={link.href} target="_blank" rel="noopener noreferrer">{t(link.label)}</a>}
          </p>
        )}
        {!loading && !error && verses.length > 0 && (
          <>
            <div className="colophon page-in">
              {t('Here ends {place}', { place: placeName(book, chapter) })}
            </div>
            <Reflect />
            <div className="plan-end"><PlanStep book={book} chapter={chapter} onNavigate={onNavigate} place="end" /></div>
            <div className="chapter-end">
              {prev ? <button className="link-btn" type="button" onClick={() => onNavigate(prev.book, prev.chapter)}>← {navLabel(prev, book)}</button> : <span />}
              <span className="line" aria-hidden="true" />
              {next && <button className="link-btn" type="button" onClick={() => onNavigate(next.book, next.chapter)}>{navLabel(next, book)} →</button>}
            </div>
            <button className="link-btn credits-link" type="button" onClick={onOpenCredits}>{t('Where everything comes from: credits and licenses')}</button>
          </>
        )}
      </div>
      <AnimatePresence>
        {textChange.running && (
          <motion.button key="skip" type="button" className="skip-anim" onClick={textChange.skip} title={t('Skip the animation and show the text')}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.25 }}>
            {t('Skip animation')}
          </motion.button>
        )}
      </AnimatePresence>
    </main>
  )
}

function MarginPlate({ painting, onOpen }) {
  const t = useT()
  const [src, setSrc] = useState(0)
  const [loaded, setLoaded] = useState(false)
  if (!painting || src >= painting.urls.length) {
    return <div className="margin-hint">{t('Tap a verse to see what it means and the verses connected to it.')}</div>
  }
  return (
    <figure className="plate">
      <button type="button" className={`frame${loaded ? ' is-loaded' : ''}`} onClick={onOpen} aria-label={t('Look closer at {name}', { name: painting.title })}>
        <img className="art" onLoad={() => setLoaded(true)} src={painting.urls[src]} alt={`${painting.title}, ${painting.artist}`} loading="lazy" onError={() => setSrc(s => s + 1)} />
        <span className="frame-hint" aria-hidden="true">{t('Tap to look closer')}</span>
      </button>
      <figcaption><i>{painting.title}</i>{painting.artist}</figcaption>
    </figure>
  )
}

function VerseGloss({ book, chapter, verse, threads, lit, onFollow, onFollowTrail, onLearn, onVerse, inline }) {
  const t = useT()
  const [teaser, setTeaser] = useState(null)
  const deeper = useDepth() === 'deeper'
  const terms = useMemo(() => glossVerse(verse.text), [verse.text])
  const [speaking, setSpeaking] = useState(false)
  const [more, setMore] = useState(false)
  const [citing, setCiting] = useState(false)
  const myNote = useVerseNotes()[noteKey(book, chapter, verse.verse)]
  const [writing, setWriting] = useState(false)
  const [draft, setDraft] = useState('')
  const unfoldMore = useUnfold()
  const reference = `${placeName(book, chapter)}:${verse.verse}`
  const fromNt = ALL_BOOKS.indexOf(book) >= 39
  const across = threads.filter(t => t.nt !== fromNt)
  const best = across[0] || threads[0] || null
  const trailsHere = stopsAt(book, chapter, verse.verse)
  const sameEvent = parallelsAt(useParallels(), book, chapter, verse.verse)

  useEffect(() => {
    if (!best) return
    let cancelled = false
    threadText(best).then(text => { if (!cancelled) setTeaser({ ref: uiLang() === 'en' ? best.ref : `${placeName(best.book, best.chapter)}:${best.v1}${best.v2 > best.v1 ? `–${best.v2}` : ''}`, text }) }).catch(() => {})
    return () => { cancelled = true }
  }, [best?.ref]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel() }, [])

  const textId = translationId()
  // The quote names the book as the chosen Bible prints it.
  const at = verse.at || `${chapter}:${verse.verse}`
  const quoteRef = `${TRANSLATIONS[textId].lang === 'en' ? (book === 'Psalms' ? 'Psalm' : book) : bookNameIn(textId, book, ALL_BOOKS)} ${at}`
  const quote = `“${verse.text}” ${quoteRef} (${TRANSLATIONS[textId].short})`
  const copy = async () => {
    try { await navigator.clipboard.writeText(quote); toast(t('Verse copied')) } catch { toast(t('Copying is blocked in this browser')) }
  }
  const share = async () => {
    const url = verseUrl(book, chapter, verse.verse)
    if (navigator.share) {
      try { await navigator.share({ title: quoteRef, text: quote, url }) } catch { /* cancelled */ }
    } else {
      try { await navigator.clipboard.writeText(`${quote}\n${url}`); toast(t('Link copied')) } catch { toast(t('Copying is blocked in this browser')) }
    }
  }
  const listen = () => {
    const synth = window.speechSynthesis
    synth.cancel()
    if (speaking) { setSpeaking(false); return }
    const lang = TRANSLATIONS[textId].lang
    const u = new SpeechSynthesisUtterance(lang === 'en' ? `${verse.text}. ${book === 'Psalms' ? 'Psalm' : book} ${chapter}, verse ${verse.verse}.` : verse.text)
    u.lang = lang
    u.rate = 0.86
    u.pitch = 0.96
    const voice = voiceFor(lang)
    if (voice) u.voice = voice
    u.onend = u.onerror = () => setSpeaking(false)
    synth.speak(u)
    setSpeaking(true)
  }
  const illuminate = () => {
    const on = toggleHighlight(book, chapter, verse.verse, verse.text)
    toast(t(on ? '{ref} saved to My verses' : '{ref} removed from My verses', { ref: reference }))
  }

  return (
    <div className={`gloss${inline ? ' inline' : ''}`} lang={uiLang()} onClick={(e) => e.stopPropagation()}>
      <h3>{reference}</h3>
      {threads.length > 0 ? (
        <>
          <p className="threads-line">
            <b>{threads.length > 1 ? t('{n} connected verses', { n: threads.length }) : t('1 connected verse')}</b>
            {across.length
              ? t(fromNt ? ' · {n} reach back to the Old Testament' : ' · {n} into the New Testament', { n: across.length })
              : t(fromNt ? ' · all within the New Testament' : ' · all within the Old Testament')}
          </p>
          {teaser && <p className="teaser"><b>{teaser.ref}</b><span lang={TRANSLATIONS[textId].lang}>{teaser.text}</span></p>}
        </>
      ) : (
        <p>{t('No connected verses are recorded for this verse.')}</p>
      )}
      {sameEvent.length > 0 && (
        <div className="gloss-trails gloss-same">
          <div className="eyebrow">{t('The same event is also told in')}</div>
          {sameEvent.map(s => (
            <button key={s.i} type="button" className="link-btn" onClick={() => openSheet('compare', { compare: s.i })}>
              {otherAccounts(s, book).map(accountLabel).join(' · ')} · {t('compare')} →
            </button>
          ))}
        </div>
      )}
      {trailsHere.length > 0 && (
        <div className="gloss-trails">
          <div className="eyebrow">{t('On a promise trail')}</div>
          {trailsHere.map(({ trail, stop }) => (
            <button key={trail.id} type="button" className="link-btn" onClick={() => onFollowTrail(trail.id)}>
              {trail.title} · stop {stop.i + 1} of {trail.stops.length} →
            </button>
          ))}
        </div>
      )}
      {evansOn(textId) && <EvansVerse book={book} chapter={chapter} verse={verse.verse} onVerse={onVerse} />}
      {terms.length > 0 && (
        <div className="gloss-terms">
          <div className="eyebrow">{t('Words in this verse')}</div>
          {terms.slice(0, 4).map(id => <Term key={id} id={id} deeper={deeper} />)}
        </div>
      )}
      <OriginalWords book={book} chapter={chapter} verse={verse.verse} deeper={deeper} />
      {textId === 'web' && <TranslatorNotes book={book} chapter={chapter} verse={verse.verse} onVerse={onVerse} />}
      {verse.notes && <Footnotes notes={verse.notes} lang={TRANSLATIONS[textId].lang} />}
      {(myNote || writing) && (
        <div className="my-note">
          <div className="eyebrow">{t('My note')}</div>
          {writing ? (
            <>
              <textarea className="note-input" rows={3} value={draft} autoFocus aria-label={t('Your note on {ref}', { ref: reference })}
                placeholder={t('What strikes you here? A question, a prayer, a thought…')} onChange={(e) => setDraft(e.target.value)} />
              <div className="note-btns">
                <button type="button" className="chip solid" onClick={() => { saveNote(book, chapter, verse.verse, draft); setWriting(false); toast(t(draft.trim() ? 'Note saved' : 'Note removed')) }}>{t('Save note')}</button>
                <button type="button" className="link-btn" onClick={() => setWriting(false)}>{t('Cancel')}</button>
              </div>
            </>
          ) : (
            <p className="note-text">{myNote.text} <button type="button" className="link-btn" onClick={() => { setDraft(myNote.text); setWriting(true) }}>{t('Edit')}</button></p>
          )}
        </div>
      )}
      <div className="actions">
        <button type="button" className={`chip${lit ? ' is-on' : ''}`} aria-pressed={lit} onClick={illuminate}>{t(lit ? 'Saved' : 'Save')}</button>
        {threads.length > 0 && <button type="button" className="chip" onClick={onFollow}>{t('Connected verses')}</button>}
        <button type="button" className="chip" onClick={onLearn}>{t('Learn by heart')}</button>
        <button type="button" className="chip" aria-expanded={more} onClick={() => setMore(m => !m)}>{t(more ? 'Less' : 'More')}</button>
      </div>
      <AnimatePresence initial={false}>
        {more && (
          <motion.div key="more" className="actions more-actions" {...unfoldMore}>
            {!myNote && <button type="button" className="chip" onClick={() => { setDraft(''); setWriting(true); setMore(false) }}>{t('Write a note')}</button>}
            {canListen() && <button type="button" className="chip" aria-pressed={speaking} onClick={listen}>{t(speaking ? 'Stop reading' : 'Listen')}</button>}
            <button type="button" className="chip" onClick={copy}>{t('Copy')}</button>
            <button type="button" className="chip" onClick={share}>{t('Share')}</button>
            <button type="button" className="chip" aria-pressed={citing} onClick={() => setCiting(c => !c)}>{t('Cite this verse')}</button>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence initial={false}>
        {citing && (
          <motion.div key="cite" {...unfoldMore}><CitePanel book={book} chapter={chapter} verse={verse.verse} at={verse.at} /></motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
