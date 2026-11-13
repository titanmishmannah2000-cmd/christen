import { useTranslationId } from '../lib/translations'
import { bookIndex, canonBooks, chaptersOf } from '../data/canon'
import { openSheet } from '../lib/ui'
import { useT, uiLang } from '../lib/i18n'
import { bookPrint } from '../lib/cyanotype/theme'
import { words } from '../lib/cyanotype/print'

// The left rail, printed as in the Cyanotype mockup: the chapter number set large, how many
// there are in words, a short rule in the book's navigation colour, the book's place in the
// Bible, when and where it was written, and the chapter numbers to jump between.
export default function Rail({ book, chapter, onNavigate }) {
  useTranslationId()   // the book count changes with a Catholic Bible
  const t = useT()
  const count = chaptersOf(book)
  const label = t(book === 'Psalms' ? 'Psalm' : 'Chapter')
  const b = bookPrint(book)
  const english = uiLang() === 'en'
  // Up to sixteen chapter numbers: the first sixteen, or sixteen around the one being read.
  const first = count <= 16 || chapter <= 12 ? 1 : Math.min(chapter - 7, count - 15)
  const last = Math.min(count, first + 15)
  const nums = []
  for (let c = first; c <= last; c++) nums.push(c)
  return (
    <aside className="rail" aria-label={t('{label} {chapter} of {count}', { label, chapter, count })}>
      <div className="lab">{label}</div>
      <div key={`${book}-${chapter}`} className={`num${chapter >= 100 ? ' is-long' : ''}`} aria-hidden="true">{chapter}</div>
      <div className="of">{english ? `of ${words(count)}` : t('of {count}', { count })}</div>
      <div className="leaf" aria-hidden="true" />
      <dl className="facts">
        {bookIndex(book) >= 0 && <><dt>{t('BOOK')}</dt><dd>{t('{n} of {all}', { n: bookIndex(book) + 1, all: canonBooks().length })}</dd></>}
        <dt>{t('WRITTEN')}</dt><dd>{b[12]}</dd>
        <dt>{t('FROM')}</dt><dd>{b[13]}</dd>
      </dl>
      <nav className="chs" aria-label={t('Chapters')}>
        {first > 1 && <button type="button" onClick={() => openSheet('chapters')} aria-label={t(book === 'Psalms' ? 'All {n} psalms' : 'All {n} chapters', { n: count })}>&hellip;</button>}
        {nums.map(c => (
          <button key={c} type="button" className={c === chapter ? 'on' : ''} aria-current={c === chapter ? 'page' : undefined}
            onClick={() => onNavigate(book, c)}>{c}</button>
        ))}
        {last < count && <button type="button" onClick={() => openSheet('chapters')} aria-label={t(book === 'Psalms' ? 'All {n} psalms' : 'All {n} chapters', { n: count })}>&hellip;</button>}
      </nav>
    </aside>
  )
}
