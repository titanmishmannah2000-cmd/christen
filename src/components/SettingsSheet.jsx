import { useState } from 'react'
import Sheet from './Sheet'
import { useOfflineState, saveEverything, offlineSupported } from '../lib/offline'
import { useDepth, setDepth, useReading, setReading, TEXT_SIZES, useTextMotion, setTextMotion } from '../lib/prefs'
import { TRANSLATIONS, useTranslationId, textName } from '../lib/translations'
import { openSheet } from '../lib/ui'
import { useT, useUiLang, setUiLang, UI_LANGS } from '../lib/i18n'
import { useVoices, voiceFor, setVoice, isNatural } from '../lib/voices'
import { canListen } from '../lib/listen'
import { usePrintMode, useSwitchSounds, setSwitchSounds } from '../lib/cyanotype/theme'
import { switchMode } from '../lib/cyanotype/switch'

// John 1:1 in each Bible text, to show the chosen size and typeface.
const PREVIEW = {
  web: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
  es: 'En el principio ya era el Verbo; y el Verbo era con Dios, y Dios era el Verbo.',
  fr: 'Au commencement était la Parole, et la Parole était avec Dieu, et la Parole était Dieu.',
  pt: 'No princípio era a Palavra, e a Palavra estava junto de Deus, e a Palavra era Deus.',
  dra: 'In the beginning was the Word: and the Word was with God: and the Word was God.',
  ur: 'اِبتدا میں کلام تھا اَور کلام خُدا کے ساتھ تھا اَور کلام خُدا ہی تھا۔',
}

// Reading settings: everything about how the page looks and sounds, in one place.
// Each setting is a row of plainly labelled choices, applied the moment you tap.
function Choice({ label, help, value, options, onChange }) {
  return (
    <fieldset className="set-row">
      <legend>{label}</legend>
      {help && <p className="set-help">{help}</p>}
      <div className="seg seg-wide" role="radiogroup" aria-label={label}>
        {options.map(([id, text]) => (
          <button key={id} type="button" role="radio" aria-checked={value === id} onClick={() => onChange(id)}>{text}</button>
        ))}
      </div>
    </fieldset>
  )
}

export default function SettingsSheet({ open, onClose, soundOn, onSound }) {
  const depth = useDepth()
  const print = usePrintMode()
  const switchSfx = useSwitchSounds()
  const reading = useReading()
  const last = TEXT_SIZES.length - 1
  const t = useT()
  const ui = useUiLang()
  const tr = useTranslationId()
  const textMotion = useTextMotion()
  return (
    <Sheet open={open} onClose={onClose} variant="drawer" title={t('Settings')} label={t('Reading settings')}>
      <div className="sheet-body settings">
        <Choice label={t('How much to show')} value={depth} onChange={setDepth}
          help={t('Simple gives a short summary and key words. Deeper adds who wrote each book, notes with sources, and the original Hebrew and Greek words.')}
          options={[['simple', t('Simple')], ['deeper', t('Deeper')]]} />

        <Choice label={t('Menus and buttons')} value={ui} onChange={setUiLang}
          help={t('The language of the app’s own words. Notes, book cards and paths are in English for now.')}
          options={UI_LANGS} />

        <BibleTextRow />

        <Choice label={t('When you change the Bible text')} value={textMotion} onChange={setTextMotion}
          help={t('The lights cut out with a switch, then the page lights up again in the new text, panel by panel, title first. The page keeps its place. Other animations in the app are not affected.')}
          options={[['paint', t('Lights out and on')], ['fade', t('Simple fade')]]} />

        <fieldset className="set-row">
          <legend>{t('Text size')}</legend>
          <div className="size-row">
            <button type="button" className="round size-btn" disabled={reading.size === 0}
              onClick={() => setReading({ size: reading.size - 1 })} aria-label={t('Smaller text')}>A</button>
            <div className="size-steps" role="radiogroup" aria-label={t('Text size')}>
              {TEXT_SIZES.map((_, i) => (
                <button key={i} type="button" role="radio" aria-checked={reading.size === i} aria-label={t('Size {i} of {n}', { i: i + 1, n: last + 1 })}
                  onClick={() => setReading({ size: i })}><span /></button>
              ))}
            </div>
            <button type="button" className="round size-btn big" disabled={reading.size === last}
              onClick={() => setReading({ size: reading.size + 1 })} aria-label={t('Larger text')}>A</button>
          </div>
          <p className="set-preview" lang={TRANSLATIONS[tr].lang}>{PREVIEW[tr] || PREVIEW.web}</p>
        </fieldset>

        <Choice label={t('Line spacing')} value={reading.spacing} onChange={(spacing) => setReading({ spacing })}
          options={[['normal', t('Normal')], ['roomy', t('Roomy')]]} />

        <Choice label={t('Typeface')} value={reading.face} onChange={(face) => setReading({ face })}
          help={t('Plain is a simple, clear letter that many people find easier to read.')}
          options={[['classic', t('Classic')], ['plain', t('Plain')]]} />

        <Choice label={t('Pages')} value={print} onChange={switchMode}
          help={t('Every book is printed in its own colour. It can cover the whole page, or sit behind each chapter’s opening on light or dark paper. The book’s colour never changes. Settings closes so you can see the page light up in its new print.')}
          options={[['full', t('Whole page')], ['day', t('Light paper')], ['night', t('Dark paper')]]} />

        <Choice label={t('Switching sounds')} value={switchSfx ? 'on' : 'off'} onChange={(v) => setSwitchSounds(v === 'on')}
          help={t('Soft clicks as the lights come on, a switch when they go off, and running water when the Atlas changes.')}
          options={[['on', t('On')], ['off', t('Off')]]} />

        <Choice label={t('Background sound')} value={soundOn ? 'on' : 'off'} onChange={(v) => onSound(v === 'on')}
          help={t('A soft background sound that changes with each book.')}
          options={[['off', t('Off')], ['on', t('On')]]} />

        <VoiceRow />

        <OfflineRow />

        <p className="muted small">{t('Your settings are kept on this device.')}</p>
      </div>
    </Sheet>
  )
}

