"""Print context around matches of a regex in glossary.md (or a given file).
Usage: python3.13 grepctx.py REGEX [WIDTH] [FILE]
"""
import re
import sys
from pathlib import Path

pat = re.compile(sys.argv[1])
width = int(sys.argv[2]) if len(sys.argv) > 2 else 200
f = Path(sys.argv[3]) if len(sys.argv) > 3 else Path(__file__).resolve().parent.parent / 'glossary.md'
for n, line in enumerate(f.read_text().splitlines(), 1):
    for m in pat.finditer(line):
        a, b = max(0, m.start() - width), min(len(line), m.end() + width)
        key = line.split('|')[1][:60] if line.startswith('|') else ''
        print(f'{n} [{key.strip()}]: …{line[a:b]}…\n')
