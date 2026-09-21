"""Dry check of ps118/glossary_part4.json against glossary.md: every "append" row prefix must match exactly one
line, and no new term/formula row may duplicate a first cell already present. Writes nothing.
python3.13 research/psalterium/ps118/glossary_rows_check.py"""

import json
from pathlib import Path

here = Path(__file__).resolve().parent
lines = (here.parent / 'glossary.md').read_text(encoding='utf-8').splitlines()
data = json.loads((here / 'glossary_part4.json').read_text(encoding='utf-8'))
for item in data['append']:
    hits = [i for i, line in enumerate(lines) if line.startswith(item['row'])]
    print(len(hits), item['row'], [h + 1 for h in hits])
for row in data['terms'] + data['formulas']:
    first = row.split('|')[1].strip()
    hits = [i + 1 for i, line in enumerate(lines) if line.startswith('| ' + first + ' |')]
    print('new' if not hits else f'ALREADY {hits}', first)
