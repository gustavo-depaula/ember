"""Insert Ps 59's row into PROGRESS.md after the row of the highest psalm below 59 (reads and writes in one go)."""
import re
from pathlib import Path

here = Path(__file__).resolve().parent
progress = here.parent / 'PROGRESS.md'
row = (here / 'progress_row.txt').read_text(encoding='utf-8').strip()
lines = progress.read_text(encoding='utf-8').split('\n')
if any(line.startswith('| 59 |') for line in lines):
    print('already there')
    raise SystemExit
best, at = -1, None
for i, line in enumerate(lines):
    m = re.match(r'\| (\d+) \|', line)
    if m and best <= int(m.group(1)) < 59:
        best, at = int(m.group(1)), i
lines.insert(at + 1, row)
progress.write_text('\n'.join(lines), encoding='utf-8')
print('inserted after', best)
