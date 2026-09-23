"""v1: record the checks step and accepted soft flags."""
import json
from pathlib import Path
p = Path(__file__).with_name('prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
c = d['choices']
c['147:7'] += " Soft flag: second colon +4 by the counter, which does not elide; sung, 'seu‿espírito' and 'e‿correrão' close it to about +2. Accepted: nothing can go without losing a word of the Latin."
c['147:8'] += " Soft flag: first colon +4 by the counter; 'Ele‿anuncia‿a sua' elides to about +2. The named subject 'Ele' (decision qui) costs the rest."
c['147:9'] += " Soft flag: second colon -3 (the Latin's long 'manifestávit'); accepted."
d['audit'].append({"step": "checks", "note": "hard pass (ids and marks). Soft: 147:7b +4, 147:8a +4, 147:9b -3 syllables by the heuristic counter, each accepted in choices; no rhyme or cadence flags."})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
