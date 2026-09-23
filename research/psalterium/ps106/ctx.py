"""Print context around every regex match in a file (default glossary.md).

usage: python3.13 research/psalterium/ps106/ctx.py REGEX [WIDTH] [FILE]
"""
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
pat = re.compile(sys.argv[1])
width = int(sys.argv[2]) if len(sys.argv) > 2 else 200
path = Path(sys.argv[3]) if len(sys.argv) > 3 else root / 'glossary.md'
text = path.read_text()
for no, line in enumerate(text.splitlines(), 1):
    for m in pat.finditer(line):
        a = max(0, m.start() - width)
        b = min(len(line), m.end() + width)
        head = line.split('|')[1][:60] if line.startswith('|') else ''
        print(f'{no} [{head.strip()}]: …{line[a:b]}…')
        print()
