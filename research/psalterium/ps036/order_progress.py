"""Move the Ps 36 PROGRESS row to sit after the highest-numbered psalm row below 36 (progress_add appends at the end).
python3.13 research/psalterium/ps036/order_progress.py"""
from pathlib import Path

path = Path(__file__).resolve().parent.parent / 'PROGRESS.md'
lines = path.read_text(encoding='utf-8').split('\n')
row = next(i for i, l in enumerate(lines) if l.startswith('| 36 |'))
moved = lines.pop(row)


def number(line):
    head = line.split('|')[1].strip().split(' ')[0]
    return int(head) if head.isdigit() else None


candidates = [i for i, l in enumerate(lines) if l.startswith('| ') and number(l) is not None and 17 < number(l) < 36]
after = max(candidates, key=lambda i: (number(lines[i]), i))
lines.insert(after + 1, moved)
path.write_text('\n'.join(lines), encoding='utf-8')
print('moved after psalm', number(lines[after]), 'to line', after + 2)
