"""Record the v2 Latinist gate in ps101's audit."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    d['audit'].append({
        "step": "latinist", "file": "critic/v2.latinist.json",
        "note": "Gate on v2, claude-opus-5-5, fresh context, with latin.json. No major. Two minors, both repeated from v1 and held as options; he passed every v2 change (101:3, 9, 11, 14, 24, 25) without remark.",
        "outcomes": [
            {"verse": "101:6", "remark": "os meum singular: o meu osso se colou (repeated)", "outcome": "option", "decision": "os", "reason": "the singular is heard as one particular bone; he himself says the meaning barely changes; number is grammar (D2, D29)"},
            {"verse": "101:19", "remark": "in + ablative: em outra geração (repeated; he calls para defensible)", "outcome": "option", "decision": "altera", "reason": "em is heard as the time of the writing; the Greek εἰς, DRB 'unto'"}]})
    d['status'] = 'reviewed'
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
    print('recorded')
else:
    print('already recorded')
