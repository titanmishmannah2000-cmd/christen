import { BOOKS, CHAPTER_COUNTS, CATHOLIC_CHAPTER_COUNTS, CATHOLIC_OLD, DEUTERO_BOOKS } from '../data/books'
import { TRANSLATIONS, translationId, isCatholic, isOnline } from './translations'
import { onlineChapter } from './online'

// The full World English Bible ships with the app (public/bible/*.json),
// so reading and searching work offline and never hit an API rate limit.

export const ALL_BOOKS = [...BOOKS.old, ...BOOKS.new]
export const TRANSLATION = 'WEB'

const bookCache = {}

export const bookFileSlug = (book) => book.toLowerCase().replace(/ /g, '')

export function testamentOf(book) {
  return BOOKS.new.includes(book) ? 'new' : 'old'
}
// The books of a Bible text, in its order: 73 in a Catholic Bible, 66 otherwise.
export const booksOf = (tr) => (isCatholic(tr) ? [...CATHOLIC_OLD, ...BOOKS.new] : ALL_BOOKS)
const countsOf = (tr) => (isCatholic(tr) ? CATHOLIC_CHAPTER_COUNTS : CHAPTER_COUNTS)

// `tr` picks the text (see lib/translations.js). Notes, word studies and
// connections always read the English, so they leave it as 'web'.
export function loadBook(book, tr = 'web') {
  // Copyrighted texts are read a chapter at a time from the publisher (getChapter);
  // whole-book uses (search, side-by-side accounts, previews) read the English instead.
  if (isOnline(tr)) tr = 'web'
  const key = `${tr}:${book}`
  if (!bookCache[key]) {
    const dir = (TRANSLATIONS[tr] || TRANSLATIONS.web).dir
    bookCache[key] = fetch(`${import.meta.env.BASE_URL}${dir}/${bookFileSlug(book)}.json`)
      .then(res => {
        if (!res.ok) throw new Error(`Could not load ${book}`)
        return res.json()
      })
      .catch(err => {
        delete bookCache[key]
        throw err
      })
  }
  return bookCache[key]
}

// A chapter as { verses: [{ verse, text, label? }], heading, douay?, copyright?, fums? }.
// `label` is the verse number the text itself prints, when it differs from the English
// numbering the notes use (the Douay-Rheims). Throws 'not-in-text' for a book or chapter
// the chosen Bible does not have (Tobit outside a Catholic Bible).
export async function getChapter(book, chapter, tr = 'web') {
  if (chapter < 1 || chapter > (countsOf(tr)[book] || 0)) throw new Error('not-in-text')
  if (isOnline(tr)) return onlineChapter(book, chapter, tr)
  const data = await loadBook(book, tr)
  const verses = data.chapters[chapter - 1]
  if (!verses) throw new Error('Chapter not found')
  const douay = data.douay?.[chapter] || null
  // `at` is chapter:verse as the text itself numbers it, for quoting and citing.
  const douayChapter = douay?.match(/^\S+ (\d+) in the/)?.[1] || chapter
  return {
    heading: data.headings[chapter] || null,
    copyright: data.copyright || null,
    douay,
    // The translators' section headings and footnotes, for texts that carry them (Urdu).
    sections: Object.fromEntries(Object.entries(data.sections || {})
      .filter(([k]) => k.startsWith(`${chapter}:`)).map(([k, h]) => [Number(k.split(':')[1]), h.split('\n')])),
    titleNotes: data.notes?.[`${chapter}:0`] || null,
    verses: verses.map(([verse, text, label]) => ({
      book_name: book, chapter, verse, text,
      ...(data.notes?.[`${chapter}:${verse}`] ? { notes: data.notes[`${chapter}:${verse}`] } : {}),
      ...(label ? { label, at: label.includes(':') ? label : `${douayChapter}:${label}` } : douay ? { at: `${douayChapter}:${verse}` } : {}),
    })),
  }
}

export async function getVerse(book, chapter, verse, tr = 'web') {
  const { verses } = await getChapter(book, chapter, tr)
  return verses.find(v => v.verse === verse) || null
}

