import Sheet from './Sheet'
import { SavedBody } from './SavedList'
import { MemorizeBody } from './Memorize'
import { NotesBody } from './NotesList'
import { useVerseNotes } from '../lib/verseNotes'
import { useHighlights } from '../lib/highlights'
import { useMemory, sortedMemory } from '../lib/memory'
import { useUi, setVersesTab } from '../lib/ui'

// My verses: the verses you saved, the ones you are learning by heart, and your notes.
export default function MyVersesSheet({ open, onClose, onRead }) {
  const { versesTab: tab, learn } = useUi()
  const saved = Object.keys(useHighlights()).length
  const due = sortedMemory(useMemory()).due.length
  const notes = Object.keys(useVerseNotes()).length
  const tabs = [
    ['saved', 'Saved', saved ? String(saved) : ''],
    ['heart', 'By heart', due ? `${due} to practise` : ''],
    ['notes', 'Notes', notes ? String(notes) : ''],
  ]
  const onKey = (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    const order = ['saved', 'heart', 'notes']
    const next = order[(order.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : 2)) % 3]
    setVersesTab(next)
    document.getElementById(`mv-tab-${next}`)?.focus()
  }
  return (
    <Sheet open={open} onClose={onClose} variant="wide" label="My verses"
      head={<div className="mv-head">
        <h2 className="sheet-title">My verses</h2>
        <div className="seg" role="tablist" aria-label="My verses" onKeyDown={onKey}>
          {tabs.map(([id, label, n]) => (
            <button key={id} id={`mv-tab-${id}`} type="button" role="tab" aria-selected={tab === id} aria-controls="mv-pane"
              tabIndex={tab === id ? 0 : -1} onClick={() => setVersesTab(id)}>
              {label}{n && <span className="seg-n">{n}</span>}
            </button>
          ))}
        </div>
      </div>}>
      <div id="mv-pane" role="tabpanel" aria-labelledby={`mv-tab-${tab}`} className="mv-pane">
        {open && tab === 'saved' && <SavedBody onSelect={(b, c, v) => { onClose(); onRead(b, c, v) }} />}
        {open && tab === 'heart' && <MemorizeBody start={learn} onRead={(b, c, v) => { onClose(); onRead(b, c, v) }} />}
        {open && tab === 'notes' && <NotesBody onSelect={(b, c, v) => { onClose(); onRead(b, c, v) }} />}
      </div>
    </Sheet>
  )
}
