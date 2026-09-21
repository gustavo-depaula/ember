"""Where does a Portuguese regex live in the source of the finished psalms — a verse template, or which decision/option/slot?

python3.13 research/psalterium/review/apply/where.py '<regex>' [psNNN …]
Also prints which verses each matching slot reaches (directly or through another slot).
"""

import json
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[2]
pattern = re.compile(sys.argv[1], re.I)
names = sys.argv[2:] or [f.name for f in sorted(root.glob('ps[0-9][0-9][0-9]')) if (f / 'prayed.json').exists()]
slot = re.compile(r'\{(\w+)\}')
for name in names:
    d = json.loads((root / name / 'prayed.json').read_text(encoding='utf-8'))
    first = {k: v for dec in d['decisions'] for k, v in dec['options'][0].get('forms', {}).items()}

    def reach(key):
        found = [vid for vid, text in d['verses'].items() if '{' + key + '}' in str(text)]
        for other, text in first.items():
            if '{' + key + '}' in text:
                found += reach(other)
        return found

    for vid, text in d['verses'].items():
        if pattern.search(str(text)):
            print(f'{name} verse {vid}: {text}')
    for dec in d['decisions']:
        for i, o in enumerate(dec['options']):
            for k, v in (o.get('forms') or {}).items():
                if pattern.search(v):
                    print(f'{name} decision {dec["id"]} option {i} slot {k} = {v!r}' + (f'  → reaches {reach(k)}' if i == 0 else ''))
