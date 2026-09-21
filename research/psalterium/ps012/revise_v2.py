"""Ps 12 draft 1 -> draft 2, after the three v1 critics. python3.13 research/psalterium/ps012/revise_v2.py
Reads prayed.v1.json (never prayed.json), so it is safe to re-run."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v1.json').read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}


def option(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


data['version'] = 2

# 12:2 — the stylist's 'hei de pôr', and 'e' so that the zeugma is heard
data['verses']['12:2'] = '{quamdiu} {consilia}, * {zeugma} no meu coração {perdiem}?'
d = decisions['consilia']
d['why'] += ' The stylist (draft 1; his worst line): ‘“Porei conselhos” soa como uma construção transportada do latim. A imagem precisa ficar, mas “hei de pôr” dá à pergunta um movimento mais natural de queixa’. The blind reader heard ‘porei conselhos na minha alma’ first as ‘guardarei dentro de mim conselhos recebidos’ (second: ‘procurarei orientação’), and took the second colon first as ‘enquanto houver dor no coração’ — the zeugma (one verb for both objects) was not heard.'
d['options'][0]['note'] = 'Draft 1: the Latin’s future to the letter. The stylist found it carried over from the Latin.'
d['options'][0]['from'] = 'draft'
d['options'].insert(0, option('hei de pôr conselhos na minha alma', {'consilia': 'hei de pôr conselhos na minha alma'}, 'Ruling (draft 2), the stylist’s: ‘haver de’ is Portuguese’s future of what one is bound to do — exactly the deliberative sense ponam can have (‘how long am I to set …?’) — and the image stays. The glossary noun is kept: the blind reader’s first hearing (advice received and kept) is not far from the Latin’s range, and ‘pôr’ makes the soul the one that sets them.', 'stylist'))
d['options'].append(option('hei de pôr planos na minha alma', {'consilia': 'hei de pôr planos na minha alma'}, 'Matos Soares 1932’s sense (‘projectos’): the soul’s own schemes, which ‘conselhos’ may not say to every ear; leaves the glossary word.', 'MS1932'))
data['decisions'].insert(data['decisions'].index(d) + 1, {
    'id': 'zeugma',
    'refs': ['12:2'],
    'latin': 'ponam consília in ánima mea, * dolórem in corde meo',
    'kind': 'grammar',
    'why': 'The Latin (and the Greek) join the two objects of ‘ponam’ without a conjunction: counsels in my soul, sorrow in my heart. The blind reader (draft 1) did not hear ‘dor’ as a second object of the verb, and took the colon as ‘enquanto houver dor no coração’.',
    'options': [
        option('e dor', {'zeugma': 'e dor'}, 'Ruling (draft 2): ‘e’ supplied so that ‘dor’ is heard as the second thing set, as the Latin’s accusative ‘dolórem’ shows it to be; a conjunction for a case ending — grammar (D2). Matos Soares 1932 has ‘e (terei) cada dia a dor’.', 'ambiguity'),
        option('dor', {'zeugma': 'dor'}, 'Draft 1: the Latin’s asyndeton. Heard by the blind reader as ‘while there is sorrow’.', 'draft'),
    ],
})

# 12:6b — 'bens' heard as property
d = decisions['tribuit']
d['why'] += ' The stylist (draft 1): ‘“Concedeu bens” tem uma secura administrativa e sugere sobretudo patrimônio’ → ‘que me deu coisas boas’. The blind reader heard ‘me concedeu bens’ first as ‘deu-me posses ou recursos materiais’.'
d['options'][0]['note'] = 'Draft 1. ‘Bens’ was heard by the blind reader as property first; the stylist found ‘concedeu bens’ administrative.'
d['options'][0]['from'] = 'draft'
good = next(o for o in d['options'] if o['label'] == 'que me deu coisas boas')
d['options'].remove(good)
good['note'] = 'Ruling (draft 2), the stylist’s: ‘coisas boas’ is bona as a hearer takes it (good things of any kind — which is what the Greek εὐεργετήσαντι, ‘who did me good’, says too), and ‘dar’ is the plain verb; tríbuere and dare never meet in a verse (15:7 qui tríbuit mihi intelléctum will read ‘que me deu entendimento’). The colon ends on a paroxytone.'
good['from'] = 'stylist'
d['options'].insert(0, good)

data['choices']['12:2'] = 'The Latin’s question mark kept. ‘dor’ (dolor, glossary) is the second object of ‘hei de pôr’, as dolórem of ponam; ‘e’ supplied (decision zeugma).'
data['choices']['12:5b'] += ' The blind reader listed ‘atribulam’ as unknown (as in Ps 3); kept (glossary).'

decisions['infinem']['options'][0]['note'] += ' Heard: the blind reader took the question as ‘O Senhor me esqueceu definitivamente?’ first — the Latin’s ‘utterly’.'
decisions['obdormiam']['options'][0]['note'] += ' Heard: ‘morra fisicamente’ first, spiritual death second — as the Latin.'
decisions['exaltabitur']['options'][0]['note'] += ' Heard: the enemy vaunting himself over me first, prevailing second.'

data['audit'] += [
    {
        'step': 'checks',
        'note': 'Draft 1: hard pass. Soft flags, accepted: 12:3 second colon −4 (the Latin’s vocative ‘Dómine, Deus meus’ is two words in Portuguese); 12:5b +3 / −3 (‘os que me atribulam’; ‘mas eu’); 12:6b last colon +5 — the Ps 7:18b colon copied word for word (D25), whose length was accepted there. Every cadence is oxytone or paroxytone; no rhyme flag.',
    },
    {
        'step': 'latinist',
        'file': 'critic/v1.latinist.json',
        'note': 'Draft 1: clean — ‘Não encontrei falhas de adequação: a tradução preserva os sentidos, as imagens e as relações gramaticais do latim. Todos os versículos mantêm as mesmas marcas de divisão, na mesma ordem.’ Passed without remark: ‘Até quando’ four times (quámdiu merged), ‘para sempre’ for in finem, ‘desviais de mim a vossa face’, ‘porei conselhos’, ‘durante o dia’, ‘se exaltará’, bare ‘olhai’, ‘adormeça’, ‘se eu for abalado’, the copied 7:18b colon.',
        'outcomes': [],
    },
    {
        'step': 'stylist',
        'file': 'critic/v1.stylist.json',
        'note': 'Draft 1. Two verses; best 12:3, worst 12:2. ‘O salmo tem sobriedade e uma insistência orante bem sustentada pelos repetidos “Até quando”. As terminações atendem à cadência pedida, sem rimas salientes.’ Both taken.',
        'outcomes': [
            {'verse': '12:2', 'remark': '‘porei conselhos’ sounds carried over from the Latin → ‘Até quando hei de pôr conselhos na minha alma’', 'outcome': 'taken', 'decision': 'consilia', 'reason': 'A periphrastic future for the future (or deliberative subjunctive) ponam: how it is said, not what (D2); the image stays.'},
            {'verse': '12:6b', 'remark': '‘concedeu bens’ is administrative and suggests property → ‘que me deu coisas boas’', 'outcome': 'taken', 'decision': 'tribuit', 'reason': 'The blind reader heard property too; ‘coisas boas’ is bona.'},
        ],
    },
    {
        'step': 'ambiguity',
        'file': 'critic/v1.ambiguity.json',
        'note': 'Draft 1, Portuguese only. Eleven items, one unknown word (atribulam). Two real faults, both mended in draft 2: 12:2 the zeugma not heard (‘enquanto houver dor’), 12:6b ‘bens’ heard as property. The rest is the Latin’s own range.',
        'outcomes': [
            {'verse': '12:1', 'remark': '‘me esquecereis para sempre?’: how long will it last / forgotten me for good (heard first)', 'outcome': 'refused', 'decision': 'infinem', 'reason': 'Both in ‘in finem’.'},
            {'verse': '12:1', 'remark': '‘desviais de mim a vossa face’: turn the face / withdraw attention and help (heard first)', 'outcome': 'refused', 'decision': 'avertis', 'reason': 'The Latin’s figure holds both.'},
            {'verse': '12:2', 'remark': '‘porei conselhos na minha alma’: keep advice received (heard first) / seek guidance within', 'outcome': 'refused', 'decision': 'consilia', 'reason': 'Kept (glossary noun) under the stylist’s ‘hei de pôr’; ‘planos’ added as an option.'},
            {'verse': '12:2', 'remark': '‘… na minha alma, dor no meu coração’: set both / while there is sorrow (heard first)', 'outcome': 'taken', 'decision': 'zeugma', 'reason': 'A misparse the Latin’s accusative excludes; ‘e’ supplied.'},
            {'verse': '12:3', 'remark': '‘se exaltará sobre mim’: vaunt himself (heard first) / prevail', 'outcome': 'refused', 'decision': 'exaltabitur', 'reason': 'exaltábitur holds both.'},
            {'verse': '12:4b', 'remark': '‘Iluminai os meus olhos’: give light or strength to the eyes / make me see spiritually (heard first)', 'outcome': 'refused', 'reason': 'The Latin’s image, as open.'},
            {'verse': '12:4b', 'remark': '‘adormeça na morte’: die (heard first) / spiritual death', 'outcome': 'refused', 'decision': 'obdormiam', 'reason': 'As open.'},
            {'verse': '12:5b', 'remark': '‘se eu for abalado’: shaken in spirit (heard first) / defeated', 'outcome': 'refused', 'decision': 'motus', 'reason': 'movéri holds both.'},
            {'verse': '12:5b', 'remark': '‘esperei na vossa misericórdia’: trusted (heard first) / waited', 'outcome': 'refused', 'reason': 'speráre in → esperar em (glossary), heard as trust.'},
            {'verse': '12:6b', 'remark': '‘na vossa salvação’: deliverance / spiritual salvation (heard first)', 'outcome': 'refused', 'reason': 'D6; salutáre holds both.'},
            {'verse': '12:6b', 'remark': '‘me concedeu bens’: possessions (heard first) / good things', 'outcome': 'taken', 'decision': 'tribuit', 'reason': '‘coisas boas’.'},
            {'verse': '12:5b', 'remark': 'unknown word: atribulam', 'outcome': 'refused', 'reason': 'Glossary (tribuláre → atribular, Ps 3:2), listed as unknown there too.'},
        ],
    },
    {
        'step': 'revision',
        'version': 2,
        'note': 'v2. Two verses changed against draft 1: 12:2 ‘Até quando hei de pôr conselhos na minha alma, * e dor no meu coração durante o dia?’ (the stylist’s ‘hei de pôr’; ‘e’ for the zeugma the blind reader missed); 12:6b ‘cantarei ao Senhor, que me deu coisas boas’ (the stylist’s; ‘bens’ was heard as property). Draft 1 is prayed.v1.json (flat text prayed.v1.vos.json, the file the three v1 critics read).',
    },
]

(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
