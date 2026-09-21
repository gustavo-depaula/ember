"""Draft 11, notes only (no prayed wording changes, version stays 11): the closing checks step, and one
note corrected against the Latin.   python3.13 research/psalterium/ps118/notes_v11.py"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
if data['version'] != 11:
    sys.exit('expected version 11')
if data['audit'][-1]['step'] == 'checks':
    sys.exit('already applied')
byId = {d['id']: d for d in data['decisions']}

o = byId['senes']['options'][0]
old = 'It will be shared with senióres (104:22, 106:32).'
if old not in o['note']:
    sys.exit('senes note not found')
o['note'] = o['note'].replace(old, 'senes returns in 104:22 (senes ejus); the word will be shared with senióres (106:32 in cáthedra seniórum) — both checked in the DO Latin.')

data['audit'].append({'step': 'checks', 'note': 'Draft 11, via ps118/partial.py: hard checks pass (128 of 176 verses; ids and marks match the Latin). No rhyme at mediant and final inside any verse of 118:81–128. Accepted: the one soft rhyme flag of the portion, neighbouring finals 118:111 / 118:112 (-ão, a suffix rhyme between two verses). Length is the only other flag: 25 cola of the portion at ±3 or more (listed by ps118/flags_part3.py), none beyond +4 / −5, of three kinds: the long law-words and the refrain (os vossos mandamentos, os vossos testemunhos, pus toda a esperança na vossa palavra: 118:81b = 114b, 96b, 98a, 110b, 125b, 128a), the short "os vossos preceitos / juízos" for the five- and six-syllable Latin nouns (118:83b, 94b, 117b, 120b), and clarity bought with syllables (118:81a / 123a "à espera da", 92b, 95a "para me fazer perecer", 108a "Fazei que vos agradem"); the rest (84a, 85a, 86b, 90, 96a, 97, 105a) are plain renderings whose Portuguese simply runs shorter or longer than the Latin. ps118/verify_untouched_v6.py: 118:1–80 flatten to exactly draft 6\'s text, their slotted verses, choices and every option, label and form of the 72 earlier decisions are intact; only new slots and refs were added to them, and the handoff step extended.'})
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
