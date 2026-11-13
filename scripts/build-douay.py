#!/usr/bin/env python3
"""Build public/bible-dra/: the Douay-Rheims Bible (Challoner revision, 1749-52, public
domain), the traditional Catholic Bible in English, with all 73 books.

Source: the scrollmapper bible_databases project,
  https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/DRC.json

  python3 scripts/build-douay.py DRC.json

The Douay-Rheims follows the Latin Vulgate's numbering: most psalms are one number lower,
psalm titles count as verses, Daniel 3 holds the Song of the Three Young Men, and verse
breaks differ in about 65 other chapters. Every note, word study and connection in the
app is keyed to the World English Bible's numbering, so each Douay verse is lined up with
the English verse it translates (by the words they share, in order), and keeps its own
Douay number as a label to show the reader.

File shape, as public/bible/ plus labels:
  {book, chapters: [[[verse, text, label?], ...]], headings: {chapter: text}, douay: {chapter: text}}
  verse  the WEB verse number this text sits beside (extra Douay passages get 1000 + n)
  label  the Douay number to show, when it differs ("23", "3:98", "22-23")
  douay  a line saying where the chapter sits in the Douay-Rheims, when that differs
The seven books only Catholic Bibles have (Tobit, Judith, Wisdom, Sirach, Baruch, 1 and 2
Maccabees), and the longer Esther (chapters 10:4 to 16) and Daniel (3:24-90, 13 and 14),
keep the Douay numbering as it is.
"""
import json
import os
import re
import sys

ROOT = os.path.join(os.path.dirname(__file__), '..')
slug = lambda b: b.lower().replace(' ', '')
OUT = os.path.join(ROOT, 'public', 'bible-dra')

BOOKS66 = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth',
           '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra',
           'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon',
           'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos',
           'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
           'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians',
           'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
           '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter',
           '1 John', '2 John', '3 John', 'Jude', 'Revelation']
DEUTERO = ['Tobit', 'Judith', 'Wisdom', 'Sirach', 'Baruch', '1 Maccabees', '2 Maccabees']


def source_name(b):
    m = re.match(r'(\d) (.*)', b)
    if m:
        return 'I' * int(m.group(1)) + ' ' + m.group(2)
    return {'Revelation': 'Revelation of John'}.get(b, b)


def tidy(t):
    return re.sub(r'\s+', ' ', t.replace('¶', '')).strip()


# ── word overlap, for lining verses up ─────────────────────────────
STOP = set('the and of to a in that is he it for his i you not be they them with shall was all on as but which unto by your from have are this my him will me their at were so there when what who or her she we our us an then also had do no if into one up out said say says upon even thee thou thy thine ye hath doth saith these those its did been has am'.split())
SWAP = {'yahweh': 'lord', 'jehovah': 'lord', 'thee': 'you', 'thou': 'you', 'ye': 'you', 'thy': 'your', 'thine': 'your'}


def stem(w):
    w = SWAP.get(w, w)
    for suf in ('eth', 'est', 'ing', 'ed', 'es', 's'):
        if len(w) > len(suf) + 3 and w.endswith(suf):
            return w[: -len(suf)]
    return w


def words(t):
    return {stem(w) for w in re.findall(r"[a-z]+", t.lower()) if w not in STOP and len(w) > 2}


def sim(a, b):
    if not a or not b:
        return 0.0
    return 2 * len(a & b) / (len(a) + len(b))


