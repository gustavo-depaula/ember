"""Look up glossary rows whose first cell matches a regex; print the head of each row and any sentence naming a given psalm.

python3.13 research/psalterium/ps101/gloss.py '<regex>' [maxchars]
"""
import re
import sys
from pathlib import Path

g = (Path(__file__).resolve().parent.parent / 'glossary.md').read_text(encoding='utf-8').split('\n')
pat = re.compile(sys.argv[1], re.I)
width = int(sys.argv[2]) if len(sys.argv) > 2 else 400
for n, line in enumerate(g, 1):
    if not line.startswith('| '):
        continue
    cells = line.split(' | ')
    if not pat.search(cells[0]):
        continue
    head = ' | '.join(cells[:3])
    print(f'{n}: {head[:width]}')
    for m in re.finditer(r'\*\*Ps 10[12][^*]*\*\*[^|]{0,300}', line):
        print('   >>', m.group(0))
    print()
