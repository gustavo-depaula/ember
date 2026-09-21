"""For a psalm folder and verse ids: every earlier Latinist remark on those verses and every audit outcome recorded for them.

python3.13 research/psalterium/unread/history.py ps009 9:4 9:6
"""

import json
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
folder = root / sys.argv[1]
ids = sys.argv[2:]
d = json.loads((folder / 'prayed.json').read_text(encoding='utf-8'))


def parse(reply):
    text = re.sub(r'^```\w*\s*|\s*```$', '', reply.strip())
    try:
        return json.loads(text)
    except ValueError:
        m = re.search(r'\{.*\}', text, flags=re.S)
        return json.loads(m.group(0)) if m else {}


for f in sorted((folder / 'critic').glob('*latinist*.json')):
    r = parse(json.loads(f.read_text(encoding='utf-8'))['reply'])
    for v in r.get('verses', []):
        if v.get('id') in ids:
            for i in v.get('issues', []):
                print(f'{f.name} {v["id"]} {v.get("severity")}: {i.get("portuguese")} -> {i.get("fix")}')
for a in d['audit']:
    for o in a.get('outcomes') or []:
        if o.get('verse') in ids:
            print(f'audit {a.get("step")} {a.get("file")} {o["verse"]}: {o.get("outcome")} | {str(o.get("remark"))[:120]} | {str(o.get("reason", ""))[:250]}')
for dec in d['decisions']:
    if set(dec['refs']) & set(ids):
        print('decision', dec['id'], dec['refs'], '|', ' / '.join(o['label'] for o in dec['options']))
