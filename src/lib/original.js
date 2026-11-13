import { ALL_BOOKS, bookFileSlug, loadBook } from './bible'
import { VERSE_COUNTS } from '../data/verseCounts'

// The Hebrew and Greek words behind each verse, from STEPBible (CC BY 4.0).
// public/original/ is made by scripts/build-original.py. Every file is fetched
// only when someone opens the original words, then kept for the session.

const BASE = `${import.meta.env.BASE_URL}original/`
const cache = {}
function once(key, url) {
  if (!cache[key]) {
    cache[key] = fetch(url)
      .then(res => { if (!res.ok) throw new Error(`Could not load ${url}`); return res.json() })
      .catch(err => { delete cache[key]; throw err })
  }
  return cache[key]
}

export const langOf = (book) => (ALL_BOOKS.indexOf(book) < 39 ? 'he' : 'el')
export const LANG_NAME = { he: 'Hebrew', el: 'Greek' }
// Daniel 2:4b–7:28, Ezra 4:8–6:18 and 7:12–26, and Jeremiah 10:11 are in Aramaic;
// those words carry an "A" grammar code.
export const isAramaic = (word) => word[4]?.[0] === 'A'

// The words of one verse: [word, sounds like, meaning here, number, grammar].
export async function originalVerse(book, chapter, verse) {
  const data = await once(`b:${book}`, `${BASE}${bookFileSlug(book)}.json`)
  return data.chapters[chapter - 1]?.[verse] || []
}

// number -> [dictionary form, sounds like, short meaning, times used]
export const loadWords = (lang) => once(`w:${lang}`, `${BASE}words-${lang}.json`)

export async function lookUp(number) {
  const lang = number[0] === 'H' ? 'he' : 'el'
  const words = await loadWords(lang)
  const [lemma, sound, meaning, times] = words[number] || ['', '', '', 0]
  return { number, lang, lemma, sound, meaning, times }
}

export async function definition(number) {
  const lang = number[0] === 'H' ? 'he' : 'el'
  const shard = Math.floor(Number(number.slice(1, 5)) / 250)
  try {
    const defs = await once(`d:${lang}-${shard}`, `${BASE}defs/${lang}-${shard}.json`)
    return defs[number] || ''
  } catch {
    return ''
  }
}

// ── Find every place a word is used ────────────────────────────

let verseOrder = null
function refAt(n) {
  if (!verseOrder) {
    verseOrder = []
    for (const book of ALL_BOOKS) {
      VERSE_COUNTS[book].forEach((count, ci) => {
        for (let v = 1; v <= count; v++) verseOrder.push([book, ci + 1, v])
      })
    }
  }
  return verseOrder[n]
}

