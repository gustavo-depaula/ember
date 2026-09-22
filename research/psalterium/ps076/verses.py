"""Print rendered prayed verses (prayed.vos.json) for ids given: 17:8 28:3 ..."""
import json, sys
from pathlib import Path
root = Path(__file__).resolve().parent.parent
for vid in sys.argv[1:]:
    p = int(vid.split(':')[0])
    f = root / f'ps{p:03d}' / 'prayed.vos.json'
    if not f.exists():
        print(vid, '— no file'); continue
    d = json.loads(f.read_text(encoding='utf-8'))
    v = d.get('verses', d)
    print(vid, '|', v.get(vid, '—'))
