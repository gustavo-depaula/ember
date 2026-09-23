"""One-off v1 patch of ps212/prayed.json after circulation and checks (keeps key order)."""
import json
from pathlib import Path
p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}
dec['inferos']['options'][0]['note'] = "Draft: the Latin's plural and word, the traditional Portuguese term for the realm of the dead. Not the living Creed wording — the Brazilian Apostles' Creed says 'desceu à mansão dos mortos' (circulation.md); the CNBB LH paraphrases this line as 'aos abismos da terra'. Proposed as a formula row for the three DO canticles that have ad ínferos (212, 223, 234)."
dec['inferos']['options'][2]['note'] = "Clear, and near the Brazilian Creed's 'mansão dos mortos' (verified, circulation.md); a paraphrase of one word (rule 2). MS1932 has 'até ao sepulcro', DRB 'to hell'."
dec['omnipotens']['why'] = "omnípotens is not in the 150 psalms (no row). 'todo-poderoso' is the plain Portuguese word and the Brazilian Creed's ('Creio em Deus, Pai todo-poderoso', verified, circulation.md); 'onipotente' is the learned cognate. MS1932 keeps 'omnipotente'."
c = d['choices']
c['13:3'] += " The second colon is 3 syllables short of the Latin's 13 (checks) — accepted: nothing is dropped, Portuguese is simply terser here."
c['13:7'] = c['13:7'].replace("the colon is 4 syllables short of the Latin's 18, accepted.", "the cola are 6 and 3 syllables short of the Latin's 28 and 18 (checks), accepted: every word is rendered, and 'confitémini' / 'Aspícite' shrink to 'dai graças' / 'Olhai'. The second colon's order also matches DO's antiphon for this canticle, 'Exaltáte Regem sæculórum in opéribus vestris' (Psalmi major.txt 47, 325), so the antiphon can be cut from the verse.")
c['13:8'] += " The first colon is 3 syllables short of the Latin's 20 (checks), accepted."
c['13:11'] += " The CNBB LH / Lectionary text has 'seus eleitos' here (circulation.md); 'escolhidos' is kept for the open eléctus row."
d['audit'].append({"step": "checks", "note": "render.py and checks.py run with the DO number (212): hard checks pass (ids and pointing marks match the Latin; the heading line is skipped as for 233). Soft length flags on 13:3b (−3), 13:5a (−3), 13:7a (−6), 13:7b (−3), 13:8a (−3), each accepted in choices; no cadence flags. Circulation checked and recorded in ps212/circulation.md (CNBB LH Tb 13,2-8, Tuesday Lauds of week I, and the Lectionary's Tb 13 responsorial are the same Brazilian paraphrase of the Greek-based text; the Apostles' Creed wording). Shared tools: parallels.py gives only the Latin and pt-PT for a canticle (as for 233); worked around inside ps212/ with concord.py (the psalm number printed beside each hit), gloss.py, show.py and strip.py (HTML → text for circulation). No shared script was edited."})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
