"""List every flagged colon of a verse range from partial.py's report, so an audit note quotes real flags.
flags_part3.py with the bounds as arguments (that file is left as it was).
python3.13 research/psalterium/ps118/flags_part4.py [first last]      (default 129 176)"""

import re
import subprocess
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
first, last = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv) > 2 else (129, 176)
out = subprocess.run([sys.executable, str(here / 'partial.py')], capture_output=True, text=True)
print('partial.py exit', out.returncode)
if out.returncode:
    print(out.stderr[-2000:])
verse = None
count = 0
for line in out.stdout.splitlines():
    m = re.match(r'## (118:(\d+))', line)
    if m:
        verse = int(m.group(2))
        continue
    if verse is None or not first <= verse <= last:
        continue
    if line.startswith('| `'):
        cells = [c.strip() for c in line.strip('|').split('|')]
        if cells[-1]:
            count += 1
            print(f'118:{verse} {cells[0]} [{cells[2]}→{cells[5]} syl, {cells[6]}] {cells[4]} -> {cells[-1]}')
    elif line.strip() and not line.startswith('|'):
        print(f'118:{verse} NOTE {line}')
print(count, 'flagged cola')
print('--- tail')
print('\n'.join(out.stdout.splitlines()[-12:]))
