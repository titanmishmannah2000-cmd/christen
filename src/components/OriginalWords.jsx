import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { storage } from '../lib/prefs'
import { openSheet } from '../lib/ui'
import { originalVerse, lookUp, definition, grammar, langOf, LANG_NAME, isAramaic } from '../lib/original'
import { useFade, useUnfold } from '../lib/motion'
import { useT } from '../lib/i18n'

const OPEN_KEY = 'verbum-original-open'

// The words the writer first wrote, under a verse: each word with how it sounds
// and what it means here. Tap a word for its dictionary meaning; in Deeper mode
// the grammar, its Strong's number and a fuller dictionary entry are shown too.
export default function OriginalWords({ book, chapter, verse, deeper }) {
  const [open, setOpen] = useState(() => storage.get(OPEN_KEY) === true)
  const [state, setState] = useState({ key: '', words: null, failed: false })
  const [picked, setPicked] = useState(null)
  const t = useT()
  const unfold = useUnfold()
  const lang = langOf(book)
  const key = `${book}|${chapter}|${verse}`
  const words = state.key === key ? state.words : null
  // Parts of Daniel, Ezra and Jeremiah are in Aramaic, a sister language of Hebrew.
  const aramaicWords = words ? words.filter(isAramaic).length : 0
  const tongue = t(!aramaicWords ? 'Hebrew' : aramaicWords === words.length ? 'Aramaic, a sister language of Hebrew' : 'Hebrew and Aramaic (a sister language of Hebrew)')

  useEffect(() => {
    if (!open) return
    let cancelled = false
    originalVerse(book, chapter, verse)
      .then(w => { if (!cancelled) setState({ key, words: w, failed: false }) })
      .catch(() => { if (!cancelled) setState({ key, words: [], failed: true }) })
    return () => { cancelled = true }
  }, [open, book, chapter, verse, key])

  const toggle = () => {
    const next = !open
    setOpen(next)
    storage.set(OPEN_KEY, next)
    if (!next) setPicked(null)
  }

  return (
    <div className="original">
      <button type="button" className="link-btn original-toggle" aria-expanded={open} onClick={toggle}>
        {t(open ? 'Hide the {lang} words' : 'See the {lang} words', { lang: t(LANG_NAME[lang]) })}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="words" className="original-body" {...unfold}>
            <p className="original-help">
              {lang === 'he'
                ? t('This verse was first written in {tongue}. It reads from right to left. Tap a word to see what it means.', { tongue })
                : t('This verse was first written in Greek. Tap a word to see what it means.')}
            </p>
            {!words && <p className="original-help">{t('Opening the words…')}</p>}
            {state.failed && state.key === key && <p className="original-help">{t('The {lang} words could not be opened. They need a connection the first time.', { lang: t(LANG_NAME[lang]) })}</p>}
            {words && words.length > 0 && (
              <div className={`original-words ${lang}`} dir={lang === 'he' ? 'rtl' : 'ltr'}>
                {words.map((w, i) => (
                  <button key={i} type="button" className="o-word" aria-pressed={picked === i}
                    aria-label={`${w[0]}, sounds like ${w[1]}, meaning ${w[2]}`}
                    onClick={() => setPicked(picked === i ? null : i)}>
                    <span className="o-orig" lang={lang === 'he' ? 'he' : 'grc'}>{w[0]}</span>
                    <span className="o-sound" dir="ltr">{w[1]}</span>
                    <span className="o-gloss" dir="ltr">{w[2]}</span>
                  </button>
                ))}
              </div>
            )}
            <AnimatePresence mode="wait" initial={false}>
              {words && picked !== null && words[picked] && (
                <WordCard key={`${key}-${picked}`} word={words[picked]} lang={lang} deeper={deeper} />
              )}
            </AnimatePresence>
            <p className="original-credit">
              Words, grammar and dictionary from <a href="https://www.stepbible.org" target="_blank" rel="noreferrer">STEPBible.org</a> (Tyndale House, Cambridge),
              {' '}<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>, arranged for this app.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function WordCard({ word, lang, deeper }) {
  const [form, sound, here, number, code] = word
  const [entry, setEntry] = useState(null)
  const [def, setDef] = useState('')
  const [showDef, setShowDef] = useState(false)
  const fade = useFade({ y: 4 })
  const plainGrammar = grammar(code, lang)

  useEffect(() => {
    let cancelled = false
    lookUp(number).then(e => { if (!cancelled) setEntry(e) }).catch(() => {})
    if (deeper) definition(number).then(d => { if (!cancelled) setDef(d) })
    return () => { cancelled = true }
  }, [number, deeper])

  return (
    <motion.div className="o-card" {...fade}>
      <div className="o-card-head">
        <span className="o-card-word" lang={lang === 'he' ? 'he' : 'grc'}>{form}</span>
        <i>{sound}</i>
      </div>
      <p><b>Here it means:</b> {here}</p>
      {entry?.lemma && (
        <p>
          <b>Dictionary form:</b> <span lang={lang === 'he' ? 'he' : 'grc'} className="o-lemma">{entry.lemma}</span>
          {entry.sound && <> <i>{entry.sound}</i></>}{entry.meaning && <>, “{entry.meaning}”</>}
        </p>
      )}
      {plainGrammar.length > 0 && (
        <p><b>{deeper ? 'Grammar:' : 'Kind of word:'}</b> {deeper ? plainGrammar.join(' · ') : plainGrammar[0]}</p>
      )}
      {deeper && (
        <p className="o-codes">Strong’s number {number.replace(/^([HG])0*/, '$1')} · grammar code {code}</p>
      )}
      {deeper && def && (
        <>
          <button type="button" className="link-btn" aria-expanded={showDef} onClick={() => setShowDef(s => !s)}>
            {showDef ? 'Hide the dictionary entry' : 'Read the dictionary entry'}
          </button>
          {showDef && <p className="o-def" lang="en">{def}</p>}
        </>
      )}
      {entry?.times > 0 && (
        <div className="o-uses">
          <span>Used {entry.times.toLocaleString()} {entry.times === 1 ? 'time' : 'times'} in the Bible.</span>
          <button type="button" className="chip" onClick={() => openSheet('search', { searchFor: number })}>Find every verse with it</button>
        </div>
      )}
    </motion.div>
  )
}
