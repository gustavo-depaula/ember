"""The Everyman volume 'The Little Flowers, The Mirror of Perfection, and St. Bonaventure's Life of St. Francis'
(London: Dent, 1910), archive.org thelittleflowers00francuoft, read from its _djvu.xml into a flat list of blocks:
('head', text) for centred or capital lines, ('para', text) for paragraphs, which start at an indented line or after
a short one and run on over the page break. Running heads ("The Mirror of Perfection", "Life of St. Francis") and
page numbers are dropped. Shared by speculum_perfectionis_build.py and legenda_maior_salter.py."""
import re, statistics, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from djvu_pages import pages  # noqa: E402
from en_common import join_lines  # noqa: E402

COORDS = '/Users/gustavo/Documents/prayer/research/sourcing/_skipped/coords/thelittleflowers00francuoft_djvu.xml'
HEAD = re.compile(r"(?i)^\s*\d{0,3}\s*(the\s+mirror\s+of\s+perfection|life\s+of\s+st\.?\s+francis|the\s+little\s+flowers)\s*\d{0,3}\s*$")


def caps(t):
    a = [c for c in t if c.isalpha()]
    return len(a) >= 3 and sum(c.isupper() for c in a) >= 0.85 * len(a)


def blocks(first, last):
    P = pages(COORDS)
    out = []
    for pi in range(first, last):
        ls = [l for par in P[pi] for l in par]
        ls = [l for l in ls if not HEAD.match(l['text']) and not re.fullmatch(r"[\dIl|. ]{1,4}", l['text'].strip())]
        # a page-top running head that names the chapter beside the page number ("Prologue 305", "312 His Conversion")
        if ls and len(ls[0]['text'].split()) <= 9 and re.fullmatch(r"(?:\d{2,3}\s+[A-Z].*|[A-Z][^.!?]*?\s+\d{2,3})", ls[0]['text'].strip()):
            ls = ls[1:]
        if not ls:
            continue
        if not ls:
            continue
        full = [l for l in ls if l['x1'] - l['x0'] > 0.8 * max(x['x1'] - x['x0'] for x in ls)] or ls
        L = statistics.median(l['x0'] for l in full)
        R = statistics.median(l['x1'] for l in full)
        for i, l in enumerate(ls):
            t = l['text'].strip()
            lm, rm = l['x0'] - L, R - l['x1']
            if caps(t) and (len(t.split()) >= 2 or re.match(r"^(CHAPTER|SECTION|PROLOGUE)\b", t) or (out and out[-1][0] == 'head')):
                if out and out[-1][0] == 'head' and not re.match(r"^(CHAPTER|SECTION|PROLOGUE)\b", t):
                    out[-1] = ('head', join_lines([out[-1][1], t]))
                else:
                    out.append(('head', t))
                continue
            prev = ls[i - 1] if i else None
            block_indent = prev is not None and prev['x0'] - L > 25 and abs(l['x0'] - prev['x0']) < 15  # a passage set in from the margin
            new = (lm > 25 and not block_indent) or (prev is not None and R - prev['x1'] > 0.1 * (R - L) and re.search(r"[.!?:\"”’)]\s*$", prev['text']) and out and out[-1][0] == 'para') \
                or (out and out[-1][0] == 'head')
            if i == 0 and out and out[-1][0] == 'para' and lm <= 25:
                new = False
            if new or not out or out[-1][0] != 'para':
                out.append(('para', t))
            else:
                out[-1] = ('para', join_lines([out[-1][1], t]))
    return out


ROMAN = {}
def _roman(n):
    s = ''
    for v, r in [(100, 'C'), (90, 'XC'), (50, 'L'), (40, 'XL'), (10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')]:
        while n >= v:
            s += r
            n -= v
    return s
for _i in range(1, 200):
    ROMAN[_roman(_i)] = _i


def roman_value(s):
    return ROMAN.get(s.replace(' ', '').replace('l', 'I').replace('1', 'I'))


SMALL = {'of', 'the', 'and', 'in', 'to', 'a', 'an', 'by', 'for', 'on', 'with', 'from', 'at', 'or', 'as', 'that', 'he', 'his', 'him', 'it',
         'was', 'were', 'be', 'is', 'which', 'when', 'who', 'whom', 'how', 'what', 'they', 'their', 'them', 'would', 'should', 'not', 'into',
         'unto', 'upon', 'had', 'did', 'but', 'so', 'should', 'after', 'before', 'being', 'had', 'have', 'its'}


def tcase(t):
    t = re.sub(r"\s+", ' ', t).strip().rstrip('.')
    out = []
    for i, w in enumerate(t.split(' ')):
        lw = w.lower()
        if re.fullmatch(r"[IVXLC]+[.,]?", w) and len(w) > 1:
            out.append(w)
        elif i and lw.strip(',;:') in SMALL:
            out.append(lw)
        else:
            out.append(lw[:1].upper() + lw[1:])
    t = ' '.join(out)
    return re.sub(r"\bSt\.", 'St.', t)
