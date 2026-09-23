"""Ps 129 draft 2: apply the v1 readers' outcomes. Run once with python3.13."""
import json
from pathlib import Path

here = Path(__file__).parent
d = json.loads((here / 'prayed.json').read_text())
assert d['version'] == 1
d['version'] = 2


def dec(i):
    return next(x for x in d['decisions'] if x['id'] == i)


def promote(i, label):
    x = dec(i)
    opts = x['options']
    k = next(n for n, o in enumerate(opts) if o['label'] == label)
    opts.insert(0, opts.pop(k))


# 129:3 — stylist: 'suportará' waits for an object; the Latin is absolute.
s = dec('sustinebit')
promote('sustinebit', 'subsistirá')
s['options'][0]['note'] += ' Taken in draft 2 from the stylist: with no object, Brazilian ears hear the transitive "suportar" as waiting for one ("suportará o quê?"); the Latin is absolute ("who will stand"), which is what "subsistir" says. The sustinére row\'s "suportar" was written for a thing endured as object (68:8); 129:3 has none.'
s['options'][0]['from'] = 'stylist'
s['options'][1]['note'] = 'Draft 1, by the sustinére row (which named 129:3). Refused in draft 2: transitive to the ear with no object (stylist); the ambiguity reader also heard "tolerate (the iniquities)" as a second reading.'

# 129:4b — Latinist: 'in verbo' is the ground, not the object; stylist: 'esperou … esperou' stammers.
v = dec('inverbo')
v['options'].insert(0, {
    'label': 'se sustentou na sua palavra',
    'forms': {'inverbo': 'se sustentou na sua palavra'},
    'note': 'Draft 2. Answers both readers at once: the Latin\'s "in" kept ("na", the Latinist\'s point — the word is what the soul rests on, not what it waits for), and two verbs for the Latin\'s two (sustínuit / sperávit; ὑπέμεινεν / ἤλπισεν — D15\'s test), so the colon no longer repeats "esperou" (the stylist\'s point). "sustentar-se" is the root of sustinére; DRB "relied on", MS1932 "está confiada na", a devotional text "Susteve-se … na sua palavra". Cost: the verb is not 4a\'s "esperei por vós" (D36), so sustinére is three Portuguese verbs in three lines (subsistir, esperar por, sustentar-se) — each by its construction: absolute, with God as object, with "in" + a thing.',
    'from': 'draft',
})
v['options'] = [o for o in v['options'] if o['label'] != 'se susteve na sua palavra']
for o in v['options']:
    if o['label'] == 'pela sua palavra':
        o['note'] = 'Draft 1 (D36\'s verb and preposition). Refused in draft 2: the Latinist (minor) — "pela" makes the word the thing awaited, where "in verbo" is its ground; the stylist — "esperou … esperou" sounds like a stammer, and "esperou pela" as waiting for the word to arrive.'
v['options'].insert(2, {
    'label': 'esperou na sua palavra',
    'forms': {'inverbo': 'esperou na sua palavra'},
    'note': 'The Latinist\'s fix (the Latin\'s "in"). Refused: both colons become "esperou na … esperou no", which merges sustínuit into sperávit (D36 keeps them apart by the preposition; the Greek has two verbs) and makes the stammer the stylist heard complete. Familiar from the CNBB ("espero em sua palavra").',
    'from': 'latinist',
})
v['options'].insert(3, {
    'label': 'aguardou a sua palavra',
    'forms': {'inverbo': 'aguardou a sua palavra'},
    'note': 'The stylist\'s fix. Refused: "aguardar" is exspectáre\'s (D24, D36), and it drops the Latin\'s "in".',
    'from': 'stylist',
})
v['why'] += ' Draft 2: the verb changed to "se sustentou na" (see option 0).'
d['verses']['129:4b'] = 'A minha alma {inverbo}: * a minha alma esperou no Senhor.'

