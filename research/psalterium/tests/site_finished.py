"""Build the site from finished folders only, so a commit never links to a draft still in progress.

Run from the repo root:  python3.13 research/psalterium/tests/site_finished.py

A folder is left out while its prayed.json is missing or its status is not `reviewed`. The build runs site.py with
`--root` on a temporary directory of symlinks, so folders are never renamed under an agent that is working in them.
"""

import json
import subprocess
import sys
import tempfile
from pathlib import Path

here = Path(__file__).resolve().parents[1]


def finished(folder):
    try:
        return json.loads((folder / 'prayed.json').read_text(encoding='utf-8')).get('status') == 'reviewed'
    except (OSError, ValueError):
        return False


with tempfile.TemporaryDirectory() as tmp:
    skipped = []
    for entry in here.iterdir():
        if entry.name.startswith('ps') and entry.name[2:].isdigit() and entry.is_dir() and not finished(entry):
            skipped.append(entry.name)
            continue
        (Path(tmp) / entry.name).symlink_to(entry)
    subprocess.run([sys.executable, str(here / 'site.py'), '--root', tmp, '--out', str(here / 'site')], check=True)
print('left out:', ', '.join(sorted(skipped)) or 'none')
