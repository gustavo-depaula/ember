"""Record the v2 Latinist gate in Ps 147's audit."""
import json
from pathlib import Path
p = Path(__file__).with_name('prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    d['audit'].append({"step": "latinist", "file": "critic/v2.latinist.json", "model": "claude-opus-5-5 (fresh context)",
        "note": "gate on v2: no major, one minor (147:3), held as an option. The reader passed the v2 changes (147:4 fala, 147:6 migalhas / suportará, 147:9 com toda nação) and named 147:9 as keeping 'non … omni' unresolved.",
        "outcomes": [{"verse": "147:3", "remark": "double accusative made locative; 'Ele fez das tuas fronteiras a paz'", "outcome": "option", "decision": "fines",
            "reason": "his fix is already option 2 of 'fines', which v1 weighed: 'fez das tuas fronteiras a paz' is not a sentence Portuguese says, while the locative keeps both words and the image and is how DRB and MS1932 read it; the gate itself calls the sense close and the rendering traditional"}]})
    for dec in d['decisions']:
        if dec['id'] == 'fines':
            dec['why'] += " v2 Latinist gate (minor): the frontier become peace is slightly flattened; he asks 'Ele fez das tuas fronteiras a paz' — option 2, held for the reason above."
    d['status'] = 'reviewed'
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
