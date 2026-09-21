"""Ps 16 draft 2: the three readers of draft 1 weighed. python3.13 research/psalterium/ps016/revise_v2.py
Reads prayed.v1.json (kept), writes prayed.json."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
data = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
data['version'] = 2
data['status'] = 'reviewed'
byId = {d['id']: d for d in data['decisions']}

# audit order: source, draft, checks
order = {'source': 0, 'draft': 1, 'checks': 2}
data['audit'].sort(key=lambda s: order.get(s['step'], 9))


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


# 16:9b — Latinist major taken
d = byId['superbiam']
d['why'] += (" Heard (draft 1): the Latinist, MAJOR — «A soberba é o conteúdo proferido, não apenas o modo de falar» → ‘a boca deles falou soberba’. "
             "Taken: it is the build of loqui mendácium → ‘falar mentira’ (5:7a, glossary), where Portuguese already lets ‘falar’ take a noun of what is said; "
             "the noun as content is the Latin's (and the Greek's ἐλάλησεν ὑπερηφανίαν). Both Vulgate-family versions have the manner; it stays option 2.")
d['options'] = [
    opt('soberba', {'superbiam': 'soberba'}, "Ruling (draft 2): the Latinist's fix; the accusative of content kept, as 'falar mentira' (5:7a).", 'latinist'),
    opt('com soberba', {'superbiam': 'com soberba'}, 'Draft 1 (Douay-Rheims, Matos Soares 1932): the content made manner; the Latinist marked it major.', 'MS1932'),
    opt('palavras soberbas', {'superbiam': 'palavras soberbas'}, 'Keeps an object by supplying a noun.', 'draft'),
]

# 16:11 — Latinist major taken
d = byId['declinare']
d['why'] += (" Heard (draft 1): the Latinist, MAJOR — «“Resolveram” transforma a colocação dos olhos numa decisão e elimina a imagem concreta de fixá-los» → "
             "‘fixaram os seus olhos para se inclinarem para a terra’. Taken: the eyes are statuérunt's object (ἔθεντο, 'they set'), so the glossary's "
             "statúere + infinitive → resolver (118:106, where the infinitive is the object) does not fit. His second 'para' made 'para … para'; 'à terra' is kept "
             "for in terram. The blind reader had heard draft 1 as 'lowering the gaze to the ground', its purpose uncertain — which is the Latin's openness.")
d['options'] = [
    opt('fixaram os seus olhos para se inclinarem à terra', {'declinare': 'fixaram os seus olhos para se inclinarem à terra'},
        "Ruling (draft 2): the Latinist's line, 'à terra' for his second 'para a terra'; 'inclinar' of the family of 16:6 (κλῖνον / ἐκκλῖναι).", 'latinist'),
    opt('fixaram os seus olhos para se inclinarem para a terra', {'declinare': 'fixaram os seus olhos para se inclinarem para a terra'},
        "The Latinist's line exactly: 'para … para'.", 'latinist'),
    opt('resolveram inclinar os seus olhos para a terra', {'declinare': 'resolveram inclinar os seus olhos para a terra'},
        "Draft 1: statúere + infinitive → resolver (glossary, 118:106); the Latinist: the eyes become the infinitive's object and the setting is lost (major).", 'draft'),
    opt('fixaram os olhos para me lançar por terra', {'declinare': 'fixaram os olhos para me lançar por terra'},
        "Matos Soares 1932's gloss: decides the ambiguity and adds 'me' (rule 2 refuses).", 'MS1932'),
]

# 16:13 — Latinist major taken with the glossary's own verb
d = byId['praeveni']
d['why'] += (" Heard (draft 1): the Latinist, MAJOR — «O verbo pede antecipação: chegar antes dele ou adiantar-se a ele. Surpreender não conserva necessariamente esse sentido» → "
             "‘antecipai-vos a ele’. Taken in substance with the verb the glossary already gives prævenire (118:147, 148 'Adiantei-me', 'se adiantaram'), which is his "
             "own second wording ('adiantar-se a ele'); 'antecipar' is left to anticipáre (76:5, 78:8), as the row says. Cost: 17:19 (the same Greek verb, "
             "hostile, the speaker as object) keeps 'surpreender' — there it is what the enemies did to him unawares, here what God does first.")
d['options'] = [
    opt('adiantai-vos a ele', {'praeveni': 'adiantai-vos a ele'}, "Ruling (draft 2): prævenire's glossary verb with a person; safe (past 'adiantei').", 'latinist'),
    opt('surpreendei-o', {'praeveni': 'surpreendei-o'}, "Draft 1: 17:19's verb for the same Greek verb; the Latinist: the 'before' is not heard (major).", 'draft'),
    opt('antecipai-vos a ele', {'praeveni': 'antecipai-vos a ele'}, "The Latinist's word: anticipáre's (76:5, 78:8).", 'latinist'),
    opt('ide ao encontro dele', {'praeveni': 'ide ao encontro dele'}, "The row's suggestion for friendly transitives; here too mild. Matos Soares 1932 'vem antes dele'.", 'MS1932'),
]

# 16:14c / 16:15 — Latinist minor taken: the two passives answer each other
d = byId['satiate']
d['why'] += (" Heard (draft 1): the Latinist, minor — the reflexive may say they sated themselves; the Latin is passive → ‘Foram saciados de filhos’. Taken: "
             "with the passive in both verses the psalm's last contrast is heard in one form (foram saciados … serei saciado). The blind reader heard 'they had many children' "
             "in draft 1.")
d['options'] = [
    opt('Foram saciados · serei saciado', {'saturati': 'Foram saciados', 'satiabor': 'serei saciado'}, "Ruling (draft 2): the Latin's passive both times; one verb, one voice (the Latinist).", 'latinist'),
    opt('Saciaram-se · serei saciado', {'saturati': 'Saciaram-se', 'satiabor': 'serei saciado'}, 'Draft 1: the reflexive as a middle (8:2b se elevou).', 'draft'),
    opt('Fartaram-se · saciar-me-ei', {'saturati': 'Fartaram-se', 'satiabor': 'saciar-me-ei'}, 'Matos Soares 1932: two verbs, the contrast weakened; a mesóclise.', 'MS1932'),
]

# 16:2 — stylist and blind reader: taken in part
d = byId['aequitates']
d['why'] += (" Heard (draft 1): the stylist — «“As equidades” soa como termo técnico … O plural é pouco natural na oração em português» → ‘vejam os vossos olhos as coisas justas’; "
             "the blind reader listed ‘equidades’ as unknown. Taken in part: the singular (number is grammar, D2 — as 9:6 'pelos séculos', in the other direction); "
             "the glossary's word kept, because ‘coisas justas’ gives ǽquitas the word of justus / justítia, which the psalm has in 16:1a and 16:15.")
d['options'] = [
    opt('a equidade', {'aequitates': 'a equidade'}, "Ruling (draft 2): the glossary's word; the plural given up to the ear.", 'draft'),
    opt('as equidades', {'aequitates': 'as equidades'}, "Draft 1: the Latin's number (as 10:8 'as justiças'); the stylist's and the blind reader's objection.", 'glossary'),
    opt('as coisas justas', {'aequitates': 'as coisas justas'}, "The stylist's line: plain, but 'justo' is justus's word (16:1a, 16:15 justítia).", 'stylist'),
    opt('o que é reto', {'aequitates': 'o que é reto'}, "Douay-Rheims' way ('the things that are equitable'); the noun becomes a clause.", 'DRB'),
]

# 16:7 — stylist refused (glossary), his verb already an option
d = byId['mirifica']
d['why'] += (" Heard (draft 1): the stylist — «“Fazei maravilhosas” deixa audível a construção traduzida» → ‘Tornai maravilhosas’. Refused, as in 15:3: mirificáre → "
             "‘fazer maravilhoso’ is the glossary's (4:4, 15:3), and the family of 'fazer' is what the Latin's -ficáre says; his verb stays option 3.")
d['options'][2] = opt('Tornai maravilhosas', {'mirifica': 'Tornai maravilhosas'}, "The stylist's verb (as the Ps 15 stylist's). Refused for the row mirificáre → 'fazer maravilhoso'.", 'stylist')

# 16:12 — stylist taken: a new decision for parátus
data['verses']['16:12'] = '{susceperunt} como um leão {paratus} para a presa: * e como {catulus} que habita {abditis}.'
data['decisions'].insert(data['decisions'].index(byId['catulus']), {
    'id': 'paratus', 'refs': ['16:12'], 'latin': 'sicut leo parátus ad prædam', 'kind': 'word',
    'why': ("parátus, the participle as an adjective, 'ready' (ἕτοιμος). paráre → preparar is the glossary's verb (Nunc dimittis 'preparastes'); the adjective of readiness "
            "is not a verb, and Portuguese has the plainer 'pronto'. Heard (draft 1): the stylist — «“preparado para a presa” acumula sílabas e ataques em p e pr» → ‘pronto para a presa’. "
            "Taken (D2: the plainer of two faithful words); the colon also loses two of its four syllables over the Latin. 56:8 = 107:2 Parátum cor meum decide there. "
            "Douay-Rheims 'prepared for the prey'; Matos Soares 1932 'preparado'."),
    'options': [
        opt('pronto', {'paratus': 'pronto'}, "Ruling (draft 2): the stylist's word.", 'stylist'),
        opt('preparado', {'paratus': 'preparado'}, "Draft 1: paráre's glossary verb as a participle; heavy in 'p' before 'presa'.", 'MS1932'),
    ],
})

# 16:13 — stylist refused (articles, glossary verb); slot widened to the colon
d = byId['frameam']
data['verses']['16:13'] = 'Levantai-vos, Senhor, {praeveni} e derrubai-o: * {frameam}.'
d['why'] += (" Heard (draft 1): the stylist's worst line — «O segundo membro exige muito fôlego; a sucessão de artigos e possessivos pesa» → ‘tirai minha alma do ímpio, vossa espada dos inimigos de vossa mão’. "
             "Refused: it drops the articles before possessives that the style rules keep (rule 5), and 'tirar' leaves erípere's glossary verb; the colon is 26 syllables as the "
             "Latin's is. Kept as option 3 (the slot widened to the whole colon). The blind reader heard all three readings of the sword (taken from, used by, and the soul as the sword) — "
             "the Latin's openness, kept.")
d['options'] = [
    opt('a vossa espada dos inimigos da vossa mão', {'frameam': 'arrancai a minha alma do ímpio, a vossa espada dos inimigos da vossa mão'},
        "Ruling: the Latin's words and comma; both readings stay possible.", 'DRB'),
    opt('a vossa espada, dos inimigos da vossa mão', {'frameam': 'arrancai a minha alma do ímpio, a vossa espada, dos inimigos da vossa mão'},
        'A comma that leans to apposition (the wicked = your sword).', 'draft'),
    opt('tirai minha alma do ímpio, vossa espada dos inimigos de vossa mão', {'frameam': 'tirai minha alma do ímpio, vossa espada dos inimigos de vossa mão'},
        "The stylist's line: lighter, but without the articles (rule 5) and with 'tirar' for erípere.", 'stylist'),
]

steps = [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json',
     'note': 'Draft 1. Three majors and two minors; the marks confirmed. «A tradução conserva em geral o sentido latino, inclusive suas imagens insólitas.» Three taken, one taken in part (16:13, with the glossary\'s verb), one refused.',
     'outcomes': [
         {'verse': '16:9b', 'remark': "MAJOR: 'falou com soberba' makes the content a manner → 'falou soberba'", 'outcome': 'taken', 'decision': 'superbiam',
          'reason': "The build of loqui mendácium → 'falar mentira' (5:7a); 'com soberba' kept as option 2."},
         {'verse': '16:11', 'remark': "MAJOR: 'resolveram' turns the setting of the eyes into a decision → 'fixaram os seus olhos para se inclinarem para a terra'", 'outcome': 'taken', 'decision': 'declinare',
          'reason': "The eyes are statuérunt's object (ἔθεντο). His line with 'à terra' for the second 'para a terra'."},
         {'verse': '16:13', 'remark': "MAJOR: 'surpreendei-o' loses the anticipation of prǽveni → 'antecipai-vos a ele'", 'outcome': 'taken', 'decision': 'praeveni',
          'reason': "Taken in substance: 'adiantai-vos a ele', prævenire's glossary verb (118:147) and his own gloss 'adiantar-se a ele'; 'antecipar' is anticipáre's. His word is option 3."},
         {'verse': '16:14b', 'remark': "minor: 'se encheu' admits an inchoative reading → 'foi enchido'", 'outcome': 'refused',
          'reason': "The pronominal passive is Portuguese's passive for a thing filled; 'foi enchido' is not said. The blind reader heard the belly filled with God's hidden goods."},
         {'verse': '16:14c', 'remark': "minor: 'Saciaram-se' may be read as their own doing → 'Foram saciados de filhos'", 'outcome': 'taken', 'decision': 'satiate',
          'reason': "The passive in both verses makes the psalm's last contrast one form: foram saciados … serei saciado."},
     ]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json',
     'note': 'Draft 1. Four verses; best 16:1a, worst 16:13. «O salmo tem sobriedade e boas terminações para o canto … boa parte da estranheza pertence às próprias imagens e deve permanecer.» One taken, one taken in part, two refused with options.',
     'outcomes': [
         {'verse': '16:2', 'remark': "'as equidades' sounds technical; the plural unnatural → 'as coisas justas'", 'outcome': 'taken', 'decision': 'aequitates',
          'reason': "Taken in part: the singular 'a equidade' (number is grammar); 'justo' is justus's word, so his noun is option 3."},
         {'verse': '16:7', 'remark': "'Fazei maravilhosas' sounds translated → 'Tornai maravilhosas'", 'outcome': 'option', 'decision': 'mirifica',
          'reason': "mirificáre → 'fazer maravilhoso' (glossary; 4:4, 15:3); refused as in Ps 15."},
         {'verse': '16:12', 'remark': "'preparado para a presa' piles up p / pr → 'pronto para a presa'", 'outcome': 'taken', 'decision': 'paratus',
          'reason': 'The plainer of two faithful words for the participle-adjective (D2).'},
         {'verse': '16:13', 'remark': "worst line: the second colon too long, articles and possessives heavy → 'tirai minha alma do ímpio, vossa espada dos inimigos de vossa mão'", 'outcome': 'option', 'decision': 'frameam',
          'reason': "Drops the article before possessives (rule 5) and erípere's verb; the colon is the Latin's own length (26)."},
     ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
     'note': "Draft 1, Portuguese only. 22 items, 2 unknown words (equidades, veredas). No wrong first hearing that the Latin does not share; the openness it found (16:4 which clause the purpose serves, 16:13 the sword, 16:13 the switch to the singular 'o', 16:14b whose belly) is the Latin's.",
     'outcomes': [
         {'verse': '16:1a', 'remark': "'a minha justiça': my just conduct / my plea for justice (heard first)", 'outcome': 'refused', 'reason': 'justítia meam holds both.'},
         {'verse': '16:2', 'remark': "'o meu juízo': God's judgment of me (heard first) / my discernment", 'outcome': 'refused', 'reason': 'Heard rightly.'},
         {'verse': '16:3', 'remark': "'no fogo me examinastes': trials (heard first) / real fire", 'outcome': 'refused', 'reason': "igne: the Latin's image, heard as meant."},
         {'verse': '16:4', 'remark': "the purpose clause: serves the testing before / the hard ways after (heard first)", 'outcome': 'refused', 'decision': 'loquatur', 'reason': 'The Latin hangs it the same way.'},
         {'verse': '16:4', 'remark': "'eu guardei caminhos duros': followed (heard first, uncertain) / watched / remembered", 'outcome': 'refused', 'reason': "custodíre vias → 'guardar os caminhos' (17:22); DRB 'kept hard ways'."},
         {'verse': '16:5', 'remark': "'os meus passos nas vossas veredas': way of life (heard first) / concrete paths", 'outcome': 'refused', 'reason': 'The image, heard as meant.'},
         {'verse': '16:5', 'remark': "'não sejam abaladas as minhas pegadas': keep firm (heard first) / footprints not altered", 'outcome': 'refused', 'decision': 'moveantur', 'reason': 'Heard rightly; vestígia → pegadas (17:37).'},
         {'verse': '16:7', 'remark': "'esperam em vós': trust (heard first) / wait", 'outcome': 'refused', 'reason': 'speráre holds both.'},
         {'verse': '16:8a', 'remark': "'os que resistem à vossa direita': oppose God's power (heard first) / stand at God's right", 'outcome': 'refused', 'decision': 'resistentibus', 'reason': "Heard rightly first; 'mão direita' would add a word (déxtera → a direita, glossary)."},
         {'verse': '16:9b', 'remark': "'a minha alma': spiritual part (heard first) / my life", 'outcome': 'refused', 'reason': 'ánima holds both (glossary ánima mea).'},
         {'verse': '16:9b', 'remark': "'fecharam a sua gordura': their own (heard first); what it means unclear", 'outcome': 'refused', 'decision': 'adipem', 'reason': "The Latin's image, unexplained (rule 2); the owner heard rightly."},
         {'verse': '16:11', 'remark': "'inclinar os seus olhos para a terra': lowering the gaze (heard first); purpose uncertain", 'outcome': 'refused', 'decision': 'declinare', 'reason': "The Latin's openness; the line changed for the Latinist's reason, not this."},
         {'verse': '16:13', 'remark': "'surpreendei-o e derrubai-o': the enemy in the singular (heard first) / the lion", 'outcome': 'refused', 'reason': "The Latin's own switch to eum after the plurals."},
         {'verse': '16:13', 'remark': "the sword: taken from the enemies / used to save (heard first) / the soul as the sword", 'outcome': 'refused', 'decision': 'frameam', 'reason': "The Latin's ambiguity, kept."},
         {'verse': '16:13', 'remark': "'dos inimigos da vossa mão': opposing God's power (heard first) / under his hand", 'outcome': 'refused', 'reason': 'inimíci manus tuæ holds both.'},
         {'verse': '16:14b', 'remark': "'na vida deles': the enemies' (heard first) / the few's", 'outcome': 'refused', 'decision': 'divide', 'reason': 'eórum as open.'},
         {'verse': '16:14b', 'remark': "'o ventre deles': the enemies' (heard first) / the few's", 'outcome': 'refused', 'reason': 'eórum as open.'},
         {'verse': '16:14b', 'remark': "'das vossas coisas escondidas': goods kept by God (heard first) / hidden mysteries", 'outcome': 'refused', 'decision': 'absconditis', 'reason': 'abscóndita holds both.'},
         {'verse': '16:14c', 'remark': "'Saciaram-se de filhos': had many children (heard first)", 'outcome': 'refused', 'decision': 'satiate', 'reason': 'Heard rightly.'},
         {'verse': '16:14c', 'remark': "'as suas sobras': food leftovers (heard first) / remaining goods", 'outcome': 'refused', 'decision': 'reliquias', 'reason': 'relíquiæ holds both; the belly and the sating lean to the first, as meant.'},
         {'verse': '16:15', 'remark': "'na justiça, aparecerei à vossa vista': as a just man (heard first) / at a judgment", 'outcome': 'refused', 'reason': 'Heard rightly.'},
         {'verse': '16:2', 'remark': 'unknown word: equidades', 'outcome': 'taken', 'decision': 'aequitates', 'reason': "The singular 'a equidade' (with the stylist); the glossary word stays."},
         {'verse': '16:5', 'remark': 'unknown word: veredas', 'outcome': 'refused', 'reason': 'sémita → vereda (D15).'},
     ]},
    {'step': 'revision', 'version': 2,
     'note': ("v2. Changed against draft 1: 16:2 'a equidade' (singular; stylist, blind reader); 16:9b 'falou soberba' (Latinist major); 16:11 'fixaram os seus olhos para se inclinarem à terra' "
              "(Latinist major); 16:12 'pronto para a presa' (stylist); 16:13 'adiantai-vos a ele' (Latinist major, with the glossary's verb); 16:14c 'Foram saciados' (Latinist minor). "
              "Slot of 16:13 widened to the whole second colon so the stylist's line can be chosen; new decision 'paratus'. Refused: 16:14b 'foi enchido', 16:7 'Tornai', 16:13 the stylist's "
              "line. Draft 1 is prayed.v1.json (flat text prayed.v1.vos.json, the file the three v1 critics read). Script: ps016/revise_v2.py.")},
]
data['audit'].extend(steps)
(here / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok v2')
