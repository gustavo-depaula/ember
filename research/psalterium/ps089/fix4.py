import json
p='research/psalterium/ps089/prayed.json'
d=json.load(open(p,encoding='utf-8'))
for x in d['decisions']:
    if x['id']=='saeculum8':
        x['options']=[o for o in x['options'] if o['label']!='o nosso tempo na iluminação']
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
