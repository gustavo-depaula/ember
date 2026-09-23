import json
from pathlib import Path
p = Path('research/psalterium/ps105/prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a['step'] == 'checks' and 'v2' in a['note'] for a in d['audit']):
    d['audit'].append({'step': 'checks', 'note': "v2: hard checks pass. Soft flags as v1 (accepted there); 105:13a +3 with the colon, 105:24b -3 ('em nada'), 105:46a now within range. Rhyme -ões at 105:27, the Latin's echo."})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
