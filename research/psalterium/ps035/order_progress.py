"""Move the Ps 34 and Ps 35 PROGRESS rows to sit after Ps 33 (progress_add appends at the end). python3.13 research/psalterium/ps035/order_progress.py"""
from pathlib import Path

path = Path(__file__).resolve().parent.parent / 'PROGRESS.md'
lines = path.read_text(encoding='utf-8').split('\n')
for psalm, after in (('34', '33'), ('35', '34')):
    row = next(i for i, l in enumerate(lines) if l.startswith(f'| {psalm} |'))
    moved = lines.pop(row)
    at = next(i for i, l in enumerate(lines) if l.startswith(f'| {after} |'))
    lines.insert(at + 1, moved)
    print(psalm, 'moved to line', at + 2)
path.write_text('\n'.join(lines), encoding='utf-8')
