import { useSyncExternalStore } from 'react'
import { B, S, T3, derive, paperFor, coatFor, toHex, rgba, mix, hex2, ratio } from './print'
import { ALL_BOOKS } from '../bible'
import { DEUTERO_BOOKS } from '../../data/books'
import { storage, setPrintDark } from '../prefs'

// The Cyanotype print: each book has its own colour, and the page is printed in one of
// three ways. The book's colour never changes between them; only the paper does.
//   full   Whole page: the brushed coating in the book's colour covers the page
//   day    Light paper: light paper, with the coating behind the chapter opening
//   night  Dark paper: near-black paper, with the coating behind the chapter opening
export const MODES = ['full', 'day', 'night']
const MODE_KEY = 'verbum-print'
const SFX_KEY = 'verbum-switch-sounds'

// The book's place in the print's book list: the 66 books, then the seven in Catholic Bibles.
export function bookId(book) {
  const i = ALL_BOOKS.indexOf(book)
  if (i >= 0) return i
  const j = DEUTERO_BOOKS.indexOf(book)
  return j >= 0 ? 66 + j : 0
}
export const bookPrint = (book) => B[bookId(book)]
export const secondColour = (book) => S[bookId(book)]
export const thirdColour = (book) => T3[bookId(book)] || null

// What was printed last: the book, the paper, the measured coating and the colours
// worked out on them. The Atlas's Colour tab and the journey map read it.
let info = null
let mode = MODES.includes(storage.get(MODE_KEY)) ? storage.get(MODE_KEY) : 'full'
let sfx = storage.get(SFX_KEY) !== false
const listeners = new Set()
const emit = () => listeners.forEach(l => l())
const sub = (l) => { listeners.add(l); return () => listeners.delete(l) }

export const printMode = () => mode
export function usePrintMode() { return useSyncExternalStore(sub, () => mode) }
// Changes the mode at once. The switching animation (lib/cyanotype/switch.js) calls this
// at the right moment; everything else should go through switchMode.
export function setPrintModeNow(next) {
  if (!MODES.includes(next) || next === mode) return
  mode = next
  storage.set(MODE_KEY, mode)
  emit()
}
export const switchSounds = () => sfx
export function useSwitchSounds() { return useSyncExternalStore(sub, () => sfx) }
export function setSwitchSounds(on) { sfx = !!on; storage.set(SFX_KEY, sfx); emit() }

// The paper (or, on the whole page, the measured average of the coating) and every
// type colour worked out on it, as CSS variables on <html>. `ground` is the colour the
// page is read on; `panel` the measured colour of the coating behind the opening.
export function applyPrint(book, ground, panel) {
  const b = bookPrint(book), hex = b[5]
  const o = derive(hex, ground)
  const po = derive(hex, panel)
  const root = document.documentElement
  const set = (k, v) => root.style.setProperty(k, v)
  const lift = mix(ground, o.dark ? [255, 255, 255] : [255, 255, 255], o.dark ? 0.06 : 0.42).map(Math.round)
  set('--book', hex)
  set('--paper', toHex(ground))
  set('--vellum', toHex(ground))
  set('--leaf', toHex(lift))
  set('--ink', toHex(o.ink.c))
  set('--ink-soft', toHex(o.ash.c))
  set('--ash', toHex(o.ash.c))
  set('--dim', toHex(o.dim.c))
  set('--rule', rgba(o.ink.c, 0.22))
  set('--hi', toHex(o.hi.c))
  set('--nav', toHex(o.nav.c))
  set('--pl', toHex(o.pl.c))
  // On the whole page the chapter column and the Atlas lie under a deeper wash of the coat
  // (a paler one on light books; see cyanotype.css). Their labels take the book's second
  // colour, moved toward the type colour only as far as it takes to read clearly there.
  const side = o.dark ? mix(ground, [0, 0, 0], 0.2) : mix(ground, [255, 255, 255], 0.38)
  let label = o.pl.c
  for (let t = 0.05; ratio(label, side) < 4.5 && t <= 1; t += 0.05) label = mix(o.pl.c, o.ink.c, t)
  set('--side-label', toHex(label))
  set('--glow', rgba(o.hi.c, 0.28))
  set('--mark', rgba(o.hi.c, 0.3))
  set('--lapis', toHex(o.nav.c))
  set('--gold', toHex(o.hi.c))
  set('--gold-hi', toHex(o.hi.c))
  set('--rubric', toHex(o.dim.c))
  set('--initial-ground', hex)
  set('--shade', o.dark ? 'rgba(0,0,0,0.55)' : rgba(o.ink.c, 0.38))
  set('--map-ground', toHex(mix(ground, o.ink.c, 0.06)))
  set('--map-line', rgba(o.ink.c, 0.22))
  set('--map-sea', toHex(mix(ground, o.ink.c, 0.12)))
  set('--map-river', toHex(o.nav.c))
  // the chapter opening, printed on the coating
  set('--p-ink', toHex(po.ink.c))
  set('--p-ash', toHex(po.ash.c))
  set('--p-rule', rgba(po.ink.c, 0.22))
  set('--p-hi', toHex(po.hi.c))
  set('--p-nav', toHex(po.nav.c))
  set('--p-pl', toHex(po.pl.c))
  root.dataset.print = mode
  root.style.colorScheme = o.dark ? 'dark' : 'light'
  setPrintDark(o.dark)
  info = { book, mode, ground, panel, o, po }
  emit()
  return { o, po }
}

export const printInfo = () => info
export function usePrintInfo() { return useSyncExternalStore(sub, () => info) }

export const paperOf = (book) => paperFor(bookPrint(book)[5], mode)
export const coatOf = (book) => coatFor(bookPrint(book)[5])
export { hex2 }