// ── Reference parsing ──────────────────────────────────────────

const ALIASES = {
  gen: 'Genesis', gn: 'Genesis', ex: 'Exodus', exod: 'Exodus', lev: 'Leviticus',
  num: 'Numbers', nm: 'Numbers', deut: 'Deuteronomy', dt: 'Deuteronomy',
  josh: 'Joshua', judg: 'Judges', jdg: 'Judges', ru: 'Ruth',
  '1sam': '1 Samuel', '1sa': '1 Samuel', '2sam': '2 Samuel', '2sa': '2 Samuel',
  '1kgs': '1 Kings', '1ki': '1 Kings', '2kgs': '2 Kings', '2ki': '2 Kings',
  '1chr': '1 Chronicles', '1ch': '1 Chronicles', '2chr': '2 Chronicles', '2ch': '2 Chronicles',
  neh: 'Nehemiah', est: 'Esther', esth: 'Esther',
  ps: 'Psalms', psa: 'Psalms', psalm: 'Psalms', pss: 'Psalms',
  prov: 'Proverbs', pr: 'Proverbs', prv: 'Proverbs',
  eccl: 'Ecclesiastes', ecc: 'Ecclesiastes', qoh: 'Ecclesiastes',
  song: 'Song of Solomon', sos: 'Song of Solomon', songofsongs: 'Song of Solomon',
  canticles: 'Song of Solomon', ss: 'Song of Solomon',
  isa: 'Isaiah', jer: 'Jeremiah', lam: 'Lamentations', ezek: 'Ezekiel', eze: 'Ezekiel',
  dan: 'Daniel', hos: 'Hosea', ob: 'Obadiah', obad: 'Obadiah', jon: 'Jonah',
  mic: 'Micah', nah: 'Nahum', hab: 'Habakkuk', zeph: 'Zephaniah', hag: 'Haggai',
  zech: 'Zechariah', zec: 'Zechariah', mal: 'Malachi',
  mt: 'Matthew', matt: 'Matthew', mk: 'Mark', mrk: 'Mark', lk: 'Luke', jn: 'John', jhn: 'John',
  ac: 'Acts', rom: 'Romans', ro: 'Romans',
  '1cor': '1 Corinthians', '1co': '1 Corinthians', '2cor': '2 Corinthians', '2co': '2 Corinthians',
  gal: 'Galatians', eph: 'Ephesians', phil: 'Philippians', php: 'Philippians',
  col: 'Colossians', '1thess': '1 Thessalonians', '1th': '1 Thessalonians',
  '2thess': '2 Thessalonians', '2th': '2 Thessalonians',
  '1tim': '1 Timothy', '1ti': '1 Timothy', '2tim': '2 Timothy', '2ti': '2 Timothy',
  tit: 'Titus', phlm: 'Philemon', philem: 'Philemon', phm: 'Philemon',
  heb: 'Hebrews', jas: 'James', jm: 'James',
  '1pet': '1 Peter', '1pe': '1 Peter', '1pt': '1 Peter', '2pet': '2 Peter', '2pe': '2 Peter', '2pt': '2 Peter',
  '1jn': '1 John', '1jo': '1 John', '2jn': '2 John', '2jo': '2 John', '3jn': '3 John', '3jo': '3 John',
  jud: 'Jude', rev: 'Revelation', re: 'Revelation', revelations: 'Revelation', apocalypse: 'Revelation',
}

// The seven Catholic books, found only while a Catholic Bible is chosen.
const DEUTERO_ALIASES = {
  tob: 'Tobit', tb: 'Tobit', tobias: 'Tobit', jdt: 'Judith', jdth: 'Judith', jth: 'Judith', wis: 'Wisdom', ws: 'Wisdom',
  wisdomofsolomon: 'Wisdom', sir: 'Sirach', ecclus: 'Sirach', ecclesiasticus: 'Sirach', bar: 'Baruch',
  '1macc': '1 Maccabees', '1mac': '1 Maccabees', '1ma': '1 Maccabees', '1machabees': '1 Maccabees',
  '2macc': '2 Maccabees', '2mac': '2 Maccabees', '2ma': '2 Maccabees', '2machabees': '2 Maccabees',
}

