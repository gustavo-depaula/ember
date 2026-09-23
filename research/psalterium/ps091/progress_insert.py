"""Insert Ps 91's row into PROGRESS.md: before the first row numbered above 91 that follows a row numbered 80–90 (the batch run), else at the end of that run. Reads and writes in one go."""
import re
from pathlib import Path

here = Path(__file__).resolve().parent
progress = here.parent / 'PROGRESS.md'
row = (here / 'progress_row.txt').read_text(encoding='utf-8').strip()
lines = progress.read_text(encoding='utf-8').split('\n')
if any(line.startswith('| 91 |') for line in lines):
    print('already there')
    raise SystemExit
nums = [(i, int(m.group(1))) for i, line in enumerate(lines) if (m := re.match(r'\| (\d+) \|', line))]
# the Ps 80s run: the last row in 80..90 that sits after the row '| 87 |'
at87 = next(i for i, n in nums if n == 87)
at = at87
for i, n in nums:
    if i > at87 and 87 <= n < 91:
        at = i
    if i > at87 and n > 91:
        break
lines.insert(at + 1, row)
progress.write_text('\n'.join(lines), encoding='utf-8')
print('inserted after line', at + 1)
