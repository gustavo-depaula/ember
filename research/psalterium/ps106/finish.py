"""Record the v2 Latinist gate in ps106/prayed.json (idempotent)."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a['step'] == 'gate' for a in d['audit']):
    d['audit'].append({
        'step': 'gate',
        'note': 'v2 read by the Latinist (claude-opus-5-5, fresh context, with latin.json; critic/v2.latinist.json). Clean of majors and criticals; three minors, all repeats of v1 already held as options. Pointing matches in every verse. No v2 change.',
        'outcomes': [
            {'reader': 'latinist', 'id': '106:20', 'remark': 'interitiónibus plural made singular', 'outcome': "held — number is grammar (D2); 'das suas destruições' is not said of a threat to a person; option in decision interitio"},
            {'reader': 'latinist', 'id': '106:34', 'remark': "'sal' for salsúgo; asks 'salsugem'", 'outcome': "held — the cognate is rare in Brazil; option in decision salsuginem"},
            {'reader': 'latinist', 'id': '106:37', 'remark': 'nativitátis made a verb', 'outcome': "held — 'fruto de nascimento' is opaque; he grants the sense survives; option in decision nativitatis"},
        ],
    })
    d['status'] = 'reviewed'
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(len(d['decisions']), 'decisions')
