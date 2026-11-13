import { useEffect, useMemo, useState } from 'react'
import { cite } from '../lib/sources'
import { footnotesFor, TEXT_NAMES } from '../lib/footnotes'
import { CitedText, SourceList } from './Cited'

// A note before a passage whose wording differs between ancient copies
// (see src/data/textNotes.js), or in place of a verse most copies do not have.
export function TextNote({ note, deeper, onVerse }) {
  const [showSources, setShowSources] = useState(false)
  const id = `tn-${note.book}-${note.chapter}-${note.verse}`.replace(/\s/g, '')
  const { parts: [simple, more], sources } = useMemo(() => cite([note.simple, deeper ? note.deeper || '' : '']), [note, deeper])
  return (
    <aside className={`text-note${note.empty ? ' is-empty' : ''}`} aria-label={note.title}>
      <div className="eyebrow">{note.empty ? `Verse ${note.verse}` : 'A note on the text'}</div>
      <h4>{note.title}</h4>
      <p><CitedText parts={simple} idPrefix={id} /></p>
      {more.length > 0 && <p className="text-note-deeper"><CitedText parts={more} idPrefix={id} /></p>}
      <div className="text-note-foot">
        {note.goTo && (
          <button type="button" className="link-btn" onClick={() => onVerse(note.book, note.goTo[0], note.goTo[1])}>
            Read {note.book} {note.goTo[0]}:{note.goTo[1]} →
          </button>
        )}
        <button type="button" className="link-btn" aria-expanded={showSources} onClick={() => setShowSources(s => !s)}>
          {showSources ? 'Hide sources' : `Sources (${sources.length})`}
        </button>
      </div>
      {showSources && <SourceList sources={sources} idPrefix={id} onVerse={onVerse} />}
    </aside>
  )
}

const NONE = []

// The World English Bible's own footnotes on a verse, inside the verse panel.
export function TranslatorNotes({ book, chapter, verse, onVerse }) {
  const [state, setState] = useState({ key: '', notes: [] })
  const [explain, setExplain] = useState(false)
  const key = `${book}|${chapter}|${verse}`

  useEffect(() => {
    let cancelled = false
    footnotesFor(book, chapter, verse).then(notes => { if (!cancelled) setState({ key, notes }) }).catch(() => {})
    return () => { cancelled = true }
  }, [book, chapter, verse, key])

  const notes = state.key === key ? state.notes : NONE
  const names = useMemo(() => TEXT_NAMES.filter(t => notes.some(([, n]) => t.re.test(n))), [notes])
  const { parts, sources } = useMemo(() => cite(names.map(n => n.text)), [names])
  if (!notes.length) return null
  const id = `fn-${chapter}-${verse}`
  return (
    <div className="translator-notes">
      <div className="eyebrow">From the translators</div>
      {notes.map(([word, note], i) => (
        <p key={i} className="fn">{word && <b>“{word}”</b>}{word && ' '}{note}</p>
      ))}
      {names.length > 0 && (
        <>
          <button type="button" className="link-btn" aria-expanded={explain} onClick={() => setExplain(e => !e)}>
            {explain ? 'Hide what these names mean' : names.length === 1 ? `What does ${names[0].name} mean?` : `What do ${names.slice(0, -1).map(n => n.name).join(', ')} and ${names.at(-1).name} mean?`}
          </button>
          {explain && (
            <div className="fn-explain">
              {names.map((n, i) => <p key={n.name}><b>{n.name}</b> is <CitedText parts={parts[i]} idPrefix={id} /></p>)}
              <SourceList sources={sources} idPrefix={id} onVerse={onVerse} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
