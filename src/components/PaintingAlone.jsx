import { useEffect, useRef, useState } from 'react'
import OpenSeadragon from 'openseadragon'
import { IconClose } from './Icons'

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// The painting on its own, above everything else: the page behind goes dark,
// with no numbered spots or side panel, just the picture to look at and zoom.
// Its own <dialog>, so it sits on top of the plate viewer and Escape closes
// only this.
export default function PaintingAlone({ painting, open, onClose }) {
  const dlg = useRef(null)
  const box = useRef(null)
  const [state, setState] = useState('loading')
  // `shown` keeps the picture in place while the dark fades away.
  const [shown, setShown] = useState(open)
  if (open && !shown) setShown(true)

  useEffect(() => {
    const d = dlg.current
    if (!d) return
    if (open) {
      d.classList.remove('is-closing')
      if (!d.open) d.showModal()
      return
    }
    if (!d.open) return
    if (reduced()) { d.close(); return }
    d.classList.add('is-closing')
    const finish = () => { d.classList.remove('is-closing'); d.close(); setShown(false) }
    const t = setTimeout(finish, 280)
    return () => clearTimeout(t)
  }, [open])

  useEffect(() => {
    if (!shown || !box.current) return
    let tried = 0
    setState('loading')
    const v = OpenSeadragon({
      element: box.current,
      tileSources: { type: 'image', url: painting.urls[painting.urls.length - 1], crossOriginPolicy: 'Anonymous' },
      drawer: 'canvas',
      showNavigationControl: false,
      animationTime: reduced() ? 0 : 1.0, springStiffness: 8,
      visibilityRatio: 0.85, maxZoomPixelRatio: 3, minZoomImageRatio: 0.9,
      gestureSettingsMouse: { clickToZoom: false, dblClickToZoom: true },
      gestureSettingsTouch: { pinchRotate: false },
    })
    v.addHandler('open', () => setState('ready'))
    v.addHandler('open-failed', () => {
      tried += 1
      const url = painting.urls[painting.urls.length - 1 - tried]
      if (url) v.open({ type: 'image', url, crossOriginPolicy: 'Anonymous' })
      else setState('failed')
    })
    return () => v.destroy()
  }, [shown, painting])

  return (
    <dialog ref={dlg} className="alone" aria-label={`${painting.title}, on its own`}
      // React passes dialog events up to the plate viewer's own dialog, so stop
      // them here: closing this must not close the viewer underneath.
      onClose={(e) => { e.stopPropagation(); setShown(false) }}
      onCancel={(e) => { e.stopPropagation(); e.preventDefault(); onClose() }}
      onClick={(e) => { e.stopPropagation(); if (e.target === dlg.current) onClose() }}>
      {shown && (
        <>
          <div className="alone-osd" ref={box} aria-label={`${painting.title}, ${painting.artist}. Zoomable.`} />
          {state === 'loading' && <div className="alone-msg">Bringing in the painting…</div>}
          {state === 'failed' && <div className="alone-msg">The painting could not be loaded. Check your internet connection and try again.</div>}
          <p className="alone-caption"><i>{painting.title}</i> · {painting.artist}<span> · Scroll or pinch to zoom, drag to move</span></p>
          <button type="button" className="alone-close" onClick={onClose} aria-label="Close the painting"><IconClose /></button>
        </>
      )}
    </dialog>
  )
}
