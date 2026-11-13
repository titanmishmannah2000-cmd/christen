import { BOOKS } from '../data/books'
import { TRANSLATIONS, onlineKey } from './translations'
import { storage } from './prefs'

// Copyrighted Bibles are read from their publishers' own services, one chapter at a
// time, within the terms each one sets for free, non-commercial apps:
//  - ESV (api.esv.org, Crossway): keep at most 500 verses on the device, link to
//    esv.org and show Crossway's notice wherever the text appears.
//  - The Good News Translation (API.Bible, American Bible Society): show the copyright
//    with the text, report each view (FUMS), and fetch a kept chapter again within 30
//    days (we do it after 14).

const USFM = 'GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV'.split(' ')
const ALL = [...BOOKS.old, ...BOOKS.new]
const DEUTERO_USFM = { Tobit: 'TOB', Judith: 'JDT', Wisdom: 'WIS', Sirach: 'SIR', Baruch: 'BAR', '1 Maccabees': '1MA', '2 Maccabees': '2MA' }
const usfm = (book) => USFM[ALL.indexOf(book)] || DEUTERO_USFM[book]

export const ESV_NOTICE = 'Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved.'

// "[16] For God so loved… [17] For God did not…" → [{ verse, text }]; joined verses
// ("[1-3]") go under the first, with the range as their label.
export function splitVerses(raw, book, chapter) {
  const text = raw.replace(/\s+/g, ' ').trim()
  const verses = []
  const re = /\[(\d+)(?:[-–](\d+))?\]\s*/g
  let m, last = null
  while ((m = re.exec(text))) {
    if (last) last.text = text.slice(last.start, m.index).trim()
    last = { verse: parseInt(m[1], 10), label: m[2] ? `${m[1]}–${m[2]}` : null, start: re.lastIndex }
    verses.push(last)
  }
  if (last) last.text = text.slice(last.start).trim()
  return verses
    .map(({ verse, label, text }) => ({ book_name: book, chapter, verse, text: text.replace(/\s*\(ESV\)$/, ''), ...(label ? { label, at: `${chapter}:${label}` } : {}) }))
    .filter(v => v.text)
}

// A chapter in API.Bible's structured form (USFM as JSON) → the verses with their
// printed lines, the section headings before them, and the translators' notes:
//  - para "s"/"s1"/"s2"/"ms" is a heading and "r" the parallel passages under it; a
//    heading carries over to the next verse.
//  - para "q1"/"q2"/"li"… is a line of poetry or a list: it starts a new line of its
//    verse. A new prose paragraph inside a verse just continues it.
//  - note "f" is a footnote (fq: the words it is on, fqa/ft: another way to put them or
//    the note's own words); note "x" a cross reference. Their place in the verse is kept.
//  - char "nd" (the divine name) is printed in capitals, as in the book: LORD.
export function readStructured(content, book, chapter) {
  const verses = []
  const byNumber = new Map()
  const sections = {}
  let heads = []
  let headNotes = []
  let current = null
  let lineStart = false

  const verseFor = (number) => {
    const [first, last] = String(number).split(/[-–]/).map(n => parseInt(n, 10))
    if (!byNumber.has(first)) {
      const v = { book_name: book, chapter, verse: first, text: '' }
      if (last && last !== first) { v.label = `${first}–${last}`; v.at = `${chapter}:${v.label}` }
      byNumber.set(first, v)
      verses.push(v)
    }
    const v = byNumber.get(first)
    if (heads.length) { sections[first] = [...(sections[first] || []), ...heads]; heads = [] }
    if (headNotes.length) { v.notes = [...(v.notes || []), ...headNotes.map(note => ({ at: 0, note }))]; headNotes = [] }
    return v
  }
  const add = (text) => {
    if (!current || !text) return
    if (lineStart && current.text.trim()) current.text = current.text.replace(/\s+$/, '') + '\n'
    lineStart = false
    current.text += text
  }
  const plain = (items) => (items || []).map(it => (it.type === 'text' ? it.text : it.name === 'char' && it.attrs?.style === 'nd' ? plain(it.items).toUpperCase() : plain(it.items))).join('')
  const noteOf = (node) => {
    const style = node.attrs?.style
    const parts = []
    for (const it of node.items || []) {
      const kind = it.attrs?.style
      const text = plain(it.type === 'text' ? [it] : it.items).trim()
      // fr/xo is where the note stands ("1.1:"), already known; but a label such as
      // "HEBREW TITLE:" is kept as the words the note is on.
      if (!text || kind === 'xo' || (kind === 'fr' && /^\d/.test(text))) continue
      if (kind === 'fr') { parts.push(['fq', text]); continue }
      if (style === 'x') parts.push(['xt', text])
      else parts.push([kind === 'fq' ? 'fq' : kind === 'fqa' ? 'fqa' : 'ft', text])
    }
    if (!parts.length) return null
    return style === 'x' ? [['fqa', 'See also'], ...parts] : parts
  }
  const walk = (items, inHeading) => {
    for (const it of items || []) {
      if (it.type === 'text') { if (inHeading) inHeading.push(it.text); else add(it.text); continue }
      if (it.name === 'verse') { current = verseFor(it.attrs.number); continue }
      if (it.name === 'note') {
        const note = noteOf(it)
        if (!note) continue
        if (inHeading) headNotes.push(note)
        else if (current) (current.notes = current.notes || []).push({ at: current.text.replace(/\s+$/, '').length, note })
        continue
      }
      if (it.name === 'char' && it.attrs?.style === 'nd') {
        const text = plain(it.items).toUpperCase()
        if (inHeading) inHeading.push(text); else add(text)
        continue
      }
      walk(it.items, inHeading)
    }
  }
  for (const para of content || []) {
    const style = para.attrs?.style || ''
    if (/^(s\d?|ms\d?|mr|r|d|sp)$/.test(style)) {
      const words = []
      walk(para.items, words)
      const line = words.join('').replace(/\s+/g, ' ').trim()
      if (line) heads.push(line)
      continue
    }
    if (/^(q\d?|qr|qc|qm\d?|pi\d?|li\d?|pmo|pmc|pmr|tr|b)$/.test(style)) lineStart = true
    walk(para.items, null)
    if (current) current.text = current.text.replace(/\s+$/, '') + ' '
  }
  for (const v of verses) {
    const raw = v.text
    v.text = raw.replace(/[^\S\n]+/g, ' ').replace(/ *\n */g, '\n').trim()
    // Notes were placed in the raw text: move them to the tidied one.
    if (v.notes) {
      const lead = raw.length - raw.replace(/^\s+/, '').length
      v.notes = v.notes.map(n => ({ ...n, at: Math.min(v.text.length, raw.slice(lead, lead + n.at).replace(/[^\S\n]+/g, ' ').replace(/ *\n */g, '\n').length) }))
    }
  }
  return { verses: verses.filter(v => v.text), sections }
}

