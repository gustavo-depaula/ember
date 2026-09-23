"""Print context windows around a regex in glossary.md (or another file): ctx.py REGEX [width] [file]."""
import re
import sys

rx = re.compile(sys.argv[1])
width = int(sys.argv[2]) if len(sys.argv) > 2 else 250
path = sys.argv[3] if len(sys.argv) > 3 else 'research/psalterium/glossary.md'
lines = open(path, encoding='utf-8').read().split('\n')
for i, l in enumerate(lines):
    for m in rx.finditer(l):
        a = max(0, m.start() - width)
        b = min(len(l), m.end() + width)
        head = l[:80]
        print(f'--- line {i+1} [{head}]')
        print('…' + l[a:b] + '…')
