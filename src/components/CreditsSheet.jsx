import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import Sheet from './Sheet'
import { CREDIT_GROUPS, OWNER, FIRST_YEAR, COMMONS_PAGE } from '../data/credits'
import { PAINTINGS } from '../data/paintings'
import { BIBLIOGRAPHY } from '../data/bibliography'
import { EASE_OUT, EASE_IN_OUT } from '../lib/motion'
import './credits.css'

const YEARS = new Date().getFullYear() > FIRST_YEAR ? `${FIRST_YEAR}–${new Date().getFullYear()}` : FIRST_YEAR
const NOTICES_URL = `${import.meta.env.BASE_URL}third-party-notices.txt`

function CreditItem({ item }) {
  return (
    <li className="credit">
      <div className="credit-name">{item.url ? <a href={item.url} target="_blank" rel="noreferrer">{item.name}</a> : item.name}</div>
      <div className="credit-by">{item.by}</div>
      {item.license && (
        <div className="credit-license">
          {item.licenseUrl ? <a href={item.licenseUrl} target="_blank" rel="noreferrer">{item.license}</a> : item.license}
        </div>
      )}
      {item.note && <div className="credit-note">{item.note}</div>}
    </li>
  )
}

// Every painting once, with a link to its Commons page, where its license is shown.
function Paintings() {
  const [open, setOpen] = useState(false)
  const still = useReducedMotion()
  const list = [...new Map(Object.values(PAINTINGS).map(p => [p.file, p])).values()]
  return (
    <section className="credit-group">
      <h3>Paintings</h3>
      <p>The {list.length} paintings are old masterpieces, out of copyright and free for everyone. The pictures of them come from Wikimedia Commons, where each file’s page shows its own license.</p>
      <button className="link-btn credit-toggle" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? 'Hide the list of paintings' : `Show all ${list.length} paintings`}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ul className="credit-list" key="paintings"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { duration: still ? 0 : 0.45, ease: EASE_OUT } }}
            exit={{ height: 0, opacity: 0, transition: { duration: still ? 0 : 0.35, ease: EASE_IN_OUT } }}>
            {list.map(p => (
              <CreditItem key={p.file} item={{ name: p.title, by: p.artist, url: COMMONS_PAGE(p.file), license: 'Public domain (see the file page)' }} />
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </section>
  )
}

// Where everything in Christen comes from, in plain words, with each license.
export default function CreditsSheet({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} variant="drawer" title="Credits and licenses">
      <div className="sheet-body about credits">
        <p className="credits-lead">Christen stands on the work of many people. Here is where every part comes from, and the terms each one comes with.</p>

        <section className="credit-group credit-owner">
          <h3>Who made Christen</h3>
          <p><b>© {YEARS} {OWNER}. All rights reserved.</b></p>
          <p>Christen’s design, code and its own writing (the chapter summaries and notes, book cards, glossary, stories, reading paths, journeys, timeline notes and painting guides) were made for Christen. Please don’t copy or reuse them without permission.</p>
          <p className="muted small">The parts listed below belong to others and keep their own terms, even inside Christen.</p>
        </section>

        {CREDIT_GROUPS.slice(0, 4).map(g => <Group key={g.id} group={g} />)}
        <Bibliography />
        <Paintings />
        {CREDIT_GROUPS.slice(4).map(g => <Group key={g.id} group={g} />)}

        <p className="credits-foot">
          The full license text of every piece of software inside Christen is in the{' '}
          <a href={NOTICES_URL} target="_blank" rel="noreferrer">software notices file</a>.
        </p>
      </div>
    </Sheet>
  )
}

// Every work the notes cite, written out in full for anyone who wants to cite it too.
function Bibliography() {
  const [open, setOpen] = useState(false)
  const still = useReducedMotion()
  return (
    <section className="credit-group">
      <h3>Works cited</h3>
      <p>Every note, book card and word study in Christen points to one of these {BIBLIOGRAPHY.length} works. Here they are in full, in Chicago style, so you can look them up or cite them yourself.</p>
      <button className="link-btn credit-toggle" type="button" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? 'Hide the works cited' : `Show all ${BIBLIOGRAPHY.length} works cited`}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.ol className="biblio" key="biblio"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { duration: still ? 0 : 0.45, ease: EASE_OUT } }}
            exit={{ height: 0, opacity: 0, transition: { duration: still ? 0 : 0.35, ease: EASE_IN_OUT } }}>
            {BIBLIOGRAPHY.map(w => (
              <li key={w.text}>
                <Entry work={w} />
                {w.url && <> <a href={w.url} target="_blank" rel="noreferrer">Open</a></>}
              </li>
            ))}
          </motion.ol>
        )}
      </AnimatePresence>
    </section>
  )
}

// The title in italics, as the style asks.
function Entry({ work }) {
  if (!work.italic) return work.text
  const at = work.text.indexOf(work.italic)
  if (at < 0) return work.text
  return <>{work.text.slice(0, at)}<i>{work.italic}</i>{work.text.slice(at + work.italic.length)}</>
}

function Group({ group }) {
  return (
    <section className="credit-group">
      <h3>{group.title}</h3>
      <p>{group.plain}</p>
      {group.items.length > 0 && <ul className="credit-list">{group.items.map(i => <CreditItem key={i.name} item={i} />)}</ul>}
    </section>
  )
}
