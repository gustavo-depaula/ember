"""Grep the DO Latin (horas + missa) for phrases of Ps 105 used outside the psalm; print file and line.

python3.13 research/psalterium/ps105/tools/uses.py 'regex' ['regex' ...]
"""
import re
import sys
from pathlib import Path

base = Path('content/do')
files = [p for p in base.rglob('*.txt') if '/Latin/' in str(p) and 'Psalmorum' not in str(p)]
for pat in sys.argv[1:]:
    rx = re.compile(pat)
    print(f'=== {pat}')
    for p in sorted(files):
        for line in p.read_text(encoding='utf-8', errors='replace').split('\n'):
            if rx.search(line):
                print(f'  {p.relative_to(base)}: {line[:220]}')
