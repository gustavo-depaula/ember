"""Insert Ps 120's row into PROGRESS.md after the row of the highest psalm below 120 in the 1–150 run
(skipping the early Compline/Prime block at the top, which holds 117 and 118). Reads and writes in one go."""
import re
from pathlib import Path

here = Path(__file__).resolve().parent
progress = here.parent / 'PROGRESS.md'
row = (here / 'progress_row.txt').read_text(encoding='utf-8').strip()
lines = progress.read_text(encoding='utf-8').split('\n')
if any(line.startswith('| 120 |') for line in lines):
    print('already there')
    raise SystemExit
start = next(i for i, line in enumerate(lines) if line.startswith('| 1 |'))
best, at = -1, None
for i, line in enumerate(lines[start:], start):
    m = re.match(r'\| (\d+) \|', line)
    if m and best < int(m.group(1)) < 120:
        best, at = int(m.group(1)), i
lines.insert(at + 1, row)
progress.write_text('\n'.join(lines), encoding='utf-8')
print('inserted after', best)
