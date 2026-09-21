"""Ps 11 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps011/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}


def option(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


data['version'] = 2

# 11:2 — 'o santo' heard as one particular holy person
d = decisions['defecit']
d['why'] += ' Heard (draft 1): the blind reader took ‘desapareceu o santo’ first as ‘uma pessoa santa específica desapareceu ou morreu, embora não se saiba quem’, and only second as ‘já não há pessoas santas’ — which is the Latin’s generic singular.'
d['options'][0]['note'] = 'Draft 1. Heard first as the disappearance of one particular holy person — an event about someone, where the Latin’s singular is generic.'
d['options'][0]['from'] = 'draft'
dr = next(o for o in d['options'] if o['label'] == 'já não há santo')
d['options'].remove(dr)
dr['note'] = 'Ruling (draft 2): Douay-Rheims’ ‘there is now no saint’. The bare noun after ‘não há’ can only be generic, so the hearer takes it as the Latin means it: the godly man is gone from the earth. The perfect ‘defécit’ is said as the state it has produced (‘has come to an end’ = ‘is no more’); aspect, not sense.'
dr['from'] = 'ambiguity'
d['options'].insert(0, dr)

# 11:3 — the stylist's order, and the double heart made audible
data['verses']['11:3'] = '{vana}: * com lábios {dolosa3}, {corde}.'
d = decisions['corde']
d['why'] += ' Heard (draft 1): the blind reader found ‘com coração e coração falaram’ could be taken as ‘de coração para coração, com sinceridade ou intimidade’ — the Portuguese idiom for the opposite of the Latin — ‘embora lábios enganadores sugira o contrário’. The stylist: the two ‘com’ phrases before the verb make ‘falaram’ arrive artificially → ‘com lábios enganadores, falaram com coração e coração’; ‘a repetição «coração e coração» pode permanecer’.'
d['options'] = [
    option('falaram com um coração e outro coração', {'corde': 'falaram com um coração e outro coração'}, 'Ruling (draft 2): the stylist’s order (the verb brought forward), and ‘um … outro’ so that the doubled noun is heard as two hearts — duplicity — and not as the idiom ‘de coração para coração’. Both nouns kept (rule 2); the determiners are grammar, far short of Matos Soares 1932’s explanation (‘dúplice’). Cost: two syllables; the colon is five over the Latin.', 'ambiguity'),
    option('falaram com coração e coração', {'corde': 'falaram com coração e coração'}, 'The stylist’s line: the Latin’s figure bare, the verb brought forward. The blind reader’s ‘heart to heart’ hearing remains possible.', 'stylist'),
    option('com coração e coração falaram', {'corde': 'com coração e coração falaram'}, 'Draft 1: the Latin’s order and figure. Refused by the stylist (the verb arrives late) and heard by the blind reader as possibly ‘heart to heart’.', 'draft'),
    option('falaram com duplo coração', {'corde': 'falaram com duplo coração'}, 'Douay-Rheims’ ‘double heart’ (and the Diurnal’s ‘duplo coração’): the sense, but the figure explained.', 'DRB'),
    option('falaram com coração dúplice', {'corde': 'falaram com coração dúplice'}, 'Matos Soares 1932. Explains, and ends the verse on a proparoxytone.', 'MS1932'),
]
data['choices']['11:3'] = 'próximus → ‘próximo’. ‘com’ is supplied before ‘lábios’ (decision corde): without it the lips are heard as the subject of ‘falaram’, which the Latin’s masculine ‘locúti’ excludes. The second colon follows the stylist’s order (verb before ‘com um coração e outro coração’). The blind reader listed ‘vãs’ as unknown (glossary: coisas vãs, Ps 2:1); kept.'

# 11:7 — elóquia: 'ditos' refused again; 'castos' heard as sexual chastity
d = decisions['eloquia']
d['why'] += ' Heard (draft 1): the stylist refused ‘Os ditos do Senhor são ditos castos’ — ‘soa como uma classificação de máximas moralmente recatadas; a combinação chama atenção para o vocabulário e custa a soar como oração’ — and asked for ‘As palavras do Senhor são palavras puras’ (his worst line of the psalm). The blind reader understood the colon as ‘Palavras puras, sem falsidade’ first, but heard ‘castos’, for many, as sexual chastity, and listed ‘castos’ as unknown. So the genitive and the adjective did not save ‘ditos’: it is the ninth refusal of the plural by the stylist (eight in Ps 118, D26), and the first where the word could not be recast as a clause.'
d['options'] = [
    option('As palavras do Senhor são palavras puras', {'eloquia': 'As palavras do Senhor são palavras puras'}, 'Ruling (draft 2), for D26’s local decision: ‘palavra(s)’. Why, against the clause and ‘ditos’: (1) the clause cannot serve here — the Latin’s figure is the noun said twice, the second time as a predicate (‘utterances … pure utterances’), and ‘o que o Senhor disse’ cannot be repeated so; dropping the repetition is what rule 2 forbids; (2) ‘ditos’ failed the ear once more, now with a genitive and an adjective, where Ps 118’s refusals could be put down to the bare formula; (3) the one thing ‘palavra’ costs — λόγιον against λόγος — costs nothing inside this psalm, which has no verbum and no sermo; (4) it is what Douay-Rheims (‘pure words’) and Matos Soares 1932 have, and the blind reader’s own paraphrase. castus → ‘puras’ (ἁγνός; castus is only here in the psalter, grep): ‘castas’ was heard as sexual chastity, and ‘puro’ meets mundus (50:12 cor mundum) in no verse. 17:31 (elóquia Dómini igne examináta, no verbum or sermo there either) should follow: ‘as palavras do Senhor examinadas no fogo’. Where elóquium stands beside sermo (147:4) or verbum, that verse will still need the clause.', 'stylist'),
    option('Os ditos do Senhor são ditos castos', {'eloquia': 'Os ditos do Senhor são ditos castos'}, 'Draft 1: the noun D26 keeps available for a genitive, which keeps λόγιον apart from λόγος. Refused by the stylist (‘máximas moralmente recatadas’); ‘castos’ heard by the blind reader as sexual chastity and listed as unknown.', 'glossary'),
    option('Os ditos do Senhor são ditos puros', {'eloquia': 'Os ditos do Senhor são ditos puros'}, 'Keeps D26’s noun and mends only the adjective. The stylist’s objection to ‘ditos’ (sayings, maxims) stands.', 'draft'),
    option('O que o Senhor disse é puro', {'eloquia': 'O que o Senhor disse é puro'}, 'D26’s clause. Refused: the Latin’s repetition (elóquia … elóquia) cannot be kept (rule 2).', 'glossary'),
    option('As palavras do Senhor são palavras castas', {'eloquia': 'As palavras do Senhor são palavras castas'}, 'The Latin’s adjective kept by its cognate; heard as sexual chastity.', 'draft'),
    option('As palavras do Senhor são palavras sinceras', {'eloquia': 'As palavras do Senhor são palavras sinceras'}, 'Matos Soares 1932 (and the Diurnal). ‘Sincero’ is another word (sincérus).', 'MS1932'),
]

# notes from the readers where they bear on decisions kept
decisions['magniloquam']['options'][0]['note'] += ' The Latinist (draft 1, minor) wanted the boasting explicit, ‘a língua que fala com arrogância’; refused — the blind reader heard ‘a fala de quem se vangloria’ first, so nothing is left unsaid, and his fix breaks the echo with 11:5 (option 3).'
decisions['ponam']['options'][0]['note'] += ' Tested: the blind reader did not stumble; he supplied the object himself (‘O Senhor dará segurança aos pobres, mencionados imediatamente antes; o objeto de porei não é expresso’) — the Latin’s own openness.'
decisions['fiducialiter']['options'][0]['note'] += ' Heard: the blind reader took ‘nele agirei com confiança’ first as the one praying (acting in trust in the Lord), because ‘diz o Senhor’ closes 11:6a; the Latin has the same build (… dicit Dóminus. Ponam …), and Douay-Rheims too. Kept.'
decisions['propter']['options'][0]['note'] += ' The stylist named 11:6a the psalm’s best line, so the length did not trouble him. The blind reader listed ‘indigentes’ as unknown; kept — it is the current word for the destitute in Brazilian public speech, and its noun ‘indigência’ serves inópia.'
decisions['altitudinem']['options'][0]['note'] += ' Heard as ‘a grandeza ou o poder do Senhor’ first.'
decisions['dominus']['options'][0]['note'] += ' Heard: ‘uma pergunta desafiadora, negando que alguém tenha autoridade sobre eles’ — as meant.'

data['choices']['11:6b'] += ' The blind reader heard 11:6b as possibly the psalmist’s again; the Latin and Douay-Rheims are built the same way (the Lord’s words are not marked off).'
data['choices']['11:9'] += ' The blind reader heard ‘multiplicastes os filhos dos homens’ as mankind first, with the ímpios a possible second — as the Latin.'

data['audit'] += [
    {
        'step': 'checks',
        'note': 'Draft 1: hard pass (after two fixes before any critic read it: a doubled colon in 11:8, and 11:3 recast so that the mediant does not fall on the proparoxytone ‘próximo’). Soft flags, accepted: 11:3 second colon +3; 11:6a +4 / +3 (‘por causa de’ is the glossary’s length for propter; ‘indigentes’); 11:7 second colon +4 (three participles and ‘sete vezes’); 11:8 second colon −3. Rhyme flag 11:5 / 11:6a (‘senhor / Senhor’): the same word, and the Latin has the same echo (Dóminus est? / dicit Dóminus) — rule 5’s exception.',
    },
    {
        'step': 'latinist',
        'file': 'critic/v1.latinist.json',
        'note': 'Draft 1. One minor, 11:4; everything else passed, marks confirmed — ‘desapareceu o santo’, ‘com coração e coração’, ‘Porei na salvação’ with no object, ‘Os ditos do Senhor são ditos castos’, ‘prata examinada no fogo, provada, purificada da terra sete vezes’, ‘nos conservareis … guardareis’, ‘segundo a vossa altura’.',
        'outcomes': [
            {'verse': '11:4', 'remark': '‘a língua que fala grandezas’ leaves the boasting of magníloquam little explicit → ‘a língua que fala com arrogância’ (minor)', 'outcome': 'option', 'decision': 'magniloquam', 'reason': 'The blind reader heard boasting first, so the sense is not lost; ‘grandezas’ keeps the magní- and its echo with ‘Engrandeceremos’ (11:5), as the Latin’s magní- / magnificá-. His wording is Matos Soares 1932’s, option 3.'},
        ],
    },
    {
        'step': 'stylist',
        'file': 'critic/v1.stylist.json',
        'note': 'Draft 1. Two verses; best 11:6a, worst 11:7. ‘O salmo tem sobriedade, cabe bem na recitação e apresenta terminações adequadas ao canto … as imagens incomuns e as repetições vindas do latim não precisam ser alisadas.’',
        'outcomes': [
            {'verse': '11:3', 'remark': 'two ‘com’ phrases delay ‘falaram’ → ‘com lábios enganadores, falaram com coração e coração’', 'outcome': 'taken', 'decision': 'corde', 'reason': 'Order only (D2). Taken with ‘um … outro’ added, for the blind reader’s finding; his exact line is option 2.'},
            {'verse': '11:7', 'remark': '‘ditos castos’ sounds like a classification of modest maxims → ‘As palavras do Senhor são palavras puras’', 'outcome': 'taken', 'decision': 'eloquia', 'reason': 'D26 left the word to this psalm; the clause cannot keep the Latin’s repetition, ‘ditos’ failed again, and ‘palavra’ collides with nothing in the psalm. ‘castos’ failed the blind reader too.'},
        ],
    },
    {
        'step': 'ambiguity',
        'file': 'critic/v1.ambiguity.json',
        'note': 'Draft 1, Portuguese only. Twenty items, three unknown words (vãs, indigentes, castos). Three real faults, all mended in draft 2: 11:2 ‘desapareceu o santo’ heard as one particular person; 11:3 ‘com coração e coração’ possibly heard as ‘de coração para coração’; 11:7 ‘castos’ heard as sexual chastity. The rest is the Latin’s own range; ‘Porei na salvação’ with no object, the draft’s test, passed.',
        'outcomes': [
            {'verse': '11:2', 'remark': '‘desapareceu o santo’: one particular holy person (heard first) / no holy people left', 'outcome': 'taken', 'decision': 'defecit', 'reason': 'The Latin’s singular is generic; ‘já não há santo’ (Douay-Rheims) can only be heard so.'},
            {'verse': '11:2', 'remark': '‘diminuíram as verdades’: people speak less truth (heard first) / fewer certainties', 'outcome': 'refused', 'decision': 'diminutae', 'reason': 'Heard rightly; the plural is the Latin’s.'},
            {'verse': '11:2', 'remark': '‘os filhos dos homens’: mankind / someone’s descendants', 'outcome': 'refused', 'reason': 'Glossary; heard rightly.'},
            {'verse': '11:3', 'remark': '‘coisas vãs’: useless / false (heard first)', 'outcome': 'refused', 'reason': 'vana holds both.'},
            {'verse': '11:3', 'remark': '‘com coração e coração falaram’: duplicity / ‘de coração para coração’, sincerity', 'outcome': 'taken', 'decision': 'corde', 'reason': 'A hearing opposite to the Latin’s; ‘com um coração e outro coração’ keeps both nouns and closes it.'},
            {'verse': '11:4', 'remark': '‘Extermine … os lábios enganadores’: the deceivers (heard first) / deceitful speech', 'outcome': 'refused', 'reason': 'The Latin’s metonymy, as open.'},
            {'verse': '11:4', 'remark': '‘a língua que fala grandezas’: boasting (heard first) / proclaiming great things, even God’s', 'outcome': 'refused', 'decision': 'magniloquam', 'reason': 'Heard rightly, in context.'},
            {'verse': '11:5', 'remark': '‘Engrandeceremos a nossa língua’: make our speech powerful (heard first) / promote our language', 'outcome': 'refused', 'reason': 'Heard rightly; the Latin’s image.'},
            {'verse': '11:5', 'remark': '‘quem é o nosso senhor?’: no one has authority over us (heard first) / who is the Lord we must serve', 'outcome': 'refused', 'decision': 'dominus', 'reason': 'Heard as meant.'},
            {'verse': '11:6a', 'remark': '‘agora me levantarei’: stand up / begin to act for the poor (heard first)', 'outcome': 'refused', 'reason': 'exsúrgere is both.'},
            {'verse': '11:6b', 'remark': '‘Porei na salvação’: the poor (heard first) / the one who prayed; the object not expressed', 'outcome': 'refused', 'decision': 'ponam', 'reason': 'The Latin’s own openness, heard without a stumble.'},
            {'verse': '11:6b', 'remark': '‘salvação’: deliverance / spiritual salvation (heard first)', 'outcome': 'refused', 'reason': 'D6; salutáre holds both.'},
            {'verse': '11:6b', 'remark': '‘nele agirei com confiança’: the Lord acting in someone unnamed / the one praying acting in trust (heard first)', 'outcome': 'refused', 'decision': 'fiducialiter', 'reason': 'The Latin marks off the Lord’s words no better (dicit Dóminus closes 11:6a).'},
            {'verse': '11:7', 'remark': '‘ditos castos’: pure words (first) / words without sexual content; ‘castos’ unknown', 'outcome': 'taken', 'decision': 'eloquia', 'reason': '‘puras’ for castus.'},
            {'verse': '11:7', 'remark': '‘purificada da terra’: dross of earth removed (heard first) / silver that comes from the earth', 'outcome': 'refused', 'decision': 'examinatum', 'reason': 'terræ is as open.'},
            {'verse': '11:8', 'remark': '‘nos conservareis’: keep alive and safe (heard first) / keep faithful', 'outcome': 'refused', 'decision': 'servabis', 'reason': 'Both in serváre.'},
            {'verse': '11:8', 'remark': '‘desta geração’: people of this time, as a threat (heard first) / an age group', 'outcome': 'refused', 'reason': 'Heard rightly.'},
            {'verse': '11:9', 'remark': '‘andam ao redor’: surround the one praying (heard first) / roam everywhere', 'outcome': 'refused', 'reason': 'in circúitu names no centre either.'},
            {'verse': '11:9', 'remark': '‘segundo a vossa altura’: greatness (heard first) / physical height', 'outcome': 'refused', 'decision': 'altitudinem', 'reason': 'The Latin’s concrete word used of God.'},
            {'verse': '11:9', 'remark': '‘multiplicastes os filhos dos homens’: mankind (heard first) / many children / the ímpios', 'outcome': 'refused', 'reason': 'As open in the Latin.'},
            {'verse': '11:3', 'remark': 'unknown word: vãs', 'outcome': 'refused', 'reason': 'Glossary (coisas vãs, Ps 2:1).'},
            {'verse': '11:6a', 'remark': 'unknown word: indigentes', 'outcome': 'refused', 'decision': 'propter', 'reason': 'Current in Brazilian public speech; its noun serves inópia; options ‘desvalidos’ (MS1932).'},
        ],
    },
    {
        'step': 'revision',
        'version': 2,
        'note': 'v2. Three verses changed against draft 1: 11:2 ‘porque já não há santo’ (Douay-Rheims; was ‘desapareceu o santo’, heard as one person); 11:3 ‘com lábios enganadores, falaram com um coração e outro coração’ (the stylist’s order; ‘um … outro’ against the ‘heart to heart’ hearing); 11:7 ‘As palavras do Senhor são palavras puras’ (the stylist’s line; D26 decided locally for ‘palavra’, reasons in decision eloquia). Held against the Latinist’s minor: 11:4 ‘fala grandezas’. Draft 1 is prayed.v1.json (flat text prayed.v1.vos.json, the file the three v1 critics read).',
    },
]

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
