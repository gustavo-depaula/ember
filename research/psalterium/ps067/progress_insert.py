"""Insert ps067/progress_row.txt into PROGRESS.md right after the row for Ps 66 (idempotent; reads and writes in one go)."""
from pathlib import Path

here = Path(__file__).resolve().parent
path = here.parent / 'PROGRESS.md'
row = (here / 'progress_row.txt').read_text(encoding='utf-8').strip()
lines = path.read_text(encoding='utf-8').split('\n')
if any(l.startswith('| 67 |') for l in lines):
    raise SystemExit('row 67 already present')
hits = [i for i, l in enumerate(lines) if l.startswith('| 66 |')]
if len(hits) != 1:
    raise SystemExit(f'{len(hits)} rows for 66')
lines.insert(hits[0] + 1, row)
path.write_text('\n'.join(lines), encoding='utf-8')
print('inserted at line', hits[0] + 2)
