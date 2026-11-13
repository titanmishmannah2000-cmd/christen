import { useEffect, useRef, useState } from 'react'
import Sheet from './Sheet'
import { sections as sectionsFor, chaptersOf } from '../data/canon'
import { useT, bookName } from '../lib/i18n'
import { useTranslationId } from '../lib/translations'

// Go to any chapter in one place: every book on the left, the chosen book's
// chapters on the right, both always in view. Tapping a book shows its chapters
// at once (a one-chapter book opens straight away); typing narrows the books.
export default function BooksSheet({ open, onClose, book, chapter, onSelect }) {
  const t = useT()
  const [picked, setPicked] = useState(book)
  const [query, setQuery] = useState('')
  const [wasOpen, setWasOpen] = useState(false)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) { setPicked(book); setQuery('') }
  }
  const listRef = useRef(null)
  const go = (b, c) => onSelect(b, c)
  const pick = (b) => (chaptersOf(b) === 1 ? go(b, 1) : setPicked(b))

  // Open with the current book in view in the list.
  useEffect(() => {
    if (!open) return
    // Focus lands on the current chapter, not the search box, so a phone does not
    // throw up its keyboard; typing is one tap away.
    const timer = setTimeout(() => {
      listRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'center' })
      listRef.current?.parentElement?.querySelector('.pick-chapters [aria-current="page"]')?.focus({ preventScroll: true })
    }, 60)
    return () => clearTimeout(timer)
  }, [open])

  // Matches the English name and the name in the menu language, with or without accents.
  const fold = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  const q = fold(query.trim().replace(/\s+/g, ' '))
  const matches = (b) => !q || [b, bookName(b)].some(n => fold(n).includes(q))
  const tr = useTranslationId()
  const sections = sectionsFor(tr).map(s => ({ ...s, shown: s.books.filter(matches) })).filter(s => s.shown.length)
  const firstMatch = sections[0]?.shown[0]
  const onKey = (e) => { if (e.key === 'Enter' && firstMatch) { e.preventDefault(); pick(firstMatch); setQuery('') } }
  const count = chaptersOf(picked)
  const countLabel = count === 1 ? t('1 chapter') : t(picked === 'Psalms' ? '{n} psalms' : '{n} chapters', { n: count })

  return (
    <Sheet open={open} onClose={onClose} variant="goto" label={t('Go to a book and chapter')}
      head={<div className="pick-head">
        <h2 className="sheet-title">{t('Go to')}</h2>
        <input className="pick-find" type="search" placeholder={t('Find a book…')} value={query} aria-label={t('Find a book')}
          onChange={(e) => setQuery(e.target.value)} onKeyDown={onKey} />
      </div>}>
      <div className="pick-cols">
        <nav className="pick-books" ref={listRef} aria-label={t('Books')}>
          {sections.map(s => (
            <section key={s.name}>
              <h3>{t(s.name)}</h3>
              {s.shown.map(b => (
                <button key={b} type="button" className={`book${b === picked ? ' is-picked' : ''}`} onClick={() => pick(b)}
                  aria-current={b === book ? 'true' : undefined} aria-pressed={b === picked}>
                  <span>{bookName(b)}</span><small>{chaptersOf(b)}</small>
                </button>
              ))}
            </section>
          ))}
          {!sections.length && <p className="muted small pick-none">{t('No book matches “{q}”.', { q: query })}</p>}
        </nav>
        <section className="pick-chapters" aria-label={t('Chapters of {book}', { book: bookName(picked) })}>
          <h3 key={picked} className="pick-title page-in">{bookName(picked)} <small>{countLabel}</small></h3>
          <div key={`g-${picked}`} className="chapters-pick page-in">
            {Array.from({ length: count }, (_, i) => i + 1).map(c => (
              <button key={c} type="button" onClick={() => go(picked, c)}
                aria-current={picked === book && c === chapter ? 'page' : undefined}
                aria-label={`${bookName(picked)} ${c}`}>{c}</button>
            ))}
          </div>
        </section>
      </div>
    </Sheet>
  )
}
