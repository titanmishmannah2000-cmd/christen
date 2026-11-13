import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { gsap } from 'gsap'
import { makeWipe } from './wipe'
import { groupsOf, rememberInk, traceGroup, groupTimeline } from './write'
import { hideCap, capAtRest, capTimeline } from './cap'
import { textMotionNow } from '../prefs'
import { changeText } from '../cyanotype/switch'
import { finishLights } from '../cyanotype/lights'

// When the Bible text changes on the page being read, the old verses stay on screen
// (no reload, no jump to the top) while this runs:
//   1. wait for Settings to close, then glide to verse 1;
//   2. 'paint' (the setting's old name): the old verses are copied onto a canvas, the new
//      text is swapped in underneath (still invisible), and a linen cloth wipes the copy
//      away while the new words are traced; 'fade': the verses fade out and in;
//   4. the first letter is illuminated and every verse writes itself, verse by verse.
//      Verses further down the page write themselves when they are scrolled into view.
// Skip (or Escape) ends everything at once and the new text simply fades in.

gsap.ticker.lagSmoothing(120, 16)

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
const wait = (ms, signal) => new Promise(res => {
  const id = setTimeout(res, ms)
  signal?.addEventListener('abort', () => { clearTimeout(id); res() }, { once: true })
})
const until = (test, signal) => new Promise(res => {
  const check = () => (signal.aborted || test() ? res() : setTimeout(check, 50))
  check()
})

// The element that scrolls the reader: the reading column on wide screens, the window on phones.
function scrollerOf(main) {
  return main && /(auto|scroll)/.test(getComputedStyle(main).overflowY) && main.scrollHeight > main.clientHeight + 1 ? main : null
}
function viewHeight(main) {
  const sc = scrollerOf(main)
  return sc ? sc.clientHeight : window.innerHeight
}
function glideTo(main, el, signal) {
  const sc = scrollerOf(main)
  const top = el.getBoundingClientRect().top - (sc ? sc.getBoundingClientRect().top : 0) - 24
  if (Math.abs(top) < 6) return Promise.resolve()
  const target = sc || window
  if (reduced()) { target.scrollBy({ top }); return Promise.resolve() }
  return new Promise(res => {
    let done = false
    const fin = () => { if (!done) { done = true; target.removeEventListener('scrollend', fin); res() } }
    target.addEventListener('scrollend', fin)
    setTimeout(fin, 1100)
    signal.addEventListener('abort', fin, { once: true })
    target.scrollBy({ top, behavior: 'smooth' })
  })
}
// Swap the new text in without moving the verses on screen, even when the lines above them
// change (the name of the Bible text under the title, a psalm's title in another language).
function commitInPlace(commit, versesRef, main) {
  const before = versesRef.current?.getBoundingClientRect().top
  flushSync(commit)
  const after = versesRef.current?.getBoundingClientRect().top
  if (before == null || after == null || Math.abs(after - before) < 0.5) return
  ;(scrollerOf(main) || window).scrollBy({ top: after - before, behavior: 'instant' })
}
function play(run, tl) {
  run.tweens.add(tl)
  return new Promise(res => {
    if (run.signal.aborted) { tl.kill(); res(); return }
    tl.eventCallback('onComplete', () => { run.tweens.delete(tl); res() })
    run.signal.addEventListener('abort', res, { once: true })
  })
}

