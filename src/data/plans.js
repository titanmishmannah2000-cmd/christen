import { ALL_BOOKS } from '../lib/bible'
import { chaptersOf } from './canon'
import { VERSE_COUNTS } from './verseCounts'

// Reading plans: a set number of days, each a few chapters of about the same length.
// Days are made here from the chapters and their verse counts, so every plan is
// simply "these books, in this many days".
const chaptersIn = (books) => books.flatMap(b => Array.from({ length: chaptersOf(b) }, (_, i) => [b, i + 1]))
const verses = ([b, c]) => VERSE_COUNTS[b]?.[c - 1] || 25

// Split chapters, in order, into `days` runs of about the same number of verses.
function split(chapters, days) {
  const total = chapters.reduce((n, ch) => n + verses(ch), 0)
  const out = []
  let day = []
  let sum = 0
  chapters.forEach((ch, i) => {
    const left = chapters.length - i
    const daysLeft = days - out.length
    day.push(ch)
    sum += verses(ch)
    const target = (total * (out.length + 1)) / days
    // Close the day once it reaches its share, but never leave a later day empty.
    if ((sum >= target - verses(ch) / 2 && daysLeft > 1) || left <= daysLeft - 1) {
      out.push(day)
      day = []
    }
  })
  if (day.length) out.push(day)
  return out
}

const GOSPELS = ['Matthew', 'Mark', 'Luke', 'John']
const NT = ALL_BOOKS.slice(39)

export const PLANS = [
  {
    id: 'gospels-40',
    title: 'The Gospels in 40 days',
    who: 'Meet Jesus in all four accounts of his life.',
    days: () => split(chaptersIn(GOSPELS), 40),
  },
  {
    id: 'psalms-proverbs-31',
    title: 'Psalms and Proverbs in a month',
    who: 'Five psalms to pray and one chapter of wisdom each day.',
    days: () => {
      const psalms = split(chaptersIn(['Psalms']), 31)
      return psalms.map((day, i) => [...day, ['Proverbs', i + 1]])
    },
  },
  {
    id: 'nt-90',
    title: 'The New Testament in 90 days',
    who: 'Every book from Matthew to Revelation, about three chapters a day.',
    days: () => split(chaptersIn(NT), 90),
  },
  {
    id: 'bible-year',
    title: 'The whole Bible in a year',
    who: 'Genesis to Revelation in order, about three or four chapters a day.',
    days: () => split(chaptersIn(ALL_BOOKS), 365),
  },
]

const built = {}
export const planDays = (id) => (built[id] ||= PLANS.find(p => p.id === id).days())
export const PLANS_BY_ID = Object.fromEntries(PLANS.map(p => [p.id, p]))

// "Luke 3–5", "Psalms 1–5 · Proverbs 1": a day's chapters, grouped by book.
export function dayLabel(day) {
  const groups = []
  day.forEach(([b, c]) => {
    const g = groups[groups.length - 1]
    if (g && g.book === b && g.to === c - 1) g.to = c
    else groups.push({ book: b, from: c, to: c })
  })
  return groups.map(g => {
    const name = g.book === 'Psalms' ? (g.from === g.to ? 'Psalm' : 'Psalms') : g.book
    return `${name} ${g.from}${g.to > g.from ? `–${g.to}` : ''}`
  }).join(' · ')
}
