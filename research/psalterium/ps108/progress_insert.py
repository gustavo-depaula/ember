"""Insert ps108's PROGRESS row in psalm order (after the last row numbered below 108, among rows 1–150). Re-reads and writes in one go."""
import json
import re
from pathlib import Path

here = Path(__file__).resolve().parent
progress = here.parent / 'PROGRESS.md'
count = len(json.loads((here / 'prayed.json').read_text(encoding='utf-8'))['decisions'])
row = (here / 'progress_row.txt').read_text(encoding='utf-8').strip()
cells = row.split(' | ')
if cells[5] != str(count):
    raise SystemExit(f'decision count in row is {cells[5]}, prayed.json has {count}')
lines = progress.read_text(encoding='utf-8').split('\n')
if any(line.startswith('| 108 |') for line in lines):
    print('already there')
    raise SystemExit
at = None
for i, line in enumerate(lines):
    m = re.match(r'\| (\d+) \|', line)
    if m and int(m.group(1)) < 108 and i > 10:
        at = i
assert at is not None
lines.insert(at + 1, row)
progress.write_text('\n'.join(lines), encoding='utf-8')
print('inserted after line', at + 1)
