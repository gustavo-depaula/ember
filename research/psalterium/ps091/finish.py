"""Ps 91: record the v2 Latinist gate (two minors, both held with options); status reviewed. Idempotent."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    dec = {x['id']: x for x in d['decisions']}
    dec['factura']['options'].insert(1, {"label": "na vossa feitura", "forms": {"factura": "na vossa feitura"}, "note": "the v2 Latinist (minor): the Latin's in, parallel with 'nas obras' — held: the causative 'alegrar alguém em' is not how Portuguese builds it ('alegrar-se em' is the reflexive), and 'com' is the instrument the delectáre rows use (29:2, 64:8)", "from": "latinist"})
    dec['ininsurg']['why'] += " The v2 Latinist (minor) asked 'acerca dos' as clearer, granting that 'de' can carry the sense; held, because 'acerca' closes the openness of the Latin's in, which the draft keeps on purpose."
    dec['ininsurg']['options'][1]['note'] += "; the v2 Latinist's fix (minor), held"
    dec['ininsurg']['options'][1]['from'] = 'latinist'
    d['status'] = 'reviewed'
    d['audit'].append({"step": "latinist", "file": "critic/v2.latinist.json",
        "note": "Gate on draft 2 — claude-opus-5-5, fresh context, with latin.json. Clean of majors: two minors, both held with options. All v2 changes passed (instrument, feitura, bare Para que, passarão bem).",
        "outcomes": [
            {"verse": "91:5", "remark": "'com a vossa feitura' narrows in; 'na vossa feitura'", "outcome": "option", "decision": "factura", "reason": "'me alegrastes na …' is not the Portuguese build of the causative; 'com' as 29:2, 64:8."},
            {"verse": "91:12", "remark": "'ouvir dos malvados' reads as 'hear from'; 'acerca dos'", "outcome": "option", "decision": "ininsurg", "reason": "He grants 'de' can carry 'about'; the Latin's in leaves both readings open and the draft keeps them."}
        ]})
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.loads(p.read_text(encoding='utf-8'))['status'])
