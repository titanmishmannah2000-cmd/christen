// The page wiped clean with a linen cloth when the Bible text changes. The old verses are
// copied, word by word, onto a canvas laid exactly over them; the real text is then hidden
// and the copy is wiped away in long, wide, overlapping sweeps. The ink drags a little
// ahead of the cloth before it lifts, and the faint damp trail dries back into the page.

const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v)
function rand(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) }
function noise1(seed) {
  const R = rand(seed), T = Array.from({ length: 256 }, () => R())
  return (x) => { const i = Math.floor(x), f = x - i, s = f * f * (3 - 2 * f); return T[i & 255] * (1 - s) + T[(i + 1) & 255] * s }
}
const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim()
const isDark = () => {
  const m = cssVar('--vellum').match(/^#?([0-9a-f]{6})$/i)
  if (!m) return document.documentElement.dataset.theme === 'dark'
  const n = parseInt(m[1], 16)
  return (n >> 16 & 255) + (n >> 8 & 255) + (n & 255) < 384
}

// Each word of the text nodes inside `root`, drawn where it sits on screen.
function drawWords(s, root, ox, oy, maxY) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (n.parentElement.closest('svg, .visually-hidden, .ink-layer') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  })
  let node
  while ((node = walker.nextNode())) {
    const text = node.nodeValue, cs = getComputedStyle(node.parentElement)
    if (cs.visibility === 'hidden' || cs.opacity === '0') continue
    const rtl = cs.direction === 'rtl'
    s.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`
    s.fillStyle = cs.color
    s.textBaseline = 'alphabetic'
    s.direction = rtl ? 'rtl' : 'ltr'
    s.textAlign = rtl ? 'right' : 'left'
    const re = /\S+/g
    let m
    while ((m = re.exec(text))) {
      const range = document.createRange()
      range.setStart(node, m.index)
      range.setEnd(node, m.index + m[0].length)
      const rects = range.getClientRects()
      // a word broken across two lines is drawn letter by letter
      const pieces = rects.length === 1 ? [[m[0], rects[0]]] : [...m[0]].map((ch, k) => {
        const r2 = document.createRange(); r2.setStart(node, m.index + k); r2.setEnd(node, m.index + k + 1)
        return [ch, r2.getBoundingClientRect()]
      })
      pieces.forEach(([word, r]) => {
        if (!r.width || r.top - oy > maxY) return
        const mt = s.measureText(word)
        const base = r.top - oy + (r.height - (mt.fontBoundingBoxAscent + mt.fontBoundingBoxDescent)) / 2 + mt.fontBoundingBoxAscent
        s.fillText(word, (rtl ? r.right : r.left) - ox, base)
      })
    }
  }
}

// The illuminated letter, drawn the way the SVG draws it.
function drawCap(s, svg, ox, oy) {
  const r = svg.getBoundingClientRect(), k = r.width / 104, rtl = svg.classList.contains('is-rtl')
  s.save()
  s.translate(r.left - ox + 6 * k, r.top - oy + 6 * k)
  s.scale(k, k)
  s.fillStyle = cssVar('--initial-ground'); s.fillRect(0, 0, 92, 92)
  s.strokeStyle = cssVar('--gold'); s.lineWidth = 1; s.strokeRect(0.5, 0.5, 91, 91); s.strokeRect(-3.5, -3.5, 99, 99)
  s.fillStyle = cssVar('--gold')
  ;[[7, 7], [85, 85]].forEach(([x, y]) => { s.save(); s.translate(x, y); s.rotate(Math.PI / 4); s.fillRect(-3, -3, 6, 6); s.restore() })
  const g = s.createLinearGradient(0, 0, 92, 92)
  g.addColorStop(0, cssVar('--gold')); g.addColorStop(0.4, cssVar('--gold-hi')); g.addColorStop(0.62, cssVar('--gold')); g.addColorStop(1, '#8C6A31')
  s.fillStyle = g
  s.textAlign = 'center'
  s.direction = rtl ? 'rtl' : 'ltr'
  const letter = svg.querySelector('.letter')
  const cs = getComputedStyle(letter)
  s.font = `${cs.fontWeight} ${rtl ? 60 : 88}px ${cs.fontFamily}`
  s.fillText(letter.textContent, 46, rtl ? 58 : 77)
  s.restore()
}

// host: the verses block. depth: how far down it (in px) the cloth wipes; anything below
// that is off screen and is simply hidden. Call before hiding the real text.
export function makeWipe({ host, depth, rtl }) {
  const pad = 40, dpr = Math.min(1.5, window.devicePixelRatio || 1)
  const hb = host.getBoundingClientRect()
  const ox = hb.left - pad, oy = hb.top - pad
  const W = Math.ceil(hb.width + pad * 2), H = Math.ceil(Math.min(depth, hb.height) + pad * 2)
  const mk = (scale = dpr) => {
    const c = document.createElement('canvas')
    c.width = Math.ceil(W * scale); c.height = Math.ceil(H * scale)
    const x = c.getContext('2d')
    x.setTransform(scale, 0, 0, scale, 0, 0)
    return [c, x]
  }
  const [ink, ik] = mk()
  drawWords(ik, host, ox, oy, H)
  const capSvg = host.querySelector('.initial-cap')
  if (capSvg && capSvg.getBoundingClientRect().top - oy < H) drawCap(ik, capSvg, ox, oy)

  const [cv, ctx] = mk()
  cv.className = 'wash'
  cv.setAttribute('aria-hidden', 'true')
  Object.assign(cv.style, { left: `${-pad}px`, top: `${-pad}px`, width: `${W}px`, height: `${H}px` })
  ctx.drawImage(ink, 0, 0, W, H)
  host.appendChild(cv)

  // The cloth's path: wide rows, alternating direction, with rounded turns past the text.
  const Rr = Math.max(96, Math.min(150, W * 0.2)), rowGap = Rr * 1.1
  const R = rand(5), n = noise1(3)
  const pts = []
  const rows = Math.ceil((H - Rr * 0.45) / rowGap) + 1
  for (let r = 0; r < rows; r++) {
    const y = Rr * 0.45 + r * rowGap, ltr = (r % 2 === 0) !== rtl
    const a = -Rr * 0.6, b = W + Rr * 0.6
    for (let s = 0; s <= 1.0001; s += 1 / 60) {
      pts.push({ x: ltr ? a + (b - a) * s : b - (b - a) * s, y: y + Math.sin(s * Math.PI * 2 + r) * Rr * 0.14 + (n(s * 6 + r * 9) - 0.5) * Rr * 0.25 })
    }
  }
  const seg = [0]
  for (let i = 1; i < pts.length; i++) seg.push(seg[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y))
  const total = seg[seg.length - 1]
  let at = 1
  const pos = (d) => {
    while (at < seg.length - 1 && seg[at] < d) at++
    const k = (d - seg[at - 1]) / (seg[at] - seg[at - 1] || 1)
    return { x: pts[at - 1].x + (pts[at].x - pts[at - 1].x) * k, y: pts[at - 1].y + (pts[at].y - pts[at - 1].y) * k }
  }
  // the cloth's print: a soft centre and a fibrous edge
  const T = Math.ceil(Rr * 2.4)
  const tex = document.createElement('canvas')
  tex.width = tex.height = T
  const tx = tex.getContext('2d'), rg = tx.createRadialGradient(T / 2, T / 2, 0, T / 2, T / 2, Rr)
  rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(0.62, 'rgba(0,0,0,.95)'); rg.addColorStop(1, 'rgba(0,0,0,0)')
  tx.fillStyle = rg; tx.fillRect(0, 0, T, T)
  tx.globalCompositeOperation = 'destination-out'
  for (let i = 0; i < 160; i++) {
    const a = R() * 6.28, d = Rr * (0.55 + R() * 0.45)
    tx.fillStyle = `rgba(0,0,0,${0.2 + R() * 0.5})`
    tx.fillRect(T / 2 + Math.cos(a) * d, T / 2 + Math.sin(a) * d, 1 + R() * 3, 0.6)
  }
  // the damp mark: the cloth's print in a tone just off the page
  const damp = document.createElement('canvas')
  damp.width = damp.height = T
  const dk = damp.getContext('2d')
  dk.drawImage(tex, 0, 0)
  dk.globalCompositeOperation = 'source-in'
  dk.fillStyle = isDark() ? 'rgb(255,240,210)' : 'rgb(150,120,80)'
  dk.fillRect(0, 0, T, T)
  const [wet, wk] = mk(0.5) // the damp trail is soft, so a quarter of the pixels is plenty
  const smudge = document.createElement('canvas'), sd = smudge.getContext('2d')
  smudge.width = smudge.height = Math.ceil(T * dpr)

  const sweep = 2.0, dry = 0.7, dur = sweep + dry
  let done = 0, last = null
  function wipeAt(p) {
    const time = p * dur, goal = clamp(time / sweep) * total, step = Rr * 0.22
    while (done < goal) {
      const q = pos(done)
      if (last) {
        // the ink just ahead of the cloth softens and drags a little before it lifts
        sd.setTransform(1, 0, 0, 1, 0, 0)
        sd.clearRect(0, 0, smudge.width, smudge.height)
        sd.drawImage(ink, (q.x - T / 2) * dpr, (q.y - T / 2) * dpr, T * dpr, T * dpr, 0, 0, smudge.width, smudge.height)
        sd.globalCompositeOperation = 'destination-in'
        sd.drawImage(tex, 0, 0, smudge.width, smudge.height)
        sd.globalCompositeOperation = 'source-over'
        ik.globalCompositeOperation = 'source-over'
        ik.globalAlpha = 0.06
        ik.drawImage(smudge, q.x - T / 2 + (q.x - last.x) * 1.6, q.y - T / 2 + (q.y - last.y) * 1.6, T, T)
        ik.globalAlpha = 1
      }
      ik.globalCompositeOperation = 'destination-out'
      ik.drawImage(tex, q.x - T / 2, q.y - T / 2)
      wk.globalCompositeOperation = 'source-over'
      wk.globalAlpha = 0.022
      wk.drawImage(damp, q.x - T / 2, q.y - T / 2)
      wk.globalAlpha = 1
      last = q
      done += step
    }
    // the damp trail dries as it goes
    wk.globalCompositeOperation = 'destination-out'
    wk.fillStyle = 'rgba(0,0,0,.02)'
    wk.fillRect(0, 0, W, H)
    const fade = 1 - clamp((time - sweep) / dry)
    ctx.globalCompositeOperation = 'copy'
    ctx.globalAlpha = fade
    ctx.drawImage(ink, 0, 0, W, H)
    ctx.globalCompositeOperation = 'source-over'
    ctx.globalAlpha = 0.9 * fade
    ctx.drawImage(wet, 0, 0, W, H)
    ctx.globalAlpha = 1
  }
  function remove(soft = true) {
    if (!cv.isConnected) return
    if (!soft) { cv.remove(); return }
    cv.style.transition = 'opacity .4s ease'
    cv.style.opacity = '0'
    setTimeout(() => cv.remove(), 450)
  }
  return { dur, wipeAt, remove }
}
