"""Record the v2 Latinist gate in ps143/prayed.json (idempotent).
python3.13 research/psalterium/ps143/gate2.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
P = json.loads(p.read_text(encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in P['audit']):
    d = next(d for d in P['decisions'] if d['id'] == 'eripere')
    d['options'].append({"label": "arrancai-me (7) · arrancai-me (10) · tirai-me (11)", "forms": {"eripe7": "arrancai-me", "eripe10": "arrancai-me", "erue11": "tirai-me"}, "note": "The v2 Latinist: éripe one verb, érue kept apart with 'tirar' — which is edúcere's (106:28) and auferre's (D41) in this psalter.", "from": "latinist"})
    d['why'] += " The v2 Latinist repeated the minor, now proposing 'arrancai-me' at 10 and 'tirai-me' for érue at 11; held — 'tirar' belongs to edúcere and auferre, and 'arrancai-me' with nothing to be torn from is the row's recorded failure. Option 4."
    P['audit'].append({"step": "latinist", "file": "critic/v2.latinist.json", "note": "Gate: claude-opus-5-5, fresh context, read latin.json. No major; one minor (the v1 remark repeated, 143:10 éripe), held with reason. 'Follows the Gallican Latin closely all the way through.'",
                       "outcomes": [{"verse": "143:10", "remark": "éripe → 'arrancai-me' as 143:7; érue → 'tirai-me'", "outcome": "option", "decision": "eripere", "reason": "the erípere row's source rule; 'tirar' is edúcere's and auferre's; 'arrancai-me' hangs without a source"}]})
    p.write_text(json.dumps(P, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('recorded')
else:
    print('already recorded')
