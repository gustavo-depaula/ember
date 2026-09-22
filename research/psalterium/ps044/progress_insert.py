"""Insert the Ps 44 row into PROGRESS.md before the Ps 45 row, and move the Ps 43 row (appended after 48's neighbours) just above it.
Reads and writes in one go, since other agents edit the file. Run: python3.13 research/psalterium/ps044/progress_insert.py"""
from pathlib import Path

here = Path(__file__).resolve().parent
progress = here.parent / 'PROGRESS.md'
row = (here / 'progress_row.txt').read_text(encoding='utf-8').strip()
lines = progress.read_text(encoding='utf-8').split('\n')
lines = [l for l in lines if not l.startswith('| 44 |')]
row43 = [l for l in lines if l.startswith('| 43 |')]
lines = [l for l in lines if not l.startswith('| 43 |')]
at = next(i for i, l in enumerate(lines) if l.startswith('| 45 |'))
lines[at:at] = row43 + [row]
progress.write_text('\n'.join(lines), encoding='utf-8')
print('inserted 44 before 45; moved', len(row43), 'row(s) for 43')
