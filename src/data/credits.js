// Who made Christen, and where every part that someone else made comes from,
// with the license each part comes under. The Credits sheet shows this list;
// LICENSE and NOTICE.md at the project root say the same in legal form.

// The copyright holder. Use your full legal name.
export const OWNER = 'Titan'
export const FIRST_YEAR = 2026


// The copyrighted Bibles, read from their publishers' services only when this build has
// a key for them, under each service's terms for free, non-commercial apps.
const HAS_ESV = !!import.meta.env.VITE_ESV_KEY
const HAS_API_BIBLE = !!import.meta.env.VITE_API_BIBLE_KEY
const API_BIBLE = { license: 'Through API.Bible, under its terms', licenseUrl: 'https://api.bible/',
  note: 'Read from API.Bible a chapter at a time. The publisher’s copyright notice is shown under every chapter.' }

const CC_BY_SA = { license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/' }
const OFL = { license: 'SIL Open Font License 1.1', licenseUrl: 'https://openfontlicense.org/' }
const PD = { license: 'Public domain' }
const LINK_ONLY = { license: 'Cited and linked only; no wording copied' }

export const CREDIT_GROUPS = [
  {
    id: 'bible',
    title: 'The Bible text',
    plain: 'In English, every verse you read is the World English Bible, exactly as published. The Spanish, French and Portuguese Bibles are old public-domain or openly licensed texts. Anyone may use these texts freely.',
    items: [
      { name: 'World English Bible', by: 'eBible.org', url: 'https://ebible.org/web/', ...PD, licenseUrl: 'https://ebible.org/web/copyright.htm',
        note: '“World English Bible” is a trademark of eBible.org. Christen shows the text unchanged, so it keeps the name.' },
      { name: 'Translators’ footnotes', by: 'The World English Bible, eBible.org', ...PD },
      { name: 'La Santa Biblia, Reina-Valera 1865, with modern spelling (Spanish)', by: 'Text from the scrollmapper bible_databases project', url: 'https://github.com/scrollmapper/bible_databases', ...PD,
        note: 'Lined up verse by verse with the English: four verses that the edition joins are split again, and the later notes on where each letter was written are left out.' },
      { name: 'La Sainte Bible, Louis Segond 1910 (French)', by: 'Text from the Beblia Holy Bible XML project', url: 'https://github.com/Beblia/Holy-Bible-XML-Format', ...PD },
      { name: 'Bíblia Livre (Portuguese)', by: 'Text from the scrollmapper bible_databases project', url: 'https://github.com/scrollmapper/bible_databases',
        license: 'CC BY 3.0 Brazil', licenseUrl: 'https://creativecommons.org/licenses/by/3.0/br/',
        note: 'Changed for Christen: lined up verse by verse with the English (Psalm 46:2–3 split, Revelation 12:18 joined to 13:1), and the later notes on where letters were written left out.' },
      { name: 'Biblica® Open Urdu Contemporary Version (Urdu)', by: 'Copyright © 1999, 2005, 2022, 2024 Biblica, Inc.; text from eBible.org. The original work is available for free at www.biblica.com and open.bible', url: 'https://open.bible/',
        license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
        note: 'Changed for Christen: shown verse by verse beside the English, with the psalm titles kept; section headings and footnotes are left out. The words themselves are unchanged.' },
      { name: 'Douay-Rheims Bible, Challoner revision (Catholic, 73 books)', by: 'Text from the scrollmapper bible_databases project', url: 'https://github.com/scrollmapper/bible_databases', ...PD,
        note: 'Lined up with the English verse by verse: each verse keeps the number the Douay-Rheims gives it, shown beside it, so the notes still sit by the right verse. Psalms follow the Latin numbering, and the longer Esther and Daniel are kept whole.' },
      ...(HAS_ESV ? [{ name: 'English Standard Version (ESV)', by: 'Crossway, a publishing ministry of Good News Publishers', url: 'https://www.esv.org/',
        license: 'Through the ESV API, under Crossway’s terms', licenseUrl: 'https://api.esv.org/',
        note: 'Scripture quotations are from the ESV® Bible (The Holy Bible, English Standard Version®), © 2001 by Crossway, a publishing ministry of Good News Publishers. Used by permission. All rights reserved. Read from api.esv.org a chapter at a time; at most 500 verses are kept on the device.' }] : []),
      ...(HAS_API_BIBLE && import.meta.env.VITE_API_BIBLE_NASB_ID ? [{ name: 'New American Standard Bible (NASB)', by: 'The Lockman Foundation', url: 'https://www.lockman.org/', ...API_BIBLE }] : []),
      ...(HAS_API_BIBLE ? [{ name: 'Christian Standard Bible (CSB)', by: 'Holman Bible Publishers', url: 'https://csbible.com/', ...API_BIBLE }] : []),
      ...(HAS_API_BIBLE ? [{ name: 'Good News Translation (GNT), US Version, with the Deuterocanonical books', by: 'American Bible Society', url: 'https://www.americanbible.org/', ...API_BIBLE }] : []),
      { name: 'Hebrew and Greek words in the glossary', by: 'The original languages of the Bible', ...PD },
      { name: 'Hebrew and Greek words under each verse, with grammar and short dictionaries (TAHOT, TAGNT, TBESH, TBESG)', by: 'STEPBible.org, Tyndale House, Cambridge', url: 'https://github.com/STEPBible/STEPBible-Data',
        license: 'CC BY 4.0', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
        note: 'Changed for Christen: arranged verse by verse, Greek words kept as in the Byzantine text the World English Bible follows, long dictionary entries shortened, and grammar codes put into plain words.' },
    ],
  },
  {
    id: 'notes',
    title: 'Notes, summaries and book cards',
    plain: 'The chapter summaries, notes, book cards, glossary, stories, reading paths and painting guides were written for Christen. Each fact in them points to the source below that it comes from. Open study notes are free to use under their license; the other works are only cited and linked, never copied.',
    items: [
      { name: 'Tyndale Open Study Notes', by: 'Tyndale House Publishers, via BibleAquifer', url: 'https://github.com/BibleAquifer/AquiferOpenStudyNotes', ...CC_BY_SA },
      { name: 'Tyndale Open Bible Dictionary', by: 'Tyndale House Publishers, via BibleAquifer', url: 'https://github.com/BibleAquifer/AquiferOpenBibleDictionary', ...CC_BY_SA },
      { name: 'Biblica Study Notes', by: 'Biblica, via BibleAquifer', url: 'https://github.com/BibleAquifer/BiblicaStudyNotes', ...CC_BY_SA },
      { name: 'New American Bible, Revised Edition: introductions and footnotes', by: 'US Conference of Catholic Bishops', url: 'https://bible.usccb.org/bible', ...LINK_ONLY },
      { name: 'Reformation Study Bible', by: 'Ligonier Ministries, on Bible Gateway', url: 'https://www.biblegateway.com/resources/reformation-study-bible/', ...LINK_ONLY },
      { name: 'Encyclopedia of the Bible', by: 'Zondervan, on Bible Gateway', url: 'https://www.biblegateway.com/resources/encyclopedia-of-the-bible/', ...LINK_ONLY },
      { name: 'Easton’s Bible Dictionary (1897)', by: 'M. G. Easton, on Bible Gateway', url: 'https://www.biblegateway.com/resources/eastons-bible-dictionary/', ...PD },
      { name: 'Encyclopaedia Britannica (world history on the Timeline)', by: 'Encyclopædia Britannica, Inc.', url: 'https://www.britannica.com/', ...LINK_ONLY },
      { name: 'Bible.org articles', by: 'Tom Hawkins; David Malick', url: 'https://bible.org/', ...LINK_ONLY },
      { name: 'Other articles', by: 'Crossway (ESV Study Bible); Cornelis van Dam (Clarion); James Akin (EWTN)', ...LINK_ONLY },
    ],
  },
  {
    id: 'threads',
    title: 'Threads (cross-references)',
    plain: 'The links between verses come from OpenBible.info, which gathered them from the Treasury of Scripture Knowledge and ranks them by readers’ votes. Christen keeps the strongest links for each verse.',
    items: [
      { name: 'Bible cross-references', by: 'OpenBible.info', url: 'https://www.openbible.info/labs/cross-references/',
        license: 'Creative Commons Attribution (CC BY)', licenseUrl: 'https://www.openbible.info/labs/cross-references/' },
      { name: 'Treasury of Scripture Knowledge', by: 'A 19th-century reference work', ...PD },
    ],
  },
  {
    id: 'parallels',
    title: 'Compare the accounts (parallel passages)',
    plain: 'Which passages tell the same event comes from two harmonies written by Christian scholars: A. T. Robertson for the Gospels, and W. D. Crockett for Samuel, Kings and Chronicles. Every reference was checked against the World English Bible. The short titles are our own wording.',
    items: [
      { name: 'A Harmony of the Gospels for Students of the Life of Christ (1922)', by: 'A. T. Robertson', url: 'https://gutenberg.org/ebooks/36264', ...PD },
      { name: 'A Harmony of the Books of Samuel, Kings, and Chronicles (1897)', by: 'William Day Crockett', url: 'https://www.swartzentrover.com/cotor/E-Books/christ/Crockett/HSKC_TOC.htm', ...PD },
    ],
  },
  {
    id: 'maps',
    title: 'Maps',
    plain: 'The Engraved map and the small maps in the Timeline are drawn by Christen from free public map data. The other map views show map pictures from Esri, which are credited under the map whenever you use them. The journeys and their stop notes were written for Christen.',
    items: [
      { name: 'Natural Earth coastlines, lakes and rivers', by: 'Natural Earth', url: 'https://www.naturalearthdata.com/', ...PD, licenseUrl: 'https://www.naturalearthdata.com/about/terms-of-use/' },
      { name: 'World outline for the Timeline’s event maps', by: 'world-atlas, © 2013–2019 Michael Bostock, from Natural Earth', url: 'https://github.com/topojson/world-atlas',
        license: 'ISC', licenseUrl: 'https://github.com/topojson/world-atlas/blob/master/LICENSE.md' },
      { name: 'Terrain, Satellite, Street and Antique map pictures', by: 'Esri and its data partners (Maxar, HERE, Garmin, US National Park Service, OpenStreetMap contributors and others)',
        url: 'https://www.esri.com/', license: 'Esri terms of use and attribution rules', licenseUrl: 'https://developers.arcgis.com/documentation/esri-and-data-attribution/' },
      { name: 'OpenStreetMap data inside the Street view', by: 'OpenStreetMap contributors', url: 'https://www.openstreetmap.org/copyright',
        license: 'ODbL 1.0', licenseUrl: 'https://opendatacommons.org/licenses/odbl/' },
    ],
  },
  {
    id: 'fonts',
    title: 'Lettering',
    plain: 'The typefaces are free fonts. Their license lets any app use them.',
    items: [
      { name: 'Newsreader', by: 'Production Type', url: 'https://fonts.google.com/specimen/Newsreader', ...OFL },
      { name: 'Red Hat Mono', by: 'MCKL for Red Hat', url: 'https://fonts.google.com/specimen/Red+Hat+Mono', ...OFL },
      { name: 'Frank Ruhl Libre (Hebrew)', by: 'Yanek Iontef, after Rafael Frank', url: 'https://fonts.google.com/specimen/Frank+Ruhl+Libre', ...OFL },
    ],
  },
  {
    id: 'software',
    title: 'Software Christen is built with',
    plain: 'Christen uses free open-source building blocks. Their licenses allow this as long as their notices travel with the app; the full text of every one is in the notices file linked below.',
    items: [
      { name: 'React and React Router', by: 'Meta and contributors; Remix Software', url: 'https://react.dev/', license: 'MIT' },
      { name: 'Motion (framer-motion)', by: 'Matt Perry', url: 'https://motion.dev/', license: 'MIT' },
      { name: 'MapLibre GL JS', by: 'MapLibre contributors', url: 'https://maplibre.org/', license: 'BSD 3-Clause' },
      { name: 'OpenSeadragon (painting zoom)', by: 'OpenSeadragon contributors', url: 'https://openseadragon.github.io/', license: 'BSD 3-Clause' },
      { name: 'ts-fsrs (By heart practice timing)', by: 'Open Spaced Repetition', url: 'https://github.com/open-spaced-repetition/ts-fsrs', license: 'MIT' },
      { name: 'Turf (route distances)', by: 'Turf authors', url: 'https://turfjs.org/', license: 'MIT' },
      { name: 'Rough Notation (hand-drawn marks)', by: 'Preet Shihn', url: 'https://roughnotation.com/', license: 'MIT' },
    ],
  },
  {
    id: 'sound',
    title: 'Sound',
    plain: 'The ambient soundscapes are not recordings. Christen makes them in your browser as you listen.',
    items: [],
  },
]

export const COMMONS_PAGE = (file) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(file)}`