// The Bible text in one line; the full list opens in its own sheet (BibleTextSheet),
// the same one the button beside the chapter name opens.
function BibleTextRow() {
  const id = useTranslationId()
  const t = useT()
  const name = textName(TRANSLATIONS[id])
  return (
    <div className="set-row text-row">
      <h3 className="set-label">{t('Bible text')}</h3>
      <div className="text-row-line">
        <span className="text-row-name" lang={TRANSLATIONS[id].lang} dir="auto">{name}</span>
        <button type="button" className="chip" onClick={() => openSheet('texts')} aria-haspopup="dialog"
          aria-label={t('Bible text: {name}. Change it', { name })}>{t('Change')}</button>
      </div>
    </div>
  )
}

// The voice that reads chapters aloud, in the language of the Bible text. Natural
// (neural) voices are listed first and marked; "Try it" reads John 1:1.
function VoiceRow() {
  const t = useT()
  const tr = useTranslationId()
  const lang = TRANSLATIONS[tr].lang
  const voices = useVoices(lang)
  const [, redraw] = useState(0)
  if (!canListen()) return null
  const current = voiceFor(lang)
  const natural = voices.some(isNatural)
  const tryIt = () => {
    const synth = window.speechSynthesis
    synth.cancel()
    const u = new SpeechSynthesisUtterance(PREVIEW[tr] || PREVIEW.web)
    u.lang = lang
    if (current) u.voice = current
    u.rate = 0.87
    u.pitch = 0.96
    synth.speak(u)
  }
  return (
    <fieldset className="set-row">
      <legend>{t('Reading voice')}</legend>
      <p className="set-help">{t('The voice that reads chapters aloud. Voices marked “natural” sound most like a person.')}</p>
      {voices.length > 0 ? (
        <div className="voice-row">
          <select className="voice-pick" value={current?.name || ''} aria-label={t('Reading voice')}
            onChange={(e) => { setVoice(lang, e.target.value); redraw(n => n + 1) }}>
            {voices.map(v => <option key={v.name} value={v.name}>{v.name}{isNatural(v) ? ` · ${t('natural')}` : ''}</option>)}
          </select>
          <button type="button" className="chip" onClick={tryIt}>{t('Try it')}</button>
        </div>
      ) : <p className="set-help">{t('This device has no voice for this language yet.')}</p>}
      {!natural && <p className="set-help">{t('For a gentler, more natural voice, open the app in Microsoft Edge or Google Chrome, or add a natural or enhanced voice in your device’s speech settings.')}</p>}
    </fieldset>
  )
}

// Use without internet: save every book, note and connection on this device.
function OfflineRow() {
  const { busy, done, total, savedAt, failed } = useOfflineState()
  const t = useT()
  const textId = useTranslationId()
  const ui = useUiLang()
  if (!offlineSupported()) return null
  const when = savedAt && new Date(savedAt).toLocaleDateString(ui, { day: 'numeric', month: 'long', year: 'numeric' })
  return (
    <fieldset className="set-row">
      <legend>{t('Use without internet')}</legend>
      <p className="set-help">
        {t('The app already opens without a connection, and every chapter you read is kept. Save the rest now so the whole Bible, its notes and connected verses open anywhere (about 8 MB). Maps and paintings you have looked at are kept too.')}
      </p>
      {busy
        ? <div className="save-bar" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label={t('Saving for offline use')}>
            <b style={{ width: `${total ? (100 * done) / total : 0}%` }} /><span>{t('Saving {done} of {total}…', { done, total })}</span>
          </div>
        : <button type="button" className="chip solid" onClick={saveEverything}>{t(savedAt ? 'Save again' : 'Save the whole Bible on this device')}</button>}
      {!busy && failed > 0 && <p className="set-help warn">{t('{n} files could not be saved. Check the connection and try again.', { n: failed })}</p>}
      {!busy && !failed && when && <p className="set-help">{t('Saved on {when}. Everything opens without internet.', { when })}</p>}
      {TRANSLATIONS[textId].online === 'apibible' && (
        <p className="set-help">{t('The {text} is saved too. Its publisher asks that each chapter be fetched again within 30 days, so the app does this by itself whenever it is online; if the device stays offline longer than that, the chapters wait until it is back online.', { text: TRANSLATIONS[textId].name })}</p>
      )}
    </fieldset>
  )
}
