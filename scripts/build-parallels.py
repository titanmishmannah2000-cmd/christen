#!/usr/bin/env python3
"""Build public/parallels.json: places where the Bible tells the same event more than once.

Sources (both public domain, written by Christian scholars as study harmonies):
  - A. T. Robertson, A Harmony of the Gospels for Students of the Life of Christ (1922):
    scripts/parallels/robertson-sections.txt (his section list) and robertson-titles.txt
    (our plain titles for the sections told in more than one place).
  - William Day Crockett, A Harmony of the Books of Samuel, Kings, and Chronicles (1897):
    scripts/parallels/crockett.txt.

Every reference is checked against the World English Bible in public/bible/, so a range
that runs past the end of a chapter stops the build.

Accounts are listed in Bible order (Matthew, Mark, Luke, John).

Output: {"sources": {...}, "sections": [{"t": title, "s": "r"|"c", "a": [[book index, [[c1, v1, c2, v2], ...]], ...]}]}
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HERE = ROOT / 'scripts' / 'parallels'
BOOKS_JS = (ROOT / 'src' / 'data' / 'books.js').read_text(encoding='utf-8')
BOOKS = re.findall(r"'([^']+)'", BOOKS_JS[BOOKS_JS.index('export const BOOKS'):].split('}')[0])
ABBR = {'Matt.': 'Matthew', 'Mark': 'Mark', 'Luke': 'Luke', 'John': 'John', '1 Cor.': '1 Corinthians', 'Acts': 'Acts'}
ABBR.update({b: b for b in ['1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles']})

_cache = {}


def last_verse(book, chapter):
    if book not in _cache:
        _cache[book] = json.loads((ROOT / 'public' / 'bible' / f"{book.lower().replace(' ', '')}.json").read_text(encoding='utf-8'))
    chapters = _cache[book]['chapters']
    if not 1 <= chapter <= len(chapters):
        sys.exit(f'{book} has no chapter {chapter}')
    return max(v for v, _ in chapters[chapter - 1])


def parse(refs):
    """'Matt. 8:18, 23-27; Mark 4:35-41' -> [(book, [(c1, v1, c2, v2), ...]), ...]"""
    out = []
    for part in [p.strip() for p in refs.split(';')]:
        m = re.match(r'((?:\d )?[A-Z][a-z]+\.?)\s+(.*)', part)
        if m and m.group(1) in ABBR:
            out.append((ABBR[m.group(1)], []))
            part = m.group(2)
        last = None
        for piece in [x.strip() for x in part.split(',')]:
            m = re.match(r'^(?:(\d+):)?(\d+)(?:-(?:(\d+):)?(\d+))?$', piece)
            if not m or not out:
                sys.exit(f'Cannot read {piece!r} in {refs!r}')
            c1 = int(m.group(1)) if m.group(1) else last
            if c1 is None:
                sys.exit(f'No chapter for {piece!r} in {refs!r}')
            v1 = int(m.group(2))
            c2 = int(m.group(3)) if m.group(3) else c1
            v2 = int(m.group(4)) if m.group(4) else v1
            book = out[-1][0]
            if v1 > last_verse(book, c1) or v2 > last_verse(book, c2) or (c2, v2) < (c1, v1):
                sys.exit(f'{book} {c1}:{v1}-{c2}:{v2} is not in the World English Bible')
            out[-1][1].append([c1, v1, c2, v2])
            last = c2
    return out


def rows(name):
    for line in (HERE / name).read_text(encoding='utf-8').splitlines():
        if line.strip() and not line.startswith('#'):
            yield [x.strip() for x in line.split('|')]


def main():
    sections = []
    refs = {n: r for n, r in rows('robertson-sections.txt')}
    for n, title in rows('robertson-titles.txt'):
        accounts = parse(refs[n])
        if len(accounts) < 2:
            sys.exit(f'Robertson {n} has only one account')
        sections.append({'t': title, 's': 'r', 'a': sorted([BOOKS.index(b), spans] for b, spans in accounts)})
    for _, title, r in rows('crockett.txt'):
        accounts = parse(r)
        sections.append({'t': title, 's': 'c', 'a': sorted([BOOKS.index(b), spans] for b, spans in accounts)})
    data = {
        'sources': {
            'r': 'A. T. Robertson, A Harmony of the Gospels for Students of the Life of Christ (1922)',
            'c': 'William Day Crockett, A Harmony of the Books of Samuel, Kings, and Chronicles (1897)',
        },
        'sections': sections,
    }
    out = ROOT / 'public' / 'parallels.json'
    out.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(f'{len(sections)} sections -> {out.relative_to(ROOT)} ({out.stat().st_size // 1024} KB)')


if __name__ == '__main__':
    main()
