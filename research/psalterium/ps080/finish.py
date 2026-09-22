"""Record the v2 Latinist gate for Ps 80."""
import json
from pathlib import Path
p = Path(__file__).parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    d['audit'].append({"step": "latinist", "file": "critic/v2.latinist.json", "note": "Gate on draft 2 — claude-opus-5-5, fresh context, with latin.json. Clean of majors: two minors, both held with options. Everything changed in v2 (80:3 order, 80:5 articles, 80:8 proclisis, 80:15 *Com um nada, talvez* and *aqueles que os*) passed without remark.", "outcomes": [
        {"verse": "80:2", "remark": "*adjútor* is an agent noun; *nosso auxiliador*", "outcome": "refused", "decision": "adjutori", "reason": "the *adjútor* row (uniform *auxílio*, open for Gustavo) is not changed in one psalm; *auxiliador* is option 2."},
        {"verse": "80:5", "remark": "dative *Deo Jacob* as genitive; *para o Deus de Jacó* (repeated from v1)", "outcome": "refused", "decision": "deojacob", "reason": "as in v1: the possessive dative, parallel to *in Israël*, is the reading the ambiguity reader heard; *para o* is heard as 'in God's favour'. Option 2."}]})
    d['status'] = 'reviewed'
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
