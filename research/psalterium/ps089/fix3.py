import json
p='research/psalterium/ps089/prayed.json'
d=json.load(open(p,encoding='utf-8'))
for x in d['decisions']:
    if x['id']=='repleti':
        for o in x['options']:
            o['forms']['repleti']=o['forms']['repleti'][0].lower()+o['forms']['repleti'][1:]
            o['label']=o['forms']['repleti']
d['audit'].append({"step":"checks","note":"v2: hard pass. Soft flags as v1; 89:10 first colon now −4 ('Mas, se houver forças'), accepted — the Latin's long potentátibus against a plain verb phrase."})
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
