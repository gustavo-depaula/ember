import json
from pathlib import Path
p = Path(__file__).parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
d['audit'].append({"step": "checks", "note": "v2: hard checks pass. Soft flags: 69:2a −4 and 69:4a −4 as in v1 (accepted, same reasons); 69:4b first colon now −3 with *logo* (accepted: Portuguese *corando* for *erubescéntes*, nothing omitted)."})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
