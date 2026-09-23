"""Ps 104's glossary work: appends via ps005/glossary_add.py, then new term / formula rows inserted in
psalm order (after the last row whose first reference is Ps 103 or 104 in each table). Re-reads and writes in one go."""
import json
import re
import subprocess
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
glossary = here.parent / 'glossary.md'
data = json.loads((here / 'glossary_rows.json').read_text(encoding='utf-8'))
tmp = here / 'glossary_append.json'
tmp.write_text(json.dumps({'append': data['append']}, ensure_ascii=False), encoding='utf-8')
subprocess.run([sys.executable, str(here.parent / 'ps005' / 'glossary_add.py'), str(tmp)], check=True)
tmp.unlink()

lines = glossary.read_text(encoding='utf-8').split('\n')


def section(heading):
    start = next(i for i, l in enumerate(lines) if l.startswith(heading))
    end = next((i for i in range(start + 1, len(lines)) if lines[i].startswith('## ')), len(lines))
    return start, end


def firstPsalm(line, formula):
    cells = line.split('|')
    text = cells[1] if formula else (cells[4] if len(cells) > 4 else '')
    m = re.search(r'\((\d+):' if formula else r'Ps (\d+)', text)
    return int(m.group(1)) if m else None


def insertAfterPsalm(heading, rows, formula):
    start, end = section(heading)
    at = None
    for i in range(start, end):
        if lines[i].startswith('|'):
            n = firstPsalm(lines[i], formula)
            if n is not None and n <= 104:
                at = i
    assert at is not None
    for row in reversed([r for r in rows if r not in lines]):
        lines.insert(at + 1, row)
        print('inserted after line', at + 1, ':', row[:50])


insertAfterPsalm('## Terms', data['terms'], False)
insertAfterPsalm('## Formulas', data['formulas'], True)
glossary.write_text('\n'.join(lines), encoding='utf-8')
