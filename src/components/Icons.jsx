// Thin line icons drawn to match the type: 1.3px strokes on a 16px grid.
const base = { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }

export const IconBooks = () => (
  <svg {...base}><path d="M2.5 3.5c2-.8 3.8-.6 5.5.6v9c-1.7-1.2-3.5-1.4-5.5-.6zM13.5 3.5c-2-.8-3.8-.6-5.5.6v9c1.7-1.2 3.5-1.4 5.5-.6z" /></svg>
)
export const IconStart = () => (
  <svg {...base}><circle cx="8" cy="8" r="6.2" /><path d="M10.6 5.4 9 9 5.4 10.6 7 7z" /></svg>
)
export const IconSearch = () => (
  <svg {...base}><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5 14 14" /></svg>
)
export const IconSpark = () => (
  <svg {...base}><path d="M8 1.5 9.4 6.6 14.5 8 9.4 9.4 8 14.5 6.6 9.4 1.5 8 6.6 6.6Z" /></svg>
)
export const IconMap = () => (
  <svg {...base}><path d="M1.8 3.6 5.6 2.2l4.8 1.6 3.8-1.4v10l-3.8 1.4-4.8-1.6-3.8 1.4zM5.6 2.2v10M10.4 3.8v10" /></svg>
)
export const IconSound = ({ on }) => (
  <svg {...base}>
    <path d="M2.5 6h2.5l3.5-3v10L5 10H2.5z" />
    {on ? <path d="M11 5.5c.9.7 1.4 1.5 1.4 2.5s-.5 1.8-1.4 2.5M12.8 3.8c1.4 1.1 2.2 2.5 2.2 4.2s-.8 3.1-2.2 4.2" /> : <path d="m11 6 3.5 4M14.5 6 11 10" />}
  </svg>
)
export const IconTheme = ({ dark }) => (
  <svg {...base}>
    {dark
      ? <path d="M13.5 9.6A5.6 5.6 0 0 1 6.4 2.5a5.6 5.6 0 1 0 7.1 7.1z" />
      : <><circle cx="8" cy="8" r="3" /><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" /></>}
  </svg>
)
export const IconPrev = () => <svg {...base}><path d="M10 3 5 8l5 5" /></svg>
export const IconNext = () => <svg {...base}><path d="m6 3 5 5-5 5" /></svg>
export const IconClose = () => <svg {...base} width="14" height="14" viewBox="0 0 14 14"><path d="M3 3l8 8M11 3l-8 8" strokeWidth="1.5" /></svg>
export const IconExpand = ({ on }) => (
  <svg {...base} width="14" height="14" viewBox="0 0 14 14">
    {on ? <path d="M5.5 1.5v4h-4M8.5 12.5v-4h4M5.5 5.5 1.5 1.5M8.5 8.5l4 4" /> : <path d="M1.5 5.5v-4h4M12.5 8.5v4h-4M1.5 1.5l4 4M12.5 12.5l-4-4" />}
  </svg>
)
export const Lozenge = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" aria-hidden="true">
    <path d="M9 1 L17 9 L9 17 L1 9 Z" fill="none" stroke="var(--gold)" strokeWidth="1.2" />
    <path d="M9 5 L13 9 L9 13 L5 9 Z" fill="var(--gold)" />
  </svg>
)
export const IconHeart = () => (
  <svg {...base}><path d="M8 13.6S2.2 10.2 2.2 6.1A2.9 2.9 0 0 1 8 4.6a2.9 2.9 0 0 1 5.8 1.5c0 4.1-5.8 7.5-5.8 7.5Z" /></svg>
)
export const IconText = () => (
  <svg {...base} width="18" viewBox="0 0 18 16"><path d="M1.5 13 5.2 3.2h.6L9.5 13M2.8 9.8h5.4M11 13l2.6-6.6h.4L16.5 13M11.9 10.9h3.7" /></svg>
)
export const IconDown = () => <svg {...base} width="12" height="12" viewBox="0 0 12 12"><path d="m3 4.5 3 3 3-3" /></svg>
export const IconRead = () => (
  <svg {...base}><path d="M2 3.2c2.2-.6 4.2-.3 6 1v9.4c-1.8-1.3-3.8-1.6-6-1zM8 4.2c1.8-1.3 3.8-1.6 6-1v9.4c-2.2-.6-4.2-.3-6 1" /><path d="M4 6.2h2M4 8.4h2M10 6.2h2M10 8.4h2" /></svg>
)
