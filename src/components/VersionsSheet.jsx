import { useEffect, useRef, useState } from 'react'
import Sheet from './Sheet'
import { getChapter } from '../lib/bible'
import { TRANSLATIONS, TRANSLATION_IDS, isAvailable, useTranslationId } from '../lib/translations'
import { storage } from '../lib/prefs'
import { evansOn, EVANS_TITLE } from '../lib/evans'
import { useT, placeName, uiLang } from '../lib/i18n'

// The chapter in several Bible versions at once, one column each and one row per verse,
// so the same verse always sits side by side. Rows follow the English verse numbers the
// whole app uses; a version that numbers a verse otherwise shows its own number beside it.
const KEY = 'verbum-compare-texts'
const MAX = 4

// Up to four chosen versions, the one being read first; another English text beside it
// when nothing has been chosen yet.
function startingTexts(current) {
  const saved = (storage.get(KEY) || []).filter(isAvailable)
  const picked = saved.length ? saved : [current, current === 'web' ? TRANSLATION_IDS.find(id => id !== 'web' && TRANSLATIONS[id].lang === 'en' && isAvailable(id)) || 'es' : 'web']
  return [current, ...picked.filter(id => id !== current)].slice(0, MAX)
}

// Rows in reading order: every verse number any version has, each column's own order kept
// (the Douay-Rheims places Daniel's longer chapter 3 between verses 23 and 24).
function rowOrder(columns) {
  const order = []
  for (const col of columns) {
    let after = -1
    for (const v of col.verses) {
      const at = order.indexOf(v.verse)
      if (at >= 0) { after = at; continue }
      order.splice(after + 1, 0, v.verse)
      after += 1
    }
  }
  return order
}

// What a version shows in one row: its words, a pointer to the verse that already holds
// them (verses the translators join, such as "38–39"), or nothing.
function cell(col, n) {
  const own = col.byNumber.get(n)
  if (own) {
    const blank = !own.text.trim() || own.text.trim() === '—'
    return blank ? { kind: 'none' } : { kind: 'text', verse: own }
  }
  const holder = col.verses.find(v => {
    const m = v.label?.match(/^(\d+)–(\d+)$/)
    return m && Number(m[1]) === v.verse && v.verse < n && n <= Number(m[2])
  })
  return holder ? { kind: 'joined', with: holder.verse } : { kind: 'none' }
}