// ── What is kept on the device ─────────────────────────────────

const CACHE_KEY = 'verbum-online-cache'
const ESV_LIMIT = 500
const REFRESH_MS = 14 * 24 * 60 * 60 * 1000

function readCache() { return storage.get(CACHE_KEY) || {} }
function writeCache(cache) { storage.set(CACHE_KEY, cache) }

// Chapters kept from API.Bible, at most: the oldest read are let go first, so the
// device's storage is never filled.
const API_LIMIT = 250

function keep(id, key, entry) {
  const cache = readCache()
  // A chapter from the offline copy keeps the date it was fetched, so it is still fetched
  // again in time.
  cache[`${id}:${key}`] = { ...entry, at: entry.at || Date.now(), used: Date.now() }
  const others = Object.entries(cache).filter(([k]) => !k.startsWith('esv:')).sort((a, b) => a[1].used - b[1].used)
  for (let i = 0; i < others.length - API_LIMIT; i++) delete cache[others[i][0]]
  // The ESV may keep at most 500 verses: drop the chapters read longest ago.
  const esv = Object.entries(cache).filter(([k]) => k.startsWith('esv:')).sort((a, b) => a[1].used - b[1].used)
  let total = esv.reduce((n, [, e]) => n + e.verses.length, 0)
  for (const [k, e] of esv) {
    if (total <= ESV_LIMIT) break
    delete cache[k]
    total -= e.verses.length
  }
  writeCache(cache)
}

function recall(id, key) {
  const cache = readCache()
  const entry = cache[`${id}:${key}`]
  if (!entry) return null
  if (Date.now() - entry.at > REFRESH_MS) return null
  entry.used = Date.now()
  writeCache(cache)
  return entry
}

// Everything kept from the publishers, removed (Settings > Clear saved data).
export function clearOnlineCache() {
  storage.set(CACHE_KEY, null)
  if (typeof caches !== 'undefined') caches.delete(COPY).catch(() => {})
  Object.keys(TRANSLATIONS).forEach(id => storage.set(`${COPY_FLAG}${id}`, null))
}

