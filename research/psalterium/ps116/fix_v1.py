import json
p='research/psalterium/ps116/prayed.json'
d=json.load(open(p))
d['hour']="Monday Lauds (1911 psalter, last psalm; DO Psalmi major [Day1 Laudes1/2]); Monday Vespers before 1911 ([Daya1 Vespera]) and in the Monastic and Cistercian Vespers (joined to 115); Benediction"
d['verses']['116:1']="{v1a}: * louvai-o, todos os povos:"
o=d['decisions'][0]
o['id']='v1a'
o['options']=[
 {"label":"Louvai o Senhor, todas as nações","forms":{"v1a":"Louvai o Senhor, todas as nações"},"note":"Ruling: the Latin's order (verb, object, vocative), parallel to the second colon; direct object as the Latin's accusative; the same shape as the circulating Benediction rendering (unverified source, liturgy-br.txt).","from":"draft"},
 {"label":"Louvai ao Senhor, todas as nações","forms":{"v1a":"Louvai ao Senhor, todas as nações"},"note":"the regency the line is widely known with (Almeida; DM1962 *LOUVAI ao Senhor*); refused because *louvar* takes a direct object and the psalter has *louvai o nome* (99:4b), *louvai-o* (21:24).","from":"DM1962"},
 {"label":"Nações, louvai todas o Senhor","forms":{"v1a":"Nações, louvai todas o Senhor"},"note":"MS1932's order; refused: an inversion for its own sake (rule 5), and it breaks the parallel with the second colon unless that becomes *povos, louvai-o todos*.","from":"MS1932"}]
o['refs']=["116:1"]
json.dump(d,open(p,'w'),ensure_ascii=False,indent=2)
