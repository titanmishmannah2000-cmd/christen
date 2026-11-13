import { parseReference, formatReference, findBook, ALL_BOOKS } from './bible'

// Every fact in the notes and book cards carries a source marker such as
// [[nabre:genesis/6]] or [[bible:Romans 5:12-19]]. The marker kinds below say
// what each one points to; the reader sees a small number and a Sources list.

const BG = 'https://www.biblegateway.com/resources'
const AQUIFER = 'https://github.com/BibleAquifer'
const bookFile = (ref) => {
  const r = parseReference(ref)
  const book = r?.book || findBook(ref.replace(/\s+[\d:.–-]+$/, ''))
  return { r, file: String(ALL_BOOKS.indexOf(book) + 1).padStart(2, '0') }
}

const KINDS = {
  // Notes of the New American Bible, Revised Edition (US Conference of Catholic Bishops).
  nabre: (path) => {
    const [book, ch] = path.split('/')
    const intro = !ch || ch === '0'
    return {
      title: intro ? 'NABRE introduction' : 'NABRE footnotes',
      detail: intro ? titleCase(book.replace(/^the/, 'the ')) : `${titleCase(book)} ${ch}`,
      by: 'New American Bible, Revised Edition · US Conference of Catholic Bishops',
      url: `https://bible.usccb.org/bible/${book}/${ch || 0}`,
    }
  },
  // Study notes of the Reformation Study Bible (Ligonier Ministries), keyed like Gen.6.2.
  rsb: (ref) => ({
    title: 'Reformation Study Bible, study note',
    detail: ref.replace(/^(\w+)\.(\d+)\.(\d+)$/, '$1 $2:$3'),
    by: 'Ligonier Ministries · on Bible Gateway',
    url: `${BG}/reformation-study-bible/${ref}`,
  }),
  // Articles of the Zondervan Encyclopedia of the Bible, keyed by their page name.
  eob: (page) => ({
    title: 'Encyclopedia of the Bible',
    detail: page.replace(/-/g, ' '),
    by: 'Zondervan · on Bible Gateway',
    url: `${BG}/encyclopedia-of-the-bible/${page}`,
  }),
  // Bible.org articles, keyed by node number; their titles are listed below.
  bo: (node) => ({
    title: BIBLE_ORG[node]?.title || 'Bible.org article',
    detail: BIBLE_ORG[node]?.author,
    by: 'Bible.org',
    url: `https://bible.org/node/${node}`,
  }),
  // Tyndale Open Study Notes (Tyndale House Publishers), as adapted in the open
  // Aquifer Open Study Notes. Keyed by passage, such as Deuteronomy 6:4.
  tosn: (ref) => {
    const { r, file } = bookFile(ref)
    return {
      title: 'Tyndale Open Study Notes',
      detail: r ? formatReference(r) : ref,
      by: 'Tyndale House Publishers · CC BY-SA 4.0',
      url: `${AQUIFER}/AquiferOpenStudyNotes/blob/main/eng/md/${file}.content.md`,
    }
  },
  // Biblica Study Notes (Biblica, publisher of the NIV), keyed by passage.
  bsn: (ref) => {
    const { r, file } = bookFile(ref)
    return {
      title: 'Biblica Study Notes',
      detail: r ? formatReference(r) : ref,
      by: 'Biblica · CC BY-SA 4.0',
      url: `${AQUIFER}/BiblicaStudyNotes/blob/main/eng/md/${file}.content.md`,
    }
  },
  // Tyndale Open Bible Dictionary, keyed by file and article, such as 004:Deuteronomy, Book of.
  tbd: (key) => {
    const [file, ...title] = key.split(':')
    return {
      title: 'Tyndale Open Bible Dictionary',
      detail: title.join(':'),
      by: 'Tyndale House Publishers · CC BY-SA 4.0',
      url: `${AQUIFER}/AquiferOpenBibleDictionary/blob/main/eng/md/${file}.content.md`,
    }
  },
  // Easton's Bible Dictionary (M. G. Easton, 1897), keyed by its page name on Bible Gateway.
  easton: (page) => ({
    title: "Easton’s Bible Dictionary",
    detail: page.replace(/-/g, ' '),
    by: 'Bible Gateway',
    url: `${BG}/eastons-bible-dictionary/${page}`,
  }),
  // Encyclopaedia Britannica, for world history outside the Bible, keyed by its
  // page path and the article's name, such as biography/Confucius:Confucius.
  brit: (key) => {
    const [path, ...title] = key.split(':')
    return { title: 'Encyclopaedia Britannica', detail: title.join(':') || path, by: 'Britannica', url: `https://www.britannica.com/${path}` }
  },
  // Thomas R. Schreiner, The King in His Beauty: A Biblical Theology of the Old
  // and New Testaments (Baker Academic, 2013), keyed by chapter number. Only its
  // ideas are used, summarised in our own words.
  ks: (ch) => ({
    title: 'The King in His Beauty',
    detail: ch === 'prologue' ? 'Prologue' : `ch. ${ch}, ${KING_CHAPTERS[ch] || ''}`.replace(/, $/, ''),
    by: 'Thomas R. Schreiner · Baker Academic, 2013',
  }),
  // Raymond B. Dillard and Tremper Longman III, An Introduction to the Old
  // Testament, 2nd ed. (Zondervan, 2006), keyed by the book's chapter.
  dl: (book) => ({
    title: 'An Introduction to the Old Testament',
    detail: `chapter on ${book}`,
    by: 'Raymond B. Dillard and Tremper Longman III · Zondervan, 2006',
  }),
  // D. A. Carson and Douglas J. Moo, An Introduction to the New Testament,
  // 2nd ed. (Zondervan, 2005), keyed by the book's chapter.
  cm: (book) => ({
    title: 'An Introduction to the New Testament',
    detail: `chapter on ${book}`,
    by: 'D. A. Carson and Douglas J. Moo · Zondervan, 2005',
  }),
  // Vaughan Roberts, God's Big Picture: Tracing the Storyline of the Bible
  // (Inter-Varsity Press, 2002), keyed by chapter number.
  gbp: (ch) => ({
    title: 'God’s Big Picture',
    detail: `ch. ${ch}`,
    by: 'Vaughan Roberts · Inter-Varsity Press, 2002',
  }),
  // A footnote of the World English Bible itself (eBible.org, public domain),
  // keyed by the verse it is on, such as Mark 16:9. It opens that verse.
  webfn: (ref) => {
    const r = parseReference(ref)
    return { title: `World English Bible footnote on ${r ? formatReference(r) : ref}`, by: 'eBible.org · public domain', verse: r }
  },
  // STEPBible data (Tyndale House, Cambridge), keyed by what it shows.
  step: (what) => ({
    title: 'STEPBible data', detail: what, by: 'Tyndale House, Cambridge · CC BY 4.0', url: 'https://github.com/STEPBible/STEPBible-Data',
  }),
  // Other published articles, keyed by a short name; they are listed below.
  ref: (key) => ({ ...(REFS[key] || { title: key }) }),
  // The Bible text itself (World English Bible), which opens in the reader.
  bible: (ref) => {
    const r = parseReference(ref)
    return { title: r ? formatReference(r) : ref, by: 'The Bible (World English Bible)', verse: r }
  },
}

