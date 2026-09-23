import json
from pathlib import Path
p = Path(__file__).with_name('prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
d['choices']['147:9'] += " v2 soft flag: first colon -3 ('com toda nação', 9 against the Latin's 12); accepted: nothing is missing, the Latin's words are longer."
d['audit'].append({"step": "checks", "note": "v2: hard pass. Soft: 147:7b +4, 147:8a +4 (as v1), 147:9a -3 and 147:9b -3; accepted in choices."})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
