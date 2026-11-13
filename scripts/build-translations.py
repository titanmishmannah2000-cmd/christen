#!/usr/bin/env python3
"""Build the other-language Bibles under public/bible-<lang>/, one JSON file per book,
in the same shape as public/bible/ ({book, chapters: [[[verse, text], ...]], headings}).

Sources (download each, then pass its path):
  es  Reina-Valera 1865, with modern spelling (public domain), JSON from the scrollmapper
      bible_databases project. (The 1909 edition there and on eBible.org shifts verses at
      a dozen chapter ends, so it no longer lines up with the English.)
      https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/SpaRV1865.json
  fr  Louis Segond 1910 (public domain), XML from the Beblia project,
      https://raw.githubusercontent.com/Beblia/Holy-Bible-XML-Format/master/FrenchBible.xml
  pt  Bíblia Livre (CC BY 3.0 Brazil), JSON from the scrollmapper bible_databases project,
      https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/PorBLivre.json

  ur  Biblica® Open Urdu Contemporary Version (CC BY-SA 4.0), EPUB from eBible.org,
      https://ebible.org/epub/urdoucv.epub

  python3 scripts/build-translations.py es SpaRV1865.json
  python3 scripts/build-translations.py fr FrenchBible.xml
  python3 scripts/build-translations.py pt PorBLivre.json
  python3 scripts/build-translations.py ur urdoucv.epub

It prints every chapter whose verse count differs from the World English Bible, so the
reader can line verses up across translations.
"""
import html
import json
import os
import re
import sys
import zipfile

BOOKS = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
         '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
         'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
         'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
         'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
         'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
         'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
         '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
         '1 John', '2 John', '3 John', 'Jude', 'Revelation']
USFX = ('GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG '
        'ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL '
        'MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV').split()
ROOT = os.path.join(os.path.dirname(__file__), '..')
slug = lambda b: b.lower().replace(' ', '')


def tidy(t):
    t = html.unescape(re.sub(r'<[^>]+>', '', t)).replace('¶', '')
    return re.sub(r'\s+', ' ', t).strip()


# Places where a source joins two verses into one (and leaves an empty verse further on),
# so the words no longer line up with the verse numbers of the English. Each entry splits
# verse V at the given words and moves the following verses up to fill the gap.
SPLITS = {
    'es': [('1 Chronicles', 3, 22, 'Los hijos de Naarias'), ('2 Chronicles', 33, 10, 'por lo cual Jehová trajo'),
           ('Psalms', 13, 5, 'Cantaré a Jehová'), ('Jeremiah', 39, 17, 'porque escapando te escaparé')],
    'pt': [('Psalms', 46, 2, 'Ainda que suas águas')],
}
# A verse the source numbers separately that the English counts as the start of the next chapter.
JOIN_NEXT = {'pt': [('Revelation', 12, 18)]}


def split(chapter, v, words):
    i = next(n for n, (num, _) in enumerate(chapter) if num == v)
    text = chapter[i][1]
    at = text.index(words)
    # The words are kept exactly as the edition prints them, punctuation and capitals included.
    chapter[i][1] = text[:at].rstrip()
    rest = text[at:]
    gap = next(n for n in range(i + 1, len(chapter)) if not chapter[n][1])
    for n in range(gap, i + 1, -1):
        chapter[n][1] = chapter[n - 1][1]
    chapter[i + 1][1] = rest


def fix(lang, bible):
    for book, c, v, words in SPLITS.get(lang, []):
        split(bible[book][c - 1], v, words)
    for book, c, v in JOIN_NEXT.get(lang, []):
        ch, nxt = bible[book][c - 1], bible[book][c]
        last = ch.pop()
        assert last[0] == v
        nxt[0][1] = last[1] + ' ' + nxt[0][1]
    # Older editions end Paul's letters and Hebrews with a later note on where each was
    # written ("Escrita de Roma…"). It is not part of Scripture, so it is left out.
    for book in BOOKS[44:58]:
        last = bible[book][-1][-1]
        last[1] = re.sub(r'(Am[ée][nm][.!])\s+[^.!]*?\b(escrita|écrite)\b.*$', r'\1', last[1], flags=re.I)
    if lang == 'ur':
        # 3 John: the Urdu, like many modern Bibles, counts the closing greeting as verse 15;
        # the English counts it in verse 14. Joined, so the notes line up.
        ch = bible['3 John'][0]
        if ch[-1][0] == 15 and ch[-2][0] == 14:
            last = ch.pop()
            moved = NOTES.get('3 John', {}).pop('1:15', [])
            for n in moved:
                n['at'] += len(ch[-1][1]) + 1
            if moved:
                NOTES['3 John'].setdefault('1:14', []).extend(moved)
            if '1:15' in SECTIONS.get('3 John', {}):
                SECTIONS['3 John'].pop('1:15')
            ch[-1] = [14, ch[-1][1] + ' ' + last[1], '14–15']
    # Drop empty verses at the end of a chapter (3 John 15 in some editions).
    for chapters in bible.values():
        for ch in chapters:
            while ch and not ch[-1][1]:
                ch.pop()


