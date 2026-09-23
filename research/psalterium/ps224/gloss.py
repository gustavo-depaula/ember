"""Print glossary rows whose first cell matches any regex (accent-folded), truncated to N chars (Ps 224 lookups).
python3.13 research/psalterium/ps224/gloss.py [-n 600] '<regex>' [...]"""
import sys
import unicodedata
import re
from pathlib import Path


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('ǽ', 'ae').replace('Æ', 'Ae')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()


args = sys.argv[1:]
limit = 600
if args and args[0] == '-n':
    limit, args = int(args[1]), args[2:]
pats = [re.compile(plain(a)) for a in args]
root = Path(__file__).resolve().parents[1]
section = ''
for n, line in enumerate((root / 'glossary.md').read_text(encoding='utf-8').splitlines(), 1):
    if line.startswith('#'):
        section = line
        continue
    if not line.startswith('|'):
        continue
    first = line.split('|')[1] if line.count('|') > 1 else line
    if any(p.search(plain(first)) for p in pats):
        print(f'{n}: {line[:limit]}\n')
