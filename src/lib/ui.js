import { useSyncExternalStore } from 'react'
import { storage } from './prefs'

// Which sheet is open (books, search, settings, my verses, …), shared across the
// app so any button can open one without passing callbacks down through App.
// `chapters` opens the book picker straight on the current book's chapters.
// `verses` is the My verses tab: 'saved', 'heart' or 'notes'.
// `searchFor` opens search already looking for a Hebrew or Greek word by its number.
// `versionsVerse` is the verse Compare versions opens on.
const VERSES_TAB_KEY = 'verbum-verses-tab'
let state = {
  sheet: null,
  learn: null,
  searchFor: null,
  versesTab: ['heart', 'notes'].includes(storage.get(VERSES_TAB_KEY)) ? storage.get(VERSES_TAB_KEY) : 'saved',
}
const listeners = new Set()
const emit = () => listeners.forEach(l => l())

export function useUi() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => state)
}
export function openSheet(sheet, extra = {}) {
  state = { ...state, sheet, ...extra }
  if (extra.versesTab) storage.set(VERSES_TAB_KEY, extra.versesTab)
  emit()
}
export function closeSheet() {
  state = { ...state, sheet: null, learn: null, searchFor: null, versionsVerse: null }
  emit()
}
export function setVersesTab(versesTab) {
  state = { ...state, versesTab, learn: null }
  storage.set(VERSES_TAB_KEY, versesTab)
  emit()
}
