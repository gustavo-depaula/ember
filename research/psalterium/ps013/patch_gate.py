"""Ps 13: record the v2 Latinist gate (one minor, 13:4, refused) in prayed.json. Idempotent.
python3.13 research/psalterium/ps013/patch_gate.py"""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
path = folder / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
d = next(x for x in data['decisions'] if x['id'] == 'escam')
if not any(o['label'] == 'como alimento de pão' for o in d['options']):
    d['options'].append({'label': 'como alimento de pão', 'forms': {'escam': 'como alimento de pão'}, 'note': 'The Latinist (draft 2, minor; he passed the ruling on draft 1): the Latin compares the people to bread as food, not the devourers to one who eats. Refused: esca here is the Greek βρώσει, the act of eating (Douay-Rheims ‘as they eat bread’), and ‘alimento de pão’ is not said in Portuguese.', 'from': 'latinist'})
    d['why'] += ' The Latinist (draft 2, minor) read esca as the food and asked for ‘como alimento de pão’; kept as an option.'
step = {'step': 'latinist', 'file': 'critic/v2.latinist.json', 'note': 'Draft 2 — the gate. Clean of majors: one minor, 13:4, on words he passed unchanged on draft 1 — refused, his wording an option. Everything changed in draft 2 (13:2 ‘para’, 13:3c order, 13:5 ‘Ao Senhor não invocaram’, 13:7 ‘afastar o cativeiro’ and the order of the last clause) passed.', 'outcomes': [
    {'verse': '13:4', 'remark': '‘como quem come pão’ compares the devourers to an eater; the Latin compares the people to bread as food → ‘como alimento de pão’ (minor)', 'outcome': 'option', 'decision': 'escam', 'reason': 'esca is the Greek βρώσει, the eating (Douay-Rheims ‘as they eat bread’); his wording is not Portuguese; he passed the same words on draft 1 (D24: weighed).'}]}
if step['file'] not in [s.get('file') for s in data['audit']]:
    data['audit'].append(step)
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
