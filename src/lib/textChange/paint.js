import { bakeCore, clamp, rand } from './strokeCore'

// The watercolour wash laid over the verses when the Bible text changes: wide brush
// strokes in a tone just off the page colour, each made in a background worker, then
// drying in patches back into the page.

const toCanvas = (img) => {
  const c = document.createElement('canvas')
  c.width = img.width
  c.height = img.height
  c.getContext('2d').putImageData(img, 0, 0)
  return c
}
const rgb = (value) => {
  const m = value.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)
  if (m) {
    let h = m[1]
    if (h.length === 3) h = [...h].map(c => c + c).join('')
    const n = parseInt(h, 16)
    return [n >> 16 & 255, n >> 8 & 255, n & 255]
  }
  const parts = value.match(/\d+(\.\d+)?/g)
  return parts ? parts.slice(0, 3).map(Number) : [243, 237, 226]
}
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name)

let worker = null
let batch = 0
function getWorker() {
  if (worker !== null) return worker
  try {
    worker = new Worker(new URL('./paintWorker.js', import.meta.url), { type: 'module' })
  } catch {
    worker = false
  }
  return worker
}
function bakeAll(jobs) {
  const sync = () => jobs.map(j => bakeCore(j))
  const w = getWorker()
  if (!w) return Promise.resolve(sync())
  const b = ++batch
  return new Promise((resolve) => {
    const out = new Array(jobs.length)
    let n = 0
    const done = () => { w.removeEventListener('message', onMessage); w.removeEventListener('error', onError) }
    const onMessage = (e) => {
      const [bb, i] = String(e.data.id).split(':').map(Number)
      if (bb !== b) return
      out[i] = e.data
      if (++n === jobs.length) { done(); resolve(out) }
    }
    const onError = () => { done(); worker = false; resolve(sync()) }
    w.addEventListener('message', onMessage)
    w.addEventListener('error', onError)
    jobs.forEach((j, i) => w.postMessage({ ...j, id: `${b}:${i}` }))
  })
}

