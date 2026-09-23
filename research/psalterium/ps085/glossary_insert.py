"""Ps 85's glossary work: appends via ps005/glossary_add.py, then new rows inserted in psalm order
(terms before the first Ps 86 term row; the formula row before Ps 86's). Re-reads and writes in one go."""
import json
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


def insertBefore(anchor, rows):
    at = next(i for i, line in enumerate(lines) if line.startswith(anchor))
    for row in reversed([r for r in rows if r not in lines]):
        lines.insert(at, row)
        print('inserted:', row[:50])


insertBefore('| illic |', data['terms'])
insertBefore('| *Fundaménta ejus * in móntibus sanctis*', data['formulas'])
glossary.write_text('\n'.join(lines), encoding='utf-8')
