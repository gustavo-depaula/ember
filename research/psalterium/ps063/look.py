"""Print finished verses of other psalms (Latin + prayed Portuguese) for consistency checks.

python3.13 research/psalterium/ps063/look.py 10:3 36:14 ...   or   look.py --grep 'regex'  (searches Latin of all translated psalms)
"""
import json
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent


def load(n):
    d = root / f'ps{int(n):03d}'
    try:
        pt = json.loads((d / 'prayed.vos.json').read_text(encoding='utf-8'))
        la = json.loads((d / 'latin.json').read_text(encoding='utf-8'))
    except FileNotFoundError:
        return {}, {}
    return la, pt


args = sys.argv[1:]
if args and args[0] == '--grep':
    rx = re.compile(args[1], re.I)
    for d in sorted(root.glob('ps[0-9][0-9][0-9]')):
        if d.name == 'ps063':
            continue
        la, pt = load(d.name[2:])
        for k, v in la.items():
            if rx.search(v):
                print(f'{k}\n  LA {v}\n  PT {pt.get(k)}')
else:
    for ref in args:
        la, pt = load(ref.split(':')[0])
        print(f'{ref}\n  LA {la.get(ref)}\n  PT {pt.get(ref)}')
