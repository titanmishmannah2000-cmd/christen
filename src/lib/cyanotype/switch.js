import { flushSync } from 'react-dom'
import { printMode, setPrintModeNow, bookPrint, printInfo } from './theme'
import { closeSheet } from '../ui'
import { setTranslation } from '../translations'
import { textMotionNow } from '../prefs'
import { holdPage, capturePage, lightsOn, blackout, colouredOn, modePlan, corridorPlan, lightsFromBlack, reducedMotion, nextFrames } from './lights'

// The animated changes of the print, as approved in the mockup.
const openRect = () => document.querySelector('.opening')?.getBoundingClientRect() || null
const bookHex = () => { const b = printInfo()?.book; return b ? bookPrint(b)[5] : '#888888' }
const WARM = '#FFF9E8'
const glowFor = (mode) => (mode === 'day' ? WARM : bookHex())
const until = (test, max = 3000) => new Promise(res => {
  const t0 = performance.now()
  const check = () => (test() || performance.now() - t0 > max ? res() : setTimeout(check, 40))
  check()
})
const sheetsClosed = async () => {
  if (!document.querySelector('dialog[open]')) return
  closeSheet()
  await until(() => !document.querySelector('dialog[open]'))
  await new Promise(r => setTimeout(r, 120))
}

// Whole page, Light paper, Dark paper. Settings closes first, so the change can be seen.
//   to Whole page or Light paper: the new print lights up in wide panels, from the title out;
//   to Dark paper: the kill switch, then only the coloured parts light up.
export async function switchMode(next) {
  if (next === printMode()) return
  if (reducedMotion()) { setPrintModeNow(next); return }
  await sheetsClosed()
  if (next === 'night') {
    const run = blackout()
    if (!(await run.dark)) { setPrintModeNow(next); return }
    flushSync(() => setPrintModeNow(next))
    await nextFrames(2)
    await colouredOn(run)
    return
  }
  const source = capturePage()
  if (!source) { setPrintModeNow(next); return }
  let go
  const ready = new Promise(r => { go = r })
  // the glow follows the new print: warm on light paper, the book's colour on the whole page
  lightsOn({ source, glow: () => glowFor(next), plan: () => modePlan(openRect(), false), ready })
  flushSync(() => setPrintModeNow(next))
  go()
}

// A new chapter or book: the corridor. `navigate` changes the page; the lights wait for
// the new chapter's words before they come on.
export function turnPage(navigate, dir) {
  if (reducedMotion() || !document.querySelector('.reader')) { navigate(); return }
  const source = capturePage()
  if (!source) { navigate(); return }
  let go
  const ready = new Promise(r => { go = r })
  lightsOn({ source, glow: () => glowFor(printMode()), plan: () => corridorPlan(dir), ready })
  const shown = new Promise(res => {
    const on = () => { window.removeEventListener('verbum:chapter-shown', on); res() }
    window.addEventListener('verbum:chapter-shown', on)
    setTimeout(on, 2500)
  })
  flushSync(() => navigate())
  shown.then(go)
}

// A new Bible text: the kill switch, the text is swapped in under the black, then the page
// lights up again (on Dark paper only the coloured parts). `commit` swaps the text in.
export async function changeText(commit) {
  const run = blackout()
  const dark = await run.dark
  await commit()
  if (!dark) return
  await nextFrames(2)
  if (printMode() === 'night') await colouredOn(run)
  else lightsFromBlack(run, glowFor(printMode()))
}

// Choosing another Bible text: the page is held exactly as it is until the kill switch
// (the reader's text change runs it), so nothing changes before the lights go out.
export function pickText(id, now) {
  if (id !== now && textMotionNow() === 'paint' && !reducedMotion() && document.querySelector('.reader .verses')) holdPage()
  setTranslation(id)
}
