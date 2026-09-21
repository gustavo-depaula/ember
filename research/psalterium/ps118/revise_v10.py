"""Draft 10 of Ps 118: the second stylist pass on 118:81–128 (critic/v9.stylist.part3.json).
Draft 9 is kept as prayed.v9.json. 118:1–80 untouched.

Run once from the repo root, on a prayed.json that is still version 9:
  python3.13 research/psalterium/ps118/revise_v10.py
"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
if data['version'] != 9:
    sys.exit(f"prayed.json is version {data['version']}, expected 9 — not touching it")
if not (here / 'prayed.v9.json').exists():
    sys.exit('prayed.v9.json is missing — copy prayed.json to it first')
byId = {d['id']: d for d in data['decisions']}
V, C = data['verses'], data['choices']


def promote(decisionId, label):
    options = byId[decisionId]['options']
    chosen = next(o for o in options if o['label'] == label)
    options.remove(chosen)
    options.insert(0, chosen)
    return chosen


def option(decisionId, label):
    return next(o for o in byId[decisionId]['options'] if o['label'] == label)


# --- 118:90: he asks for "permanece" a second time — refused again; his new line recorded
byId['v90a']['options'].append({'label': 'De geração em geração permanece a vossa verdade', 'forms': {'v90a': 'De geração em geração permanece a vossa verdade'}, 'note': 'The stylist on draft 9: "é" leaves the sentence hanging; the mouth asks for a statement of permanence. Refused a second time, for the same reason: the Latin has no verb in this colon, and pérmanet stands in the next — the verse would say "permanece … permanece" where the Latin says it once. The copula stays (D14\'s build).', 'from': 'stylist'})

# --- 118:91: persevérat → permanece, and natural order (stylist)
V['118:91'] = '{ordinatione} o dia {perseverat}: * porque todas as coisas vos servem.'
o = promote('perseverat', 'permanece')
o['note'] = 'Draft 10, from the stylist: "perseverar said of the day asks for a mental accommodation that permanecer does not". Taken by D15\'s test for sermo: pérmanet / persevérat is a variation the Latin translator made inside one Greek verb (διαμένει three times, 118:89–91), with no difference of sense to carry over; of two faithful words the plainer (D2). The stanza now says "permanece" three times, as the Greek does. With it, natural order: "o dia permanece".'
option('perseverat', 'persevera')['note'] = 'Drafts 7–9: the cognate, keeping the Latin\'s variation. The blind reader understood it ("the day goes on because God so orders"); the stylist did not pass it on his second reading.'

# --- 118:101: order (stylist)
V['118:101'] = '{prohibui} os meus pés de todo caminho mau: * para guardar as vossas palavras.'
for o in byId['prohibui']['options']:
    o['forms']['prohibui'] = o['forms']['prohibui'][0].upper() + o['forms']['prohibui'][1:]
    o['label'] = o['forms']['prohibui']
C['118:101'] += ' Draft 10: the verb first ("Retive os meus pés de todo caminho mau"), from the stylist — order is the ear\'s (D2).'

# --- 118:104: his noun for the Latin's verb — an option
V['118:104'] = '{intellexi104}: * por isso odiei todo caminho de iniquidade.'
data['decisions'].append({
    'id': 'intellexi104', 'refs': ['118:104'], 'latin': 'A mandátis tuis intelléxi', 'kind': 'grammar',
    'why': 'intelléxi stands four times in 118:95–104, always "entendi"; here it is absolute, with nothing understood and nothing compared, and the stylist (second reading) says the ear is left waiting for what was understood. The Latin is exactly as bare.',
    'options': [
        {'label': 'Pelos vossos mandamentos entendi', 'forms': {'intellexi104': '{m_Por} entendi'}, 'note': 'Kept: the verb, the fourth "entendi" of the run (118:95, 99, 100, 104) — a repetition the Latin has (D2). "Pelos" as Douay-Rheims "By thy commandments".', 'from': 'draft'},
        {'label': 'Dos vossos mandamentos recebi entendimento', 'forms': {'intellexi104': '{m_De} recebi entendimento'}, 'note': 'The stylist\'s line; Douay-Rheims says as much ("I have had understanding"). It keeps the preposition (a = from) and the root (intelléctus → entendimento), but supplies "recebi" and breaks the run of "entendi".', 'from': 'stylist'},
    ],
})
for o in byId['mandata']['options']:
    o['forms']['m_De'] = 'Dos vossos mandamentos' if o['label'] == 'mandamentos' else 'Dos vossos preceitos'

# --- 118:111: the adverb without pauses (stylist); "Recebi" refused
V['118:111'] = 'Adquiri {aet} por herança {t_acc}: * porque são a exultação do meu coração.'
C['118:111'] = C['118:111'].replace('Draft 8: "eternamente" moved inside the colon, from the stylist, who heard it as a late addition at the end.', 'The adverb has moved twice: last in draft 7 (the Latin\'s place; the stylist: "a late addition"), between commas in drafts 8–9 (the stylist: "interrupts the movement"), and in draft 10 straight after the verb, without pauses, which is where his own line puts it ("Recebi para sempre por herança"). His "Recebi" is refused: it is accípere\'s verb, and acquírere is to get for oneself; his "para sempre" is the option of decision "in_aeternum".')

# --- 118:116: the preposition (stylist)
ex = byId['exspectare']
ex['options'].insert(0, {'label': 'aguardar · pelo que aguardo', 'forms': {'exspect95': 'me aguardaram', 'exspect116': 'pelo que aguardo'}, 'note': 'Draft 10. On his second reading the stylist could not hear "envergonhar no que aguardo" as a construction (he offers "por minha esperança"). His preposition is taken — it was also his on the first reading ("pelo que espero") — with exspectáre\'s verb kept: to be put to shame over what one awaits.', 'from': 'stylist'})
option('exspectare', 'aguardar · no que aguardo')['note'] = 'Drafts 8–9 (Matos Soares\' "no que espero" with exspectáre\'s verb). The stylist: not a recognisable construction with "envergonhar".'
ex['options'].append({'label': 'esperar · por minha esperança', 'forms': {'exspect95': 'me esperaram', 'exspect116': 'por minha esperança'}, 'note': 'The stylist\'s second proposal. Refused for the noun: "esperança" is spes (118:49), and exspectátio is kept apart from it as the Latin and the Greek keep it.', 'from': 'stylist'})
C['118:116'] = C['118:116'].replace('(draft 8: "no que aguardo")', '(draft 10: "pelo que aguardo")')

# --- 118:121: fácere judícium (stylist)
o = promote('feci_judicium', 'Pratiquei o juízo e a justiça')
o['note'] = 'Draft 10, from the stylist: "Fiz juízo" calls up forming an opinion and does not sit with "justiça" under one verb — the very idiom decision "v84b" was written to avoid. Matos Soares\' verb ("Tenho praticado a rectidão e a justiça"); the light verb yields, as in 118:65 and 118:78 (D2). The blind reader had heard draft 7 as "I acted with discernment and justly". Costs: "praticar" is also operári\'s verb in this psalter (praticar a iniquidade, 118:3) — here it serves the opposite deed; and the answer to 118:84 (fácies … judícium → fareis juízo) is no longer heard in the verb, only in the noun.'
option('feci_judicium', 'Fiz juízo e justiça')['note'] = 'Drafts 7–9: fácere → fazer, answering 118:84. Heard by the stylist as "I formed an opinion".'
C['118:121'] = 'trádere → entregar (glossary). Decisions "feci_judicium" (draft 10: "Pratiquei o juízo e a justiça"), "calumniari".'

# --- 118:113, 128: he now faults the order he proposed; an option, not a change
byId['odio_habui']['options'].append({'label': 'tive ódio (natural order)', 'forms': {'odio113': 'Tive ódio aos iníquos', 'odio128': 'tive ódio a todo caminho iníquo'}, 'note': 'The stylist on draft 9 finds the fronted objects literary and asks for the verb first in both verses. Refused: it returns "iníquos" to the mediant and "iníquo" to the end — the two proparoxytone cadences he himself faulted on draft 7, when "Aos iníquos tive ódio" was his own cure.', 'from': 'stylist'})

data['audit'] += [
    {'step': 'stylist', 'file': 'critic/v9.stylist.part3.json', 'note': 'Second stylist pass, on draft 9 (118:81–128 only), run because several of draft 8\'s cures were mine and not his. From 19 faulted verses to 11 (12 remarks); worst line 118:128, best 118:105; "the cadences meet the stress criterion, no insistent rhymes". 5 taken, 7 not taken (6 live on as options; 1, the passive of 118:128, refused outright because the Latinist gate governs there). Passed without remark this time: "à espera de" (118:81, 82, 123a), "histórias" (85), the rebuilt 118:92 (his worst line before), "destruir" (95), 96, 97, 98–100, "resolvi" (106), "Fui de todo humilhado" (107), "Fazei que vos agradem" (108), 112, "malvados" (115), "conheça" (125). On D16: the clause passed again in both places (118:82 "à espera do que dissestes", 118:116 "segundo o que dissestes"); "os vossos ditos" (118:103) and "o dito da vossa justiça" (118:123) were refused again, each time for "palavra(s)".',
     'outcomes': [
         {'verse': '118:90', 'remark': '"é" leaves the sentence hanging; alternative "De geração em geração permanece a vossa verdade"', 'outcome': 'option', 'decision': 'v90a', 'reason': 'Refused a second time: the Latin has no verb here and has pérmanet in the next colon; his line says it twice in the verse.'},
         {'verse': '118:91', 'remark': '"perseverar" said of the day needs a mental accommodation; alternative "Pela vossa ordem o dia permanece"', 'outcome': 'taken', 'decision': 'perseverat'},
         {'verse': '118:101', 'remark': 'the inversion makes the ear hear an unsupported complement first; alternative "Retive os meus pés de todo caminho mau"', 'outcome': 'taken'},
         {'verse': '118:103', 'remark': '"ditos" recalls maxims or popular sayings, sounds like a translator\'s choice; alternative "as vossas palavras"', 'outcome': 'option', 'decision': 'eloquia', 'reason': 'D16, as on draft 7. The second refusal of the plural is reported to the main session; "palavras" is the fifth label of decision "eloquia".'},
         {'verse': '118:104', 'remark': '"entendi" with no object leaves the ear waiting; alternative "Dos vossos mandamentos recebi entendimento"', 'outcome': 'option', 'decision': 'intellexi104', 'reason': 'It dissolves a repetition the Latin has (intelléxi four times in 118:95–104, always "entendi") and supplies a verb; the Latin is as bare.'},
         {'verse': '118:111', 'remark': 'the adverb between pauses interrupts the movement, and "adquiri por herança" sounds documentary; alternative "Recebi para sempre por herança os vossos testemunhos"', 'outcome': 'taken', 'reason': 'His order taken, without pauses: "Adquiri eternamente por herança os vossos testemunhos". "Recebi" refused (accípere\'s verb; acquírere is to get for oneself). "para sempre" is the option of decision "in_aeternum".'},
         {'verse': '118:113', 'remark': 'the fronted "Aos iníquos" sounds literary; alternative "Tive ódio aos iníquos"', 'outcome': 'option', 'decision': 'odio_habui', 'reason': 'It is the line he himself proposed on draft 7 to cure the proparoxytone "iníquos" at the mediant, which his new line brings back; and it is the Latin word for word.'},
         {'verse': '118:116', 'remark': '"envergonhar no que aguardo" is not a recognisable construction; alternative "não me envergonheis por minha esperança"', 'outcome': 'taken', 'decision': 'exspectare', 'reason': 'His preposition taken: "pelo que aguardo". His noun refused (esperança is spes; exspectátio is kept apart).'},
         {'verse': '118:121', 'remark': '"Fiz juízo" calls up forming an opinion; alternative "Pratiquei o juízo e a justiça"', 'outcome': 'taken', 'decision': 'feci_judicium'},
         {'verse': '118:123', 'remark': '"do dito da" is not fluid and "dito" makes the phrase strange; alternative "à espera da palavra da vossa justiça"', 'outcome': 'option', 'decision': 'v123b', 'reason': 'D16, as on draft 7: the noun is decided locally, "dito" available; "palavra" is the retreat D16 names for the whole term and is not one verse\'s to take. The run "do dito da" is a real cost of draft 8\'s preposition (draft 7 had "pelo dito da").'},
         {'verse': '118:128', 'remark': 'the passive "era dirigido para" is long and mechanical; alternative "eu me voltava para"', 'outcome': 'refused', 'decision': 'dirigebar', 'reason': 'The Latinist marked the middle voice major on draft 8: dirigébar is passive. Where the two readers collide on sense, the gate governs. "voltar" is also convértere\'s verb (118:59, 79).'},
         {'verse': '118:128', 'remark': 'the long complement before the verb is an inversion without gain; alternative "tive ódio a todo caminho iníquo"', 'outcome': 'option', 'decision': 'odio_habui', 'reason': 'The gain is the cadence: his order ends the verse on the proparoxytone "iníquo", which he faulted on draft 7.'},
     ]},
    {'step': 'revision', 'version': 10, 'note': 'Draft 10: 118:91 (o dia permanece), 101 (verb first), 111 (adverb after the verb, no pauses), 116 (pelo que aguardo), 121 (Pratiquei o juízo e a justiça). New decision: intellexi104 (the stylist\'s line as an option). 118:1–80 untouched. The Latinist gate reads this draft.'},
]
data['version'] = 10
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 10 written:', len(data['decisions']), 'decisions')