def align(web, dr):
    """web, dr: lists of word sets. Returns a list of moves (wi, wn, di, dn)."""
    n, m = len(web), len(dr)
    NEG = -1e9
    band = max(40, abs(n - m) + 20)
    best = {(0, 0): (0.0, None)}
    for i in range(n + 1):
        lo, hi = max(0, round(i * m / max(n, 1)) - band), min(m, round(i * m / max(n, 1)) + band)
        for j in range(lo, hi + 1):
            if (i, j) not in best:
                continue
            s0 = best[(i, j)][0]
            def push(ni, nj, s, mv):
                if ni > n or nj > m:
                    return
                if s0 + s > best.get((ni, nj), (NEG,))[0]:
                    best[(ni, nj)] = (s0 + s, (i, j, mv))
            if i < n and j < m:
                push(i + 1, j + 1, sim(web[i], dr[j]), (1, 1))
            if i < n and j + 1 < m:
                push(i + 1, j + 2, sim(web[i], dr[j] | dr[j + 1]) - 0.06, (1, 2))
            if i + 1 < n and j < m:
                push(i + 2, j + 1, sim(web[i] | web[i + 1], dr[j]) - 0.06, (2, 1))
            if i < n:
                push(i + 1, j, -0.12, (1, 0))
            if j < m:
                push(i, j + 1, -0.12, (0, 1))
    if (n, m) not in best:
        raise SystemExit('alignment failed')
    moves, at = [], (n, m)
    while best[at][1]:
        i, j, (wn, dn) = best[at][1]
        moves.append((i, wn, j, dn))
        at = (i, j)
    return moves[::-1]


def line_up(web_seq, dr_seq):
    """web_seq: [(c, v, text)], dr_seq: [(c, v, text)].
    Returns {(c, v): [dr indices]} and the mean overlap of matched pairs."""
    moves = align([words(t) for _, _, t in web_seq], [words(t) for _, _, t in dr_seq])
    home = {}          # dr index -> web index
    scores = []
    for wi, wn, di, dn in moves:
        if wn and dn:
            for k in range(dn):
                home[di + k] = wi
            scores.append(sim(set().union(*[words(web_seq[wi + k][2]) for k in range(wn)]),
                              set().union(*[words(dr_seq[di + k][2]) for k in range(dn)])))
    # A Douay verse with no English partner (a psalm title, an extra line) joins its neighbour.
    for j in range(len(dr_seq)):
        if j not in home:
            nb = next((home[k] for k in range(j - 1, -1, -1) if k in home), None)
            if nb is None:
                nb = next((home[k] for k in range(j + 1, len(dr_seq)) if k in home), 0)
            home[j] = nb
    out = {}
    for j in sorted(home):
        c, v, _ = web_seq[home[j]]
        out.setdefault((c, v), []).append(j)
    return out, (sum(scores) / len(scores) if scores else 0)


def label_for(js, dr_seq, web_c, show_chapter):
    first, last = dr_seq[js[0]], dr_seq[js[-1]]
    def one(c, v):
        return f'{c}:{v}' if (show_chapter or c != web_c) else str(v)
    a = one(first[0], first[1])
    if len(js) == 1:
        return a
    b = str(last[1]) if last[0] == first[0] else f'{last[0]}:{last[1]}'
    return f'{a}–{b}'


# Psalms: Douay (Vulgate) number for each English (Hebrew) number, as groups that line up.
def psalm_groups():
    g = [([n], [n]) for n in range(1, 9)]
    g.append(([9, 10], [9]))
    g += [([n], [n - 1]) for n in range(11, 114)]
    g.append(([114, 115], [113]))
    g.append(([116], [114, 115]))
    g += [([n], [n - 1]) for n in range(117, 147)]
    g.append(([147], [146, 147]))
    g += [([n], [n]) for n in range(148, 151)]
    return g


