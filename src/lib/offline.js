import { useSyncExternalStore } from 'react'
import { ALL_BOOKS, bookFileSlug, booksOf } from './bible'
import { DEUTERO_BOOKS, CHAPTER_COUNTS, CATHOLIC_CHAPTER_COUNTS } from '../data/books'
import { saveChapterCopy, refreshTextCopies } from './online'
import { TRANSLATIONS, translationId } from './translations'
import { gnbOn } from './gnb'
import { storage } from './prefs'
import { isNative } from './native'

// Offline use. In the built app a service worker (public/sw.js) saves the app
// itself on the first visit, and each book's text, notes and connections the
// first time it is opened. saveEverything() fetches all of them at once, so the
// whole Bible reads with no connection. In development there is no worker.
const SAVED_KEY = 'verbum-offline-saved'

export function registerOffline() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => { /* offline use unavailable */ })
    // A Bible read from its publisher and kept whole on the device is fetched again
    // before its 30 days run out.
    setTimeout(() => { refreshTextCopies().catch(() => {}) }, 4000)
  })
}

// The Android and iPhone apps carry every bundled Bible inside them, so they have nothing to save.
export const offlineSupported = () => import.meta.env.PROD && !isNative() && typeof navigator !== 'undefined' && 'serviceWorker' in navigator

let state = { busy: false, done: 0, total: 0, savedAt: storage.get(SAVED_KEY), failed: 0 }
const listeners = new Set()
const set = (patch) => { state = { ...state, ...patch }; listeners.forEach(l => l()) }
export function useOfflineState() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => state)
}

export async function saveEverything() {
  if (state.busy) return
  const base = import.meta.env.BASE_URL
  // The English text, plus the other Bible being read, if it ships with the app.
  // (Copyrighted texts are read from their publishers and cannot all be kept.)
  const chosen = TRANSLATIONS[translationId()]
  const other = chosen.dir && chosen.id !== 'web' ? chosen.dir : null
  const files = ['context.json', 'engraved.json', 'footnotes.json', 'parallels.json', ...ALL_BOOKS.flatMap(b => {
    const slug = bookFileSlug(b)
    return [`bible/${slug}.json`, `notes/${slug}.json`, `threads/${slug}.json`, ...(other ? [`${other}/${slug}.json`] : [])]
  }), ...(chosen.catholic && other ? DEUTERO_BOOKS.map(b => `${other}/${bookFileSlug(b)}.json`) : [])]
  // With the Good News Translation, the Good News Bible's introductions, helps and drawings
  // (its text itself is read from the publisher and cannot all be kept).
  if (gnbOn(chosen.id)) {
    files.push(...ALL_BOOKS.map(b => `gnb/${bookFileSlug(b)}.json`), 'gnb/extras.json')
    try {
      const extras = await (await fetch(`${base}gnb/extras.json`)).json()
      files.push(...(extras.images || []).map(img => `gnb/img/${img}`))
    } catch { /* saved as they are seen instead */ }
  }
  // A Bible read from API.Bible: every chapter, kept on the device (and refreshed, see
  // lib/online.js).
  const chapters = chosen.online === 'apibible'
    ? booksOf(chosen.id).flatMap(b => Array.from({ length: (chosen.catholic ? CATHOLIC_CHAPTER_COUNTS : CHAPTER_COUNTS)[b] || 0 }, (_, i) => [b, i + 1]))
    : []
  const jobs = [...files.map(f => ({ file: f })), ...chapters.map(([book, chapter]) => ({ book, chapter }))]
  set({ busy: true, done: 0, total: jobs.length, failed: 0 })
  await navigator.serviceWorker?.ready
  let failed = 0
  let next = 0
  // A few at a time, so a phone on a slow connection is not swamped.
  const worker = async () => {
    while (next < jobs.length) {
      const job = jobs[next++]
      try {
        if (job.file) { const r = await fetch(base + job.file); if (!r.ok) failed++ }
        else await saveChapterCopy(job.book, job.chapter, chosen.id)
      } catch { failed++ }
      set({ done: state.done + 1 })
    }
  }
  await Promise.all([worker(), worker(), worker(), worker()])
  const savedAt = failed ? state.savedAt : Date.now()
  if (!failed) storage.set(SAVED_KEY, savedAt)
  set({ busy: false, failed, savedAt })
}

// Whether the device is online right now, for a gentle note when it is not.
const onlineListeners = new Set()
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => onlineListeners.forEach(l => l()))
  window.addEventListener('offline', () => onlineListeners.forEach(l => l()))
}
export function useOnline() {
  return useSyncExternalStore((l) => { onlineListeners.add(l); return () => onlineListeners.delete(l) }, () => navigator.onLine)
}
