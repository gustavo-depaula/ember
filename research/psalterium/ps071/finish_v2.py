"""Record the v2 Latinist gate for Ps 71 (clean of majors)."""
import json
from pathlib import Path

p = Path(__file__).parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    raise SystemExit('already recorded')
dec = {x['id']: x for x in d['decisions']}
dec['vellus']['why'] += (' **Gate (v2):** the Latinist asked *o velo* back (minor: *lã* is the material, not the fleece). Held: the ambiguity reader did not know *velo* and heard *véu* or *velho* — a wrong first hearing weighs more than the loss of the whole hide, and the rain on wool still stands. *o velo* stays option 2 for whoever rules.')
dec['adducent']['why'] += ' **Gate (v2):** the same minor repeated (*trarão*); held for D42 as in v1.'
d['audit'].append({'step': 'latinist', 'file': 'critic/v2.latinist.json',
    'note': 'Gate on draft 2 — claude-opus-5-5, fresh context, with latin.json. Clean of majors: two minors, both held with options. Everything changed in v2 (esteio, erva, quem o auxiliasse, digno de honra, as suas almas, the orders at 71:9 and 71:15) passed without remark; he named esteio and por ele as Septuagintal readings kept.',
    'outcomes': [
        {'verse': '71:6', 'remark': 'vellus is the fleece, not wool: o velo (minor)', 'outcome': 'option', 'decision': 'vellus', 'reason': 'velo was unknown to the ambiguity reader and misheard (véu / velho); lã keeps the wool the rain falls on.'},
        {'verse': '71:10', 'remark': 'addúcent: trarão, not levarão (minor, repeated from v1)', 'outcome': 'option', 'decision': 'adducent', 'reason': 'D42 addúcere → levar (42:3, 44:15–16); trazer is afférre\'s.'}]})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('recorded')
