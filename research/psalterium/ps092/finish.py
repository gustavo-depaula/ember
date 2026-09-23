"""Record the v2 Latinist gate in ps092's audit."""
import json
from pathlib import Path
p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    d['audit'].append({
        "step": "latinist", "file": "critic/v2.latinist.json",
        "note": "Gate on v2, claude-opus-5-5, fresh context, with latin.json. No major. Three minors, the same three verses as v1: 92:1a and 92:5 repeated and held under their rows; 92:3b now asks back for *com*, the very wording v1 asked him to leave — the two runs contradict each other, so *pelas* stands (the gate's inconsistency between runs, as D24 and D43 found) and *com as* stays option 2.",
        "outcomes": [
            {"verse": "92:1a", "remark": "decor is comeliness: vestiu-se de beleza (repeated)", "outcome": "option", "decision": "decor", "reason": "glossary row decor → esplendor; beleza is pulchritúdo's (95:6/103:1)"},
            {"verse": "92:3b", "remark": "'pelas' fixes a causal reading; com as vozes", "outcome": "option", "decision": "avocibus", "reason": "v1's gate asked for pelas against com; the two runs contradict; por is the broader preposition and com was heard as accompaniment by the ambiguity reader"},
            {"verse": "92:5", "remark": "por longos dias weakens length of days; pela longura dos dias (repeated)", "outcome": "option", "decision": "longitudo", "reason": "longura archaic; the row and 22:6b kept"}
        ]})
    for dec in d['decisions']:
        if dec['id'] == 'avocibus':
            dec['why'] += " v2 gate: the Latinist asked back for *com* — contradicting his v1 request; held (see audit)."
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
    print('recorded')
else:
    print('already recorded')