def main():
    src = json.load(open(sys.argv[1], encoding='utf-8'))
    # The source leaves an empty verse where the Douay joins two English verses; drop those.
    dr = {b['name']: [[(v['verse'], tidy(v['text'])) for v in c['verses'] if tidy(v['text'])] for c in b['chapters']] for b in src['books']}
    os.makedirs(OUT, exist_ok=True)
    report, total = [], 0

    def write(book, chapters, headings=None, douay=None):
        nonlocal total
        total += sum(len(c) for c in chapters)
        with open(os.path.join(OUT, f'{slug(book)}.json'), 'w', encoding='utf-8') as f:
            json.dump({'book': book, 'chapters': chapters, 'headings': headings or {}, 'douay': douay or {}},
                      f, ensure_ascii=False, separators=(',', ':'))

    for book in BOOKS66:
        webdata = json.load(open(os.path.join(ROOT, 'public', 'bible', f'{slug(book)}.json'), encoding='utf-8'))
        web = webdata['chapters']
        src_ch = dr[source_name(book)]
        out = [[] for _ in web]
        douay = {}
        extra = []   # whole Douay chapters past the English ones
        if book == 'Psalms':
            groups = psalm_groups()
        else:
            # The whole book in one run, so verses that move across a chapter end still line up.
            groups = [(list(range(1, len(web) + 1)), list(range(1, len(src_ch) + 1)))]
        for wcs, dcs in groups:
            web_seq = [(c, v, t) for c in wcs for v, t in web[c - 1]]
            dr_seq = [(c, v, t) for c in dcs for v, t in src_ch[c - 1]]
            if book == 'Esther':      # the Greek additions, kept as the Douay numbers them
                tail = [x for x in dr_seq if (x[0], x[1]) > (10, 3)]
                dr_seq = [x for x in dr_seq if (x[0], x[1]) <= (10, 3)]
                dr_seq = [x for x in dr_seq if x[0] <= 10]
            if book == 'Daniel':      # the Song of the Three, and Susanna and Bel
                song = [x for x in dr_seq if x[0] == 3 and 24 <= x[1] <= 90]
                tail = [x for x in dr_seq if x[0] > 12]
                dr_seq = [x for x in dr_seq if not (x[0] == 3 and 24 <= x[1] <= 90) and x[0] <= 12]
            where, score = line_up(web_seq, dr_seq)
            for (c, v), js in where.items():
                text = ' '.join(dr_seq[j][2] for j in js)
                lab = label_for(js, dr_seq, c, False)
                if book == 'Psalms' and len(dcs) == 1:   # the chapter line already names the Douay psalm
                    lab = lab.replace(f'{dcs[0]}:', '')
                entry = [v, text] if lab == str(v) else [v, text, lab]
                out[c - 1].append(entry)
            if book == 'Psalms':
                for c in wcs:
                    if dcs != [c]:
                        douay[str(c)] = 'Psalm ' + ' and '.join(str(d) for d in dcs) + ' in the Douay-Rheims'
            if score < 0.25:
                report.append(f'{book} {wcs[0]}: low overlap {score:.2f}')
        if book == 'Daniel':
            # Song of the Three Young Men after Daniel 3:23, as in Catholic Bibles.
            at = next(k for k, e in enumerate(out[2]) if e[0] == 23) + 1
            out[2][at:at] = [[1000 + v, t, str(v)] for _, v, t in song]
            extra = [[[v, t] for _, v, t in [x for x in tail if x[0] == c]] for c in (13, 14)]
        if book == 'Esther':
            out[9] += [[v, t] for c, v, t in tail if c == 10]
            extra = [[[v, t] for _, v, t in [x for x in tail if x[0] == c]] for c in range(11, 17)]
        for ch in out:
            ch.sort(key=lambda e: (e[0] >= 1000 and 23.5 or e[0], e[0]))
        if book == 'Daniel':  # keep the song in place after the sort
            ch = out[2]
            song_e = [e for e in ch if e[0] >= 1000]
            rest = [e for e in ch if e[0] < 1000]
            at = next(k for k, e in enumerate(rest) if e[0] == 23) + 1
            out[2] = rest[:at] + song_e + rest[at:]
        shifted = sum(1 for ch in out for e in ch if len(e) > 2 and e[0] < 1000)
        if shifted:
            report.append(f'{book}: {shifted} verses carry their Douay number')
        write(book, out + extra, {}, douay)

    for book in DEUTERO:
        write(book, [[[v, t] for v, t in c] for c in dr[source_name(book)]])

    print(f'Douay-Rheims: {total} verses in {len(BOOKS66) + len(DEUTERO)} books')
    for r in report:
        print('  ', r)


if __name__ == '__main__':
    main()