const ORDINALS = { i: '1', ii: '2', iii: '3', first: '1', second: '2', third: '3', '1st': '1', '2nd': '2', '3rd': '3' }

export function findBook(name) {
  let key = name.toLowerCase().replace(/\./g, '').trim()
  key = key.replace(/^(iii|ii|i|first|second|third|1st|2nd|3rd)\s+/, (_, o) => ORDINALS[o])
  key = key.replace(/\s+/g, '')
  if (key.length < 2) return null
  if (ALIASES[key]) return ALIASES[key]
  const catholic = isCatholic()
  if (catholic && DEUTERO_ALIASES[key]) return DEUTERO_ALIASES[key]
  const books = catholic ? [...ALL_BOOKS, ...DEUTERO_BOOKS] : ALL_BOOKS
  const exact = books.find(b => bookFileSlug(b) === key)
  if (exact) return exact
  if (key.length < 3 && !/^\d/.test(key)) return null
  return books.find(b => bookFileSlug(b).startsWith(key)) || null
}

// "John 3:16", "1 cor 13", "ps 23:1-3", "Song of Songs 2". Returns null when
// the text does not look like a reference.
export function parseReference(input) {
  const m = input.trim().match(/^((?:[1-3]|i{1,3}|first|second|third)?\s*[a-z][a-z .]*?)\s*(\d+)?(?:\s*[:.]\s*(\d+)(?:\s*[-–]\s*(\d+))?)?$/i)
  if (!m) return null
  const book = findBook(m[1])
  if (!book) return null
  const chapter = m[2] ? parseInt(m[2], 10) : null
  if (chapter !== null && (chapter < 1 || chapter > countsOf()[book])) return null
  return {
    book,
    chapter,
    verse: m[3] ? parseInt(m[3], 10) : null,
    verseEnd: m[4] ? parseInt(m[4], 10) : null,
  }
}

export function formatReference({ book, chapter, verse, verseEnd }) {
  if (!chapter) return book
  if (!verse) return `${book} ${chapter}`
  return `${book} ${chapter}:${verse}${verseEnd ? `–${verseEnd}` : ''}`
}

// ── Keyword search ─────────────────────────────────────────────

// Lower case, plain quotes, and accents removed, so "jesus" finds "Jesús" and "João".
const normalize = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[’‘]/g, "'").replace(/[“”]/g, '"')

export function searchTerms(query) {
  return normalize(query).split(/\s+/).map(t => t.replace(/[^a-z0-9']/g, '')).filter(t => t.length > 1)
}

const allLoaded = {}
export function loadAllBooks(tr = 'web') {
  if (isOnline(tr)) tr = 'web'
  if (!allLoaded[tr]) {
    allLoaded[tr] = Promise.all(booksOf(tr).map(b => loadBook(b, tr))).catch(err => {
      delete allLoaded[tr]
      throw err
    })
  }
  return allLoaded[tr]
}

// Every verse containing all of the query's words. Returns at most `limit`
// matches plus the full count.
export async function searchBible(query, { limit = 100, testament = 'all', tr = translationId() } = {}) {
  const terms = searchTerms(query)
  if (!terms.length) return { results: [], total: 0 }
  const patterns = terms.map(t => new RegExp(`\\b${t}`, 'i'))
  const books = await loadAllBooks(tr)
  const results = []
  let total = 0
  for (const data of books) {
    if (testament !== 'all' && testamentOf(data.book) !== testament) continue
    data.chapters.forEach((verses, ci) => {
      for (const [verse, text] of verses) {
        const n = normalize(text)
        if (patterns.every(p => p.test(n))) {
          total++
          if (results.length < limit) {
            results.push({ book_name: data.book, chapter: ci + 1, verse, text })
          }
        }
      }
    })
  }
  return { results, total }
}
