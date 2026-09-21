"""Ps 16 draft 3: the Latinist gate on draft 2 weighed. python3.13 research/psalterium/ps016/revise_v3.py
Reads prayed.v2.json (kept), writes prayed.json."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
data = json.loads((here / 'prayed.v2.json').read_text(encoding='utf-8'))
data['version'] = 3
d = next(x for x in data['decisions'] if x['id'] == 'aequitates')
d['why'] += (" Heard (draft 2, the gate): the Latinist, MAJOR — «O plural latino foi convertido em singular abstrato» → ‘as equidades’. Taken: draft 3 returns to the plural. "
             "The singular's only gain was the ear, and the plural is grammatical Portuguese, not a slip (unlike 'sangues', D29) — as 10:8 'as justiças', which no blind reader misheard. "
             "The blind reader's 'unknown word' holds for the singular too (the glossary row: unknown four times). The rhyme with 16:3 that the singular caused is gone either way, "
             "because 16:3 now ends 'em mim'.")
opts = {o['label']: o for o in d['options']}
opts['as equidades']['note'] = "Ruling (draft 3): the Latin's number, the glossary's word (as 10:8 'as justiças'); the Latinist's gate (major on the singular)."
opts['as equidades']['from'] = 'latinist'
opts['a equidade']['note'] = "Draft 2: the singular, for the stylist's ear; the Latinist marked the lost number major."
d['options'] = [opts['as equidades'], opts['a equidade'], opts['as coisas justas'], opts['o que é reto']]
data['audit'].extend([
    {'step': 'checks', 'note': "Draft 2: hard pass. Soft flags as draft 1 except 16:4 first colon +3 and 16:12 first colon (now within 2). 16:3 reordered so that 16:2 'a equidade' and 16:3 'iniquidade' do not rhyme (the flag checks raised on the first run of draft 2)."},
    {'step': 'latinist', 'file': 'critic/v2.latinist.json',
     'note': "Draft 2 — the gate. One major, one minor; the marks confirmed; every change of draft 2 but 16:2 passed (16:9b 'falou soberba', 16:11 'fixaram os seus olhos para se inclinarem à terra', 16:12 'pronto', 16:13 'adiantai-vos a ele', 16:14c 'Foram saciados', 16:3's order).",
     'outcomes': [
         {'verse': '16:2', 'remark': "MAJOR: the Latin's plural made an abstract singular → 'as equidades'", 'outcome': 'taken', 'decision': 'aequitates',
          'reason': "Draft 3 returns to draft 1's plural: grammatical, the Latin's, and the singular's gain was only the ear."},
         {'verse': '16:14b', 'remark': "minor (repeated): 'se encheu' favours an intransitive process → 'foi enchido'", 'outcome': 'refused',
          'reason': "As at draft 1: the pronominal passive is how Portuguese says a thing was filled; 'foi enchido' is not said."},
     ]},
    {'step': 'revision', 'version': 3,
     'note': "v3. One word: 16:2 'as equidades' again (the gate's major). Draft 2 is prayed.v2.json (flat text prayed.v2.vos.json, the file the v2 gate read). Script: ps016/revise_v3.py."},
])
(here / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok v3')
