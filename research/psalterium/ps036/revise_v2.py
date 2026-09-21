"""Ps 36 stage one, draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps036/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run; writes prayed.json."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
D = {d['id']: d for d in data['decisions']}
V = data['verses']


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def promote(id, index, note, source, why):
    d = D[id]
    chosen = d['options'].pop(index)
    d['options'][0]['note'] = 'Draft 1. ' + d['options'][0]['note']
    chosen['note'] = note
    chosen['from'] = source
    d['options'].insert(0, chosen)
    d['why'] += ' ' + why


data['version'] = 2
data['status'] = 'reviewed'

# 36:10 — the stylist: 'E ainda um pouco' hangs
promote('pusillum', 1, 'Ruling (draft 2): the stylist; adhuc as "mais", the idiom.', 'stylist',
        'Heard (draft 1): the stylist — «A expressão temporal fica suspensa de um modo pouco português» → \'E mais um pouco\'. Taken: it'
        ' keeps "et" and pusíllum; adhuc is said by "mais" in the everyday phrase for "a little while longer".')
D['pusillum']['options'][0]['label'] = 'E mais um pouco'
D['pusillum']['options'][0]['forms'] = {'pusillum': 'E mais um pouco'}

# 36:12 — the stylist: 'contra ele' splits 'ranger os dentes'
V['36:12'] = 'O pecador {observ} o justo: * e {v12b}.'
data['decisions'].append({
    'id': 'order12', 'refs': ['36:12'], 'latin': 'et stridébit super eum déntibus suis', 'kind': 'order',
    'why': 'strídere déntibus super eum (βρύξει ἐπ᾿ αὐτὸν τοὺς ὀδόντας αὐτοῦ): Portuguese grinds the teeth as an object ("ranger os dentes").'
           ' Draft 1 kept the Latin\'s order, "contra ele" before the teeth. Heard (draft 1): the stylist — «“Contra ele” interrompe a unidade'
           ' natural de “ranger os dentes”» → \'contra ele rangerá os seus dentes\'. Taken in the plainer order, verb and object together and'
           ' "contra ele" last (D2: order only); the final is still paroxytone.',
    'options': [opt('rangerá os seus dentes contra ele', {'v12b': 'rangerá os seus dentes contra ele'}, 'Ruling (draft 2): the collocation whole.', 'stylist'),
                opt('contra ele rangerá os seus dentes', {'v12b': 'contra ele rangerá os seus dentes'}, 'The stylist\'s order.', 'stylist'),
                opt('rangerá contra ele os seus dentes', {'v12b': 'rangerá contra ele os seus dentes'}, 'Draft 1: the Latin\'s order.', 'draft')]})
data['choices']['36:12'] = ('strídere super eum déntibus suis → "rangerá os seus dentes contra ele" (decision order12). observáre → espreitar'
                            ' (decision observabit).')

# 36:14b — 'trucidar' unknown to the blind reader
D['trucident']['options'].insert(0, opt('massacrar', {'truc': 'massacrar'}, 'Ruling (draft 2): the slaughter of many, a word every hearer knows.', 'ambiguity'))
D['trucident']['options'][1]['note'] = 'Draft 1: unknown to the blind reader.'
D['trucident']['why'] += (' Heard (draft 1): the blind reader listed \'trucidar\' as unknown. Draft 2 \'massacrar\' keeps the violence and the'
                          ' plural object (the upright, many), where \'matar\' is flat and \'degolar\' the Greek\'s image. Only place (grep).')

# 36:17 — 'confirma os justos' heard as 'attests that they are just'
promote('confirmat', 2, 'Ruling (draft 2): the Greek\'s prop; heard rightly where "confirma" was not.', 'ambiguity',
        'Heard (draft 1): the blind reader took "o Senhor confirma os justos" as "reconhece ou atesta que eles são justos" (likely), "fortalece'
        ' ou mantém firmes" second. That is the risk named above, and it failed. Draft 2 "sustenta" (ὑποστηρίζει, "props up"; free in the'
        ' glossary — sustinére is "esperar por", D36). Evidence for the open confirmáre row: with persons as object "confirmar" is heard as'
        ' attesting; 118:28 "confirmai-me" (with "nas vossas palavras") has not been tested.')

# 36:20 — the stylist: the comparison splits the two forms
D['deficientes']['options'][0]['note'] = 'Draft 1: the Latin\'s order; the comparison splits the two forms.'
D['deficientes']['options'].insert(0, opt('desfalecendo, desfalecerão como a fumaça', {'defic': 'desfalecendo, desfalecerão como a fumaça'},
                                          'Ruling (draft 2): the two forms together, as the row\'s other verses; the comparison last.', 'stylist'))
D['deficientes']['why'] += (' Heard (draft 1): the stylist, worst line — «A comparação separa as duas formas do verbo e obriga o ouvido a'
                            ' recompor a frase no fim» → \'desfalecendo, desfalecerão como a fumaça\'. Taken (D2, order only): the figure'
                            ' is heard as one, as at 117:11 "cercando, cercaram-me", and the final falls on "fumaça" (paroxytone), which'
                            ' also ends the -ão of 36:19 / 36:20. The blind reader heard it as vanishing like smoke — the Latin\'s sense.')

audit = data['audit']
audit += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json',
     'note': 'Draft 1. No remark. «Nos 21 versículos fornecidos, não identifiquei falhas de adequação que exijam correção: a tradução conserva o sentido e as particularidades do latim.» Passed \'tenhas inveja … invejes\', \'usa de bondade\', \'Revela\', \'e ele fará\', \'sê sujeito\', \'a ponto de fazeres o mal\', \'espreitará\', \'prevê\', \'abater\', \'desfalecendo, como a fumaça desfalecerão\'.',
     'outcomes': []},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json',
     'note': 'Draft 1. Ten verses; best 36:15, worst 36:20. «O principal obstáculo está em algumas combinações e ordens de palavras que deixam ouvir o latim por trás do português.» Three taken, eight refused.',
     'outcomes': [
         {'verse': '36:1', 'remark': '\'fazem a iniquidade\' a calque → \'praticam a iniquidade\'', 'outcome': 'option', 'decision': 'facere_iniq',
          'reason': 'praticar is operári\'s (glossary, 5:7a, 6:9; ἐργάζομαι); fácere (ποιέω) keeps its own verb.'},
         {'verse': '36:2', 'remark': 'rhyme secarão / cairão → \'Porque depressa secarão, como o feno: * e logo cairão, como as ervas verdes\'', 'outcome': 'refused',
          'reason': 'The Latin\'s own paired futures (aréscent / décident) at both cadences; his order breaks the comparison-first build of both cola.'},
         {'verse': '36:3', 'remark': '\'usa de bondade\' ceremonious → \'faz o bem\'', 'outcome': 'option', 'decision': 'bonitatem',
          'reason': '36:27 has fac bonum (= 33:15a \'faz o bem\'); fac bonitátem must differ. The bónitas row (118:65).'},
         {'verse': '36:4', 'remark': '\'dará as petições\' sounds like paperwork → \'concederá os pedidos\'', 'outcome': 'refused',
          'reason': 'petítio → petição (19:7a, the postulátio row); dare → dar. The blind reader heard it rightly (\'concederá o que teu coração pede\').'},
         {'verse': '36:6', 'remark': 'first colon long; \'fará sair a tua\' vowel clusters → \'fará surgir tua justiça\'', 'outcome': 'refused', 'decision': 'educet',
          'reason': 'edúcere → fazer sair (glossary); the colon is the Latin\'s longest (27 syllables, two cola with no flex in DO).'},
         {'verse': '36:6', 'remark': '\'sê sujeito\' a calque → \'sê submisso\'', 'outcome': 'option', 'decision': 'subditus',
          'reason': 'The family of sujeitar (subjícere / subdere, one Greek verb); \'sujeito a\' is current Portuguese (sujeito às leis). The blind reader did not stumble.'},
         {'verse': '36:10', 'remark': '\'E ainda um pouco\' hangs → \'E mais um pouco\'', 'outcome': 'taken', 'decision': 'pusillum'},
         {'verse': '36:11', 'remark': '\'na multidão da paz\' heard as a group → \'numa multidão de paz\'', 'outcome': 'refused', 'decision': 'multitudo',
          'reason': 'The multitúdo row builds it with the article (5:7b \'na multidão da vossa misericórdia\'); the blind reader heard \'abundância de paz\' first.'},
         {'verse': '36:12', 'remark': '\'contra ele\' splits \'ranger os dentes\' → \'contra ele rangerá os seus dentes\'', 'outcome': 'taken', 'decision': 'order12',
          'reason': 'Taken in the other plain order: \'rangerá os seus dentes contra ele\'.'},
         {'verse': '36:16', 'remark': 'the order groups \'o pouco para o justo\' → \'Para o justo, é melhor o pouco\'', 'outcome': 'refused', 'decision': 'melius',
          'reason': 'The Latin opens on the comparison (Mélius est); the comma after \'justo\' closes the group and \'do que\' follows at once.'},
         {'verse': '36:20', 'remark': 'worst line: the comparison splits the two forms → \'desfalecendo, desfalecerão como a fumaça\'', 'outcome': 'taken', 'decision': 'deficientes'}]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
     'note': 'Draft 1. 26 items, 9 unknown words. Heard rightly or within the Latin\'s range: 36:2 \'secarão … cairão\' (the wicked die soon), \'Espera no Senhor\' (wait), \'habita a terra\' (the world first), \'ele fará\' (brings your plans about), \'a tua justiça\' (justice done for you), \'o seu caminho\' (36:7, the prosperous man\'s), \'herdarão a terra\' (the world; open in the Latin), \'o pecador não existirá\' (will cease to be), \'prevê\' (the Lord), \'o seu dia\' (the sinner\'s), 36:15 as a wish (the Latin\'s subjunctive), \'a herança deles\' (eternal life), \'desfalecendo … fumaça\' (vanishing).',
     'outcomes': [
         {'verse': '36:17', 'remark': '\'o Senhor confirma os justos\' heard as \'attests that they are just\'', 'outcome': 'taken', 'decision': 'confirmat'},
         {'verse': '36:14b', 'remark': '\'trucidar\' unknown', 'outcome': 'taken', 'decision': 'trucident'},
         {'verse': '36:14b', 'remark': '\'indigente\' unknown', 'outcome': 'refused', 'decision': 'inops',
          'reason': 'The inops row is open and kept across the psalter; this is the fourth unknown in four readings (Pss 11, 13, 36) — logged on the row, with \'desvalido\' proposed for a ruling.'},
         {'verse': '36:8', 'remark': '\'não tenhas inveja, a ponto de fazeres o mal\' heard first as \'do not let envy reach the point of doing evil\'', 'outcome': 'refused', 'decision': 'malignari',
          'reason': 'ut is consecutive (ὥστε): envy that ends in evil; both hearings forbid the evil. \'para não fazeres o mal\' would change the grammar (option 3).'},
         {'verse': '36:3', 'remark': '\'nas suas riquezas\' heard as the Lord\'s', 'outcome': 'refused',
          'reason': 'ejus is open in the Latin (the Greek\'s αὐτῆς, the land\'s, is not); rule 1.'},
         {'verse': '36:10', 'remark': '\'não o encontrarás\' heard as the sinner, not his place', 'outcome': 'refused',
          'reason': 'Either way the sinner is gone, which is the verse\'s point; the Latin has no object (non invénies), and Portuguese wants one.'},
         {'verse': '36:19', 'remark': '\'Não serão envergonhados\' heard as public humiliation', 'outcome': 'refused', 'reason': 'D15.'},
         {'verse': '36:17', 'remark': '\'os braços … serão quebrados\' heard literally first', 'outcome': 'refused', 'reason': 'The Latin\'s image (brácchia … conteréntur).'},
         {'verse': '36:1', 'remark': '\'iniquidade\', \'petições\' (36:4), \'imaculados\' (36:18) unknown', 'outcome': 'refused',
          'reason': 'Glossary words (iníquitas, petítio 19:7a, immaculátus), all settled or long-standing; logged.'},
         {'verse': '36:3', 'remark': '\'apascentado\' unknown', 'outcome': 'refused', 'decision': 'pasceris',
          'reason': 'páscere is the shepherd\'s verb and the Greek\'s (ποιμανθήσῃ); \'alimentado\' (option 2) loses the pasture. Logged for a later ruling if it fails again (77:72).'},
         {'verse': '36:12', 'remark': '\'espreitará\' unknown', 'outcome': 'refused', 'decision': 'observabit',
          'reason': 'Kept apart from 36:32 \'observa\'; heard nowhere wrongly. Logged.'},
         {'verse': '36:20', 'remark': '\'desfalecendo / desfalecerão\' unknown', 'outcome': 'refused', 'decision': 'deficientes',
          'reason': 'defícere → desfalecer (glossary); the verse was still heard rightly (vanishing like smoke). Logged on the row.'}]},
    {'step': 'revision', 'version': 2,
     'note': 'ps036/revise_v2.py: 36:10 \'E mais um pouco\' (the stylist); 36:12 \'rangerá os seus dentes contra ele\' (the stylist, in his other order); 36:14b \'massacrar\' (\'trucidar\' unknown); 36:17 \'sustenta os justos\' (\'confirma\' heard as attests); 36:20 \'desfalecendo, desfalecerão como a fumaça\' (the stylist\'s worst line; also ends the -ão rhyme with 36:19). Refused with reasons above; \'indigente\' kept on the open row.'},
]

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 2 written;', len(data['decisions']), 'decisions')
