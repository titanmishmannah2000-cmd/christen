// Notes on passages whose wording differs between ancient copies of the Bible,
// shown just before the passage. `simple` is for everyone; `deeper` adds more in
// Deeper mode. Every claim carries a source marker (see src/lib/sources.js).
// Where this Bible has a verse number with no words (because most copies do not
// have that verse), the note sits in that verse's place.

const TOSN_NT = 'tbd:002:Bible, Manuscripts and Text of the (New Testament)'

export const TEXT_NOTES = [
  {
    book: 'Mark', chapter: 16, verse: 9, title: 'About Mark 16:9–20',
    simple: `Two of the oldest and best Greek manuscripts, Codex Sinaiticus and Codex Vaticanus, end Mark’s Gospel at verse 8 [[tosn:Mark 16:9-20]]. The translators of this Bible keep verses 9–20 as reliable, because the great majority of Greek manuscripts include them [[webfn:Mark 16:9]]. What they tell agrees with the other Gospels: the risen Jesus appeared to his followers and sent them out to tell everyone the good news [[bsn:Mark 16:9-20]].`,
    deeper: `Codex Sinaiticus is usually dated about 350–375 [[${TOSN_NT}]]. Nearly all scholars think Mark did not write the longer or the shorter ending, since their style and vocabulary differ from the rest of the Gospel; yet many also doubt that Mark meant to stop at 16:8, which would end on the Greek word gar (“because”) and leave the promise of 16:7, that the disciples would see Jesus in Galilee, without its fulfilment [[tosn:Mark 16:9-20]]. One manuscript has a short ending after verse 8 instead of verses 9–20 [[webfn:Mark 16:8]].`,
  },
  {
    book: 'John', chapter: 7, verse: 53, title: 'About John 7:53–8:11',
    simple: `This much-loved account of the woman brought to Jesus is not in the earliest Greek manuscripts of John, so it was probably added to the Gospel later. Even so, it is likely a true story from the life of Jesus [[tosn:John 7:53-8:11]]. The Greek text many modern Bibles follow prints it in brackets as less certain [[webfn:John 8:11]]; this Bible keeps it in its place.`,
    deeper: `Two papyrus copies of John from about AD 200, known as P66 and P75, go straight from 7:52 to 8:12 [[${TOSN_NT}]].`,
  },
  {
    book: '1 John', chapter: 5, verse: 7, title: 'About 1 John 5:7–8',
    simple: `Some older Bibles, such as the King James Version, have more words here: “in heaven: the Father, the Word, and the Holy Spirit; and these three are one. And there are three that testify on earth.” Only a few late manuscripts have them [[webfn:1 John 5:7]]. They began as an explanation written in Latin, and none of the early church fathers quote them [[tosn:1 John 5:7-8]]. The Father, the Son and the Holy Spirit are named together elsewhere, as when Jesus sends his disciples out, “baptizing them in the name of the Father and of the Son and of the Holy Spirit” [[bible:Matthew 28:19]].`,
    deeper: `The words found their way into later copies of the Latin Vulgate. Erasmus put them into Greek in the Textus Receptus, and so they came into the King James Version [[tosn:1 John 5:7-8]].`,
  },
  {
    book: 'Romans', chapter: 14, verse: 24, title: 'About Romans 14:24–26',
    simple: `This Bible places Paul’s closing song of praise here, after 14:23. The King James Version and many others place it at the very end of the letter, numbered 16:25–27 [[webfn:Romans 16:25]]. Ancient copies differ on where it belongs, but its words and themes match the rest of Romans [[tosn:Romans 16:25-27]].`,
    deeper: `In the Byzantine Greek text these verses come after 14:23 [[step:Translators Amalgamated Greek NT (TAGNT), Romans 16:25–27]]. The World English Bible’s New Testament follows the Majority Text, the form of the Greek text found in most manuscripts [[ref:web-preface]][[${TOSN_NT}]].`,
  },
  {
    book: 'Romans', chapter: 16, verse: 25, empty: true, title: 'Why is there no verse 25?',
    simple: `This Bible gives these words of praise earlier, as Romans 14:24–26. Other Bibles, such as the King James Version, place them here as 16:25–27 [[webfn:Romans 16:25]].`,
    goTo: [14, 24],
  },
  {
    book: 'Luke', chapter: 17, verse: 36, empty: true, title: 'Why is there no verse 36?',
    simple: `Some Greek manuscripts add: “Two will be in the field: the one taken, and the other left” [[webfn:Luke 17:36]]. The same picture is in Matthew 24:40 [[bible:Matthew 24:40]]. The verse number is kept so that references match other Bibles.`,
  },
  {
    book: 'Acts', chapter: 8, verse: 37, empty: true, title: 'Why is there no verse 37?',
    simple: `The King James Version has a verse here, from the Textus Receptus: Philip said, “If you believe with all your heart, you may.” He answered, “I believe that Jesus Christ is the Son of God” [[webfn:Acts 8:37]]. The Majority Text, which this Bible follows, does not have it [[ref:web-preface]]. The verse number is kept so that references match other Bibles.`,
  },
  {
    book: 'Acts', chapter: 15, verse: 34, empty: true, title: 'Why is there no verse 34?',
    simple: `Some manuscripts add: “But it seemed good to Silas to stay there” [[webfn:Acts 15:34]]. The verse number is kept so that references match other Bibles.`,
  },
  {
    book: 'Acts', chapter: 24, verse: 7, empty: true, title: 'Why is there no verse 7?',
    simple: `The King James Version, following the Textus Receptus, reads more in verses 6 to 8: “We wanted to judge him according to our law, but the commanding officer, Lysias, came by and with great violence took him out of our hands, commanding his accusers to come to you” [[webfn:Acts 24:6]][[webfn:Acts 24:7]][[webfn:Acts 24:8]]. The verse number is kept so that references match other Bibles.`,
  },
]

export const textNotesFor = (book, chapter) => TEXT_NOTES.filter(n => n.book === book && n.chapter === chapter)
