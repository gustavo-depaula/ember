import json
p='research/psalterium/ps115/prayed.json'
d=json.load(open(p,encoding='utf-8'))
if not any(a.get('file')=='critic/v2.latinist.json' for a in d['audit']):
    d['audit'].append({"step":"latinist","file":"critic/v2.latinist.json","note":"Gate on v2, claude-opus-5-5, fresh context, with latin.json. No remarks: *uma hóstia* passed (the article noted as a permitted supply); tense, person, voice, number, *fora de mim*, the *coram / in conspéctu* split and the pointing all passed. Clean.","outcomes":[]})
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
