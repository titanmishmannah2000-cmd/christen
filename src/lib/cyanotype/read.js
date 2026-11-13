import { useSyncExternalStore } from 'react'
import { storage } from '../prefs'

// The books opened so far, for the book strip ("Read so far").
const KEY = 'verbum-books-read'
let read = Array.isArray(storage.get(KEY)) ? storage.get(KEY) : []
const listeners = new Set()
export function markBookRead(book) {
  if (!book || read.includes(book)) return
  read = [...read, book]
  storage.set(KEY, read)
  listeners.forEach(l => l())
}
export function useBooksRead() {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l) }, () => read)
}
