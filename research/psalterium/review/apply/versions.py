"""For every psalm folder: the current version, and whether prayed.v<version>.json already exists (and equals prayed.json)."""

import json
from pathlib import Path

root = Path(__file__).resolve().parents[2]
for folder in sorted(root.glob('ps[0-9][0-9][0-9]')):
    path = folder / 'prayed.json'
    if not path.exists():
        continue
    version = json.loads(path.read_text(encoding='utf-8'))['version']
    kept = folder / f'prayed.v{version}.json'
    state = 'absent' if not kept.exists() else ('SAME as prayed.json' if kept.read_bytes() == path.read_bytes() else 'EXISTS, differs')
    print(folder.name, version, state)
