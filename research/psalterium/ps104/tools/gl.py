"""Grep glossary.md rows for the Latin lemmas of Ps 104; print each hit truncated."""
import re
import sys

path = 'research/psalterium/glossary.md'
lines = open(path, encoding='utf-8').read().split('\n')
width = int(sys.argv[2]) if len(sys.argv) > 2 else 700
pats = sys.argv[1].split(',')
seen = set()
for p in pats:
    rx = re.compile(p, re.I)
    for i, l in enumerate(lines):
        if not l.startswith('|'):
            continue
        head = l[:200]
        if rx.search(head) and i not in seen:
            seen.add(i)
            print(f'--- [{p}] line {i+1}')
            print(l[:width])
