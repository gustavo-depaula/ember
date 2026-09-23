"""Record the v2 Latinist gate (critic/v2.latinist.json) in ps226/prayed.json and mark it reviewed.
python3.13 research/psalterium/ps226/gate2.py"""
import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
if any(a['step'] == 'latinist' and a.get('file') == 'critic/v2.latinist.json' for a in data['audit']):
    raise SystemExit('already recorded')
data['audit'].append({
    'step': 'latinist', 'file': 'critic/v2.latinist.json',
    'note': 'Gate on v2. Reader: claude-opus-5-5, fresh context, with latin.json. One minor, no majors; pointing correct in every verse. The minor is held, with the reason recorded.',
    'outcomes': [
        {'verse': '32:7', 'remark': "possidére is 'possess, hold as one's own'; adquiriu leans on the LXX/Hebrew 'acquired'; defensible, but asks possuiu back",
         'outcome': 'option', 'decision': 'possedit',
         'reason': 'He calls it defensible. Both v1 readers who hear the Portuguese (the stylist and the ambiguity reader) heard *que te possuiu*, with a person as object, as sexual or demonic possession, and that misreading costs more in a prayer than the step from "hold as one\'s own" to "got as one\'s own" does. *possuiu* stays option 2 in `possedit`, held for Gustavo.'},
    ]})
data['status'] = 'reviewed'
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('gate recorded; status reviewed')
