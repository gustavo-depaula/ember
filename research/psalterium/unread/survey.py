"""List, per finished psalm, the current version and which versions a Latinist step read.

python3.13 research/psalterium/unread/survey.py
"""

import json
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent

for folder in sorted(root.glob('ps[0-9][0-9][0-9]')):
    p = folder / 'prayed.json'
    if not p.exists():
        continue
    d = json.loads(p.read_text(encoding='utf-8'))
    ver = d.get('version')
    revs = [(a.get('version'), a.get('note', '')[:140]) for a in d.get('audit', []) if a.get('step') == 'revision']
    lat = [a.get('file') or '-' for a in d.get('audit', []) if a.get('step') == 'latinist']
    other = [f"{a.get('step')}:{a.get('file')}" for a in d.get('audit', []) if a.get('step') in ('ambiguity', 'stylist')]
    critic = sorted(x.name for x in (folder / 'critic').glob('*.json')) if (folder / 'critic').exists() else []
    latVers = sorted({int(m.group(1)) for f in lat for m in [re.search(r'v(\d+)\.', f)] if m})
    print(f'== {folder.name} version={ver} range={d.get("range")} latinist-read={latVers}')
    print('   latinist files:', lat)
    print('   critic dir:', critic)
    for v, n in revs[-3:]:
        print(f'   rev v{v}: {n}')
