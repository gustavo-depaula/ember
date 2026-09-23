import json
p='research/psalterium/ps116/prayed.json'
d=json.load(open(p))
d['choices']['116:2']=d['choices']['116:2'].replace("Second colon +2 syllables on the Latin (15 with *e‿a* elided against 13): accepted — nothing in it can be cut.","checks: first colon −3, second +3 on the Latin (heuristic): accepted — the first cannot grow without supplying a word, the second has nothing to cut (*e a verdade do Senhor* is the Latin's four words; *para sempre* is D23's phrase). Both antiphons of Monday Lauds are cut from this psalm (*Laudáte * Dóminum omnes gentes*; *Laudáte * Dóminum quóniam confirmáta est super nos misericórdia ejus*, DO Psalmi major): *Louvai * o Senhor, todas as nações* and *Louvai * o Senhor, porque se firmou sobre nós a sua misericórdia* read alone.")
d['audit'].append({"step":"checks","note":"hard pass; soft: 116:2 first colon −3, second +3 syllables, accepted (see choices). All cadences oxytone or paroxytone."})
json.dump(d,open(p,'w'),ensure_ascii=False,indent=2)
