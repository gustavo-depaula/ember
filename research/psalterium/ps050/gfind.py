"""Search the whole glossary (accent-blind) for patterns; print row head + context.
python3.13 gfind.py pat1 pat2 ..."""
import re
import sys
import unicodedata
from pathlib import Path

glossary = Path(__file__).resolve().parents[1] / 'glossary.md'


def plain(text):
    text = text.replace('æ', 'ae').replace('ǽ', 'ae').replace('œ', 'oe')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()


lines = glossary.read_text(encoding='utf-8').splitlines()
for pat in sys.argv[1:]:
    rx = re.compile(plain(pat))
    print(f'## {pat}')
    for n, line in enumerate(lines, 1):
        p = plain(line)
        # plain() keeps length for these chars except æ→ae etc; good enough for context
        for m in rx.finditer(p):
            head = line.split('|')[1].strip()[:60] if line.startswith('|') else ''
            s = max(0, m.start() - 90)
            print(f'  L{n} [{head}] …{p[s:m.end() + 110]}…')
            break
    print()
