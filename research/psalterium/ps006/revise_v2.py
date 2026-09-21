"""Draft 1 -> draft 2 of Ps 6 (draft 1 is kept as prayed.v1.json). Run once:
python3.13 research/psalterium/ps006/revise_v2.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
assert data['version'] == 1, 'already revised'
data['version'] = 2


def decision(name):
    return next(d for d in data['decisions'] if d['id'] == name)


# 6:7 — laboravi
laboravi = decision('laboravi')
laboravi['why'] += " Draft 1 had 'Cansei-me no meu gemido'; the stylist heard a translated preposition and asked for 'Cansei-me de gemer'."
for option in laboravi['options']:
    if option['label'] == 'Cansei-me no meu gemido':
        option['note'] = "Draft 1: the perfect, the Greek's weariness, the Latin's 'in' and its singular noun. Refused by the stylist: 'a preposição deixa a frase pouco natural na boca'."
laboravi['options'] = [
    {
        'label': 'Cansei-me gemendo',
        'forms': {'laboravi': 'Cansei-me gemendo'},
        'note': "Draft 2. The stylist's point taken — 'cansar-se em' + noun is not said — but not his wording: a gerund is how Brazilian Portuguese says what one wore oneself out doing, it adds nothing, and it cannot be heard as 'I am fed up with'. A noun turned into a verb form is grammar (D2, as D16 did with elóquium). Cost: 'meo' is no longer said, and 68:4 Laborávi clamans will have the same build though the Latin differs.",
        'from': 'stylist',
    },
    {
        'label': 'Cansei-me de gemer',
        'forms': {'laboravi': 'Cansei-me de gemer'},
        'note': "The stylist's own wording. Refused: 'cansei-me de' + infinitive is first of all 'I have had enough of' (cansei-me de esperar) — a sense the Latin does not have; Matos Soares needed 'de tanto gemer' to steer away from it.",
        'from': 'stylist',
    },
] + laboravi['options']

# 6:11 — the stylist's order and weight
erubescant = decision('erubescant')
erubescant['why'] += " The blind reader understood bare 'Corem' at once as the enemies being put to shame; the stylist rebuilt the verse but kept 'corem' twice."
forms = [
    {'erubescant1': 'Corem', 'erubescant1q': 'corem', 'erubescant2': 'corem', 'erubescant2q': 'corem'},
    {'erubescant1': 'Corem de vergonha', 'erubescant1q': 'corem de vergonha', 'erubescant2': 'corem de vergonha', 'erubescant2q': 'corem de vergonha'},
    {'erubescant1': 'Envergonhem-se', 'erubescant1q': 'se envergonhem', 'erubescant2': 'envergonhem-se', 'erubescant2q': 'se envergonhem'},
    {'erubescant1': 'Sejam confundidos', 'erubescant1q': 'sejam confundidos', 'erubescant2': 'sejam cobertos de ignomínia', 'erubescant2q': 'sejam cobertos de ignomínia'},
]
for option, form in zip(erubescant['options'], forms):
    option['forms'] = form
erubescant['options'][0]['note'] = "Ruling: D15's proposal, tried — and it holds. It is the Latin's own image — e-rubéscere is to go red — kept concrete (rule 5) and unexplained (rule 2), one word for one, and it leaves 'envergonhar' to confúndi, so 82:18 can say both. Repeated identically, as the Latin. Heard: the blind reader took it at once for shame wished on the enemies; the stylist kept 'corem' twice in his own line; the Latinist passed it."

convertere = decision('convertere')
forms = [
    {'convertere': 'Voltai-vos', 'convertantur': 'voltem-se', 'convertanturq': 'se voltem'},
    {'convertere': 'Voltai-vos', 'convertantur': 'voltem atrás', 'convertanturq': 'voltem atrás'},
    {'convertere': 'Convertei-vos', 'convertantur': 'convertam-se', 'convertanturq': 'se convertam'},
]
for option, form in zip(convertere['options'], forms):
    option['forms'] = form
convertere['options'][0]['note'] += " Heard: the blind reader listed all three readings of 'voltem-se' (retreat, turn to God, merely turn round) — the Latin's own range — with retreat first."

vehementer = decision('vehementer')
grandemente, muito, extremo = vehementer['options']
vehementer['why'] += " The stylist found 'sejam grandemente perturbados' heavy in recitation and wrote 'muito'."
muito['note'] = "Draft 2, from the stylist. The plainer of two faithful words (D2), and on D15's test the Latin's variation valde / veheménter carries no difference of sense: the Greek has σφόδρα all three times. A gain comes with it: 6:4 'muito perturbada' is now answered by 6:11 'muito perturbados', as the Greek answers ἐταράχθη σφόδρα with ταραχθείησαν σφόδρα. Cost: one Portuguese adverb for two Latin ones."
muito['from'] = 'stylist'
grandemente['note'] = "Draft 1: a second adverb, because the Latin has a second; it goes with every verb the psalter gives veheménter. Refused by the stylist as heavy ('pesa na recitação')."
vehementer['options'] = [muito, grandemente, extremo]

index = data['decisions'].index(erubescant)
data['decisions'].insert(index, {
    'id': 'v11order',
    'refs': ['6:11'],
    'latin': 'Erubéscant, et conturbéntur veheménter omnes inimíci mei: * convertántur et erubéscant valde velóciter',
    'kind': 'order',
    'why': "The Latin opens on its verbs and brings the subject last. Draft 1 kept that; it was the stylist's worst line: the comma breaks the coordination, the late subject makes the reciter hold up an unspontaneous construction, and 'sejam grandemente perturbados' is heavy.",
    'options': [
        {
            'label': 'Que todos os meus inimigos corem e fiquem muito perturbados: * que se voltem e corem muito depressa',
            'forms': {
                'v11a': 'Que todos os meus inimigos {erubescant1q} e fiquem {vehementer} {conturbentur}',
                'v11b': 'que {convertanturq} e {erubescant2q} {velociter}',
            },
            'note': "Draft 2, the stylist's line: subject first under a jussive 'Que', repeated at the second colon. Order and a particle — grammar, which D2 gives to the ear; every Latin word is still there, 'corem' twice and 'perturbados' still closing the psalm's chain. 'Fiquem perturbados' for conturbéntur: still a passive participle, in the resultative form Portuguese prefers, and it answers 'estão perturbados' of 6:3. The Latin's comma after the first verb goes with the old order.",
            'from': 'stylist',
        },
        {
            'label': 'Corem, e sejam muito perturbados todos os meus inimigos: * voltem-se e corem muito depressa',
            'forms': {
                'v11a': '{erubescant1}, e sejam {vehementer} {conturbentur} todos os meus inimigos',
                'v11b': '{convertantur} e {erubescant2} {velociter}',
            },
            'note': "Draft 1: the Latin's order and punctuation, the curse opening on its verb.",
            'from': 'draft',
        },
    ],
})
data['verses']['6:11'] = '{v11a}: * {v11b}.'

data['choices']['6:10'] = "The Latin is a chiasm (Exaudívit Dóminus … Dóminus … suscépit); Portuguese has subject–verb–object twice (D2: order yields), and 'O Senhor … o Senhor' keeps the doubled name. First colon −4: the Latin noun alone has six syllables."
data['choices']['6:11'] = "conturbéntur is passive: 'fiquem … perturbados' (draft 1 'sejam … perturbados'). Subject first since draft 2 (decision v11order)."
data['choices']['6:6'] += " The blind reader heard 'no inferno' first as the place of eternal punishment and second as the world of the dead (decision inferno) — foreseen, and kept."

data['audit'] += [
    {
        'step': 'latinist',
        'file': 'critic/v1.latinist.json',
        'note': "Draft 1. Clean: no verse remarked, every mark confirmed. The departures from the glossary (libertai, acolheu, prece) and the new words (acuseis, castigueis, Corem) all passed.",
        'outcomes': [],
    },
    {
        'step': 'stylist',
        'file': 'critic/v1.stylist.json',
        'note': "Draft 1. Two verses; best 6:4, worst 6:11. 'O salmo … soa, em geral, como oração em português; as repetições sustentam bem a súplica' — the fourfold 'perturbar', bones and eye included, drew no remark. 6:7 taken in substance with another wording; 6:11 taken whole.",
        'outcomes': [
            {'verse': '6:7', 'remark': "'Cansei-me no meu gemido': the preposition sounds translated → 'Cansei-me de gemer'", 'outcome': 'option', 'decision': 'laboravi', 'reason': "The fault is taken, the fix is not: 'cansei-me de gemer' is heard first as 'I have had enough of groaning'. Draft 2 has 'Cansei-me gemendo'; his wording is option 2."},
            {'verse': '6:11', 'remark': "the comma breaks the coordination, 'sejam grandemente perturbados' is heavy, the subject comes late → 'Que todos os meus inimigos corem e fiquem muito perturbados: * que se voltem e corem muito depressa'", 'outcome': 'taken', 'decision': 'v11order', 'reason': "Taken whole: order and a jussive particle are grammar (D2); 'muito' for veheménter is the plainer word and the Greek's one adverb (decision vehementer)."},
        ],
    },
    {
        'step': 'ambiguity',
        'file': 'critic/v1.ambiguity.json',
        'note': "Draft 1, Portuguese only. Ten items, one unknown word (iniquidade). No fault: every item is the Latin's own range. Two are worth Gustavo's eye: 6:6 'no inferno' was heard first as the hell of the damned (foreseen in decision inferno), and 6:8 'pelo furor' was heard first as the speaker's own rage, second as the Lord's, third as the enemies' — the Latin names no owner either.",
        'outcomes': [
            {'verse': '6:3', 'remark': "'os meus ossos estão perturbados': sick or aching bones / the whole body shaken", 'outcome': 'refused', 'decision': 'turbare', 'reason': "ossa conturbáta is as open; the verb is the psalm's frame and stays."},
            {'verse': '6:4', 'remark': "'a minha alma': the spiritual part / myself; 'até quando?': how long until you help / how long will you be angry", 'outcome': 'refused', 'reason': "ánima mea → a minha alma (glossary); the Latin's question is broken off in the same way and is not completed."},
            {'verse': '6:5', 'remark': "'Voltai-vos': turn your attention / come back; 'libertai a minha alma': from sin or damnation / from suffering or death", 'outcome': 'refused', 'decision': 'eripe', 'reason': "Both are the Latin's (Convértere; éripe ánimam meam names no source)."},
            {'verse': '6:6', 'remark': "'no inferno': the place of eternal punishment / the world of the dead — the first heard first", 'outcome': 'refused', 'decision': 'inferno', 'reason': "Kept as ruled: it is the Latin's word, heard the same way by a Latin ear, and in this verse both senses are true; the alternatives are paraphrases. The glossary row is `open` and says so."},
            {'verse': '6:7', 'remark': "'lavarei … o meu leito': clean it with water / soak it with weeping", 'outcome': 'refused', 'reason': "lavábo is the Latin's hyperbole; the second colon resolves it, as in the Latin."},
            {'verse': '6:8', 'remark': "'pelo furor': my own rage / the Lord's wrath / the enemies' fury", 'outcome': 'refused', 'decision': 'afurore', 'reason': 'The Latin has no possessive; the openness is kept on purpose.'},
            {'verse': '6:11', 'remark': "'Corem, e sejam … perturbados': a wish / an order to the enemies; 'voltem-se': retreat / turn to God / turn round", 'outcome': 'refused', 'decision': 'convertere', 'reason': "The wish was heard first; convertántur is open in the same three ways."},
            {'verse': '6:9', 'remark': 'unknown word: iniquidade', 'outcome': 'refused', 'reason': 'Glossary word (iníquitas → iniquidade).'},
        ],
    },
    {
        'step': 'revision',
        'version': 2,
        'note': "v2. Two verses changed against draft 1, both from the stylist: 6:7 'Cansei-me gemendo' (was 'Cansei-me no meu gemido'; his 'Cansei-me de gemer' refused as 'fed up with'); 6:11 'Que todos os meus inimigos corem e fiquem muito perturbados: * que se voltem e corem muito depressa' (was 'Corem, e sejam grandemente perturbados todos os meus inimigos: * voltem-se e corem muito depressa'). Draft 1 is prayed.v1.json (flat text prayed.v1.vos.json, the file the three v1 critics read).",
    },
]
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok, version', data['version'])
