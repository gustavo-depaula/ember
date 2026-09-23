"""Print the prayed (vós) Portuguese and the Latin for verse ids, e.g. pt.py 117:1 106:1 99:4b.
A bare psalm number prints the whole psalm."""
import json
import pathlib
import re
import sys

root = pathlib.Path(__file__).resolve().parents[2]
latin_dir = root.parents[1] / 'content/do/horas/Latin/Psalterium/Psalmorum'


def latin_lines(n):
    out = {}
    for f in latin_dir.glob('Psalm*.txt'):
        for line in f.read_text().splitlines():
            m = re.match(r'(\d+:\d+[a-z]?) (.*)', line)
            if m and m.group(1).split(':')[0] == str(n):
                out.setdefault(m.group(1), m.group(2))
    return out


for arg in sys.argv[1:]:
    n = int(arg.split(':')[0])
    folder = root / f'ps{n:03d}'
    vos = folder / 'prayed.vos.json'
    pt = json.loads(vos.read_text()) if vos.exists() else {}
    lat = latin_lines(n)
    ids = [arg] if ':' in arg else sorted(lat, key=lambda k: (int(re.match(r'\d+:(\d+)', k).group(1)), k))
    for vid in ids:
        print(vid, '|', lat.get(vid, '?'))
        print('   ', pt.get(vid, '(not translated)'))
