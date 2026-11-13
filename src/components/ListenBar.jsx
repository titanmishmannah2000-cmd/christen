import { useListen, pauseListening, resumeListening, skip, stopListening, setRate, RATES } from '../lib/listen'
import { IconPrev, IconNext, IconClose } from './Icons'
import { useT } from '../lib/i18n'

// The small player that appears while a chapter is read aloud.
export default function ListenBar() {
  const t = useT()
  const { book, verses, at, playing, rate, label, done } = useListen()
  if (!book) return null
  const v = verses[at]
  const nextRate = RATES[(RATES.indexOf(rate) + 1) % RATES.length] || RATES[1]
  return (
    <div className="listen-bar" role="region" aria-label={t('Reading aloud')}>
      <div className="listen-what">
        <b>{label}</b>
        <span aria-live="polite">{done ? t('Finished') : t('Verse {v} of {n}', { v: v?.verse, n: verses.length })}</span>
      </div>
      <div className="listen-btns">
        <button type="button" className="round" onClick={() => skip(-1)} aria-label={t('Previous verse')}><IconPrev /></button>
        <button type="button" className="listen-play" onClick={playing ? pauseListening : resumeListening}>{t(playing ? 'Pause' : done ? 'Again' : 'Play')}</button>
        <button type="button" className="round" onClick={() => skip(1)} aria-label={t('Next verse')}><IconNext /></button>
        <button type="button" className="chip listen-rate" onClick={() => setRate(nextRate)} aria-label={t('Speed {rate} times. Change speed', { rate })}>{rate}×</button>
        <button type="button" className="round" onClick={stopListening} aria-label={t('Stop reading aloud')}><IconClose /></button>
      </div>
    </div>
  )
}
