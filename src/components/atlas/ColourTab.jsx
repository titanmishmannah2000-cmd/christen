import { toHex } from '../../lib/cyanotype/print'
import { bookPrint, secondColour, thirdColour, usePrintInfo } from '../../lib/cyanotype/theme'
import { useT } from '../../lib/i18n'

// The colours on this page, as in the mockup: the book's true colour, the coating as
// measured, the paper, and every type colour worked out on them with its contrast.
export default function ColourTab({ book }) {
  const t = useT()
  const info = usePrintInfo()
  if (!info || info.book !== book) return null
  const { mode, ground, panel, o } = info
  const b = bookPrint(book), s2 = secondColour(book), s3 = thirdColour(book)
  const rows = [
    [t('TRUE COLOUR'), b[4], b[5], ''],
    [t('COATING'), t(mode === 'full' ? 'The whole page' : 'Behind the opening'), toHex(panel), t('measured')],
    mode === 'full' ? null : [t('PAPER'), t(mode === 'night' ? 'Dark paper' : 'Light paper'), toHex(ground), ''],
    [t('TEXT'), t('Bible text'), toHex(o.ink.c), o.ink.r],
    [t('SOFT TEXT'), t('Labels, kickers'), toHex(o.ash.c), o.ash.r],
    [t('SECOND COLOUR'), s2[0], s2[1], ''],
    [t('HIGHLIGHT'), t('Second colour, as printed'), toHex(o.hi.c), o.hi.r],
    s3 ? [t('THIRD COLOUR'), `${s3[0]}${t(', as printed')}`, toHex(o.nav.c), o.nav.r] : null,
  ].filter(Boolean)
  return (
    <div className="atl atl-colour">
      <div className="lab">{t('COLOURS ON THIS PAGE')}</div>
      <div className="sw">
        {rows.map(r => (
          <div key={r[0]}>
            <i style={{ background: r[2] }} />
            <span>{r[0]}<b>{r[1]}</b></span>
            <em>{r[2]}{typeof r[3] === 'number' ? <><br />{r[3].toFixed(1)} : 1</> : r[3] ? <><br />{r[3]}</> : null}</em>
          </div>
        ))}
      </div>
      <p className="atl-none">{t('Contrast is measured against the page the text sits on. 4.5 : 1 or more is easy to read.')}</p>
    </div>
  )
}
