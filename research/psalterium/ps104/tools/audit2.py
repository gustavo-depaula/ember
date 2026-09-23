import json
p = 'research/psalterium/ps104/prayed.json'
d = json.load(open(p, encoding='utf-8'))
d['audit'].append({'step': 'checks v2', 'note': 'Hard checks pass. The neighbouring 104:29/30 rhyme is gone. Three inner "deles … eles" rhymes remain (104:29, 35, 38); they are the Latin eórum and are accepted. prayed.v1.json kept.'})
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(p, 'a', encoding='utf-8').write('\n')
