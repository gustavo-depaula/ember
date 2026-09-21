"""Draft 1 → draft 2 of ps118/prayed.json (118:1–32), after the three v1 blind readers. Run once, from the repo root:
  python3.13 research/psalterium/ps118/revise_v2.py
Kept as the record of exactly what changed; prayed.v1.json is draft 1. Refuses to run twice.
"""

import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(path.read_text(encoding='utf-8'))
if d['version'] != 1:
    raise SystemExit('already revised')
d['version'] = 2
byId = {x['id']: x for x in d['decisions']}


def promote(decisionId, label):
    options = byId[decisionId]['options']
    index = next(i for i, o in enumerate(options) if o['label'] == label)
    options.insert(0, options.pop(index))
    return options[0]


# ── verses ───────────────────────────────────────────────────────────────────
d['verses']['118:5'] = '{v5}!'
d['verses']['118:9'] = '{in_quo_a} {v9a}? * {in_quo_b} {s_acc}.'
d['verses']['118:23'] = '{v23}.'
d['verses']['118:24'] = 'Pois também {t_acc} são a minha meditação: * {v24b}.'

# ── decisions changed ────────────────────────────────────────────────────────
o = promote('confundi', 'envergonhar')
o['note'] = "Draft 2. The blind ambiguity reader heard 'não serei confundido' (118:6) and 'não me deixeis confundido' (118:31) FIRST as 'I shall not be confused, left without understanding' — a sense confúndi does not have here (αἰσχύνομαι: be put to shame); and the Latinist asked that 118:31 keep the direct prohibition (noli me confúndere), which 'não me envergonheis' does. Douay-Rheims 'put me not to shame'. Costs: the Te Deum's closing line (non confúndar in ætérnum = 30:2, 70:1) will not be the traditional 'não serei confundido'; erubéscere, which stands beside confúndi in 34:4/26, 39:15, 69:3–4, must take another word — 'corar' (to redden) is its own image and is free. 118:6 runs 5 syllables over."
o['from'] = 'ambiguity'
byId['confundi']['options'][1]['note'] = "Draft 1. The cognate and the traditional word of Portuguese prayer, kept in the passive participle; at 118:31 turned with 'deixar'. Set aside in draft 2 because the blind reader heard 'confused' first in both verses, and the Latinist found 'deixeis' loosens the direct prohibition."
byId['confundi']['options'][1]['label'] = 'ser confundido / não me deixeis confundido'

o = promote('repellas', 'não me afasteis dos')
o['note'] = "Draft 2, from the stylist ('rejeitar dos' has no natural regency; the ear has to rebuild the idea of distance) — and the ambiguity reader could not tell what 'dos vossos mandamentos' was doing after 'rejeiteis'. It is still God who does it, which is what the Latin says and what Matos Soares and Douay-Rheims lose. Costs: milder than a thrust; and it is amovére's verb in 118:29, so two Latin verbs share one Portuguese in this portion."
o['from'] = 'stylist'
byId['repellas']['options'][1]['note'] = "Draft 1. 'rejeitar' is the verb repéllere will want where it has no 'a' (42:2 quare me repulísti, 59:3); with 'de' two blind readers stumbled on it."

o = promote('concupivit', 'ansiou por desejar')
o['note'] = "Draft 2, from the stylist, who named 118:20 the worst line of draft 1: 'cobiçar' does not take an infinitive in Portuguese and suggests wanting to possess. The doubled desire stays (ansiou por desejar); only the construction is mended (D2). concupíscere → 'ansiar por' can serve 118:40, 118:174 and 83:3 (A minha alma anseia e desfalece pelos átrios do Senhor). The ambiguity reader heard the two verbs as one intensified desire, which is fair to the Latin."
o['from'] = 'stylist'
byId['concupivit']['options'][1]['note'] = "Draft 1 (Douay-Rheims 'hath coveted to long for'). The root of concupíscere and its shadow; not native with an infinitive."