# 129:8 — Latinist and stylist: restore the redémptio / rédimet echo.
r = dec('redimet')
promote('redimet', 'redimirá')
r['options'][0]['note'] = 'Draft 2, asked for by the Latinist (minor; he proposed "remirá") and the stylist ("redimirá"): the Latin carries the root straight on from 129:7 (redémptio / rédimet), and "redenção … redimirá" keeps it. MS1932 has "redimirá". Safe here (the row\'s objection is the imperative "redimi-me"). A local exception to the redímere row, as Ps 48 made one the other way (48:9 "resgate" to keep its root): where the Latin sets noun and verb side by side, the echo is kept.'
r['options'][0]['from'] = 'stylist'
for o in r['options']:
    if o['label'] == 'resgatará':
        o['note'] = 'Draft 1, by the redímere row (one verb for λυτρόομαι). Refused in draft 2: it breaks the Latin\'s echo with "redenção" in the verse before, which two readers asked for.'
    if o['label'] == 'remirá':
        o['note'] = 'The Latinist\'s wording; the devotional "há de remir". Keeps a root link, but "remir" is rare in speech and its kinship with "redenção" is not heard; "redimirá" does both.'
        o['from'] = 'latinist'

# 129:4a — stylist's two proposals kept as options.
p = dec('propitiatio')
p['options'].append({
    'label': 'há propiciação',
    'forms': {'propitiatio': 'há propiciação'},
    'note': 'The stylist: "Porque junto de vós há propiciação" (lighter run-up). Refused: 129:7\'s "Porque junto do Senhor está a misericórdia" — the Latin\'s parallel (Quia apud te … Quia apud Dóminum) — would no longer match.',
    'from': 'stylist',
})
for o in p['options']:
    if not o['forms']['propitiatio'].startswith('há'):
        o['forms']['propitiatio'] = 'está ' + o['forms']['propitiatio']
p['why'] += ' The ambiguity reader listed "propiciação" as unknown (the second blind reader to do so, after 48:8); kept — for Gustavo, with the placátio row.'

d['decisions'].append({
    'id': 'sustinuite', 'refs': ['129:4a'], 'latin': 'et propter legem tuam sustínui te, Dómine', 'kind': 'glossary',
    'why': 'The stylist found the colon long and heard "por causa … por vós" trip, with "esperei por vós" briefly as "I waited in your place". D36 settled sustinére with God as object → "esperar por" ("por vós esperei" is the row\'s own example); the ambiguity reader heard "I waited for you", the row\'s sense. The colon is 15 syllables, the Latin\'s count.',
    'options': [
        {'label': 'esperei por vós', 'forms': {'sustinuite': 'esperei por vós'}, 'note': 'Draft, by D36.', 'from': 'glossary'},
        {'label': 'eu vos esperei', 'forms': {'sustinuite': 'eu vos esperei'}, 'note': 'The stylist. Lighter; but it drops the "por" that D36 uses to keep sustinére apart from speráre in, and supplies "eu".', 'from': 'stylist'},
    ],
})
d['verses']['129:4a'] = 'Porque junto de vós {propitiatio}: * e por causa da vossa lei {sustinuite}, Senhor.'

d['choices']['129:6'] += ' The ambiguity reader heard "vigília" as a vigil service, or vaguely "early morning" — the same hearing as at 89:5 (custódia row); kept for the row.'
d['choices']['129:7'] += ' "copiosa" was listed unknown by the ambiguity reader; kept — it is the Latin\'s word and the one Brazil already prays here (circulation.md).'

