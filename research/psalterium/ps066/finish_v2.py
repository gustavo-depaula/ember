"""Ps 66: record the v2 Latinist gate, take its one minor. Run once."""
import json
from pathlib import Path

here = Path(__file__).parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
g = next(x for x in d['decisions'] if x['id'] == 'gentibus')
em = next(o for o in g['options'] if o['label'] == 'em todas as nações')
entre = next(o for o in g['options'] if o['label'] == 'entre todas as nações')
em['note'] = 'Ruling (v2 gate); the preposition to the letter, keeping *in terra … in ómnibus géntibus* as one preposition twice (*na terra … em todas as nações*).'
em['from'] = 'latinist'
entre['note'] = 'Draft 1–2; as 56:10 *entre os povos … entre as nações*; MS1932 without his *e*.'
g['options'] = [em, entre] + [o for o in g['options'] if o not in (em, entre)]
g['why'] += ' **v2 gate:** the Latinist (minor) asked *em*, so that the verse repeats its preposition as the Latin does (*in terra … in géntibus*). A repetition is the Latin\'s to keep (D2), and *conhecer em todas as nações* is plain Portuguese; taken. *entre* stays an option.'
d['audit'].append({'step': 'latinist', 'file': 'critic/v2.latinist.json', 'note': 'claude-opus-5-5 (fresh context, read latin.json). Gate on draft 2: 1 minor (66:3 *entre* → *em*), taken; no majors. Tenses, jussives, the 66:7b reordering and *e que o temam* passed.',
                   'outcomes': [{'verse': '66:3', 'remark': 'entre loosens the in terra / in gentibus parallel; em', 'outcome': 'taken', 'decision': 'gentibus'}]})
d['audit'].append({'step': 'checks', 'note': 'After the gate fix: hard pass; soft flags unchanged (66:3a +4, 66:6a −3, 66:7b first colon −4, accepted as before). The one-word preposition change was proposed by the gate itself and is not re-gated.'})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
