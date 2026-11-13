import { useState } from 'react'
import { canonBooks, chaptersOf } from '../data/canon'
import { ALL_BOOKS } from '../lib/bible'
import { useT, bookName } from '../lib/i18n'
import { useTranslationId } from '../lib/translations'
import { bookPrint } from '../lib/cyanotype/theme'
import { useBooksRead } from '../lib/cyanotype/read'

// The book strip along the foot of the page: every book as a square of its own colour,
// in the order of the Bible being read. Books already opened are fuller, the one being
// read is outlined. Books the open verse's connections reach are marked too.
export default function Canon({ book, targets, onSelectBook }) {
  const t = useT()
  const [peek, setPeek] = useState(null)
  const books = canonBooks(useTranslationId())   // 73 books in a Catholic Bible
  const read = useBooksRead()
  const shown = peek || book
  const n = books.filter(b => read.includes(b)).length

  return (
    <footer className="canon" aria-label={t('The books of the Bible')}>
      <div className="foot-l" aria-live="polite">{t(peek ? 'BOOK' : 'NOW READING')}<em>{bookName(shown)}</em></div>
      <div className="strip" style={{ gridTemplateColumns: `repeat(${books.length}, minmax(0, 1fr))` }}>
        {books.map(b => {
          const i = ALL_BOOKS.indexOf(b)   // connections count books in the 66-book order
          return (
            <button key={b} type="button"
              className={`${b === book ? 'on' : read.includes(b) ? 'seen' : ''}${targets?.has(i) ? ' is-thread' : ''}`}
              style={{ background: bookPrint(b)[5] }}
              aria-label={`${bookName(b)}, ${chaptersOf(b) > 1 ? t('{n} chapters', { n: chaptersOf(b) }) : t('1 chapter')}`} title={bookName(b)}
              aria-current={b === book ? 'page' : undefined}
              onMouseEnter={() => setPeek(b)} onMouseLeave={() => setPeek(null)}
              onFocus={() => setPeek(b)} onBlur={() => setPeek(null)}
              onClick={() => onSelectBook(b)} />
          )
        })}
      </div>
      <div className="foot-r">{t('READ SO FAR')}<em>{t('{n} of {all} books', { n, all: books.length })}</em></div>
    </footer>
  )
}
