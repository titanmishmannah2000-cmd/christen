import { openSheet } from '../lib/ui'
import { useVerseCounts } from '../lib/counts'
import { useT } from '../lib/i18n'

// Phones: the main tools as a tab bar under the thumb, each with its name.
export default function BottomBar({ atlasOpen, onToggleAtlas }) {
  const { due } = useVerseCounts()
  const t = useT()
  return (
    <nav className="tabbar" aria-label={t('Tools')}>
      <button type="button" onClick={() => openSheet('chapters')}><span>{t('Chapters')}</span></button>
      <button type="button" onClick={() => openSheet('search')}><span>{t('Search')}</span></button>
      <button type="button" className={atlasOpen ? 'is-on' : ''} aria-pressed={atlasOpen} onClick={onToggleAtlas}><span>{t('Atlas')}</span></button>
      <button type="button" onClick={() => openSheet('verses')}>
        <span>{t('My verses')}</span>
        {due > 0 && <i className="count" aria-label={t('{n} to practise', { n: due })}>{due}</i>}
      </button>
      <button type="button" onClick={() => openSheet('settings')}><span>{t('Settings')}</span></button>
    </nav>
  )
}
