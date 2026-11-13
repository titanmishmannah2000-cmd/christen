import { RNG } from './print'
import { panelsOn, blackout as killSwitch } from './sound'

// The page lights, exactly as approved in the Cyanotype mockup.
//   Lights on (Whole page, Light paper): wide panels, 2 : 1, a few switching together,
//   in waves spreading out from the title; each flickers on with a soft bloom of colour.
//   Kill switch (Dark paper, a new Bible text): every light cuts at once and the bulbs
//   cool to black over about 1.6 s.
//   Corridor (a new chapter): the panels light column by column across the page, left to
//   right for the next chapter and right to left for the previous one.
// The new page is put in place underneath at once; what lies over it is the old page (or
// black), panel by panel, fading as each panel's light comes on. The overlay is built from
// a handful of copies of the old page, one for each step of brightness, so a long chapter
// never needs more than eight copies.

// Phones (and the Android app) get a lighter version of the same effect: fewer brightness
// steps, a copy of only what is on screen, and the kill switch faded by the graphics chip
// instead of being redrawn by script every frame. Same look, much less work per frame.
const PHONE = () => window.matchMedia('(max-width: 900px), (pointer: coarse)').matches
let LEVELS = 8
const clamp = (t) => Math.max(0, Math.min(1, t))
const eOut = (t) => 1 - Math.pow(1 - t, 3)
function curve(k, t) { for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return 1 }
export const onCurve = (t) => curve([[0, 0], [0.08, 0.75], [0.13, 0.05], [0.22, 0.9], [0.27, 0.25], [0.36, 0.2], [0.42, 1], [1, 1]], t)
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const frame = () => new Promise(r => requestAnimationFrame(() => r()))
export const nextFrames = async (n = 2) => { for (let i = 0; i < n; i++) await frame() }

// One run at a time. A new change finishes the one before it at once.
let current = null
export const busy = () => !!current
export function finishLights() { current?.finish() }

function overlayRoot() {
  const root = document.createElement('div')
  root.className = 'fx-root'
  root.setAttribute('aria-hidden', 'true')
  document.body.appendChild(root)
  document.documentElement.classList.add('fx-busy')
  return root
}
// While the lights run, the page's own entrances are held off (html.fx-busy in the CSS).
// When the overlay goes, the parts that are already on screen keep them off, or lifting the
// class would start every fade-in again and the finished page would flicker.
const ENTRANCES = '.page-in, .reader, .rail'
function dropRoot(root) {
  root.remove()
  if (document.querySelector('.fx-root')) return
  document.querySelectorAll(ENTRANCES).forEach(el => { el.style.animation = 'none' })
  document.documentElement.classList.remove('fx-busy')
}

