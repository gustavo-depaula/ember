"""Insert ps077's PROGRESS row in psalm order (after the last row numbered below 77, before any above). Re-reads and writes in one go."""
import re
from pathlib import Path

here = Path(__file__).resolve().parent
progress = here.parent / 'PROGRESS.md'
row = (here / 'progress_row.txt').read_text(encoding='utf-8').strip()
lines = progress.read_text(encoding='utf-8').split('\n')
if any(line.startswith('| 77 |') for line in lines):
    print('already there')
    raise SystemExit
at = None
for i, line in enumerate(lines):
    m = re.match(r'\| (\d+) \|', line)
    if m and int(m.group(1)) < 77:
        at = i
assert at is not None
lines.insert(at + 1, row)
progress.write_text('\n'.join(lines), encoding='utf-8')
print('inserted after line', at + 1)
