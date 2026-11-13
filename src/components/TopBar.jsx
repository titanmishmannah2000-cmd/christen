import { sectionOf } from '../data/canon'
import { useT, placeName } from '../lib/i18n'
import { useVerseCounts } from '../lib/counts'
import { openSheet } from '../lib/ui'
import { TRANSLATIONS, useTranslationId, textName } from '../lib/translations'

// The bar along the top. The book and chapter is itself the button that changes
// them, so there is one obvious way to move around the Bible. On phones the
// tools move to the tab bar at the bottom (BottomBar) and only the essentials stay here.
export default function TopBar({ book, chapter, onHome, atlasOpen, onToggleAtlas }) {
  const { due } = useVerseCounts()
  const t = useT()
  const place = placeName(book, chapter)
  const tr = TRANSLATIONS[useTranslationId()]

  return (
    <header className="bar">
      <button className="mark-word" type="button" onClick={onHome} aria-label={t('Christen: back to the verse of the day')}>
        Christen
      </button>
      <div className="bar-main">
        <button className="picker" type="button" onClick={() => openSheet('chapters')} aria-haspopup="dialog"
          aria-label={t('{place}. Choose a book or chapter', { place })}>
          <span className="picker-sec">{t(sectionOf(book)?.name || '')}</span>
          <b>{place}</b>
        </button>
        {/* The Bible text being read, beside the chapter: also the button that changes it. */}
        <button className="version" type="button" onClick={() => openSheet('texts')} aria-haspopup="dialog"
          aria-label={t('Bible text: {name}. Change it', { name: textName(tr) })} title={textName(tr)}>
          <span>{tr.short}</span>
        </button>
        <nav className="nav" aria-label={t('Tools')}>
          <button className="pill" type="button" onClick={() => openSheet('paths')}><span className="label">{t('Start here')}</span></button>
          <button className="pill wide-only" type="button" onClick={() => openSheet('search')} title={t('Search (Ctrl K)')}><span className="label">{t('Search')}</span></button>
          <button className="pill wide-only" type="button" onClick={() => openSheet('verses')}>
            <span className="label">{t('My verses')}</span>
            {due > 0 && <span className="count" aria-label={t('{n} to practise', { n: due })}>{due}</span>}
          </button>
          <button className="pill wide-only" type="button" onClick={() => openSheet('settings')} aria-label={t('Settings: text size, pages, sound')}>
            <span className="label">{t('Settings')}</span>
          </button>
          <button className={`pill wide-only${atlasOpen ? ' is-on' : ''}`} type="button" onClick={onToggleAtlas} aria-pressed={atlasOpen}
            title={t('Maps, connected verses and timeline')}>
            <span className="label">{t('Atlas')}</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
