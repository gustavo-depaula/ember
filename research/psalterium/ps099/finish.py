import json
p='research/psalterium/ps099/prayed.json'; d=json.load(open(p))
if not any(a.get('file')=='critic/v2.latinist.json' for a in d['audit']):
    d['audit'].append({"step":"latinist","file":"critic/v2.latinist.json","note":"Gate on v2, claude-opus-5-5, fresh context, with latin.json. 2 minor, no major; both held with options. Clean of majors.","outcomes":[
      {"verse":"99:2a","remark":"'sede servos' recasts the imperative; asks 'servi ao Senhor' (repeated from v1)","outcome":"option","decision":"servite","reason":"D18 is settled (the bare 'servi' is also 'I served'); the option stands for Gustavo, and D18 itself named this verse."},
      {"verse":"99:3b","remark":"confessio / confiteri narrowed to thanksgiving; suggests 'louvor … louvai-o' (he called the rendering defensible)","outcome":"option","decision":"confessione","reason":"D5 gives confitéri to God 'dar graças'; the confitéri row names 99:3b for 'ação de graças', as 94:2; 'louvor / louvai' is laus / laudáre's, and 99:4b has 'Laudáte' in the next verse."}]})
    for x in d['decisions']:
        if x['id']=='confessione':
            x['why']+=" v2 gate (minor): the Latinist asked 'louvor … louvai-o' as closer to confessio (praise and acknowledgement), calling it defensible. Held under D5, as at 94:2; 'louvor' is option 2."
    d['status']='reviewed'
json.dump(d,open(p,'w'),ensure_ascii=False,indent=2)
