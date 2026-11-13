import { useSyncExternalStore } from 'react'
import { storage } from './prefs'
import { ALL_BOOKS } from './bible'
import { bookNameIn } from './translations'
import { STRINGS } from '../data/uiStrings'

// The language of the app's own menus and buttons. The English wording is the key,
// so anything not yet translated simply stays in English. Notes, book cards and
// other written content are in English for now.
export const UI_LANGS = [['en', 'English'], ['es', 'Español'], ['fr', 'Français'], ['pt', 'Português']]
const KEY = 'verbum-ui-lang'
let lang = UI_LANGS.some(([id]) => id === storage.get(KEY)) ? storage.get(KEY) : 'en'
const listeners = new Set()
const applyLang = () => { if (typeof document !== 'undefined') document.documentElement.lang = lang }
applyLang()

export function useUiLang() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => lang)
}
export const uiLang = () => lang
export function setUiLang(next) {
  if (!UI_LANGS.some(([id]) => id === next)) return
  lang = next
  storage.set(KEY, next)
  applyLang()
  listeners.forEach(l => l())
}

// t('Search') or t('{n} chapters', { n: 5 }).
export function t(text, vars) {
  const s = lang === 'en' ? text : STRINGS[text]?.[lang] || text
  return vars ? s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)) : s
}
// In a component: const t = useT(), so it shows again when the language changes.
export function useT() {
  useUiLang()
  return t
}

// A book's name in the menu language: "Psalm 23" in English, "Salmos 23" in Spanish.
export const bookName = (book) => (lang === 'en' ? book : bookNameIn(lang, book, ALL_BOOKS))
export const placeName = (book, chapter) => (lang === 'en'
  ? `${book === 'Psalms' && chapter ? 'Psalm' : book} ${chapter}`
  : `${bookName(book)} ${chapter}`)
