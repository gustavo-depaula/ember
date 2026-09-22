"""Append Ps 57 evidence to existing glossary rows and add new Term rows at the end of ## Terms.
Reads glossary.md fresh at run time; targeted edits only. Refuses to run twice."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
g = here.parent / 'glossary.md'
data = json.loads((here / 'glossary_rows.json').read_text(encoding='utf-8'))
lines = g.read_text(encoding='utf-8').split('\n')
if any('Ps 57:' in l and 'de fato' in l for l in lines):
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
g.write_text('\n'.join(lines), encoding='utf-8')
print(f"appended {len(data['append'])}, new terms {len(data['terms'])} after line {last + 1}")
