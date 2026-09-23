"""Append the v1 checks step to the audit."""
import json
from pathlib import Path
p = Path('research/psalterium/ps145/prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
d['audit'].append({"step": "checks", "note": (
    "Hard checks pass. Rhyme Sião / geração at mediant and final in 145:10 (Latin order) — fixed by order (decision sion). "
    "Soft length flags accepted: 145:2a final +6 (= 103:33 word for word; D25's two words for psállere); 145:2b first -4 "
    "(nolíte + infinitive is one Portuguese verb); 145:5 first +6 (D19's six-syllable bem-aventurado and the supplied aquele); "
    "145:9 final +5 (exterminará; destruirá is the option, one syllable less); 145:10 final -6 (the formula de geração em geração).")})
d['choices']['145:10'] = d['choices']['145:10'] + " The vocative is placed before the apposition to avoid the Sião / geração rhyme (decision sion)."
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
