"""Ps 47: take the v2 gate's one minor (47:11 Segundo) and record it. Run once, from the repo root."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = json.loads((here / 'prayed.json').read_text(encoding='utf-8'))
(here / 'prayed.v2.json').write_text(json.dumps(p, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
d = next(x for x in p['decisions'] if x['id'] == 'secundum')
como, segundo = d['options']
segundo['note'] = "Ruling (v3); the Latinist's gate (minor): secúndum is 'according to', and with *assim* kept it says the praise is measured by the Name, not merely like it. DRB 'According to'."
segundo['from'] = 'latinist'
como['note'] = 'drafts 1–2; MS1932 *Como*; a plain likeness, the more natural correlative.'
d['options'] = [segundo, como]
d['why'] += " v3: the Latinist's gate asked for *Segundo* — the proportion ('as great as your name, so great your praise') is the Latin's, and *Segundo … assim* is sayable; taken. The Holy Name antiphon still reads alone."
p['version'] = 3
p['status'] = 'reviewed'
p['audit'] += [
    {'step': 'latinist', 'file': 'critic/v2.latinist.json',
     'note': 'Gate, claude-opus-5-5 (fresh context). No major. One minor, 47:11 *Como* → *Segundo* (secúndum is a measure, not a likeness), taken. Every draft-2 change passed.',
     'outcomes': [{'verse': '47:11', 'remark': '*Como* for secúndum → *Segundo*', 'outcome': 'taken'}]},
    {'step': 'revision', 'version': 3, 'note': "v3: 47:11 *Segundo o vosso nome* (the gate's minor); one word, the Latinist's own fix, so no second gate. Draft 2 kept as prayed.v2.json."},
]
(here / 'prayed.json').write_text(json.dumps(p, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
