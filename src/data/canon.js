import { CHAPTER_COUNTS, CATHOLIC_CHAPTER_COUNTS, CATHOLIC_OLD, BOOKS, DEUTERO_BOOKS } from './books'
import { ALL_BOOKS } from '../lib/bible'
import { isCatholic } from '../lib/translations'

// The canon in its traditional sections, as the ribbon and the books sheet show it.
const build = (books, counts) => counts.reduce((list, [name, count]) => {
  const start = list.length ? list[list.length - 1].end : 0
  list.push({ name, start, end: start + count, books: books.slice(start, start + count) })
  return list
}, [])
export const SECTIONS = build(ALL_BOOKS, [
  ['The Law', 5], ['History', 12], ['Wisdom', 5], ['Major Prophets', 5], ['Minor Prophets', 12],
  ['Gospels', 4], ['Acts', 1], ['Letters', 21], ['Revelation', 1],
])
export const CATHOLIC_BOOKS = [...CATHOLIC_OLD, ...BOOKS.new]
const CATHOLIC_SECTIONS = build(CATHOLIC_BOOKS, [
  ['The Law', 5], ['History', 16], ['Wisdom', 7], ['Major Prophets', 6], ['Minor Prophets', 12],
  ['Gospels', 4], ['Acts', 1], ['Letters', 21], ['Revelation', 1],
])

// The books, sections and chapter counts of the Bible being read: 66 books, or 73 in a Catholic Bible.
export const canonBooks = (id) => (isCatholic(id) ? CATHOLIC_BOOKS : ALL_BOOKS)
export const sections = (id) => (isCatholic(id) ? CATHOLIC_SECTIONS : SECTIONS)
export const isDeutero = (book) => DEUTERO_BOOKS.includes(book)
// Whether the chosen Bible has this chapter (Tobit, or Daniel 13, only in a Catholic Bible).
export const hasChapter = (book, chapter, id) => chapter >= 1 && chapter <= (isCatholic(id) ? CATHOLIC_CHAPTER_COUNTS : CHAPTER_COUNTS)[book]
export const bookIndex = (book) => canonBooks().indexOf(book)
export const sectionOf = (book) => sections().find(s => s.books.includes(book))
export const isNewTestament = (index) => canonBooks()[index] ? BOOKS.new.includes(canonBooks()[index]) : index >= 39
export const chaptersOf = (book) => (isCatholic() ? CATHOLIC_CHAPTER_COUNTS : CHAPTER_COUNTS)[book] || CATHOLIC_CHAPTER_COUNTS[book] || 1
export const pad2 = (n) => String(n).padStart(2, '0')
export const displayBook = (book, chapter) => (book === 'Psalms' && chapter ? 'Psalm' : book)
