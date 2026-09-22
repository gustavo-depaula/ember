"""Print accent-blind context snippets from glossary.md for each pattern."""
import sys, unicodedata, re, pathlib

def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower().replace('æ', 'ae').replace('œ', 'oe')

g = pathlib.Path(__file__).resolve().parent.parent / 'glossary.md'
lines = g.read_text().splitlines()
for p in sys.argv[1:]:
    print(f'=== {p}')
    for n, line in enumerate(lines, 1):
        f = fold(line)
        for m in re.finditer(fold(p), f):
            a, b = max(0, m.start() - 100), m.end() + 180
            print(f'  {n}: …{f[a:b]}…')
