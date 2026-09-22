"""Ps 51: record the v2 gate. python3.13 research/psalterium/ps051/finish.py"""
import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(path.read_text(encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}

dec['cogitavit']['options'].append({'label': 'planejou a', 'forms': {'cogitavit': 'planejou a'}, 'note': 'Latinist (v2 gate, minor): cogitáre with a direct object is to devise. Held for the row; see the audit.', 'from': 'latinist'})
dec['cogitavit']['why'] += ' Two readers (the v1 stylist, the v2 Latinist) found *pensou em* weak for a verb with a direct object; held for the row, which has *pensar em* with an evil object at 34:4b (*os que pensam em males contra mim*) and 20:12; if the row splits (cogitáre + an evil thing → *maquinar*), this verse follows. Proposed in the row.'
dec['praecipitationis']['options'].append({'label': 'de precipício', 'forms': {'praecipitationis': 'de precipício'}, 'note': 'Latinist (v2 gate, minor): keeps the headlong image. Refused: *palavras de precipício* is a place, not an act, and is not said; he himself calls *ruína* defensible.', 'from': 'latinist'})
dec['posuit']['options'].append({'label': 'não fez de Deus o seu ajudador', 'forms': {'posuit': 'não fez de Deus o seu ajudador'}, 'note': 'Latinist (v2 gate, minor): another agent noun.', 'from': 'latinist'})

d['audit'].append({'step': 'latinist', 'file': 'critic/v2.latinist.json', 'note': 'Gate, claude-opus-5-5 (fresh context). No major. Three minors, all held; the v2 changes (51:4 *tramaste o engano*, 51:7 *desalojará* and the comma, the dropped *uma*) passed.', 'outcomes': [
    {'verse': '51:4', 'remark': '*pensou em* weakens cogitáre + object; fix *planejou a injustiça*', 'outcome': 'option', 'decision': 'cogitavit', 'reason': 'The cogitáre row (*pensar em*, 20:12, 34:4b with an evil object); the second reader to say so, so a split of the row is proposed for the coordinator rather than made in one verse.'},
    {'verse': '51:8', 'remark': '*auxílio* for the agent noun adjútor; fix *ajudador*', 'outcome': 'option', 'decision': 'posuit', 'reason': 'The adjútor row, held psalter-wide against the same remark (D24); needs its own ruling.'},
    {'verse': '51:6', 'remark': '*ruína* softens præcipitátio; fix *palavras de precipício*', 'outcome': 'option', 'decision': 'praecipitationis', 'reason': '*precipício* is a cliff, a place, not the act of hurling down; the reader calls *ruína* defensible; DRB and MS1932 have it.'}
]})
d['audit'].append({'step': 'glossary', 'note': 'Rows proposed (open, Ps 51): benígnitas → benignidade; novácula → navalha, acútus of a blade → afiada; præcipitátio → ruína; emigráre (transitive) → desalojar; radix → raiz; olíva fructífera → oliveira frutífera; fácere dolum → tramar o engano. Evidence appended to gloriári in, malítia, cogitáre, dolus, in finem, evéllere, præválere, adjútor, multitúdo.'})
path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