o = promote('opprobrium', 'a afronta')
o['note'] = "Draft 2. The stylist failed 'opróbrio' on plainness (solemn without being understood) and the ambiguity reader listed it as unknown and, for want of it, half-heard the line as a prayer to stop despising others. 'afronta' is the plain word for a reproach thrown at one (ὄνειδος), and it gives exprobráre its verb: 118:42 'aos que me afrontam', 68:10 'as afrontas dos que vos afrontam' keeps the Latin's oppróbria exprobrántium."
o['from'] = 'stylist'
byId['opprobrium']['options'].append({
    'label': 'a desonra',
    'forms': {'opprobrium': 'a desonra'},
    'note': "The stylist's own word. A state rather than something thrown; it gives exprobráre no verb.",
    'from': 'stylist',
})

for option in byId['exerceri']['options']:
    option['forms']['exerc_impf'] = {'exercitava-se': 'se exercitava', 'ocupava-se': 'se ocupava', 'meditava': 'meditava'}[option['forms']['exerc_impf']]
byId['exerceri']['options'][0]['note'] += " The ambiguity reader heard 'exercitar-se nos mandamentos' first as putting them into practice, second as studying them; exercéri in is open in the same way (Douay-Rheims 'be exercised in'), so nothing changed."

byId['sermones']['options'][0]['note'] += " Draft 2: the stylist refused it three times over (118:9, 16, 17) — 'falas' sounds like turns in a conversation or lines in a play, and 'guardar as vossas falas' sounds made up — and asked for 'palavras'. The ambiguity reader, who had the Portuguese alone, understood it at once and rightly ('cumprindo aquilo que Deus diz') and did not list it as unknown. Kept under D2: 'palavras' is verbum's word and would erase a variation the Latin makes; but this is the ruling of the set most exposed to the ear, and it is one click to reverse."
byId['sermones']['options'][1]['note'] += " The stylist's proposal (draft 1, three remarks)."
byId['eloquia']['options'][0]['note'] += " Draft 2: neither the stylist nor the ambiguity reader stumbled on 'os vossos ditos' (118:11); the latter heard 'kept inwardly' first, 'kept secret' second — abscóndi has both."
byId['justificationes']['options'][0]['note'] += " Draft 2: the ambiguity reader lists 'preceitos' among words an ordinary hearer might not know (every time it occurs — together with 'iniquidade', 'sondam', 'fitar', 'deleitei', 'vivificai-me', 'dormitou'); the stylist did not remark on it. Weighed and kept: it is the word of Brazilian church speech (dia de preceito) and of this psalm in the Hebrew-family psalters Brazilians already pray (CNBB 27 times, Diurnal Monástico 27), none of which is archaic; 'decretos' would be better known and less apt."
byId['testimonia']['options'][0]['note'] += " Draft 2: the ambiguity reader heard 'os seus testemunhos' (118:2) first as accounts of religious experience, and from 118:14 on, with 'vossos', as 'declarations given by God' — the right sense. The first hearing is the price of the cognate; kept."
byId['vivifica']['options'][0]['note'] += " Draft 2: the ambiguity reader lists 'vivificai-me' as a word an ordinary hearer might not know (both times); the stylist let it pass. Kept — the verb comes twelve times and 'dai-me a vida' is the ready option."
byId['in_quo']['options'][0]['note'] += " Draft 2 takes the stylist's order (subject before verb: 'Com que o jovem corrige'), not his 'Como', which stays the third option."
byId['instrue']['options'][1]['note'] += " The Latinist asked for exactly this (minor: 'instrue me asks for instruction; fazei-me entender shifts to the result') — refused on rule 3 alone."

