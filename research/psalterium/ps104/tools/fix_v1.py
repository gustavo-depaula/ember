import json
p = 'research/psalterium/ps104/prayed.json'
d = json.load(open(p, encoding='utf-8'))
v = d['verses']
v['104:30'] = 'A terra deles produziu rãs: * nos aposentos dos próprios reis deles.'
d['choices']['104:29'] += ' The rhyme flag on "deles … deles" (104:29, 35, 38, and 29/30) is the Latin\'s own eórum repeated; it is accepted, as in Ps 77.'
d['choices']['104:19'] += ' "o rei enviou" keeps rex as the subject; "enviou o rei" would be heard as the king being sent.'
d['audit'].append({'step': 'checks', 'note': 'Hard checks pass. Length flags accepted (the long colons follow the Latin sense; 104:9 "Que fez com Abraão" is short as the Latin is). The rhyme flags on "deles" are the Latin\'s eórum and are accepted. 104:30 punctuation brought back to the Latin\'s colon.'})
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(p, 'a', encoding='utf-8').write('\n')
