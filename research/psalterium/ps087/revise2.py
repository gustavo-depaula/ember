"""Ps 87 draft 2 from draft 1 + the three v1 readers. Run once from repo root."""
import json

P = 'research/psalterium/ps087/prayed.json'
d = json.load(open(P, encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}


def promote(did, label, note=None, new=None, why_add=None):
    """Put option `label` first (creating it from `new` if absent)."""
    x = dec[did]
    opts = x['options']
    hit = [o for o in opts if o['label'] == label]
    if hit:
        o = hit[0]
        opts.remove(o)
    else:
        o = new
    if note:
        o['note'] = note
    opts.insert(0, o)
    if why_add:
        x['why'] += ' ' + why_add


def demote_note(did, label, note):
    for o in dec[did]['options']:
        if o['label'] == label:
            o['note'] = note


# 87:3 — stylist + ambiguity: bare 'Entre' heard as 'between'
promote('intret', 'Que entre na vossa presença',
        new={'label': 'Que entre na vossa presença', 'forms': {'intret': 'Que entre na vossa presença'}, 'from': 'stylist'},
        note='Ruling (v2): the stylist’s. “Que” marks the jussive, so the first word cannot be heard as the preposition “entre” (the ambiguity reader heard it that way too). Grammar only (D2); the verb stays intróire’s.',
        why_add='v2: the stylist and the ambiguity reader both heard the bare “Entre” at the head as “between”, so “Que” is supplied. Unlike 78:10b, the verb “entrar” is kept.')
demote_note('intret', 'Entre na vossa presença', 'Draft 1: as 118:170, but the bare subjunctive at the head of the verse was heard as the preposition.')

# 87:5 — Latinist + stylist: 'contado'; 'tido' unknown to the ambiguity reader
d['verses']['87:5'] = 'Fui {cum} os que descem à cova: * tornei-me como um homem sem auxílio, {liber}.'
x = dec['cum']
x['latin'] = 'Æstimátus sum cum descendéntibus in lacum'
x['kind'] = 'word'
x['why'] = ('æstimári (προσελογίσθην, “reckoned”): D43 gave “ser tido” for being regarded as something (43:22b “fomos tidos como ovelhas”). '
            'Here it means being counted in a company, and both the Latinist and the stylist asked for “contado”. The ambiguity reader did not know “tido”. '
            'So here “contar” is used, and D43’s row stands where the sense is “regarded as”. descendéntibus in lacum → “os que descem à cova” (lacus row). '
            'The preposition: cum is “with”. The Latinist asked for “com”, the stylist for “entre”. “Contado entre” is how Portuguese says it (MS1932 “contado entre”), and a preposition is grammar (D2). '
            'Cost: inter in the second colon is also “entre”.')
x['options'] = [
    {'label': 'contado entre', 'forms': {'cum': 'contado entre'}, 'note': 'Ruling (v2): the stylist’s line; the Latinist’s verb.', 'from': 'stylist'},
    {'label': 'contado com', 'forms': {'cum': 'contado com'}, 'note': 'The Latinist (minor): keeps cum. Portuguese says “contado entre” for a company; kept as an option.', 'from': 'latinist'},
    {'label': 'tido entre', 'forms': {'cum': 'tido entre'}, 'note': 'Draft 1: D43’s “ser tido”. “tido” was unknown to the ambiguity reader, and the stylist found it stiff.', 'from': 'draft'},
]

# 87:9 — stylist: trailing 'para si'
promote('abominationem', 'para eles me puseram como abominação',
        new={'label': 'para eles me puseram como abominação', 'forms': {'abominationem': 'para eles me puseram como abominação'}, 'from': 'stylist'},
        note='Ruling (v2): the stylist’s order. The verb of 87:7 is kept and the colon ends on the noun. “para eles” for the reflexive sibi: the subject is plural and named in the verb, so nothing is lost.',
        why_add='v2: the stylist named 87:9 the worst line because the trailing “para si” was a calque that fell flat at the final. The ambiguity reader also heard “para si” as possibly someone else. His order is taken; it is order and grammar only (D2).')
demote_note('abominationem', 'puseram-me por abominação para si', 'Draft 1. The trailing “para si” was refused by the stylist (worst line) and was unclear to the ambiguity reader.')

# 87:9b — stylist + ambiguity: 'carência' heard as emotional need
promote('languerunt', 'se enfraqueceram de penúria',
        new={'label': 'se enfraqueceram de penúria', 'forms': {'languerunt': 'se enfraqueceram de penúria'}, 'from': 'stylist'},
        note='Ruling (v2): infirmári’s verb (one Greek, D15), with the stylist’s noun. “penúria” is want of necessities, with no emotional sense, and has no other Latin word in the psalter that it belongs to.',
        why_add='v2: the stylist and the ambiguity reader both heard “carência” as emotional lack (“carência afetiva”). 43:24 kept it, and D38’s “carente” passed. But as a bare noun at a cadence it failed two readers, so “penúria” is taken and proposed for inópia in the glossary (open). The stylist’s verb “definharam” is refused: the Greek is infirmári’s. It stays an option.')
demote_note('languerunt', 'se enfraqueceram de carência', 'Draft 1: inópia’s row (43:24). Heard as emotional need by the stylist and the ambiguity reader.')
demote_note('languerunt', 'definharam de carência', 'A verb of its own for languére; the stylist proposed “definharam de penúria”. Refused: the Greek ἠσθένησαν is infirmári’s, so D15 gives “enfraquecer”.')

# 87:12 — stylist: 'contará' — refused
x = dec['perditione']
x['why'] += ' v2: the ambiguity reader heard “perdição” as damnation, which was the expected cost. It is kept: the parallel with “sepulcro” points to the place of ruin, and “destruição” is intéritus’s word.'
d['decisions'].append({
    'id': 'narrabit', 'refs': ['87:12'], 'latin': 'Numquid narrábit áliquis in sepúlcro', 'kind': 'glossary',
    'why': 'The stylist asked for “contará” instead of “narrará”, because of the run of r-a sounds and because “narrar” is the more literary verb. narráre → “narrar” is a working row (18:2, 21:23, 117:17), and 18:2 is the stylist’s own best line with it. Refused, so the verb stays one across the psalter. His word is an option.',
    'options': [
        {'label': 'narrará', 'forms': {'narrabit': 'narrará'}, 'note': 'Ruling: the narráre row.', 'from': 'glossary'},
        {'label': 'contará', 'forms': {'narrabit': 'contará'}, 'note': 'The stylist’s: plainer, and no r-a run. Refused for the row.', 'from': 'stylist'},
    ]})
d['verses']['87:12'] = 'Acaso alguém {narrabit} no sepulcro a vossa misericórdia, * e a vossa verdade {perditione}?'

# 87:14 — stylist: 'vos precederá'
promote('praeveniet', 'vos precederá',
        note='Ruling (v2): the stylist’s, as 58:10’s stylist also asked. Two stylists refused “se adiantar a” with a friendly object, and the ambiguity reader was puzzled by it. “preceder” says præveníre’s “come before” exactly. Proposed in the glossary for the friendly places (58:10 should follow).',
        why_add='v2: the stylist called “se adiantará a vós” unidiomatic, and the ambiguity reader heard “outrun you” among the readings. 58:10 had the same refusal. The row is open for the friendly places, so this psalm rules for “preceder” and proposes it. The hostile use (17:19 “surpreender”) and God forestalling the enemy (16:13 “adiantai-vos a ele”) are not touched. Cost: præcédere (96:3) will need another word.')
demote_note('praeveniet', 'se adiantará a vós', 'Draft 1: the row’s verb (16:13, 20:4, 58:10). Refused by the stylist here and at 58:10.')

# 87:16 — stylist: supply 'estou'
d['verses']['87:16'] = 'Eu sou pobre, {labor} desde a minha juventude: * {exaltatus} fui humilhado e perturbado.'
d['decisions'].append({
    'id': 'labor', 'refs': ['87:16'], 'latin': 'et in labóribus a juventúte mea', 'kind': 'grammar',
    'why': 'The Latin colon has no verb, and the stylist heard “e em fadigas” as a hiatus and as truncated. A copula is supplied (D2 allows it). “estou” keeps the present of “sum”. labor → “fadiga” (row), plural as in the Latin.',
    'options': [
        {'label': 'e estou em fadigas', 'forms': {'labor': 'e estou em fadigas'}, 'note': 'Ruling (v2): the stylist’s copula.', 'from': 'stylist'},
        {'label': 'e em fadigas', 'forms': {'labor': 'e em fadigas'}, 'note': 'Draft 1: verbless, as the Latin: “e em fadigas”.', 'from': 'draft'},
        {'label': 'e vivo em fadigas', 'forms': {'labor': 'e vivo em fadigas'}, 'note': 'MS1932: supplies a fuller verb.', 'from': 'MS1932'},
    ]})
dec['exaltatus']['why'] += ' v2: the ambiguity reader thought “exaltado” might be heard as “agitated”. Here it stands against “humilhado”, which makes the sense of height plain, so it is kept (exaltáre row).'

# 87:18 — stylist: 'ao mesmo tempo'
promote('simul', 'cercaram-me ao mesmo tempo',
        new={'label': 'cercaram-me ao mesmo tempo', 'forms': {'simul': 'cercaram-me ao mesmo tempo'}, 'from': 'stylist'},
        note='Ruling (v2): the stylist’s. It is one of the simul row’s listed options. It carries the final cadence, and it does not give the unnamed subject a gender (the Latin does not either).',
        why_add='v2: the stylist found “cercaram-me juntos” too clipped for the final, and noted that the masculine “juntos” quietly fixes the subject. The repetition “Cercaram-me … cercaram-me” is unchanged.')

# 87:19 — stylist 'pela', Latinist 'da'
promote('amiseria', 'pela miséria',
        note='Ruling (v2): the stylist’s. It is shorter, and more open than “por causa da” (cause, or the means by which), so it goes part of the way to the Latinist’s wish to keep the Latin’s openness.',
        why_add='v2: the stylist found “por causa da” prosaic at the close of the psalm; the Latinist (minor) asked for bare “da miséria”, to keep it open. Bare “da” is heard as a genitive (“my acquaintances of misery”), a sense the Latin does not have, so it stays refused. “pela” is the middle way.')
demote_note('amiseria', 'por causa da miséria', 'Draft 1: DRB, MS1932. The stylist found it heavy at the psalm’s close.')
demote_note('amiseria', 'da miséria', 'The Latinist (minor): as bare as the Latin. Refused, because Portuguese hears a genitive.')

d['version'] = 2
d['choices']['87:5'] = 'The ambiguity reader heard “livre entre os mortos” as puzzling, perhaps positive. That is the crux the Latin itself poses (decision liber); kept.'
d['choices']['87:9'] = 'The ambiguity reader noted that “Pusestes … puseram” could blur the change of subject. The Latin changes subject too (fecísti / posuérunt); in v2 the second verb moves to mid-colon.'

outcomes_lat = [
    {'verse': '87:5', 'remark': '“tido entre” → “contado com” (cum)', 'outcome': 'taken', 'reason': 'The verb “contado” is taken. The preposition “com” is refused for “entre” (grammar, D2) and kept as an option.', 'decision': 'cum'},
    {'verse': '87:19', 'remark': '“por causa da” closes the open a miséria; asks “da miséria”', 'outcome': 'option', 'decision': 'amiseria', 'reason': 'Bare “da” is heard as a genitive. “pela miséria” (the stylist’s) is taken as the more open middle way.'},
]
outcomes_sty = [
    {'verse': '87:3', 'remark': 'bare “Entre” heard as “between”', 'outcome': 'taken', 'decision': 'intret'},
    {'verse': '87:5', 'remark': '“Fui tido” stiff → “contado”', 'outcome': 'taken', 'decision': 'cum'},
    {'verse': '87:9', 'remark': 'trailing “para si” a calque (worst line)', 'outcome': 'taken', 'decision': 'abominationem'},
    {'verse': '87:9b', 'remark': '“carência” clinical/affective; “definharam de penúria”', 'outcome': 'taken', 'decision': 'languerunt', 'reason': 'The noun “penúria” is taken. The verb “definharam” is refused (the Greek is infirmári’s; D15) and kept as an option.'},
    {'verse': '87:12', 'remark': '“narrará no” stumbles → “contará”', 'outcome': 'option', 'decision': 'narrabit', 'reason': 'narráre → narrar is a working row (18:2, 21:23), so the verb is kept one across the psalter.'},
    {'verse': '87:14', 'remark': '“se adiantará a vós” unidiomatic → “vos precederá”', 'outcome': 'taken', 'decision': 'praeveniet'},
    {'verse': '87:16', 'remark': '“e em” hiatus, verbless → “e estou em fadigas”', 'outcome': 'taken', 'decision': 'labor'},
    {'verse': '87:18', 'remark': '“cercaram-me juntos” clipped, fixes gender → “ao mesmo tempo”', 'outcome': 'taken', 'decision': 'simul'},
    {'verse': '87:19', 'remark': '“por causa da” prosaic → “pela miséria”', 'outcome': 'taken', 'decision': 'amiseria'},
]
outcomes_amb = [
    {'verse': '87:3', 'remark': '“Entre” may be heard as “between”', 'outcome': 'taken', 'decision': 'intret'},
    {'verse': '87:4', 'remark': '“inferno” heard as hell of the damned', 'outcome': 'refused', 'decision': 'inferno', 'reason': 'The inférnus row’s known cost; for Gustavo with the row.'},
    {'verse': '87:5', 'remark': '“tido” unknown', 'outcome': 'taken', 'decision': 'cum'},
    {'verse': '87:5', 'remark': '“livre entre os mortos” puzzling / heard positively', 'outcome': 'refused', 'decision': 'liber', 'reason': 'This is the Latin’s own crux. “abandonado” would interpret it (rule 2).'},
    {'verse': '87:9', 'remark': '“para si” unclear; the change of subject may be missed', 'outcome': 'taken', 'decision': 'abominationem'},
    {'verse': '87:9b', 'remark': '“carência” heard as emotional lack', 'outcome': 'taken', 'decision': 'languerunt'},
    {'verse': '87:12', 'remark': '“perdição” heard as damnation', 'outcome': 'refused', 'decision': 'perditione', 'reason': 'The cognate is kept: “destruição” is intéritus’s word, and the parallel with “sepulcro” gives the sense of place.'},
    {'verse': '87:14', 'remark': '“se adiantará a vós” puzzling (“outrun”)', 'outcome': 'taken', 'decision': 'praeveniet'},
    {'verse': '87:16', 'remark': '“exaltado” may be heard as “agitated”', 'outcome': 'refused', 'decision': 'exaltatus', 'reason': 'The contrast with “humilhado” makes the height plain; exaltáre row.'},
    {'verse': '87:7', 'remark': '“tenebrosos” unknown', 'outcome': 'refused', 'decision': 'tenebrosis', 'reason': 'The Latin’s adjective. “nas trevas” would merge it with ténebræ (87:13).'},
    {'verse': '87:9', 'remark': '“abominação” unknown', 'outcome': 'refused', 'reason': 'The Latin’s word (the abominári row, 5:7b); no plainer word keeps it.'},
]
d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': 'Claude Opus 5.5, fresh context, with latin.json. 2 minor, no major. 87:5 verb taken, preposition kept “entre”; 87:19 answered with “pela” rather than bare “da”.', 'outcomes': outcomes_lat},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': 'Claude Opus 5.5, fresh context, with latin.json. 9 remarks; 8 taken in whole or part, 1 kept as an option (87:12 “contará”). Worst line 87:9, best 87:13.', 'outcomes': outcomes_sty},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': 'Claude Opus 5.5, fresh context, Portuguese only. 26 readings and 3 unknown words. The main hearings are right. Taken where they coincide with a stylist remark (87:3, 87:5 “tido”, 87:9, 87:9b, 87:14). Held on inferno, livre, perdição, exaltado, tenebrosos and abominação, with reasons.', 'outcomes': outcomes_amb},
    {'step': 'revision', 'version': 2, 'note': 'v2 changes: 87:3 “Que entre”; 87:5 “Fui contado entre”; 87:9 “para eles me puseram como abominação”; 87:9b “de penúria”; 87:14 “vos precederá”; 87:16 “e estou em fadigas”; 87:18 “cercaram-me ao mesmo tempo”; 87:19 “pela miséria”. Draft 1 kept as prayed.v1.json.'},
]
json.dump(d, open(P, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ok')
