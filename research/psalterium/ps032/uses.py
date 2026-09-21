"""Accent-blind search of DO's Latin (horas + missa) for liturgical uses of psalm phrases.
python3.13 research/psalterium/ps032/uses.py 'phrase regex' ...   (skips the Psalmorum folder)"""
import re
import sys
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parents[3] / 'content/do'
dirs = [root / 'horas/Latin', root / 'missa/Latin']


def plain(text):
    text = text.replace('æ', 'ae').replace('ǽ', 'ae').replace('œ', 'oe').replace('Æ', 'Ae')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()


for pattern in sys.argv[1:]:
    regex = re.compile(pattern)
    print(f'## {pattern}')
    n = 0
    for d in dirs:
        for path in sorted(d.rglob('*.txt')):
            if 'Psalmorum' in path.parts:
                continue
            for i, line in enumerate(path.read_text(encoding='utf-8', errors='replace').splitlines(), 1):
                if regex.search(plain(line)):
                    n += 1
                    if n <= 14:
                        print(f'{path.relative_to(root)}:{i}: {line.strip()[:160]}')
    print(f'-- {n} lines\n')
