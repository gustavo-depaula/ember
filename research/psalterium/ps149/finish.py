"""Ps 149: record the v2 Latinist gate; 149:7 'entre' held, 'sobre' as option."""
import json
from pathlib import Path

p = Path(__file__).with_name('prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
d['verses']['149:7'] = 'Para fazer vingança {innat}: * {increp} {inpop}.'
idx = next(i for i, x in enumerate(d['decisions']) if x['id'] == 'increp')
d['decisions'].insert(idx, {
    "id": "innat", "refs": ["149:7"], "latin": "in natiónibus … in pópulis", "kind": "grammar",
    "why": "*in* + ablative with *fácere vindíctam*: the nations are those on whom the vengeance falls (DRB 'upon the nations … among the people'). The v2 Latinist (minor) asked 'nas / sobre' for the parallel with 149:9 *in eis → sobre eles*. Held: 'entre as nações … entre os povos' is how Portuguese says it with a plural of peoples (MS1932; the CNBB too), and the ambiguity reader heard it as the Latinist wants — 'vingar-se das nações', 'castigar os povos'; 'nas nações' (his fix) is heard as a place ('in the countries'), and 'sobre' twice makes the elliptical second colon heavier. The Latinist himself called 'entre' defensible.",
    "options": [
        {"label": "entre as nações … entre os povos", "forms": {"innat": "entre as nações", "inpop": "entre os povos"}, "note": "Ruling: MS1932's prepositions; heard rightly by the ambiguity reader.", "from": "draft"},
        {"label": "sobre as nações … sobre os povos", "forms": {"innat": "sobre as nações", "inpop": "sobre os povos"}, "note": "Latinist v2 (minor): the object on which it falls, parallel to 149:9 'sobre eles'.", "from": "latinist"},
        {"label": "nas nações … nos povos", "forms": {"innat": "nas nações", "inpop": "nos povos"}, "note": "Latinist v2's literal fix; heard as location.", "from": "latinist"}
    ]
})
d['status'] = 'reviewed'
d['audit'].append({"step": "latinist", "file": "critic/v2.latinist.json", "model": "claude-opus-5-5 (fresh context)",
    "note": "Gate on draft 2: no major; 1 minor (149:7 'entre'), held with the Latinist's wordings as options. Overall: close and faithful, pointing matches.",
    "outcomes": [{"verse": "149:7", "remark": "'entre' reads as location; 'nas'/'sobre' closer, parallel with 149:9", "outcome": "option", "decision": "innat",
                  "reason": "Held: 'entre' is the Portuguese idiom with plural peoples, the ambiguity reader heard vengeance upon the nations, 'nas nações' is heard as place; the Latinist called it defensible."}]})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
