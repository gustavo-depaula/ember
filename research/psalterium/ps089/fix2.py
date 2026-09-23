import json
p='research/psalterium/ps089/prayed.json'
d=json.load(open(p,encoding='utf-8'))
d['verses']['89:2']="Antes que se fizessem os montes, ou se formassem a terra e o mundo: * desde sempre e para todo o sempre {deus2}."
d['choices']['89:2']=d['choices']['89:2'].replace("formarétur, singular with two subjects, → 'fossem formados' (agreement is grammar).","fíerent / formarétur → 'se fizessem / se formassem', the passive as reflexive and the verb before its subjects, to keep the first colon near the Latin's length (checks flagged +5 on 'fossem feitos … fossem formados'); the plural verb for terra et orbis is agreement, grammar.")
d['audit'].append({"step":"checks","note":"Hard checks pass. Soft flags accepted: 89:1 second colon −6 (the formula 'de geração em geração'); 89:8 second colon −5 (the Latin's long illuminatióne against 'luz', row); 89:9b first colon +3 ('considerados'); 89:10 first colon −3; 89:12 +4 / +3 (the Latin's terse 'notam fac' and 'erudítos corde' need Portuguese periphrasis); the rhymes ira / ira (89:11) and mãos / mãos (89:17) are the Latin's own repetitions. 89:2 first colon was +5 and was shortened (reflexive passives)."})
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
