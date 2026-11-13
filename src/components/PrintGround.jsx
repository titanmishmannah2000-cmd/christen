import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { coat, average } from '../lib/cyanotype/print'
import { applyPrint, bookId, coatOf, paperOf, usePrintMode } from '../lib/cyanotype/theme'

// The print under the whole app. On "Whole page" the brushed coating in the book's colour
// fills the window; on light or dark paper the ground is plain paper. Either way the type
// colours are worked out here, measured on the coating exactly as in the approved mockup
// (a 1280 × 800 page, and a 760 × 330 panel behind the chapter opening), and set on <html>.
const PHONE_BLEED = 28   // px the phone print reaches past each edge of the screen
const measured = new Map()
function measure(book, mode) {
  const key = `${book}|${mode}`
  if (measured.has(key)) return measured.get(key)
  const id = bookId(book), base = coatOf(book)
  let ground, panel
  if (mode === 'full') {
    const cv = document.createElement('canvas')
    coat(cv, 1280, 800, 3 + id, { l: 22, r: 22, t: 20, b: 16 }, base)
    ground = panel = average(cv, 330, 330, 560, 380)
  } else {
    ground = paperOf(book)
    const pc = document.createElement('canvas')
    coat(pc, 760, 330, 8 + id, { l: 14, r: 16, t: 10, b: 10 }, base)
    panel = average(pc, 60, 60, 440, 200)
  }
  const out = { ground, panel }
  measured.set(key, out)
  return out
}

export default function PrintGround({ book }) {
  const mode = usePrintMode()
  const ref = useRef(null)
  const [size, setSize] = useState(() => [window.innerWidth, window.innerHeight])

  // Colours first, before the page paints, so a book never shows in the last book's colours.
  useLayoutEffect(() => {
    const { ground, panel } = measure(book, mode)
    applyPrint(book, ground, panel)
  }, [book, mode])

  useEffect(() => {
    let t
    const onResize = () => { clearTimeout(t); t = setTimeout(() => setSize([window.innerWidth, window.innerHeight]), 150) }
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); clearTimeout(t) }
  }, [])

  useLayoutEffect(() => {
    const cv = ref.current
    if (!cv || mode !== 'full') return
    const [W, H] = size
    // Phones: the canvas is drawn wider and taller than the screen (see .print-ground in cyanotype.css),
    // so the brushed ends of the strokes fall off-screen and no pale strip shows along the edges.
    const phone = W <= 900
    const edge = phone ? { l: 6, r: 6, t: 6, b: 6 } : { l: 22, r: 22, t: 20, b: 16 }
    const bleed = phone ? PHONE_BLEED * 2 : 0
    coat(cv, Math.round(W + bleed), Math.round(H + bleed), 3 + bookId(book), edge, coatOf(book))
  }, [book, mode, size])

  return mode === 'full' ? <canvas ref={ref} className="print-ground" aria-hidden="true" /> : null
}
