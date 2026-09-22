"""Record the v2 Latinist gate on Ps 58 (no text change; one remark made selectable)."""
import json
p = 'prayed.json'
d = json.load(open(p, encoding='utf-8'))
v = d['verses']
if '{exsultabo}' not in v['58:17']:
    v['58:17'] = v['58:17'].replace('exultarei na vossa misericórdia', '{exsultabo}')
    d['decisions'].append({
        "id": "exsultabo", "refs": ["58:17"], "latin": "et exsultábo mane misericórdiam tuam", "kind": "glossary",
        "why": "*misericórdiam tuam* is the accusative object of *exsultábo*, parallel to *cantábo fortitúdinem tuam*. D44 settled *exsultáre* + accusative → *exultar em* (50:16), because *exultar* takes no object in Portuguese; held there twice against the Latinist. The v2 gate (minor) asked *celebrarei com júbilo a vossa misericórdia*, which keeps the object and the parallel but spends a second verb (*celebrar*) and an added noun. Held under D44; his wording is option 2. This colon and 58:17b are the Alleluia of 03-28.",
        "options": [
            {"label": "exultarei na vossa misericórdia", "forms": {"exsultabo": "exultarei na vossa misericórdia"}, "note": "D44", "from": "glossary"},
            {"label": "celebrarei com júbilo a vossa misericórdia", "forms": {"exsultabo": "celebrarei com júbilo a vossa misericórdia"}, "note": "the v2 Latinist's; MS1932 *celebrarei com alegria*", "from": "latinist"}
        ]})
d['status'] = 'reviewed'
d['audit'].append({"step": "latinist", "file": "critic/v2.latinist.json", "note": "claude-opus-5-5 (fresh context, read latin.json), the gate on draft 2. No major, no critical: four minors, all held, each selectable. 'Faithful, literal … does not bring in the Hebrew.'", "outcomes": [
    {"verse": "58:5", "remark": "segui reto turns dirígere into motion; dirigi os meus passos", "outcome": "option", "decision": "direxi", "reason": "his fix supplies an object the Latin lacks (DRB, MS1932 do); he calls the draft defensible"},
    {"verse": "58:13b", "remark": "mais adds 'no longer'; e não existirão", "outcome": "option", "decision": "nonerunt", "reason": "e não existirão rhymes with the mediant consumação (rule 5); DRB also says 'no more'"},
    {"verse": "58:17", "remark": "exsultábo takes misericórdiam as object; celebrarei com júbilo", "outcome": "option", "decision": "exsultabo", "reason": "D44: exultar takes no object; held there against him twice"},
    {"verse": "58:17b", "remark": "vos fizestes active; vos tornastes", "outcome": "option", "decision": "factus", "reason": "the formula of 60:4, 117:21, 117:28b; raised also on v1"}]})
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
