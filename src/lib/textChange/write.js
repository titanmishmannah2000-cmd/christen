import { gsap } from 'gsap'
import { traceToken, makeWriter } from './letters'

// The new verses write themselves, verse by verse. Each verse (with its section heading)
// is a "group": its words are traced into pen paths, drawn on small canvases over the
// invisible real text, and then handed back to the real text, which fades in underneath
// before the drawn ink lifts away, so nothing on screen jumps.

const SCALE = () => Math.max(2, Math.min(3, (window.devicePixelRatio || 1) * 1.25))
const PEN_SPEED = 500 // CSS pixels of pen travel per second

// The visible text of a group: its section headings and the verse's words.
export function groupsOf(versesEl) {
  return [...versesEl.children].filter(el => el.tagName === 'DIV' && el.querySelector('.v')).map(div => ({
    div,
    num: div.querySelector('.v .n'),
    sources: [...div.querySelectorAll('.section-head, .v .words')],
  }))
}

// Remember each source's ink colour before the text is made invisible.
export function rememberInk(groups) {
  groups.forEach(g => { g.ink = g.sources.map(s => getComputedStyle(s).color) })
}

function tokensOf(group) {
  const out = []
  group.sources.forEach((src, si) => {
    const walker = document.createTreeWalker(src, NodeFilter.SHOW_TEXT)
    let node
    while ((node = walker.nextNode())) {
      const text = node.nodeValue
      const re = /[^\s\-–—]+[-–—]?/g
      let m
      while ((m = re.exec(text))) out.push({ node, start: m.index, end: m.index + m[0].length, text: m[0], color: group.ink?.[si] || 'currentColor' })
    }
  })
  return out
}

// Trace one group's words, a few at a time so the page never stalls. Resolves with the traced words.
export function traceGroup(group, origin, rtl, budget = { ms: 6 }) {
  const S = SCALE()
  const toks = tokensOf(group)
  const words = []
  return new Promise((resolve) => {
    let i = 0
    const step = () => {
      const t0 = performance.now()
      while (i < toks.length && (budget.all || performance.now() - t0 < budget.ms)) {
        const tok = toks[i++]
        const range = document.createRange()
        range.setStart(tok.node, tok.start)
        range.setEnd(tok.node, tok.end)
        const rects = range.getClientRects()
        if (rects.length !== 1 || !rects[0].width) continue // a word split across lines simply fades in with its verse
        tok.rect = rects[0]
        tok.style = getComputedStyle(tok.node.parentElement)
        words.push(traceToken(tok, rtl, S, origin()))
      }
      if (i < toks.length) requestAnimationFrame(step)
      else resolve(words)
    }
    step()
  })
}

// One group's writing as a timeline: the verse number appears, the words write in turn,
// then the real text takes over.
export function groupTimeline(group, words, layer) {
  const tl = gsap.timeline()
  const made = []
  let t = 0
  if (group.num) { tl.fromTo(group.num, { opacity: 0 }, { opacity: 1, duration: 0.35 }, 0); t += 0.15 }
  const pxPerSec = PEN_SPEED * SCALE()
  words.forEach((wd) => {
    const draw = makeWriter(wd, layer, made), proxy = { t: 0 }
    const dur = Math.max(0.14, wd.len / pxPerSec)
    tl.to(proxy, { t: 1, duration: dur, ease: 'none', onUpdate: () => draw(proxy.t), onStart: () => draw(0) }, t)
    t += dur + 0.035
  })
  tl.call(() => { group.div.dataset.inked = '' }, null, t + 0.05)
    .call(() => made.forEach(c => { c.style.transition = 'opacity .45s ease'; c.style.opacity = '0' }), null, t + 0.5)
    .call(() => made.forEach(c => c.remove()), null, t + 1)
  return tl
}
