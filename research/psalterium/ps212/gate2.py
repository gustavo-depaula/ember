"""Record the v2 Latinist gate in ps212/prayed.json and mark it reviewed."""
import json
from pathlib import Path
p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
d['status'] = 'reviewed'
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    d['audit'].append({"step": "latinist", "version": 2, "file": "critic/v2.latinist.json",
        "note": "Draft 2. Clean: no remarks. It weighed and let stand 13:8 'sobre uma nação pecadora' (in + accusative open between 'toward' and 'upon') and 13:9 'usará da sua misericórdia convosco'. Marks confirmed (one mediant per verse).",
        "outcomes": []})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(d['status'], len(d['decisions']))