// ── A whole copy for reading offline ───────────────────────────
// API.Bible lets an app keep its texts on the device as long as each chapter is fetched
// again within 30 days. "Save the whole Bible on this device" keeps every chapter of an
// API.Bible text here (Cache Storage, which has room for a whole Bible). Whenever the app
// is online it fetches again the chapters kept more than 14 days, and a chapter not
// refreshed within 30 days is no longer shown.
const COPY = 'verbum-text-copy'
const COPY_FLAG = 'verbum-text-copy-'
const COPY_MAX_MS = 30 * 24 * 60 * 60 * 1000
const copyUrl = (tr, key) => `https://verbum.copy/${tr}/${encodeURIComponent(key)}`
export const hasTextCopy = (tr) => !!storage.get(`${COPY_FLAG}${tr}`)

async function copyGet(tr, key) {
  if (typeof caches === 'undefined') return null
  try {
    const res = await (await caches.open(COPY)).match(copyUrl(tr, key))
    if (!res) return null
    const entry = await res.json()
    if (Date.now() - entry.at > COPY_MAX_MS) return null
    return entry
  } catch { return null }
}

async function copyPut(tr, key, entry) {
  if (typeof caches === 'undefined') return
  try {
    await (await caches.open(COPY)).put(copyUrl(tr, key), new Response(JSON.stringify({ ...entry, at: Date.now() }), { headers: { 'Content-Type': 'application/json' } }))
  } catch { /* storage full or unavailable */ }
}

async function fetchChapter(book, chapter, tr) {
  const t = TRANSLATIONS[tr]
  return t.online === 'esv' ? esvChapter(book, chapter) : apiBibleChapter(book, chapter, t.abbr)
}

// One chapter fetched and kept in the copy (used by Save the whole Bible). Resolves true
// when kept, false when the chapter is not in this Bible.
export async function saveChapterCopy(book, chapter, tr) {
  try {
    const entry = await fetchChapter(book, chapter, tr)
    await copyPut(tr, `${book}.${chapter}`, entry)
    storage.set(`${COPY_FLAG}${tr}`, true)
    return true
  } catch (err) {
    if (err?.message === 'esther-additions' || err?.message === 'not-in-text') return false
    throw err
  }
}

// The chapters kept more than 14 days, fetched again, a few at a time (the app calls this
// when it opens online).
export async function refreshTextCopies() {
  if (typeof caches === 'undefined' || (typeof navigator !== 'undefined' && navigator.onLine === false)) return
  let cache
  try { cache = await caches.open(COPY) } catch { return }
  const stale = []
  for (const req of await cache.keys()) {
    const m = req.url.match(/^https:\/\/verbum\.copy\/([^/]+)\/(.+)$/)
    if (!m || !TRANSLATIONS[m[1]] || !onlineKey(TRANSLATIONS[m[1]].online)) continue
    const entry = await (await cache.match(req))?.json().catch(() => null)
    if (!entry || Date.now() - entry.at > REFRESH_MS) stale.push([m[1], decodeURIComponent(m[2])])
  }
  const work = async () => {
    while (stale.length) {
      const [tr, key] = stale.shift()
      const [, book, chapter] = key.match(/^(.+)\.(\d+)$/) || []
      if (!book) continue
      try { await copyPut(tr, key, await fetchChapter(book, Number(chapter), tr)) } catch { /* tried again next time */ }
    }
  }
  await Promise.all([work(), work()])
}

// ── ESV ────────────────────────────────────────────────────────

async function esvChapter(book, chapter) {
  const q = encodeURIComponent(`${book} ${chapter}`)
  const params = 'include-passage-references=false&include-verse-numbers=true&include-first-verse-numbers=true&include-footnotes=false&include-footnote-body=false&include-headings=false&include-short-copyright=false&include-copyright=false'
  const res = await fetch(`https://api.esv.org/v3/passage/text/?q=${q}&${params}`, {
    headers: { Authorization: `Token ${onlineKey('esv')}` },
  })
  if (!res.ok) throw new Error('online-failed')
  const data = await res.json()
  const verses = splitVerses((data.passages || []).join(' '), book, chapter)
  if (!verses.length) throw new Error('online-failed')
  return { verses, copyright: ESV_NOTICE, link: { href: `https://www.esv.org/${encodeURIComponent(book)}+${chapter}/`, label: 'Read at esv.org' } }
}

// ── API.Bible (the Good News Translation) ──────────────────────

