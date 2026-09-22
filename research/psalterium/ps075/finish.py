"""Ps 75: record the v2 Latinist gate and its one taken fix (75:4 back to the plural). Idempotent."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    dec = {x['id']: x for x in d['decisions']}
    opts = dec['potentias']['options']
    plural = next(o for o in opts if o['label'] == 'as potências dos arcos')
    opts.remove(plural)
    plural['note'] = "draft 3 (as draft 1) — the row and the Latin's number; the v2 Latinist asked it back. As 64:7 and 70:16, where the ambiguity readers also found potências hard and it was kept"
    opts.insert(0, plural)
    opts[1]['note'] = "draft 2 — singular, for the ambiguity reader's 'world powers'; the Latinist marked the number change (minor)"
    dec['potentias']['why'] += " Draft 2 tried the singular for the ambiguity reader (who heard 'world powers'); the v2 Latinist asked the plural back, and it is restored."
    d['version'] = 3
    d['audit'] += [
        {"step": "latinist", "file": "critic/v2.latinist.json", "note": "Gate on draft 2 — claude-opus-5-5, fresh context, with latin.json. Clean of majors: four minors; one taken (75:4 plural, which restores draft 1's wording, already passed by the v1 Latinist), three held with reasons, all living on as options. The v2 changes 75:5 dos, 75:7 montaram, 75:11 para vós, 75:12 ao seu redor, 75:13 diante dos passed without remark.",
         "outcomes": [
            {"verse": "75:4", "remark": "potentias plural rendered singular", "outcome": "taken", "decision": "potentias"},
            {"verse": "75:5", "remark": "participle Illúminans made finite; 'Vós, iluminando'", "outcome": "refused", "decision": "illuminans", "reason": "The Greek has the finite verb (φωτίζεις σύ) and DRB 'Thou enlightenest'; supplying it is grammar (D2). The v1 Latinist passed it; his gerund is option 2."},
            {"verse": "75:11", "remark": "confitébitur narrowed to dar graças; 'vos louvará'", "outcome": "refused", "decision": "confitebitur", "reason": "D5 (settled): confitéri to God → dar graças a; louvar is laudáre's. 'vos louvará' is the option."},
            {"verse": "75:11", "remark": "relíquiæ … agent plural rendered singular; 'os restos … celebrarão'", "outcome": "refused", "decision": "reliquiae", "reason": "The relíquiæ row splits by the Greek (D15): ἐγκατάλειμμα → the singular 'o resto', as 36:37–38; 'os restos' is heard as mortal remains. The v1 Latinist passed it. 'os restos' (with the verb plural) is option 1."}
         ]},
        {"step": "revision", "version": 3, "note": "v3: 75:4 back to 'as potências dos arcos' (draft 1's wording, passed by the v1 Latinist and asked back by the v2 gate). No other change; no reader has read draft 3 as a whole, but its one difference from draft 2 is text a Latinist has passed."}
    ]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.load(open(p))['version'])
