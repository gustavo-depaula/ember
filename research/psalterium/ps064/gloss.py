"""Append Ps 64 evidence to glossary rows; add the new Term row at the end of ## Terms and the formula row at the end of ## Formulas.
Reads glossary.md fresh at run time; targeted edits only. Refuses to run twice."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
g = here.parent / 'glossary.md'
data = json.loads((here / 'glossary_rows.json').read_text(encoding='utf-8'))
lines = g.read_text(encoding='utf-8').split('\n')
if any(l.startswith('| replére (passive) |') for l in lines):
    raise SystemExit('already applied')

for item in data['append']:
    hits = [i for i, l in enumerate(lines) if l.startswith(item['row'])]
    if len(hits) != 1:
        raise SystemExit(f"row not unique: {item['row']} {hits}")
    i = hits[0]
    line = lines[i].rstrip()
    assert line.endswith('|'), line[:80]
    lines[i] = line[:-1].rstrip() + ' ' + item['text'] + ' |'

formulas = next(i for i, l in enumerate(lines) if l.startswith('## Formulas'))
last = max(i for i in range(formulas) if lines[i].startswith('| '))
lines[last + 1:last + 1] = data['terms']

formulas = next(i for i, l in enumerate(lines) if l.startswith('## Formulas'))
doublets = next(i for i, l in enumerate(lines) if l.startswith('## Doublets'))
last = max(i for i in range(formulas, doublets) if lines[i].startswith('| '))
lines[last + 1:last + 1] = data['formulas']
g.write_text('\n'.join(lines), encoding='utf-8')
print(f"appended {len(data['append'])}, new terms {len(data['terms'])}, formulas {len(data['formulas'])}")