d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'model': 'claude-opus-5-5 (fresh context)',
     'note': '2 minor; both addressed (129:4b by another fix than his, 129:8 with "redimirá" rather than his "remirá").',
     'outcomes': [
         {'verse': '129:4b', 'remark': '"pela" makes the word the thing awaited; "in verbo" is the ground — "esperou na sua palavra"', 'outcome': 'taken', 'decision': 'inverbo', 'reason': 'The "in" is restored ("na sua palavra"), but with the verb "se sustentou" rather than "esperou", so that sustínuit is not merged into the next colon\'s sperávit; his exact wording stays as option 2.'},
         {'verse': '129:8', 'remark': 'resgatará breaks the redémptio / rédimet echo — "remirá"', 'outcome': 'taken', 'decision': 'redimet', 'reason': 'Echo restored with "redimirá" (MS1932, the stylist\'s word), which is heard as kin of "redenção"; "remirá" kept as an option.'},
     ]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'model': 'claude-opus-5-5 (fresh context)',
     'note': '5 remarks; 3 taken (129:3, 129:4b in substance, 129:8), 2 kept as options (129:4a). Worst line 129:4a, best 129:6.',
     'outcomes': [
         {'verse': '129:3', 'remark': '"suportará" waits for an object — "subsistirá"', 'outcome': 'taken', 'decision': 'sustinebit'},
         {'verse': '129:4a', 'remark': '"por causa … por vós" jingle — "eu vos esperei"', 'outcome': 'option', 'decision': 'sustinuite', 'reason': 'D36 keeps sustinére with God as object as "esperar por"; the colon is the Latin\'s length; the ambiguity reader heard the row\'s sense.'},
         {'verse': '129:4a', 'remark': '"está a propiciação" heavy — "há propiciação"', 'outcome': 'option', 'decision': 'propitiatio', 'reason': 'Would break the parallel with 129:7 "Porque junto do Senhor está a misericórdia" (Quia apud te … Quia apud Dóminum).'},
         {'verse': '129:4b', 'remark': '"esperou … esperou" stammers; two Latin verbs — "aguardou a sua palavra"', 'outcome': 'taken', 'decision': 'inverbo', 'reason': 'The complaint taken with another verb: "se sustentou na" (sustinére\'s root, and the Latin\'s "in"); "aguardar" is exspectáre\'s (D24, D36) and is an option.'},
         {'verse': '129:8', 'remark': 'restore the redémptio / rédimet echo — "redimirá"', 'outcome': 'taken', 'decision': 'redimet'},
     ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'model': 'claude-opus-5-5 (fresh context)',
     'note': 'Eleven readings; the likely hearing matches the Latin everywhere except 129:6 "vigília" (a vigil service). Unknown: propiciação, copiosa, vigília (as watch), iniquidades.',
     'outcomes': [
         {'verse': '129:3', 'remark': '"observardes" could be "keep/practise the iniquities"; likely heard "take note of"', 'outcome': 'refused', 'reason': 'The likely hearing is the Latin\'s; "tiverdes em conta" stays an option.'},
         {'verse': '129:3', 'remark': '"suportará" = tolerate (the iniquities)', 'outcome': 'taken', 'decision': 'sustinebit', 'reason': 'Changed to "subsistirá" on the stylist\'s remark; the second reading disappears with it.'},
         {'verse': '129:4b', 'remark': '"sua palavra": whose word briefly unclear', 'outcome': 'refused', 'reason': 'The Latin has "ejus" after addressing God; the next colon names the Lord; "pela palavra dele" is colloquial.'},
         {'verse': '129:6', 'remark': '"vigília" heard as a vigil service / early morning', 'outcome': 'refused', 'reason': 'The custódia row (89:5), same hearing there; "guarda" is heard as a person.'},
         {'verse': '129:8', 'remark': '"suas iniquidades" could be the Lord\'s; likely heard Israel\'s', 'outcome': 'refused', 'reason': 'Likely hearing is the Latin\'s.'},
         {'verse': '129:4a', 'remark': '"propiciação" unknown', 'outcome': 'refused', 'reason': 'The Latin\'s word (atonement), one family with placátio 48:8 (D43); in the devotional De profundis. Flagged for Gustavo in the glossary.'},
         {'verse': '129:7', 'remark': '"copiosa" unknown', 'outcome': 'refused', 'reason': 'The Latin\'s word and the Brazilian wording of the line (CNBB, devotions).'},
     ]},
    {'step': 'revision', 'version': 2, 'note': 'v2: 129:3 "subsistirá" (stylist); 129:4b "A minha alma se sustentou na sua palavra" (Latinist\'s "in" + stylist\'s two verbs); 129:8 "redimirá" (Latinist and stylist: the echo with "redenção"). 129:4a unchanged, the stylist\'s two proposals kept as options. Draft 1 kept as prayed.v1.json.'},
]
(here / 'prayed.json').write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print('ok')
