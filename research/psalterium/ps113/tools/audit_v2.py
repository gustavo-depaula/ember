import json
from pathlib import Path
p = Path('research/psalterium/ps113/prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
assert d['version'] == 2 and d['audit'][-1]['step'] == 'critics v1'
d['audit'].append({'step': 'checks v2', 'note': "Hard checks pass. New soft flags accepted: 113:8 first colon +5 ('Aquele que' added for the relative, plus 'lagoas de água' of 106:35) and 113:16 first colon +4 ('aqueles que os fazem'); both are one breath, and the stylist asked for the change. Earlier flags as in v1."})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
