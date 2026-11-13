import { useVerseNotes, notesInOrder, removeNote, exportNotes } from '../lib/verseNotes'

// The Notes tab of My verses: every note the reader has written, in Bible order.
export function NotesBody({ onSelect }) {
  const all = useVerseNotes()
  const notes = notesInOrder(all)
  return (
    <div className="sheet-body">
      <div className="notes-top">
        <p className="sheet-sub">{notes.length} note{notes.length === 1 ? '' : 's'}</p>
        {notes.length > 0 && <button type="button" className="chip" onClick={() => exportNotes(all)}>Download as a text file</button>}
      </div>
      {notes.length === 0 && <div className="empty">No notes yet. Tap any verse while reading, press More, then Write a note.</div>}
      {notes.map(([key, n]) => (
        <div className="saved-item" key={key}>
          <button type="button" className="go" onClick={() => onSelect(n.book, n.chapter, n.verse)}>
            <b>{n.book === 'Psalms' ? 'Psalm' : n.book} {n.chapter}:{n.verse}</b><span className="note-text">{n.text}</span>
          </button>
          <button type="button" className="link-btn muted-btn" onClick={() => removeNote(key)} aria-label={`Delete the note on ${n.book} ${n.chapter}:${n.verse}`}>Delete</button>
        </div>
      ))}
    </div>
  )
}
