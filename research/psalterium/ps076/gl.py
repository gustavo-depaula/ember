"""Print glossary rows matching each regex given (case-insensitive, accents stripped), truncated.

python3.13 research/psalterium/ps070/gl.py 'confund' 'erip' ...
"""
import re
import sys
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parent.parent
lines = (root / 'glossary.md').read_text(encoding='utf-8').splitlines()


def flat(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn').lower()


width = 900
args = sys.argv[1:]
if args and args[0].startswith('--w='):
    width = int(args[0][4:])
    args = args[1:]
for pat in args:
    rx = re.compile(pat, re.I)
    print(f'=== {pat}')
    for i, ln in enumerate(lines, 1):
        first = ln.split('|')[1] if ln.startswith('|') and ln.count('|') > 2 else ln[:120]
        if rx.search(flat(first)):
            print(f'{i}: {ln[:width]}')
