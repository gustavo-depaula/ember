"""Record the v2 Latinist gate (two minors, both held as options)."""
import json
from pathlib import Path

p = Path(__file__).parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    d['audit'].append({
        "step": "latinist", "file": "critic/v2.latinist.json",
        "note": "The gate on v2, whose wording is the same as v1. Reader: claude-opus-5-5, fresh context, with latin.json. No majors. Two minors, both on words that are already options, both held. On v1 the same role counted 'instrumento' a fidelity and raised neither point. As D24 notes, the gate is not consistent between runs.",
        "outcomes": [
            {"verse": "150:4", "remark": "organum is concrete (the pipe); 'o instrumento' is generic; fix 'a flauta'", "outcome": "option", "decision": "organo",
             "reason": "Held for the glossary row and 136:2 (ὄργανον, one Greek word). 'instrumento' is what *órganum* says, and 'flauta' decides which instrument. The v1 Latinist named the generic word as preserved. 'a flauta' is option 2, one touch away, and it is the likeliest change if Gustavo wants the list concrete."},
            {"verse": "150:5", "remark": "'aclamação' narrows jubilatio to acclaiming; fix 'de júbilo'", "outcome": "option", "decision": "jubilationis",
             "reason": "D43 (settled) gives the *jubiláre / jubilátio* family 'aclamar / aclamação' and names 150:5. 'júbilo' is kept for *gáudium*. The stylist asked for the same thing on v1. If Gustavo overturns D43, this verse moves with the family."}
        ]
    })
for x in d['decisions']:
    if x['id'] == 'organo':
        for o in x['options']:
            if o['label'] == 'a flauta' and 'Latinist v2' not in o['note']:
                o['note'] += " The Latinist v2 gate asked for it (minor)."
    if x['id'] == 'jubilationis':
        for o in x['options']:
            if o['label'] == 'de júbilo' and 'Latinist v2' not in o['note']:
                o['note'] += " The Latinist v2 gate asked for it too (minor)."
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
