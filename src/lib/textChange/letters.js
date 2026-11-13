// Letters that write themselves, after the method in "Animate Calligraphy with SVG"
// (CSS-Tricks): the real letter is uncovered by a stroke drawn along the middle of each
// pen line. Here those middle lines are found automatically for any font and script:
// each word is drawn, thinned to a one-pixel skeleton (Zhang-Suen), its thickness
// measured (distance map), and the skeleton walked in writing order, dots and accents
// after their letter, right to left for Urdu.
const N8 = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
function thin(bin, W, H) {
  const im = Uint8Array.from(bin); let changed = true;
  const P = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? 0 : im[y * W + x];
  while (changed) {
    changed = false;
    for (let pass = 0; pass < 2; pass++) {
      const del = [];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        if (!im[y * W + x]) continue;
        const p2 = P(x, y - 1), p3 = P(x + 1, y - 1), p4 = P(x + 1, y), p5 = P(x + 1, y + 1), p6 = P(x, y + 1), p7 = P(x - 1, y + 1), p8 = P(x - 1, y), p9 = P(x - 1, y - 1);
        const B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9; if (B < 2 || B > 6) continue;
        const seq = [p2, p3, p4, p5, p6, p7, p8, p9, p2]; let A = 0; for (let i = 0; i < 8; i++) if (!seq[i] && seq[i + 1]) A++;
        if (A !== 1) continue;
        if (pass === 0 ? (p2 * p4 * p6 || p4 * p6 * p8) : (p2 * p4 * p8 || p2 * p6 * p8)) continue;
        del.push(y * W + x);
      }
      if (del.length) { changed = true; del.forEach(i => im[i] = 0); }
    }
  }
  return im;
}
function distance(bin, W, H) {
  const d = new Float32Array(W * H); for (let i = 0; i < d.length; i++) d[i] = bin[i] ? 1e6 : 0;
  const s2 = Math.SQRT2;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (!d[i]) continue;
    if (x) d[i] = Math.min(d[i], d[i - 1] + 1); if (y) { d[i] = Math.min(d[i], d[i - W] + 1); if (x) d[i] = Math.min(d[i], d[i - W - 1] + s2); if (x < W - 1) d[i] = Math.min(d[i], d[i - W + 1] + s2); } }
  for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) { const i = y * W + x; if (!d[i]) continue;
    if (x < W - 1) d[i] = Math.min(d[i], d[i + 1] + 1); if (y < H - 1) { d[i] = Math.min(d[i], d[i + W] + 1); if (x < W - 1) d[i] = Math.min(d[i], d[i + W + 1] + s2); if (x) d[i] = Math.min(d[i], d[i + W - 1] + s2); } }
  return d;
}
export function traceToken(tok, rtl, S, origin) {
  const r = tok.rect, cs = tok.style, pr = origin;
  const fs = parseFloat(cs.fontSize), pad = Math.ceil(fs * .45);
  const W = Math.ceil((r.width + pad * 2) * S), H = Math.ceil((r.height + pad * 2) * S);
  const glyph = document.createElement('canvas'); glyph.width = W; glyph.height = H;
  const g = glyph.getContext('2d', { willReadFrequently: true });
  g.font = `${cs.fontStyle} ${cs.fontWeight} ${fs * S}px ${cs.fontFamily}`;
  g.fillStyle = tok.color; g.textBaseline = 'alphabetic';
  const text = tok.text, m = g.measureText(text);
  const baseline = (pad + (r.height - (m.fontBoundingBoxAscent + m.fontBoundingBoxDescent) / S) / 2) * S + m.fontBoundingBoxAscent;
  if (rtl) { g.direction = 'rtl'; g.textAlign = 'right'; g.fillText(text, W - pad * S, baseline); } else g.fillText(text, pad * S, baseline);
  const data = g.getImageData(0, 0, W, H).data, bin = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) bin[i] = data[i * 4 + 3] > 100 ? 1 : 0;
  const dist = distance(bin, W, H), sk = thin(bin, W, H);
  // connected skeleton pieces = letters, dots and accents
  const comp = new Int32Array(W * H).fill(-1), comps = [];
  for (let i = 0; i < W * H; i++) {
    if (!sk[i] || comp[i] >= 0) continue;
    const id = comps.length, px = [], q = [i]; comp[i] = id;
    while (q.length) { const j = q.pop(); px.push(j); const x = j % W, y = (j / W) | 0;
      for (const [dx, dy] of N8) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const k = yy * W + xx; if (sk[k] && comp[k] < 0) { comp[k] = id; q.push(k); } } }
    let x0 = W, x1 = 0, y0 = H, y1 = 0; px.forEach(j => { const x = j % W, y = (j / W) | 0; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
    comps.push({ id, px, x0, x1, y0, y1, cx: (x0 + x1) / 2 });
  }
  const biggest = Math.max(1, ...comps.map(c => c.px.length));
  const mains = comps.filter(c => c.px.length >= biggest * .22).sort((a, b) => rtl ? b.x1 - a.x1 : a.x0 - b.x0);
  const marks = comps.filter(c => c.px.length < biggest * .22);
  const ordered = [];
  mains.forEach(mn => { ordered.push(mn); });
  marks.forEach(mk => {
    // a dot or accent goes straight after the letter it sits on
    let best = mains.length - 1, bd = Infinity;
    mains.forEach((mn, i) => { const d = mk.cx < mn.x0 ? mn.x0 - mk.cx : mk.cx > mn.x1 ? mk.cx - mn.x1 : 0; if (d < bd) { bd = d; best = i; } });
    mk.after = best;
  });
  const seq = [];
  mains.forEach((mn, i) => { seq.push(mn); marks.filter(m => m.after === i).sort((a, b) => rtl ? b.cx - a.cx : a.cx - b.cx).forEach(m => seq.push(m)); });
  if (!mains.length) marks.forEach(m => seq.push(m));
  // walk each piece like a pen: start at the top-left end (top-right for Urdu), keep going straight at forks
  const visited = new Uint8Array(W * H), strokes = [];
  const nb = j => { const x = j % W, y = (j / W) | 0, out = []; for (const [dx, dy] of N8) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const k = yy * W + xx; if (sk[k]) out.push(k); } return out; };
  seq.forEach(c => {
    const score = j => { const x = j % W, y = (j / W) | 0; return (rtl ? -x : x) + y * .7; };
    const ends = c.px.filter(j => nb(j).length === 1);
    let start = (ends.length ? ends : c.px).reduce((a, b) => score(a) <= score(b) ? a : b);
    const stack = [];
    let cur = start, prev = -1, line = [cur]; visited[cur] = 1;
    for (;;) {
      const next = nb(cur).filter(k => !visited[k]);
      if (next.length) {
        let pick = next[0];
        if (prev >= 0 && next.length > 1) {
          const dx0 = cur % W - prev % W, dy0 = ((cur / W) | 0) - ((prev / W) | 0);
          pick = next.reduce((a, b) => { const da = (a % W - cur % W) * dx0 + (((a / W) | 0) - ((cur / W) | 0)) * dy0, db = (b % W - cur % W) * dx0 + (((b / W) | 0) - ((cur / W) | 0)) * dy0; return da >= db ? a : b; });
        }
        next.forEach(k => { if (k !== pick) stack.push([cur, k]); });
        visited[pick] = 1; prev = cur; cur = pick; line.push(cur);
      } else {
        if (line.length) strokes.push(line);
        let found = null; while (stack.length) { const s = stack.pop(); if (!visited[s[1]]) { found = s; break; } }
        if (!found) break;
        visited[found[1]] = 1; prev = found[0]; cur = found[1]; line = [found[0], found[1]];
      }
    }
  });
  const pts = strokes.map(line => line.map(j => ({ x: j % W, y: (j / W) | 0, r: dist[j] + 1.6 * S })));
  let len = 0; pts.forEach(l => { for (let i = 1; i < l.length; i++) len += Math.hypot(l[i].x - l[i - 1].x, l[i].y - l[i - 1].y); });
  return { glyph, W, H, S, strokes: pts, len, left: r.left - pr.left - pad, top: r.top - pr.top - pad, cw: r.width + pad * 2, ch: r.height + pad * 2, chars: [...text].length };
}
export function makeWriter(info, layer, made) {
  // canvases are created the moment the word starts, so building the timeline costs nothing up front
  let out = null, mask = null, m = null, o = null;
  const init = () => {
    out = document.createElement('canvas'); out.width = info.W; out.height = info.H;
    Object.assign(out.style, { left: info.left + 'px', top: info.top + 'px', width: info.cw + 'px', height: info.ch + 'px' });
    layer.appendChild(out); made.push(out);
    mask = document.createElement('canvas'); mask.width = info.W; mask.height = info.H;
    m = mask.getContext('2d'); o = out.getContext('2d');
    m.lineCap = m.lineJoin = 'round'; m.fillStyle = m.strokeStyle = '#000';
  };
  // flatten into one pen path with lifts between pieces
  const flat = []; info.strokes.forEach(l => l.forEach((p, i) => flat.push({ ...p, lift: i === 0 })));
  let si = 0, drawnLen = 0, full = false;
  const segLen = i => flat[i].lift ? 0 : Math.hypot(flat[i].x - flat[i - 1].x, flat[i].y - flat[i - 1].y);
  function draw(t) {
    if (full) return;
    if (!out) init();
    const goal = t * info.len;
    while (si < flat.length && drawnLen + segLen(si) <= goal + .01) {
      const p = flat[si]; drawnLen += segLen(si);
      if (p.lift) { m.beginPath(); m.arc(p.x, p.y, p.r, 0, Math.PI * 2); m.fill(); }
      else { const q = flat[si - 1]; m.lineWidth = (p.r + q.r); m.beginPath(); m.moveTo(q.x, q.y); m.lineTo(p.x, p.y); m.stroke(); }
      si++;
    }
    if (t >= 1) { m.fillRect(0, 0, info.W, info.H); full = true; } // make sure no hairline is left out
    o.globalCompositeOperation = 'copy'; o.drawImage(mask, 0, 0);
    o.globalCompositeOperation = 'source-in'; o.drawImage(info.glyph, 0, 0);
  }
  return draw;
}
