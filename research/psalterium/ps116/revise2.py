import json
p='research/psalterium/ps116/prayed.json'
d=json.load(open(p))
d['version']=2
d['status']='reviewed'
for x in d['decisions']:
    if x['id']=='confirmata':
        x['why']+=" The blind ambiguity reader (v1) heard *se firmou sobre nós* as 'was established / firmly placed upon us', with 'prevailed over us' as a second reading — both within the Latin's *confirmáta est super nos*; it did not hear 'proved'."
d['audit']+= [
 {"step":"latinist","file":"critic/v1.latinist.json","note":"claude-opus-5-5, fresh context, with latin.json. No remarks: both verses full and exact; *se firmou* accepted as a pronominal rendering of the perfect passive.","outcomes":[]},
 {"step":"stylist","file":"critic/v1.stylist.json","note":"claude-opus-5-5, fresh context, with latin.json. No remarks; best line 116:1, worst 116:2 (named only because one must be; no fault given).","outcomes":[]},
 {"step":"ambiguity","file":"critic/v1.ambiguity.json","note":"claude-opus-5-5, fresh context, blind. Three ambiguities, no unknown words; none taken.","outcomes":[
   {"verse":"116:2","remark":"se firmou sobre nós: prevailed over / settled upon / established concerning us; likely heard 'established, firmly placed upon us'","outcome":"refused","decision":"confirmata","reason":"The heard sense is the Latin's (made firm upon us); the range of readings is the Latin's own and not closed (rule 2). The feared hearing of *confirmada* as 'proved' did not arise."},
   {"verse":"116:2","remark":"a verdade do Senhor: doctrinal truth vs faithfulness","outcome":"refused","reason":"*véritas → verdade* (row; 53:7 has the same finding); *fidelidade* is the Hebrew-based reading and would close what the Latin leaves open."},
   {"verse":"116:2","remark":"Porque: causal vs asseverative","outcome":"refused","reason":"Heard causal, which is *quóniam*'s sense here; no change needed."}]},
 {"step":"revision","version":2,"note":"v2: no change of wording — no reader asked for one. Version bumped to record the reviews; prayed.v1.json kept. The text the v2 Latinist gate reads is identical to v1's."}
]
json.dump(d,open(p,'w'),ensure_ascii=False,indent=2)
