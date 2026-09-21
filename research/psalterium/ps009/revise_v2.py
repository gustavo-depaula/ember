"""Stage one, draft 1 → draft 2 after the Latinist, stylist and ambiguity readers of critic/v1.*.json.
python3.13 research/psalterium/ps009/revise_v2.py  (idempotent only from prayed.v1.json)"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
data = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
dec = {d['id']: d for d in data['decisions']}
V = data['verses']


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


def promote(decisionId, newFirst, keepNote=None):
    d = dec[decisionId]
    first = d['options'][0]
    first['note'] = keepNote or ('Draft 1. ' + first['note'].replace('Ruling. ', '').replace('Ruling: ', ''))
    d['options'] = [newFirst] + [o for o in d['options'] if o['label'] != newFirst['label']]


# 9:3 — the stylist's order: vocative first
promote('psallam', opt('Altíssimo, entoarei salmos ao vosso nome', {'psallam': 'Altíssimo, entoarei salmos ao vosso nome'},
    'Ruling since draft 2, the stylist’s: the vocative opens the colon, so that the verb runs on to its dative without a break; order only (D2). It stands right after ‘em vós’, so it is heard as said to God. The verse still closes on ‘nome’.', 'stylist'),
    'Draft 1: the vocative inside the colon. Refused by the stylist: it parts the singing from its object and the phrase must start again after it.')

# 9:4 — the Latinist: the gerund is transitive; the future passive kept
promote('convertendo', opt('Ao fazer voltar para trás o meu inimigo', {'convertendo': 'Ao fazer voltar para trás o meu inimigo'},
    'Ruling since draft 2, the Latinist’s (major): the gerund is active with inimícum meum as its object — someone turns the enemy back. ‘fazer voltar’ says that and still names no one: the agent stays the Latin’s silence (the second colon’s ‘diante da vossa face’ points to God, as in the Latin). The stylist’s line (option 2) makes the enemy the subject, which is the Greek’s passive read as the Latin is not.', 'latinist'),
    'Draft 1: ‘ao’ + infinitive with the enemy heard as the one who turns — the Latinist marked it major (the accusative is the object of the gerund), and the stylist heard the subject arrive late.')
for o in dec['convertendo']['options']:
    if o['label'] == 'Quando o meu inimigo voltar para trás':
        o['note'] = 'The stylist’s line for draft 1 (the subject first). It makes the verb intransitive, which the Latin’s accusative does not allow — refused on the Latinist’s ground.'
        o['from'] = 'stylist'
V['9:4'] = '{convertendo}: * {infirmabuntur}, e perecerão {a_facie}.'
data['decisions'].insert(data['decisions'].index(dec['convertendo']) + 1, {
    'id': 'infirmabuntur', 'refs': ['9:4'], 'latin': 'infirmabúntur', 'kind': 'grammar',
    'why': 'A future passive (the Greek has the active ἀσθενήσουσιν, ‘they will be weak’). The Latinist (v1, inside his major on 9:4) asks for the voice. glossary: infírmus row — infirmári → enfraquecer.',
    'options': [
        opt('serão enfraquecidos', {'infirmabuntur': 'serão enfraquecidos'}, 'Ruling since draft 2: the Latin’s voice (Douay-Rheims ‘they shall be weakened’). Cost: the colon is now five syllables over the Latin’s — accepted for the voice; ‘à vossa face’ in decision a_facie would take three back.', 'latinist'),
        opt('enfraquecerão', {'infirmabuntur': 'enfraquecerão'}, 'Draft 1: the intransitive, which is the Greek’s active and Matos Soares 1932’s ‘serão debilitados’ in another shape; shorter.', 'draft'),
    ]})

# 9:6 — the stylist’s reversal of the formula refused and kept as an option
V['9:6'] = '{increpasti} as nações, e pereceu o ímpio: * apagastes o nome deles {v6end}.'
dec['saeculi']['options'] = [
    opt('para sempre, e pelos séculos dos séculos', {'v6end': '{aet}, e pelos séculos dos séculos'}, 'Ruling: the glossary formula, the words every Brazilian Catholic knows from the doxology’s close. The Latinist (v1, minor) asks again for the singular, as in 118:44 — refused for the same reason: ‘pelo século do século’ is not said in Portuguese prayer; the Greek has the plural in the first member of other places and the Latin’s singular is a Hebraism kept by every Vulgate-family version in the plural (Douay-Rheims ‘for ever and ever’, Matos Soares 1932 ‘dos séculos’).', 'glossary'),
    opt('para sempre, e pelo século do século', {'v6end': '{aet}, e pelo século do século'}, 'The Latin’s singular, as the Latinist asks (118:44, and here again, minor).', 'latinist'),
    opt('para sempre, e por todos os séculos dos séculos', {'v6end': '{aet}, e por todos os séculos dos séculos'}, 'Matos Soares 1932; ‘todos’ supplied.', 'MS1932'),
    opt('pelos séculos dos séculos, e para sempre', {'v6end': 'pelos séculos dos séculos, e {aet}'}, 'The stylist’s line for draft 1, to end on a paroxytone. Refused: it reverses the Latin’s two members (in ætérnum comes first), and the Latin itself ends on the proparoxytone sǽculi — the formula is kept whole, as the brief keeps formulas.', 'stylist'),
]
dec['saeculi']['why'] = dec['saeculi']['why'] + ' The slot takes in the whole phrase so that the stylist’s reversal can be shown.'

# 9:8b — the Latinist: ‘em juízo’
promote('in_judicio', opt('em juízo', {'in_judicio': 'em juízo'}, 'Ruling since draft 2, the Latinist’s (major): ‘para o juízo’ supplied a purpose the preposition does not state. ‘em juízo’ is the Latin’s preposition, and the court sense a Brazilian hears in it (a throne set up in judgment, in session) is the verse’s own; 118:154 has ‘em juízo’ too.', 'latinist'),
    'Draft 1 (Matos Soares 1932 without his ‘exercer’; the CNBB from the Hebrew): the Latinist marked the purpose major.')

# 9:13 — the stylist: a subject and ‘ao’ + infinitive
V['9:13'] = 'Porque, {requirens}, ele se lembrou: * não esqueceu o clamor {pauper2}.'
dec['requirens']['options'] = [
    opt('ao pedir contas do sangue deles', {'requirens': 'ao pedir contas do sangue deles'}, 'Ruling since draft 2. The idiom for the act (‘contas’ supplied to make it); the stylist’s shape — ‘ao’ + infinitive for the participle, and ‘ele’ named as subject (D2) so that the main verb has something to stand on. The blind reader heard ‘the Lord calls the victims’ death to account’ first.', 'stylist'),
    opt('pedindo contas do sangue deles', {'requirens': 'pedindo contas do sangue deles'}, 'Draft 1 (with no ‘ele’): the stylist heard the intercalated clause hold back the verb with no subject to carry it.', 'draft'),
    opt('ao procurar o sangue deles', {'requirens': 'ao procurar o sangue deles'}, 'The glossary’s verb for requírere / exquírere (118:145); heard as seeking to shed it.', 'glossary'),
    opt('ao requerer o sangue deles', {'requirens': 'ao requerer o sangue deles'}, 'The cognate, a legal claim; heard too as asking for blood to be given.', 'draft'),
    opt('vingando o sangue deles', {'requirens': 'vingando o sangue deles'}, 'Matos Soares 1932 and the CNBB’s ‘vingador’: the sense made explicit, and ulcísci’s verb.', 'MS1932'),
]

# 9:14 — the stylist: a relative clause for the participle
promote('de_inimicis', opt('que me vem dos meus inimigos', {'de_inimicis': 'que me vem dos meus inimigos'}, 'Ruling since draft 2, the stylist’s (who heard ‘humilhação vinda’ as clipped written prose): a clause, as Douay-Rheims’ (‘which I suffer from’) — here with the plainest verb, ‘vir’, that says only where it comes from. ‘a minha’ is kept (meam), which the stylist’s line dropped.', 'stylist'),
    'Draft 1: the participle of Ps 7:11 (‘vindo do Senhor’). The stylist: a clipped build of written prose.')

# 9:16a — the stylist’s order; ‘causaram’ refused
V['9:16a'] = 'Exultarei na vossa salvação: * as nações {infixae} na {interitu}.'
for o in dec['infixae']['options']:
    o['note'] = o['note']
dec['infixae']['why'] += ' Since draft 2 the subject comes first (the stylist: the inversion held it back) — order only (D2).'
dec['interitu']['options'] = [
    opt('destruição que fizeram', {'interitu': 'destruição que fizeram'}, 'Ruling. Douay-Rheims’ noun; plain; free, since ruína has its own Latin word. fecérunt → ‘fizeram’ (ἐποίησαν): the Latin says they made it.', 'DRB'),
    opt('destruição que causaram', {'interitu': 'destruição que causaram'}, 'The stylist’s verb (‘fazer uma destruição’ is an unusual pairing). Refused: ‘causar’ is another verb; the Latin’s is fácere, the verb of 9:5 and 9:17, and the oddness is the Latin’s own.', 'stylist'),
    opt('ruína que fizeram', {'interitu': 'ruína que fizeram'}, 'Matos Soares 1932; shorter and better sounding, but ruína is a Latin word of its own (105:29, 109:6, 143:14).', 'MS1932'),
    opt('perdição que fizeram', {'interitu': 'perdição que fizeram'}, 'Heard in Brazil as moral or eternal ruin.', 'draft'),
]

# 9:17 — the stylist: ‘ao executar’
dec['judicia_faciens']['options'] = [
    opt('ao executar juízos', {'judicia_faciens': 'ao executar juízos'}, 'Ruling since draft 2. ‘executar’ is the verb a Portuguese ear gives to a judgment carried out (Douay-Rheims ‘executeth’); judícia → juízos (D15), plural kept. ‘ao’ + infinitive for the participle is the stylist’s (the bare gerund left the tie loose) — grammar. The blind reader heard ‘applying sentences’ first, ‘deciding causes’ second: both are κρίματα.', 'stylist'),
    opt('executando juízos', {'judicia_faciens': 'executando juízos'}, 'Draft 1: the participle as a gerund.', 'draft'),
    opt('ao fazer juízos', {'judicia_faciens': 'ao fazer juízos'}, 'The calque; heard as forming opinions.', 'draft'),
    opt('ao praticar juízos', {'judicia_faciens': 'ao praticar juízos'}, '118:121’s verb; praticar is operári’s in the glossary.', 'glossary'),
    opt('fazendo justiça', {'judicia_faciens': 'fazendo justiça'}, 'Matos Soares 1932; spends justítia’s word.', 'MS1932'),
]

# 9:19 — the stylist’s order (subject first), with the Latin’s verb
V['9:19'] = 'Porque {v19a}: * a paciência {pauper4} não perecerá {finem}.'
data['decisions'].insert(data['decisions'].index(dec['in_finem']) + 1, {
    'id': 'v19a', 'refs': ['9:19'], 'latin': 'Quóniam non in finem oblívio erit páuperis', 'kind': 'order',
    'why': 'The Latin puts ‘non in finem’ first and the abstract subject last. The stylist named draft 1’s line the worst of the portion (‘não será até o fim’ hangs until the subject comes; the order sounds carried over from the Latin) and proposed the subject first with ‘durará’. oblívio páuperis stays open between the poor man forgetting and being forgotten, as in the Latin; the blind reader heard ‘the poor is forgotten now, and that will end’ — the sense.',
    'options': [
        opt('o esquecimento do pobre não será até o fim', {'v19a': 'o esquecimento {pauper3} não será {finem}'}, 'Ruling since draft 2: the stylist’s order, the Latin’s verb (erit → será). Cost: ‘fim’ now ends both cola — the Latin’s own repetition of in finem, moved to the mediant by the order; accepted (the stylist asked that the repetition stay).', 'stylist'),
        opt('não será até o fim o esquecimento do pobre', {'v19a': 'não será {finem} o esquecimento {pauper3}'}, 'Draft 1: the Latin’s order. The stylist’s worst line.', 'draft'),
        opt('o esquecimento do pobre não durará até o fim', {'v19a': 'o esquecimento {pauper3} não durará {finem}'}, 'The stylist’s line: ‘durar’ for the copula is more than D2 lets the ear supply.', 'stylist'),
    ]})

data['version'] = 2
(here / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 2 written')