// The page as it is now, ready to be laid over the next one: the shell with the pictures in
// its canvases, its scroll positions and the colours it is printed in.
// On a long phone page the copy keeps only what is on screen: everything wholly above or
// below the screen is emptied and held at its size, so the copies stay small.
function pruneOffscreen(el, c) {
  const H = window.innerHeight, from = el.querySelectorAll('*'), to = c.querySelectorAll('*')
  const gone = new Set()
  from.forEach((n, i) => {
    if (gone.has(n.parentElement)) { gone.add(n); return }
    const d = to[i]
    if (!d || n.tagName === 'CANVAS') return
    const r = n.getBoundingClientRect()
    if (!r.height || (r.bottom > -40 && r.top < H + 40)) return
    const s = getComputedStyle(n)
    if (s.position === 'fixed' || !/^(block|flex|grid|list-item|flow-root)$/.test(s.display)) return
    gone.add(n)
    d.replaceChildren()
    d.style.height = `${r.height}px`; d.style.minHeight = '0'; d.style.visibility = 'hidden'
  })
}
function copyOf(el, scrolls = []) {
  const c = el.cloneNode(true)
  // scroll positions are marked on the copy before the trim moves anything
  const all = c.querySelectorAll('*')
  scrolls.forEach(([i, top, left]) => { if (all[i]) all[i].dataset.fxScroll = `${top},${left}` })
  const from = el.querySelectorAll('canvas'), to = c.querySelectorAll('canvas')
  from.forEach((cv, i) => {
    const d = to[i]
    if (!cv.width || !cv.height) return
    d.width = cv.width; d.height = cv.height
    try { d.getContext('2d')?.drawImage(cv, 0, 0) } catch { /* a map drawn by the graphics card stays blank */ }
  })
  // after the canvases are copied, as the trim takes some of them away
  if (PHONE()) pruneOffscreen(el, c)
  c.querySelectorAll('dialog, .fx-root, .toast').forEach(n => n.remove())
  c.removeAttribute('id'); c.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'))
  c.inert = true
  return c
}
function scrollsOf(el) {
  const out = []
  el.querySelectorAll('*').forEach((n, i) => { if (n.scrollTop || n.scrollLeft) out.push([i, n.scrollTop, n.scrollLeft]) })
  return out
}
function restoreScrolls(c) {
  c.querySelectorAll('[data-fx-scroll]').forEach(n => { const [top, left] = n.dataset.fxScroll.split(','); n.scrollTop = +top; n.scrollLeft = +left })
}
export function capturePage() {
  const shell = document.querySelector('.app-shell')
  if (!shell) return null
  const root = document.documentElement
  const vars = []
  for (let i = 0; i < root.style.length; i++) { const k = root.style[i]; if (k.startsWith('--')) vars.push([k, root.style.getPropertyValue(k)]) }
  const paper = getComputedStyle(document.body).backgroundColor
  const rect = shell.getBoundingClientRect()
  const scrolls = scrollsOf(shell)
  const master = copyOf(shell, scrolls)
  return {
    make() {
      const box = document.createElement('div')
      box.className = 'fx-layer'
      box.style.background = paper
      vars.forEach(([k, v]) => box.style.setProperty(k, v))
      const c = master.cloneNode(true)
      // cloneNode does not carry canvas pictures, so they are copied again from the master
      const a = master.querySelectorAll('canvas'), b = c.querySelectorAll('canvas')
      a.forEach((cv, i) => { if (cv.width && cv.height) { b[i].width = cv.width; b[i].height = cv.height; b[i].getContext('2d')?.drawImage(cv, 0, 0) } })
      c.style.position = 'absolute'; c.style.left = `${rect.left}px`; c.style.top = `${rect.top}px`; c.style.width = `${rect.width}px`; c.style.margin = '0'
      box.appendChild(c)
      return { box, after: () => restoreScrolls(c) }
    },
  }
}
const blackSource = { make: () => { const box = document.createElement('div'); box.className = 'fx-layer'; box.style.background = '#000'; return { box, after() {} } } }

// The panel grid: eight wide on a desktop (160 × 80 on the 1280 × 800 page, as approved),
// four on a phone, always twice as wide as tall. Distances are worked out in the units the
// mockup used (panels 40 high), so the waves keep the same timing on any screen.
function grid() {
  const W = window.innerWidth, H = window.innerHeight
  const cols = W > 900 ? 8 : 4, tw = W / cols, th = tw / 2
  const tiles = []
  for (let y = 0; y < H; y += th) for (let x = 0; x < W; x += tw) tiles.push({ x, y, w: tw, h: Math.min(th, H - y) })
  return { tiles, unit: 40 / th }
}
export function wideGroups(open) {
  const { tiles, unit } = grid(), rnd = RNG(5), out = [], inside = []
  const O = open ? [open.left, open.top, open.right, open.bottom] : [0, 0, 0, 0]
  tiles.forEach(t => {
    const cx = t.x + t.w / 2, cy = t.y + t.h / 2
    if (open && cx > O[0] && cx < O[2] && cy > O[1] && cy < O[3]) { inside.push(t); return }
    out.push({ ...t, d: Math.hypot(Math.max(O[0] - cx, 0, cx - O[2]), Math.max(O[1] - cy, 0, cy - O[3])) * unit, j: rnd() })
  })
  const by = {}
  out.forEach(t => { const k = `${Math.floor((t.d + t.j * 40 * 1.8) / (40 * 1.2))}:${Math.floor(t.j * 3)}`; (by[k] ||= []).push(t) })
  return { groups: Object.values(by).map(g => ({ tiles: g, d: g.reduce((a, t) => a + t.d, 0) / g.length })), title: inside }
}
const pathOf = (tiles) => tiles.length
  ? `path("${tiles.map(t => `M${(t.x - 1.5).toFixed(1)} ${(t.y - 1.5).toFixed(1)}h${(t.w + 3).toFixed(1)}v${(t.h + 3).toFixed(1)}h-${(t.w + 3).toFixed(1)}Z`).join('')}")`
  : 'polygon(0 0, 0 0, 0 0)'

