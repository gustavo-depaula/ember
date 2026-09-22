"""Print glossary rows whose FIRST cell matches a regex (accent-insensitive), truncated.

python3.13 research/psalterium/ps068/gl.py 'regex' ['regex' ...] [--n 700]
"""
import re
import sys
import unicodedata
from pathlib import Path

glossary = Path(__file__).resolve().parents[1] / 'glossary.md'


def plain(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()


args = sys.argv[1:]
n = 700
if '--n' in args:
    i = args.index('--n')
    n = int(args[i + 1])
    del args[i:i + 2]
lines = glossary.read_text(encoding='utf-8').split('\n')
for pat in args:
    rx = re.compile(plain(pat))
    print(f'=== {pat}')
    for no, line in enumerate(lines, 1):
        if not line.startswith('|'):
            continue
        cells = line.split('|')
        if len(cells) < 3:
            continue
        if rx.search(plain(cells[1])):
            print(f'{no}: {line[:n]}')
