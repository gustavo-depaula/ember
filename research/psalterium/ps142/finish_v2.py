"""Record the v2 Latinist gate in ps142/prayed.json. python3.13 research/psalterium/ps142/finish_v2.py"""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    raise SystemExit('already recorded')
dec = {x['id']: x for x in d['decisions']}
dec['confugi']['options'].append({"label": "a vós me acolhi", "forms": {"confugi": "a vós me acolhi"}, "note": "The v2 Latinist (minor): keeps the motion of 'ad te'. Refused: 'acolher' is suscípere's word (47:10 'Acolhemos'), and 'acolher-se a' is literary.", "from": "latinist"})
dec['conspectu']['options'].append({"label": "diante dos vossos olhos", "forms": {"conspectu": "diante dos vossos olhos"}, "note": "The v2 Latinist (minor): the concrete gaze. Refused: 'olho' is óculus's (the conspéctus row, 14:4a, 85:14); 'à vossa vista' is the option that keeps the seeing.", "from": "latinist"})
dec['saeculi']['options'][1]['note'] += " Asked by the v2 Latinist (minor)."
d['status'] = 'reviewed'
d['audit'].append({
    "step": "latinist", "file": "critic/v2.latinist.json",
    "note": "Gate on draft 2, claude-opus-5-5, fresh context, read latin.json. No major; three minors, all held with options. Overall: close and faithful; tenses, the futures of 10b–12b and the literal 'e serei semelhante' kept; marks match.",
    "outcomes": [
        {"verse": "142:2", "remark": "'na vossa presença' abstracts conspéctus; wants 'diante dos vossos olhos'", "outcome": "option", "decision": "conspectu", "reason": "'olho' is óculus's in the conspéctus row; the v1 run passed the verse; 'à vossa vista' remains option 1."},
        {"verse": "142:3b", "remark": "'de outrora' narrows sǽculi; wants 'de há muito' (second run in a row)", "outcome": "option", "decision": "saeculi", "reason": "both runs minor and asking different fixes ('do século', 'de há muito'); 'de há muito' narrows the same way (to time past) and is European in ear. For Gustavo."},
        {"verse": "142:9", "remark": "'em vós me refugiei' loses the motion of 'ad te'; wants 'a vós me acolhi'", "outcome": "option", "decision": "confugi", "reason": "'acolher' is suscípere's word; 'junto de vós me refugiei' (MS1932) is option 1 for whoever wants the direction back. The colon is the Thursday Lauds antiphon and reads alone either way."}
    ]})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('recorded')
