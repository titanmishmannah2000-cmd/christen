import { useEffect, useLayoutEffect, useRef } from 'react'
import { ALL_BOOKS } from '../lib/bible'
import { TRANSLATIONS, bookNameIn } from '../lib/translations'
import { useT, uiLang, bookName } from '../lib/i18n'
import { useDarkTheme } from '../lib/prefs'
import { coat, plate, words, rgba, hex2, DRN } from '../lib/cyanotype/print'
import { bookId, bookPrint, coatOf, secondColour, thirdColour, usePrintMode } from '../lib/cyanotype/theme'

const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()

// Shrinks the title until it fits on at most two lines, as in the mockup.
function fitTitle(el, start, min) {
  let fs = start
  el.style.fontSize = `${fs}px`
  while (fs > min && (el.scrollWidth > el.clientWidth + 1 || el.offsetHeight > fs * 0.95 * 2 + 6)) {
    fs -= 2
    el.style.fontSize = `${fs}px`
  }
}

// The chapter opening, printed as in the Cyanotype mockup: "The book of", the title, the
// chapter in words, the note on the book's colours (its colour, why, the verse, and its
// second and third colours), and the plant photogram beside it. On light or dark paper
// the opening sits on its own brushed panel of the book's colour.
export default function Opening({ book, chapter, translation, rtl }) {
  const t = useT()
  const mode = usePrintMode()
  const dark = useDarkTheme()
  const id = bookId(book)
  const b = bookPrint(book)
  const s2 = secondColour(book)
  const s3 = thirdColour(book)
  const tr = TRANSLATIONS[translation]
  const english = tr.lang === 'en'
  const dr = translation === 'dra' ? DRN[id] : null
  const kick = english ? (dr ? dr[1] : b[2]) : null
  const name = english ? (dr ? dr[2] : b[3]) : bookNameIn(translation, book, ALL_BOOKS)
  const shortName = english ? (dr ? dr[0] : book === 'Song of Solomon' ? b[0] : book) : bookName(book)
  const hasPlant = b[8] !== 'none'
  const label = t(book === 'Psalms' ? 'Psalm' : 'Chapter')
  const chap = uiLang() === 'en' ? `${label} ${words(chapter)}` : `${label} ${chapter}`

  const boxRef = useRef(null)
  const panelRef = useRef(null)
  const photoRef = useRef(null)
  const ttlRef = useRef(null)

  useLayoutEffect(() => {
    const el = ttlRef.current
    if (!el) return
    const fit = () => fitTitle(el, 88, 40)
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    document.fonts?.ready.then(fit)
    return () => ro.disconnect()
  }, [name])

  // The brushed panel behind the opening (light and dark paper).
  useEffect(() => {
    const cv = panelRef.current, box = boxRef.current
    if (!cv || !box || mode === 'full') return
    const draw = () => {
      const w = Math.round(cv.offsetWidth), h = Math.round(cv.offsetHeight)
      if (w > 0 && h > 0) coat(cv, w, h, 8 + id, { l: 14, r: 16, t: 10, b: 10 }, coatOf(book))
    }
    draw()
    let last = cv.offsetWidth
    const ro = new ResizeObserver(() => { if (Math.abs(cv.offsetWidth - last) > 2) { last = cv.offsetWidth; draw() } })
    ro.observe(box)
    return () => ro.disconnect()
  }, [book, id, mode])

  // The plant, printed in the book's second colour with a glow of its third (or its own).
  useEffect(() => {
    const cv = photoRef.current
    if (!cv || !hasPlant) return
    const pl = hex2(cssVar('--p-pl') || '#000000'), nav = hex2(cssVar('--p-nav') || '#000000')
    const glow = s3 ? rgba(nav, 0.85) : rgba(pl, dark ? 0.6 : 0.3)
    plate(cv, b, cssVar('--p-pl'), glow, 9 + id)
  }, [book, id, mode, dark, hasPlant, b, s3])

  return (
    <div className={`opening${hasPlant ? '' : ' bare'}`} ref={boxRef}>
      {mode !== 'full' && <canvas className="panel" ref={panelRef} aria-hidden="true" />}
      {hasPlant && <canvas className="photo" ref={photoRef} role="img" aria-label={t('A photogram of {plant} ({latin}), from {ref}', { plant: b[10].toLowerCase(), latin: b[9], ref: `${book} ${b[11]}` })} />}
      {kick && <div className="kick">{kick}</div>}
      <h1 className={`ttl${rtl ? ' is-rtl' : ''}`} ref={ttlRef}>
        {english ? name : <span className="title-name" lang={tr.lang}>{name}</span>}
        <span className="visually-hidden">, {label} {chapter}</span>
      </h1>
      <div className="chap" aria-hidden="true">{chap}</div>
      <div className="cblock">
        <div className="lab">{t('THIS BOOK’S COLOURS')}</div>
        <div className="cn">{b[4]}</div>
        <div className="cw">{b[6]}</div>
        <div className="lab">{`${shortName} ${b[7]}`.toUpperCase()}</div>
        <div className="c2"><i style={{ background: s2[1] }} /><span><span className="cn2">+ {s2[0]}</span><span className="lab">{s2[2]}</span></span></div>
        {s3 && <div className="c2 c3"><i style={{ background: s3[1] }} /><span><span className="cn2">+ {s3[0]}</span><span className="lab">{s3[2]}</span></span></div>}
      </div>
    </div>
  )
}
