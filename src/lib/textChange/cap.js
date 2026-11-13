import { gsap } from 'gsap'

// The drop cap's own animation (see src/components/DropCap.jsx for its parts).

// Everything hidden, ready to be laid down.
export function hideCap(svg) {
  gsap.set(svg.querySelectorAll('.line, .ground, .streak'), { attr: { 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1 } })
  gsap.set(svg.querySelectorAll('.ground, .streak'), { opacity: 0 })
  gsap.set(svg.querySelectorAll('.dia'), { opacity: 0, scale: 0, transformOrigin: '50% 50%' })
  gsap.set(svg.querySelectorAll('.letter, .bright, .glow'), { opacity: 0 })
  svg.querySelector('.mk').setAttribute('stroke-width', 6)
}

// Back to the finished letter, at once.
export function capAtRest(svg) {
  if (!svg) return
  gsap.killTweensOf(svg.querySelectorAll('*'))
  svg.querySelectorAll('.line, .ground, .streak').forEach(e => { e.removeAttribute('stroke-dasharray'); e.removeAttribute('stroke-dashoffset') })
  gsap.set(svg.querySelectorAll('.ground, .streak, .dia, .letter'), { clearProps: 'opacity,transform' })
  gsap.set(svg.querySelectorAll('.bright, .glow'), { opacity: 0 })
  svg.querySelector('.mk').setAttribute('stroke-width', 0)
}

// The rules draw themselves, the corner diamonds appear, the lapis is brushed in around
// the letter's space, then gold pours into the letter, flares and settles.
export function capTimeline(svg) {
  const tl = gsap.timeline()
  const [outer, inner] = svg.querySelectorAll('.line')
  tl.addLabel('box')
    .to(outer, { attr: { 'stroke-dashoffset': 0 }, duration: 1.1, ease: 'power2.inOut' }, 'box')
    .to(inner, { attr: { 'stroke-dashoffset': 0 }, duration: 1.1, ease: 'power2.inOut' }, 'box+=0.15')
    .to(svg.querySelectorAll('.dia'), { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(3)', stagger: 0.12 }, '>-0.1')
    .addLabel('paint')
  svg.querySelectorAll('.ground').forEach((p, i) => tl.set(p, { opacity: 1 }, `paint+=${i * 0.3}`).to(p, { attr: { 'stroke-dashoffset': 0 }, duration: 0.42, ease: 'power1.inOut' }, `paint+=${i * 0.3}`))
  svg.querySelectorAll('.streak').forEach((p, i) => tl.set(p, { opacity: 1 }, `paint+=${i * 0.3 + 0.1}`).to(p, { attr: { 'stroke-dashoffset': 0 }, duration: 0.42, ease: 'power1.inOut' }, `paint+=${i * 0.3 + 0.1}`))
  tl.addLabel('gold', '>+0.15')
    .set(svg.querySelector('.bright'), { opacity: 1 }, 'gold')
    .fromTo(svg.querySelector('.pour'), { attr: { y: 96, height: 0 } }, { attr: { y: -6, height: 104 }, duration: 0.9, ease: 'power2.out' }, 'gold')
    .to(svg.querySelector('.glow'), { opacity: 0.9, duration: 0.35, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 'gold+=0.7')
    .addLabel('settle', 'gold+=1.2')
    .set(svg.querySelector('.letter'), { opacity: 1 }, 'settle')
    .to(svg.querySelector('.bright'), { opacity: 0, duration: 0.8, ease: 'sine.inOut' }, 'settle')
    .to(svg.querySelector('.mk'), { attr: { 'stroke-width': 0 }, duration: 0.8, ease: 'sine.inOut' }, 'settle')
    // the brush marks in the blue are only seen while it is being painted; at rest the ground is even
    .to(svg.querySelectorAll('.streak'), { opacity: 0, duration: 0.8, ease: 'sine.inOut' }, 'settle')
  return tl
}