def from_usfx(path):
    """Reina-Valera 1909: drop footnotes and cross-references, keep the words."""
    s = open(path, encoding='utf-8-sig').read()
    s = re.sub(r'<f\b.*?</f>|<x\b.*?</x>', '', s, flags=re.S)
    out = {}
    for m in re.finditer(r'<book id="(\w+)"(.*?)</book>', s, re.S):
        if m.group(1) not in USFX:
            continue
        book = BOOKS[USFX.index(m.group(1))]
        body = re.sub(r'<(h|toc|id|s|d)\b[^>]*>.*?</\1>', '', m.group(2), flags=re.S)
        body = re.sub(r'<p sfm="(mt\d?|ms\d?|s\d?|r)"[^>]*>.*?</p>', '', body, flags=re.S)
        chapters = []
        for cm in re.finditer(r'<c id="(\d+)"\s*/>(.*?)(?=<c id=|\Z)', body, re.S):
            verses = []
            for vm in re.finditer(r'<v id="(\d+)[^"]*"\s*/>(.*?)(?=<ve\s*/>|<v id=|\Z)', cm.group(2), re.S):
                text = tidy(vm.group(2))
                # Each chapter's first word is printed in capitals ("EN el principio").
                if not verses:
                    text = re.sub(r'^([A-ZÁÉÍÓÚÑÜ]{2,})\b', lambda w: w.group(1).capitalize(), text)
                verses.append([int(vm.group(1)), text])
            chapters.append(verses)
        out[book] = chapters
    return out


def from_beblia(path):
    s = open(path, encoding='utf-8-sig').read()
    out = {}
    for m in re.finditer(r'<book number="(\d+)">(.*?)</book>', s, re.S):
        book = BOOKS[int(m.group(1)) - 1]
        chapters = []
        for cm in re.finditer(r'<chapter number="\d+">(.*?)</chapter>', m.group(2), re.S):
            chapters.append([[int(v), tidy(t)] for v, t in re.findall(r'<verse number="(\d+)">(.*?)</verse>', cm.group(1), re.S)])
        out[book] = chapters
    return out


# Psalm titles found while reading, by book and chapter (only the Urdu source has them).
HEADINGS = {}
# The translators' section headings ({book: {"c:v": heading}}), shown above that verse,
# and their footnotes ({book: {"c:v": [{"at": offset, "note": [[kind, text], ...]}]}}),
# marked at that place in the verse. A footnote on a psalm title is kept under "c:0".
SECTIONS = {}
NOTES = {}
NOTE_MARK = '\x00'


def footnotes(s):
    """The EPUB's footnotes by id, as [kind, text] pieces: fq = the words the note is on,
    fqa = another way to translate them, xt = a cross reference, ft = the note's own words."""
    out = {}
    for m in re.finditer(r'<aside[^>]*id="(FN\d+)"[^>]*>(.*?)</aside>', s, re.S):
        body = re.sub(r'<a class="notebackref".*?</a>', '', m.group(2), flags=re.S)
        parts = []
        for kind, text in re.findall(r'<span class="(fq|fqa|ft|xt|fv|fk)">(.*?)</span>', body, re.S):
            text = tidy(text).replace('‏', '').strip()
            if text:
                parts.append(['ft' if kind in ('fv', 'fk') else kind, text])
        if parts:
            out[m.group(1)] = parts
    return out


