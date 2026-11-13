import { chaptersOf, canonBooks } from '../data/canon'
import { t, placeName } from './i18n'

// The previous and next chapter, crossing into neighbouring books at the ends.
export function neighbours(book, chapter) {
  const ALL_BOOKS = canonBooks()   // 73 books in a Catholic Bible
  const i = ALL_BOOKS.indexOf(book)
  const prev = chapter > 1
    ? { book, chapter: chapter - 1 }
    : i > 0 ? { book: ALL_BOOKS[i - 1], chapter: chaptersOf(ALL_BOOKS[i - 1]) } : null
  const next = chapter < chaptersOf(book)
    ? { book, chapter: chapter + 1 }
    : i < ALL_BOOKS.length - 1 ? { book: ALL_BOOKS[i + 1], chapter: 1 } : null
  return { prev, next }
}
export const navLabel = (to, book) => (to.book === book ? `${t(to.book === 'Psalms' ? 'Psalm' : 'Chapter')} ${to.chapter}` : placeName(to.book, to.chapter))
