import { useEffect, useState } from 'react'
import { storage } from './prefs'

// Choosing the gentlest voice the device has for reading aloud. Phones and browsers
// ship several voices; the old "desktop" ones sound robotic, while the newer neural
// ones (Microsoft "Natural" voices in Edge, Google voices in Chrome, Apple's
// Enhanced and Premium voices) sound close to a person. We rank them and pick the
// best, and the reader can choose another in Settings.
const KEY = 'verbum-voice'

function score(v) {
  const n = `${v.name} ${v.voiceURI}`.toLowerCase()
  let s = 0
  if (/natural|neural|premium|enhanced|wavenet|studio/.test(n)) s += 60
  if (/online/.test(n)) s += 15
  if (/^google/.test(v.name.toLowerCase())) s += 30
  if (/siri/.test(n)) s += 25
  if (/espeak|compact|desktop|robot|novelty|bad news|bells|boing|bubbles|cellos|whisper|zarvox|trinoids|albert|jester|organ|superstar|wobble/.test(n)) s -= 80
  if (v.localService) s += 2
  return s
}

const list = () => (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : [])

// The voices for a language, best first.
export function voicesFor(lang) {
  return list().filter(v => v.lang?.toLowerCase().startsWith(lang)).sort((a, b) => score(b) - score(a))
}

const chosen = () => storage.get(KEY) || {}
export function chosenVoiceName(lang) { return chosen()[lang] || null }
export function setVoice(lang, name) { storage.set(KEY, { ...chosen(), [lang]: name }) }

// The reader's chosen voice for this language, or the best one the device has.
export function voiceFor(lang) {
  const voices = voicesFor(lang)
  const name = chosenVoiceName(lang)
  return voices.find(v => v.name === name) || voices[0] || null
}

// Voices load late in some browsers; this re-renders once they arrive.
export function useVoices(lang) {
  const [voices, setVoices] = useState(() => voicesFor(lang))
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const update = () => setVoices(voicesFor(lang))
    update()
    window.speechSynthesis.addEventListener('voiceschanged', update)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update)
  }, [lang])
  return voices
}

// Whether a voice is one of the natural-sounding kinds.
export const isNatural = (v) => score(v) >= 25
