import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { BOOK_THEMES, DEFAULT_THEME } from './data/books'
import { BOOK_PAINTINGS, DEFAULT_PAINTING } from './data/paintings'
import { parseReadingPath, readingPath } from './lib/routes'
import { playScene, stopSound } from './lib/soundscape'
import { useBookThreads, threadsFor } from './lib/threads'
import { storage, useToast, setDepth, useDarkTheme } from './lib/prefs'
import { useUi, openSheet, closeSheet } from './lib/ui'
import { startPath, setStep, stepOf } from './lib/paths'
import { addMemory } from './lib/memory'
import { PATHS_BY_ID } from './data/paths'
import TopBar from './components/TopBar'
import Canon from './components/Canon'
import Rail from './components/Rail'
import Reader from './components/Reader'
import Atlas from './components/Atlas'
import { closeAtlas, appStarted } from './lib/cyanotype/rinse'
import { turnPage } from './lib/cyanotype/switch'
import { bookId, usePrintMode } from './lib/cyanotype/theme'
import BooksSheet from './components/BooksSheet'
import SearchSheet from './components/SearchSheet'
import MyVersesSheet from './components/MyVersesSheet'
import SettingsSheet from './components/SettingsSheet'
import BibleTextSheet from './components/BibleTextSheet'
import BottomBar from './components/BottomBar'
import ListenBar from './components/ListenBar'
import Welcome from './components/Welcome'
import PathsSheet from './components/PathsSheet'
import AboutSheet from './components/AboutSheet'
import Ambience from './components/Ambience'
import PrintGround from './components/PrintGround'
import { markBookRead } from './lib/cyanotype/read'
import Sheet from './components/Sheet'
import CreditsSheet from './components/CreditsSheet'
import CompareSheet from './components/CompareSheet'
import VersionsSheet from './components/VersionsSheet'
import { EvansSheet } from './components/Evans'
import { GnbSheet } from './components/Gnb'
import StoryView from './components/StoryView'

// The zoom library is only needed once a painting is opened.
const PlateViewer = lazy(() => import('./components/PlateViewer'))

const LAST_READ_KEY = 'verbum-last-read'
const SOUND_KEY = 'verbum-sound'
const ATLAS_KEY = 'verbum-map-open'
const TAB_KEY = 'verbum-atlas-tab'
const TRAIL_KEY = 'verbum-trail'
const narrow = () => window.matchMedia('(max-width: 900px)').matches

