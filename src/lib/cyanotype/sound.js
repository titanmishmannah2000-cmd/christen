import { switchSounds } from './theme'
import { KILL_SWITCH } from './killswitch'

// The sounds of the print, made in the app itself (Web Audio), exactly as in the
// approved mockup. Lights on: a click and a soft fizz for each wave of panels, no hum.
// Lights off: the kill switch recording. The Atlas rinse: water running over the print.
// Everything is silent when Settings > Switching sounds is off.
let ctx = null, master = null, ksBuf = null, noiseBuf = null, room = null

let touched = false
function ac() {
  if (!switchSounds() || !touched) return null
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext
    if (!C) return null
    ctx = new C(); master = ctx.createGain(); master.gain.value = 0.55; master.connect(ctx.destination)
    loadKS()
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}
// Wake the sound up on the first touch anywhere, so it is ready before the first switch.
// (Browsers only allow sound after the reader has touched or typed on the page.)
if (typeof document !== 'undefined') {
  const wake = () => { touched = true; ac(); document.removeEventListener('pointerdown', wake, true); document.removeEventListener('keydown', wake, true) }
  document.addEventListener('pointerdown', wake, true)
  document.addEventListener('keydown', wake, true)
}

function loadKS() {
  if (ksBuf || !ctx) return
  try {
    const bin = atob(KILL_SWITCH), n = bin.length >> 1, b = ctx.createBuffer(1, n, 22050), d = b.getChannelData(0)
    for (let i = 0; i < n; i++) { const v = bin.charCodeAt(2 * i) | (bin.charCodeAt(2 * i + 1) << 8); d[i] = (v > 32767 ? v - 65536 : v) / 32768 }
    ksBuf = b
  } catch { ksBuf = null }
}
function noise() {
  if (!noiseBuf) {
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  const s = ctx.createBufferSource(); s.buffer = noiseBuf; return s
}
function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d) }

// A light switch or relay: a bright tick and a little body.
function click(t, v, pitch) {
  const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain()
  f.type = 'bandpass'; f.frequency.value = pitch || 2600; f.Q.value = 1.4; env(g, t, 0.001, v, 0.03)
  n.connect(f); f.connect(g); g.connect(master); n.start(t, Math.random()); n.stop(t + 0.05)
  const o = ctx.createOscillator(), g2 = ctx.createGain()
  o.frequency.setValueAtTime(180, t); o.frequency.exponentialRampToValueAtTime(70, t + 0.05); env(g2, t, 0.002, v * 0.6, 0.06)
  o.connect(g2); g2.connect(master); o.start(t); o.stop(t + 0.1)
}
// A bulb catching: a soft fizz as the filament flickers.
function fizz(t, v, len) {
  const n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain()
  f.type = 'highpass'; f.frequency.value = 3500; env(g, t, 0.004, v, len)
  n.connect(f); f.connect(g); g.connect(master); n.start(t, Math.random()); n.stop(t + len + 0.05)
}
// A soft room for the big switch, used only if the recording could not be decoded.
function hall() {
  if (room) return room
  const len = Math.floor(ctx.sampleRate * 1.4), b = ctx.createBuffer(2, len, ctx.sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch); let lp = 0
    for (let i = 0; i < len; i++) { const t = i / len, k = 0.35 + 0.6 * t; lp = lp * k + (Math.random() * 2 - 1) * (1 - k); d[i] = lp * Math.pow(1 - t, 2.6) * 1.8 }
  }
  room = ctx.createConvolver(); room.buffer = b
  const wet = ctx.createGain(); wet.gain.value = 0.5; room.connect(wet); wet.connect(master)
  return room
}
function chunk(t, v, rate) {
  const r = rate || 1, out = ctx.createGain(); out.gain.value = v; out.connect(master); out.connect(hall())
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.frequency.setValueAtTime(110 * r, t); o.frequency.exponentialRampToValueAtTime(48 * r, t + 0.16); env(g, t, 0.006, 0.55, 0.22); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.35)
  const n = noise(), f = ctx.createBiquadFilter(), g2 = ctx.createGain()
  f.type = 'lowpass'; f.frequency.setValueAtTime(2600 * r, t); f.frequency.exponentialRampToValueAtTime(500, t + 0.08); env(g2, t, 0.004, 0.32, 0.09); n.connect(f); f.connect(g2); g2.connect(out); n.start(t, Math.random()); n.stop(t + 0.2)
}
// The kill switch.
function kill(t, v, rate) {
  if (!ksBuf) return chunk(t, v, rate)
  const src = ctx.createBufferSource(), g = ctx.createGain()
  src.buffer = ksBuf; src.playbackRate.value = rate || 1; g.gain.value = v * 1.8
  src.connect(g); g.connect(master); src.start(t)
}

// Waves of panels coming on: a click and a fizz for each wave (ms from now), at most one every 35 ms.
export function panelsOn(starts, each) {
  const c = ac(); if (!c) return
  const t0 = c.currentTime + 0.02; let last = -99
  starts.slice().sort((a, b) => a - b).forEach(ms => {
    if (ms - last < 35) return
    last = ms
    const t = t0 + ms / 1000
    click(t, 0.12, 2400 + Math.random() * 700)
    fizz(t + each * 0.08 / 1000, 0.035, 0.03); fizz(t + each * 0.22 / 1000, 0.04, 0.05)
  })
}
// The blackout: one kill switch.
export function blackout() { const c = ac(); if (!c) return; kill(c.currentTime + 0.02, 1, 1) }
// Rinse: water running over the print, a gentle swell that wobbles and drains away.
export function wash(dur) {
  const c = ac(); if (!c) return
  const t = c.currentTime + 0.02, d = dur, n = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain()
  f.type = 'bandpass'; f.Q.value = 0.9; f.frequency.setValueAtTime(500, t); f.frequency.linearRampToValueAtTime(1300, t + d * 0.6); f.frequency.linearRampToValueAtTime(700, t + d)
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06, t + d * 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.25)
  lfo.frequency.value = 7; lg.gain.value = 180; lfo.connect(lg); lg.connect(f.frequency)
  n.connect(f); f.connect(g); g.connect(master); n.start(t, Math.random()); n.stop(t + d + 0.3); lfo.start(t); lfo.stop(t + d + 0.3)
}
// Settings turning sound off stops anything still playing.
export function hush() { if (ctx && ctx.state === 'running') ctx.suspend() }
