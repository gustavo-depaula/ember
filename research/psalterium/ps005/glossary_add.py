"""Add a psalm's evidence to glossary.md without touching rulings.
python3.13 research/psalterium/ps005/glossary_add.py <data.json>
data: {"append": [{"row": "| astáre |", "text": "…"}], "terms": ["| … |"], "formulas": ["| … |"]}
- append: adds text to the END of the last cell of the one row that starts with `row` (rulings stay as they are)
- terms / formulas: new rows appended at the end of that table
Idempotent: text already present is skipped. Reads and writes in one go, because other agents edit the file too."""
import json
import sys
from pathlib import Path

glossary = Path(__file__).resolve().parents[1] / 'glossary.md'
data = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
lines = glossary.read_text(encoding='utf-8').split('\n')
report = []

for item in data.get('append', []):
    hits = [i for i, line in enumerate(lines) if line.startswith(item['row'])]
    if len(hits) != 1:
        report.append(f"!! {item['row']}: {len(hits)} rows match, skipped")
        continue
    i = hits[0]
    if item['text'].strip() in lines[i]:
        continue
    body = lines[i].rstrip()
    assert body.endswith('|')
    lines[i] = body[:-1].rstrip() + ' ' + item['text'].strip() + ' |'
    report.append(f"appended to {item['row']}")


def endOfTable(heading):
    start = next(i for i, line in enumerate(lines) if line.startswith(heading))
    last = start
    for i in range(start + 1, len(lines)):
        if lines[i].startswith('## '):
            break
        if lines[i].startswith('|'):
            last = i
    return last


for key, heading in (('terms', '## Terms'), ('formulas', '## Formulas')):
    for row in data.get(key, []):
        if row in lines:
            continue
        lines.insert(endOfTable(heading) + 1, row)
        report.append(f'new {key} row: {row[:40]}')

glossary.write_text('\n'.join(lines), encoding='utf-8')
print('\n'.join(report) or 'nothing to do')
