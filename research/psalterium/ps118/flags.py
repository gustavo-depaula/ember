"""Print the soft flags of checks.md from a given verse number on (default 33). Run after partial.py:
python3.13 research/psalterium/ps118/flags.py 33"""

import re
import sys
from pathlib import Path

first = int(sys.argv[1]) if len(sys.argv) > 1 else 33
text = (Path(__file__).resolve().parent / 'checks.md').read_text(encoding='utf-8')
current = None
for line in text.splitlines():
    heading = re.match(r'## (118:(\d+))', line)
    if heading:
        current = heading.group(1) if int(heading.group(2)) >= first else None
        continue
    if line.startswith('## '):
        current = line
    if not current:
        continue
    if line.startswith('|') and not line.startswith('| colon') and not line.startswith('| ---'):
        cells = [c.strip() for c in line.strip('|').split('|')]
        if cells[-1]:
            print(current, '|', cells[4], '|', cells[2], '→', cells[5], '|', cells[-1])
    elif line.strip() and not line.startswith('|'):
        print(current, line)
