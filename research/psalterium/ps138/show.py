"""Print the rendered Portuguese (prayed.vos.json) and the Latin of given verse ids from other psalms.
Usage: python3.13 show.py 118:158 3:6 62:10 ..."""
import json
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
latin_dir = root.parents[1] / 'content/do/horas/Latin/Psalterium/Psalmorum'
for ref in sys.argv[1:]:
    n = int(ref.split(':')[0])
    folder = root / f'ps{n:03d}'
    vos = folder / 'prayed.vos.json'
    pt = json.loads(vos.read_text(encoding='utf-8')) if vos.exists() else {}
    lat = {}
    lf = latin_dir / f'Psalm{n}.txt'
    if lf.exists():
        for line in lf.read_text(encoding='utf-8').splitlines():
            m = re.match(r'(\d+:\d+[a-z]?)\s+(.*)', line)
            if m:
                lat[m.group(1)] = m.group(2)
    keys = [k for k in set(pt) | set(lat) if k == ref or re.fullmatch(re.escape(ref) + r'[a-z]', k)]
    if not keys:
        print(ref, '— not found')
    for k in sorted(keys):
        print(f'{k}\n  LA {lat.get(k, "-")}\n  PT {pt.get(k, "(not translated)")}')
