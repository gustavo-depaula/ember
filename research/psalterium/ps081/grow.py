"""Find glossary rows whose first cell matches a pattern (accents stripped). Run: python3.13 research/psalterium/ps081/grow.py 'pat1|pat2' [maxchars]"""

import re
import sys
import unicodedata
from pathlib import Path

strip = lambda s: ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()  # noqa: E731
pat = re.compile(sys.argv[1])
width = int(sys.argv[2]) if len(sys.argv) > 2 else 1200
for n, line in enumerate((Path(__file__).resolve().parent.parent / 'glossary.md').read_text(encoding='utf-8').splitlines(), 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    if len(cells) > 2 and pat.search(strip(cells[1])):
        print(n, line[:width])
        print()
