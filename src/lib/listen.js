import { useSyncExternalStore } from 'react'
import { storage } from './prefs'
import { voiceFor } from './voices'

// Listening to a whole chapter with the device's own voice, one verse at a time,
// so the page can follow along. Pausing remembers the verse; playing starts it again.
const RATE_KEY = 'verbum-listen-rate'
export const RATES = [0.8, 0.95, 1.1, 1.25]
let state = { book: null, chapter: null, verses: [], at: 0, playing: false, rate: storage.get(RATE_KEY) || 0.95, label: '' }
// A short rest between verses, as a person reading aloud would take a breath.
const BREATH_MS = 450
let breath = null
const listeners = new Set()
const set = (patch) => { state = { ...state, ...patch }; listeners.forEach(l => l()) }
export function useListen() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => state)
}
// Listening is switched off for now (the device voices sound too robotic); set this to
// true to bring back the Listen buttons, the player and the Reading voice setting.
export const LISTEN_ENABLED = false
export const canListen = () => LISTEN_ENABLED && typeof window !== 'undefined' && 'speechSynthesis' in window

let run = 0
function speakFrom(i) {
  const id = ++run
  clearTimeout(breath)
  speechSynthesis.cancel()
  if (i >= state.verses.length) { set({ playing: false, at: state.verses.length - 1, done: true }); return }
  set({ at: i, playing: true, done: false })
  const v = state.verses[i]
  const u = new SpeechSynthesisUtterance(v.text.replace(/[“”‘’]/g, (c) => (c === '’' ? "'" : '')))
  // A touch slower and lower than the device's default reads more gently.
  u.rate = state.rate * 0.92
  u.pitch = 0.96
  u.lang = state.lang || 'en'
  const vc = voiceFor(u.lang)
  if (vc) u.voice = vc
  u.onend = () => { if (id === run && state.playing) breath = setTimeout(() => { if (id === run && state.playing) speakFrom(i + 1) }, BREATH_MS) }
  u.onerror = (e) => { if (id === run && e.error !== 'interrupted' && e.error !== 'canceled') set({ playing: false }) }
  speechSynthesis.speak(u)
}

export function listenToChapter(book, chapter, verses, label, from = 0, lang = 'en') {
  if (!canListen() || !verses.length) return
  set({ book, chapter, verses, label, lang })
  speakFrom(from)
}
export function pauseListening() { run++; clearTimeout(breath); speechSynthesis.cancel(); set({ playing: false }) }
export function resumeListening() { speakFrom(state.done ? 0 : state.at) }
export function skip(by) { speakFrom(Math.max(0, Math.min(state.verses.length - 1, state.at + by))) }
export function stopListening() { run++; clearTimeout(breath); if (canListen()) speechSynthesis.cancel(); set({ book: null, chapter: null, verses: [], playing: false, done: false }) }
export function setRate(rate) {
  storage.set(RATE_KEY, rate)
  set({ rate })
  if (state.playing) speakFrom(state.at)
}