// Bible.org pages used as sources, with the author named on each page.
const BIBLE_ORG = {
  18623: { title: 'Introduction to Genesis', author: 'Tom Hawkins (Th.M., Ph.D., Dallas Theological Seminary)' },
  885: { title: 'An Introduction to Deuteronomy', author: 'David Malick (Th.M., Dallas Theological Seminary)' },
}

// Chapters of The King in His Beauty.
const KING_CHAPTERS = {
  1: 'Genesis', 2: 'Exodus', 3: 'Leviticus', 4: 'Numbers', 5: 'Deuteronomy', 6: 'Joshua', 7: 'Judges', 8: 'Ruth',
  9: '1–2 Samuel', 10: '1–2 Kings', 11: '1–2 Chronicles', 12: 'Ezra-Nehemiah', 13: 'Esther', 14: 'Job', 15: 'Psalms',
  16: 'Proverbs', 17: 'Ecclesiastes', 18: 'Song of Songs', 19: 'Isaiah', 20: 'Jeremiah', 21: 'Lamentations', 22: 'Ezekiel',
  23: 'Daniel', 24: 'The Book of the Twelve', 25: 'Matthew', 26: 'Mark', 27: 'Luke and Acts', 28: 'John and the Johannine Epistles',
  29: 'The Theology of Paul', 30: 'Hebrews', 31: 'James', 32: '1 Peter', 33: '2 Peter and Jude', 34: 'Revelation',
}

// Other articles used as sources, with their author or publisher.
const REFS = {
  'web-preface': {
    title: 'Preface to the World English Bible',
    detail: 'What are MT, TR, and NU?',
    by: 'The World English Bible translators · as published with the WEB',
    url: 'https://www.thewordbooks.com/index.php/product/world-english-bible',
  },
  'esv-exodus-date': {
    title: 'The Date of the Exodus',
    detail: 'ESV Study Bible article',
    by: 'Crossway · on Bible Study Tools',
    url: 'https://biblestudytools.com/commentaries/esv-study-bible/the-date-of-the-exodus.html',
  },
  'vandam-amulets': {
    title: 'A Silver Priestly Blessing',
    detail: 'Cornelis van Dam',
    by: 'Clarion · on Christian Library',
    url: 'https://www.christianstudylibrary.org/node/1238',
  },
  'ewtn-decalogue': {
    title: 'The Division of the Ten Commandments',
    detail: 'James Akin',
    by: 'EWTN Library',
    url: 'https://www.ewtn.com/catholicism/library/division-of-the-ten-commandments-1099',
  },
}

function titleCase(slug) {
  return slug.replace(/^(\d)/, '$1 ').replace(/\b\w/g, c => c.toUpperCase())
}

export function describe(code) {
  const i = code.indexOf(':')
  const kind = KINDS[code.slice(0, i)]
  return kind ? { code, ...kind(code.slice(i + 1)) } : { code, title: code }
}

const MARKER = /\s*\[\[([a-z]+:[^\]]+)\]\]/g

// Splits texts that share one numbered Sources list. Returns, for each text,
// pieces of plain text and { n } citation numbers, plus the list itself.
export function cite(texts) {
  const order = []
  const parts = texts.map(text => {
    if (!text) return []
    const out = []
    let last = 0
    let pending = []
    const flush = () => { if (pending.length) { out.push({ n: pending }); pending = [] } }
    for (const m of text.matchAll(MARKER)) {
      const before = text.slice(last, m.index)
      if (before) { flush(); out.push(before) }
      let n = order.indexOf(m[1])
      if (n < 0) { order.push(m[1]); n = order.length - 1 }
      if (!pending.includes(n + 1)) pending.push(n + 1)
      last = m.index + m[0].length
    }
    flush()
    if (last < text.length) out.push(text.slice(last))
    return out
  })
  return { parts, sources: order.map(describe) }
}

export const hasMarkers = (text) => /\[\[[a-z]+:/.test(text || '')
