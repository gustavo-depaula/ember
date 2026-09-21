"""Print finished verses by id: python3.13 review/v.py 34:28 36:30 118:60 …"""
import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
rows = {r['id']: r for r in json.loads((here / 'corpus.json').read_text(encoding='utf-8'))}
for vid in sys.argv[1:]:
    r = rows.get(vid)
    if not r:
        print(f'{vid}: not finished / no such id')
        continue
    print(f"{vid:8} {r['la']}\n         {r['pt']}")
