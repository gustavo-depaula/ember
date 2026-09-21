"""Close draft 10 of Ps 118 (118:1–128): record the Latinist gate on draft 10 (critic/v10.latinist.part3.json),
add the refused fixes as options, extend the handoff step for the agent of 118:129–176, set the status.
No prayed wording changes, so the version stays 10.

Run once from the repo root:  python3.13 research/psalterium/ps118/finalize_v10.py
"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
if data['version'] != 10:
    sys.exit(f"prayed.json is version {data['version']}, expected 10")
if any(s.get('file') == 'critic/v10.latinist.part3.json' for s in data['audit']):
    sys.exit('already finalized')
byId = {d['id']: d for d in data['decisions']}
C = data['choices']

# --- 118:92: the Latinist's indicative, as an option
byId['nisi_quod']['options'].insert(1, {'label': 'Se não fosse porque a vossa lei é a minha meditação', 'forms': {'nisi_quod': 'Se não fosse porque a vossa lei é a minha meditação: * então talvez na minha humilhação eu tivesse perecido'}, 'note': 'For the Latinist, who on draft 10 marked the ruling MAJOR: nisi quod … est states in the present indicative that the law is his meditation, and the ruling turns the statement into an imperfect subjunctive. His own fix is "Se não fosse o fato de que a vossa lei é …", which is office prose; this says the same in spoken Portuguese and keeps the formula of 118:77 word for word. Not taken: it is +5 syllables in the first colon; it brings back the rhyme meditação / humilhação unless the second colon is turned round, which is what the stylist disliked in draft 7; and it has been read by no stylist. It is the option to pick if the indicative is wanted.', 'from': 'latinist'})
C['118:92'] += ' STANDS AGAINST THE LATINIST (major, on draft 10 only — the gate on draft 8 read the same words and passed them): he wants the present indicative of nisi quod … est kept. Held: a counterfactual presupposes exactly the fact the indicative states, so nothing of the sense moves; the mood of a clause is grammar, where D2 lets the ear lead, and the stylist named the indicative build the worst line of the portion; and both Vulgate-family versions do the same (Douay-Rheims "Unless thy law had been my meditation"; Matos Soares "Se a tua lei não tivesse sido a minha meditação"). The indicative is option 2 of decision "nisi_quod".'

# --- 118:116: the Latinist's noun, as an option
byId['exspectare']['options'].append({'label': 'aguardar · pela minha expectativa', 'forms': {'exspect95': 'me aguardaram', 'exspect116': 'pela minha expectativa'}, 'note': 'The Latinist on draft 10 (minor): exspectátio names the psalmist\'s expecting, "o que aguardo" names the thing expected. True, and the same metonymy Matos Soares makes ("no que espero"). Not taken: the stylist refused "expectativa" as bureaucratic; to be shamed over one\'s expecting and over what one expects is one disappointment.', 'from': 'latinist'})
C['118:116'] += ' The Latinist on draft 10 (minor, twice in this verse): "o que dissestes" dates an utterance the Latin noun leaves timeless — the cost D16 names and accepts; and "pelo que aguardo" names the thing awaited, not the awaiting — option added to decision "exspectare".'
C['118:82'] += ' The Latinist on draft 10 (minor): the clause "o que dissestes" brings in a past the Latin noun does not express; he asks for "à espera da vossa palavra". That is D16\'s accepted cost (its own words: "the perfect dissestes dates an utterance the Latin leaves timeless"), and "palavra" is D16\'s named retreat, for the main session.'
C['118:114'] += ' The gate on draft 10 repeated it, major again.'

data['audit'].append(
    {'step': 'latinist', 'file': 'critic/v10.latinist.part3.json', 'note': 'The gate on draft 10 (118:81–128 only); marks identical in all 48 verses. Four verses, none of them among the five draft 10 changed except 118:116: two majors, both held on purpose (118:92, 118:114); three minors, all refused with their fixes kept as options (118:82 and 118:116 on the D16 clause; 118:116 on exspectátio). 118:128 (the passive restored in draft 9) and draft 10\'s changes at 118:91, 101, 111, 121 drew no remark. The gate is NOT clean: the final text stands against the Latinist at 118:92 and 118:114, each argued below and in the verse\'s choices note, for the main session to confirm or overturn. Note on the reader: the three gate readings of this portion (drafts 7, 8, 10) are not consistent with one another — 118:92 has read the same since draft 8 and was passed then; 118:114 has never changed and went from minor to major; the D16 clause has stood since draft 7 and is remarked on only now.',
     'outcomes': [
         {'verse': '118:92', 'remark': '(major) nisi quod … est affirms in the present that the law is his meditation; the translation puts an imperfect subjunctive in its place; fix "Se não fosse o fato de que a vossa lei é a minha meditação"', 'outcome': 'option', 'decision': 'nisi_quod', 'reason': 'A counterfactual presupposes the very fact the indicative states; mood is grammar (D2), and the indicative build was the stylist\'s worst line; Douay-Rheims and Matos Soares 1932 both have the counterfactual, so it is inside the outer bound; the gate on draft 8 passed the same words. A sayable indicative ("Se não fosse porque …") is option 2.'},
         {'verse': '118:114', 'remark': '(major) "auxílio" and "amparo" are abstractions for the one who helps and protects; fix "o meu auxiliador e o meu protetor"', 'outcome': 'refused', 'decision': 'adjuva', 'reason': 'As on drafts 7 and 8: suscéptor → amparo is settled (D19); adjútor → auxílio is Ps 117:6–7\'s; "protetor" is protéctor\'s word.'},
         {'verse': '118:82', 'remark': '(minor) "à espera do que dissestes" introduces a past determination the Latin noun does not express; fix "à espera da vossa palavra"', 'outcome': 'refused', 'decision': 'eloquia', 'reason': 'D16 rules the clause and names this cost in so many words; "palavra" is D16\'s retreat for the whole term, not one verse\'s choice. It is the label "palavras" of decision "eloquia".'},
         {'verse': '118:116', 'remark': '(minor) "segundo o que dissestes": the same past determination; fix "segundo a vossa palavra"', 'outcome': 'refused', 'decision': 'eloquia', 'reason': 'D16, as for 118:82; the fix would also make the formula word for word secúndum verbum tuum (118:107), which D16 refuses.'},
         {'verse': '118:116', 'remark': '(minor) "pelo que aguardo" names the object awaited, the Latin names the expectation; fix "pela minha expectativa"', 'outcome': 'option', 'decision': 'exspectare', 'reason': 'The stylist refused "expectativa" as bureaucratic; Matos Soares makes the same metonymy ("no que espero").'},
     ]})

# --- handoff, extended for the last portion
for s in data['audit']:
    if s['step'] == 'handoff':
        s['note'] += ' — ADDED by the agent of 118:81–128, for whoever takes 118:129–176: copy prayed.json to prayed.v10.json first. Mechanics: ps118/part3.py takes bounds (python3.13 research/psalterium/ps118/part3.py 129 176 part4); ps118/verify_untouched_v6.py shows how to prove the earlier verses and decisions untouched (make a v10 twin); ps118/summary_decisions.py lists every decision with its labels and option-0 forms — read it before adding slots, because extend() needs a form for EVERY label. D16 in this portion: the clause "o que dissestes" passed the stylist twice and the blind reader (118:82, 116); the Latinist remarked on its past tense only on his third reading (minor). After a preposition the clause needs care: "pelo que dissestes" was heard as cause. The plural "os vossos ditos" (118:103) and the noun "o dito da vossa justiça" (118:123) were refused by the stylist twice each — expect the same for the plural at 118:148, 158, 162, and decide the singulars (118:133, 140, 154, 169, 170, 172) with that in mind. Formulas now also set: defícere in → desfalecer à espera de (decision "deficere_in"; 118:81, 82, 123); in ætérnum → eternamente (decision "in_aeternum", slots {aet} / {Aet}; 118:142, 144, 152, 160 next — the stylist keeps putting "para sempre" in its place); ódio hábui → tive ódio, object first (118:163 Iniquitátem ódio hábui; odívi stays "odiei"); ádjuva → auxiliai (118:175 adjuvábunt: decision "adjuva"); súscipe → amparai; exspectáre → aguardar; erráre → extraviar-se (chosen with 118:176 Errávi sicut ovis in mind); quǽrere → buscar (118:176 quære servum tuum); intelléxi → entendi; pérdere → destruir; "Por isso" for both ídeo and proptérea (118:129, 140 …); super + comparison → "mais que"; nimis has no one rendering (118:4 à risca, 118:96 muito; 118:138 still to come); usquequáque → "de todo" goes BEFORE the participle in an affirmative clause (118:107 Fui de todo humilhado); fácere judícium → at 118:84 "fareis juízo sobre", at 118:121 "Pratiquei o juízo e a justiça" ("fiz juízo" is heard as forming an opinion); dirigébar stays passive (the Latinist marked the middle major) — 118:133 Gressus meos dírige. Rule-3 traps met here: "Agi" (fac cum → Tratai, 118:124); "decidi" and "Adquiri" are first-person pasts that equal a vós imperative — harmless in narration, avoided where free. Heard wrong by the blind reader and changed: "malignos" (demons) → malvados; "todo o dia" (every day) → o dia todo; "fábulas" (Aesop) → histórias. The final text of this portion stands against the Latinist at 118:92 (major) and 118:114 (major): see their choices notes.'

data['status'] = 'reviewed'
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('finalized: version', data['version'], data['status'], len(data['decisions']), 'decisions', len(data['audit']), 'audit steps')
