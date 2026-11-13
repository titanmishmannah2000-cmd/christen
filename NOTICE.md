# Notices: what in Christen belongs to others

Christen is © 2026 Titan, all rights reserved (see `LICENSE`). The parts below are **not** covered by that claim. Each keeps its own license, and the obligations listed here go wherever Christen goes, including every hosted copy. The app shows the same list in plain words under **Credits and licenses** (the link under every chapter).

## Bible text

| What | Where it lives | Owner | License | What it asks of us |
|---|---|---|---|---|
| World English Bible | `public/bible/` | eBible.org | Public domain ([statement](https://ebible.org/web/copyright.htm)) | Nothing for the text. "World English Bible" is a trademark of eBible.org: if the text is ever changed, it must not be called the World English Bible. Christen shows it unchanged. |
| Reina-Valera 1865, with modern spelling (Spanish) | `public/bible-es/`, made by `scripts/build-translations.py` | Public domain (text from the scrollmapper bible_databases project) | Public domain | Nothing. Christen splits four joined verses so they line up with the English, and leaves out the later notes on where each letter was written. |
| Louis Segond 1910 (French) | `public/bible-fr/`, made by `scripts/build-translations.py` | Public domain (text from the Beblia Holy-Bible-XML-Format project) | Public domain | Nothing. |
| Biblica® Open Urdu Contemporary Version (Urdu) | `public/bible-ur/`, made by `scripts/build-translations.py` | Biblica, Inc., © 1999, 2005, 2022, 2024 (EPUB from [eBible.org](https://ebible.org/details.php?id=urdoucv)) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Keep the title and copyright notice, say the original is available for free at www.biblica.com and open.bible, and list the changes: section headings and footnotes left out, verses shown one by one beside the English. Shared on the same license. The credit is on the Credits page. |
| Bíblia Livre (Portuguese) | `public/bible-pt/`, made by `scripts/build-translations.py` | Bíblia Livre project (text from the scrollmapper bible_databases project) | [CC BY 3.0 Brazil](https://creativecommons.org/licenses/by/3.0/br/) | Credit the Bíblia Livre with a link to the license, and say what was changed: Psalm 46:2–3 split, Revelation 12:18 joined to 13:1, and the later notes on where letters were written left out. The credit is on the Credits page. |
| Douay-Rheims Bible, Challoner revision (Catholic, 73 books) | `public/bible-dra/`, made by `scripts/build-douay.py` | Public domain (text from the scrollmapper bible_databases project) | Public domain | Nothing. Christen lines it up with the English verse by verse and shows the Douay-Rheims's own verse numbers beside each verse. |
| English Standard Version (ESV) | Not stored with the app: read from api.esv.org by `src/lib/online.js` | Crossway | ESV API terms for non-commercial use ([terms](https://api.esv.org/)) | The app must stay free (no price, ads or donations). Keep no more than 500 verses on the device, link to esv.org, mark quotations "ESV", and show Crossway's notice wherever the text appears. The API key is in the app owner's own name. |
| New American Standard Bible (NASB) | Not stored with the app: read from API.Bible by `src/lib/online.js` | The Lockman Foundation | API.Bible Starter plan, non-commercial ([terms](https://api.bible/)) | Show the publisher's copyright with the text, report each view (FUMS), and fetch a kept chapter again within 30 days. |
| Christian Standard Bible (CSB) | Not stored with the app: read from API.Bible by `src/lib/online.js` | Holman Bible Publishers | API.Bible Starter plan, non-commercial ([terms](https://api.bible/)) | The same as the NASB. |
| World English Bible footnotes | `public/footnotes.json`, made by `scripts/build-footnotes.py` | eBible.org | Public domain | Nothing. Shown unchanged under "From the translators". |
| Hebrew and Greek words, grammar and brief dictionaries (TAHOT, TAGNT, TBESH, TBESG) | `public/original/`, made by `scripts/build-original.py` | STEPBible.org, Tyndale House, Cambridge | [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Credit "STEPBible.org" with a link to the license, and say that the data was changed: Christen reshapes it per verse, keeps only the Byzantine-text Greek words, shortens long dictionary entries and turns grammar codes into plain words. The credit shows under the words in every verse and on the Credits page. |

## Notes and their sources

Christen's summaries, notes, book cards, glossary, stories, paths, journeys, timeline notes and painting guides were **written for Christen** and are covered by `LICENSE`. Each fact in them carries a marker to the work it comes from.

| Source | Owner | License | What it asks of us |
|---|---|---|---|
| [Tyndale Open Study Notes](https://github.com/BibleAquifer/AquiferOpenStudyNotes) | Tyndale House Publishers | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Credit Tyndale and link the license. **Share-alike:** any wording copied or adapted from these notes must itself be shared under CC BY-SA 4.0. Facts restated in our own words are not an adaptation, so keep notes in original wording. |
| [Tyndale Open Bible Dictionary](https://github.com/BibleAquifer/AquiferOpenBibleDictionary) | Tyndale House Publishers | CC BY-SA 4.0 | Same as above. |
| [Biblica Study Notes](https://github.com/BibleAquifer/BiblicaStudyNotes) | Biblica | CC BY-SA 4.0 | Same as above. |
| NABRE introductions and footnotes | US Conference of Catholic Bishops | All rights reserved | Cited and linked only. Do not copy their wording. |
| Reformation Study Bible | Ligonier Ministries | All rights reserved | Cited and linked only. |
| Encyclopedia of the Bible | Zondervan | All rights reserved | Cited and linked only. |
| Bible.org articles (T. Hawkins, D. Malick) | Bible.org | All rights reserved | Cited and linked only. |
| ESV Study Bible article; Clarion (C. van Dam); EWTN (J. Akin) | Crossway; Clarion; EWTN | All rights reserved | Cited and linked only. |
| Easton's Bible Dictionary (1897) | M. G. Easton | Public domain | Nothing. |

## Cross-references (Threads)

| What | Where it lives | Owner | License | What it asks of us |
|---|---|---|---|---|
| [Bible cross-references](https://www.openbible.info/labs/cross-references/) | `public/threads/` (derived, top links per verse) | OpenBible.info | Creative Commons Attribution | Credit OpenBible.info with a link. No share-alike, so our selected version may stay ours, but the credit must stay. |

## Parallel passages (Compare the accounts)

| What | Where it lives | Owner | License | What it asks of us |
|---|---|---|---|---|
| A. T. Robertson, *A Harmony of the Gospels for Students of the Life of Christ* (1922) | `scripts/parallels/robertson-*.txt`, `public/parallels.json` (section references only; titles are ours) | Public domain | Public domain | Nothing. |
| William Day Crockett, *A Harmony of the Books of Samuel, Kings, and Chronicles* (1897) | `scripts/parallels/crockett.txt`, `public/parallels.json` (section references only; titles are ours) | Public domain | Public domain | Nothing. |

## Maps

| What | Where it lives | Owner | License | What it asks of us |
|---|---|---|---|---|
| Natural Earth land, lakes, rivers | `public/engraved.json` | Natural Earth | Public domain ([terms](https://www.naturalearthdata.com/about/terms-of-use/)) | Nothing; credited anyway. |
| Map tiles for Terrain, Satellite, Street, Antique | loaded from `server.arcgisonline.com` | Esri and its data partners | Esri terms of use | Show "Powered by Esri" and the data providers on the map ([Esri's rules](https://developers.arcgis.com/documentation/esri-and-data-attribution/)); Christen now shows them in a line under the map. **Open issue:** Esri's current terms expect an ArcGIS account and access key for its basemaps. Before a public or commercial launch, create a free ArcGIS Location Platform account and check the terms, or switch these views to another provider. |
| OpenStreetMap data inside the Street tiles | OpenStreetMap contributors | [ODbL 1.0](https://www.openstreetmap.org/copyright) | Credit "© OpenStreetMap contributors" (in the map line). |

## Paintings

All 66 paintings are pre-20th-century or early-20th-century works whose artists died long ago, so the paintings are in the public domain. The image files are loaded from Wikimedia Commons; each file's own page (linked from the app's Credits page) states its license and source. Listed in `src/data/paintings.js`.

## Fonts

| Font | Designer | License |
|---|---|---|
| Cormorant Garamond | Christian Thalmann | [SIL Open Font License 1.1](https://openfontlicense.org/) |
| Inter | Rasmus Andersson | SIL Open Font License 1.1 |
| Frank Ruhl Libre | Yanek Iontef | SIL Open Font License 1.1 |

The OFL lets any app embed these fonts. Its notice must travel with them (it is in `public/third-party-notices.txt`). The fonts may not be sold on their own.

## Open-source software

52 packages ship inside the built app, all under permissive licenses (MIT, ISC, BSD-2/3-Clause, 0BSD, Apache-2.0 option, OFL). None of them is "copyleft", so none forces Christen's own code to be open. They only require that their copyright notices and license texts travel with the app. Those are reproduced in full in **`public/third-party-notices.txt`**, which is published with every build and linked from the Credits page. Regenerate it after changing dependencies:

```bash
npm run build:notices
```

Build-only tools (Vite, ESLint, the `world-english-bible` package used to build `public/bible/`) are not shipped in the app.
