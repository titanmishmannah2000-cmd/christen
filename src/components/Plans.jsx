import { PLANS, planDays, dayLabel } from '../data/plans'
import { usePlans, planStatus, activePlanStatus, startPlan, restartPlan, stopPlan, markRead } from '../lib/plans'

const ref = (b, c) => `${b === 'Psalms' ? 'Psalm' : b} ${c}`
const firstUnread = (st) => st.days[st.today].find(([b, c]) => !st.isRead(b, c)) || st.days[st.today][0]

// The list of plans, for Start here and the welcome page.
export function PlanList({ onRead }) {
  const s = usePlans()
  return (
    <div className="path-list plan-list">
      {PLANS.map(p => {
        const st = planStatus(p.id, s)
        const days = planDays(p.id)
        const perDay = Math.round(days.flat().length / days.length)
        const active = s.active === p.id
        const open = () => {
          startPlan(p.id)
          const now = planStatus(p.id)
          const [b, c] = firstUnread(now)
          onRead(b, c)
        }
        return (
          <div key={p.id} className={`path-card plan-card${active ? ' is-active' : ''}`}>
            <span className="path-title">{p.title}</span>
            <span className="path-who">{p.who}</span>
            {st && !st.finished
              ? <span className="path-blurb">Day {st.today + 1} of {st.total}: {dayLabel(st.days[st.today])}</span>
              : <span className="path-blurb">{days.length} days · about {perDay} chapter{perDay > 1 ? 's' : ''} a day · day 1: {dayLabel(days[0])}</span>}
            {st && <span className="plan-bar" aria-hidden="true"><b style={{ width: `${(100 * st.doneDays) / st.total}%` }} /></span>}
            <span className="plan-btns">
              {st?.finished
                ? <button type="button" className="chip solid" onClick={() => { restartPlan(p.id); onRead(...planDays(p.id)[0][0]) }}>Finished · start again</button>
                : <button type="button" className="chip solid" onClick={open}>{st ? (active ? 'Read today’s chapters' : 'Continue this plan') : 'Start this plan'}</button>}
              {active && <button type="button" className="link-btn" onClick={stopPlan}>Stop for now</button>}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// The welcome page: today's reading, when a plan is under way.
export function TodayCard({ onRead }) {
  const st = activePlanStatus(usePlans())
  if (!st) return null
  const [b, c] = firstUnread(st)
  const day = st.days[st.today]
  const left = day.filter(([bb, cc]) => !st.isRead(bb, cc)).length
  return (
    <div className="today-card">
      <div className="eyebrow">{st.finished ? 'Plan finished' : `Today · day ${st.today + 1} of ${st.total}`}</div>
      <div className="today-plan">{st.plan.title}</div>
      <div className="today-label">{dayLabel(day)}</div>
      {!st.finished && <button type="button" className="btn-primary" onClick={() => onRead(b, c)}>
        {left < day.length ? `Go on with ${ref(b, c)}` : `Read today’s chapters`}
      </button>}
    </div>
  )
}

// In the reader: where this chapter sits in today's reading, and the way on.
export function PlanStep({ book, chapter, onNavigate, place }) {
  const s = usePlans()
  const st = activePlanStatus(s)
  if (!st) return null
  // The day that holds this chapter, looking at today first.
  let dayIndex = st.days[st.today].some(([b, c]) => b === book && c === chapter) ? st.today
    : st.days.findIndex(d => d.some(([b, c]) => b === book && c === chapter))
  if (dayIndex < 0) return null
  const day = st.days[dayIndex]
  const at = day.findIndex(([b, c]) => b === book && c === chapter)
  const read = st.isRead(book, chapter)
  const head = `${st.plan.title} · day ${dayIndex + 1} of ${st.total}`

  if (place === 'top') {
    return (
      <div className="path-chip plan-chip">
        <span><b>{head}</b> · {ref(book, chapter)} is {at + 1} of {day.length}{read ? ' · read ✓' : ''}</span>
      </div>
    )
  }

  const nextHere = day.slice(at + 1).find(([b, c]) => !st.isRead(b, c))
  const done = () => {
    markRead(st.plan.id, book, chapter)
    const after = activePlanStatus()
    if (nextHere) onNavigate(nextHere[0], nextHere[1])
    else if (after && after.today !== dayIndex && !after.finished) { /* the day is done: stay, show the message */ }
  }
  const dayFinished = day.every(([b, c]) => st.isRead(b, c))
  const tomorrow = st.days[dayIndex + 1]
  return (
    <section className="path-step plan-step" aria-label={head}>
      <div className="path-top"><span className="eyebrow">{head}</span></div>
      <div className="path-bar" aria-hidden="true"><b style={{ width: `${(100 * st.doneDays) / st.total}%` }} /></div>
      {dayFinished ? (
        <>
          <p>Day {dayIndex + 1} is done: {dayLabel(day)}. Well done.</p>
          {tomorrow && <button type="button" className="link-btn" onClick={() => onNavigate(tomorrow[0][0], tomorrow[0][1])}>Read ahead: day {dayIndex + 2}, {dayLabel(tomorrow)} →</button>}
        </>
      ) : (
        <>
          <p>{read ? `${ref(book, chapter)} is marked as read.` : `Finished ${ref(book, chapter)}?`} {day.length > 1 && `Today’s reading: ${dayLabel(day)}.`}</p>
          {read
            ? nextHere && <button type="button" className="chip solid" onClick={() => onNavigate(nextHere[0], nextHere[1])}>Next: {ref(...nextHere)} →</button>
            : <button type="button" className="chip solid" onClick={done}>{nextHere ? `Mark as read · next, ${ref(...nextHere)} →` : 'Mark as read · finish today'}</button>}
        </>
      )}
    </section>
  )
}
