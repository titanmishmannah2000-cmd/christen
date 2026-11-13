import { useState } from 'react'
import Sheet from './Sheet'
import { IconExpand } from './Icons'
import { DepthSwitch } from './ChapterBrief'
import { useDepth } from '../lib/prefs'
import { useBookContext } from '../lib/notes'
import { sectionOf } from '../data/canon'
import { cite } from '../lib/sources'
import { CitedText, SourceList, Unchecked } from './Cited'
import BigStory from './BigStory'
import { EvansIntro } from './Evans'
import { evansOn } from '../lib/evans'
import { GnbIntro } from './Gnb'
import { gnbOn } from '../lib/gnb'
import { useTranslationId } from '../lib/translations'

// Whether the card opens full page; remembered for this reader only.
const WIDE_KEY = 'verbum-about-wide'
const readWide = () => { try { return localStorage.getItem(WIDE_KEY) === '1' } catch { return false } }
const saveWide = (on) => { try { localStorage.setItem(WIDE_KEY, on ? '1' : '0') } catch { /* private mode */ } }

const FIELDS = ['author', 'date', 'to', 'why', 'story', 'genre', 'structureNote', 'debate']

// The context card for a book: who, when, to whom and why, and in Deeper the
// genre, the outline and what scholars debate.
export default function AboutSheet({ open, onClose, book, chapter, onSelect }) {
  const context = useBookContext(book)
  const reading = useTranslationId()
  const deeper = useDepth() === 'deeper'
  const shown = FIELDS.filter(f => deeper || !['genre', 'structureNote', 'debate'].includes(f))
  const { parts, sources } = cite(shown.map(f => context?.[f] || ''))
  const t = (f) => <CitedText parts={parts[shown.indexOf(f)]} idPrefix="about-src" />
  const [wide, setWide] = useState(readWide)
  const toggleWide = () => { setWide(!wide); saveWide(!wide) }
  return (
    <Sheet open={open} onClose={onClose} variant={`drawer about-sheet${wide ? ' is-wide' : ''}`} label={`About ${book}`}
      tools={(
        <button className="icon-btn about-wide-btn" type="button" onClick={toggleWide} aria-pressed={wide}
          aria-label={wide ? 'Back to the side panel' : 'Expand to full page'} title={wide ? 'Back to the side panel' : 'Expand to full page'}>
          <IconExpand on={wide} />
        </button>
      )}
      head={<div className="about-head"><span className="eyebrow">{sectionOf(book)?.name}</span><h2 className="sheet-title">{book}</h2></div>}>
      <div className="sheet-body about">
        <DepthSwitch />
        {!context ? <p className="muted">Opening the card…</p> : (
          <>
            <dl className="facts">
              <dt>Who wrote it</dt><dd>{t('author')}</dd>
              <dt>When</dt><dd>{t('date')}</dd>
              <dt>For whom</dt><dd>{t('to')}</dd>
              <dt>Why</dt><dd>{t('why')}</dd>
            </dl>
            <h3>Where it fits in the big story</h3>
            <p>{t('story')}</p>
            <BigStory book={book} acts={context.acts} />
            {deeper && (
              <>
                <h3>What kind of writing</h3>
                <p>{t('genre')}</p>
                <h3>Outline</h3>
                {context.structureNote && <p className="small">{t('structureNote')}</p>}
                <ol className="outline">
                  {context.structure.map(([label, from, to]) => {
                    const here = chapter >= from && chapter <= to
                    return (
                      <li key={label} className={here ? 'is-here' : ''}>
                        <button type="button" onClick={() => onSelect(book, from)} aria-current={here ? 'true' : undefined}>
                          <span>{label}</span><small>{from === to ? from : `${from}–${to}`}</small>
                        </button>
                      </li>
                    )
                  })}
                </ol>
                <h3>Questions scholars discuss</h3>
                <p>{t('debate')}</p>
              </>
            )}
            <SourceList sources={sources} idPrefix="about-src" onVerse={onSelect} />
            {!context.sourced && <Unchecked />}
            {!deeper && <p className="muted small">Switch to Deeper for the book’s outline, its kind of writing and what scholars debate.</p>}
          </>
        )}
        {evansOn(reading) && <EvansIntro book={book} onVerse={(b, c) => onSelect(b, c)} />}
        {gnbOn(reading) && <GnbIntro book={book} onVerse={(b, c) => onSelect(b, c)} />}
      </div>
    </Sheet>
  )
}
