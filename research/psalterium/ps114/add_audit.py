import json,sys
p='research/psalterium/ps114/prayed.json'
d=json.load(open(p,encoding='utf-8'))
d['audit'].append(json.loads(sys.argv[1]))
open(p,'w',encoding='utf-8').write(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
