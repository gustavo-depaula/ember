"""Draft 1 -> draft 2 of Ps 5: applies the post-critic revision to prayed.json (draft 1 is kept as prayed.v1.json).
Run once: python3.13 research/psalterium/ps005/revise_v2.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
assert data['version'] == 1, 'already revised'

data['version'] = 2
verses = data['verses']
verses['5:6'] = '{v6a}: * {v6b} diante dos vossos olhos.'
verses['5:8b'] = 'Entrarei na vossa casa: * {adtemplum}.'
verses['5:9'] = 'Senhor, {deduc} na vossa justiça: * por causa dos meus inimigos {v9b}.'


def decision(name):
    return next(d for d in data['decisions'] if d['id'] == name)


# 5:6 — order (stylist), and malignus (ambiguity)
malignus = decision('malignus')
malignus['why'] += " Draft 1 had the cognate; the blind reader heard 'o maligno' first as the devil and only second as a bad man."
malignus['options'] = [
    {
        'label': 'o malvado',
        'forms': {'malignus': 'o malvado'},
        'note': "Draft 2, after the ambiguity reader. A plain word for a man who does evil, which is what the Latin means here (the Greek is a participle, 'one doing evil'); it cannot be taken for the devil, and its plural can serve malignántes ('a assembleia dos malvados', 21:17). Cost: the cognate is given up. Proposed for the glossary: malígnus / malignántes → malvado(s).",
        'from': 'ambiguity',
    },
    {
        'label': 'o maligno',
        'forms': {'malignus': 'o maligno'},
        'note': "Draft 1: the Latin's word, Matos Soares 1932. Refused in draft 2: in Brazil 'o maligno' with the article is first of all the devil, and the blind reader heard exactly that ('O diabo') — a sense the Latin can bear only at a stretch, and not the first one.",
        'from': 'MS1932',
    },
    {
        'label': 'o mau',
        'forms': {'malignus': 'o mau'},
        'note': "The Diurnal's word; plainer still. It is malus's word, and thin in the mouth.",
        'from': 'DM1962',
    },
]
index = data['decisions'].index(malignus)
data['decisions'].insert(index + 1, {
    'id': 'v6order',
    'refs': ['5:6'],
    'latin': 'Neque habitábit juxta te malígnus: * neque permanébunt injústi',
    'kind': 'order',
    'why': 'The Latin has verb before subject in both colons. Draft 1 kept that order; the stylist heard two inversions in a row that delay the subjects and sound translated.',
    'options': [
        {
            'label': 'Nem o malvado habitará junto de vós: * nem os injustos permanecerão',
            'forms': {'v6a': 'Nem {malignus} habitará junto de vós', 'v6b': 'nem os injustos permanecerão'},
            'note': 'Draft 2, from the stylist: subject first, twice. Order only (D2); every word stays, and the first colon now closes on the oxytone vós.',
            'from': 'stylist',
        },
        {
            'label': 'Nem habitará junto de vós o malvado: * nem permanecerão os injustos',
            'forms': {'v6a': 'Nem habitará junto de vós {malignus}', 'v6b': 'nem permanecerão os injustos'},
            'note': "Draft 1: the Latin's order (Matos Soares 1932 has it in the first colon).",
            'from': 'draft',
        },
    ],
})

# 5:7b — natural order (stylist)
v7b = decision('v7b')
fronted, plain = v7b['options']
plain['note'] = "Draft 2, from the stylist, who found the fronted object with its resuming 'o' hard to say — 'a long suspension before the verb, two starts'. Order is the ear's (D2); this is also the order of Matos Soares 1932 and Douay-Rheims. Cost: the contrast of topics with 'mas eu' is no longer built into the syntax; the 'mas' still makes it."
plain['from'] = 'stylist'
fronted['note'] = "Draft 1: the topic first, as in the Latin, so that 'mas eu' answers it; the Diurnal builds the line the same way ('O homem de sangue e fraude, o Senhor o abomina'). Refused in draft 2 on the stylist's ear."
v7b['options'] = [plain, fronted]

# 5:8b — whole colon
adtemplum = decision('adtemplum')
adtemplum['why'] += " Draft 1 had 'adorarei em direção ao vosso templo santo no vosso temor'; the stylist heard 'em direção ao' as a route indication and 'no vosso temor' left hanging at the end."
adtemplum['options'] = [
    {
        'label': 'no vosso temor adorarei voltando-me para o vosso templo santo',
        'forms': {'adtemplum': 'no vosso temor adorarei voltando-me para o vosso templo santo'},
        'note': "Draft 2. The stylist's order ('no vosso temor' first — order is the ear's, D2) and his verb 'voltar', but as a gerund: his 'voltado' is a masculine participle that the Latin does not have, put in the mouth of whoever prays, nuns included; 'voltando-me' has no gender and costs one syllable. The relation of adoráre ad is kept. The stylist's commas are not taken (the Latin has none).",
        'from': 'stylist',
    },
    {
        'label': 'no vosso temor adorarei voltado para o vosso templo santo',
        'forms': {'adtemplum': 'no vosso temor adorarei voltado para o vosso templo santo'},
        'note': "The stylist's own line. The most natural; adds a gendered word the Latin lacks.",
        'from': 'stylist',
    },
    {
        'label': 'adorarei em direção ao vosso templo santo no vosso temor',
        'forms': {'adtemplum': 'adorarei em direção ao vosso templo santo no vosso temor'},
        'note': "Draft 1 (Douay-Rheims 'towards'), in the Latin's order. Refused by the stylist: 'soa como indicação de percurso'.",
        'from': 'DRB',
    },
    {
        'label': 'adorarei para o vosso templo santo no vosso temor',
        'forms': {'adtemplum': 'adorarei para o vosso templo santo no vosso temor'},
        'note': 'The calque: as odd as adoráre ad is in Latin, and the shortest.',
        'from': 'draft',
    },
    {
        'label': 'no vosso temor adorarei no vosso templo santo',
        'forms': {'adtemplum': 'no vosso temor adorarei no vosso templo santo'},
        'note': "Matos Soares 1932 ('te adorarei no teu santo templo'). Loses ad: the one who prays is then inside the temple, which the Latin does not say.",
        'from': 'MS1932',
    },
]

# 5:9 — order of the second colon
conspectu = decision('conspectu')
index = data['decisions'].index(conspectu)
data['decisions'].insert(index + 1, {
    'id': 'v9order',
    'refs': ['5:9'],
    'latin': 'dírige in conspéctu tuo viam meam',
    'kind': 'order',
    'why': "The Latin sets 'in conspéctu tuo' between the verb and its object. Draft 1 did the same; the stylist found that it parts the verb from its object and makes the ear wait.",
    'options': [
        {
            'label': 'endireitai o meu caminho à vossa vista',
            'forms': {'v9b': '{dirige} o meu caminho {conspectu}'},
            'note': "Draft 2, from the stylist: object next to its verb. Order only (D2). His comma after 'inimigos' is not taken (the Latin has none).",
            'from': 'stylist',
        },
        {
            'label': 'endireitai à vossa vista o meu caminho',
            'forms': {'v9b': '{dirige} {conspectu} o meu caminho'},
            'note': "Draft 1: the Latin's order, ending on 'caminho' as the Latin ends on viam meam.",
            'from': 'draft',
        },
    ],
})

# 5:13b — the stylist's construction
scuto = decision('scuto')
scuto['why'] += " Draft 1 ('como de um escudo da vossa boa vontade * nos coroastes') was the stylist's worst line: 'como de um escudo' has no clear support in Portuguese, and the pause at the asterisk prolongs the difficulty."
scuto['options'][0]['note'] = "Draft 1. 'Coroar de' for the ablative, the genitive kept as a genitive, the verb last as in the Latin (Douay-Rheims 'thou hast crowned us, as with a shield of thy good will'). The Latinist passed it and the blind reader understood it; the stylist named it the worst line of the psalm."
scuto['options'].insert(0, {
    'label': 'com a vossa boa vontade como escudo * nos coroastes',
    'forms': {'v13a': 'com a vossa {bonaevoluntatis} como escudo', 'v13b': 'nos coroastes'},
    'note': "Draft 2, the stylist's line. Every word of the Latin is there — como (ut), escudo, boa vontade, vossa, coroastes, nos — and the verb still stands alone after the asterisk. What changes is grammar: the genitive 'a shield of your good will' is read as the good will being the shield, which is how Matos Soares 1932 read it ('com a tua benevolência, como com um escudo') and what the blind reader understood from draft 1. Cost: the genitive is no longer open to 'a shield that your good will gives'.",
    'from': 'stylist',
})

# gloriari — raised by the ambiguity reader
benedices = decision('benedices')
index = data['decisions'].index(benedices)
data['decisions'].insert(index, {
    'id': 'gloriabuntur',
    'refs': ['5:12b'],
    'latin': 'Et gloriabúntur in te omnes',
    'kind': 'word',
    'why': "gloriári in is to glory in, to make one's boast of (καυχήσονται ἐν σοί); six verses of the psalter have the verb (31:11, 48:7, 51:3, 93:3, 96:7). The blind reader heard 'em vós se gloriarão' first as 'they will give glory to God' and listed 'gloriarão' as unknown.",
    'options': [
        {
            'label': 'E em vós se gloriarão',
            'forms': {'gloriabuntur': 'E em vós se gloriarão'},
            'note': "Ruling: the cognate with the Latin's preposition, word for word Matos Soares 1932 ('E em ti se gloriarão'); Douay-Rheims 'shall glory in thee'. The mishearing is a near neighbour of the sense, not a contrary one, and the same verb must say the sinners' boasting in 93:3 and 51:3, where 'orgulhar-se' or 'dar glória' could not follow.",
            'from': 'MS1932',
        },
        {
            'label': 'E de vós se gloriarão',
            'forms': {'gloriabuntur': 'E de vós se gloriarão'},
            "note": "'Gloriar-se de' is the commoner construction for boasting; leaves the Latin's 'in'.",
            'from': 'ambiguity',
        },
        {
            'label': 'E em vós se orgulharão',
            'forms': {'gloriabuntur': 'E em vós se orgulharão'},
            'note': 'The everyday word; pride is a vice in the psalter (supérbia), and the word would be needed there.',
            'from': 'draft',
        },
    ],
})
verses['5:12b'] = '{gloriabuntur} todos os que amam o vosso nome, * porque vós {benedices}.'

benedices['options'][0]['note'] = "Ruling: the glossary's one verb, with the dative kept as the row for man → God keeps it ('bendizei ao Senhor'). Tested in draft 1 on three blind readers: the Latinist passed it, the stylist did not remark on it, the ambiguity reader found nothing to mishear. So 'bendizer' (God → man) stands without the support Ps 133 gave it."

data['choices']['5:6'] = "'Neque … neque' → 'Nem … nem'. juxta te → 'junto de vós'; permanére → permanecer; injústi → 'os injustos' (the Latin's word; the Greek has παράνομοι). Subject first in both colons since draft 2 (decision v6order)."
data['choices']['5:8b'] = "introíre → entrar (glossary: íngredi / intráre → entrar — a third Latin verb shares it). 'in timóre tuo' → 'no vosso temor', the objective genitive kept as Douay-Rheims keeps it ('in thy fear'); the blind reader heard reverence first and fear second. Matos Soares paraphrases ('penetrado do teu temor'). Second colon +4 syllables, accepted."
data['choices']['5:11b'] += " The blind reader heard 'Caiam dos seus próprios pensamentos' first as 'let their own plans bring them down' and second as 'let them fall away from their thoughts', and said the construction leaves the relation unclear — which is the Latin's own state."

data['audit'] += [
    {
        'step': 'latinist',
        'file': 'critic/v1.latinist.json',
        'note': 'Draft 1. Clean: no verse remarked, every mark confirmed.',
        'outcomes': [],
    },
    {
        'step': 'stylist',
        'file': 'critic/v1.stylist.json',
        'note': "Draft 1. Five verses; best 5:3, worst 5:13b. All five are about order or construction, none asks for another word's meaning, so under D2 all five are taken — 5:8b with one change (his masculine 'voltado' → 'voltando-me'), and without his added commas in 5:8b and 5:9 (the text keeps the Latin's punctuation).",
        'outcomes': [
            {'verse': '5:6', 'remark': "two inversions in a row delay the subjects → 'Nem o maligno habitará junto de vós: * nem os injustos permanecerão…'", 'outcome': 'taken', 'decision': 'v6order'},
            {'verse': '5:7b', 'remark': "fronted object resumed by 'o' needs a long suspension, 'two starts' → 'O Senhor abominará o homem de sangue e enganador'", 'outcome': 'taken', 'decision': 'v7b'},
            {'verse': '5:8b', 'remark': "'em direção ao' sounds like a route; 'no vosso temor' dangles → 'no vosso temor, adorarei voltado para o vosso templo santo'", 'outcome': 'taken', 'decision': 'adtemplum', 'reason': "Order and the verb 'voltar' taken; 'voltado' made 'voltando-me' so that no gendered word is added to the one who prays; his comma not taken."},
            {'verse': '5:9', 'remark': "'à vossa vista' parts the verb from its object → 'endireitai o meu caminho à vossa vista'", 'outcome': 'taken', 'decision': 'v9order', 'reason': "Order taken; his comma after 'inimigos' not taken (the Latin has none)."},
            {'verse': '5:13b', 'remark': "'como de um escudo' has no clear support → 'Senhor, com a vossa boa vontade como escudo * nos coroastes'", 'outcome': 'taken', 'decision': 'scuto'},
        ],
    },
    {
        'step': 'ambiguity',
        'file': 'critic/v1.ambiguity.json',
        'note': "Draft 1, Portuguese only. Eighteen items, four unknown words (iniquidade ×2, impiedades, gloriarão). One real fault: 5:6 'o maligno' heard first as the devil → 'o malvado'. One mishearing kept with its reasons (5:12b 'se gloriarão' heard as giving glory; now a decision). 5:13b, the stylist's worst line, was understood rightly. The rest is the Latin's own range.",
        'outcomes': [
            {'verse': '5:3', 'remark': "'Atendei': listen / grant what I ask — the second heard first", 'outcome': 'refused', 'reason': 'inténdere → atender is settled (D3); the overtone of granting is welcome in a petition and does not contradict the Latin.'},
            {'verse': '5:5', 'remark': "'e verei': see God / see God's answer", 'outcome': 'refused', 'decision': 'videbo', 'reason': 'The Latin has no object; the openness is kept on purpose (D2).'},
            {'verse': '5:6', 'remark': "'o maligno': the devil / a bad man — the devil heard first", 'outcome': 'taken', 'decision': 'malignus'},
            {'verse': '5:7b', 'remark': "'O homem de sangue e enganador': one man or two", 'outcome': 'refused', 'reason': 'Heard as one man, which is the Latin (one virum, two attributes).'},
            {'verse': '5:7b', 'remark': "'mas eu, na multidão da vossa misericórdia': tied to what follows, or a closed contrast", 'outcome': 'refused', 'decision': 'v8a', 'reason': "Both are the Latin's: DO's pointing closes the colon with a full stop and the next verse completes it."},
            {'verse': '5:8b', 'remark': "'no vosso temor': fear / reverence", 'outcome': 'refused', 'reason': "timor → temor (glossary); the right sense was heard first."},
            {'verse': '5:9', 'remark': "'na vossa justiça' (rule of conduct / because you are just); what 'por causa dos meus inimigos' depends on; 'endireitai … o meu caminho' (conduct / road)", 'outcome': 'refused', 'reason': "All three are as open in the Latin; 'propter inimícos meos' was heard with dírige, where the Latin's colon puts it."},
            {'verse': '5:10', 'remark': "'vão': empty / futile or vain", 'outcome': 'refused', 'reason': 'vanum has both.'},
            {'verse': '5:11a', 'remark': "'com as suas línguas enganavam': subject unstated; 'julgai-os': sentence / condemn", 'outcome': 'refused', 'decision': 'dolosus', 'reason': "Heard rightly (the enemies deceive others with their words); júdica is as wide in the Latin (glossary row judicáre)."},
            {'verse': '5:11b', 'remark': "'Caiam dos seus próprios pensamentos': brought down by their own plans / fall away from them; 'segundo a multidão': in proportion / because they are many", 'outcome': 'refused', 'decision': 'decidant', 'reason': "The Latin is open in the same two ways (decision decidant); secúndum is 'according to' and was not misheard."},
            {'verse': '5:12a', 'remark': "'esperam em vós': trust / wait; 'eternamente': for ever / in eternal life", 'outcome': 'refused', 'reason': 'Glossary rows speráre in and in ætérnum; trust was heard first here.'},
            {'verse': '5:12b', 'remark': "'em vós se gloriarão': take pride in you / give glory to you — the second heard first; 'gloriarão' unknown", 'outcome': 'option', 'decision': 'gloriabuntur', 'reason': "The cognate is kept: it is the Vulgate-family wording and the one verb that can also say the sinners' boasting (93:3); 'de vós se gloriarão' is kept as an option."},
            {'verse': '5:13b', 'remark': "shield that protects / a crown compared to a shield", 'outcome': 'refused', 'decision': 'scuto', 'reason': 'Heard rightly; the line is rebuilt in draft 2 on the stylist\'s remark.'},
            {'verse': '5:5, 5:7a, 5:11b', 'remark': "unknown words: iniquidade, impiedades", 'outcome': 'refused', 'reason': 'Glossary words (iníquitas → iniquidade; impíetas of the family of ímpio) with no plainer equivalent that keeps them apart from pecado.'},
        ],
    },
    {
        'step': 'revision',
        'version': 2,
        'note': "v2. Six verses changed against draft 1. From the stylist: 5:6 subjects first; 5:7b plain order ('O Senhor abominará o homem de sangue e enganador'); 5:8b 'no vosso temor adorarei voltando-me para o vosso templo santo' (was 'adorarei em direção ao vosso templo santo no vosso temor'); 5:9 'endireitai o meu caminho à vossa vista'; 5:13b 'com a vossa boa vontade como escudo * nos coroastes' (was 'como de um escudo da vossa boa vontade'). From the ambiguity reader: 5:6 'o malvado' (was 'o maligno', heard as the devil). 5:12b unchanged, but 'gloriar-se em' is now a decision. Draft 1 is prayed.v1.json (flat text prayed.v1.vos.json, the file the three v1 critics read).",
    },
]

path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok, version', data['version'])
