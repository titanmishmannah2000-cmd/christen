import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ALL_BOOKS } from '../lib/bible'
import { useUnfold } from '../lib/motion'

// The Bible's big story in eight acts (after Vaughan Roberts, God's Big
// Picture), with the acts a book belongs to picked out. Act 0 marks the books
// of worship and wisdom, which speak to every stage of the story.
// Each act: label, short line, a fuller plain-language note, where it is told.
const ACTS = [
  ['Made', 'God makes a good world and rules it with his people',
    'God creates a good world and makes people to live with him, care for his world and enjoy his rule.', 'Genesis 1–2'],
  ['Lost', 'People turn from God, and paradise is lost',
    'People turn away from God. Sin and death come in, and they are sent out of the garden.', 'Genesis 3–11'],
  ['Promised', 'God promises Abraham a people, a land and blessing',
    'God promises Abraham a family that becomes a people, a land to live in, and blessing for every nation through them.', 'Genesis 12–50'],
  ['Begun', 'Israel becomes God’s people in God’s land under a king',
    'The promise starts to come true. God frees Israel from Egypt, gives them his law and the land, and raises up kings like David.', 'Exodus to the kings'],
  ['Foretold', 'Exile, and the prophets’ hope of something greater',
    'Israel turns from God and goes into exile. The prophets announce a coming King, a new covenant and a new start.', '2 Kings, the books after the exile and the prophets'],
  ['Arrived', 'Jesus the King comes',
    'Jesus comes as the promised King. He dies for sin and rises again.', 'the Gospels'],
  ['Spreading', 'The good news goes out to every nation',
    'The good news about Jesus goes out to every nation, and the church grows.', 'Acts and the letters'],
  ['Completed', 'Christ returns and makes all things new',
    'Jesus returns, and God makes everything new: a new heaven and a new earth where he lives with his people.', 'Revelation'],
]

// Lower-case the first word to run a line into a sentence, but not a name.
const inline = (line) => (/^(God|Israel|Jesus|Christ)\b/.test(line) ? line : line[0].toLowerCase() + line.slice(1))
const span = (acts) => acts.length > 1 ? `stages ${acts[0]}–${acts[acts.length - 1]}` : `stage ${acts[0]}`

export default function BigStory({ book, acts }) {
  // The open stage belongs to one book; moving to another book closes it.
  const [picked, setPicked] = useState(null)
  const unfold = useUnfold()
  const open = picked?.book === book ? picked.n : null
  const setOpen = (n) => setPicked(n ? { book, n } : null)
  if (!acts?.length) return null
  const every = acts[0] === 0
  const name = book === 'Psalms' ? 'The Psalms' : book
  const nt = ALL_BOOKS.indexOf(book) >= 39
  const shown = open && ACTS[open - 1]
  return (
    <figure className="big-story">
      <figcaption>
        <span className="eyebrow">The Bible’s big story</span>
        <span className="big-story-line">
          {every
            ? `${name} ${book === 'Psalms' ? 'speak' : 'speaks'} to every stage of the story: worship and wisdom for God’s people in every age.`
            : `${name} ${book === 'Psalms' ? 'belong' : 'belongs'} to ${span(acts)} of 8: ${acts.map(a => inline(ACTS[a - 1][1])).join('; ')}.`}
        </span>
        <span className="big-story-how">
          The Bible tells one story in eight stages, from creation to new creation.
          {every ? ' ' : ' The underlined stage is where this book fits. '}
          Tap a number to see what it means.
        </span>
      </figcaption>
      <ol className={`acts${every ? ' is-every' : ''}${nt ? ' nt' : ''}`}>
        {ACTS.map(([label, line], i) => (
          <li key={label} className={acts.includes(i + 1) ? 'is-here' : ''}>
            <button type="button" className={open === i + 1 ? 'is-open' : ''} aria-expanded={open === i + 1}
              title={line} onClick={() => setOpen(open === i + 1 ? null : i + 1)}>
              <b>{i + 1}</b><span>{label}</span>
            </button>
          </li>
        ))}
      </ol>
      <AnimatePresence initial={false} mode="wait">
        {shown && (
          <motion.div key={open} className="act-note" {...unfold}>
            <p>
              <b>Stage {open}: {shown[0]}.</b> {shown[2]}
              <span className="act-where"> Told in {shown[3]}.{acts.includes(open) ? ` ${name} is part of this stage.` : ''}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <p className="big-story-credit">The eight stages follow Vaughan Roberts, <i>God’s Big Picture</i>.</p>
    </figure>
  )
}
