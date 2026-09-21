"""Run checks.py on every finished psalm folder (staged ones through their partial.py). Exit 1 if any fails.

    python3.13 research/psalterium/tests/check-all.py
"""

import json
import subprocess
import sys
from pathlib import Path

here = Path(__file__).resolve().parents[1]
failed = []
for folder in sorted(here.glob('ps[0-9][0-9][0-9]')):
    if not (folder / 'prayed.json').exists():
        continue
    n = str(int(folder.name[2:]))
    staged = 'range' in json.loads((folder / 'prayed.json').read_text(encoding='utf-8'))
    script = folder / 'partial.py' if staged and (folder / 'partial.py').exists() else here / 'checks.py'
    args = [sys.executable, str(script)] + ([] if script.name == 'partial.py' else [str(folder), n])
    result = subprocess.run(args, capture_output=True, text=True)
    status = 'ok' if result.returncode == 0 else 'FAIL'
    print(f'{folder.name} {status}' + ('' if script.name == 'checks.py' else ' (partial.py)'))
    if result.returncode:
        failed.append(folder.name)
        print('   ', (result.stdout + result.stderr).strip().splitlines()[-1:])
sys.exit(1 if failed else 0)