// "H430", "h0430", "G26" or "G0026G" -> a canonical number prefix, or null.
export function parseNumber(query) {
  const m = query.trim().match(/^(?:strong'?s?\s*)?([HhGg])\s*0*(\d{1,4})([A-Za-z])?$/)
  if (!m) return null
  return `${m[1].toUpperCase()}${m[2].padStart(4, '0')}${m[3] ? m[3].toUpperCase() : ''}`
}

const plain = (s) => s.normalize('NFD').replace(/[̀-֑ͯ-ׇ]/g, '').replace(/[^\p{L}]/gu, '').toLowerCase()
export const hasOriginalLetters = (s) => /[Ͱ-Ͽἀ-῿֐-׿]/.test(s)

// Dictionary words whose form matches typed Hebrew or Greek letters.
export async function findLemma(query) {
  const lang = /[֐-׿]/.test(query) ? 'he' : 'el'
  const q = plain(query)
  if (!q) return []
  const words = await loadWords(lang)
  const found = []
  for (const [number, [lemma, sound, meaning, times]] of Object.entries(words)) {
    const p = plain(lemma)
    if (p === q || p.startsWith(q)) found.push({ number, lemma, sound, meaning, times, exact: p === q })
  }
  return found.sort((a, b) => b.exact - a.exact || b.times - a.times).slice(0, 12)
}

// Every verse that uses the word (or, for a plain number like H0430, every
// meaning filed under it), with the World English Bible text.
export async function versesUsing(number, { limit = 300 } = {}) {
  const lang = number[0] === 'H' ? 'he' : 'el'
  const [where, words] = await Promise.all([once(`r:${lang}`, `${BASE}where-${lang}.json`), loadWords(lang)])
  const keys = Object.keys(where).filter(k => (number.length > 5 ? k === number : k.slice(0, 5) === number))
  const seen = new Set()
  for (const key of keys) {
    let n = 0
    for (const gap of where[key].split(',')) { n += parseInt(gap, 36); seen.add(n) }
  }
  const order = [...seen].sort((a, b) => a - b)
  const refs = order.slice(0, limit).map(refAt).filter(Boolean)
  const books = {}
  await Promise.all([...new Set(refs.map(r => r[0]))].map(async b => { books[b] = await loadBook(b) }))
  return {
    words: keys.map(k => ({ number: k, lemma: words[k]?.[0] || '', sound: words[k]?.[1] || '', meaning: words[k]?.[2] || '' })),
    total: order.length,
    results: refs.map(([book, chapter, verse]) => ({
      book_name: book, chapter, verse, text: books[book].chapters[chapter - 1]?.[verse - 1]?.[1] || '',
    })),
  }
}

// ── Grammar in plain words ─────────────────────────────────────
// Hebrew codes follow the Open Scriptures Hebrew Bible scheme; Greek codes follow
// Robinson's. Both are as STEPBible gives them.

const HEB_STEM = {
  q: ['Qal', 'the plain form'], N: ['Niphal', 'done to oneself, or done to'], p: ['Piel', 'done with force or on purpose'],
  P: ['Pual', 'done with force, to someone'], h: ['Hiphil', 'makes it happen'], H: ['Hophal', 'is made to happen'],
  t: ['Hithpael', 'done to or for oneself'], o: ['Polel', 'done with force'], O: ['Polal', 'done with force, to someone'],
  r: ['Hithpolel', 'done to or for oneself'], m: ['Poel', 'done with force'], M: ['Poal', 'done with force, to someone'],
  k: ['Palel', 'done with force'], K: ['Pulal', 'done with force, to someone'], Q: ['Qal passive', 'done to someone'],
  l: ['Pilpel', 'done again and again'], L: ['Polpal', 'done again and again, to someone'], f: ['Hithpalpel', 'done again and again, to oneself'],
  D: ['Nithpael', 'done to oneself'], j: ['Pealal', 'done with force'], i: ['Pilel', 'done with force'],
  u: ['Hothpaal', 'done to oneself'], c: ['Tiphil', 'makes it happen'], v: ['Hishtaphel', 'bows oneself down'],
  w: ['Nithpalel', 'done to oneself'], y: ['Nithpoel', 'done to oneself'], z: ['Hithpoel', 'done to or for oneself'],
}
const ARAM_STEM = {
  q: ['Peal', 'the plain form'], Q: ['Peil', 'done to someone'], u: ['Hithpeel', 'done to oneself, or done to'],
  p: ['Pael', 'done with force or on purpose'], P: ['Ithpaal', 'done with force, to oneself'], M: ['Hithpaal', 'done with force, to oneself'],
  a: ['Aphel', 'makes it happen'], h: ['Haphel', 'makes it happen'], s: ['Saphel', 'makes it happen'], e: ['Shaphel', 'makes it happen'],
  H: ['Hophal', 'is made to happen'], i: ['Ithpeel', 'done to oneself, or done to'], t: ['Hishtaphel', 'done to oneself'],
  v: ['Ishtaphel', 'done to oneself'], w: ['Hithaphel', 'done to oneself'], o: ['Polel', 'done with force'], z: ['Ithpoel', 'done to oneself'],
  r: ['Hithpolel', 'done to oneself'], f: ['Hithpalpel', 'done to oneself'], b: ['Hephal', 'is made to happen'], c: ['Tiphel', 'makes it happen'],
  m: ['Poel', 'done with force'], l: ['Palpel', 'done again and again'], L: ['Ithpalpel', 'done again and again, to oneself'],
  O: ['Ithpolel', 'done to oneself'], G: ['Ittaphal', 'is made to happen'],
}
const HEB_FORM = {
  p: 'a finished action (perfect)', q: 'a finished action joined by “and” (sequential perfect)',
  i: 'an unfinished or future action (imperfect)', w: 'the next step in a story (sequential imperfect)',
  h: 'a wish: “let me” or “let us” (cohortative)', j: 'a wish: “let him” or “may it” (jussive)', v: 'a command (imperative)',
  r: 'someone doing it (active participle)', s: 'something it is done to (passive participle)',
  a: 'the action itself, often for emphasis (infinitive absolute)', c: 'the action as a noun: “to …” (infinitive)',
}
const GENDER = { m: 'masculine', f: 'feminine', c: 'either gender', b: 'either gender' }
const NUMBER = { s: 'one', p: 'more than one', d: 'two (dual)' }
const STATE = { a: '', c: '“of” form (construct)', d: 'with “the”' }
const WHO = {
  '1cs': 'I', '1cp': 'we', '2ms': 'you (a man)', '2fs': 'you (a woman)', '2mp': 'you (men, or all)', '2fp': 'you (women)',
  '3ms': 'he', '3fs': 'she', '3mp': 'they (men, or all)', '3fp': 'they (women)', '3cp': 'they', '2cp': 'you all', '1bs': 'I', '3cs': 'he or she',
}
const HEB_POS = {
  A: 'describing word (adjective)', C: 'joining word (conjunction)', D: 'adverb', N: 'noun', P: 'pronoun', R: 'preposition',
  S: 'ending', T: 'small word (particle)', V: 'verb',
}
const HEB_PARTICLE = {
  a: 'affirming', d: 'the word “the”', e: 'urging', i: 'asking', j: 'exclaiming', m: 'pointing', n: 'saying no', o: 'marks what the verb acts on', r: 'relative',
}

function hebrew(code) {
  const aramaic = code[0] === 'A'
  const c = code.slice(1)
  const pos = c[0]
  const parts = []
  if (pos === 'V') {
    const [name, sense] = (aramaic ? ARAM_STEM : HEB_STEM)[c[1]] || ['', '']
    parts.push('Verb')
    if (name) parts.push(`${name} stem: ${sense}`)
    if (HEB_FORM[c[2]]) parts.push(HEB_FORM[c[2]])
    const rest = c.slice(3)
    if (/^[123]/.test(rest)) { if (WHO[rest]) parts.push(WHO[rest]) }
    else if (rest) {
      const bits = [GENDER[rest[0]], NUMBER[rest[1]], STATE[rest[2]]].filter(Boolean)
      if (bits.length) parts.push(bits.join(', '))
    }
  } else if (pos === 'N' || pos === 'A') {
    parts.push(c[1] === 'p' ? 'Name' : c[1] === 'g' ? 'Name of a people' : pos === 'A' && c[1] === 'c' ? 'Number' : pos === 'A' && c[1] === 'o' ? 'Number in order (first, second…)' : HEB_POS[pos][0].toUpperCase() + HEB_POS[pos].slice(1))
    const bits = [GENDER[c[2]], NUMBER[c[3]], STATE[c[4]]].filter(Boolean)
    if (bits.length) parts.push(bits.join(', '))
  } else if (pos === 'T') {
    parts.push(`Small word${HEB_PARTICLE[c[1]] ? `: ${HEB_PARTICLE[c[1]]}` : ''}`)
  } else if (pos === 'P') {
    parts.push('Pronoun')
    if (WHO[c.slice(2)]) parts.push(WHO[c.slice(2)])
  } else if (HEB_POS[pos]) {
    parts.push(HEB_POS[pos][0].toUpperCase() + HEB_POS[pos].slice(1))
  }
  if (aramaic) parts.push('Aramaic')
  return parts
}

const G_TENSE = { P: 'present', I: 'imperfect', F: 'future', A: 'aorist', R: 'perfect', L: 'pluperfect', '2A': 'aorist', '2F': 'future', '2R': 'perfect', '2L': 'pluperfect' }
const G_TENSE_SENSE = {
  present: 'happening now or going on', imperfect: 'was going on', future: 'will happen', aorist: 'happened, seen as a whole',
  perfect: 'done, and still in effect', pluperfect: 'had been done',
}
const G_VOICE = { A: 'active', M: 'middle (for oneself)', P: 'passive (done to)', E: 'middle or passive', D: 'middle', O: 'passive', N: 'middle or passive' }
const G_MOOD = { I: 'a statement', S: 'what may or should happen (subjunctive)', O: 'a wish (optative)', M: 'a command', N: '“to …” (infinitive)', P: 'a participle (“-ing”)' }
const G_CASE = { N: 'subject', G: '“of” (genitive)', D: '“to/for/in” (dative)', A: 'object', V: 'calling out to (vocative)' }
const G_NUM = { S: 'one', P: 'more than one' }
const G_GEN = { M: 'masculine', F: 'feminine', N: 'neuter' }
const G_POS = {
  N: 'Noun', A: 'Describing word (adjective)', T: 'The word “the”', P: 'Pronoun', R: 'Relative pronoun (“who, which”)',
  D: 'Pointing word (“this, that”)', S: 'Possessive (“my, your”)', F: 'Pronoun (“himself”)', C: 'Pronoun (“one another”)',
  X: 'Pronoun (“someone, anything”)', I: 'Question word', Q: 'Pronoun', K: 'Pronoun', ADV: 'Adverb', CONJ: 'Joining word (conjunction)',
  PREP: 'Preposition', PRT: 'Small word (particle)', INJ: 'Exclamation', COND: 'Joining word (“if”)', HEB: 'Hebrew word', ARAM: 'Aramaic word',
}

function caseBits(s) {
  if (!s) return []
  if (/^PRI|^LI|^NUI|^OI/.test(s)) return ['does not change its ending']
  const [cs, n, g] = s
  return [[G_CASE[cs], G_NUM[n], G_GEN[g]].filter(Boolean).join(', ')]
}

function greek(code) {
  const segs = code.split('-')
  const head = segs[0]
  if (head === 'V') {
    const m = segs[1]?.match(/^(2?[PIFARL])([AMPEDON])([ISOMNP])$/)
    const parts = ['Verb']
    if (m) {
      const tense = G_TENSE[m[1]]
      parts.push(`${tense}: ${G_TENSE_SENSE[tense]}`, G_VOICE[m[2]], G_MOOD[m[3]])
      const rest = segs[2]
      if (rest && /^[123]/.test(rest)) parts.push(`${{ 1: 'I/we', 2: 'you', 3: 'he/she/it/they' }[rest[0]]}, ${G_NUM[rest[1]]}`)
      else if (rest) parts.push(...caseBits(rest))
    }
    return parts.filter(Boolean)
  }
  if (head === 'P' && /^[123]/.test(segs[1] || '')) {
    const s = segs[1]
    return ['Pronoun', `${{ 1: 'I/we', 2: 'you', 3: 'he/she/it' }[s[0]]}`, ...caseBits(s.slice(1))]
  }
  const name = G_POS[head]
  const parts = [name || head]
  if (segs[1]) parts.push(...caseBits(segs[1]))
  if (segs[2] === 'P') parts[0] = 'Name'
  if (segs[2] === 'T') parts.push('a title')
  return parts.filter(Boolean)
}

// The grammar of one word as a few plain phrases.
export function grammar(code, lang) {
  if (!code) return []
  try { return lang === 'he' ? hebrew(code) : greek(code) } catch { return [] }
}
