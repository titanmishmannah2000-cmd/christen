import { useState, useEffect, useRef, useMemo } from 'react'
import Sheet from './Sheet'
import { parseReference, formatReference, searchBible, searchTerms, getVerse } from '../lib/bible'
import { useTranslationId, isOnline, isCatholic, TRANSLATIONS } from '../lib/translations'
import { useT, bookName, placeName } from '../lib/i18n'
import { IconSearch } from './Icons'
import { useUi } from '../lib/ui'
import { parseNumber, hasOriginalLetters, versesUsing, findLemma } from '../lib/original'

const MIN_KEYWORD = 3

function Highlighted({ text, terms }) {
  if (!terms.length) return text
  const pattern = new RegExp(`\\b(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi')
  return text.split(pattern).map((part, i) => (i % 2 ? <mark key={i}>{part}</mark> : part))
}

export default function SearchSheet({ open, onClose, onSelect }) {
  const t = useT()
  const [query, setQuery] = useState('')
  const [testament, setTestament] = useState('all')
  const [search, setSearch] = useState({ key: '', results: [], total: 0, error: null })
  const [refPreview, setRefPreview] = useState(null)
  const inputRef = useRef(null)
  const { searchFor } = useUi()

  // Hebrew and Greek words: by Strong's number (H430, G26), or typed in their own letters.
  const number = useMemo(() => parseNumber(query), [query])
  const lettersQuery = !number && hasOriginalLetters(query)
  const [byNumber, setByNumber] = useState({ key: '', data: null, error: null })
  const [lemmas, setLemmas] = useState({ key: '', list: [] })

  const reference = useMemo(() => (number || lettersQuery ? null : parseReference(query)), [query, number, lettersQuery])
  const terms = useMemo(() => searchTerms(query), [query])
  const keywordQuery = !number && !lettersQuery && !(reference && reference.chapter) && query.trim().length >= MIN_KEYWORD
  const tr = useTranslationId()
  const searchKey = keywordQuery ? `${testament}|${query.trim().toLowerCase()}` : ''
  const searching = keywordQuery && search.key !== searchKey

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 30) }, [open])
  // Opened from a Hebrew or Greek word: start with its number already typed.
  const [seenFor, setSeenFor] = useState(null)
  if (open && searchFor && searchFor !== seenFor) { setSeenFor(searchFor); setQuery(searchFor) }
  if (!open && seenFor) setSeenFor(null)

  useEffect(() => {
    if (!number) return
    let cancelled = false
    versesUsing(number)
      .then(data => { if (!cancelled) setByNumber({ key: number, data, error: null }) })
      .catch(() => { if (!cancelled) setByNumber({ key: number, data: null, error: 'The Hebrew and Greek word lists could not be opened. They need a connection the first time.' }) })
    return () => { cancelled = true }
  }, [number])

  useEffect(() => {
    if (!lettersQuery) return
    let cancelled = false
    const q = query.trim()
    const timer = setTimeout(() => {
      findLemma(q).then(list => { if (!cancelled) setLemmas({ key: q, list }) }).catch(() => { if (!cancelled) setLemmas({ key: q, list: [] }) })
    }, 200)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [lettersQuery, query])

  // Keyword search across the whole Bible, debounced.
  useEffect(() => {
    if (!searchKey) return
    let cancelled = false
    const timer = setTimeout(() => {
      searchBible(query, { testament, tr })
        .then(({ results, total }) => { if (!cancelled) setSearch({ key: searchKey, results, total, error: null }) })
        .catch(() => { if (!cancelled) setSearch({ key: searchKey, results: [], total: 0, error: 'Search is unavailable right now' }) })
    }, 250)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [searchKey, query, testament, tr])

  // Show the verse text when the query is a single-verse reference.
  useEffect(() => {
    if (!reference?.verse) return
    let cancelled = false
    getVerse(reference.book, reference.chapter, reference.verse, tr)
      .then(v => { if (!cancelled) setRefPreview(v ? { ...v, key: formatReference(reference) } : null) })
      .catch(() => {})
    return () => { cancelled = true }
  }, [reference, tr])

  const close = () => { setQuery(''); onClose() }
  const go = (book, chapter, verse) => { onSelect(book, chapter, verse); close() }
  const goToReference = () => go(reference.book, reference.chapter || 1, reference.verse)
  const onSubmit = (e) => {
    e.preventDefault()
    if (number && byNumber.key === number && byNumber.data?.results[0]) {
      const v = byNumber.data.results[0]
      go(v.book_name, v.chapter, v.verse)
    } else if (lettersQuery && lemmas.list[0]) setQuery(lemmas.list[0].number)
    else if (reference) goToReference()
    else if (search.key === searchKey && search.results[0]) {
      const v = search.results[0]
      go(v.book_name, v.chapter, v.verse)
    }
  }

  const keywordResults = keywordQuery && search.key === searchKey ? search : null
  const numberResults = number && byNumber.key === number ? byNumber : null
  const lemmaList = lettersQuery && lemmas.key === query.trim() ? lemmas.list : null
  const preview = reference?.verse && refPreview?.key === formatReference(reference) ? refPreview : null

  return (
    <Sheet open={open} onClose={close} variant="top" label={t('Search')}
      head={
        <form onSubmit={onSubmit} style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <IconSearch />
          <input ref={inputRef} className="search-input" type="search" value={query} onChange={e => setQuery(e.target.value)}
            placeholder={t('A word, a phrase, John 3:16, or G26')} aria-label={t('Search the Bible')} autoComplete="off"
            onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); close() } }} />
        </form>
      }>
      <div className="sheet-body">
        {!number && !lettersQuery && <div className="filters" role="group" aria-label={t('Where to search')}>
          {[['all', 'Whole Bible'], ['old', 'Old Testament'], ['new', 'New Testament']].map(([id, name]) => (
            <button key={id} type="button" className="chip" aria-pressed={testament === id} onClick={() => setTestament(id)}>{t(name)}</button>
          ))}
        </div>}
        {number && !numberResults && <p className="hint">Finding every verse with {number.replace(/^([HG])0*/, '$1')}…</p>}
        {numberResults?.error && <p className="hint">{numberResults.error}</p>}
        {numberResults?.data && (
          <>
            {numberResults.data.words.length === 0 ? (
              <p className="hint">No Hebrew or Greek word has the number {number.replace(/^([HG])0*/, '$1')}. Strong’s numbers run from H1 to H8674 and from G1 to G5624.</p>
            ) : (
              <div className="word-hits">
                {numberResults.data.words.slice(0, 6).map(w => (
                  <p key={w.number} className="word-hit">
                    <span className="o-lemma" lang={w.number[0] === 'H' ? 'he' : 'grc'}>{w.lemma}</span>
                    {w.sound && <i> {w.sound}</i>}{w.meaning && <>, “{w.meaning}”</>}
                    <span className="word-hit-num"> · {w.number[0] === 'H' ? 'Hebrew' : 'Greek'} {w.number.replace(/^([HG])0*/, '$1')}</span>
                  </p>
                ))}
                <p className="hint">
                  {numberResults.data.total.toLocaleString()} verse{numberResults.data.total === 1 ? '' : 's'} use{numberResults.data.total === 1 ? 's' : ''} this word in the {number[0] === 'H' ? 'Hebrew Old' : 'Greek New'} Testament
                  {numberResults.data.total > numberResults.data.results.length ? `, showing the first ${numberResults.data.results.length}` : ''}.
                  {' '}The English below is the World English Bible, so the word may be translated in different ways.
                </p>
              </div>
            )}
          </>
        )}
        {lettersQuery && lemmaList && (
          lemmaList.length === 0
            ? <p className="hint">No dictionary word starts with those letters. Try fewer letters, or search by the word’s Strong’s number.</p>
            : (
              <>
                <p className="hint">Pick the word you mean to see every verse it is in.</p>
                {lemmaList.map(w => (
                  <button type="button" className="hit" key={w.number} onClick={() => setQuery(w.number)}>
                    <span className="ref">{w.number[0] === 'H' ? 'HEBREW' : 'GREEK'} {w.number.replace(/^([HG])0*/, '$1')} · USED {w.times.toLocaleString()} TIMES</span>
                    <span className="txt"><span className="o-lemma" lang={w.number[0] === 'H' ? 'he' : 'grc'}>{w.lemma}</span>{w.sound && <i> {w.sound}</i>}{w.meaning && <>, “{w.meaning}”</>}</span>
                  </button>
                ))}
              </>
            )
        )}
        {reference && (
          <button type="button" className="hit go-ref" onClick={goToReference}>
            <span>
              <span className="ref" style={{ display: 'block' }}>{t('Go to {place}', { place: `${bookName(reference.book)} ${formatReference(reference).slice(reference.book.length + 1)}` }).toUpperCase()} →</span>
              {preview && <span className="txt">{preview.text}</span>}
            </span>
          </button>
        )}
        {searching && <p className="hint">{t(isCatholic(tr) ? 'Searching all 73 books…' : 'Searching all 66 books…')}</p>}
        {keywordQuery && isOnline(tr) && <p className="hint">{t('Word search uses the World English Bible, because the {name} is read from its publisher a chapter at a time.', { name: TRANSLATIONS[tr].name })}</p>}
        {keywordResults?.error && <p className="hint">{t(keywordResults.error)}</p>}
        {keywordResults && !keywordResults.error && (
          <p className="hint">
            {keywordResults.total === 0
              ? t('No verses found.')
              : `${t(keywordResults.total === 1 ? '1 verse' : '{n} verses', { n: keywordResults.total.toLocaleString() })}${keywordResults.total > keywordResults.results.length ? t(', showing the first {n}', { n: keywordResults.results.length }) : ''}.`}
          </p>
        )}
        {!reference && !keywordQuery && !number && !lettersQuery && (
          <p className="hint">{t('Search for a word or phrase, or jump to a reference such as Psalm 23 or Rom 8:28. To find a Hebrew or Greek word, type its Strong’s number, such as H430 (God) or G26 (love), or type it in Hebrew or Greek letters. Open search anytime with')} <kbd>Ctrl</kbd> <kbd>K</kbd> {t('or')} <kbd>/</kbd>.</p>
        )}
        {(numberResults?.data?.results || []).map(v => (
          <button type="button" className="hit" key={`n-${v.book_name}-${v.chapter}-${v.verse}`} onClick={() => go(v.book_name, v.chapter, v.verse)}>
            <span className="ref">{(v.book_name === 'Psalms' ? 'Psalm' : v.book_name).toUpperCase()} {v.chapter}:{v.verse}</span>
            <span className="txt">{v.text}</span>
          </button>
        ))}
        {keywordResults?.results.map(v => (
          <button type="button" className="hit" key={`${v.book_name}-${v.chapter}-${v.verse}`} onClick={() => go(v.book_name, v.chapter, v.verse)}>
            <span className="ref">{placeName(v.book_name, v.chapter).toUpperCase()}:{v.verse}</span>
            <span className="txt"><Highlighted text={v.text} terms={terms} /></span>
          </button>
        ))}
      </div>
    </Sheet>
  )
}
