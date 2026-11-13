// The World English Bible's own footnotes (public domain), from
// public/footnotes.json, made by scripts/build-footnotes.py. Loaded the first
// time a verse is opened. { book: { "c:v": [[word, note], ...] } }

let all = null
export function loadFootnotes() {
  if (!all) {
    all = fetch(`${import.meta.env.BASE_URL}footnotes.json`)
      .then(res => { if (!res.ok) throw new Error('Could not load footnotes'); return res.json() })
      .catch(err => { all = null; throw err })
  }
  return all
}

export async function footnotesFor(book, chapter, verse) {
  const data = await loadFootnotes()
  return data[book]?.[`${chapter}:${verse}`] || []
}

// The short names the footnotes use for ancient texts, in plain words.
export const TEXT_NAMES = [
  { re: /\bMT\b/, name: 'MT', text: 'the Majority Text, the Greek text this Bible’s New Testament is translated from [[ref:web-preface]].' },
  { re: /\bTR\b/, name: 'TR', text: 'the Textus Receptus (“received text”), the Greek text behind the King James Version’s New Testament [[ref:web-preface]], first printed in the 1500s from a small number of late manuscripts [[tbd:020:Textus Receptus]].' },
  { re: /\bNU\b/, name: 'NU', text: 'the Nestle-Aland and United Bible Societies Greek text, which many other modern Bibles are translated from [[ref:web-preface]].' },
  { re: /\bLXX\b|Septuagint/, name: 'LXX', text: 'the Septuagint, the Greek translation of the Hebrew Scriptures begun in Egypt in the 200s BC, often quoted by the New Testament writers [[tbd:019:Septuagint]].' },
  { re: /Masoretic|traditional Hebrew/, name: 'Masoretic Text', text: 'the traditional Hebrew text of the Old Testament, carefully kept by Jewish scholars between the 500s and 900s AD [[tbd:013:Masoretic Text]].' },
]
