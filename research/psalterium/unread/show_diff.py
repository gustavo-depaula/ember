"""Print, for the given psalm folder and verse ids, the last text a Latinist read and the current text."""

import json
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root))
from latin import resolve  # noqa: E402

folder = root / sys.argv[1]
ids = sys.argv[2:]
d = json.loads((folder / 'prayed.json').read_text(encoding='utf-8'))
now = resolve(d)
last = {}
for a in d['audit']:
    if a.get('step') != 'latinist' or not a.get('file'):
        continue
    k = int(re.search(r'v(\d+)\.', a['file']).group(1))
    p = folder / ('prayed.json' if k == d['version'] else f'prayed.v{k}.json')
    text = resolve(json.loads(p.read_text(encoding='utf-8')))
    part = re.search(r'\.(part\d+)\.json$', a['file'])
    shownIds = text
    if part:
        shownIds = json.loads((folder / part.group(1) / 'prayed.vos.json').read_text(encoding='utf-8'))
    for vid in ids:
        if vid in text and vid in shownIds:
            last[vid] = (k, text[vid])
for vid in ids:
    k, t = last.get(vid, (None, None))
    print(f'{vid}\n  read v{k}: {t}\n  now:     {now[vid]}')
