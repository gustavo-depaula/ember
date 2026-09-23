"""Revise ps113/prayed.json to v2 after the v1 readers. Run once from the repo root."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent.parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
assert d['version'] == 1
V = d['verses']
dec = {x['id']: x for x in d['decisions']}


def opt(label, forms, note, frm):
    return {'label': label, 'forms': forms, 'note': note, 'from': frm}


# 113:8 — a relative opening the verse needs a head (stylist, ambiguity)
V['113:8'] = 'Aquele que converteu a rocha em lagoas de água, * e o {rupem} em fontes de água.'
d['choices']['113:8'] = d['choices']['113:8'].replace(
    "'Que' opens the verse for the Latin relative Qui (as 104:9 'Que').",
    "v2: 'Aquele que' opens the verse for the Latin relative Qui (stylist; the ambiguity reader heard a bare 'Que' as 'What…?'). The antecedent is the Deus Jacob of 113:7; 'Aquele' is the pronoun Portuguese needs to hang a relative on at the head of a line (grammar, D2).")

# 113:14 — nares is plural (latinist)
V['113:14'] = 'Têm ouvidos, e não {aud}: * têm {nares}, e não {odo}.'
dec_nares = {
    'id': 'nares', 'refs': ['113:14'], 'latin': 'nares habent, et non odorábunt', 'kind': 'word',
    'why': "nares is plural, 'nostrils' (μυκτῆρας). The list keeps the Latin's number everywhere else (boca for os; olhos, ouvidos, mãos, pés), so 'narinas' keeps it here. 'nariz' is the plainer body noun but changes the number; MS1932 'narizes' keeps a plural but means noses. The v1 'nariz' was DM1962's word.",
    'options': [
        opt('narinas', {'nares': 'narinas'}, "Ruling (v2, latinist): the Latin's number and word.", 'latinist'),
        opt('nariz', {'nares': 'nariz'}, 'v1: the plain body noun, DM1962; singular.', 'v1'),
        opt('narizes', {'nares': 'narizes'}, 'MS1932: plural, but many noses.', 'MS1932'),
    ],
}
d['choices']['113:14'] = "aures → ouvidos. nares → narinas (decision nares)."

# 113:16 — 'os que os' stutter (stylist)
V['113:16'] = '{fiant} semelhantes a eles aqueles que os fazem: * e todos os que confiam neles.'
d['choices']['113:16'] = "'ea' (the idols, neuter) → 'os'. v2: 'aqueles que os fazem' (stylist) avoids the 'os que os' stutter before the mediant; the Latin 'qui' has no article either way. confídere in → confiar em (row)."
dec['fiant']['options'].append(opt('Sejam … aqueles', {'fiant': 'Sejam'}, "Stylist's full proposal ('Sejam semelhantes a eles aqueles que os fazem'): lighter, loses the becoming and the fiant/fáciunt echo.", 'stylist'))

# 113:17–19 — adjútor as agent (latinist): refused on the row, kept as option
dec['adj']['options'].append(opt('o auxiliador deles e o protetor deles', {'adj': 'ele é o auxiliador deles e o protetor deles'}, "Latinist: the agent noun beside protetor. 'auxiliador' is rare and heavy in Portuguese; the adjútor row (uniform 'auxílio') would have to change across the psalter.", 'latinist'))

# 113:21 — bendizer a todos (stylist)
V['113:21'] = 'Bendisse a todos os que temem o Senhor, * os pequenos com os {maj}.'
d['choices']['113:21'] = "v2: 'Bendisse a todos' (stylist): with 'todos' the direct object takes the preposition in Portuguese (objeto direto preposicionado), so the row (the dative made direct) still holds; bare 'Bendisse todos' sounded clipped."

# 113:22 — sobre (latinist + stylist)
dec['adiciat']['options'].reverse()
dec['adiciat']['options'][0]['note'] = "Ruling (v2, latinist and stylist): the Latin's super, the blessing laid upon; the three-fold repetition kept. 'acrescentar a vós' with no object is not Portuguese."
dec['adiciat']['options'][1]['note'] = "v1, the row's first form; with no object it is not Portuguese (stylist)."
dec['adiciat']['why'] += " v2: both readers asked for 'sobre'; 'acrescentar sobre' keeps the image of something laid upon, and the object stays unsupplied as in the Latin. The adícere row should record 'sobre' for this idiom."
dec['adiciat']['options'].append(opt('Acrescente o Senhor sobre vós', {'adic1': 'sobre vós', 'adic2': 'sobre vós, e sobre os vossos filhos'}, "Stylist's order 'Acrescente o Senhor' (verb first, as the Latin); needs the verse head changed.", 'stylist'))

# 113:23 — indicative as option (latinist)
dec['benedicti']['options'].append(opt('Benditos sois vós', {'benedicti': 'Benditos sois vós'}, "Latinist: the verbless participle read as a statement (LXX εὐλογημένοι ὑμεῖς).", 'latinist'))
dec['benedicti']['why'] += " The latinist would read a statement; kept as an option, since either copula resolves what the Latin leaves open and the wish follows the jussive of 113:22."

# 113:25 — cleft dropped (latinist + stylist)
V['113:25'] = '{mortui}, Senhor: * {neque} que descem ao inferno.'
dec['mortui']['options'] = [
    opt('Não vos louvarão os mortos', {'mortui': 'Não vos louvarão os mortos'}, "Ruling (v2, stylist): 'Não' first, as the Latin's Non, with no cleft scaffolding; the contrast comes, as in the Latin, with 113:26 'Mas nós'.", 'stylist'),
    opt('Não são os mortos que vos louvarão', {'mortui': 'Não são os mortos que vos louvarão'}, 'v1: the cleft; both readers found it added emphasis the Latin does not state.', 'v1'),
    opt('Os mortos não vos louvarão', {'mortui': 'Os mortos não vos louvarão'}, "Latinist's fix; MS1932 and DRB.", 'latinist'),
]
dec['mortui']['why'] += " v2: the latinist and stylist both read the cleft as added emphasis; the stylist's order keeps 'Não' at the head without it."

# 113:12 — simulacra (latinist): row kept, option added
dec_sim = {
    'id': 'simulacra', 'refs': ['113:12'], 'latin': 'Simulácra géntium', 'kind': 'glossary',
    'why': "simulácrum → ídolo is the glossary row (open; LXX εἴδωλα). The latinist asks for 'simulacros', the Latin word's 'likeness'. The Greek behind it is 'idols', the word Portuguese hears as the thing; 'simulacros' is learned and heard as 'fakes'. Ps 134:15 is identical Latin and must copy whichever is ruled.",
    'options': [
        opt('ídolos', {'simulacra': 'ídolos'}, 'Ruling: the row; the Greek εἴδωλα.', 'glossary'),
        opt('simulacros', {'simulacra': 'simulacros'}, "Latinist: the Latin's own word, 'likenesses'.", 'latinist'),
    ],
}
V['113:12'] = 'Os {simulacra} das nações são prata e ouro, * obras das mãos dos homens.'

d['decisions'].extend([dec_sim, dec_nares])
order = ['exitu', 'barbaro', 'sanctificatio', 'potestas', 'exsultare', 'q6', 'rupem', 'super', 'simulacra', 'futures', 'nares', 'fiant', 'adj', 'maj', 'adiciat', 'benedicti', 'mortui', 'neque']
d['decisions'] = sorted(d['decisions'], key=lambda x: order.index(x['id']))

d['choices']['113:2'] += " The ambiguity reader heard 'a sua' / 'o seu' as Judea's and Israel's own; that is the Latin's ejus (God is not yet named), kept by D2."
d['choices']['113:25'] = "te → vos (God is vós); 'Senhor' in the same colon fixes the address after 113:22–23's vós to the people. inférnus → inferno (row, open; the ambiguity reader heard 'hell of the damned', the row's known cost). The Latin comma after omnes is not reproduced."

d['version'] = 2
d['audit'].append({
    'step': 'critics v1',
    'note': 'Latinist, stylist, ambiguity: claude-opus-5-5, fresh context, run by the coordinator (latin.json given to the latinist and stylist). Files critic/v1.latinist.json, critic/v1.stylist.json, critic/v1.ambiguity.json.',
    'outcomes': [
        {'ref': '113:12', 'from': 'latinist (minor)', 'outcome': "refused on the row: simulácrum → ídolo (LXX εἴδωλα); 'simulacros' added as an option (decision simulacra)."},
        {'ref': '113:14', 'from': 'latinist (minor)', 'outcome': "taken: nares plural → 'narinas' (decision nares)."},
        {'ref': '113:17–19', 'from': 'latinist (minor)', 'outcome': "refused on the row: adjútor → auxílio (uniform). 'auxiliador' added as an option (decision adj)."},
        {'ref': '113:22', 'from': 'latinist + stylist', 'outcome': "taken: 'sobre vós: * sobre vós, e sobre os vossos filhos' (decision adiciat re-ruled). The stylist's verb-first order kept as an option."},
        {'ref': '113:23', 'from': 'latinist (minor)', 'outcome': "refused: the wish follows 113:22's jussive; 'Benditos sois vós' added as an option."},
        {'ref': '113:25', 'from': 'latinist + stylist', 'outcome': "taken: the cleft is dropped; the stylist's 'Não vos louvarão os mortos, Senhor' keeps Non at the head (decision mortui re-ruled)."},
        {'ref': '113:1', 'from': 'stylist', 'outcome': "refused: 'bárbaro' and its proparoxytone close are the Latin's own; 'do meio de' would add words. The verb understood from the first colon is the Latin's ellipsis."},
        {'ref': '113:8', 'from': 'stylist + ambiguity', 'outcome': "taken: 'Aquele que converteu'."},
        {'ref': '113:16', 'from': 'stylist', 'outcome': "taken in part: 'aqueles que os fazem'; 'Sejam' refused (keeps the becoming, 48:13), added as an option."},
        {'ref': '113:21', 'from': 'stylist', 'outcome': "taken: 'Bendisse a todos'."},
        {'ref': '113:2', 'from': 'ambiguity', 'outcome': "kept: 'a sua' / 'o seu' may be heard as Judea's / Israel's own; the Latin ejus is equally unnamed (noted in choices)."},
        {'ref': '113:25', 'from': 'ambiguity', 'outcome': "kept: 'inferno' heard as hell of the damned is the open row's known cost; 'vos' is fixed by 'Senhor' in the same colon."},
        {'ref': '113:15, 113:8, 113:2', 'from': 'ambiguity (unknown words)', 'outcome': "kept: 'apalparão', 'penhasco', 'santificação' are standard Portuguese words; 'santificação' is the row, 'penhasco' is needed to keep rupes apart from petra."},
    ],
})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