// host: the verses block. reader: the reading column, whose width the strokes may use.
// depth: how far down the verses block (in px) to paint; below that the old words are
// simply hidden, since they are off screen.
export function makePaint({ host, reader, depth }) {
  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const hostBox = host.getBoundingClientRect(), readerBox = reader.getBoundingClientRect()
  const x0 = readerBox.left - hostBox.left, w = Math.max(host.offsetWidth, reader.clientWidth)
  const pad = 70, h = depth + pad * 2
  const tx0 = -x0, tx1 = tx0 + host.offsetWidth, ty0 = pad, ty1 = pad + depth

  const cv = document.createElement('canvas')
  cv.className = 'wash'
  cv.setAttribute('aria-hidden', 'true')
  cv.width = Math.ceil(w * dpr)
  cv.height = Math.ceil(h * dpr)
  Object.assign(cv.style, { left: `${x0}px`, top: `${-pad}px`, width: `${w}px`, height: `${h}px` })
  host.appendChild(cv)
  const ctx = cv.getContext('2d')
  const layer = () => {
    const c = document.createElement('canvas')
    c.width = cv.width
    c.height = cv.height
    const x = c.getContext('2d')
    x.scale(dpr, dpr)
    return [c, x]
  }
  const [accWet, aw] = layer(), [accMatte, am] = layer()

  // A wash in the page's own tone: close to the paper, darker on light pages, lighter on dark.
  const bg = rgb(cssVar('--vellum'))
  const dark = bg[0] + bg[1] + bg[2] < 384
  const wash = { bg, pig: dark ? [150, 128, 92] : [150, 122, 84], k: 0.24 }
  const R = rand(Date.now())

  // Rows of loose strokes from the first line to the last, each starting and ending past the text.
  const Wd = Math.max(96, Math.min(150, (tx1 - tx0) * 0.24))
  const first = ty0 + Wd * 0.14, last = Math.max(first, ty1 - Wd * 0.2)
  const rows = Math.max(1, Math.ceil((last - first) / (Wd * 0.56)) + 1)
  const step = rows > 1 ? (last - first) / (rows - 1) : 0
  const strokes = []
  for (let i = 0; i < rows; i++) {
    const rtl = i % 2 === 1
    const a = tx0 - Wd * (0.6 + R() * 0.6), b = tx1 + Wd * (0.6 + R() * 0.45)
    strokes.push({ cx: (a + b) / 2, cy: first + i * step + (R() - 0.5) * Wd * 0.06, ang: (R() - 0.5) * 0.04, L: b - a, rtl })
  }
  const ready = bakeAll(strokes.map(s => ({ L: s.L, Wd, tool: 'brush', rtl: s.rtl, seed: (R() * 4294967296) >>> 0, wash })))
    .then(rs => rs.forEach((r, i) => Object.assign(strokes[i], { wet: toCanvas(r.wet), matte: toCanvas(r.matte), L: r.L, Ht: r.Ht, done: false })))

  const tmp = document.createElement('canvas')
  function drawPartial(x, s, t, kind) {
    // the stroke up to t, with a rounded brush head at the front
    const tex = kind === 'wet' ? s.wet : s.matte
    if (tmp.width < s.L || tmp.height < s.Ht) { tmp.width = Math.max(tmp.width, s.L); tmp.height = Math.max(tmp.height, s.Ht) }
    const c = tmp.getContext('2d')
    c.clearRect(0, 0, tmp.width, tmp.height)
    c.globalCompositeOperation = 'source-over'
    c.drawImage(tex, 0, 0)
    c.globalCompositeOperation = 'destination-in'
    c.beginPath()
    const r = t * s.L, hr = s.Ht * 0.32
    if (!s.rtl) {
      c.rect(0, 0, Math.max(0, r - hr), s.Ht)
      c.moveTo(Math.max(0, r - hr), 0)
      c.ellipse(Math.max(0, r - hr), s.Ht / 2, hr, s.Ht / 2, 0, -Math.PI / 2, Math.PI / 2)
    } else {
      c.rect(Math.min(s.L, s.L - r + hr), 0, s.L, s.Ht)
      c.moveTo(Math.min(s.L, s.L - r + hr), s.Ht)
      c.ellipse(Math.min(s.L, s.L - r + hr), s.Ht / 2, hr, s.Ht / 2, 0, Math.PI / 2, Math.PI * 1.5)
    }
    c.fill()
    c.globalCompositeOperation = 'source-over'
    x.save()
    x.translate(s.cx, s.cy)
    x.rotate(s.ang)
    x.translate(-s.L / 2, -s.Ht / 2)
    x.drawImage(tmp, 0, 0, s.L, s.Ht, 0, 0, s.L, s.Ht)
    x.restore()
  }
  const per = 0.78, gap = per * 0.5
  const total = per + (strokes.length - 1) * gap
  const ease = t => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
  function paintAt(p) {
    const time = p * total
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, cv.width, cv.height)
    strokes.forEach((s, i) => {
      if (!s.wet) return
      const t = clamp((time - i * gap) / per)
      if (t >= 1 && !s.done) { s.done = true; drawPartial(aw, s, 1, 'wet'); drawPartial(am, s, 1, 'matte') }
    })
    ctx.drawImage(accWet, 0, 0)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    strokes.forEach((s, i) => { const t = clamp((time - i * gap) / per); if (s.wet && t > 0 && !s.done) drawPartial(ctx, s, ease(t), 'wet') })
  }

  // Drying: soft noise decides which patches dry first. The sheen goes, then the wash sinks into the page.
  const gw = Math.ceil(w / 20), gh = Math.ceil(h / 20)
  const raw = Array.from({ length: gw * gh }, () => R())
  const noise = raw.map((v, i) => {
    const x = i % gw, y = (i / gw) | 0
    let sum = 0, c = 0
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
      const xx = x + dx, yy = y + dy
      if (xx >= 0 && yy >= 0 && xx < gw && yy < gh) { sum += raw[yy * gw + xx]; c++ }
    }
    return sum / c
  })
  const lo = Math.min(...noise), hi = Math.max(...noise)
  for (let i = 0; i < noise.length; i++) noise[i] = (noise[i] - lo) / (hi - lo || 1)
  const small = document.createElement('canvas')
  small.width = gw
  small.height = gh
  const [mixC, mx] = layer()
  function maskAt(k, color) {
    const sc = small.getContext('2d'), img = sc.createImageData(gw, gh)
    for (let i = 0; i < gw * gh; i++) img.data.set([color[0], color[1], color[2], Math.round(clamp(k * 1.7 - noise[i] * 0.7) * 255)], i * 4)
    sc.putImageData(img, 0, 0)
    return small
  }
  function dryAt(k) {
    const k1 = clamp(k / 0.55), k2 = clamp((k - 0.35) / 0.65)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.globalCompositeOperation = 'copy'
    ctx.drawImage(accWet, 0, 0)
    mx.setTransform(1, 0, 0, 1, 0, 0)
    mx.globalCompositeOperation = 'copy'
    mx.drawImage(maskAt(k1, [0, 0, 0]), 0, 0, cv.width, cv.height)
    mx.globalCompositeOperation = 'source-in'
    mx.drawImage(accMatte, 0, 0)
    ctx.globalCompositeOperation = 'source-over'
    ctx.drawImage(mixC, 0, 0)
    ctx.globalCompositeOperation = 'source-atop'
    ctx.drawImage(maskAt(k2, bg), 0, 0, cv.width, cv.height)
    ctx.globalCompositeOperation = 'source-over'
  }
  // The dried layer lifts off softly, so anything it overlapped comes back gently.
  function remove(fade = true) {
    if (!cv.isConnected) return
    if (!fade) { cv.remove(); return }
    cv.style.transition = 'opacity .5s ease'
    cv.style.opacity = '0'
    setTimeout(() => cv.remove(), 600)
  }
  return { total, ready, paintAt, dryAt, remove }
}
