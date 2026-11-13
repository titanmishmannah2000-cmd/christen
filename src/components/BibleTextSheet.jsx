import { useEffect, useRef } from 'react'
import Sheet from './Sheet'
import { pickText } from '../lib/cyanotype/switch'
import { TRANSLATIONS, useTranslationId, isAvailable, isOnline, recentTexts, textName } from '../lib/translations'
import { useT } from '../lib/i18n'

// Which Bible text the reader shows, opened from the button beside the chapter name
// (and from Settings). Texts used lately come first; then the English translations,
// the Catholic Bible with its 73 books, and other languages, each with a line on what
// it is. On phones it rises from the bottom; on wider screens it sits in the middle.
const TEXT_GROUPS = [
  { title: 'English', ids: ['web', 'esv', 'niv', 'nasb', 'csb'] },
  { title: 'Catholic Bible, 73 books', ids: ['dra', 'gnb'] },
  { title: 'Other languages', ids: ['es', 'fr', 'pt', 'ur'] },
]
const TEXT_ABOUT = {
  web: 'Modern English, free for anyone to share. Every note in the app is written beside it.',
  esv: 'A close, word-for-word modern translation, from Crossway.',
  nasb: 'One of the most literal English translations, loved for careful study. From the Lockman Foundation.',
  niv: 'The most widely read modern English translation, clear and accurate. From Biblica.',
  csb: 'Faithful to the original words and easy to read. It replaced the HCSB in 2017.',
  gnb: 'Plain, everyday American English, from the American Bible Society: the Catholic edition, with Tobit, Judith, Wisdom, Sirach, Baruch and 1 and 2 Maccabees.',
  dra: 'The classic English Bible of Catholics, with Tobit, Judith, Wisdom, Sirach, Baruch and 1 and 2 Maccabees.',
  es: 'The Bible in Spanish.',
  fr: 'The Bible in French.',
  pt: 'The Bible in Portuguese.',
  ur: 'The Bible in Urdu: the Urdu Contemporary Version, from Biblica.',
}

function Option({ k, current, t, brief, onPick }) {
  const tr = TRANSLATIONS[k]
  const ready = isAvailable(k)
  const now = current === k
  return (
    <li>
      <button type="button" className="text-opt" aria-current={now ? 'true' : undefined} aria-disabled={!ready || undefined}
        onClick={() => ready && onPick(k)}>
        <span className="text-opt-name"><span lang={tr.lang} dir="auto">{textName(tr)}</span> <b>{tr.short}</b></span>
        {!brief && <span className="text-opt-about">{t(TEXT_ABOUT[k])}</span>}
        <span className="text-opt-tags">
          {now && <span className="text-opt-tag now">{t('Reading now')}</span>}
          {(tr.online || (tr.licensed && !ready)) && <span className="text-opt-tag">{t(ready ? 'Needs the internet' : 'Not set up yet')}</span>}
        </span>
      </button>
    </li>
  )
}

export default function BibleTextSheet({ open, onClose }) {
  const t = useT()
  const id = useTranslationId()
  const body = useRef(null)
  const lately = recentTexts().filter(k => k !== id && isAvailable(k)).slice(0, 3)

  // Opening puts focus on the text being read, so the choice starts from there.
  useEffect(() => {
    if (!open) return
    const r = requestAnimationFrame(() => body.current?.querySelector('.text-opt[aria-current]')?.focus({ preventScroll: false }))
    return () => cancelAnimationFrame(r)
  }, [open])

  const pick = (k) => {
    if (k !== id) pickText(k, id)
    onClose()
  }
  // Up and down arrows (and Home, End) move through the list.
  const onKeyDown = (e) => {
    const all = [...body.current.querySelectorAll('.text-opt')]
    const i = all.indexOf(document.activeElement)
    let j = null
    if (e.key === 'ArrowDown') j = i < 0 ? 0 : Math.min(all.length - 1, i + 1)
    else if (e.key === 'ArrowUp') j = i < 0 ? 0 : Math.max(0, i - 1)
    else if (e.key === 'Home') j = 0
    else if (e.key === 'End') j = all.length - 1
    if (j === null) return
    e.preventDefault()
    all[j].focus()
  }

  return (
    <Sheet open={open} onClose={onClose} variant="texts" title={t('Bible text')} label={t('Choose the Bible text')}>
      <div className="sheet-body text-sheet" ref={body} onKeyDown={onKeyDown}>
        <p className="set-help">{t('Choose the translation you read. The notes stay in English and line up verse by verse.')}</p>
        {lately.length > 0 && (
          <section className="text-group" aria-labelledby="texts-recent">
            <h3 className="text-group-h" id="texts-recent">{t('Recently used')}</h3>
            <ul className="text-pick">{lately.map(k => <Option key={k} k={k} current={id} t={t} brief onPick={pick} />)}</ul>
          </section>
        )}
        {TEXT_GROUPS.map((g, gi) => (
          <section key={g.title} className="text-group" aria-labelledby={`texts-g${gi}`}>
            <h3 className="text-group-h" id={`texts-g${gi}`}>{t(g.title)}</h3>
            <ul className="text-pick">{g.ids.map(k => <Option key={k} k={k} current={id} t={t} onPick={pick} />)}</ul>
          </section>
        ))}
        {isOnline(id) && <p className="set-help">{t('The {name} is read from its publisher over the internet, a chapter at a time, as its license asks. Search and the side-by-side accounts use the World English Bible.', { name: TRANSLATIONS[id].name })}</p>}
        <p className="set-help">{t('More translations will be added once their publishers give permission.')}</p>
      </div>
    </Sheet>
  )
}
