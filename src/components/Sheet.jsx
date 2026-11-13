import { useEffect, useRef, useState } from 'react'
import { IconClose } from './Icons'
import { useT } from '../lib/i18n'

// A modal sheet on the native <dialog>, so focus, Escape and the backdrop behave
// the same everywhere. `variant` is "" (centred), "top" or "drawer"; `tools`
// are extra buttons shown beside the close button.
// Opening plays the CSS entrance; closing plays the exit first and only then
// closes the dialog, so the sheet eases away instead of vanishing.
export default function Sheet({ open, onClose, title, label, variant = '', head, tools, children }) {
  const t = useT()
  const ref = useRef(null)
  // `shown` keeps the content in place while the exit plays.
  const [shown, setShown] = useState(open)
  if (open && !shown) setShown(true)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open) {
      d.classList.remove('is-closing')
      if (!d.open) d.showModal()
      return
    }
    if (!d.open) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { d.close(); return }
    d.classList.add('is-closing')
    const finish = () => { d.classList.remove('is-closing'); d.close(); setShown(false) }
    const onEnd = (e) => { if (e.target === d && !e.pseudoElement) finish() }
    d.addEventListener('animationend', onEnd)
    const fallback = setTimeout(finish, 450)
    return () => { d.removeEventListener('animationend', onEnd); clearTimeout(fallback) }
  }, [open])

  return (
    <dialog ref={ref} className={`sheet ${variant}`} aria-label={label || title}
      onClose={() => { setShown(false); if (open) onClose() }} onCancel={(e) => { e.preventDefault(); onClose() }}
      onClick={(e) => { if (e.target === ref.current) onClose() }}>
      {shown && (
        <>
          <div className="sheet-head">
            {head || <h2 className="sheet-title">{title}</h2>}
            {tools}
            <button className="close" type="button" onClick={onClose} aria-label={t('Close {name}', { name: label || title })}><IconClose /></button>
          </div>
          {children}
        </>
      )}
    </dialog>
  )
}