# ── decisions added (stylist fixes of grammar and order, draft 1 kept as the other option) ──
d['decisions'] += [
    {
        'id': 'v5', 'refs': ['118:5'], 'latin': 'Útinam dirigántur viæ meæ, * ad custodiéndas justificatiónes tuas!', 'kind': 'grammar',
        'why': "The Latin's purpose phrase has no subject (ad custodiéndas: 'toward the keeping of'). In draft 1's 'se dirijam os meus caminhos, para guardar', the stylist heard the ways as the ones who keep.",
        'options': [
            {'label': 'sejam dirigidos … para que eu guarde', 'forms': {'v5': 'Oxalá os meus caminhos sejam dirigidos, * para que eu guarde {j_acc}'},
             'note': "Draft 2, the stylist's line. Names the subject the Latin leaves unsaid and keeps the passive as a passive (dirigántur); grammar and order only (D2). It also brings the second colon within 2 of the Latin.", 'from': 'stylist'},
            {'label': 'se dirijam … para guardar', 'forms': {'v5': 'Oxalá se dirijam os meus caminhos, * para guardar {j_acc}'},
             'note': 'Draft 1. Shorter, and as subjectless as the Latin; misheard.', 'from': 'draft'},
        ],
    },
    {
        'id': 'v9a', 'refs': ['118:9'], 'latin': 'córrigit adolescéntior viam suam', 'kind': 'order',
        'why': "The stylist heard draft 1's question as a pile of inversions.",
        'options': [
            {'label': 'o jovem corrige o seu caminho', 'forms': {'v9a': 'o jovem corrige o seu caminho'}, 'note': 'Draft 2: subject before verb (D2).', 'from': 'stylist'},
            {'label': 'corrige o jovem o seu caminho', 'forms': {'v9a': 'corrige o jovem o seu caminho'}, 'note': "Draft 1: the Latin's order.", 'from': 'draft'},
        ],
    },
    {
        'id': 'v23', 'refs': ['118:23'], 'latin': 'Étenim sedérunt príncipes, et advérsum me loquebántur: * servus autem tuus exercebátur in justificatiónibus tuis', 'kind': 'order',
        'why': "The stylist failed draft 1 as unsayable: 'porém' between two pauses breaks a colon that is already long.",
        'options': [
            {'label': 'mas o vosso servo se exercitava', 'forms': {'v23': 'Pois os príncipes se sentaram e falavam contra mim: * mas o vosso servo {exerc_impf} {j_in}'},
             'note': "Draft 2, the stylist's line: autem → 'mas' at the head of the colon, and no comma after 'se sentaram'. Same words, same tenses.", 'from': 'stylist'},
            {'label': 'o vosso servo, porém, exercitava-se', 'forms': {'v23': 'Pois os príncipes sentaram-se, e falavam contra mim: * o vosso servo, porém, {exerc_impf} {j_in}'},
             'note': "Draft 1: autem kept after the subject, as in the Latin. (With this option the pronoun stands before the verb after 'porém,' — a small roughness.)", 'from': 'draft'},
        ],
    },
    {
        'id': 'v24b', 'refs': ['118:24'], 'latin': 'et consílium meum justificatiónes tuæ', 'kind': 'grammar',
        'why': "The Latin has no verb in the second colon and crosses the order of the first (testimónia tua – meditátio mea / consílium meum – justificatiónes tuæ). Heard without a verb, the stylist took it for a list; the ambiguity reader asked whose counsel it is.",
        'options': [
            {'label': 'e os vossos preceitos são o meu conselho', 'forms': {'v24b': 'e {j_acc} são o meu conselho'},
             'note': "Draft 2, the stylist's line: a copula supplied and the natural order (D2). The chiasm is given up; so is the echo of 'preceitos' at the ends of 118:23 and 118:24, which was the Latin's.", 'from': 'stylist'},
            {'label': 'e o meu conselho, os vossos preceitos', 'forms': {'v24b': 'e o meu conselho, {j_acc}'},
             'note': "Draft 1: the Latin's order and its verbless colon.", 'from': 'draft'},
        ],
    },
]

