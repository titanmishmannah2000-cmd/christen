import { useHighlights } from './highlights'
import { useMemory, sortedMemory } from './memory'

// How many verses are saved, and how many are due for practice, for the badges.
export function useVerseCounts() {
  const saved = Object.keys(useHighlights()).length
  const due = sortedMemory(useMemory()).due.length
  return { saved, due }
}
