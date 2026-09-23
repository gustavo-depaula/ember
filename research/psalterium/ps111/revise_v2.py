"""Ps 111 draft 2: apply the v1 readers' outcomes to prayed.json (prayed.v1.json kept)."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text())
dec = {x['id']: x for x in d['decisions']}

d['version'] = 2

# 111:1 — the preposition back, the delight said natively
v = dec['volet']
v['why'] += (
    ' **v2:** the Latinist (minor) asked for the preposition *in* back; the stylist heard *quererá muito* as colloquial '
    "('will want a lot'), and the ambiguity reader heard 'want or demand a lot' as a second reading. Portuguese *querer* "
    'cannot take *em*, so the preposition and the verb cannot both stay. Ruled for the stylist\'s *se comprazerá* (free in the '
    'psalter; *complacére* is *agradar* / *achar prazer*): it says what *velle in* says here (θέλειν ἐν, DRB \'delight\'), keeps '
    "*in mandátis* first as the Latin has it, and keeps *nimis* as *muito*. Cost: the *velle* row's verb is not heard; a local "
    'rendering for the Hebraism *velle in*, proposed as a glossary row.'
)
v['options'].insert(0, {
    'label': 'nos seus mandamentos muito se comprazerá',
    'forms': {'volet': 'nos seus mandamentos muito se comprazerá'},
    'note': 'Ruling (v2): the stylist\'s words; the preposition kept, as the Latinist asked.',
    'from': 'stylist',
})
v['options'][1]['note'] = 'Draft 1: the *velle* row, the preposition turned into a direct object; heard as colloquial.'
v['options'][1]['from'] = 'draft'
v['options'].append({
    'label': 'nos seus mandamentos quererá muito',
    'forms': {'volet': 'nos seus mandamentos quererá muito'},
    'note': "The Latinist's fix; refused — *querer* has no object here and *quererá muito* alone is 'will want a lot'.",
    'from': 'latinist',
})

# 111:5 — jucúndus of a person
j = dec['jucundus']
j['why'] += (
    " **v2:** the stylist called *Agradável* the vocabulary of small talk (worst line) and the ambiguity reader heard "
    "'pleasant, likeable'. The row's other places are things (judgments, a psaltery, a word); here it is a man, and χρηστός "
    "is 'kind'. *Amável* (the stylist's) is free — *amábilis* never occurs in the psalter (grep) — and says kindness in a "
    'person. A local split proposed for the row: *agradável* of things, *amável* of persons.'
)
j['options'].insert(0, {
    'label': 'Amável é', 'forms': {'jucundus': 'Amável é'},
    'note': 'Ruling (v2): the stylist\'s; χρηστός.', 'from': 'stylist',
})
j['options'][1]['note'] = 'Draft 1: the row; heard as small talk.'
j['options'][1]['from'] = 'draft'

c = dec['commov6']
c['why'] += (
    ' **v2:** the third stylist to refuse the build (after Pss 14, 29); the ambiguity reader heard *never* but noted the '
    "other parse. Held for the row, which only the main session can rule; the refusal is reported there."
)

# 111:7a — order of the adjective
a = dec['auditio']
a['why'] += (
    " **v2:** the stylist asked for *a má notícia* (the adjective's natural place, and no final monosyllable). Order and "
    'article are grammar (D2), and with *temer* the article is heard as generic. Taken.'
)
a['options'] = [a['options'][1], a['options'][0], a['options'][2]]
a['options'][0]['note'] = 'Ruling (v2): the stylist\'s order; the article generic after *temer*.'
a['options'][0]['from'] = 'stylist'
a['options'][1]['note'] = "Draft 1: no article, as the Latin; the adjective after the noun sounds unnatural."

# 111:9 — chifre / em glória: refused, option already there
g = dec['ingloria']
g['why'] += (
    " **v2:** the stylist asked *e o seu chifre será exaltado na glória*, to soften the horn's cuckold overtone. Refused: "
    "the *e* is not in the Latin, and *na glória* narrows *in glória*; the horn stays unexplained as the *cornu* row rules."
)

# 111:10 — the -rá rhyme at mediant and final
d['verses']['111:10'] = 'O pecador verá, e {irascetur}, † {fremet}, e {tabescet}: * {v10c}.'
d['decisions'].append({
    'id': 'v10c', 'refs': ['111:10'], 'latin': 'desidérium peccatórum períbit', 'kind': 'order',
    'why': (
        "Draft 1 ended the mediant and the final on the same stressed future (*definhará … perecerá*) — an accidental rhyme "
        "the Latin does not have (*tabéscet … períbit*), a defect by rule 5; the stylist named it. The verb first, as he "
        'proposed: order only (D2), and the verse closes on *pecadores*, a paroxytone as the Latin\'s *períbit*.'
    ),
    'options': [
        {'label': 'perecerá o desejo dos pecadores', 'forms': {'v10c': 'perecerá o desejo dos pecadores'},
         'note': "Ruling (v2): the stylist's order.", 'from': 'stylist'},
        {'label': 'o desejo dos pecadores perecerá', 'forms': {'v10c': 'o desejo dos pecadores perecerá'},
         'note': "Draft 1: the Latin's order; rhymes with *definhará* at the mediant.", 'from': 'draft'},
    ],
})
f = dec['fremet']
f['why'] += (
    " **v2:** the stylist asked to drop *seus* (a possessive with a body part sounds translated). Refused: the Latin has "
    "*suis*, and 36:12 (the same Greek) reads *rangerá os seus dentes*."
)
f['options'].append({'label': 'rangerá os dentes', 'forms': {'fremet': 'rangerá os dentes'},
                     'note': "The stylist's; drops *suis*.", 'from': 'stylist'})

# 111:7b — olhar de cima: refused, option added
d['decisions'].append({
    'id': 'despiciat', 'refs': ['111:7b'], 'latin': 'donec despíciat inimícos suos', 'kind': 'glossary',
    'why': (
        "The *despícere (enemies)* row: *olhar de cima*, accusative as 117:7. The stylist heard a social sneer and asked "
        "*olhe do alto*. Refused: the row keeps the idiom precisely because *despícere* holds both the height and the "
        'contempt (L&S; MS1932 *contemple com desprezo*); *do alto* keeps only the height. It is the row\'s option, and '
        '53:9, 91:12 and 117:7 would move with it. The ambiguity reader heard triumph or contempt — both the Latin\'s.'
    ),
    'options': [
        {'label': 'olhe de cima', 'forms': {'despiciat': 'olhe de cima'}, 'note': 'Ruling: the row, = 117:7.', 'from': 'glossary'},
        {'label': 'olhe do alto', 'forms': {'despiciat': 'olhe do alto'}, 'note': "The stylist's; the row's option (*viu do alto*, 91:12).", 'from': 'stylist'},
    ],
})
d['verses']['111:7b'] = d['verses']['111:7b'].replace('olhe de cima', '{despiciat}')

d['choices']['111:5'] += (
    ' The ambiguity reader heard *no juízo* as the court or the Last Judgment, meaning unclear — the Latin\'s own range '
    '(decision `judicio`); *tem piedade* was heard as compassion first, as in 36:26.'
)
d['choices']['111:9'] += (
    ' The ambiguity reader could not hear what was scattered, nor for certain who scattered it: neither can the Latin '
    '(*Dispérsit* has no object and no subject named). The horn was heard with its cuckold overtone, as in Pss 74 and 91; '
    'kept by the *cornu* row.'
)
d['choices']['111:10'] = '*desidérium → desejo* (37:10, 77:29); *períre → perecer*. *definhará* was unknown to the ambiguity reader again (the *tabéscere* row; kept).'

d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json',
     'note': 'claude-opus-5-5, fresh context, with latin.json. No major; one minor (111:1, the preposition), met by the stylist\'s wording.',
     'outcomes': [
         {'verse': '111:1', 'remark': "'in mandatis' made a direct object; keep the preposition", 'outcome': 'taken', 'decision': 'volet',
          'reason': "The preposition is back, with the stylist's *se comprazerá*; his own *nos seus mandamentos quererá muito* is kept as an option."},
     ]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json',
     'note': 'claude-opus-5-5, fresh context, with latin.json. Eight remarks: four taken, four refused and kept as options. Worst line 111:5, best 111:4.',
     'outcomes': [
         {'verse': '111:1', 'remark': "'quererá muito' colloquial; 'nos seus mandamentos muito se comprazerá'", 'outcome': 'taken', 'decision': 'volet'},
         {'verse': '111:5', 'remark': "'Agradável' is small talk; 'Amável'", 'outcome': 'taken', 'decision': 'jucundus'},
         {'verse': '111:5', 'remark': "'para sempre não' foreign; 'jamais'", 'outcome': 'option', 'decision': 'commov6',
          'reason': "The formula row (14:5b, 29:7) waits on the main session's ruling; *jamais* drops *in ætérnum*'s word (D23). Third stylist to ask — reported."},
         {'verse': '111:7a', 'remark': "'notícia má' unnatural; 'a má notícia'", 'outcome': 'taken', 'decision': 'auditio'},
         {'verse': '111:7b', 'remark': "'olhar de cima' is social condescension; 'olhe do alto'", 'outcome': 'option', 'decision': 'despiciat',
          'reason': 'The *despícere* row keeps both height and contempt, as the Latin does; 53:9, 91:12, 117:7 move with it.'},
         {'verse': '111:9', 'remark': "'chifre' emphasised; 'e o seu chifre será exaltado na glória'", 'outcome': 'refused', 'decision': 'ingloria',
          'reason': "*e* is not in the Latin; *na glória* narrows *in glória*; the horn is the row's (he agrees the image stays)."},
         {'verse': '111:10', 'remark': "'definhará … perecerá' rhyme; 'perecerá o desejo dos pecadores'", 'outcome': 'taken', 'decision': 'v10c'},
         {'verse': '111:10', 'remark': "'os seus dentes' redundant; 'rangerá os dentes'", 'outcome': 'option', 'decision': 'fremet',
          'reason': 'The Latin has *suis*; 36:12 (the same Greek) has *os seus dentes*.'},
     ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
     'note': "claude-opus-5-5, fresh context, Portuguese only. 23 ambiguities, nearly all the Latin's own (whose house, whose justice, who is *misericordioso*, what was scattered); two acted on through the stylist's fixes (*Agradável*, *quererá muito*). Unknown words: *definhará*, *retos* — both glossary rows, kept.",
     'outcomes': [
         {'verse': '111:1', 'remark': "'quererá muito' heard as wanting / demanding a lot", 'outcome': 'taken', 'decision': 'volet'},
         {'verse': '111:5', 'remark': "'Agradável' heard as likeable", 'outcome': 'taken', 'decision': 'jucundus'},
         {'verse': '111:5', 'remark': "'no juízo' heard as court / Last Judgment, meaning unclear", 'outcome': 'refused', 'decision': 'judicio',
          'reason': "The Latin's *in judício* (as 1:5) holds the court and the judgment; *com juízo* stays the option."},
         {'verse': '111:4', 'remark': "'misericordioso…' subject unstated (Lord / man / light)", 'outcome': 'refused', 'decision': 'miser',
          'reason': 'The Latin names no subject; kept open on purpose.'},
         {'verse': '111:4', 'remark': "'Nasceu' invites a birth of a person", 'outcome': 'refused', 'decision': 'exortum',
          'reason': 'Both hearings are the Latin\'s (as 96:11, where a reader heard the same).'},
         {'verse': '111:9', 'remark': "'chifre' cuckold connotation; 'Espalhou' object and subject not audible", 'outcome': 'refused',
          'reason': "The *cornu* row keeps the image; *Dispérsit* has neither object nor named subject."},
         {'verse': '111:10', 'remark': "'definhará' unknown", 'outcome': 'refused', 'decision': 'tabescet',
          'reason': 'The *tabéscere* row; unknown to earlier readers too, and it stands there.'},
     ]},
    {'step': 'revision', 'version': 2,
     'note': "v2: 111:1 *nos seus mandamentos muito se comprazerá* (Latinist + stylist); 111:5 *Amável é o homem* (stylist, a local split of the *jucúndus* row for persons); 111:7a *a má notícia* (order); 111:10 *perecerá o desejo dos pecadores* (order, to break the *-rá* rhyme at mediant and final). New decisions `despiciat` and `v10c` hold the refused and the draft wordings. Draft 1 kept as prayed.v1.json."},
]

p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
