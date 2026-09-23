"""Print finished renderings of given verse ids (from prayed.vos.json), for consistency checks.

Usage: python3.13 research/psalterium/ps110/look.py 9:2a 95:6 ...
"""
import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
for vid in sys.argv[1:]:
    n = int(vid.split(':')[0])
    f = root / f'ps{n:03d}' / 'prayed.vos.json'
    if not f.exists():
        print(vid, '| (no prayed.vos.json)')
        continue
    d = json.loads(f.read_text())
    hits = {k: v for k, v in d.items() if k == vid or k.startswith(vid) and not k[len(vid):].isdigit()}
    for k, v in hits.items():
        print(k, '|', v)
    if not hits:
        print(vid, '| (not found)')
