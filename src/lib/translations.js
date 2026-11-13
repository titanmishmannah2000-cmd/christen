import { useSyncExternalStore } from 'react'
import { storage } from './prefs'

// The Bible texts the reader can show. English (the World English Bible) is the
// one every note, word study and connection is written against; the others are
// public-domain or openly licensed texts lined up verse by verse with it
// (scripts/build-translations.py), so the notes still sit beside the right verse.
// The copyrighted Bibles (ESV, NASB, CSB, GNT) are never stored with the app: they are
// `online` texts, read from the publisher's own service each time (see lib/online.js) and need the internet.
// `catholic` texts carry the 73 books of Catholic Bibles (see data/books.js).
export const TRANSLATIONS = {
  web: { id: 'web', lang: 'en', language: 'English', name: 'World English Bible', short: 'WEB', dir: 'bible' },
  // From api.esv.org (Crossway), under the ESV API's terms for free, non-commercial apps.
  esv: { id: 'esv', lang: 'en', language: 'English', name: 'English Standard Version', short: 'ESV', online: 'esv' },
  // From API.Bible, under its terms (Starter plan, non-commercial).
  nasb: { id: 'nasb', lang: 'en', language: 'English', name: 'New American Standard Bible', short: 'NASB', online: 'apibible', abbr: 'NASB' },
  csb: { id: 'csb', lang: 'en', language: 'English', name: 'Christian Standard Bible', short: 'CSB', online: 'apibible', abbr: 'CSB' },
  // The Good News Translation (US Version) with the Deuterocanonical books, from the
  // American Bible Society through API.Bible.
  gnb: { id: 'gnb', lang: 'en', language: 'English', name: 'Good News Translation', short: 'GNT', online: 'apibible', abbr: 'GNTD', catholic: true },
  dra: { id: 'dra', lang: 'en', language: 'English', name: 'Douay-Rheims Bible', short: 'DRA', dir: 'bible-dra', catholic: true },
  es: { id: 'es', lang: 'es', language: 'Español', name: 'Reina-Valera 1865', short: 'RV1865', dir: 'bible-es' },
  fr: { id: 'fr', lang: 'fr', language: 'Français', name: 'Louis Segond 1910', short: 'LSG', dir: 'bible-fr' },
  pt: { id: 'pt', lang: 'pt', language: 'Português', name: 'Bíblia Livre', short: 'BLIVRE', dir: 'bible-pt' },
  ur: { id: 'ur', lang: 'ur', language: 'اردو', name: 'اردو ہم عصر ترجمہ', short: 'UCV', dir: 'bible-ur' },
}
export const TRANSLATION_IDS = Object.keys(TRANSLATIONS)
// The full name as the reader would say it: "World English Bible", "Español · Reina-Valera 1865".
export const textName = (tr) => (tr.lang === 'en' ? tr.name : `${tr.language} · ${tr.name}`)

