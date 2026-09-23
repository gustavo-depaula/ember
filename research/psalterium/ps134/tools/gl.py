"""Print glossary rows whose first column matches any of the given regexes (case-insensitive, accent-folded).
Usage: python3.13 gl.py [--full] [--mention 134] pat1 pat2 ...
"""
import re
import sys
import unicodedata

path = 'research/psalterium/glossary.md'
args = sys.argv[1:]
full = '--full' in args
args = [a for a in args if a != '--full']
mention = None
if '--mention' in args:
    i = args.index('--mention')
    mention = args[i + 1]
    del args[i:i + 2]


def fold(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()


pats = [re.compile(fold(p)) for p in args]
for n, line in enumerate(open(path, encoding='utf-8'), 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    first = fold(cells[1]) if len(cells) > 1 else ''
    hit = any(p.search(first) for p in pats)
    if mention and re.search(r'\b' + mention + r'[:\s]', line):
        hit = True
    if hit:
        text = line.rstrip()
        print(n, text if full else text[:700])
        print()
