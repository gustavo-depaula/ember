import json
p = 'research/psalterium/ps104/prayed.json'
d = json.load(open(p, encoding='utf-8'))
d['status'] = 'done'
dec = {x['id']: x for x in d['decisions']}
inc = dec['incubuit']
inc['options'][0]['label'] = 'pesou'
inc['options'][0]['forms'] = {'incubuit': 'pesou'}
inc['options'][0]['note'] = "Ruling (v2 gate): the Latin's image of weight in the perfect. The Latinist raised the aspect of v1's 'pesava' twice."
inc['options'].append({'label': 'pesava', 'forms': {'incubuit': 'pesava'}, 'note': 'v1/v2: the imperfect of a lasting state. The Latinist twice objected to the aspect.', 'from': 'draft'})
d['audit'].append({'step': 'gate v2', 'note': 'Latinist (fresh context, latin.json): no major; four minors.', 'outcomes': [
  {'ref': '104:38', 'from': 'latinist (minor, second time)', 'outcome': "taken in part: 'pesou' keeps incúmbere's weight in the perfect aspect he asked for. His 'caíra' is the Greek's image and stays as the option."},
  {'ref': '104:26', 'from': 'latinist (minor)', 'outcome': "refused: without 'e', 'Aarão' is heard as an apposition to Moisés, as though Moses were Aaron. The supplied conjunction is grammar (D2), as the choices note says."},
  {'ref': '104:33', 'from': 'latinist (minor, second time)', 'outcome': "refused again: lignum → árvore (row). The plural is grammar for a collective. 'arvoredo' would be a word used in this one place only."},
  {'ref': '104:24', 'from': 'latinist (minor, second time)', 'outcome': "refused again: super with a verb of strength is taken as a comparative, following 50:9 and 18:11. 'fortaleceu acima de' is not Portuguese. In v1 he called the comparative defensible."}
]})
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(p, 'a', encoding='utf-8').write('\n')
