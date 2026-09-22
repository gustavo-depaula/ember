"""Move Ps 57's new Term rows to sit before the Ps 59 rows (psalm order)."""
import json
from pathlib import Path
here = Path(__file__).resolve().parent
g = here.parent / 'glossary.md'
rows = json.loads((here / 'glossary_rows.json').read_text(encoding='utf-8'))['terms']
lines = g.read_text(encoding='utf-8').split('\n')
for r in rows:
    assert lines.count(r) == 1, r[:40]
lines = [l for l in lines if l not in rows]
anchor = next(i for i, l in enumerate(lines) if l.startswith('| *in umbra* (locative'))
nxt = lines[anchor + 1]
assert 'Ps 59' in nxt, nxt[:80]
lines[anchor + 1:anchor + 1] = rows
g.write_text('\n'.join(lines), encoding='utf-8')
print('moved after line', anchor + 1)