// The plans: which panels switch when.
export function modePlan(open, fromBlack) {
  const G = wideGroups(open), k = 3.6
  const groups = G.groups.map(g => ({ tiles: g.tiles, start: (fromBlack ? g.d + 40 : g.d) * k }))
  groups.unshift({ tiles: G.title, start: 0, still: !fromBlack })
  return { groups, each: 440 }
}
export function corridorPlan(dir) {
  const { tiles } = grid(), cols = {}
  tiles.forEach(t => { (cols[t.x] ||= []).push(t) })
  const xs = Object.keys(cols).map(Number).sort((a, b) => (dir > 0 ? a - b : b - a))
  return { groups: xs.map((x, i) => ({ tiles: cols[x], start: i * 75 })), each: 360 }
}

// Lights on. `source` is what the new page is revealed from: a captured page, or black.
// The new page must already be in place underneath (or appear while `ready` resolves).
export function lightsOn({ source, glow, plan, ready }) {
  current?.finish()
  LEVELS = PHONE() ? 5 : 8
  const root = overlayRoot()
  const layers = []
  for (let i = 1; i <= LEVELS; i++) {
    const { box, after } = source.make()
    box.style.opacity = String(i / LEVELS)
    box.style.clipPath = i === LEVELS ? 'none' : 'polygon(0 0, 0 0, 0 0)'
    root.appendChild(box); after()
    layers.push(box)
  }
  let done = false, raf = 0
  const run = {
    finish() {
      if (done) return
      done = true; cancelAnimationFrame(raf); dropRoot(root)
      if (current === run) current = null
    },
  }
  current = run
  ;(async () => {
    await ready
    if (done) return
    await nextFrames(2)
    if (done) return
    const p = typeof plan === 'function' ? plan() : plan
    const { groups, each } = p
    const tint = typeof glow === 'function' ? glow() : glow
    groups.forEach(g => {
      if (g.still || !g.tiles.length) return
      const b = document.createElement('div')
      b.className = 'fx-bloom'
      b.style.background = tint
      b.style.clipPath = pathOf(g.tiles)
      b.style.opacity = '0'
      root.appendChild(b); g.b = b
    })
    panelsOn(groups.map(g => g.start), each)
    const total = Math.max(...groups.map(g => g.start)) + each + 450, t0 = performance.now()
    const tick = (now) => {
      if (done) return
      const ms = now - t0
      const buckets = Array.from({ length: LEVELS + 1 }, () => [])
      groups.forEach(g => {
        const t = clamp((ms - g.start) / each), a = g.still ? clamp(ms / 300) : onCurve(t), since = clamp((ms - g.start - each * 0.42) / 400)
        buckets[Math.round((1 - a) * LEVELS)].push(...g.tiles)
        if (g.b) g.b.style.opacity = String(t <= 0 ? 0 : (t > 0.4 ? 0.3 * (1 - since) : a * 0.22))
      })
      layers.forEach((l, i) => { const c = pathOf(buckets[i + 1]); if (l._clip !== c) { l._clip = c; l.style.clipPath = c } })
      if (ms < total) raf = requestAnimationFrame(tick)
      else run.finish()
    }
    raf = requestAnimationFrame(tick)
  })()
  return run
}

