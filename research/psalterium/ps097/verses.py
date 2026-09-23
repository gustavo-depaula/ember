"""Print finished prayed text (prayed.vos.json) + Latin for given verse ids, e.g. 32:3 43:4. Or a regex over all prayed texts with -r."""
import json, re, sys
from pathlib import Path
root = Path(__file__).resolve().parent.parent
lat_dir = root.parent.parent / 'content/do/horas/Latin/Psalterium/Psalmorum'

def latin(ps):
    f = lat_dir / f'Psalm{ps}.txt'
    out = {}
    if f.exists():
        for line in f.read_text(encoding='utf-8').splitlines():
            m = re.match(r'(\S+) (.*)', line)
            if m:
                out[m.group(1)] = m.group(2)
    return out

def prayed(ps):
    f = root / f'ps{int(ps):03d}' / 'prayed.vos.json'
    return json.loads(f.read_text(encoding='utf-8')) if f.exists() else {}

args = sys.argv[1:]
if args and args[0] == '-r':
    rx = re.compile(args[1])
    for d in sorted(root.glob('ps[0-9][0-9][0-9]')):
        f = d / 'prayed.vos.json'
        if not f.exists():
            continue
        for k, v in json.loads(f.read_text(encoding='utf-8')).items():
            if rx.search(v):
                print(k, '|', v)
    sys.exit()
for vid in args:
    ps = vid.split(':')[0]
    L = latin(ps); P = prayed(ps)
    for k in L:
        if k == vid or k.startswith(vid) and not k[len(vid):len(vid)+1].isdigit():
            print(k, 'LA', L[k]); print(k, 'PT', P.get(k, '—')); print()
