import { useEffect, useState } from 'react'
import Sheet from './Sheet'
import { loadBook } from '../lib/bible'
import { useTranslationId, TRANSLATIONS } from '../lib/translations'
import { useParallels, parallelsAt, accountLabel, accountVerses } from '../lib/parallels'
import { useT, placeName } from '../lib/i18n'

// The same event as each book tells it, in columns side by side (stacked on a phone).
// Opened on one event from a verse, or on the list of every such event in the chapter.
export default function CompareSheet({ open, onClose, book, chapter, section, onPick, onRead }) {
  const t = useT()
  const data = useParallels()
  const here = parallelsAt(data, book, chapter)
  const shown = section != null && data ? data.sections[section] : null

  return (
    <Sheet open={open} onClose={onClose} variant="full" title={shown ? shown.title : t('Same events, told in other books')}
      label={t('Compare the accounts')}
      tools={shown && here.length > 1 && <button type="button" className="chip" onClick={() => onPick(null)}>{t('All in {place}', { place: placeName(book, chapter) })}</button>}>
      <div className="sheet-body compare">
        {!data && <p className="muted">{t('Opening the page…')}</p>}
        {data && !shown && (
          <>
            <p className="compare-help">{t('Some events are told by more than one writer. Choose one to read the accounts side by side and notice what each writer includes.')}</p>
            <ul className="compare-list">
              {here.map(s => (
                <li key={s.i}>
                  <button type="button" className="compare-pick" onClick={() => onPick(s.i)}>
                    <b>{s.title}</b>
                    <span>{s.accounts.map(accountLabel).join(' · ')}</span>
                  </button>
                </li>
              ))}
            </ul>
            {here.length === 0 && <p className="muted">{t('No other book tells the events of this chapter.')}</p>}
            <SourceLine sources={data.sources} keys={[...new Set(here.map(s => s.source))]} />
          </>
        )}
        {shown && (
          <>
            <div className="compare-cols" style={{ '--cols': shown.accounts.length }}>
              {shown.accounts.map(a => <Account key={a.book} account={a} current={a.book === book} onRead={onRead} />)}
            </div>
            <SourceLine sources={data.sources} keys={[shown.source]} />
          </>
        )}
      </div>
    </Sheet>
  )
}

function SourceLine({ sources, keys }) {
  const t = useT()
  if (!keys.length) return null
  return (
    <p className="compare-source">
      {t('Which passages tell the same event follows')} {keys.map(k => <cite key={k}>{sources[k]}</cite>).reduce((all, c, i) => (i ? [...all, '; ', c] : [c]), [])}.
    </p>
  )
}

function Account({ account, current, onRead }) {
  const t = useT()
  const tr = useTranslationId()
  const [state, setState] = useState({ key: '', rows: null })
  const key = `${tr}|${account.book}|${JSON.stringify(account.spans)}`

  useEffect(() => {
    let live = true
    loadBook(account.book, tr).then(({ chapters }) => {
      const last = (c) => Math.max(...(chapters[c - 1] || [[0]]).map(([v]) => v))
      const rows = accountVerses(account, last).map(([c, nums]) => {
        const text = new Map(chapters[c - 1] || [])
        return [c, nums.filter(v => text.has(v)).map(v => [v, text.get(v)])]
      })
      if (live) setState({ key, rows })
    }).catch(() => { if (live) setState({ key, rows: [] }) })
    return () => { live = false }
  }, [key, account, tr])

  const rows = state.key === key ? state.rows : null
  const [c1, v1] = account.spans[0]
  return (
    <section className={`compare-col${current ? ' is-here' : ''}`} lang={TRANSLATIONS[tr].lang}>
      <h3>{accountLabel(account)}{current && <small>{t('you are reading this')}</small>}</h3>
      <div className="compare-text">
        {!rows && <p className="muted">…</p>}
        {rows?.map(([c, verses], i) => (
          <p key={c}>
            {i > 0 && <span className="compare-gap" aria-hidden="true">…</span>}
            {verses.map(([v, text], k) => (
              <span key={v}>
                {k > 0 && verses[k - 1][0] !== v - 1 && <span className="compare-gap" aria-hidden="true">… </span>}
                <sup>{rows.length > 1 || account.spans.length > 1 ? `${c}:${v}` : v}</sup>{text}{' '}
              </span>
            ))}
          </p>
        ))}
      </div>
      {!current && <button type="button" className="link-btn" onClick={() => onRead(account.book, c1, v1)}>{t('Read it in {place}', { place: placeName(account.book, c1) })} →</button>}
    </section>
  )
}
