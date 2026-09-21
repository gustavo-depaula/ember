"""Is each psalm folder's prayed.vos.json the flat text of its current prayed.json?"""

import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root))
from latin import resolve  # noqa: E402

for name in sys.argv[1:]:
    folder = root / name
    now = resolve(json.loads((folder / 'prayed.json').read_text(encoding='utf-8')))
    vos = json.loads((folder / 'prayed.vos.json').read_text(encoding='utf-8'))
    lat = json.loads((folder / 'latin.json').read_text(encoding='utf-8'))
    diff = [k for k in now if vos.get(k) != now[k]]
    print(name, 'vos current' if not diff and list(vos) == list(now) else f'vos STALE {diff[:5]}',
          '| latin ids match' if list(lat) == list(now) else f'| latin ids {len(lat)} vs {len(now)}')