export default function App() {
  const location = useLocation()
  const navigate = useNavigate()
  const fromUrl = parseReadingPath(location.pathname)
  const [lastRead] = useState(() => storage.get(LAST_READ_KEY))
  const { book, chapter, verse: focusVerse } = fromUrl || { book: 'Genesis', chapter: 1, verse: null }

  // A shared link opens straight into the reader; otherwise greet with the verse of the day.
  const [entered, setEntered] = useState(() => !!fromUrl)
  const [openVerse, setOpenVerse] = useState(() => fromUrl?.verse || null)
  const { sheet, compare, versionsVerse } = useUi()
  const setSheet = (name) => (name ? openSheet(name) : closeSheet())
  // On a phone the Atlas covers the page, so it always starts closed there.
  const [atlasOpen, setAtlasOpen] = useState(() => !narrow() && (storage.get(ATLAS_KEY) ?? true))
  const [atlasTab, setAtlasTab] = useState(() => (['colour', 'threads', 'trails', 'timeline'].includes(storage.get(TAB_KEY)) ? storage.get(TAB_KEY) : 'journey'))
  const [expanded, setExpanded] = useState(false)
  const [trail, setTrail] = useState(() => storage.get(TRAIL_KEY) || null)
  const [soundOn, setSoundOn] = useState(() => storage.get(SOUND_KEY) === true)
  const toastState = useToast()
  const printMode = usePrintMode()
  useEffect(() => { appStarted.current = true }, [])
  const darkPrint = useDarkTheme()

  const theme = BOOK_THEMES[book] || DEFAULT_THEME
  const painting = BOOK_PAINTINGS[book] || DEFAULT_PAINTING
  const threads = useBookThreads(book)

  const goTo = useCallback((nextBook, nextChapter, verse = null) => {
    const go = () => {
      setOpenVerse(verse)
      setEntered(true)
      navigate(readingPath(nextBook, nextChapter, verse))
    }
    // A new chapter or book lights up column by column, forwards or backwards.
    const here = [bookId(book), chapter], there = [bookId(nextBook), nextChapter]
    if (!entered || (here[0] === there[0] && here[1] === there[1])) { go(); return }
    turnPage(go, there[0] > here[0] || (there[0] === here[0] && there[1] > here[1]) ? 1 : -1)
  }, [navigate, book, chapter, entered])

  useEffect(() => {
    if (fromUrl) { storage.set(LAST_READ_KEY, { book: fromUrl.book, chapter: fromUrl.chapter }); markBookRead(fromUrl.book) }
  }, [fromUrl?.book, fromUrl?.chapter]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.title = entered ? `${book === 'Psalms' ? 'Psalm' : book} ${chapter} · Christen` : 'Christen'
  }, [entered, book, chapter])

  // Ambient sound follows the book. Browsers only allow audio after a tap or
  // key press, so a remembered "on" waits for the first interaction.
  useEffect(() => {
    if (!soundOn || !entered) { stopSound(); return }
    const start = () => { try { playScene(theme.sound) } catch { /* no Web Audio */ } }
    start()
    window.addEventListener('pointerdown', start, { once: true })
    window.addEventListener('keydown', start, { once: true })
    return () => {
      window.removeEventListener('pointerdown', start)
      window.removeEventListener('keydown', start)
    }
  }, [soundOn, entered, theme.sound])

  // Ctrl/⌘ K or "/" opens search.
  useEffect(() => {
    const onKey = (e) => {
      if (!entered) return
      const typing = e.target.closest?.('input, textarea, [contenteditable]')
      if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setSheet('search') }
      else if (e.key === '/' && !typing && !document.querySelector('dialog[open]')) { e.preventDefault(); setSheet('search') }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [entered])

  const showAtlas = (open) => {
    setAtlasOpen(open)
    if (!narrow()) storage.set(ATLAS_KEY, open)
    if (!open) setExpanded(false)
  }
  const toggleAtlas = () => (atlasOpen ? closeAtlas(() => showAtlas(false)) : showAtlas(true))
  const chooseTab = (tab) => {
    setAtlasTab(tab)
    storage.set(TAB_KEY, tab)
  }
  const followThreads = (verse) => {
    setOpenVerse(verse)
    chooseTab('threads')
    showAtlas(true)
  }
  const chooseTrail = (id) => { setTrail(id); storage.set(TRAIL_KEY, id) }
  const followTrail = (id) => {
    chooseTrail(id)
    chooseTab('trails')
    showAtlas(true)
  }
  const toggleExpanded = useCallback(() => setExpanded(x => !x), [])

  // The canon ribbon marks in gold the books the open verse's connections reach.
  const targets = useMemo(() => (
    atlasOpen && atlasTab === 'threads' && openVerse
      ? new Set(threadsFor(threads, chapter, openVerse).map(t => t.bookIndex))
      : null
  ), [atlasOpen, atlasTab, openVerse, threads, chapter])

  // Start (or restart) a Start here path and open its current step.
  const choosePath = (id, restart = false) => {
    const path = PATHS_BY_ID[id]
    if (restart) setStep(id, 0)
    else startPath(id)
    setDepth(path.depth)
    if (path.threads) { chooseTab('threads'); if (!narrow()) showAtlas(true) }
    const at = restart ? 0 : Math.min(stepOf(id), path.steps.length - 1)
    const [b, c] = path.steps[at]
    setSheet(null)
    goTo(b, c)
  }

  const setSound = (on) => { storage.set(SOUND_KEY, on); setSoundOn(on) }
  const enter = () => {
    const start = lastRead?.book ? lastRead : { book: 'Genesis', chapter: 1 }
    goTo(start.book, start.chapter)
  }

  return (
    <div className="app-shell" data-print={printMode} data-theme={darkPrint ? 'dark' : 'light'}>
      <PrintGround book={entered ? book : (lastRead?.book || 'Genesis')} />
      <Ambience />
      <AnimatePresence>
        {!entered && (
          <Welcome
            key="welcome"
            onEnter={enter}
            onChoosePath={choosePath}
            onOpenVerse={(r) => goTo(r.book, r.chapter, r.verse || null)}
            resume={lastRead?.book ? lastRead : null}
          />
        )}
      </AnimatePresence>

      {entered && (
        <>
          <TopBar
            book={book} chapter={chapter}
            onHome={() => setEntered(false)}
            atlasOpen={atlasOpen}
            onToggleAtlas={toggleAtlas}
          />

          <div className={`cols${atlasOpen && expanded ? ' is-expanded' : ''}`}>
            <Rail book={book} chapter={chapter} onNavigate={goTo} />
            <Reader
              book={book} chapter={chapter} focusVerse={focusVerse}
              openVerse={openVerse} onOpenVerse={setOpenVerse}
              onNavigate={goTo}
              threads={threads}
              onFollowThreads={followThreads}
              onFollowTrail={followTrail}
              onLearn={(v) => openSheet('verses', { versesTab: 'heart', learn: addMemory(book, chapter, v) })}
              painting={painting}
              onOpenPaths={() => setSheet('paths')}
              onOpenAbout={() => setSheet('about')}
              onOpenPlate={() => setSheet('plate')}
              onOpenStory={() => setSheet('story')}
              onOpenCredits={() => setSheet('credits')}
            />
            <AnimatePresence>
              {atlasOpen && (
                <Atlas
                  key="atlas"
                  tab={atlasTab} onTab={chooseTab}
                  book={book} chapter={chapter} verse={openVerse}
                  threads={threads}
                  trail={trail} onTrail={chooseTrail}
                  onChapterChange={(c) => goTo(book, c)}
                  onNavigate={goTo}
                  expanded={expanded} onToggleExpand={toggleExpanded}
                  onClose={() => showAtlas(false)}
                />
              )}
            </AnimatePresence>
          </div>

          <Canon book={book} targets={targets} onSelectBook={(b) => goTo(b, 1)} />
          <ListenBar />
          <BottomBar atlasOpen={atlasOpen} onToggleAtlas={toggleAtlas} />

          <BooksSheet open={sheet === 'chapters'} onClose={() => setSheet(null)} book={book} chapter={chapter}
            onSelect={(b, c) => { setSheet(null); goTo(b, c) }} />
          <SearchSheet open={sheet === 'search'} onClose={() => setSheet(null)} onSelect={goTo} />
          <PathsSheet open={sheet === 'paths'} onClose={() => setSheet(null)} onChoose={choosePath} onRead={(b, c) => { setSheet(null); goTo(b, c) }} />
          <AboutSheet open={sheet === 'about'} onClose={() => setSheet(null)} book={book} chapter={chapter}
            onSelect={(b, c) => { setSheet(null); goTo(b, c) }} />
          <Sheet open={sheet === 'plate'} onClose={() => setSheet(null)} variant="full" title={painting.title} label={`Painting: ${painting.title}`}>
            {sheet === 'plate' && (
              <Suspense fallback={<div className="empty-pane">Bringing in the painting…</div>}>
                <PlateViewer painting={painting} onNavigate={(b, c, v) => { setSheet(null); goTo(b, c, v || null) }} />
              </Suspense>
            )}
          </Sheet>
          <Sheet open={sheet === 'story'} onClose={() => setSheet(null)} variant="full" title={`${book} ${chapter} as a story`} label="Chapter story">
            {sheet === 'story' && <StoryView key={`${book}-${chapter}`} book={book} chapter={chapter}
              onStory={(c) => goTo(book, c)}
              onRead={(b, c, v) => { setSheet(null); goTo(b, c, v || null) }} />}
          </Sheet>
          <MyVersesSheet open={sheet === 'verses'} onClose={() => setSheet(null)} onRead={(b, c, v) => goTo(b, c, v || null)} />
          <SettingsSheet open={sheet === 'settings'} onClose={() => setSheet(null)} soundOn={soundOn} onSound={setSound} />
          <BibleTextSheet open={sheet === 'texts'} onClose={() => setSheet(null)} />
          <CreditsSheet open={sheet === 'credits'} onClose={() => setSheet(null)} />
          <CompareSheet open={sheet === 'compare'} onClose={() => setSheet(null)} book={book} chapter={chapter} section={compare}
            onPick={(i) => openSheet('compare', { compare: i })} onRead={(b, c, v) => { setSheet(null); goTo(b, c, v || null) }} />
          <VersionsSheet open={sheet === 'versions'} onClose={() => setSheet(null)} book={book} chapter={chapter} verse={versionsVerse} />
          <EvansSheet open={sheet === 'evans'} onClose={() => setSheet(null)} onRead={(b, c, v) => { setSheet(null); goTo(b, c, v || null) }} />
          <GnbSheet open={sheet === 'gnb'} onClose={() => setSheet(null)} onRead={(b, c, v) => { setSheet(null); goTo(b, c, v || null) }} />
        </>
      )}

      <div className={`toast${toastState.text ? ' is-on' : ''}`} role="status">{toastState.text}</div>
    </div>
  )
}
