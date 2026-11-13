#!/usr/bin/env python3
"""Build the Hebrew and Greek word data from STEPBible (CC BY 4.0, STEPBible.org,
Tyndale House, Cambridge).

Download these files from https://github.com/STEPBible/STEPBible-Data into one folder:
  Translators Amalgamated OT+NT/TAHOT Gen-Deu, Jos-Est, Job-Sng, Isa-Mal  (save as TAHOT-<range>.txt)
  Translators Amalgamated OT+NT/TAGNT Mat-Jhn, Act-Rev                    (save as TAGNT-<range>.txt)
  Lexicons/TBESH ... .txt and TBESG ... .txt                              (save as TBESH.txt, TBESG.txt)
then run:  python3 scripts/build-original.py <folder>

It writes into public/original/:
  <book>.json      the words of every verse: [word, sounds-like, meaning here, number, grammar]
  words-he.json    every Hebrew dictionary word: number -> [word, sounds-like, short meaning, times used]
  words-el.json    the same for Greek
  defs/<lang>-<n>.json  the longer dictionary entry, split into small files loaded on demand
  where-he.json, where-el.json  every verse each word is used in (for "Find every place")

The verse numbers follow English Bibles (the first reference STEPBible gives),
so they line up with the World English Bible. Greek words are the ones in the
Byzantine text, which is the text the World English Bible New Testament
translates. Hebrew rows added from the Greek Old Testament (type X) are left out.
"""
import glob
import html
import json
import os
import re
import sys

SRC = sys.argv[1]
ROOT = os.path.join(os.path.dirname(__file__), '..')
OUT = os.path.join(ROOT, 'public', 'original')

STEP_BOOKS = ('Gen Exo Lev Num Deu Jos Jdg Rut 1Sa 2Sa 1Ki 2Ki 1Ch 2Ch Ezr Neh Est Job Psa Pro Ecc Sng '
              'Isa Jer Lam Ezk Dan Hos Jol Amo Oba Jon Mic Nam Hab Zep Hag Zec Mal '
              'Mat Mrk Luk Jhn Act Rom 1Co 2Co Gal Eph Php Col 1Th 2Th 1Ti 2Ti Tit Phm Heb Jas 1Pe 2Pe 1Jn 2Jn 3Jn Jud Rev').split()
APP_BOOKS = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
             '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
             'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
             'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
             'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
             'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
             'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
             '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
             '1 John', '2 John', '3 John', 'Jude', 'Revelation']
BOOK_OF = dict(zip(STEP_BOOKS, APP_BOOKS))
slug = lambda b: b.lower().replace(' ', '')

REF = re.compile(r'^([1-3A-Z][A-Za-z0-9]{2})\.(\d+)\.(\d+)([^#\t]*)#(\d+)=([^\t]*)\t')
# Greek references sometimes carry a second number: [c.v] is where the word falls in
# the King James verse division, which the World English Bible follows, and
# {c.v} for Romans is where the Byzantine text puts the closing praise (14:24-26).
ALT = re.compile(r'\[(\d+)\.(\d+)\]|\{(\d+)\.(\d+)\}')


def bible_verse_counts():
    counts = {}
    for b in APP_BOOKS:
        with open(os.path.join(ROOT, 'public', 'bible', slug(b) + '.json'), encoding='utf-8') as f:
            counts[b] = [[v for v, _ in ch] for ch in json.load(f)['chapters']]
    return counts


def clean_html(s, limit=900):
    s = re.sub(r'<br\s*/?>', '\n', s, flags=re.I)
    s = re.sub(r'<ref=[^>]*>', '', s)
    s = re.sub(r'<[^>]+>', '', s)
    s = html.unescape(s).replace('__', '')
    s = re.sub(r'[ \t]+', ' ', s)
    s = '\n'.join(line.strip() for line in s.split('\n') if line.strip())
    if len(s) > limit:
        s = s[:limit].rsplit(' ', 1)[0] + ' …'
    return s


def read_lexicon(path, lang):
    out = {}
    with open(path, encoding='utf-8') as f:
        for line in f:
            cols = line.rstrip('\n').split('\t')
            if len(cols) < 8 or not re.match(r'^[HG]\d{4}', cols[0]):
                continue
            key = cols[1].split(' ')[0].strip()
            if not re.match(r'^[HG]\d{4}[A-Za-z]?$', key) or key in out:
                continue
            out[key] = {
                'lemma': cols[3].strip(), 'tr': cols[4].strip().replace('.', ''), 'gloss': cols[6].strip(),
                'def': clean_html(cols[7]),
            }
    return out


def tidy_gloss(g):
    g = g.replace('/ ', ' ').replace('/', ' ').replace('<obj.>', '[object marker]')
    g = re.sub(r'<([^>]*)>', r'(\1)', g)
    return re.sub(r'\s+', ' ', g).strip()


def hebrew_word(cols):
    word = cols[1].replace('/', '').replace('\\', '')
    tr = cols[2].replace('/', '').replace('.', '').lower()
    gloss = tidy_gloss(cols[3])
    parts = [p.split('\\')[0] for p in cols[4].split('/')]
    main = next((i for i, p in enumerate(parts) if p.startswith('{')), len(parts) - 1)
    strong = parts[main].strip('{}')
    morph = cols[5].split('/')
    lang = cols[5][:1]
    seg = morph[main] if main < len(morph) else morph[-1]
    if main == 0:
        seg = seg[1:]
    return [word, tr, gloss, strong, lang + seg]


