"""Draft 1 fix after checks: 83:6 vós/pôs rhyme at mediant and final."""
import json
from pathlib import Path

p = Path(__file__).with_name('prayed.json')
d = json.loads(p.read_text())
for dec in d['decisions']:
    if dec['id'] == 'posuit':
        dec['why'] = (
            "The Latin echoes *dispósuit … pósuit*, and Portuguese has the same two roots (*dispôs … pôs*). "
            "Who 'set' the place is left open by the Latin (the man, or God in the third person; MS1932 glosses *(Deus)*); "
            "the bare verb keeps it open. The echo was the draft's first choice, but *que pôs* at the final rhymes with *vem de vós* "
            "at the mediant (checks: an accidental rhyme the Latin does not have, a defect under rule 5), and *o lugar que pôs* "
            "sounds unfinished. *Estabeleceu* is the plain sense of *pónere* with a place as object (L&S 'to set, appoint'), "
            "and keeps the subject as open as the Latin."
        )
        dec['options'] = [
            {"label": "que estabeleceu", "forms": {"posuit": "que estabeleceu"},
             "note": "Ruling: the plain sense; the root echo lost to avoid the rhyme.", "from": "checks"},
            {"label": "que pôs", "forms": {"posuit": "que pôs"},
             "note": "The root echo *dispôs … pôs* kept; rhymes with *vós* at the mediant.", "from": "draft"},
            {"label": "que destinou", "forms": {"posuit": "que destinou"}, "note": "MS1932.", "from": "MS1932"},
        ]
d['choices']['83:6'] += (
    " Length: first colon +4 (*bem-aventurado*, D19's known cost); second colon about −2 against the Latin's 28 syllables."
)
d['choices']['83:3'] += " First colon +3: the articles before possessives (rule 5)."
d['choices']['83:4'] += " Second colon +4: the second *para si* kept (decision `sibi2`)."
d['choices']['83:4b'] += " Second colon −3: the formula; the Latin's *et* is kept."
d['choices']['83:5'] += " First colon +3: *bem-aventurados* (D19)."
d['choices']['83:13'] += " Second colon +5: *bem-aventurado* (D19)."
d['choices']['83:11b'] = d['choices']['83:11b'] + " Second colon −3, accepted."
d['audit'].append({"step": "checks", "note": "Hard checks pass. Soft: 83:6 rhyme *vós / pôs* at mediant and final — fixed (decision `posuit` now rules *que estabeleceu*; the echo *que pôs* kept as option). Length flags accepted (83:3 +3, 83:4 +4, 83:4b −3, 83:5 +3, 83:6 +4, 83:13 +5 — articles, the kept *para si*, *bem-aventurado*; reasons in `choices`)."})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
