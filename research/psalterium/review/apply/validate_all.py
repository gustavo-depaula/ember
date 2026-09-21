"""Run ps020/validate.py (and optionally checks.py) on every psalm folder that has a prayed.json.

python3.13 research/psalterium/review/apply/validate_all.py [--checks]
"""

import re
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[2]
bad = 0
for folder in sorted(root.glob('ps[0-9][0-9][0-9]')):
    if not (folder / 'prayed.json').exists():
        continue
    number = int(re.search(r'\d+', folder.name).group())
    cmds = [['python3.13', str(root / 'ps020/validate.py'), str(folder)]]
    if '--checks' in sys.argv:
        cmds.append(['python3.13', str(root / 'checks.py'), str(folder), str(number)])
    for cmd in cmds:
        run = subprocess.run(cmd, capture_output=True, text=True)
        out = (run.stdout + run.stderr).strip().splitlines()
        if run.returncode:
            bad += 1
        print(f'{folder.name} {Path(cmd[1]).name}: exit {run.returncode} | {(out[-1] if out else "")[:150]}')
        if run.returncode and 'validate' in cmd[1]:
            print('   ' + '\n   '.join(out[:8]))
print('failures:', bad)
