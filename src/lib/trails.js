import { parseReference, ALL_BOOKS } from './bible'
import { TRAILS } from '../data/trails'

// Each stop with its reference parsed: book, chapter and verse range.
export const TRAIL_STOPS = Object.fromEntries(TRAILS.map(t => [t.id, t.stops.map(([ref, note], i) => {
  const r = parseReference(ref)
  return { ref: ref.replace(/^Psalms /, 'Psalm '), note, i, book: r.book, chapter: r.chapter, v1: r.verse, v2: r.verseEnd || r.verse, nt: ALL_BOOKS.indexOf(r.book) >= 39 }
})]))

// The trail stops that fall in a chapter, or on one verse of it.
export function stopsAt(book, chapter, verse = null) {
  const out = []
  TRAILS.forEach(t => TRAIL_STOPS[t.id].forEach(s => {
    if (s.book === book && s.chapter === chapter && (verse == null || (verse >= s.v1 && verse <= s.v2))) out.push({ trail: t, stop: s })
  }))
  return out
}

// The verses of a chapter that are trail stops, for the small mark in the text.
export function trailVerses(book, chapter) {
  const set = new Set()
  stopsAt(book, chapter).forEach(({ stop }) => { for (let v = stop.v1; v <= stop.v2; v++) set.add(v) })
  return set
}
