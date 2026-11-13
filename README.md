# Christen

Christen is a Bible reader for everyone, set like an illuminated manuscript on a modern grid: vellum pages, a gold-leaf initial on each chapter, red rubric verse numbers, a gloss in the margin, and an atlas of journeys, connected verses and dates beside the text. The verses come first: each chapter opens with a one-line summary, and everything else is one tap away. On phones the main tools sit in a tab bar along the bottom.

## Features

- **The whole Bible, offline.** The World English Bible (public domain) ships with the app in `public/bible/`, one JSON file per book. Reading and searching need no API.
- **The gloss.** Tap a verse to open its note in the margin (under the verse on smaller screens): how many threads it has, the strongest link in the other Testament with its text, and Save, Connected verses and Learn by heart, with Listen, Copy and Share under More.
- **Connections** (the Atlas tab once called Echoes or Threads). Cross-references for every verse of all 66 books, linking the Old and New Testaments in both directions. The Threads tab draws arcs from the verse to every book it echoes (lapis for the Old Testament, gold for the New, thicker for stronger links) and lists each passage with its text and a link to read it in context. With no verse open it shows the chapter's strongest links. Data: [OpenBible.info](https://www.openbible.info/labs/cross-references/) (CC BY), from the Treasury of Scripture Knowledge, ranked by reader votes; the top 6 Old Testament and top 6 New Testament links per verse are kept in `public/threads/`.
- **A map for every book.** The Journey tab follows each book's journey chapter by chapter. The route draws itself in ink behind a moving pointer. The house style is Engraved; Terrain, Satellite, Street and Antique are under Map style. You can zoom in, or press Expand to give the atlas the whole screen.
- **The canon ribbon.** Every book as a tick along the bottom, its height by chapters. Hover to see a book, click to open it; when Connections is open, the books a verse reaches turn gold.
- **One chapter picker.** The book and chapter in the top bar (Chapters on phones) opens the current book's chapters, with All books one tap back. The rail shows the chapter before and after.
- **Settings.** Text size (six steps), line spacing, a Classic or Plain typeface, light, dark or match the device, background sound, and Simple or Deeper notes, all in one sheet and remembered on the device.
- **Search.** A word or phrase across all 31,103 verses, or a reference such as `John 3:16`, `ps 23` or `1 cor 13:4-7`. Press Ctrl K (⌘ K) or / anywhere.
- **My verses.** Saved verses get a hand-laid gold wash and are listed in Bible order; the By heart tab holds the verses you are learning.
- **Background sound.** Optional soundscapes synthesized with the Web Audio API, switched on in Settings. Off by default.
- **Reading plans.** The Gospels in 40 days, Psalms and Proverbs in a month, the New Testament in 90 days and the whole Bible in a year, under Start here. Days are balanced by verse count (`src/data/plans.js`, `src/data/verseCounts.js`). Today is the first unfinished day, shown on the welcome page; each chapter ends with Mark as read and the way on.
- **Notes on verses.** Tap a verse, More, Write a note. Notes show as a small blue mark beside the verse and are listed under My verses › Notes, where they can be downloaded as a text file.
- **Hebrew and Greek words.** Tap a verse, then See the Hebrew (or Greek) words: each word with how it sounds and what it means there. Tap a word for its dictionary form and kind of word; in Deeper mode the full grammar, Strong's number and a dictionary entry show too, with Find every verse with it. Search also takes Strong's numbers (H430, G26) and words typed in Hebrew or Greek letters. Data from STEPBible.org (CC BY 4.0), in `public/original/`, loaded only when opened.
- **Notes on the text.** Where ancient copies differ (Mark 16:9–20, John 7:53–8:11, 1 John 5:7–8, the closing praise of Romans) a short sourced note sits before the passage, and verse numbers with no words (Luke 17:36, Acts 8:37, 15:34, 24:7, Romans 16:25) say why (`src/data/textNotes.js`). The verse panel shows the World English Bible's own footnotes under From the translators, with TR, NU, MT and LXX explained (`public/footnotes.json`).
- **Chapters as stories.** Ruth 1–4 and Jonah 1–4 can be read scene by scene beside a small engraved map, with each scene's note citing its source (`src/data/stories.js`, `src/components/StoryView.jsx`).
- **Questions to think about.** Every chapter ends with four questions from the Discovery Bible Study method (as set out by Alex Absalom for Discipleship.org): what the chapter shows about God, about people, what to do this week and who to share it with (`src/components/Reflect.jsx`).
- **Compare the accounts.** Where another book tells the same event, a “Compare with the other accounts” button above the chapter and a line in the verse panel open the accounts side by side (stacked on phones), in the chosen Bible text. The Gospels follow A. T. Robertson’s *Harmony of the Gospels* (1922) and Samuel–Kings–Chronicles follow W. D. Crockett’s *Harmony* (1897), both public domain (`src/lib/parallels.js`, `src/components/CompareSheet.jsx`, `public/parallels.json`).
- **Other languages.** Settings > Bible text switches the reader to the ESV, NASB, CSB or Good News Translation (when their keys are set), the Douay-Rheims, the Urdu Contemporary Version, the Spanish Reina-Valera 1865 (modern spelling), the French Louis Segond 1910 or the Portuguese Bíblia Livre. They are lined up verse by verse with the English, so the notes, original words and connections stay beside the right verse; search, listening, copying and citations use the chosen text (`src/lib/translations.js`, `public/bible-es|fr|pt/`). Settings > Menus and buttons puts the app's own words (bars, Go to, Settings, the verse panel, search, the player, the Atlas tabs) and the book names into the same languages (`src/lib/i18n.js`, wording in `src/data/uiStrings.js`, keyed by the English, so anything not yet translated stays in English). Notes, book cards, paths and the word meanings are in English for now.
- **Cite this verse.** Under More in the verse panel: SBL, Chicago and APA forms, each with Copy. The Credits page lists every work the notes cite, in full (`src/data/bibliography.js`).
- **Listen to a chapter.** The device's own voice reads the chapter verse by verse while the page follows; pause, skip and change speed from the small player.
- **Works offline and installs like an app.** A service worker (`public/sw.js`) saves the app on the first visit and each book as it is read; Settings › Use without internet saves the whole Bible, notes and connections at once. The build writes `dist/precache.json`, the list of app files to save. Add it to a phone's home screen from the browser menu.
- **Links to any verse.** Positions live in the URL, e.g. `#/Romans/8/28`. The app remembers where you stopped reading.