export default function VersionsSheet({ open, onClose, book, chapter, verse }) {
  const t = useT()
  const current = useTranslationId()
  const [chosen, setChosen] = useState(() => startingTexts(current))
  // The version being read always leads.
  const texts = [current, ...chosen.filter(id => id !== current)].slice(0, MAX)
  const [state, setState] = useState({ key: '', columns: null })
  const key = `${book}|${chapter}|${texts.join(',')}`
  const wrap = useRef(null)
  const [rights, setRights] = useState(null)

  useEffect(() => {
    if (!open) return
    let live = true
    const ids = key.split('|')[2].split(',')
    Promise.all(ids.map(id => getChapter(book, chapter, id)
      .then(ch => ({ id, ...ch, byNumber: new Map(ch.verses.map(v => [v.verse, v])) }))
      .catch(err => ({ id, missing: err?.message === 'not-in-text', verses: [], byNumber: new Map() }))))
      .then(columns => { if (live) setState({ key, columns }) })
    return () => { live = false }
  }, [open, key, book, chapter])

  const columns = state.key === key ? state.columns : null

  // Bring the verse the reader had open into view, once the rows are drawn.
  useEffect(() => {
    if (!columns || !verse) return
    wrap.current?.querySelector(`[data-verse="${verse}"]`)?.scrollIntoView({ block: 'center' })
  }, [columns, verse])

  const toggle = (id) => {
    const next = texts.includes(id) ? texts.filter(x => x !== id) : [...texts, id].slice(0, MAX)
    setChosen(next)
    storage.set(KEY, next)
  }

  const rows = columns ? rowOrder(columns) : []
  const anyGap = columns && rows.some(n => columns.some(c => !c.missing && cell(c, n).kind === 'none'))

  return (
    <Sheet open={open} onClose={onClose} variant="full" title={t('{place} in other versions', { place: placeName(book, chapter) })} label={t('Compare versions')}>
      <div className="sheet-body versions">
        <fieldset className="versions-pick">
          <legend>{t('Versions to show side by side (up to four)')}</legend>
          {TRANSLATION_IDS.filter(isAvailable).map(id => {
            const tr = TRANSLATIONS[id]
            const on = texts.includes(id)
            return (
              <button key={id} type="button" className="chip" aria-pressed={on} disabled={id === current || (!on && texts.length >= MAX)}
                onClick={() => toggle(id)} title={tr.lang === 'en' ? tr.name : `${tr.language} · ${tr.name}`}>
                {tr.short}
              </button>
            )
          })}
        </fieldset>

        {!columns && <p className="muted">{t('Opening the page…')}</p>}
        {columns && (
          <div className="versions-wrap" ref={wrap}>
            <table className="versions-table" style={{ '--cols': columns.length }}>
              <thead>
                <tr>
                  <th scope="col" className="versions-n"><span className="visually-hidden">{t('Verse')}</span></th>
                  {columns.map(c => {
                    const tr = TRANSLATIONS[c.id]
                    return (
                      <th key={c.id} scope="col" lang={tr.lang === 'en' ? undefined : tr.lang}>
                        <b>{tr.short}</b> <span>{tr.name}{evansOn(c.id) && ` · ${EVANS_TITLE}`}</span>
                        {/* The publisher's notice, one tap away, so it does not crowd a phone screen. */}
                        {c.copyright && (
                          <button type="button" className="versions-copy" lang={uiLang()} aria-expanded={rights === c.id}
                            aria-label={t('Copyright of the {name}', { name: tr.name })} title={c.copyright}
                            onClick={() => setRights(rights === c.id ? null : c.id)}>©</button>
                        )}
                        {rights === c.id && <small className="versions-copy-note" lang="en">{c.copyright}</small>}
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {columns.some(c => c.heading) && (
                  <tr className="versions-title">
                    <td />
                    {columns.map(c => <td key={c.id} lang={TRANSLATIONS[c.id].lang}>{c.heading}</td>)}
                  </tr>
                )}
                {columns.some(c => c.missing) && (
                  <tr>
                    <td />
                    {columns.map(c => (
                      <td key={c.id} className="versions-none">
                        {c.missing && t('{book} is not part of this Bible.', { book: placeName(book, chapter).replace(/\s\d+$/, '') })}
                      </td>
                    ))}
                  </tr>
                )}
                {rows.map(n => (
                  <tr key={n} data-verse={n} className={n === verse ? 'is-here' : undefined}>
                    <th scope="row" className="versions-n">{n < 1000 ? n : ''}</th>
                    {columns.map(c => {
                      if (c.missing) return <td key={c.id} />
                      const x = cell(c, n)
                      const lang = TRANSLATIONS[c.id].lang
                      if (x.kind === 'text') {
                        const shown = x.verse.label && x.verse.label !== String(n) ? x.verse.label : null
                        return (
                          <td key={c.id} lang={lang} className="versions-text">
                            {shown && <sup className="versions-own" title={t('This translation numbers it {n}', { n: shown })}>{shown}</sup>}
                            {x.verse.text}
                          </td>
                        )
                      }
                      if (x.kind === 'joined') {
                        return <td key={c.id} className="versions-none">{t('Joined with verse {n} above', { n: x.with })}</td>
                      }
                      return <td key={c.id} className="versions-none"><span aria-hidden="true">—</span><span className="visually-hidden">{t('No verse with this number')}</span></td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {anyGap && (
          <p className="versions-note">
            {t('— This version has no verse with this number here. Modern translations leave out a few verses that are found only in later copies of the Greek, usually giving them in a footnote, and some versions number a few verses differently.')}
          </p>
        )}
      </div>
    </Sheet>
  )
}
