"""Render and check the psalms redrafted from the review of the finished work (2026-09-21).

python3.13 research/psalterium/review/apply/rerender.py
Whole psalms: render.py then checks.py. Staged psalms (9, 17, 36, 118): render.py then their partial.py.
"""

import subprocess
from pathlib import Path

root = Path(__file__).resolve().parents[2]
repo = root.parents[1]
staged = {9, 17, 36, 118}
for number in (5, 9, 11, 13, 17, 30, 36, 90, 118):
    folder = root / f'ps{number:03d}'
    cmds = [['python3.13', str(root / 'render.py'), str(folder), str(number)]]
    cmds.append(['python3.13', str(folder / 'partial.py')] if number in staged else ['python3.13', str(root / 'checks.py'), str(folder), str(number)])
    for cmd in cmds:
        run = subprocess.run(cmd, capture_output=True, text=True, cwd=repo)
        lines = (run.stdout + run.stderr).strip().splitlines()
        print(f'ps{number:03d} {Path(cmd[1]).name}: exit {run.returncode}')
        if run.returncode:
            print('   ' + '\n   '.join(lines[-10:]))
