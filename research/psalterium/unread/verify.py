"""Run checks.py and ps020/validate.py on every psalm this review touched; print exit codes and the last lines."""

import subprocess
from pathlib import Path

root = Path(__file__).resolve().parent.parent
for name, number in [('ps004', 4), ('ps006', 6), ('ps007', 7), ('ps009', 9), ('ps016', 16), ('ps017', 17), ('ps030', 30),
                     ('ps031', 31), ('ps117', 117), ('ps118', 118), ('ps233', 233)]:
    folder = root / name
    for cmd in (['python3.13', str(root / 'checks.py'), str(folder), str(number)], ['python3.13', str(root / 'ps020/validate.py'), str(folder)]):
        run = subprocess.run(cmd, capture_output=True, text=True)
        tail = (run.stdout + run.stderr).strip().splitlines()[-1:] or ['']
        print(f'{name} {Path(cmd[1]).name}: exit {run.returncode} | {tail[0][:160]}')
