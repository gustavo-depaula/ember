"""Draft 2 of Ps 100 from the v1 readers (critic/v1.*). Run from the repo root."""
import json

p = 'research/psalterium/ps100/prayed.json'
d = json.load(open(p, encoding='utf-8'))
d['version'] = 2
d['status'] = 'reviewed'
v = d['verses']
v['100:2'] = 'Entoarei salmos e {intellegam} no caminho imaculado, * {quando}'
v['100:7'] = 'Não habitará no meio da minha casa quem {facit}: * quem fala coisas iníquas {direxit} à vista dos meus olhos.'

dec = {x['id']: x for x in d['decisions']}

o = dec['oculi']
o['why'] += (" v2: the stylist heard 'estavam nos fiéis' as eyes put 'in' people and asked 'postos' — taken: a participle that belongs to the copula, the idiom for eyes set on someone, nothing of meaning added. "
             "His 'para que se sentassem' refused: two syllables more on the longest colon of the psalm, and the blind reader heard 'para se sentarem' rightly. "
             "The Latinist (minor) would keep the clause tenseless ('Os meus olhos, sobre os fiéis da terra'); the copula is allowed, as he says, and the second colon's 'ministrábat' is past, so the past stands — the tenseless forms are options.")
o['options'] = [
    {'label': 'Os meus olhos estavam postos nos fiéis da terra, para se sentarem comigo', 'forms': {'oculi': 'Os meus olhos estavam postos nos fiéis da terra, para se sentarem comigo'}, 'note': "v2 — the stylist's 'postos'; past copula as DRB", 'from': 'stylist'},
    {'label': 'Os meus olhos estavam nos fiéis da terra, para se sentarem comigo', 'forms': {'oculi': 'Os meus olhos estavam nos fiéis da terra, para se sentarem comigo'}, 'note': 'draft 1', 'from': 'draft'},
    {'label': 'Os meus olhos, sobre os fiéis da terra, para se sentarem comigo', 'forms': {'oculi': 'Os meus olhos, sobre os fiéis da terra, para se sentarem comigo'}, 'note': "the Latinist's: verbless and tenseless, as the Latin", 'from': 'latinist'},
    {'label': 'Os meus olhos postos nos fiéis da terra, para se sentarem comigo', 'forms': {'oculi': 'Os meus olhos postos nos fiéis da terra, para se sentarem comigo'}, 'note': 'tenseless with the participle; reads as a fragment'},
    {'label': 'Os meus olhos estavam postos nos fiéis da terra, para que se sentassem comigo', 'forms': {'oculi': 'Os meus olhos estavam postos nos fiéis da terra, para que se sentassem comigo'}, 'note': "the stylist's whole line; +2 syllables", 'from': 'stylist'},
    {'label': 'Os meus olhos estão nos fiéis da terra, para que se sentem comigo', 'forms': {'oculi': 'Os meus olhos estão nos fiéis da terra, para que se sentem comigo'}, 'note': "present, as 'sédeant' suggests; the tense then changes inside the verse"},
    {'label': 'Os meus olhos buscavam os fiéis da terra, para que se sentassem comigo', 'forms': {'oculi': 'Os meus olhos buscavam os fiéis da terra, para que se sentassem comigo'}, 'note': 'MS1932 — supplies a verb the Latin lacks', 'from': 'MS1932', 'warn': True},
]

r = dec['direxit']
r['why'] += (" v2: the stylist heard 'seguir reto' as a street direction and asked 'não andou reto' — refused: 'andar' is ambuláre's verb, and ambuláre stands in the verse before ('quem andava no caminho imaculado'), so two Latin verbs would sound as one; 58:5 has 'segui reto' for the same Latin. His line is an option.")
r['options'].insert(1, {'label': 'não andou reto', 'forms': {'direxit': 'não andou reto'}, 'note': "stylist — the natural idiom; merges with ambuláre → andar (100:6)", 'from': 'stylist'})

f = dec['facientes']
f['why'] += " v2: the stylist asked 'praticavam' — refused: 'praticar' is operári's verb (100:8 'os que praticam a iniquidade'), and the Latin has fácere here. Option."
f['options'].append({'label': 'os que praticavam transgressões', 'forms': {'facientes': 'os que praticavam transgressões'}, 'note': "stylist; praticar is operári's", 'from': 'stylist'})

