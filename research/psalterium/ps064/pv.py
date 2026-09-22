"""Print the rendered prayed text of given verse ids (from other psalms' prayed.vos.json),
or grep the rendered texts for a regex (-g).  Consultation only."""
import json, re, sys, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
args = sys.argv[1:]
if args and args[0] == '-g':
    rx = re.compile(args[1], re.I)
    for f in sorted(root.glob('ps[01]*/prayed.vos.json')):
        for k, v in json.load(open(f)).items():
            if rx.search(v):
                print(k, '|', v)
    sys.exit()
for vid in args:
    n = int(vid.split(':')[0])
    f = root / f'ps{n:03d}' / 'prayed.vos.json'
    if f.exists():
        print(vid, '|', json.load(open(f)).get(vid))
    else:
        print(vid, '| (no psalm yet)')