# ── choices ──────────────────────────────────────────────────────────────────
c = d['choices']
c['118:2'] += " The ambiguity reader asked whose 'seus testemunhos' and whom 'o procuram': the Lord of 118:1, as in the Latin (ejus … eum), and that is what was heard."
c['118:3'] += " 'nos seus caminhos' could be heard of the evildoers' own ways; the Latin's ejus has the same reach back to 118:1, and the reader took it rightly."
c['118:5'] = "Draft 2 takes the stylist's line (decision 'v5'). Útinam → 'Oxalá' (Matos Soares 1932). dirígere returns at 118:128 and 118:133. The colon that holds 'preceitos' runs short wherever the term occurs (justificatiónes 7 syllables, preceitos 3): 118:8, 12, 16, 20, 23; accepted psalm-wide, see words/ps118-terms.md."
c['118:6'] += " Draft 2: confúndi → 'ser envergonhado' (decision 'confundi'); 5 syllables over, accepted. 'fitar' was heard as paying close attention, which is perspícere."
c['118:8'] += " The ambiguity reader heard 'de todo' first as 'in no way', second as 'completely'; usquequáque bears both (Douay-Rheims 'utterly')."
c['118:9'] += " Draft 2: subject before verb (decision 'v9a')."
c['118:10'] = "exquisívi te → 'vos procurei' (decision 'exquirere'). Draft 2: repéllas → 'afasteis' (decision 'repellas')."
c['118:20'] += " Draft 2: concupívit → 'ansiou por' (decision 'concupivit')."
c['118:22'] += " Draft 2: oppróbrium → 'a afronta' (decision 'opprobrium')."
c['118:23'] = "Draft 2 takes the stylist's line (decision 'v23'). Étenim → 'Pois' (καὶ γάρ); 118:24's Nam et is the same Greek and is 'Pois também'. The perfect and the imperfects are kept (se sentaram … falavam … se exercitava). 'príncipes' was heard as royal sons before rulers; príncipes is as wide."
c['118:24'] = "Draft 2 takes the stylist's line in the second colon (decision 'v24b'). consílium → 'conselho'. meditátio mea est comes six more times in the psalm (118:77, 92, 97, 99, 143, 174): '… é / são a minha meditação'."
c['118:25'] += " The ambiguity reader heard 'apegou-se ao chão' as being cast down (first) and as attachment to earthly things (second): both have been read out of adhǽsit paviménto."
c['118:28'] += " 'dormitou de tédio' was heard as dozing from boredom before loss of inner vigour: the modern narrowing of tédio, accepted (option 'de abatimento')."
c['118:31'] = "See decisions 'adhaesit' and 'confundi' (draft 2: 'não me envergonheis', the direct prohibition the Latinist asked for). Bare vocative 'Senhor'."