new = {
    'id': 'facit', 'refs': ['100:7'], 'latin': 'qui facit supérbiam', 'kind': 'glossary',
    'why': "The glossary row fácere supérbiam → 'agir com soberba' (30:24, the stylist's there, for MS1932's 'procedem com soberba'). The Latinist (minor) reads soberba as the thing done, not the manner, and asks 'pratica a soberba' — but 'praticar' is operári's verb (100:8), and the row keeps the two psalms alike. 'faz soberba' is the calque. Held; his readings are options.",
    'options': [
        {'label': 'age com soberba', 'forms': {'facit': 'age com soberba'}, 'note': 'draft — the row, = 30:24', 'from': 'glossary'},
        {'label': 'pratica a soberba', 'forms': {'facit': 'pratica a soberba'}, 'note': "latinist — soberba as object; spends operári's verb", 'from': 'latinist'},
        {'label': 'faz soberba', 'forms': {'facit': 'faz soberba'}, 'note': 'the calque', 'from': 'latinist'},
    ],
}
d['decisions'].insert(d['decisions'].index(r), new)

d['choices']['100:2'] += " v2: the comma after 'salmos' removed at the stylist's request, so the colon is said in one run (the two verbs are one sentence)."
d['choices']['100:6'] += " The ambiguity reader heard 'esse me servia' also as colloquial 'that one suited me'; the servant sense came first, and the second colon's 'hic mihi ministrábat' is plain enough in context — kept."
d['choices']['100:7'] += " The ambiguity reader found the switch from 'habitará' to the past 'seguiu' confusing: it is the Latin's (habitábit / diréxit), kept."

d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. No major; two minors, both held as options.', 'outcomes': [
        {'verse': '100:6', 'remark': "supplied 'estavam' fixes a past the verbless Latin leaves open", 'outcome': 'option', 'decision': 'oculi', 'reason': "The copula is allowed (he says so); the second colon is past; his tenseless line is an option."},
        {'verse': '100:7', 'remark': "'age com soberba' makes soberba manner, not object; 'pratica a soberba'", 'outcome': 'option', 'decision': 'facit', 'reason': "Glossary row fácere supérbiam (30:24); 'praticar' is operári's (100:8)."},
    ]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': 'claude-opus-5-5, fresh context, with latin.json. Four remarks: one taken, one taken in part, two refused as options. Best line 100:5, worst 100:7.', 'outcomes': [
        {'verse': '100:2', 'remark': "comma before 'e entenderei' breaks the colon", 'outcome': 'taken'},
        {'verse': '100:6', 'remark': "'estavam nos fiéis' odd, 'para se sentarem' heavy: 'estavam postos … para que se sentassem'", 'outcome': 'taken', 'decision': 'oculi', 'reason': "'postos' taken; 'para que se sentassem' refused for length (option) — the blind reader heard the infinitive rightly."},
        {'verse': '100:7', 'remark': "'seguiu reto' a street direction; 'não andou reto'", 'outcome': 'option', 'decision': 'direxit', 'reason': "'andar' is ambuláre's verb in 100:6; 58:5 'segui reto' for the same Latin."},
        {'verse': '100:3', 'remark': "'cometiam transgressões' legal and heavy; 'praticavam'", 'outcome': 'option', 'decision': 'facientes', 'reason': "'praticar' is operári's verb (100:8)."},
    ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': "claude-opus-5-5, fresh context, Portuguese only. Heard every verse in the Latin's sense first. Noted: 'juízo' may be 'good sense' (likely heard as judgment — kept, D15); 'entenderei no caminho' unusual (the Latin's; kept, decision intellegam); 'esse me servia' also 'suited me' (kept); tense switch in 100:7 (the Latin's). Unknown: vierdes, imaculado, transgressões, difamava, soberbo, iníquas, soberba, iniquidade — all glossary words or forced by vós; none changed.", 'outcomes': [
        {'verse': '100:1', 'remark': "'juízo' may be heard as good sense", 'outcome': 'refused', 'decision': 'judicium', 'reason': 'Likely heard as judgment; D15.'},
        {'verse': '100:2', 'remark': "'entenderei no caminho' unusual", 'outcome': 'refused', 'decision': 'intellegam', 'reason': "The Latin's own oddity (intéllegam in via); 'terei entendimento' is the option."},
        {'verse': '100:6', 'remark': "'esse me servia' may be 'suited me'", 'outcome': 'refused', 'reason': 'Servant sense heard first; DRB/MS1932 wording.'},
        {'verse': '100:7', 'remark': 'future → past switch confusing', 'outcome': 'refused', 'reason': "The Latin's tenses (habitábit / diréxit)."},
    ]},
    {'step': 'revision', 'version': 2, 'note': "v2: 100:2 comma removed (stylist); 100:6 'estavam postos nos fiéis' (stylist); new decision 'facit' makes the row's 'age com soberba' explicit against the Latinist's 'pratica a soberba'. Draft 1 kept as prayed.v1.json."},
]
json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(p, 'a', encoding='utf-8').write('\n')
