import { toast } from '../lib/prefs'
import { ALL_BOOKS } from '../lib/bible'
import { TRANSLATIONS, bookNameIn, useTranslationId } from '../lib/translations'
import { useT } from '../lib/i18n'

// Ready-made citations of a verse in the Bible text being read, for essays,
// sermons and papers. Book abbreviations follow each style's own list.
const SBL = {
  Genesis: 'Gen', Exodus: 'Exod', Leviticus: 'Lev', Numbers: 'Num', Deuteronomy: 'Deut', Joshua: 'Josh', Judges: 'Judg',
  Ruth: 'Ruth', '1 Samuel': '1 Sam', '2 Samuel': '2 Sam', '1 Kings': '1 Kgs', '2 Kings': '2 Kgs', '1 Chronicles': '1 Chr',
  '2 Chronicles': '2 Chr', Ezra: 'Ezra', Nehemiah: 'Neh', Esther: 'Esth', Job: 'Job', Psalms: 'Ps', Proverbs: 'Prov',
  Ecclesiastes: 'Eccl', 'Song of Solomon': 'Song', Isaiah: 'Isa', Jeremiah: 'Jer', Lamentations: 'Lam', Ezekiel: 'Ezek',
  Daniel: 'Dan', Hosea: 'Hos', Joel: 'Joel', Amos: 'Amos', Obadiah: 'Obad', Jonah: 'Jonah', Micah: 'Mic', Nahum: 'Nah',
  Habakkuk: 'Hab', Zephaniah: 'Zeph', Haggai: 'Hag', Zechariah: 'Zech', Malachi: 'Mal', Matthew: 'Matt', Mark: 'Mark',
  Luke: 'Luke', John: 'John', Acts: 'Acts', Romans: 'Rom', '1 Corinthians': '1 Cor', '2 Corinthians': '2 Cor',
  Galatians: 'Gal', Ephesians: 'Eph', Philippians: 'Phil', Colossians: 'Col', '1 Thessalonians': '1 Thess',
  '2 Thessalonians': '2 Thess', '1 Timothy': '1 Tim', '2 Timothy': '2 Tim', Titus: 'Titus', Philemon: 'Phlm',
  Hebrews: 'Heb', James: 'Jas', '1 Peter': '1 Pet', '2 Peter': '2 Pet', '1 John': '1 John', '2 John': '2 John',
  '3 John': '3 John', Jude: 'Jude', Revelation: 'Rev',
  Tobit: 'Tob', Judith: 'Jdt', Wisdom: 'Wis', Sirach: 'Sir', Baruch: 'Bar', '1 Maccabees': '1 Macc', '2 Maccabees': '2 Macc',
}
const CHICAGO = {
  Genesis: 'Gen.', Exodus: 'Exod.', Leviticus: 'Lev.', Numbers: 'Num.', Deuteronomy: 'Deut.', Joshua: 'Josh.', Judges: 'Judg.',
  Ruth: 'Ruth', '1 Samuel': '1 Sam.', '2 Samuel': '2 Sam.', '1 Kings': '1 Kings', '2 Kings': '2 Kings', '1 Chronicles': '1 Chron.',
  '2 Chronicles': '2 Chron.', Ezra: 'Ezra', Nehemiah: 'Neh.', Esther: 'Esther', Job: 'Job', Psalms: 'Ps.', Proverbs: 'Prov.',
  Ecclesiastes: 'Eccles.', 'Song of Solomon': 'Song of Sol.', Isaiah: 'Isa.', Jeremiah: 'Jer.', Lamentations: 'Lam.',
  Ezekiel: 'Ezek.', Daniel: 'Dan.', Hosea: 'Hosea', Joel: 'Joel', Amos: 'Amos', Obadiah: 'Obad.', Jonah: 'Jon.', Micah: 'Mic.',
  Nahum: 'Nah.', Habakkuk: 'Hab.', Zephaniah: 'Zeph.', Haggai: 'Hag.', Zechariah: 'Zech.', Malachi: 'Mal.', Matthew: 'Matt.',
  Mark: 'Mark', Luke: 'Luke', John: 'John', Acts: 'Acts', Romans: 'Rom.', '1 Corinthians': '1 Cor.', '2 Corinthians': '2 Cor.',
  Galatians: 'Gal.', Ephesians: 'Eph.', Philippians: 'Phil.', Colossians: 'Col.', '1 Thessalonians': '1 Thess.',
  '2 Thessalonians': '2 Thess.', '1 Timothy': '1 Tim.', '2 Timothy': '2 Tim.', Titus: 'Titus', Philemon: 'Philem.',
  Hebrews: 'Heb.', James: 'James', '1 Peter': '1 Pet.', '2 Peter': '2 Pet.', '1 John': '1 John', '2 John': '2 John',
  '3 John': '3 John', Jude: 'Jude', Revelation: 'Rev.',
  Tobit: 'Tob.', Judith: 'Jth.', Wisdom: 'Wisd. of Sol.', Sirach: 'Ecclus.', Baruch: 'Bar.', '1 Maccabees': '1 Macc.', '2 Maccabees': '2 Macc.',
}

