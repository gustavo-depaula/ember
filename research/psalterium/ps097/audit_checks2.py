"""Append the v2 checks step (idempotent)."""
import json
from pathlib import Path
p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
note = "v2: hard checks pass. 97:5 now +6 / +5 (the stylist's articles add one each): the longest verse of the psalm, each colon still one breath; *de metal* (option of `ductilibus`) would bring the second to +3. Other flags as v1 (97:3 +4, 97:8b −3 = 95:12b, 97:9 −4 by D30)."
if not any(a['step'] == 'checks' and a['note'].startswith('v2') for a in d['audit']):
    d['audit'].append({"step": "checks", "note": note})
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
    print('recorded')