def take_notes(text, notes):
    """Pull the note marks out of a verse's text: (clean text, [{at, note}])."""
    found, clean = [], ''
    for piece in re.split(f'{NOTE_MARK}(FN\\d+){NOTE_MARK}', text):
        if piece.startswith('FN') and piece[2:].isdigit():
            if piece in notes:
                clean = clean.rstrip()
                found.append({'at': len(clean), 'note': notes[piece]})
        else:
            clean += piece
    clean = re.sub(r'\s+', ' ', clean).strip()
    for n in found:
        n['at'] = min(n['at'], len(clean))
    return clean, found


def from_ebible_epub(path):
    """An eBible.org EPUB (Urdu Contemporary Version): one XHTML file per book, each verse
    opening with <span class="verse" id="GN1_1">. Psalm titles (class "d") become the
    chapter's heading; section headings (class "s", "s2") and footnotes are kept beside the
    text; book titles and chapter numbers are left out.
    Joined verses ("6-7") go under the first with the range as their label."""
    out = {}
    with zipfile.ZipFile(path) as z:
        for name in z.namelist():
            code = os.path.basename(name)[:-6]
            if not name.endswith('.xhtml') or code not in USFX:
                continue
            book = BOOKS[USFX.index(code)]
            s = z.read(name).decode('utf-8')
            s = s[s.find('<body'):]
            notes = footnotes(s)
            s = re.sub(r'<div class=["\']footnote["\'].*', '', s, flags=re.S)
            s = re.sub(r'<a [^>]*href=["\']#(FN\d+)["\'][^>]*>.*?</a>', lambda m: f'{NOTE_MARK}{m.group(1)}{NOTE_MARK}', s, flags=re.S)
            s = re.sub(r'<ul class=["\']tnav["\'].*?</ul>', '', s, flags=re.S)
            # A chapter starts at the element carrying its id: the chapter number, or the
            # "Book 2" heading that opens Psalms 42, 73 and 90. Book titles and the Psalms'
            # "Book 2" lines go; section headings are kept as marks.
            s = re.sub(r'<div class=["\'](?:psalmlabel|ms\d?)["\']>.*?</div>', '', s, flags=re.S)
            s = re.sub(r'<div class=["\'](?:mt\d?|r|sp|qa|b|mr)["\'][^>]*>.*?</div>', '', s, flags=re.S)
            chapters, chapter, section = {}, None, None
            # Ids are letters, then the book's number for 1 Samuel and the like ("S1"), then
            # the chapter: S11_1 is 1 Samuel 1:1.
            pre = '[A-Z]+' + (r'\d' if book[0].isdigit() else '')
            marks = (rf'<div class=["\'](?:psalmlabel|ms\d?)["\'] id=["\']{pre}(\d+)_0["\']>.*?</div>'
                     rf'|<div class=["\']d["\'][^>]*>((?:(?!<span class="verse").)*?)</div>'
                     rf'|<span class="verse" id="{pre}(\d+)_(\d+)((?:‏?-\d+)?)">[^<]*</span>'
                     rf'|<div class=["\']s\d?["\'][^>]*>(.*?)</div>')
            pieces = list(re.finditer(marks, s, re.S))
            for i, m in enumerate(pieces):
                end = pieces[i + 1].start() if i + 1 < len(pieces) else len(s)
                if m.group(1):
                    chapter = int(m.group(1))
                    chapters.setdefault(chapter, [])
                    # A psalm title printed as a plain line before verse 1 (Psalm 69).
                    before = tidy(re.sub(r'<[^>]+>', ' ', s[m.end():end]))
                    if book == 'Psalms' and before:
                        HEADINGS.setdefault(book, {})[str(chapter)] = take_notes(before, notes)[0]
                elif m.group(6) is not None:
                    head = take_notes(tidy(re.sub(r'<[^>]+>', '', m.group(6))), notes)[0]
                    # Two headings in a row (a main one and a smaller one) are kept as two lines.
                    section = f'{section}\n{head}' if section and head and head != section else (section or head)
                    # A heading can fall in the middle of a verse (1 Corinthians 12:31): the rest
                    # of that verse follows it, and the heading is shown before the next verse.
                    rest = tidy(re.sub(r'<[^>]+>', ' ', re.sub(r'</?span\b[^>]*>', '', s[m.end():end])))
                    verses = chapters.get(chapter)
                    if rest and verses:
                        more, found = take_notes(rest, notes)
                        key = f'{chapter}:{verses[-1][0]}'
                        for n in found:
                            n['at'] += len(verses[-1][1]) + 1
                        verses[-1][1] += ' ' + more
                        if found:
                            NOTES.setdefault(book, {}).setdefault(key, []).extend(found)
                elif m.group(2) is not None:
                    line, found = take_notes(tidy(re.sub(r'<[^>]+>', '', m.group(2))), notes)
                    verses = chapters.get(chapter)
                    if verses:
                        # A closing line after the last verse (Habakkuk 3:19, "For the director
                        # of music…"), which the English prints as part of that verse.
                        key = f'{chapter}:{verses[-1][0]}'
                        for n in found:
                            n['at'] += len(verses[-1][1]) + 1
                        verses[-1][1] += ' ' + line
                        if found:
                            NOTES.setdefault(book, {}).setdefault(key, []).extend(found)
                    elif book == 'Psalms':
                        # A psalm title, sometimes printed over two lines (Psalm 77): both are kept.
                        titles = HEADINGS.setdefault(book, {})
                        before = titles.get(str(chapter))
                        if before:
                            for n in found:
                                n['at'] += len(before) + 1
                        titles[str(chapter)] = f'{before} {line}' if before else line
                        if found:
                            NOTES.setdefault(book, {}).setdefault(f'{chapter}:0', []).extend(found)
                else:
                    v = int(m.group(4))
                    upto = m.group(5).replace('‏', '').lstrip('-')
                    # Lines break, inline words don't.
                    raw = tidy(re.sub(r'<[^>]+>', ' ', re.sub(r'</?span\b[^>]*>', '', s[m.end():end])))
                    text, found = take_notes(raw, notes)
                    c = int(m.group(3))
                    chapters.setdefault(c, []).append([v, text] + ([f'{v}–{upto}'] if upto else []))
                    if section:
                        SECTIONS.setdefault(book, {})[f'{c}:{v}'] = section
                        section = None
                    if found:
                        NOTES.setdefault(book, {})[f'{c}:{v}'] = found
            out[book] = [chapters[c] for c in sorted(chapters)]
    return out


