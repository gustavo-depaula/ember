import json
p='research/psalterium/ps089/prayed.json'
d=json.load(open(p,encoding='utf-8'))
d['verses']['89:13']="Voltai-vos, Senhor, até quando? * e {deprecabilis}."
for dec in d['decisions']:
    if dec['id']=='deprecabilis':
        for o in dec['options']:
            f=o['forms']['deprecabilis']
            f={'deixai-vos aplacar em favor dos':'deixai-vos aplacar em favor dos vossos servos',
               'sede exorável para com':'sede exorável para com os vossos servos',
               'sede propício a':'sede propício aos vossos servos'}[f]
            o['forms']['deprecabilis']=f; o['label']=f
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
