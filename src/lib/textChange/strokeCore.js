// The watercolour stroke, made pixel by pixel. Runs in a worker (paintWorker.js) so the
// page never stalls while strokes are prepared; it falls back to the main thread if a
// worker cannot start.
export const clamp = (v, a = 0, b = 1) => (v < a ? a : v > b ? b : v)
export function rand(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296) }

// Seeded value noise + fbm, used for every watercolour property below.
export function makeNoise(R) {
  const P = new Uint8Array(512), p = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) P[i] = p[i & 255];
  const fade = t => t * t * (3 - 2 * t), h = (x, y) => P[P[x & 255] + (y & 255)] / 255;
  const n = (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), u = fade(x - xi), v = fade(y - yi);
    const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
  const fbm = (x, y, o = 3) => { let s = 0, a = .5, f = 1, t = 0; for (let i = 0; i < o; i++) { s += a * n(x * f, y * f); t += a; a *= .5; f *= 2.03; } return s / t; };
  return { n, fbm };
}
export function boxBlur(src, W, H, r) {
  const tmp = new Float32Array(W * H), out = new Float32Array(W * H), k = 2 * r + 1;
  for (let y = 0; y < H; y++) { let s = 0; for (let x = -r; x <= r; x++) s += src[y * W + clamp(x, 0, W - 1)];
    for (let x = 0; x < W; x++) { tmp[y * W + x] = s / k; s += src[y * W + Math.min(W - 1, x + r + 1)] - src[y * W + Math.max(0, x - r)]; } }
  for (let x = 0; x < W; x++) { let s = 0; for (let y = -r; y <= r; y++) s += tmp[clamp(y, 0, H - 1) * W + x];
    for (let y = 0; y < H; y++) { out[y * W + x] = s / k; s += tmp[Math.min(H - 1, y + r + 1) * W + x] - tmp[Math.max(0, y - r) * W + x]; } }
  return out;
}
// One watercolour stroke on paper: an opaque page-coloured ground hides the text, and a translucent
// pigment wash sits on top with pooled patches, streaks, granulation, a darker drying edge,
// a broken dry-brush tail and a few splatters.
export function bakeCore({ L, Wd, tool, rtl, seed, wash }) {
  const R = rand(seed);
  L = Math.round(L); const Ht = Math.ceil(Wd * 1.5), mid = Ht / 2, N = makeNoise(R), roller = tool === 'roller';
  const ox = R() * 900, oy = R() * 900, half = Wd * .46, tail = roller ? Wd * .18 : Wd * .55, head = roller ? Wd * .12 : Wd * .4;
  const env = new Float32Array(L * Ht), ground = new Float32Array(L * Ht), D = new Float32Array(L * Ht);
  for (let u = 0; u < L; u++) {
    const wob = (N.fbm(u / 170 + ox, .5) - .5) * Wd * .18, hw = half * (.9 + .25 * N.fbm(u / 90 + ox, 3.7));
    const tHead = clamp(u / head), tTail = clamp((L - u) / tail);
    const hwEff = roller ? hw : hw * Math.sqrt(1 - (1 - tHead) ** 2) * (.55 + .45 * tTail);
    for (let v = 0; v < Ht; v++) {
      const i = v * L + u, d = Math.abs(v - mid - wob) / Math.max(1, hwEff);
      const rag = (N.fbm(u / 22 + ox, v / 9 + oy) - .5) * .42 + (N.n(u / 3.5 + ox, v / 2.5 + oy) - .5) * .06;
      const inside = clamp((1 + rag - d) / .05);
      if (!inside) continue;
      const str = N.fbm(u / 130 + ox, v / 2.3 + oy, 2);
      const dry = clamp((1 - tTail) * 1.25 + Math.max(0, d - .88) * 1.4);
      env[i] = inside * clamp((str - dry * .72) / .07 + (1 - dry) * 2.5);
      ground[i] = clamp((.93 - d) / .06) * clamp((tTail - .45) / .15) * clamp(tHead * 3);
      const pool = N.fbm((u + v * .6) / 70 + ox, (v - u * .15) / 45 + oy, 3), streak = N.fbm(u / 320 + oy, v / 9 + ox, 2), gran = N.n(u / 1.5 + ox, v / 1.5 + oy);
      D[i] = (.22 + .78 * pool + .25 * (streak - .5)) * (.8 + .32 * gran);
    }
  }
  // a few flecks thrown off the dry end
  if (!roller) for (let f = 0; f < 16; f++) {
    const cu = L - R() * tail * 1.3, cv = mid + (R() - .5) * Wd * 1.25, rr = .8 + R() * R() * 3.5;
    for (let y = Math.floor(cv - rr); y <= cv + rr; y++) for (let x = Math.floor(cu - rr); x <= cu + rr; x++) {
      if (x < 0 || y < 0 || x >= L || y >= Ht) continue; const dd = Math.hypot(x - cu, y - cv) / rr; if (dd > 1) continue;
      const i = y * L + x; env[i] = Math.max(env[i], 1 - dd * dd); D[i] = Math.max(D[i], .55);
    }
  }
  // pigment collects where the wash dries, so the inside of every edge gets darker
  const blur = boxBlur(boxBlur(env, L, Ht, 3), L, Ht, 2);
  const wet = new ImageData(L, Ht), matte = new ImageData(L, Ht);
  const put = (img, o, g, dv) => {
    const p = clamp(dv * wash.k), outA = g + (1 - g) * clamp(p * 1.5);
    if (outA <= 0) return;
    for (let c = 0; c < 3; c++) {
      const groundC = wash.bg[c] * (1 - p) + wash.pig[c] * p;
      img.data[o + c] = (g * groundC + (1 - g) * clamp(p * 1.5) * wash.pig[c]) / outA;
    }
    img.data[o + 3] = Math.round(outA * 255);
  };
  for (let v = 0; v < Ht; v++) for (let u = 0; u < L; u++) {
    const i = v * L + u; if (!env[i] && !ground[i]) continue;
    const o = (v * L + (rtl ? L - 1 - u : u)) * 4, edge = Math.max(0, env[i] - blur[i]);
    put(wet, o, ground[i], env[i] * (D[i] * 1.12 + edge * .15));     // wet: deeper, soft edges
    put(matte, o, ground[i], env[i] * (D[i] * .82 + edge * .7));    // drying: lighter, edges darken
  }
  return { wet, matte, L, Ht };
}

