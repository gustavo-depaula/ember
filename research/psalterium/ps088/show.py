"""Ps 88 helper: print rendered (option-0) verses of other psalms from their prayed.vos.json, for consistency checks.
Usage: python3.13 research/psalterium/ps088/show.py 79:13 84:4 ..."""
import json, sys, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
for vid in sys.argv[1:]:
    ps = int(vid.split(':')[0])
    f = root / f'ps{ps:03d}' / 'prayed.vos.json'
    if not f.exists():
        print(vid, '— no file'); continue
    d = json.loads(f.read_text())
    v = d.get('verses', d)
    print(vid, '→', v.get(vid, '—'))