// The address from the API.Bible dashboard, if it gives one; otherwise the usual one.
const API = (import.meta.env.VITE_API_BIBLE_URL || 'https://rest.api.bible/v1').replace(/\/+$/, '')
const ID_OVERRIDES = {
  NASB: import.meta.env.VITE_API_BIBLE_NASB_ID,
  CSB: import.meta.env.VITE_API_BIBLE_CSB_ID,
  NIV: import.meta.env.VITE_API_BIBLE_NIV_ID,
  // Good News Translation (US Version), with the Deuterocanonical books.
  GNTD: import.meta.env.VITE_API_BIBLE_GNTD_ID || '61fd76eafa1577c2-01',
}
const bibleIds = {}

function apiFetch(path) {
  return fetch(`${API}${path}`, { headers: { 'api-key': onlineKey('apibible') } }).then(res => {
    if (!res.ok) throw new Error('online-failed')
    return res.json()
  })
}

// The Bible's id on API.Bible, found once by its abbreviation and remembered.
async function bibleId(abbr) {
  if (ID_OVERRIDES[abbr]) return ID_OVERRIDES[abbr]
  const saved = storage.get(`verbum-apibible-${abbr}`)
  if (saved) return saved
  if (!bibleIds[abbr]) {
    bibleIds[abbr] = apiFetch(`/bibles?language=eng&abbreviation=${abbr}`).then(({ data }) => {
      const pick = (data || []).find(b => b.abbreviation === abbr || b.abbreviationLocal === abbr) || data?.[0]
      if (!pick) throw new Error('online-failed')
      storage.set(`verbum-apibible-${abbr}`, pick.id)
      return pick.id
    }).catch(err => { delete bibleIds[abbr]; throw err })
  }
  return bibleIds[abbr]
}

// API.Bible asks every app that shows its texts to report each view.
let fumsLoaded = false
function reportView(token) {
  if (!token || typeof window === 'undefined') return
  if (!fumsLoaded) {
    fumsLoaded = true
    window.fums = window.fums || function () { (window.fumsData = window.fumsData || []).push(arguments) }
    const s = document.createElement('script')
    s.src = 'https://pkg.api.bible/fumsV3.min.js'
    s.async = true
    document.head.appendChild(s)
  }
  window.fums('trackView', token)
}

// Where a chapter of the 73-book Catholic Bible stands in the Good News Translation,
// which prints some parts as books of their own: Daniel 13 and 14 are Susanna and Bel
// and the Dragon, Baruch 6 the Letter of Jeremiah. Esther is read in its Greek version,
// whose additions the translation weaves into chapters 1–10.
function apiChapterId(book, chapter, abbr) {
  if (abbr === 'GNTD') {
    if (book === 'Esther') {
      if (chapter > 10) throw new Error('esther-additions')
      return `ESG.${chapter}`
    }
    if (book === 'Daniel' && chapter === 13) return 'SUS.1'
    if (book === 'Daniel' && chapter === 14) return 'BEL.1'
    if (book === 'Baruch' && chapter === 6) return 'LJE.1'
  }
  return `${usfm(book)}.${chapter}`
}

async function apiBibleChapter(book, chapter, abbr) {
  const id = await bibleId(abbr)
  const { data, meta } = await apiFetch(`/bibles/${id}/chapters/${apiChapterId(book, chapter, abbr)}?content-type=json&include-notes=true&include-titles=true&include-chapter-numbers=false&include-verse-numbers=true&include-verse-spans=false`)
  const { verses, sections } = readStructured(data?.content || [], book, chapter)
  if (!verses.length) throw new Error('online-failed')
  return { verses, sections, copyright: (data.copyright || '').trim(), fums: meta?.fumsToken || meta?.fums || null }
}

// ── The chapter ────────────────────────────────────────────────

export async function onlineChapter(book, chapter, tr) {
  const t = TRANSLATIONS[tr]
  if (!usfm(book)) throw new Error('not-in-text')
  if (!onlineKey(t.online)) throw new Error('online-not-set-up')
  const key = `${book}.${chapter}`
  let entry = recall(tr, key)
  if (!entry) {
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false
    // The whole copy kept on the device, if there is one.
    const copy = hasTextCopy(tr) ? await copyGet(tr, key) : null
    if (copy && (offline || Date.now() - copy.at <= REFRESH_MS)) entry = copy
    else if (offline) throw new Error('offline')
    else {
      try {
        entry = await fetchChapter(book, chapter, tr)
        if (hasTextCopy(tr)) copyPut(tr, key, entry)
      } catch (err) {
        if (!copy) throw err
        entry = copy
      }
    }
    keep(tr, key, entry)
  }
  if (entry.fums) reportView(entry.fums)
  return { heading: null, douay: null, verses: entry.verses, sections: entry.sections || {}, copyright: entry.copyright, link: entry.link || null, online: true }
}
