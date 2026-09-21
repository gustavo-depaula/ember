"""Move the Ps 31 PROGRESS row to sit after Ps 30 (progress_add appends at the end). python3.13 research/psalterium/ps031/order_progress.py"""
from pathlib import Path

path = Path(__file__).resolve().parent.parent / 'PROGRESS.md'
lines = path.read_text(encoding='utf-8').split('\n')
row = next(i for i, l in enumerate(lines) if l.startswith('| 31 |'))
moved = lines.pop(row)
after = next(i for i, l in enumerate(lines) if l.startswith('| 30 |'))
lines.insert(after + 1, moved)
path.write_text('\n'.join(lines), encoding='utf-8')
print('moved to line', after + 2)
