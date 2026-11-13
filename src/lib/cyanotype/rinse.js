import { wash } from './sound'

// Rinse, the Atlas's own animation (approved in the mockup): a soft wavy waterline runs
// down the panel and the new tab is left behind it, a little soft at the edge. Closing
// runs the water back up and leaves bare paper. Pages that prefer less motion swap at once.
export const RINSE_MS = 1050
const LAG = 70
const clamp = (t) => Math.max(0, Math.min(1, t))
const eOut = (t) => 1 - Math.pow(1 - t, 3)
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// The waterline across a box w wide, at height Y, wobbling with time.
function line(w, Y, ms) {
  const pts = []
  for (let x = 0; x <= w + 16; x += 16) pts.push([x, Y + 7 * Math.sin(x / 38 + ms / 140) + 4 * Math.sin(x / 15 - ms / 95)])
  return pts
}
const poly = (pts) => `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(',')})`
const below = (pts, h) => poly([[0, h + 2], ...pts, [pts[pts.length - 1][0], h + 2]])
const above = (pts) => poly([[0, -2], ...pts, [pts[pts.length - 1][0], -2]])
const band = (a, b) => poly([...a, ...b.slice().reverse()])

// A copy of an element, with the pictures in its canvases and its scroll positions.
function copyOf(el) {
  const c = el.cloneNode(true)
  const from = el.querySelectorAll('canvas'), to = c.querySelectorAll('canvas')
  from.forEach((cv, i) => {
    const d = to[i]; d.width = cv.width; d.height = cv.height
    try { d.getContext('2d')?.drawImage(cv, 0, 0) } catch { /* a map canvas that cannot be copied stays blank */ }
  })
  c.removeAttribute('id'); c.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'))
  c.setAttribute('aria-hidden', 'true'); c.inert = true
  const scrolls = []
  const all = el.querySelectorAll('*')
  all.forEach((n, i) => { if (n.scrollTop) scrolls.push([i, n.scrollTop]) })
  c.__scrolls = scrolls
  return c
}
function restoreScroll(c) {
  if (!c.__scrolls?.length) return
  const all = c.querySelectorAll('*')
  c.__scrolls.forEach(([i, top]) => { if (all[i]) all[i].scrollTop = top })
}

// The paper or coating behind a box on the screen, so a layer can hide what is under it.
function groundFor(rect) {
  const g = document.createElement('div')
  g.style.cssText = 'position:absolute;inset:0;pointer-events:none;'
  const pg = document.querySelector('.print-ground')
  if (pg) {
    const r = pg.getBoundingClientRect(), sx = pg.width / r.width, sy = pg.height / r.height
    const cv = document.createElement('canvas')
    cv.width = Math.max(1, Math.round(rect.width * sx)); cv.height = Math.max(1, Math.round(rect.height * sy))
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;'
    cv.getContext('2d').drawImage(pg, (rect.left - r.left) * sx, (rect.top - r.top) * sy, rect.width * sx, rect.height * sy, 0, 0, cv.width, cv.height)
    g.appendChild(cv)
  } else g.style.background = 'var(--paper)'
  return g
}

// A layer laid exactly over `el`, inside `host` (which must be position: relative).
function layerOver(host, el, { ground }) {
  const hr = host.getBoundingClientRect(), er = el.getBoundingClientRect()
  const box = document.createElement('div')
  box.className = 'rinse-layer'
  box.style.cssText = `position:absolute;left:${er.left - hr.left}px;top:${er.top - hr.top}px;width:${er.width}px;height:${er.height}px;overflow:hidden;pointer-events:none;z-index:5;`
  if (ground) box.appendChild(groundFor(er))
  const c = copyOf(el)
  c.style.position = 'absolute'; c.style.inset = '0'; c.style.width = '100%'; c.style.height = '100%'; c.style.margin = '0'
  box.appendChild(c)
  host.appendChild(box)
  restoreScroll(c)
  return { box, w: er.width, h: er.height }
}

let running = null
function play(frame, done) {
  const t0 = performance.now()
  const tick = (now) => {
    const ms = now - t0
    if (frame(ms) && running?.tick === tick) { running.raf = requestAnimationFrame(tick); return }
    if (running?.tick === tick) { running = null; done() }
  }
  running = { tick, done, raf: requestAnimationFrame(tick) }
}
function finishRunning() {
  if (!running) return
  cancelAnimationFrame(running.raf); const d = running.done; running = null; d()
}

// Change what `el` shows: `apply` must update the DOM synchronously (flushSync).
export function rinseChange(host, el, apply) {
  finishRunning()
  if (reducedMotion() || !host || !el) { apply(); return }
  const old = layerOver(host, el, { ground: true })
  apply()
  let soft = null
  // The soft wet edge is a blurred copy, redrawn every frame. Phones skip it: blurring a
  // whole panel sixty times a second is what made the rinse stutter on Android.
  const phone = window.matchMedia('(max-width: 900px), (pointer: coarse)').matches
  if (!phone) requestAnimationFrame(() => {
    if (!old.box.isConnected) return
    soft = layerOver(host, el, { ground: false })
    soft.box.style.filter = 'blur(1.4px)'; soft.box.style.opacity = '0.6'
    soft.box.style.clipPath = 'polygon(0 0,0 0,0 0)'
  })
  wash(RINSE_MS / 1000)
  const { w, h } = old
  play((ms) => {
    const Y = -20 + (h + 120) * eOut(clamp(ms / RINSE_MS))
    const crisp = line(w, Y - LAG, ms), edge = line(w, Y, ms)
    old.box.style.clipPath = below(crisp, h)
    if (soft) soft.box.style.clipPath = band(crisp, edge)
    return ms < RINSE_MS + 60
  }, () => { old.box.remove(); soft?.box.remove() })
}

// The Atlas already open when the app starts is simply there; opened later, it is rinsed in.
export const appStarted = { current: false }

// The panel being printed for the first time: the water runs down and leaves it behind.
export function rinseIn(el) {
  finishRunning()
  if (reducedMotion() || !el || !appStarted.current) return
  const h = el.offsetHeight, w = el.offsetWidth
  el.style.clipPath = 'polygon(0 0,0 0,0 0)'
  wash(RINSE_MS / 1000)
  play((ms) => {
    const Y = -20 + (h + 120) * eOut(clamp(ms / RINSE_MS))
    el.style.clipPath = above(line(w, Y - LAG * 0.5, ms))
    return ms < RINSE_MS + 60
  }, () => { el.style.clipPath = '' })
}

// The panel washed away: the water runs back up, then `then` closes it.
export function rinseOut(el, then) {
  finishRunning()
  if (reducedMotion() || !el) { then(); return }
  const h = el.offsetHeight, w = el.offsetWidth
  wash(RINSE_MS / 1000)
  play((ms) => {
    const Y = h + 20 - (h + 120) * eOut(clamp(ms / RINSE_MS))
    el.style.clipPath = above(line(w, Y + LAG * 0.5, ms))
    return ms < RINSE_MS + 60
  }, then)
}

// The open Atlas registers how to wash itself away, so the Atlas button in the top
// bar and the tab bar close it the same way as its own Close.
export const atlasCloser = { current: null }
export function closeAtlas(close) { if (atlasCloser.current) atlasCloser.current(close); else close() }