// Book names as each of those Bibles prints them, in canonical order.
const NAMES = {
  es: 'Génesis|Éxodo|Levítico|Números|Deuteronomio|Josué|Jueces|Rut|1 Samuel|2 Samuel|1 Reyes|2 Reyes|1 Crónicas|2 Crónicas|Esdras|Nehemías|Ester|Job|Salmos|Proverbios|Eclesiastés|Cantares|Isaías|Jeremías|Lamentaciones|Ezequiel|Daniel|Oseas|Joel|Amós|Abdías|Jonás|Miqueas|Nahúm|Habacuc|Sofonías|Hageo|Zacarías|Malaquías|Mateo|Marcos|Lucas|Juan|Hechos|Romanos|1 Corintios|2 Corintios|Gálatas|Efesios|Filipenses|Colosenses|1 Tesalonicenses|2 Tesalonicenses|1 Timoteo|2 Timoteo|Tito|Filemón|Hebreos|Santiago|1 Pedro|2 Pedro|1 Juan|2 Juan|3 Juan|Judas|Apocalipsis',
  fr: 'Genèse|Exode|Lévitique|Nombres|Deutéronome|Josué|Juges|Ruth|1 Samuel|2 Samuel|1 Rois|2 Rois|1 Chroniques|2 Chroniques|Esdras|Néhémie|Esther|Job|Psaumes|Proverbes|Ecclésiaste|Cantique des cantiques|Ésaïe|Jérémie|Lamentations|Ézéchiel|Daniel|Osée|Joël|Amos|Abdias|Jonas|Michée|Nahum|Habacuc|Sophonie|Aggée|Zacharie|Malachie|Matthieu|Marc|Luc|Jean|Actes|Romains|1 Corinthiens|2 Corinthiens|Galates|Éphésiens|Philippiens|Colossiens|1 Thessaloniciens|2 Thessaloniciens|1 Timothée|2 Timothée|Tite|Philémon|Hébreux|Jacques|1 Pierre|2 Pierre|1 Jean|2 Jean|3 Jean|Jude|Apocalypse',
  ur: 'پیدائش|خُروج|اَحبار|گِنتی|اِستِثنا|یہوشُعؔ|قُضاۃ|رُوتؔ|1 شموایلؔ|2 شموایلؔ|1 سلاطین|2 سلاطین|1 تواریخ|2 تواریخ|عزرا|نحمیاہ|ایسترؔ|ایُّوب|زبُور|امثال|واعظ|غزل الغزلات|یَشعیاہ|یرمیاہؔ|نوحہ|حزقی ایل|دانی ایل|ہوشِیعؔ|یُوایلؔ|عامُوسؔ|عبدیاہؔ|یُوناہؔ|میکاہؔ|ناحُومؔ|حبقُّوقؔ|صفنیاہؔ|حگّیؔ|زکریاؔہ|ملاکیؔ|متّی|مرقُس|لُوقا|یُوحنّا|اعمال|رُومیوں|1 کُرِنتھِیوں|2 کُرِنتھِیوں|گلتیوں|اِفِسیوں|فِلپّیوں|کلُسّیِوں|1 تھِسّلُنیِکیوں|2 تھِسّلُنیِکیوں|1 تِیمُتھِیُس|2 تِیمُتھِیُس|طِطُس|فِلیمون|عِبرانیوں|یعقوب|1 پطرس|2 پطرس|1 یُوحنّا|2 یُوحنّا|3 یُوحنّا|یہُوداہؔ|مُکاشفہ',
  pt: 'Gênesis|Êxodo|Levítico|Números|Deuteronômio|Josué|Juízes|Rute|1 Samuel|2 Samuel|1 Reis|2 Reis|1 Crônicas|2 Crônicas|Esdras|Neemias|Ester|Jó|Salmos|Provérbios|Eclesiastes|Cânticos|Isaías|Jeremias|Lamentações|Ezequiel|Daniel|Oseias|Joel|Amós|Obadias|Jonas|Miqueias|Naum|Habacuque|Sofonias|Ageu|Zacarias|Malaquias|Mateus|Marcos|Lucas|João|Atos|Romanos|1 Coríntios|2 Coríntios|Gálatas|Efésios|Filipenses|Colossenses|1 Tessalonicenses|2 Tessalonicenses|1 Timóteo|2 Timóteo|Tito|Filemom|Hebreus|Tiago|1 Pedro|2 Pedro|1 João|2 João|3 João|Judas|Apocalipse',
}
const BOOK_NAMES = Object.fromEntries(Object.entries(NAMES).map(([id, list]) => [id, list.split('|')]))
// The seven books only Catholic Bibles have, in each language.
const DEUTERO_NAMES = {
  es: { Tobit: 'Tobías', Judith: 'Judit', Wisdom: 'Sabiduría', Sirach: 'Eclesiástico', Baruch: 'Baruc', '1 Maccabees': '1 Macabeos', '2 Maccabees': '2 Macabeos' },
  fr: { Tobit: 'Tobie', Judith: 'Judith', Wisdom: 'Sagesse', Sirach: 'Siracide', Baruch: 'Baruch', '1 Maccabees': '1 Maccabées', '2 Maccabees': '2 Maccabées' },
  pt: { Tobit: 'Tobias', Judith: 'Judite', Wisdom: 'Sabedoria', Sirach: 'Eclesiástico', Baruch: 'Baruc', '1 Maccabees': '1 Macabeus', '2 Maccabees': '2 Macabeus' },
}

// The book's name in the given translation's language (English names otherwise).
export function bookNameIn(id, book, allBooks) {
  const names = BOOK_NAMES[id]
  if (!names) return book
  return names[allBooks.indexOf(book)] || DEUTERO_NAMES[id]?.[book] || book
}

const KEY = 'verbum-translation'
let current = 'web'
const listeners = new Set()
export function useTranslationId() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => current)
}
export const translationId = () => current
// Copyrighted texts can be chosen only once the app has its key for the publisher's service.
const KEYS = { esv: import.meta.env.VITE_ESV_KEY, apibible: import.meta.env.VITE_API_BIBLE_KEY }
export const onlineKey = (kind) => KEYS[kind] || ''
export const isAvailable = (id) => {
  const tr = TRANSLATIONS[id]
  if (!tr) return false
  return !tr.online || !!onlineKey(tr.online)
}
export const isCatholic = (id = current) => !!TRANSLATIONS[id]?.catholic
export const isOnline = (id = current) => !!TRANSLATIONS[id]?.online

// The texts chosen most lately, newest first, so the picker can offer them first.
const RECENT_KEY = 'verbum-recent-texts'
export const recentTexts = () => { const r = storage.get(RECENT_KEY); return (Array.isArray(r) ? r : []).filter(k => TRANSLATIONS[k]) }

export function setTranslation(id) {
  if (!isAvailable(id)) return
  if (id !== current) storage.set(RECENT_KEY, [id, current, ...recentTexts()].filter((k, i, a) => a.indexOf(k) === i).slice(0, 4))
  current = id
  storage.set(KEY, id)
  listeners.forEach(l => l())
}

// Reading-aloud voices live in voices.js.
export { voiceFor } from './voices'

// The saved choice, if it can still be shown (a key may have been removed).
if (isAvailable(storage.get(KEY))) current = storage.get(KEY)
