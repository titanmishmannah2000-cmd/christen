import { useState, useEffect } from 'react'
import { getChapter } from '../lib/bible'
import { useTranslationId } from '../lib/translations'

// The chapter in the reader's chosen Bible text, unless `tr` names one.
const NO_SECTIONS = {}

export default function useBible(book, chapter, tr) {
  const chosen = useTranslationId()
  const text = tr || chosen
  const [state, setState] = useState({ key: null, verses: [], heading: null, error: null, extra: {} })
  const key = `${text}-${book}-${chapter}`

  useEffect(() => {
    if (!book || !chapter) return
    let cancelled = false
    getChapter(book, chapter, text)
      .then(({ verses, heading, douay, copyright, link, sections, titleNotes }) => {
        if (!cancelled) setState({ key, verses, heading, error: null, extra: { douay, copyright, link, sections, titleNotes } })
      })
      .catch((err) => {
        // 'not-in-text': the chosen Bible has no such book (Tobit outside a Catholic Bible).
        // 'offline' / 'online-failed': a text read from its publisher could not be reached.
        const code = ['not-in-text', 'offline', 'online-failed', 'online-not-set-up', 'esther-additions'].includes(err?.message) ? err.message : 'failed'
        if (!cancelled) setState({ key, verses: [], heading: null, error: 'Could not load this chapter', errorCode: code, extra: {} })
      })
    return () => { cancelled = true }
  }, [book, chapter, key, text])

  const ready = state.key === key
  return {
    verses: ready ? state.verses : [],
    heading: ready ? state.heading : null,
    loading: !ready,
    error: ready ? state.error : null,
    errorCode: ready ? state.errorCode || null : null,
    douay: ready ? state.extra.douay || null : null,
    copyright: ready ? state.extra.copyright || null : null,
    link: ready ? state.extra.link || null : null,
    sections: ready ? state.extra.sections || NO_SECTIONS : NO_SECTIONS,
    titleNotes: ready ? state.extra.titleNotes || null : null,
    translation: text,
  }
}
