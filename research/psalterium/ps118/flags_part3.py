"""List every flagged colon of 118:81–128 from partial.py's report, so the closing audit note quotes real flags.
python3.13 research/psalterium/ps118/flags_part3.py"""

import re
import subprocess
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
out = subprocess.run([sys.executable, str(here / 'partial.py')], capture_output=True, text=True)
print('partial.py exit', out.returncode)
verse = None
count = 0
for line in out.stdout.splitlines():
    m = re.match(r'## (118:(\d+))', line)
    if m:
        verse = int(m.group(2))
        continue
    if verse is None or not 81 <= verse <= 128 or not line.startswith('| `'):
        if verse is None or not line.startswith('|'):
            if verse and 81 <= verse <= 128 and line.strip() and not line.startswith('|'):
                print(f'118:{verse} NOTE {line}')
        continue
    cells = [c.strip() for c in line.strip('|').split('|')]
    if cells[-1]:
        count += 1
        print(f'118:{verse} {cells[0]} {cells[4]} -> {cells[-1]}')
print(count, 'flagged cola')
tail = out.stdout.splitlines()[-15:]
print('--- tail')
print('\n'.join(tail))
