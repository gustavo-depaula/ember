"""Print finished renderings of given verse ids from other psalms (prayed.vos.json), beside the Latin.

usage: python3.13 research/psalterium/ps085/verses.py 53:5 16:6 24:1 ...
"""
import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
latin_dir = root.parent.parent / 'content/do/horas/Latin/Psalterium/Psalmorum'

for vid in sys.argv[1:]:
    ps = int(vid.split(':')[0])
    folder = root / f'ps{ps:03d}'
    lat = ''
    lf = latin_dir / f'Psalm{ps}.txt'
    if lf.exists():
        for line in lf.read_text().splitlines():
            if line.startswith(vid + ' '):
                lat = line[len(vid) + 1:]
    pt = '(not translated)'
    vf = folder / 'prayed.vos.json'
    if vf.exists():
        pt = json.loads(vf.read_text()).get(vid, '(id missing)')
    print(f'{vid}\n  LA {lat}\n  PT {pt}')