def from_scrollmapper(path):
    data = json.load(open(path, encoding='utf-8'))
    out = {}
    for i, b in enumerate(data['books']):
        out[BOOKS[i]] = [[[v['verse'], tidy(v['text'])] for v in c['verses']] for c in b['chapters']]
    return out


def main():
    lang, path = sys.argv[1], sys.argv[2]
    reader = {'es': from_scrollmapper if path.endswith('.json') else from_usfx, 'fr': from_beblia, 'pt': from_scrollmapper, 'ur': from_ebible_epub}[lang]
    bible = reader(path)
    fix(lang, bible)
    out_dir = os.path.join(ROOT, 'public', f'bible-{lang}')
    os.makedirs(out_dir, exist_ok=True)
    total, differ = 0, []
    for book in BOOKS:
        chapters = [c for c in bible.get(book, []) if c]
        web = json.load(open(os.path.join(ROOT, 'public', 'bible', f'{slug(book)}.json'), encoding='utf-8'))['chapters']
        if len(chapters) != len(web):
            differ.append(f'{book}: {len(chapters)} chapters, WEB has {len(web)}')
        # The last verse a chapter covers, counting a joined range ("29–30") to its end.
        last = lambda c: max(int(v[2].split('–')[-1]) if len(v) > 2 else v[0] for v in c)
        for i, (c, w) in enumerate(zip(chapters, web)):
            if len(c) != len(w) and last(c) != last(w):
                differ.append(f'{book} {i + 1}: {last(c)} verses, WEB {last(w)}')
        empty = [f'{book} {i + 1}:{v[0]}' for i, c in enumerate(chapters) for v in c if not v[1]]
        if empty:
            differ.append('empty: ' + ', '.join(empty[:5]))
        total += sum(len(c) for c in chapters)
        with open(os.path.join(out_dir, f'{slug(book)}.json'), 'w', encoding='utf-8') as f:
            json.dump({'book': book, 'chapters': chapters, 'headings': HEADINGS.get(book, {}),
                       **({'sections': SECTIONS[book]} if book in SECTIONS else {}), **({'notes': NOTES[book]} if book in NOTES else {})}, f, ensure_ascii=False, separators=(',', ':'))
    print(lang, total, 'verses;', len(differ), 'chapters differ from the WEB')
    for d in differ:
        print('  ', d)


if __name__ == '__main__':
    main()