def greek_word(cols):
    m = re.match(r'^(.*?)\s*\((.*)\)\s*$', cols[1])
    word, tr = (m.group(1), m.group(2)) if m else (cols[1], '')
    word = word.replace('[[', '').replace(']]', '').replace('[', '').replace(']', '').strip()
    tr = tr.replace('[', '').replace(']', '')
    strong, _, morph = cols[3].partition('=')
    gloss = re.sub(r'^\s*(\[\d+\]|\{\d+\.\d+\})\s*', '', cols[2])
    return [word, tr, tidy_gloss(gloss), strong.strip(), morph.strip()], cols[4]


def main():
    counts = bible_verse_counts()
    order = {}
    n = 0
    for b in APP_BOOKS:
        for c, verses in enumerate(counts[b], 1):
            for v in verses:
                order[(b, c, v)] = n
                n += 1

    books = {b: {} for b in APP_BOOKS}
    greek_lemmas = {}
    for path in sorted(glob.glob(os.path.join(SRC, 'TAHOT-*.txt'))) + sorted(glob.glob(os.path.join(SRC, 'TAGNT-*.txt'))):
        greek = 'TAGNT' in path
        with open(path, encoding='utf-8') as f:
            for line in f:
                m = REF.match(line)
                if not m:
                    continue
                code, c, v, alt, _, kind = m.groups()
                a = ALT.search(alt)
                if greek and a and (a.group(1) or code == 'Rom'):
                    c, v = (a.group(1), a.group(2)) if a.group(1) else (a.group(3), a.group(4))
                cols = line.rstrip('\n').split('\t')
                if greek:
                    if 'Byz' not in [e.split('«')[0] for e in cols[5].split('+')]:
                        continue
                    w, lemma = greek_word(cols)
                    lw, _, lg = lemma.partition('=')
                    greek_lemmas.setdefault(w[3], (lw.strip(), lg.strip()))
                else:
                    if kind[:1] not in ('L', 'Q', 'R'):
                        continue
                    w = hebrew_word(cols)
                book = BOOK_OF[code]
                books[book].setdefault(int(c), {}).setdefault(int(v), []).append(w)

    os.makedirs(os.path.join(OUT, 'defs'), exist_ok=True)
    lex = {'he': read_lexicon(os.path.join(SRC, 'TBESH.txt'), 'he'), 'el': read_lexicon(os.path.join(SRC, 'TBESG.txt'), 'el')}
    used = {'he': {}, 'el': {}}
    where = {'he': {}, 'el': {}}
    missing = []
    for bi, b in enumerate(APP_BOOKS):
        lang = 'he' if bi < 39 else 'el'
        chapters = []
        for c, verses in enumerate(counts[b], 1):
            got = books[b].get(c, {})
            chapters.append({str(v): got[v] for v in sorted(got)})
            for v in verses:
                if v not in got:
                    missing.append(f'{b} {c}:{v}')
                    continue
                for w in got[v]:
                    used[lang][w[3]] = used[lang].get(w[3], 0) + 1
                    refs = where[lang].setdefault(w[3], [])
                    o = order[(b, c, v)]
                    if not refs or refs[-1] != o:
                        refs.append(o)
        with open(os.path.join(OUT, slug(b) + '.json'), 'w', encoding='utf-8') as f:
            json.dump({'book': b, 'lang': lang, 'chapters': chapters}, f, ensure_ascii=False, separators=(',', ':'))

    for lang in ('he', 'el'):
        words, defs = {}, {}
        for key, times in sorted(used[lang].items()):
            e = lex[lang].get(key) or lex[lang].get(key[:5])
            if e:
                words[key] = [e['lemma'], e['tr'], e['gloss'], times]
                if e['def']:
                    defs.setdefault(int(key[1:5]) // 250, {})[key] = e['def']
            elif lang == 'el' and key in greek_lemmas:
                lw, lg = greek_lemmas[key]
                words[key] = [lw, '', lg, times]
            else:
                words[key] = ['', '', '', times]
        with open(os.path.join(OUT, f'words-{lang}.json'), 'w', encoding='utf-8') as f:
            json.dump(words, f, ensure_ascii=False, separators=(',', ':'))
        for shard, entries in defs.items():
            with open(os.path.join(OUT, 'defs', f'{lang}-{shard}.json'), 'w', encoding='utf-8') as f:
                json.dump(entries, f, ensure_ascii=False, separators=(',', ':'))
        # Each word's verses as gaps from the one before, in base 36, to keep the file small.
        packed = {}
        for key, refs in where[lang].items():
            prev, gaps = 0, []
            for o in refs:
                gaps.append(o - prev)
                prev = o
            packed[key] = ','.join(base36(g) for g in gaps)
        with open(os.path.join(OUT, f'where-{lang}.json'), 'w', encoding='utf-8') as f:
            json.dump(packed, f, ensure_ascii=False, separators=(',', ':'))

    print('verses in the WEB with no original words:', len(missing))
    for r in missing[:40]:
        print('  ', r)
    print('Hebrew words:', len(used['he']), ' Greek words:', len(used['el']))


def base36(n):
    digits = '0123456789abcdefghijklmnopqrstuvwxyz'
    s = ''
    while True:
        n, r = divmod(n, 36)
        s = digits[r] + s
        if n == 0:
            return s


if __name__ == '__main__':
    main()