// Where each of the other Bible texts comes from, for a reference list:
// [publisher or source, year or null, address].
const TEXT_SOURCE = {
  esv: ['Crossway', '2001', 'https://www.esv.org/'],
  nasb: ['The Lockman Foundation', null, 'https://www.lockman.org/'],
  csb: ['Holman Bible Publishers', '2017', 'https://csbible.com/'],
  dra: ['scrollmapper bible_databases', null, 'https://github.com/scrollmapper/bible_databases'],
  es: ['scrollmapper bible_databases', null, 'https://github.com/scrollmapper/bible_databases'],
  fr: ['Beblia Holy Bible XML', null, 'https://github.com/Beblia/Holy-Bible-XML-Format'],
  pt: ['scrollmapper bible_databases', null, 'https://github.com/scrollmapper/bible_databases'],
}

function citations(book, chapter, verse, textId, numbered) {
  const at = numbered || `${chapter}:${verse}`
  const full = book === 'Psalms' ? 'Psalm' : book
  if (textId !== 'web') {
    // Another Bible is cited with its own title, and in another language with its own book name.
    const { name, short, lang } = TRANSLATIONS[textId]
    const english = lang === 'en'
    const local = english ? full : bookNameIn(textId, book, ALL_BOOKS)
    const [site, year, url] = TEXT_SOURCE[textId]
    return [
      { style: 'SBL', how: 'In the text', text: `(${english ? SBL[book] || book : local} ${at} ${short})` },
      { style: 'Chicago', how: 'In a note', text: `${english ? CHICAGO[book] || book : local} ${at} (${name}).` },
      { style: 'APA', how: 'In the text', text: `(${local} ${at}, ${name})` },
      { style: 'APA', how: 'In the reference list', text: `${name}. (${year || 'n.d.'}). ${site}. ${url}` },
    ]
  }
  return [
    { style: 'SBL', how: 'In the text', text: `(${SBL[book]} ${at} WEB)` },
    { style: 'Chicago', how: 'In a note', text: `${CHICAGO[book]} ${at} (World English Bible).` },
    { style: 'APA', how: 'In the text', text: `(${full} ${at}, World English Bible)` },
    { style: 'APA', how: 'In the reference list', text: 'World English Bible. (n.d.). eBible.org. https://ebible.org/web/' },
  ]
}

export default function CitePanel({ book, chapter, verse, at }) {
  const t = useT()
  const textId = useTranslationId()
  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); toast(t('Citation copied')) } catch { toast(t('Copying is blocked in this browser')) }
  }
  return (
    <div className="cite-panel">
      <div className="eyebrow">{t('Cite this verse')}</div>
      <p className="original-help">{t('For an essay, sermon or paper. Check the exact rules your school or publisher asks for.')}</p>
      {citations(book, chapter, verse, textId, at).map((c, i) => (
        <div key={i} className="cite-row">
          <span className="cite-style">{c.style} <i>{t(c.how)}</i></span>
          <code>{c.text}</code>
          <button type="button" className="link-btn" onClick={() => copy(c.text)} aria-label={t('Copy the {style} citation, {how}', { style: c.style, how: t(c.how).toLowerCase() })}>{t('Copy')}</button>
        </div>
      ))}
    </div>
  )
}
