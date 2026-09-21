"""Print Hebrew-family diction witnesses on disk for Ps 9 (= Heb 9 + 10), and a few verses of finished psalms.
python3.13 research/psalterium/ps009/show.py [cnbb|kjv|rsv|ids <psalm> <id> ...]"""
import json
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
consult = root / 'consult'


def bolls(name):
    path = consult / name
    if not path.exists():
        print(f'-- {name} missing')
        return
    for v in json.loads(path.read_text(encoding='utf-8')):
        print(v.get('verse'), re.sub(r'<[^>]+>', '', v.get('text', '')))


what = sys.argv[1] if len(sys.argv) > 1 else 'cnbb'
if what in ('cnbb', 'kjv', 'rsv'):
    tag = {'cnbb': 'CNBB', 'kjv': 'KJV', 'rsv': 'RSVCE'}[what]
    for ch in (9, 10):
        print(f'## {tag} Heb {ch}')
        bolls(f'bolls-{tag}-19-{ch}.json')
elif what == 'ids':
    psalm = int(sys.argv[2])
    prayed = json.loads((root / f'ps{psalm:03d}' / 'prayed.json').read_text(encoding='utf-8'))
    sys.path.insert(0, str(root))
    from latin import resolve  # noqa: E402
    flat = resolve(prayed)
    for vid in sys.argv[3:]:
        print(vid, flat.get(vid))
