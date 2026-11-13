#!/usr/bin/env python3
"""Build public/footnotes.json: the World English Bible's own footnotes (public domain).

Download eng-web.usfx.xml (the WEB in USFX, published by eBible.org; a copy is kept at
https://raw.githubusercontent.com/seven1m/open-bibles/master/eng-web.usfx.xml), then run:
  python3 scripts/build-footnotes.py eng-web.usfx.xml

Output: { "Book": { "chapter:verse": [[word the note is on, note], ...] } } for the 66 books.
Notes on psalm titles (before verse 1) are filed under verse 0.
"""
import json
import os
import re
import sys

USFX_BOOKS = ('GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SNG '
              'ISA JER LAM EZK DAN HOS JOL AMO OBA JON MIC NAM HAB ZEP HAG ZEC MAL '
              'MAT MRK LUK JHN ACT ROM 1CO 2CO GAL EPH PHP COL 1TH 2TH 1TI 2TI TIT PHM HEB JAS 1PE 2PE 1JN 2JN 3JN JUD REV').split()
APP_BOOKS = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
             '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
             'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
             'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
             'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
             'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
             'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
             '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
             '1 John', '2 John', '3 John', 'Jude', 'Revelation']
BOOK_OF = dict(zip(USFX_BOOKS, APP_BOOKS))
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'footnotes.json')

TOKEN = re.compile(r'<book id="(\w+)"|<c id="(\d+)"|<v id="(\d+)"|<f [^>]*>(.*?)</f>', re.S)


def plain(s):
    s = re.sub(r'<[^>]+>', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()


def main():
    s = open(sys.argv[1], encoding='utf-8').read()
    out = {}
    book = None
    c = v = 0
    last = 0
    for m in TOKEN.finditer(s):
        if m.group(1):
            book, c, v = BOOK_OF.get(m.group(1)), 0, 0
        elif m.group(2):
            c, v = int(m.group(2)), 0
        elif m.group(3):
            v = int(m.group(3))
        elif book and c:
            before = plain(s[last:m.start()])
            word = re.findall(r'[\w’\'-]+', before)
            note = plain(m.group(4))
            note = re.sub(r'^\+\s*', '', note)
            out.setdefault(book, {}).setdefault(f'{c}:{v}', []).append([word[-1] if word else '', note])
        last = m.end()
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, separators=(',', ':'))
    print(sum(len(n) for b in out.values() for n in b.values()), 'notes in', len(out), 'books')


if __name__ == '__main__':
    main()
