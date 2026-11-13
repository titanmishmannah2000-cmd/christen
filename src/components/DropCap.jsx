import { useEffect, useId, useRef } from 'react'
import { gsap } from 'gsap'

// The illuminated first letter of a chapter: a lapis ground inside a double gold rule,
// with a gold-leaf letter. Drawn as SVG so that, when the Bible text changes, its parts
// can be laid down one by one (see capTimeline), and so the gold catches the light as
// the pointer moves over the first verse.

const STROKES = [
  'M -8 8 C 24 2, 62 14, 100 4', 'M 100 28 C 66 22, 30 36, -8 26', 'M -8 48 C 26 42, 60 56, 100 44',
  'M 100 68 C 64 62, 28 76, -8 66', 'M -8 88 C 30 82, 62 94, 100 86',
]
// Nastaliq letters stand tall and high, so the Urdu letter has its own size and baseline.
const FONT = {
  latin: { x: 46, y: 77, fontFamily: 'var(--display)', fontWeight: 600, fontSize: 88 },
  rtl: { x: 46, y: 58, fontFamily: "'Noto Nastaliq Urdu', serif", fontWeight: 600, fontSize: 60 },
}

export default function DropCap({ letter, rtl }) {
  const raw = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const id = (name) => `${name}-${raw}`
  const ref = useRef(null)
  const f = rtl ? FONT.rtl : FONT.latin
  const text = (props) => (
    <text x={f.x} y={f.y} textAnchor="middle" style={{ fontFamily: f.fontFamily, fontWeight: f.fontWeight, fontSize: f.fontSize }} {...props}>{letter}</text>
  )

  // Gold leaf catches the light as the pointer moves over the first verse (from the Codex design).
  useEffect(() => {
    const svg = ref.current
    const verse = svg?.closest('.v')
    if (!verse || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const hi = svg.querySelector('.sheen-hi'), lo = svg.querySelector('.sheen-lo')
    const move = (e) => {
      if (svg.closest('[data-writing] > div:not([data-inked])')) return
      const r = svg.getBoundingClientRect()
      const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height))
      const p = Math.min(0.78, (x + y) / 2) // the gradient runs corner to corner
      gsap.to(hi, { attr: { offset: p }, duration: 0.6, ease: 'power2.out', overwrite: 'auto' })
      gsap.to(lo, { attr: { offset: p + 0.22 }, duration: 0.6, ease: 'power2.out', overwrite: 'auto' })
    }
    verse.addEventListener('pointermove', move)
    return () => verse.removeEventListener('pointermove', move)
  }, [])

  return (
    <svg ref={ref} className={`initial-cap${rtl ? ' is-rtl' : ''}`} viewBox="-6 -6 104 104" aria-hidden="true">
      <defs>
        <mask id={id('m')} maskUnits="userSpaceOnUse" x="-6" y="-6" width="104" height="104">
          <rect x="-6" y="-6" width="104" height="104" fill="#fff" />
          {text({ className: 'mk', fill: '#000', stroke: '#000', strokeWidth: 0, strokeLinejoin: 'round' })}
        </mask>
        <clipPath id={id('c')}><rect x="0.5" y="0.5" width="91" height="91" /></clipPath>
        <clipPath id={id('f')}><rect className="pour" x="-6" y="96" width="104" height="0" /></clipPath>
        <linearGradient id={id('g')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--gold)' }} />
          <stop className="sheen-hi" offset="0.4" style={{ stopColor: 'var(--gold-hi)' }} />
          <stop className="sheen-lo" offset="0.62" style={{ stopColor: 'var(--gold)' }} />
          <stop offset="1" stopColor="#8C6A31" />
        </linearGradient>
        <linearGradient id={id('b')} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" style={{ stopColor: 'var(--gold-hi)' }} />
          <stop offset="0.5" stopColor="#FFF4CF" />
          <stop offset="1" style={{ stopColor: 'var(--gold-hi)' }} />
        </linearGradient>
        <filter id={id('glow')} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.5" /></filter>
        <filter id={id('edge')} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g clipPath={`url(#${id('c')})`} mask={`url(#${id('m')})`}>
        <g filter={`url(#${id('edge')})`}>
          {STROKES.map((d, i) => <path key={`g${i}`} className="ground" d={d} pathLength="1" fill="none" style={{ stroke: 'var(--initial-ground)' }} strokeWidth={i % 2 ? 30 : 32} strokeLinecap="round" />)}
          {STROKES.map((d, i) => <path key={`s${i}`} className="streak" d={d} pathLength="1" fill="none" style={{ stroke: 'var(--lapis)' }} strokeOpacity="0.18" strokeWidth="5" strokeLinecap="round" transform="translate(0 6)" />)}
        </g>
      </g>
      <path className="line outer" d="M -3.5 -3.5 H 95.5 V 95.5 H -3.5 Z" pathLength="1" fill="none" style={{ stroke: 'var(--gold)' }} strokeWidth="1" />
      <path className="line inner" d="M 91.5 91.5 H 0.5 V 0.5 H 91.5 Z" pathLength="1" fill="none" style={{ stroke: 'var(--gold)' }} strokeWidth="1" />
      <rect className="dia" x="4" y="4" width="6" height="6" style={{ fill: 'var(--gold)' }} transform="rotate(45 7 7)" />
      <rect className="dia" x="82" y="82" width="6" height="6" style={{ fill: 'var(--gold)' }} transform="rotate(45 85 85)" />
      {text({ className: 'glow', style: { fontFamily: f.fontFamily, fontWeight: f.fontWeight, fontSize: f.fontSize, fill: 'var(--gold-hi)' }, filter: `url(#${id('glow')})`, opacity: 0 })}
      {text({ className: 'letter', fill: `url(#${id('g')})` })}
      {text({ className: 'bright', fill: `url(#${id('b')})`, clipPath: `url(#${id('f')})`, opacity: 0 })}
    </svg>
  )
}
