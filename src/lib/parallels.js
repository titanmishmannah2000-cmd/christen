import { useEffect, useState } from 'react'
import { ALL_BOOKS } from './bible'
import { bookName } from './i18n'

// Places where the Bible tells the same event more than once: the Gospels side by
// side (A. T. Robertson's harmony, 1922) and Samuel–Kings beside Chronicles
// (W. D. Crockett's harmony, 1897). Built by scripts/build-parallels.py.
let loading = null
export function loadParallels() {
  if (!loading) {
    loading = fetch(`${import.meta.env.BASE_URL}parallels.json`)
      .then(r => { if (!r.ok) throw new Error('parallels'); return r.json() })
      .then(data => ({
        ...data,
        sections: data.sections.map((s, i) => ({
          i, title: s.t, source: s.s,
          accounts: s.a.map(([bi, spans]) => ({ book: ALL_BOOKS[bi], spans })),
        })),
      }))
      .catch(err => { loading = null; throw err })
  }
  return loading
}

export function useParallels() {
  const [data, setData] = useState(null)
  useEffect(() => {
    let live = true
    loadParallels().then(d => { if (live) setData(d) }).catch(() => {})
    return () => { live = false }
  }, [])
  return data
}

const inSpan = ([c1, v1, c2, v2], c, v) => (c > c1 || (c === c1 && v >= v1)) && (c < c2 || (c === c2 && (v == null || v <= v2)))
const touchesChapter = ([c1, , c2], c) => c >= c1 && c <= c2

// Sections with an account in this chapter (and, given a verse, covering that verse).
export function parallelsAt(data, book, chapter, verse) {
  if (!data) return []
  return data.sections.filter(s => s.accounts.some(a => a.book === book && a.spans.some(sp =>
    verse == null ? touchesChapter(sp, chapter) : inSpan(sp, chapter, verse))))
}

// The other accounts of a section, seen from this book.
export const otherAccounts = (section, book) => section.accounts.filter(a => a.book !== book)

// "Mark 1:9–11", "Matthew 8:18, 23–27", "Mark 11:27–12:12".
export function accountLabel({ book, spans }) {
  let last = null
  const parts = spans.map(([c1, v1, c2, v2]) => {
    const head = c1 === last ? '' : `${c1}:`
    last = c2
    const tail = c2 !== c1 ? `–${c2}:${v2}` : v2 !== v1 ? `–${v2}` : ''
    return `${head}${v1}${tail}`
  })
  return `${bookName(book)} ${parts.join(', ')}`
}

// Every verse an account covers, chapter by chapter: [[chapter, [verse numbers]], ...].
export function accountVerses({ spans }, lastVerse) {
  const out = []
  for (const [c1, v1, c2, v2] of spans) {
    for (let c = c1; c <= c2; c++) {
      const lo = c === c1 ? v1 : 1
      const hi = c === c2 ? v2 : lastVerse(c)
      let row = out.find(([ch]) => ch === c)
      if (!row) { row = [c, []]; out.push(row) }
      for (let v = lo; v <= hi; v++) row[1].push(v)
    }
  }
  return out
}
