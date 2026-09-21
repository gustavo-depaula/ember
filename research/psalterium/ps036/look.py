"""Print glossary rows whose first column matches any of the given stems (accent-insensitive), truncated.
python3.13 research/psalterium/ps036/look.py width stem…"""
import sys
import unicodedata
from pathlib import Path

glossary = Path(__file__).resolve().parents[1] / 'glossary.md'


def plain(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s.lower()) if unicodedata.category(c) != 'Mn').replace('æ', 'ae').replace('œ', 'oe')


width = int(sys.argv[1])
stems = [plain(s) for s in sys.argv[2:]]
for n, line in enumerate(glossary.read_text(encoding='utf-8').splitlines(), 1):
    if not line.startswith('|'):
        continue
    cells = line.split('|')
    if len(cells) < 3:
        continue
    head = plain(cells[1])
    for s in stems:
        if s in head:
            print(n, line[:width])
            break
