import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(path.read_text(encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}
x = dec['versasti']
x['why'] = x['why'].replace(' Verb first: natural order; the Latin puts the bed first. The Latin', ' The Latin')
x['options'][0]['forms'] = {'versasti': 'revolvestes'}
x['options'][1]['forms'] = {'versasti': 'virastes'}
path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