// The kill switch: the page dims at once and cools to black, then `then` runs under the
// black. Returns the run; its `black` element stays until the next step lifts it.
const FADE = 1600, HOLD = 300
export function blackout() {
  const held = current?.hold ? current : null
  if (held) { held.hold = false; clearTimeout(held.timer) } else current?.finish()
  const root = held ? held.root : overlayRoot()
  const veil = document.createElement('div')
  veil.className = 'fx-layer fx-veil'
  root.appendChild(veil)
  const black = document.createElement('div')
  black.className = 'fx-layer'
  black.style.background = '#000'
  black.style.opacity = '0'
  root.appendChild(black)
  killSwitch()
  let done = false, raf = 0
  const run = {
    root, black,
    finish() { if (done) return; done = true; cancelAnimationFrame(raf); dropRoot(root); if (current === run) current = null },
  }
  current = run
  if (PHONE()) {
    // The bulbs cool to black as two plain fades the graphics chip runs on its own:
    // a warm brown wash, then black. Smooth even while the phone is busy.
    veil.style.background = '#3a2412'
    veil.style.opacity = '0.58'
    veil.style.transition = `opacity ${FADE}ms cubic-bezier(0.215, 0.61, 0.355, 1)`
    black.style.transition = `opacity ${FADE}ms cubic-bezier(0.55, 0.06, 0.68, 0.19)`
    run.dark = new Promise(res => {
      requestAnimationFrame(() => requestAnimationFrame(() => {
        if (done) { res(false); return }
        veil.style.opacity = '0.9'; black.style.opacity = '1'
      }))
      run.timer = setTimeout(() => {
        if (done) { res(false); return }
        ;[...root.children].forEach(c => { if (c !== black) c.remove() })
        black.style.transition = 'none'
        res(true)
      }, FADE + HOLD)
    })
    const end = run.finish
    run.finish = () => { clearTimeout(run.timer); end() }
    return run
  }
  run.dark = new Promise(res => {
    const t0 = performance.now()
    const tick = (now) => {
      if (done) { res(false); return }
      const ms = now - t0, f = clamp(ms / FADE), br = 0.42 * (1 - eOut(f)), warm = 0.55 * Math.min(1, f * 3)
      veil.style.backdropFilter = veil.style.webkitBackdropFilter = `brightness(${br.toFixed(3)}) sepia(${warm.toFixed(2)}) saturate(${(1 + warm).toFixed(2)})`
      if (ms < FADE) { raf = requestAnimationFrame(tick); return }
      black.style.opacity = '1'
      if (ms < FADE + HOLD) { raf = requestAnimationFrame(tick); return }
      // all is black now: whatever was held under it goes
      ;[...root.children].forEach(c => { if (c !== black) c.remove() })
      res(true)
    }
    raf = requestAnimationFrame(tick)
  })
  return run
}

// The page as it is, held on screen while a new Bible text is chosen, so nothing changes
// before the kill switch. The blackout takes it over; if none comes, it lets go by itself.
export function holdPage() {
  current?.finish()
  const source = capturePage()
  if (!source) return null
  const root = overlayRoot()
  const { box, after } = source.make()
  root.appendChild(box); after()
  let done = false
  const run = {
    hold: true, root,
    finish() { if (done) return; done = true; clearTimeout(run.timer); dropRoot(root); if (current === run) current = null },
  }
  run.timer = setTimeout(() => run.finish(), 1500)
  current = run
  return run
}

// Dark paper after the kill switch: the paper settles in unlit, then only the coloured
// parts light up (the opening, the book strip, the chapter number).
const COLOURED = ['.opening', '.canon .strip', '.rail .num']
export function colouredOn(run) {
  const parts = COLOURED.map(q => document.querySelector(q)).filter(Boolean)
  const lag = [0, 260, 420], each = 520, SETTLE = 450
  parts.forEach(p => { p.style.opacity = '0' })
  panelsOn([SETTLE, SETTLE + lag[1], SETTLE + lag[2]], each)
  const t0 = performance.now()
  return new Promise(res => {
    const tick = (now) => {
      const ms = now - t0
      run.black.style.opacity = String(1 - clamp(ms / SETTLE))
      parts.forEach((p, i) => { p.style.opacity = String(onCurve(clamp((ms - SETTLE - lag[i]) / each))) })
      if (ms < SETTLE + lag[2] + each + 200 && current === run) { requestAnimationFrame(tick); return }
      parts.forEach(p => { p.style.opacity = '' })
      run.finish(); res()
    }
    requestAnimationFrame(tick)
  })
}
// After the kill switch, on light paper or the whole page: the new page lights up in
// panels from black, the title first.
export function lightsFromBlack(run, glow) {
  const open = document.querySelector('.opening')?.getBoundingClientRect()
  const next = lightsOn({ source: blackSource, glow, plan: modePlan(open, true), ready: Promise.resolve() })
  // the black of the kill switch stays until the panels' own black is in place
  requestAnimationFrame(() => run.finish())
  return next
}
export { blackSource }