## Running it

```bash
npm install
npm run dev       # development server
npm run build     # production build in dist/
npm run preview   # serve the production build
npm run lint
```

`dist/` is a static site and can be hosted anywhere. Routing uses the URL hash, so no server rewrites are needed.

### The ESV, NASB, CSB and Good News Translation

These Bibles are copyrighted, so none of their text is stored in this repository or in the
app. Christen reads them from the publishers' own services, a chapter at a time, under each
service's terms for free, non-commercial apps (`src/lib/online.js`):

- **ESV**: from [api.esv.org](https://api.esv.org/) (Crossway). At most 500 verses are kept on
  the device, Crossway's notice is shown under every chapter, and each chapter links to esv.org.
- **NIV, NASB, CSB and the Good News Translation**: from [API.Bible](https://api.bible/) (Starter
  plan). The copyright is shown with the text and each view is reported (FUMS).

Copy `.env.example` to `.env` and fill in the keys (made in your own name). A Bible whose key
is not set shows greyed out as "Not set up yet". The NASB also needs its own
API.Bible id (`VITE_API_BIBLE_NASB_ID`), set only once it is part of your API.Bible plan or
Lockman has given permission. The keys are never committed: `.env` is in `.gitignore`. On
Vercel, add them under Project Settings > Environment Variables. Note that a `VITE_` key is
built into the site's JavaScript, so anyone can read it there; use keys from free plans only.

Christen is free and must stay free (no price, ads, purchases or donations), as these terms ask.

## Data

- `npm run build:bible` regenerates `public/bible/*.json` from the `world-english-bible` package.
- `scripts/build-threads.py` regenerates `public/threads/*.json` from OpenBible.info's cross-reference data (see the script for the input file).
- `scripts/build-original.py <folder>` regenerates `public/original/` from STEPBible's TAHOT, TAGNT, TBESH and TBESG files (the script says which to download).
- `scripts/build-footnotes.py eng-web.usfx.xml` regenerates `public/footnotes.json` from the WEB's USFX file (the script says where to get it).
- `scripts/build-parallels.py` rebuilds `public/parallels.json` from the lists in `scripts/parallels/` and stops if a reference is not in the World English Bible.
- `scripts/build-translations.py es|fr|pt <file>` regenerates `public/bible-es/`, `bible-fr/` or `bible-pt/` (the script says where to get each file) and lists any chapter whose verses do not line up with the English.
- Map tiles come from Esri and paintings from Wikimedia Commons, so those need an internet connection the first time; the ones you have seen are kept for offline use. Everything else works offline.

## Project layout

```
src/
  App.jsx                 layout, routing, sound and atlas state
  index.css               imports the stylesheets in styles/, in order
  styles/                 one stylesheet per part of the app (base, topbar, reader, atlas, sheets, brief, …)
  components/
    TopBar.jsx            the header: the book and chapter picker and the tools
    BottomBar.jsx         the tab bar on phones
    Rail.jsx              chapter numeral, previous and next
    Reader.jsx            the text, initials, gloss margin and colophon
    Atlas.jsx             the Journey and Threads card
    WorldMap.jsx          the journey map
    Threads.jsx           the arc map and linked passages
    Canon.jsx             the canon ribbon along the bottom
    BooksSheet.jsx        the chapter and book picker
    MyVersesSheet.jsx     Saved (SavedList.jsx) and By heart (Memorize.jsx)
    SettingsSheet.jsx     text size, spacing, typeface, pages, sound, depth
    SearchSheet.jsx, Sheet.jsx
    Welcome.jsx           verse of the day
  data/                   books, canon sections, journeys, paintings
  lib/                    Bible loading and search, threads, routes, highlights, preferences, soundscape;
                          ui.js holds which sheet is open, so any button can open one
```

## License

© 2026 Titan. All rights reserved. Christen's code, design and its own writing are proprietary: see [`LICENSE`](LICENSE). No permission to copy, modify or redistribute them is granted.

Some parts belong to others and keep their own licenses: the Bible text, open study notes, cross-references, map data and tiles, paintings, fonts and open-source libraries. They are listed in [`NOTICE.md`](NOTICE.md), shown in the app under **Credits and licenses**, and the full software license texts are in `public/third-party-notices.txt` (regenerate with `npm run build:notices`).

## Hosting

The public site is a static build (`npm run build`, then upload `dist/`). On Vercel: import
this repository, keep the Vite preset, and add the keys above as environment variables.
