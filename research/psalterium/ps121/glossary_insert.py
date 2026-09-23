"""Ps 121's glossary work: appends and new term rows via ps005/glossary_add.py, then the formula row inserted in
psalm order (after the last formula row whose first reference is <= 121). Idempotent; re-reads and writes in one go."""
import json
import re
import subprocess
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
glossary = here.parent / 'glossary.md'
data = json.loads((here / 'glossary_rows.json').read_text(encoding='utf-8'))
tmp = here / 'glossary_append.json'
tmp.write_text(json.dumps({'append': data['append'], 'terms': data['terms']}, ensure_ascii=False), encoding='utf-8')
subprocess.run([sys.executable, str(here.parent / 'ps005' / 'glossary_add.py'), str(tmp)], check=True)
tmp.unlink()

lines = glossary.read_text(encoding='utf-8').split('\n')
start = next(i for i, l in enumerate(lines) if l.startswith('## Formulas'))
end = next((i for i in range(start + 1, len(lines)) if lines[i].startswith('## ')), len(lines))
at = None
for i in range(start, end):
    if lines[i].startswith('|'):
        m = re.search(r'\((\d+):', lines[i].split('|')[1])
        if m and int(m.group(1)) <= 121:
            at = i
assert at is not None
for row in reversed([r for r in data['formulas'] if r not in lines]):
    lines.insert(at + 1, row)
    print('inserted after line', at + 1, ':', lines[at][:60])
glossary.write_text('\n'.join(lines), encoding='utf-8')
