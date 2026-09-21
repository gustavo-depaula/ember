"""Ps 7 draft 1 -> draft 2, after the three v1 critics. Run once: python3.13 research/psalterium/ps007/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}


def option(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


data['version'] = 2
verses = data['verses']

# 7:3 — the stylist's order
verses['7:3'] = '{rapiat}, * enquanto não há quem {redimat}, nem quem salve.'
d = decisions['rapiat']
d['kind'] = 'ambiguity'
d['why'] += ' Draft 1 kept the Latin’s order (‘Para que não arrebate, como um leão, a minha alma’); the stylist heard two pauses parting the verb from its object.'
d['options'] = [
    option('Para que não arrebate a minha alma como um leão', {'rapiat': 'Para que não arrebate a minha alma como um leão'}, 'Draft 2. The subject is still the Latin’s own silence: Portuguese allows a verb whose subject is understood from what precedes, the lion simile fills the gap, and the enemy is named three verses on, as in the Latin — nothing supplied, nothing resolved (rule 2). The blind reader heard ‘one of the persecutors, though which is not said’ — the Latin exactly. The order is the stylist’s: object before simile, no commas. Order is the ear’s (D2).', 'stylist'),
    option('Para que não arrebate, como um leão, a minha alma', {'rapiat': 'Para que não arrebate, como um leão, a minha alma'}, 'Draft 1: the Latin’s order (rápiat ut leo ánimam meam). Refused by the stylist: ‘as duas pausas separam o verbo do objeto’.', 'draft'),
    option('Para que ninguém arrebate a minha alma como um leão', {'rapiat': 'Para que ninguém arrebate a minha alma como um leão'}, 'Matos Soares 1932. Fluent, but it says ‘no one’ where the Latin has a definite, unnamed ‘he’ — it turns a single hunter into a general risk.', 'MS1932'),
    option('Para que ele não arrebate a minha alma como um leão', {'rapiat': 'Para que ele não arrebate a minha alma como um leão'}, 'Douay-Rheims ‘he’. A pronoun with no antecedent: in Portuguese ‘ele’ would be heard as pointing back to God, the only singular so far.', 'DRB'),
    option('Para que o inimigo não arrebate a minha alma como um leão', {'rapiat': 'Para que o inimigo não arrebate a minha alma como um leão'}, 'Names the subject of 7:6 early. Rule 2 lets a hidden subject be named, but here it spends ‘inimícus’ before the Latin does.', 'draft'),
]

# 7:5 — order of the second colon (stylist); the Latinist's agent reading added as an option
verses['7:5'] = '{v5a}, * {v5b}.'
ab = decisions['ab_inimicis']
ab['why'] += ' The Latinist (draft 1, MAJOR) reads the agent only: ‘ab inimícis meis atribui aos inimigos a queda; diante dos transforma essa relação em localização’, and asks for ‘por obra dos meus inimigos’.'
ab['options'][0]['note'] = 'Ruling, held against the Latinist’s major: Douay-Rheims’s ‘before’. It is the one Portuguese preposition that holds both readings — a man falls ‘diante de’ those who strike him down and ‘diante de’ those he fails against — and it states neither. The Latinist’s agent is one reading of the Latin; the Greek the Latin is calquing (ἀπο-πέσοιν ἀπό → de-cidam ab) says separation, and rule 2 forbids closing what the Latin leaves open. The blind reader, with the Portuguese alone, heard ‘que eu seja derrotado pelos inimigos’ first — so the agency the Latinist misses is in fact heard. Reported to the glossary: ‘cair de’ does not serve décidere ab + persons.'
ab['options'].insert(1, option('por obra dos meus inimigos', {'ab_inimicis': 'por obra dos'}, 'The Latinist’s fix (draft 1, major). The agent said outright with a supplied noun; it closes the Greek’s reading, goes further from the words than Douay-Rheims or Matos Soares 1932 (neither has an agent), and is stiff in the mouth. One touch away if Gustavo sides with him.', 'latinist'))
data['decisions'].insert(data['decisions'].index(ab), {
    'id': 'v5order',
    'refs': ['7:5'],
    'latin': 'décidam mérito ab inimícis meis inánis',
    'kind': 'order',
    'why': 'The Latin keeps ‘inánis’ for the last word of the verse. Draft 1 did the same (‘caia eu com razão diante dos meus inimigos, vazio’). The stylist: ‘«Vazio» chega como um acréscimo depois de a frase parecer concluída; custa ligá-lo novamente a «eu»’.',
    'options': [
        option('caia eu vazio, com razão, diante dos meus inimigos', {'v5b': 'caia eu {inanis}, com razão, {ab_inimicis} meus inimigos'}, 'Draft 2, the stylist’s order: the adjective beside the pronoun it belongs to. Order is the ear’s (D2); every word is still there. Cost: the Latin’s sting in the tail.', 'stylist'),
        option('caia eu com razão diante dos meus inimigos, vazio', {'v5b': 'caia eu com razão {ab_inimicis} meus inimigos, {inanis}'}, 'Draft 1: the Latin’s order, ‘inánis’ last. In Portuguese the adjective has no case ending to tie it back to ‘eu’, and the ear has closed the sentence before it comes.', 'draft'),
    ],
})

# 7:6 — calcar -> pisar (stylist + blind reader); the stylist's order refused
verses['7:6'] = 'Persiga o inimigo a minha alma, † e {comprehendat}, e {conculcet}, * e {deducat} a minha glória.'
d = decisions['conculcet']
d['why'] += ' Draft 1 had the glossary’s ‘calque aos pés’: the stylist found ‘calque’ little used and the blind reader listed it as an unknown word — two readers, the same fault.'
d['options'] = [
    option('pise aos pés na terra a minha vida', {'conculcet': 'pise aos pés na terra a minha vida'}, 'Draft 2: the stylist’s verb, the glossary row’s own plainer alternative, with ‘aos pés’ kept so that con-culcáre is still trampling and ‘pise na terra’ is not heard as treading the earth. Reported to the glossary as evidence against ‘calcar’ (Ps 90:13 has it). The stylist’s order is not taken — next option but one.', 'stylist'),
    option('calque aos pés na terra a minha vida', {'conculcet': 'calque aos pés na terra a minha vida'}, 'Draft 1, the glossary’s rendering (open, Ps 90:13). ‘Calque’ failed the stylist (‘pouco corrente’) and the blind reader (unknown word).', 'glossary'),
    option('pise aos pés a minha vida na terra', {'conculcet': 'pise aos pés a minha vida na terra'}, 'The stylist’s order, object first. Refused: ‘a minha vida na terra’ is a set phrase in Portuguese — my earthly life — so ‘in terra’ would leave the verb, where the Latin has it, and cling to the noun. That is a change of sense, not of order (D2).', 'stylist'),
    option('calque na terra a minha vida', {'conculcet': 'calque na terra a minha vida'}, 'Matos Soares 1932 (‘calque contra a terra’). ‘Calcar’ alone is to press down; the feet are what make it trampling.', 'MS1932'),
]

# 7:10 — vocative first (stylist)
d = decisions['scrutans']
d['options'][0] = option('Deus, vós que sondais os corações e os rins', {'scrutans': 'Deus, vós que sondais os corações e os {renes}'}, 'Draft 2. After a second-person verb the participle is most simply its continuation, and ‘Deus’ is then a vocative, written bare as the glossary has it (no ‘ó’). ‘Vós que’ is the subject Portuguese needs (D2). The vocative comes first at the stylist’s request — left at the end it sounded ‘como uma identificação acrescentada’; order is the ear’s. ‘Sondar’ holds with hearts as its object.', 'stylist')
d['options'].insert(1, option('vós que sondais os corações e os rins, Deus', {'scrutans': 'vós que sondais os corações e os {renes}, Deus'}, 'Draft 1: the Latin’s order, the name last. Refused by the stylist.', 'draft'))

# 7:11 — one 'que' (stylist's fault taken, his wording refused)
d = decisions['justum']
d['options'] = [
    option('Justo é o meu auxílio vindo do Senhor', {'justum': 'Justo é o meu auxílio vindo do Senhor'}, 'Draft 2. The predicate reading, with the Greek and Douay-Rheims, in the Latin’s order — ‘Justo’ first, as ‘Justum’ is, and ‘judex justus’ follows in the next verse. The stylist’s fault is taken (two ‘que’ in a row, and a pause before the mediant): a participle now hangs ‘a Dómino’ on the noun, so the only ‘que’ left is the Lord’s. His wording is not — next option but one.', 'stylist'),
    option('Justo é o meu auxílio, que vem do Senhor', {'justum': 'Justo é o meu auxílio, que vem do Senhor'}, 'Draft 1. Refused by the stylist: ‘os dois «que» encadeiam explicações e enfraquecem a afirmação’.', 'draft'),
    option('Meu auxílio justo vem do Senhor', {'justum': 'Meu auxílio justo vem do Senhor'}, 'The stylist’s line. Refused: it makes ‘justum’ an attribute and moves the statement to ‘comes from the Lord’, where the Greek and Douay-Rheims read ‘Just is my help’; and it drops the article before the possessive (rule 5). Matos Soares 1932 reads the same way (‘O meu legítimo auxílio vir-me-á do Senhor’), so it is within D2’s outer bound — selectable.', 'stylist'),
    option('Justo é o meu auxílio da parte do Senhor', {'justum': 'Justo é o meu auxílio da parte do Senhor'}, 'No verb supplied: ‘da parte de’ for ‘a’ (the Greek παρά). Biblical and a little stiff.', 'draft'),
]

# 7:13 — a plainer option recorded
decisions['vibrabit']['options'].append(option('ele agitará a sua espada', {'vibrabit': 'agitará'}, 'Lewis & Short’s ‘shake, agitate’, for the blind reader, who listed ‘brandirá’ as an unknown word. Plain, and weaker than the gesture: one ‘agita’ a flag.', 'ambiguity'))
decisions['vibrabit']['options'][0]['note'] += ' The blind reader listed ‘brandirá’ as unknown, yet paraphrased it rightly (‘empunhará a espada’); kept.'

# 7:15 — the stylist's wording
d = decisions['parturiit']
d['options'] = [
    option('sentiu as dores de parto da injustiça', {'parturiit': 'sentiu as dores de parto da injustiça'}, 'Draft 2, the stylist’s line. It is what parturíre means (to be in travail; the Greek ὠδίνησεν is ‘had birth-pangs’), and the three verbs are still three. Cost, accepted: ‘dores’ now stands one colon before ‘a dor’ (dolórem), an echo the Latin’s words do not have — though its sense does, and 47:7 has the very phrase (dolóres ut parturiéntis).', 'stylist'),
    option('esteve de parto da injustiça', {'parturiit': 'esteve de parto da injustiça'}, 'Draft 1: ‘estar de parto’ is being in labour, and it kept ‘dor’ for dolórem alone. Refused by the stylist: ‘soa traduzido; a sequência «de parto da» torna a imagem mais difícil de dizer e reconhecer’. The Latinist and the blind reader had passed it.', 'draft'),
    option('deu à luz a injustiça', {'parturiit': 'deu à luz a injustiça'}, 'Matos Soares 1932. Merges parturíre with párere in the same verse.', 'MS1932'),
]

# 7:17 — the Latinist's fix
d = decisions['verticem']
d['options'] = [
    option('sobre o alto da sua cabeça', {'verticem': 'o alto da sua cabeça'}, 'Draft 2, the Latinist’s fix (minor): vertex is the top of the head, and ‘crânio’ brought in the bone. Cost: ‘cabeça’ twice where the Latin has two nouns, and a colon three syllables over. Portuguese has no second plain word (‘cocuruto’ is comic).', 'latinist'),
    option('sobre o seu crânio', {'verticem': 'o seu crânio'}, 'Draft 1: a second, concrete word, which would also serve 67:22 vérticem capílli. The Latinist: it ‘perde essa precisão e introduz uma referência óssea’.', 'draft'),
    option('sobre a sua fronte', {'verticem': 'a sua fronte'}, 'Matos Soares 1932. The forehead is not the vertex.', 'MS1932'),
]

# 7:18 — psállere and the last cadence
d = decisions['psallam']
d['why'] += ' Draft 1 had the cognate ‘salmodiarei’: the stylist found it heavy and ‘do vocabulário especializado’, and the blind reader listed it as an unknown word.'
d['options'] = [
    option('entoarei salmos', {'psallam': 'entoarei salmos'}, 'Draft 2, proposed as `open`: the stylist’s noun (‘salmos’, the family of psalmus, as he asked) with a verb that is not ‘cantar’, so that cantábo … psallam (12:6b, 103:33, 107:2) stays two verbs: ‘cantarei ao Senhor … e entoarei salmos ao nome’. The dative is kept; ‘entoai salmos’ is safe at the vós imperative (past ‘entoei’) and bears 46:7’s fourfold psállite. Cost: two words for one; where the Latin has psalmum + a verb of its own (psalmum dícite, 65:2) the noun will be said once all the same.', 'draft'),
    option('cantarei salmos', {'psallam': 'cantarei salmos'}, 'The stylist’s wording. Refused: it puts ‘cantar’ in the verb, and 12:6b — this same colon, after ‘cantábo Dómino’ — would say ‘cantarei … cantarei’ where the Latin has two verbs (as the Greek has, ᾄσω … ψαλῶ).', 'stylist'),
    option('salmodiarei', {'psallam': 'salmodiarei'}, 'Draft 1: the cognate, one word for one, safe at the imperative (‘salmodiai’). Failed the stylist (heavy, specialised) and the blind reader (unknown word).', 'draft'),
    option('cantarei', {'psallam': 'cantarei'}, 'Matos Soares 1932 (‘cantarei o nome’). cantáre’s verb.', 'MS1932'),
]
d = decisions['altissimi']
d['options'] = [
    option('do altíssimo Senhor', {'altissimi': 'do altíssimo Senhor'}, 'Draft 2, from the stylist: the psalm closes on an oxytone, as rule 4 asks. Order only (D2), and ‘o altíssimo Senhor’ is as native as ‘o bom Deus’. 12:6b copies it.', 'stylist'),
    option('do Senhor altíssimo', {'altissimi': 'do Senhor altíssimo'}, 'Draft 1: natural order and the Latin’s own final stress (altíssimi). The stylist: ‘termina o verso com duas sílabas depois da tônica, contrariando a cadência pedida’. Ps 90:1 lets ‘Altíssimo’ stand at a mediant, so this is not excluded — selectable.', 'draft'),
    option('do Senhor, o Altíssimo', {'altissimi': 'do Senhor, o Altíssimo'}, 'Reads the adjective as the divine name (9:3 Altíssime). DO’s lowercase does not.', 'draft'),
]

# conversi — what the blind reader heard
decisions['conversi']['options'][0]['note'] += ' Heard (draft 1): the blind reader took it first as ‘if you do not repent’ — the sense wanted — but listed a third reading the Latin does not have: since God too is ‘vós’ in this psalter, ‘Se não vos voltardes’ can be heard as said to God (whom 6:5 asks ‘Voltai-vos’); ‘ele brandirá’ at once makes God a third person and corrects it. ‘Converterdes’ could not be said to God — that is the strongest argument for option 2.'

choices = data['choices']
choices['7:3'] += ' Order since draft 2: object before simile (decision rapiat).'
choices['7:5'] = 'mérito → ‘com razão’ (Matos Soares 1932). Since draft 2 ‘vazio’ stands beside ‘eu’ (decision v5order). The colon stands against the Latinist’s major on ‘ab inimícis’ (decision ab_inimicis).'
choices['7:9b'] += ' ‘sobre mim’: the blind reader could attach it both ways, ‘com dificuldade’ — the Latin’s own difficulty (decision superme).'
choices['7:10'] = 'The first colon is the psalm’s longest (+5): two clauses in one colon, as the Latin has them. The blind reader noted that ‘rins’ may be taken literally (decision renes).'
choices['7:15'] += ' The blind reader: the verbs with no subject ‘podem fazer o ouvinte atribuí-los inicialmente a Deus’ — so can the Latin’s; ‘injustiça’ corrects it within the colon.'

data['audit'] += [
    {
        'step': 'latinist',
        'file': 'critic/v1.latinist.json',
        'note': 'Draft 1. Two verses: 7:5 major (ab inimícis is the agent; ‘diante dos’ makes it a place), 7:17 minor (crânio is the bone, not the top of the head). Everything else passed, marks confirmed in all eighteen verses — including exaltai-vos for the passive imperative, ‘fazer descer’, ‘para os que ardem’, ‘sobre mim’, ‘voltardes’, ‘esteve de parto’ and ‘salmodiarei’.',
        'outcomes': [
            {'verse': '7:5', 'remark': '‘ab inimícis meis’ attributes the fall to the enemies; ‘diante dos meus inimigos’ turns the relation into a location → ‘por obra dos meus inimigos’ (MAJOR)', 'outcome': 'option', 'decision': 'ab_inimicis', 'reason': 'Held against him on purpose. The agent is one reading of the Latin; the Greek it calques (ἀποπέσοιν ἀπό) says separation, neither Vulgate-family version has an agent (Douay-Rheims ‘before’, Matos Soares 1932 ‘debaixo’), and ‘diante de’ holds both — the blind reader heard ‘defeated by the enemies’ first. His wording closes the second reading with a supplied noun. It is option 2.'},
            {'verse': '7:17', 'remark': '‘crânio’ loses the precision of vertex and brings in the bone → ‘sobre o alto da sua cabeça’ (minor)', 'outcome': 'taken', 'decision': 'verticem', 'reason': 'Right: vertex is the crown of the head. ‘Cabeça’ now stands twice.'},
        ],
    },
    {
        'step': 'stylist',
        'file': 'critic/v1.stylist.json',
        'note': 'Draft 1. Eight verses; best 7:4, worst 7:6. ‘O salmo tem gravidade e imagens fortes … o tratamento por vós se integra bem à oração. Não há rimas acidentais salientes.’ Five taken (three of them whole), three kept as options.',
        'outcomes': [
            {'verse': '7:3', 'remark': 'two pauses part the verb from its object → ‘Para que não arrebate a minha alma como um leão’', 'outcome': 'taken', 'decision': 'rapiat', 'reason': 'Order only (D2).'},
            {'verse': '7:5', 'remark': '‘vazio’ arrives after the sentence seems over → ‘caia eu vazio, com razão, diante dos meus inimigos’', 'outcome': 'taken', 'decision': 'v5order', 'reason': 'Order only (D2); the Latin’s order is option 2.'},
            {'verse': '7:6', 'remark': '‘calque’ is little used, and the complements pile up before the object → ‘e pise aos pés a minha vida na terra’', 'outcome': 'option', 'decision': 'conculcet', 'reason': 'The verb is taken (the blind reader did not know ‘calque’ either). The order is refused: ‘a minha vida na terra’ is ‘my earthly life’, which moves ‘in terra’ from the verb to the noun — a change of sense.'},
            {'verse': '7:7b', 'remark': '‘mandar um decreto’ can sound like sending it → ‘no preceito que ordenastes’', 'outcome': 'option', 'decision': 'mandasti', 'reason': '‘Preceito’ is refused outright (D19: præcéptum → decreto; ‘preceitos’ is justificatiónes’). ‘Ordenastes’ stays option 2: ‘mandar’ keeps the family of mandáta → mandamentos (Ps 118:4), the Latin verb has the same double edge, and the blind reader heard ‘o decreto que emitistes’ — the right sense. For the main session when it rules on the mandáre row.'},
            {'verse': '7:10', 'remark': 'the vocative alone at the end sounds like an afterthought → ‘Deus, vós que sondais os corações e os rins’', 'outcome': 'taken', 'decision': 'scrutans', 'reason': 'Order only (D2).'},
            {'verse': '7:11', 'remark': 'two ‘que’ in a row, and a needless pause before the mediant → ‘Meu auxílio justo vem do Senhor’', 'outcome': 'option', 'decision': 'justum', 'reason': 'The fault is taken with another wording (‘Justo é o meu auxílio vindo do Senhor’). His line makes ‘justum’ an attribute against the Greek and Douay-Rheims, and drops the article before the possessive; it is option 3.'},
            {'verse': '7:15', 'remark': '‘esteve de parto da’ sounds translated and is hard to say → ‘sentiu as dores de parto da injustiça’', 'outcome': 'taken', 'decision': 'parturiit', 'reason': 'It is what parturíre says; how it is said is the ear’s (D2). Cost recorded: ‘dores’ one colon before ‘a dor’.'},
            {'verse': '7:18', 'remark': '‘salmodiarei’ is heavy and specialised; ‘altíssimo’ ends the verse on a proparoxytone → ‘e cantarei salmos ao nome do altíssimo Senhor’', 'outcome': 'option', 'decision': 'psallam', 'reason': 'Both faults taken: ‘salmos’ and the inversion (decision altissimi) are his. ‘Cantarei’ is refused because this colon is also 12:6b’s, where cantábo stands just before it: draft 2 has ‘entoarei salmos’.'},
        ],
    },
    {
        'step': 'ambiguity',
        'file': 'critic/v1.ambiguity.json',
        'note': 'Draft 1, Portuguese only. Twenty-nine items and five unknown words (iniquidade ×3, calque, confins, brandirá, salmodiarei). Nearly every item is the Latin’s own range heard faithfully (7:3 the unnamed hunter, 7:5 what ‘vazio’ is empty of, 7:9b ‘sobre mim’, 7:14 ‘os que ardem’, 7:15 the silent change of subject). Two unknown words led to changes (calque → pise, salmodiarei → entoarei salmos). One item is a cost of vós and not of the Latin: 7:13 ‘Se não vos voltardes’ can be heard as said to God.',
        'outcomes': [
            {'verse': '7:2', 'remark': '‘em vós esperei’: put my hope in God / waited for God', 'outcome': 'refused', 'reason': 'Glossary (speráre in → esperar em); the same was heard in Ps 90 and is recorded in that row. The right sense was heard first.'},
            {'verse': '7:3', 'remark': '‘não arrebate’: one of the persecutors / another, unnamed agent', 'outcome': 'refused', 'decision': 'rapiat', 'reason': 'The Latin’s own silence, heard as the Latin is read.'},
            {'verse': '7:3', 'remark': '‘a minha alma’ (also 7:6): the spiritual soul / my life', 'outcome': 'refused', 'reason': 'Glossary (ánima mea → a minha alma); 7:6 sets ánimam and vitam side by side, so ‘vida’ is not free.'},
            {'verse': '7:4', 'remark': '‘se fiz isto’: something said before / what follows; ‘iniquidade nas minhas mãos’: guilt / ill-gotten goods', 'outcome': 'refused', 'reason': '‘istud’ points to a charge the psalm never states (the titulus that hints at it is out, D7); ‘in mánibus’ is the Latin’s image.'},
            {'verse': '7:5', 'remark': '‘Se paguei aos que me retribuíam males’: paid those who repaid me evils / paid with evils those who repaid me', 'outcome': 'refused', 'decision': 'v5a', 'reason': 'Exactly the two readings of the Latin, which the wording was built to keep.'},
            {'verse': '7:5', 'remark': '‘caia eu’: be defeated / die / fall; ‘vazio’: without goods / without strength / inwardly empty', 'outcome': 'refused', 'decision': 'inanis', 'reason': 'décidam and inánis are as open. ‘Defeated by the enemies’ was heard first — see decision ab_inimicis.'},
            {'verse': '7:6', 'remark': '‘faça descer ao pó a minha glória’: destroy my honour / end my rank / bring to death what is my glory', 'outcome': 'refused', 'decision': 'deducat', 'reason': 'The Latin’s image, unexplained.'},
            {'verse': '7:7a', 'remark': '‘nos confins dos meus inimigos’: in their territory / at its borders or far ends; ‘confins’ unknown', 'outcome': 'refused', 'decision': 'finibus', 'reason': 'fines is both. ‘Confins’ is the glossary’s word (fines terræ) and lives in ‘os confins da terra’.'},
            {'verse': '7:7b', 'remark': '‘no decreto que mandastes’: rise to carry out the decree / rise in keeping with it', 'outcome': 'refused', 'decision': 'praecepto', 'reason': '‘in’ is as wide in the Latin; neither reading is ‘sent’, the stylist’s worry.'},
            {'verse': '7:7b', 'remark': '‘a congregação dos povos’: a gathering of peoples / a religious community — the second heard first', 'outcome': 'refused', 'decision': 'synagoga', 'reason': 'The cost the decision names. Peoples gathered round God as a worshipping crowd is not a wrong sense here; ‘assembleia’ is option 2.'},
            {'verse': '7:8b', 'remark': '‘por causa dela’: the congregation / the wrath of 7:7a; ‘regressai ao alto’: to heaven / to a high seat of judgment', 'outcome': 'refused', 'decision': 'regredere', 'reason': '‘hanc’ is no clearer (ira is feminine in the Latin too); ‘in altum’ holds both places.'},
            {'verse': '7:9b', 'remark': '‘segundo a minha inocência sobre mim’: the innocence in me / a judgment upon me — hard to attach', 'outcome': 'refused', 'decision': 'superme', 'reason': 'Both attachments are the Latin’s; the oddity is kept on purpose, with Matos Soares’s smoothing as option 2.'},
            {'verse': '7:10', 'remark': '‘os rins’: bodily organs / the inmost feelings', 'outcome': 'refused', 'decision': 'renes', 'reason': 'Rule 5: the image stays; the inward sense was heard first.'},
            {'verse': '7:11', 'remark': '‘Justo é o meu auxílio’: the help is just / the helper is just', 'outcome': 'refused', 'decision': 'justum', 'reason': 'adjutórium is as open (the glossary’s metonymy).'},
            {'verse': '7:12', 'remark': '‘acaso se ira todos os dias?’: expects ‘no’ / a real question', 'outcome': 'refused', 'decision': 'numquid', 'reason': 'The expected ‘no’ was heard first: ‘acaso’ does numquid’s work.'},
            {'verse': '7:13', 'remark': '‘Se não vos voltardes’: if you (sinners) do not repent / do not turn back / if you, God, do not turn', 'outcome': 'option', 'decision': 'conversi', 'reason': 'Repentance was heard first. The third reading is a cost of vós, not of the Latin (plural fuéritis cannot be God); ‘ele brandirá’ corrects it at once. Kept for the echo with 7:17; ‘converterdes’, which cannot be said to God, is option 2 and the note says so.'},
            {'verse': '7:13', 'remark': '‘ele brandirá … armou’: God / the enemy; ‘brandirá’ unknown', 'outcome': 'option', 'decision': 'vibrabit', 'reason': 'God was heard, rightly. ‘Brandirá’ was paraphrased rightly though listed as unknown; ‘agitará’ added as an option.'},
            {'verse': '7:14', 'remark': '‘nele’: in the bow / in a person; ‘para os que ardem’: to strike them / for their use; who burn literally, with passion, with fervour', 'outcome': 'refused', 'decision': 'v14b', 'reason': '‘in eo’ and ‘ardéntibus’ are exactly as dark.'},
            {'verse': '7:15', 'remark': 'the verbs have no subject: an unjust man — or, at first, God', 'outcome': 'refused', 'decision': 'parturiit', 'reason': 'The Latin changes subject as silently; naming ‘o ímpio’ (Matos Soares’s bracket) would choose among peccatóres, inimícus and the ‘he’ of 7:3.'},
            {'verse': '7:16', 'remark': 'a trap / a grave', 'outcome': 'refused', 'decision': 'lacum', 'reason': 'lacus is both in the psalter.'},
            {'verse': '7:17', 'remark': 'the pain he caused / the pain he feels; his evil itself / its punishment', 'outcome': 'refused', 'reason': 'dolor ejus and iníquitas ejus are as open.'},
            {'verse': '7:6', 'remark': 'unknown word: calque', 'outcome': 'taken', 'decision': 'conculcet', 'reason': 'With the stylist: ‘pise aos pés’.'},
            {'verse': '7:18', 'remark': 'unknown word: salmodiarei', 'outcome': 'taken', 'decision': 'psallam', 'reason': 'With the stylist: ‘entoarei salmos’.'},
            {'verse': '7:4', 'remark': 'unknown word: iniquidade (7:4, 7:15, 7:17)', 'outcome': 'refused', 'reason': 'Glossary word (iníquitas → iniquidade).'},
        ],
    },
    {
        'step': 'revision',
        'version': 2,
        'note': 'v2. Eight verses changed against draft 1. From the Latinist: 7:17 ‘sobre o alto da sua cabeça’ (was ‘o seu crânio’). From the stylist: 7:3 order (‘a minha alma como um leão’); 7:5 ‘caia eu vazio, com razão, diante dos meus inimigos’; 7:6 ‘pise aos pés’ (was ‘calque aos pés’; his order refused); 7:10 ‘Deus, vós que sondais os corações e os rins’; 7:11 ‘Justo é o meu auxílio vindo do Senhor’ (his fault, not his wording); 7:15 ‘sentiu as dores de parto da injustiça’; 7:18 ‘e entoarei salmos ao nome do altíssimo Senhor’ (was ‘salmodiarei ao nome do Senhor altíssimo’). Held against the Latinist’s major: 7:5 ‘diante dos meus inimigos’. Draft 1 is prayed.v1.json (flat text prayed.v1.vos.json, the file the three v1 critics read).',
    },
]

data['status'] = 'reviewed'
(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft', data['version'], len(data['decisions']), 'decisions')
