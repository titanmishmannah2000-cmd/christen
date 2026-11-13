import { useSyncExternalStore } from 'react'

// Small remembered preferences. Storage can be unavailable (private windows),
// so every read and write is guarded and the app works without it.
export const storage = {
  get(key) { try { return JSON.parse(localStorage.getItem(key)) } catch { return null } },
  set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* storage unavailable */ } },
}

// Light or dark type. The Cyanotype print decides it: each book's colour, printed on the
// whole page, on light paper or on dark paper (lib/cyanotype/theme.js), sets light type on
// dark grounds and dark type on light ones. Parts of the app that draw in colour (the
// marks on saved verses, the map) follow it through useDarkTheme.
let chosen = 'light'
document.documentElement.dataset.theme = chosen
const themeListeners = new Set()
const isDark = () => chosen === 'dark'
export function useDarkTheme() {
  return useSyncExternalStore((l) => { themeListeners.add(l); return () => themeListeners.delete(l) }, isDark)
}
export function setPrintDark(dark) {
  const next = dark ? 'dark' : 'light'
  if (next === chosen) return
  chosen = next
  document.documentElement.dataset.theme = chosen
  themeListeners.forEach(l => l())
}

// A short message at the bottom of the screen.
let toastState = { text: '', id: 0 }
const toastListeners = new Set()
let toastTimer
export function toast(text) {
  toastState = { text, id: toastState.id + 1 }
  toastListeners.forEach(l => l())
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastState = { ...toastState, text: '' }; toastListeners.forEach(l => l()) }, 2600)
}
export function useToast() {
  return useSyncExternalStore((l) => { toastListeners.add(l); return () => toastListeners.delete(l) }, () => toastState)
}

// Reading depth: "simple" (plain summary, key words) or "deeper" (notes, roots, outline).
const DEPTH_KEY = 'verbum-depth'
let depth = storage.get(DEPTH_KEY) === 'deeper' ? 'deeper' : 'simple'
const depthListeners = new Set()
export function useDepth() {
  return useSyncExternalStore((l) => { depthListeners.add(l); return () => depthListeners.delete(l) }, () => depth)
}
export function setDepth(next) {
  depth = next
  storage.set(DEPTH_KEY, next)
  depthListeners.forEach(l => l())
}

// Reading comfort: text size, line spacing and typeface for the Bible text.
// Applied as data attributes and a CSS variable on <html>, so every part of the
// reader follows without re-rendering.
const READING_KEY = 'verbum-reading'
export const TEXT_SIZES = [0.85, 0.93, 1, 1.12, 1.26, 1.42]
const READING_DEFAULT = { size: 2, spacing: 'normal', face: 'classic' }
let reading = { ...READING_DEFAULT, ...(storage.get(READING_KEY) || {}) }
if (!(reading.size >= 0 && reading.size < TEXT_SIZES.length)) reading.size = READING_DEFAULT.size
const readingListeners = new Set()
function applyReading() {
  const root = document.documentElement
  root.style.setProperty('--text-scale', String(TEXT_SIZES[reading.size]))
  root.dataset.spacing = reading.spacing
  root.dataset.face = reading.face
}
if (typeof document !== 'undefined') applyReading()
export function useReading() {
  return useSyncExternalStore((l) => { readingListeners.add(l); return () => readingListeners.delete(l) }, () => reading)
}
export function setReading(patch) {
  reading = { ...reading, ...patch }
  storage.set(READING_KEY, reading)
  applyReading()
  readingListeners.forEach(l => l())
}

// When the Bible text changes: 'paint' (the cloth wipe, the illuminated first letter and the
// handwriting) or 'fade' (the new text simply fades in). Only these animations follow
// this choice; every other animation in the app stays as it is.
const TEXT_MOTION_KEY = 'verbum-text-motion'
let textMotion = storage.get(TEXT_MOTION_KEY) === 'fade' ? 'fade' : 'paint'
const textMotionListeners = new Set()
export function useTextMotion() {
  return useSyncExternalStore((l) => { textMotionListeners.add(l); return () => textMotionListeners.delete(l) }, () => textMotion)
}
export const textMotionNow = () => textMotion
export function setTextMotion(next) {
  textMotion = next === 'fade' ? 'fade' : 'paint'
  storage.set(TEXT_MOTION_KEY, textMotion)
  textMotionListeners.forEach(l => l())
}
