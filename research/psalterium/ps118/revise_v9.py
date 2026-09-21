"""Draft 9 of Ps 118: the Latinist gate on draft 8 (critic/v8.latinist.part3.json) — one fix taken (118:128),
one finding held on purpose (118:114). Draft 8 is kept as prayed.v8.json. 118:1–80 untouched.

Run once from the repo root, on a prayed.json that is still version 8:
  python3.13 research/psalterium/ps118/revise_v9.py
"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
if data['version'] != 8:
    sys.exit(f"prayed.json is version {data['version']}, expected 8 — not touching it")
if not (here / 'prayed.v8.json').exists():
    sys.exit('prayed.v8.json is missing — copy prayed.json to it first')
byId = {d['id']: d for d in data['decisions']}
C = data['choices']

# --- 118:128: the passive comes back (Latinist, major)
d = byId['dirigebar']
d['options'].insert(0, {'label': 'eu era dirigido para', 'forms': {'dirigebar': 'eu era dirigido para'}, 'note': 'Draft 9, the Latinist\'s fix (major) on draft 8: dirigébar is passive — the psalmist was directed; the reflexive gives him the initiative. Draft 7 had the passive and the Latinist passed it; draft 8 left it because the stylist heard "era dirigido a" as mechanical. Between the two the Latinist governs, since it is the sense that moves: 118:5 asked that his ways be directed (Útinam dirigántur → sejam dirigidos), and this verse reports it done. "Para" (the Latinist\'s preposition) instead of draft 7\'s "a" is the one thing kept from the stylist\'s complaint: it is the less stiff of the two.', 'from': 'latinist'})
next(o for o in d['options'] if o['label'] == 'eu me dirigia para')['note'] = 'Draft 8, from the stylist\'s remark (he offered "me orientava para"): the middle reading. Marked major by the Latinist: the form is passive, and the reflexive makes the psalmist the one who directs.'
C['118:128'] = C['118:128'].replace('Decisions "dirigebar" (draft 8: the middle, "eu me dirigia para"), "odio_habui".', 'Decisions "dirigebar" (draft 9: the passive again, "eu era dirigido para", at the Latinist\'s insistence — the blind reader had supplied God as the agent, which is what the passive is for), "odio_habui".')

# --- 118:114: held
ad = next(o for o in byId['adjuva']['options'] if o['label'] == 'auxiliar · auxiliador')
ad['note'] += ' On draft 8 the Latinist repeated the remark as MAJOR, the text being unchanged. Held on purpose — see the audit step for critic/v8.latinist.part3.json.'
C['118:114'] += ' STANDS AGAINST THE LATINIST (minor on draft 7, major on draft 8, same words): he wants the agent nouns "auxiliador … protetor". Held: suscéptor → amparo is settled (D19; the glossary row it settled lists 118:114 among the places the word must serve); adjútor → auxílio follows Ps 117:6–7, where the same remark was refused twice; "protetor" is protéctor\'s. Logged for the main session beside D10 and D20.'

data['audit'] += [
    {'step': 'latinist', 'file': 'critic/v8.latinist.part3.json', 'note': 'The gate on draft 8, 118:81–128 only. Two findings, both major; every other verse "adequate to the Latin", marks identical. 118:128 dirigébar is passive — taken (draft 9). 118:114 abstract nouns for adjútor / suscéptor — the draft-7 remark again, raised from minor to major with the text unchanged — held on purpose. None of draft 8\'s new wordings drew a remark: "à espera de" for defícere in (118:81, 82, 123), "histórias" (85), the rebuilt 118:92, "destruir" (95), "muito amplo" (96), the natural order of 98–100, "resolvi" (106), "Fazei que vos agradem" (108), "tive ódio" (113, 128), "malvados" (115), "no que aguardo" (116), "conheça" (125); nor the D16 clause or "dito".',
     'outcomes': [
         {'verse': '118:128', 'remark': 'dirigébar is passive; the Portuguese reflexive gives the psalmist the initiative; fix "eu era dirigido para todos os vossos mandamentos"', 'outcome': 'taken', 'decision': 'dirigebar'},
         {'verse': '118:114', 'remark': '(major) "o meu auxílio e o meu amparo" are abstractions for the one who helps and protects; fix "o meu auxiliador e o meu protetor"', 'outcome': 'refused', 'decision': 'adjuva', 'reason': 'suscéptor → amparo is settled (D19), and the glossary row D19 settled lists 118:114 among the places the word must serve; adjútor → auxílio is Ps 117:6–7\'s rendering, where this remark was refused twice; "protetor" is protéctor\'s word in the glossary, so his fix would merge two Latin nouns. The severity rose without the text changing. "auxiliador" is option 3 of decision "adjuva". This is a place where the final text stands against a major finding of the gate: reported to the main session.'},
     ]},
    {'step': 'revision', 'version': 9, 'note': 'Draft 9 = draft 8 with 118:128 "eu era dirigido para" (the Latinist\'s passive). Nothing else changed; the Latinist gate was not run again, the one change being his own wording.'},
]
data['version'] = 9
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 9 written')
