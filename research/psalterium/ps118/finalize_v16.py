"""Close draft 16 of Ps 118 (no wording changes): the Latinist gate on draft 16, one more option, the closing
checks note, the handoff note extended, status → reviewed.   Run once:
python3.13 research/psalterium/ps118/finalize_v16.py"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
if data['version'] != 16 or data['status'] == 'reviewed':
    sys.exit('expected draft 16, not yet closed')
byId = {d['id']: d for d in data['decisions']}
C = data['choices']

byId['ignitum']['options'].insert(1, {
    'label': 'está intensamente em brasa', 'forms': {'ignitum': 'está intensamente em brasa'},
    'note': 'The Latinist on draft 16 (minor): "todo" is totality, veheménter is intensity. Refused: "todo em brasa" is how Portuguese intensifies the phrase, and "intensamente em brasa" is not said; the image, he agrees, is kept.', 'from': 'latinist'})
C['118:140'] += ' The Latinist (draft 16, minor) would have "intensamente" for "todo"; refused as unidiomatic, kept as an option.'
C['118:152'] += ' The Latinist (draft 16, minor) wants "No início soube": he had passed "Desde o início" three times; both Vulgate-family versions have it; and "No início soube" is heard as "at first I knew — and later did not". Option in "initio".'

data['audit'] += [
    {'step': 'latinist', 'file': 'critic/v16.latinist.part4.json', 'note': 'Draft 16, 118:129–176 only — the gate on the final wording. No major. Two minors, both refused with reasons and kept as options; the five verses draft 16 changed (118:136, 138, 152, 154, 175) drew nothing else. "A tradução conserva, em geral, o sentido do latim, inclusive suas construções incomuns; os reparos identificados são menores." No remark on the clause "o que dissestes" (second reading running).',
     'outcomes': [
         {'verse': '118:140', 'remark': 'minor: "todo" says totality, veheménter intensity; wants "está intensamente em brasa"', 'outcome': 'option', 'decision': 'ignitum', 'reason': '"Todo em brasa" is the idiomatic intensive; "intensamente em brasa" is not said.'},
         {'verse': '118:152', 'remark': 'minor: "Desde o início" adds continuity to Inítio; wants "No início soube"', 'outcome': 'option', 'decision': 'initio', 'reason': 'Passed by him on drafts 13, 14 and 15 with the same adverb; Douay-Rheims and Matos Soares 1932 both have "from the beginning"; "No início soube" is heard as "at first — and later not".'},
     ]},
    {'step': 'checks', 'note': 'Draft 16, via ps118/partial.py AND the ordinary checks.py (the psalm is whole: 176 of 176 verses; "range" reads 118:1–118:176, which site.py only consults while verses are missing): hard checks pass, ids and marks match the Latin in every verse. In 118:129–176: 17 soft length flags, none new since draft 13 — long cola are the psalm-wide cost of "os vossos mandamentos" and the formulas (118:134b = 146b, 147b, 151b, 168b, 172b), 118:148a (19 syllables for 15; one breath, watched) and 118:130b; short cola are where "os vossos preceitos" or "muito" stands for a long Latin word (118:129b, 141b, 155b, 163a, 167b). One rhyme note accepted: 118:154 "resgatai-me … vivificai-me", the Latin\'s own echo (rédime me … vivífica me). The two neighbouring-finals notes (118:16/17, 118:111/112) belong to earlier portions and were accepted there. 118:1–128 proved untouched by ps118/verify_untouched_v12.py.'},
]

handoff = next(s for s in data['audit'] if s['step'] == 'handoff')
handoff['note'] += ' — ADDED by the agent of 118:129–176 (drafts 13–16): THE PSALM IS WHOLE. "range" is 118:1–118:176 (site.py reads it only while verses are missing; harmless now); ps118/partial.py still runs (its progress line was made safe for a complete psalm) and the ordinary checks.py now runs on the folder too. prayed.v12.json is the psalm as the 81–128 agent and D23 left it; ps118/verify_untouched_v12.py proves 1–128 untouched. Critics of this portion: ps118/part4/ (built by part3.py 129 176 part4), outputs critic/v13–v16.*.part4.json. Formulas now also set: redímere at the imperative → Resgatai-me ("Redimi-me" = I redeemed myself); dírige → Endireitai; éripe me with no source → libertai-me; audi at the vós imperative → Escutai (glossary row); gratis → sem motivo; scándalum → tropeço; tabéscere → definhar; prævenire (intransitive) → adiantar-se; serváre (a law) → observar; in conspéctu tuo → "a vossa presença" with the preposition each verb wants; deprecátio → prece, postulátio → pedido; juxta → conforme (secúndum → segundo); Inítio / Princípium → início / princípio; eructáre → fazer jorrar; requírere merged with exquírere → procurar (one Greek verb); ovis quæ périit → "ovelha que se perdeu" (perecer would make a dead sheep). Heard wrong by the blind reader and changed: "Mandastes" + bare object (= sent) → Ordenastes (118:138); "Julgai o meu juízo" (= evaluate my opinion) → "Julgai em juízo a minha causa"; "muito ardente" (= fervent) → "está todo em brasa". D16 in this portion: the clause held in all six singulars with stylist and blind reader, twice each; the plural "ditos" was refused by the stylist in all three places, twice. Held against the stylist twice for the Latin\'s word: 118:135 Iluminai, 118:173 Seja a vossa mão.'

data['status'] = 'reviewed'
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('closed:', data['version'], data['status'], data['range'], len(data['decisions']), 'decisions')
