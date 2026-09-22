"""Print glossary rows whose Latin column matches a regex (accent-blind).
usage: python3.13 gloss_rows.py REGEX [maxchars]"""
import re, sys, unicodedata
from pathlib import Path

def strip(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()

pat = re.compile(strip(sys.argv[1]))
mx = int(sys.argv[2]) if len(sys.argv) > 2 else 500
g = Path(__file__).resolve().parent.parent / 'glossary.md'
for n, line in enumerate(g.read_text(encoding='utf-8').splitlines(), 1):
    if not line.startswith('|'):
        continue
    cols = line.split('|')
    if len(cols) < 3:
        continue
    if pat.search(strip(cols[1])):
        print(n, line[:mx])
        print()
