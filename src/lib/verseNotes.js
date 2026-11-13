import { useSyncExternalStore } from 'react'
import { storage } from './prefs'
import { ALL_BOOKS } from './bible'

// The reader's own notes on verses, kept on this device.
// { "Book|chapter|verse": { book, chapter, verse, text, updated } }
const KEY = 'verbum-verse-notes'
let state = storage.get(KEY) || {}
const listeners = new Set()
const write = (next) => { state = next; storage.set(KEY, next); listeners.forEach(l => l()) }

export const noteKey = (book, chapter, verse) => `${book}|${chapter}|${verse}`
export function useVerseNotes() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => state)
}
export function saveNote(book, chapter, verse, text) {
  const key = noteKey(book, chapter, verse)
  const next = { ...state }
  if (text.trim()) next[key] = { book, chapter, verse, text: text.trim(), updated: Date.now() }
  else delete next[key]
  write(next)
}
export const removeNote = (key) => { const next = { ...state }; delete next[key]; write(next) }

export const notesInOrder = (all) => Object.entries(all).sort(([, a], [, b]) =>
  ALL_BOOKS.indexOf(a.book) - ALL_BOOKS.indexOf(b.book) || a.chapter - b.chapter || a.verse - b.verse)

// All notes as a plain text file the reader can keep or print.
export function exportNotes(all) {
  const lines = notesInOrder(all).map(([, n]) => `${n.book === 'Psalms' ? 'Psalm' : n.book} ${n.chapter}:${n.verse}\n${n.text}\n`)
  const blob = new Blob([`My notes on the Bible\n\n${lines.join('\n')}`], { type: 'text/plain;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'my-bible-notes.txt'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
