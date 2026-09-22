import json
from pathlib import Path
p = Path(__file__).parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    d['audit'].append({"step": "latinist", "file": "critic/v2.latinist.json", "note": "Gate on draft 2 — claude-opus-5-5, fresh context, with latin.json. Clean of majors: one minor, the same as v1 (74:9 supplied *o*), held. Everything taken in v2 passed without remark.", "outcomes": [
        {"verse": "74:9", "remark": "supplied object *o* in *E o inclinou* (repeated from v1; minor)", "outcome": "refused", "decision": "inclinavit", "reason": "as in v1: bare *inclinou deste para aquele* is heard as intransitive 'leaned'; the pronoun is grammar (D2); his *E inclinou* is option 2."}]})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

d = json.loads(p.read_text(encoding='utf-8'))
t = next(x for x in d['decisions'] if x['id'] == 'tempus')
extra = " Glossary: the *accípere* row has *receber* (23:4–5, 49:9); here *tomar* (17:17's verb) is a local departure, because the one who speaks takes the time rather than being given it (λάβω); recorded in the row."
if extra not in t['why']:
    t['why'] += extra
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
