"""Collate the three archive.org OCRs of the 1916 reprint of Challoner's Garden of the Soul (1741 impression):
gardenofsoul0000vari (base), bwb_Y0-ARJ-962, gardenofsoul0000vari_t3p2. The scans are of different copies of the
same setting, so the lines match; lines are aligned first, then the words inside matched lines, and each word is
voted (two of three agree; otherwise the reading that is a word). Writes the collated base text.
usage: python3.13 challoner_garden_collate.py OUT.txt"""
import difflib, pickle, re, sys

ROOT = '/Users/gustavo/Documents/prayer'
S = ROOT + '/research/sourcing/_skipped/samples/'
FILES = ['gardenofsoul0000vari.txt', 'bwb_Y0-ARJ-962.txt', 'gardenofsoul0000vari_t3p2.txt']
LEX = pickle.load(open(ROOT + '/research/sourcing/_cfg_en/lex_en.pkl', 'rb'))
DICT = set(w.strip().lower() for w in open('/usr/share/dict/words'))


def known(t):
    w = re.sub(r"^[^\w]+|[^\w]+$", '', t).lower()
    return bool(w) and (w in DICT or LEX.get(w, 0) >= 3 or w.isdigit())


def norm(line):
    return re.sub(r"[^a-z]", '', line.lower())


def align_lines(a, b):
    """-> dict base line index -> other line index, for lines that pair up"""
    sm = difflib.SequenceMatcher(None, [norm(x) for x in a], [norm(x) for x in b], autojunk=False)
    m = {}
    for tag, i1, i2, j1, j2 in sm.get_opcodes():
        if tag == 'equal' or (tag == 'replace' and i2 - i1 == j2 - j1):
            for k in range(i2 - i1):
                m[i1 + k] = j1 + k
    return m


def vote_line(a, b, c):
    ta = a.split()
    alt = []
    for o in (b, c):
        if o is None:
            alt.append([None] * len(ta))
            continue
        to = o.split()
        sm = difflib.SequenceMatcher(None, [norm(x) for x in ta], [norm(x) for x in to], autojunk=False)
        col = [None] * len(ta)
        for tag, i1, i2, j1, j2 in sm.get_opcodes():
            if tag in ('equal', 'replace') and i2 - i1 == j2 - j1:
                for k in range(i2 - i1):
                    col[i1 + k] = to[j1 + k]
            elif tag == 'replace' and i2 - i1 == 1:
                col[i1] = ' '.join(to[j1:j2]) if j2 - j1 <= 2 else None
        alt.append(col)
    out = []
    changed = 0
    for i, w in enumerate(ta):
        x, y = alt[0][i], alt[1][i]
        pick = w
        if x is not None and x == y and x != w:
            pick = x
        elif any(o is not None and o != w and len(o) > len(w) and (o.lower().endswith(w.lower()) or o.lower().startswith(w.lower()))
                 and known(o) and (y is None or x is None or x == y) for o in (x, y)):
            pick = x if x is not None else y  # a letter lost at the gutter in the base scan only
        elif not known(w):
            for o in (x, y):
                if o is not None and all(known(p) for p in o.split()):
                    pick = o
                    break
        if pick != w:
            changed += 1
        out.append(pick)
    return ' '.join(out), changed


def main():
    texts = [open(S + f, errors='replace').read().split('\n') for f in FILES]
    base = texts[0]
    maps = [align_lines(base, t) for t in texts[1:]]
    out, n = [], 0
    for i, line in enumerate(base):
        if not line.strip():
            out.append(line)
            continue
        others = [texts[k + 1][maps[k][i]] if i in maps[k] else None for k in range(2)]
        v, c = vote_line(line, *others)
        n += c
        out.append(v)
    open(sys.argv[1], 'w').write('\n'.join(out))
    print('lines', len(base), 'aligned', [len(m) for m in maps], 'words changed', n)


if __name__ == '__main__':
    main()