# ── audit ────────────────────────────────────────────────────────────────────
same = "The Latin is open in the same way, or the right sense was the one heard first; nothing changed."
d['audit'] += [
    {
        'step': 'latinist', 'file': 'critic/v1.latinist.json',
        'note': 'Draft 1 (prayed.v1.vos.json; latin.json trimmed to the 32 verses by ps118/partial.py). Two minor remarks, nothing major; marks confirmed in all 32 verses.',
        'outcomes': [
            {'verse': '118:27', 'remark': "ínstrue me asks for instruction; 'Fazei-me entender' shifts to the result → 'Instruí-me no caminho'", 'outcome': 'option', 'decision': 'instrue',
             'reason': "Rule 3: under vós 'instruí' is also 'I instructed'. 'Fazei-me entender' is the Greek verb exactly (συνετίζω) and Douay-Rheims' rendering."},
            {'verse': '118:31', 'remark': "noli me confúndere is a direct prohibition; 'não me deixeis confundido' lets in 'allow / leave' → 'não me confundais'", 'outcome': 'taken', 'decision': 'confundi',
             'reason': "Taken as to the construction — draft 2 has the direct 'não me envergonheis'; the verb itself changed because of the ambiguity reader."},
        ],
    },
    {
        'step': 'stylist', 'file': 'critic/v1.stylist.json',
        'note': "Draft 1. Nine verses remarked; best line 118:19, worst 118:20. Six taken (grammar, order, or a plainer faithful word); 'falas' refused three times and kept as the text, with 'palavras' as the option.",
        'outcomes': [
            {'verse': '118:5', 'remark': "the ways are heard as the subject of 'guardar' → 'sejam dirigidos, para que eu guarde'", 'outcome': 'taken', 'decision': 'v5'},
            {'verse': '118:9', 'remark': "piled inversions; 'falas' sounds like dialogue or a play → 'Como o jovem corrige … as vossas palavras'", 'outcome': 'taken', 'decision': 'v9a',
             'reason': "The order is taken. 'Como' is refused (in quo is 'by what'; option in 'in_quo'). 'palavras' is refused: see 118:16."},
            {'verse': '118:10', 'remark': "'rejeitar dos' has no natural regency → 'não me afasteis dos'", 'outcome': 'taken', 'decision': 'repellas'},
            {'verse': '118:16', 'remark': "'falas' jars in prayer → 'palavras'", 'outcome': 'option', 'decision': 'sermones',
             'reason': "D2: 'palavras' is verbum's word (118:25, 28 in this portion); sermo and verbum stand in one verse at 118:42, 55:11, 102:20. The blind ambiguity reader understood 'falas' at once."},
            {'verse': '118:17', 'remark': "'guardar as vossas falas' sounds made up → 'palavras'", 'outcome': 'option', 'decision': 'sermones', 'reason': 'As for 118:16.'},
            {'verse': '118:20', 'remark': "'cobiçou desejar' is not Portuguese and suggests possession → 'ansiou por desejar'", 'outcome': 'taken', 'decision': 'concupivit'},
            {'verse': '118:22', 'remark': "'opróbrio' is solemn without being understood → 'a desonra'", 'outcome': 'taken', 'decision': 'opprobrium',
             'reason': "Taken as to the fault; the word chosen is 'afronta' (it gives exprobráre its verb), 'desonra' is an option."},
            {'verse': '118:23', 'remark': "'porém' between pauses breaks a long colon → 'mas o vosso servo se exercitava'", 'outcome': 'taken', 'decision': 'v23'},
            {'verse': '118:24', 'remark': 'verbless inverted colon is heard as a list → \'e os vossos preceitos são o meu conselho\'', 'outcome': 'taken', 'decision': 'v24b'},
        ],
    },
    {
        'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
        'note': "Draft 1, Portuguese only. 45 items and 18 'unknown words' (8 distinct: sondam, iniquidade, preceitos, fitar, deleitei, vivificai-me, opróbrio, dormitou — a severe list). One real fault: 'confundido' heard as 'confused' in both its verses → the verb changed. Two that confirmed the stylist (118:10, 118:22). The rest are the Latin's own openness or were heard rightly first.",
        'outcomes': [
            {'verse': '118:6', 'remark': "'não serei confundido' heard first as 'I shall not be confused'", 'outcome': 'taken', 'decision': 'confundi'},
            {'verse': '118:31', 'remark': "'não me deixeis confundido' heard first as 'do not let me be confused'", 'outcome': 'taken', 'decision': 'confundi'},
            {'verse': '118:10', 'remark': "the function of 'dos vossos mandamentos' after 'rejeiteis' is unclear", 'outcome': 'taken', 'decision': 'repellas'},
            {'verse': '118:22', 'remark': "'opróbrio' unknown; the line half-heard as 'take my contempt for others out of me'", 'outcome': 'taken', 'decision': 'opprobrium'},
            {'verse': '118:24', 'remark': "'o meu conselho': the counsel I follow, or the counsel I give", 'outcome': 'taken', 'decision': 'v24b', 'reason': 'Mended in passing by the copula and order of draft 2; consílium meum is open in the same way.'},
            {'verse': '118:2', 'remark': "'testemunhos' heard first as accounts of religious experience (118:2), later as declarations by God (118:14, 22, 24, 31)", 'outcome': 'option', 'decision': 'testimonia', 'reason': "The price of the cognate; with 'vossos' it was heard rightly."},
            {'verse': '118:5', 'remark': "'preceitos' listed as an unknown word at each of its ten places", 'outcome': 'option', 'decision': 'justificationes', 'reason': "Not archaic; the word of Brazilian church speech and of this psalm in the psalters Brazilians already pray. 'decretos' is one click away."},
            {'verse': '118:15', 'remark': "'me exercitarei' / 'exercitava-se' / 'me exercitarei nas maravilhas' (118:15, 23, 27): practising, or studying", 'outcome': 'option', 'decision': 'exerceri', 'reason': 'exercéri in is open in the same way.'},
            {'verse': '118:20', 'remark': "'cobiçou desejar': desired to desire, or desired intensely", 'outcome': 'taken', 'decision': 'concupivit', 'reason': "The construction changed for the stylist's reason; the doubling stays and may still be heard as intensity."},
            {'verse': '118:28', 'remark': "'dormitou de tédio': dozed from boredom, or lost inner vigour; 'dormitou' unknown", 'outcome': 'option', 'decision': 'taedio', 'reason': 'tǽdium is the same word; dormitáre must stay apart from dormíre.'},
            {'verse': '118:28', 'remark': "'confirmai-me': make me firm, or give me confirmation", 'outcome': 'option', 'decision': 'confirma', 'reason': 'The right sense was heard first.'},
            {'verse': '118:17', 'remark': "'Recompensai': a reward for something done, or a benefit", 'outcome': 'option', 'decision': 'retribue', 'reason': 'retribúere is to requite; the first hearing is the Latin.'},
            {'verse': '118:29', 'remark': "'pela vossa lei': by means of, or for the sake of", 'outcome': 'option', 'decision': 'de_lege', 'reason': "Exactly the openness of 'de lege tua' that the rendering was chosen to keep."},
            {'verse': '118:32', 'remark': "'dilatastes o meu coração': physically, or the capacity to love", 'outcome': 'option', 'decision': 'dilatasti', 'reason': 'The figurative sense was heard first.'},
            {'verse': '118:25', 'remark': "'apegou-se ao chão': cast down, or attached to earthly things", 'outcome': 'refused', 'reason': 'Both are old readings of adhǽsit paviménto; the image is kept as it is.'},
            {'verse': '118:1', 'remark': "'Bem-aventurados' happy / blessed; 'imaculados no caminho' sinless people, relation to 'no caminho' unclear", 'outcome': 'refused', 'reason': "beáti and immaculáti in via are as they are; 'os sem mancha' is an option in 'immaculati'."},
            {'verse': '118:2', 'remark': "'seus', 'o procuram' (118:2), 'nos seus caminhos' (118:3): whose", 'outcome': 'refused', 'reason': 'ejus / eum reach back to Dómini in 118:1 in the Latin too, and that is what was heard.'},
            {'verse': '118:7', 'remark': "'juízos' (118:7, 13, 30): God's sentences, or his criteria of what is just; 'guardar' (118:8, 9, 17): obey, or keep in memory; 'de todo' (118:8); 'escondi' (118:11); 'riquezas' (118:14); 'vossos caminhos' (118:15); 'Desvendai' (118:18); 'forasteiro na terra' (118:19); 'malditos' statement or curse (118:21); 'príncipes' (118:23); 'segundo a vossa palavra' promise or command (118:25); 'Expus os meus caminhos', 'me escutastes' (118:26); 'caminho da verdade' (118:30); 'se dirijam' (118:5); 'fitar' (118:6)", 'outcome': 'refused', 'reason': same},
        ],
    },
    {
        'step': 'revision', 'version': 2,
        'note': "v2 (script: ps118/revise_v2.py; draft 1 is prayed.v1.json, flat text prayed.v1.vos.json). Wording changed in 118:5 (sejam dirigidos … para que eu guarde), 118:6 and 118:31 (envergonhado / não me envergonheis), 118:9 (o jovem corrige), 118:10 (afasteis), 118:20 (ansiou por desejar), 118:22 (a afronta), 118:23 (se sentaram e falavam … mas o vosso servo se exercitava), 118:24 (e os vossos preceitos são o meu conselho). The term set is unchanged; 'falas' stands against the stylist and is flagged in its decision and in words/ps118-terms.md.",
    },
]

path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 2 written')