export default function useTextChange({ changing, target, live, commit, versesRef, scrollRef, rtl }) {
  const [running, setRunning] = useState(false)
  const liveRef = useRef(live)
  const commitRef = useRef(commit)
  const rtlRef = useRef(rtl)
  const runRef = useRef(null)
  useEffect(() => { liveRef.current = live; commitRef.current = commit; rtlRef.current = rtl })

  // The new text in, and everything this run made taken away. `fade`: the text fades in (Skip).
  const finish = useCallback((run, fade) => {
    if (run.ended) return
    run.ended = true
    run.tweens.forEach(t => t.kill())
    run.tweens.clear()
    run.observer?.disconnect()
    clearTimeout(run.hideSkip)
    run.wipe?.remove(fade)
    const el = versesRef.current
    if (el && run.committed) {
      run.layer?.remove()
      const nums = el.querySelectorAll('.v .n')
      gsap.killTweensOf(nums)
      gsap.set(nums, { clearProps: 'opacity' })
      capAtRest(el.querySelector('.initial-cap'))
      delete el.dataset.writing
      el.querySelectorAll(':scope > div[data-inked], :scope > div[data-pending]').forEach(d => { delete d.dataset.inked; delete d.dataset.pending })
      if (el.style.height) {
        // the section below glides to the new height instead of jumping
        const h0 = el.offsetHeight
        el.style.height = ''
        const h1 = el.offsetHeight
        el.style.height = `${h0}px`
        gsap.to(el, { height: h1, duration: fade ? 0.6 : 0.01, ease: 'power2.inOut', clearProps: 'height' })
      }
      if (fade) gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: 'sine.out', clearProps: 'opacity' })
      else gsap.set(el, { clearProps: 'opacity' })
    }
    if (runRef.current === run) setRunning(false)
  }, [versesRef])

  const skip = useCallback(() => {
    const run = runRef.current
    if (!run || run.ended || run.skipping) return
    run.skipping = true
    run.abort.abort()
    if (run.committed) { finish(run, true); return }
    // Not swapped yet: the old text goes, the new one is swapped in as soon as it is here
    // and fades in.
    run.tweens.forEach(t => t.kill())
    run.tweens.clear()
    if (versesRef.current) gsap.to(versesRef.current, { opacity: 0, duration: 0.2 })
    const go = () => {
      if (run.ended) return
      const l = liveRef.current
      if (l.loading) { setTimeout(go, 50); return }
      const h0 = versesRef.current?.offsetHeight
      commitInPlace(() => commitRef.current(), versesRef, scrollRef.current)
      run.committed = true
      if (h0 && versesRef.current) versesRef.current.style.height = `${h0}px`
      finish(run, true)
    }
    go()
  }, [finish, versesRef, scrollRef])

  useEffect(() => {
    if (!changing) return
    const abort = new AbortController()
    const run = { abort, signal: abort.signal, tweens: new Set(), committed: false, ended: false }
    runRef.current = run
    const { signal } = run
    const versesAtStart = versesRef.current
    const stopped = () => signal.aborted || run.ended

    const writeLazily = (pending, layer) => {
      // Verses further down write themselves when they come into view.
      let queue = Promise.resolve()
      let left = pending.length
      let writing = 0
      const doneOne = () => { if (--left === 0) finish(run, false) }
      const showSkip = (on) => {
        clearTimeout(run.hideSkip)
        if (on) setRunning(true)
        else run.hideSkip = setTimeout(() => runRef.current === run && !run.ended && setRunning(false), 700)
      }
      run.observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (!e.isIntersecting) return
          run.observer.unobserve(e.target)
          const g = pending.find(p => p.div === e.target)
          queue = queue.then(async () => {
            if (stopped()) return
            showSkip(true)
            rememberInk([g])
            const words = await traceGroup(g, () => layer.getBoundingClientRect(), rtlRef.current)
            if (stopped()) return
            delete g.div.dataset.pending
            writing++
            // each verse writes as soon as it is traced, alongside any still writing
            play(run, groupTimeline(g, words, layer)).then(() => {
              if (stopped()) return
              if (--writing === 0) showSkip(false)
              doneOne()
            })
            await wait(250, signal)
          })
        })
      }, { rootMargin: '0px 0px -8% 0px' })
      pending.forEach(g => run.observer.observe(g.div))
    }

    ;(async () => {
      // 1. Settings closes first, then the page glides to verse 1.
      await until(() => !document.querySelector('dialog[open]'), signal)
      await wait(320, signal)
      if (stopped()) return
      const host = versesRef.current
      if (!host) { finishLights(); await until(() => !liveRef.current.loading, signal); if (!stopped()) { flushSync(() => commitRef.current()); run.ended = true } return }
      // 'paint' (the setting's old name) is now the Cyanotype blackout: the kill switch cuts
      // the lights, the new text is swapped in under the black, and the page lights up
      // again in wide panels, title first (on Dark paper only the coloured parts). The page
      // keeps its place: nothing reloads or scrolls.
      if (textMotionNow() === 'paint' && !reduced()) {
        signal.addEventListener('abort', finishLights, { once: true })
        await changeText(async () => {
          await until(() => !liveRef.current.loading, signal)
          if (stopped()) return
          commitInPlace(() => commitRef.current(), versesRef, scrollRef.current)
          run.committed = true
        })
        run.ended = true
        if (runRef.current === run) runRef.current = null
        return
      }
      setRunning(true)
      const wiping = false
      const view = viewHeight(scrollRef.current)
      const depth = Math.min(host.offsetHeight, Math.round(view * 1.25))
      await glideTo(scrollRef.current, host, signal)
      await until(() => !liveRef.current.loading, signal)
      if (stopped()) return
      if (!wiping) await play(run, gsap.timeline().to(host, { opacity: 0, duration: 0.3, ease: 'sine.in' }))
      if (document.fonts) await Promise.race([document.fonts.ready, wait(1500)])
      if (stopped()) return

      // 2. The old text is copied onto the cloth's canvas, then the new text is swapped in
      //    underneath, invisible, holding the old height until the wipe is done.
      const wipe = run.wipe = wiping ? makeWipe({ host, depth, rtl: getComputedStyle(host).direction === 'rtl' }) : null
      const h0 = host.offsetHeight
      commitInPlace(() => commitRef.current(), versesRef, scrollRef.current)
      run.committed = true
      const el = versesRef.current
      if (!el || liveRef.current.error) { finish(run, true); return }
      if (!wipe) { el.style.height = `${h0}px`; finish(run, true); return }
      el.dataset.writing = ''
      const groups = groupsOf(el)
      groups.forEach(g => { delete g.div.dataset.inked; delete g.div.dataset.pending })
      const cap = el.querySelector('.initial-cap')
      if (cap) hideCap(cap)
      el.style.height = `${h0}px`
      const main = groups.filter(g => g.div.offsetTop < depth)
      const pending = groups.filter(g => g.div.offsetTop >= depth)
      pending.forEach(g => { g.div.dataset.pending = '' })
      rememberInk(groups)
      void el.offsetHeight
      if (document.fonts) await Promise.race([document.fonts.ready, wait(1500)])
      if (stopped()) return
      const layer = run.layer = document.createElement('div')
      layer.className = 'ink-layer'
      layer.setAttribute('aria-hidden', 'true')
      el.appendChild(layer)
      const origin = () => layer.getBoundingClientRect()
      const tracing = (async () => {
        for (const g of main) { if (stopped()) return; g.words = await traceGroup(g, origin, rtlRef.current) }
      })()
      // 3. The cloth wipes the page clean while the new words are traced.
      const proxy = { p: 0 }
      await play(run, gsap.timeline().to(proxy, { p: 1, duration: wipe.dur, ease: 'none', onUpdate: () => wipe.wipeAt(proxy.p) }))
      await tracing
      if (stopped()) return
      wipe.remove(false)
      run.wipe = null

      // The verses block takes its new height smoothly, and the section below glides with it.
      el.style.height = ''
      const h1 = el.offsetHeight
      el.style.height = `${h0}px`
      if (Math.abs(h1 - h0) > 1) { const glide = gsap.to(el, { height: h1, duration: 1.2, ease: 'power2.inOut', clearProps: 'height' }); run.tweens.add(glide) } else el.style.height = ''

      // 4. The first letter is illuminated, and the verses write themselves.
      const tl = gsap.timeline()
      if (cap) tl.add(capTimeline(cap), 0.1)
      // all the verses on screen write together, each starting a moment after the one before
      const at = cap ? Math.max(0.1, tl.duration() - 1.8) : 0.1
      main.forEach((g, i) => tl.add(groupTimeline(g, g.words || [], layer), at + i * 0.35))
      await play(run, tl)
      if (stopped()) return
      if (pending.length) { setRunning(false); writeLazily(pending, layer) } else finish(run, false)
    })()

    return () => {
      abort.abort()
      if (!run.ended) {
        // a new chapter or another Bible text: leave nothing of this run behind
        run.tweens.forEach(t => t.kill())
        run.observer?.disconnect()
        clearTimeout(run.hideSkip)
        run.wipe?.remove(false)
        run.layer?.remove()
        const el = versesAtStart
        if (el && run.committed) {
          delete el.dataset.writing
          el.style.height = ''
          el.style.opacity = ''
          el.querySelectorAll(':scope > div').forEach(d => { delete d.dataset.inked; delete d.dataset.pending })
          gsap.set(el.querySelectorAll('.v .n'), { clearProps: 'opacity' })
          capAtRest(el.querySelector('.initial-cap'))
        } else if (el) {
          el.style.opacity = ''
          el.querySelectorAll(':scope > div[data-pending]').forEach(d => { delete d.dataset.pending })
        }
        run.ended = true
      }
      if (runRef.current === run) { runRef.current = null; setRunning(false) }
    }
  }, [target]) // eslint-disable-line react-hooks/exhaustive-deps

  // Escape skips too.
  useEffect(() => {
    if (!running) return
    const onKey = (e) => { if (e.key === 'Escape' && !document.querySelector('dialog[open]')) skip() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [running, skip])

  return { running, skip }
}
