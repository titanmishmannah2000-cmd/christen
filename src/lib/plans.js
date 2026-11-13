import { useSyncExternalStore } from 'react'
import { storage } from './prefs'
import { planDays, PLANS_BY_ID } from '../data/plans'

// Reading plans: which one is active, when it began, and which chapters are read.
// "Today" is simply the first day not yet finished, so missing a day never
// leaves anyone behind; the date only tells how long the plan has been going.
const KEY = 'verbum-plans'
let state = storage.get(KEY) || { active: null, plans: {} }
const listeners = new Set()
const write = (next) => { state = next; storage.set(KEY, next); listeners.forEach(l => l()) }

export function usePlans() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => state)
}

const chKey = (b, c) => `${b}|${c}`

export function startPlan(id) {
  const existing = state.plans[id]
  write({ active: id, plans: { ...state.plans, [id]: existing || { started: Date.now(), read: {} } } })
}
export function restartPlan(id) {
  write({ active: id, plans: { ...state.plans, [id]: { started: Date.now(), read: {} } } })
}
export function stopPlan() { write({ ...state, active: null }) }

export function markRead(id, book, chapter, read = true) {
  const p = state.plans[id]
  if (!p) return
  const nextRead = { ...p.read }
  if (read) nextRead[chKey(book, chapter)] = true
  else delete nextRead[chKey(book, chapter)]
  write({ ...state, plans: { ...state.plans, [id]: { ...p, read: nextRead } } })
}

// Where a plan stands: today's day (the first unfinished one), its chapters, and
// how far through it is.
export function planStatus(id, s = state) {
  const p = s.plans[id]
  const plan = PLANS_BY_ID[id]
  if (!p || !plan) return null
  const days = planDays(id)
  const isRead = (b, c) => !!p.read[chKey(b, c)]
  const dayDone = (d) => d.every(([b, c]) => isRead(b, c))
  let today = days.findIndex(d => !dayDone(d))
  const finished = today < 0
  if (finished) today = days.length - 1
  const doneDays = days.filter(dayDone).length
  const sinceStart = Math.floor((Date.now() - p.started) / 86400000) + 1
  return { plan, days, today, finished, doneDays, total: days.length, sinceStart, isRead }
}

export const activePlanStatus = (s = state) => (s.active ? planStatus(s.active, s) : null)
