"""Ps 82: record the v2 Latinist gate, take 82:16 'na vossa tempestade', bump to v3. Idempotent."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    dec = {x['id']: x for x in d['decisions']}
    t = dec['tempestate']
    t['options'] = [
        {"label": "na vossa tempestade", "forms": {"tempestate": "na vossa tempestade"}, "note": "draft 3 — the Latin's preposition, parallel with 'na vossa ira'; the v2 Latinist's fix", "from": "latinist"},
        {"label": "com a vossa tempestade", "forms": {"tempestate": "com a vossa tempestade"}, "note": "drafts 1–2 — the instrumental sense, DRB, MS1932; the Latinist found the split of the repeated in a broken parallel", "from": "draft"},
    ]
    t['why'] += " Draft 3 takes the Latin's in in both colons (the v2 Latinist, minor): the parallel is the Latin's, and 'na' still carries the instrument by context."
    dec['degente']['options'].append({"label": "de ser nação", "forms": {"degente": " de ser nação"}, "note": "the v2 Latinist (minor): closer to the bare 'de gente'; refused — 'exterminar alguém de ser nação' is not a Portuguese sentence", "from": "latinist"})
    d['version'] = 3
    d['status'] = 'reviewed'
    d['audit'] += [
        {"step": "latinist", "file": "critic/v2.latinist.json", "note": "Gate on draft 2 — claude-opus-5-5, fresh context, with latin.json. Clean of majors: two minors, one taken (82:16), one held with an option (82:5). The v2 changes at 82:5 (clause) and 82:6 (dash) otherwise passed.",
         "outcomes": [
            {"verse": "82:5", "remark": "purpose clause explains 'de gente'; 'exterminemo-los de ser nação'", "outcome": "option", "decision": "degente", "reason": "His fix is not Portuguese; he calls the clause defensible as the sense (DRB 'so that they be not a nation'); draft 1's 'como nação' was the stylist's worst line and double-read by the ambiguity reader."},
            {"verse": "82:16", "remark": "in … in split into 'com' and 'na'", "outcome": "taken", "decision": "tempestate"}
         ]},
        {"step": "revision", "version": 3, "note": "v3: 82:16 'na vossa tempestade' (the v2 Latinist's own wording, one preposition). No reader has read draft 3 as a whole; its one difference from draft 2 is the gate's fix. Draft 2 kept as prayed.v2.json."}
    ]
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.loads(p.read_text(encoding='utf-8'))['version'])
