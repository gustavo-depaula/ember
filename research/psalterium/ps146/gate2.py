"""Ps 146: record the v2 Latinist gate (no wording change).
python3.13 research/psalterium/ps146/gate2.py"""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}
pr = dec['praecinite']
if not any(o['label'] == 'Entoai … com ação de graças' for o in pr['options']):
    pr['options'].insert(1, {"label": "Entoai … com ação de graças",
                             "forms": {"praecinite": "Entoai", "inconf": "com ação de graças"},
                             "note": "The v2 Latinist (minor): 'in confessióne' kept adverbial. 'Entoar' then has no object, which is strained.",
                             "from": "latinist"})
d['audit'].append({
    "step": "latinist", "file": "critic/v2.latinist.json",
    "note": "The gate on v2. claude-opus-5-5, fresh context, with latin.json. Three minors and no major; all held, with reasons. Overall: faithful and close, with tenses, persons and images kept.",
    "outcomes": [
        {"verse": "146:2", "remark": "'as dispersões de Israel' (abstract noun)", "outcome": "option", "decision": "congregabit",
         "reason": "Repeated from v1. An abstract noun cannot be gathered in Portuguese, and DRB and MS1932 both make it personal."},
        {"verse": "146:7", "remark": "'in confessióne' made the object; 'com louvor'", "outcome": "option", "decision": "praecinite",
         "reason": "'entoar' wants an object, so the adverbial phrase becomes one; that is grammar (D2). 'louvor' is refused: it is laus/laudátio's word (D5), and 'in confessióne' is 'ação de graças' at 94:2 and 99:3b. The adverbial build is added as option 2."},
        {"verse": "146:9", "remark": "'animais' widens juménta; 'gado'", "outcome": "option", "decision": "jumenta",
         "reason": "The juménta row (35:7b, 48:13). 'gado' is heard as cattle, which is narrower than κτήνη. It is option 2, as the v1 stylist also asked."}]})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
