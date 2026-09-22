"""Draft 2 of Ps 52 from the three v1 readers (claude-opus-5-5, fresh context)."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = json.loads((here / 'prayed.v1.json').read_text(encoding='utf-8'))
p['version'] = 2
p['status'] = 'reviewed'
V = p['verses']
V['52:5'] = 'Não hão de saber todos os que praticam a iniquidade, * os que devoram o meu povo {cibum}?'
V['52:6b'] = 'Porque Deus {dissipavit} os ossos {placent}: * {confusi}, porque Deus os desprezou.'

dec = {d['id']: d for d in p['decisions']}

# 52:7 — the stylist's verb (the glossary's) taken; reverter kept as option
conv = dec['converterit']
conv['why'] += (' Heard (draft 1): the stylist — «“Reverter” sounds juridical and modern: you reverse a court decision or a trend, not a captivity» — asked for the glossary\'s “fizer voltar o cativeiro”; the blind reader listed “reverter o cativeiro” as unknown, though he heard “end the captivity” first.')
old = conv['options']
rev, fv, fvc, pf = old
fv = dict(fv)
fv['note'] = ('Ruling (draft 2): the glossary\'s verb for convértere (voltar), causative as 9:4 “Ao fazer voltar para trás o meu inimigo”, asked for by the stylist. Draft 1 refused it for fear it would be heard as “bring the captivity back again”; no reader heard that — the stylist proposed it himself, and in a colon that ends in Jacob\'s rejoicing the ear has no room for the reverse. Not yet heard by a blind reader in this form. It reads as Douay-Rheims’ “bring back the captivity”. For 125:1, 125:4 (“Fazei voltar, Senhor, o nosso cativeiro”).')
fv['from'] = 'stylist'
rev = dict(rev)
rev['note'] = ('Draft 1. “reverter” is con-vértere’s own root and says “undo”; refused in draft 2 because the stylist heard it as juridical (a court ruling, a trend) and the blind reader listed it as unknown.')
conv['options'] = [fv, rev, fvc, pf]

# 52:6b confusi — stylist's ficaram as option
dec['confusi']['options'].insert(1, {
    'label': 'ficaram envergonhados', 'forms': {'confusi': 'ficaram envergonhados'},
    'note': 'The stylist («a stiff, bookish passive»). Refused: “ficar envergonhado” is a feeling (embarrassed), where confúsi sunt (κατῃσχύνθησαν) is being put to shame by another — the next words say by whom (Deus sprevit eos); and D15’s passive stands so at 21:6 “não foram envergonhados”, 24:3.',
    'from': 'stylist'})

# 52:5 cibum — Ps 13's decision escam, mirrored here so the readers' options are visible
p['decisions'].insert(2, {
    'id': 'cibum', 'refs': ['52:5'], 'latin': 'qui dévorant plebem meam ut cibum panis', 'kind': 'word',
    'why': 'Ps 13:4 has sicut escam panis, 52:5 ut cibum panis; the Greek is one (βρώσει ἄρτου, the eating of bread), so by D15’s test and rule 6 the Portuguese is one: Ps 13’s decision escam, whose ruling this copies (glossary row esca / cibus). Matos Soares 1932 has “como quem come pão” in this very verse; Douay-Rheims “as they eat bread”. A change here should be made in 13:4 too.',
    'options': [
        {'label': 'como quem come pão', 'forms': {'cibum': 'como quem come pão'}, 'note': 'Ruling: 13:4’s wording (Ps 13 decision escam), kept against the Latinist and the stylist.', 'from': 'MS1932'},
        {'label': 'como alimento de pão', 'forms': {'cibum': 'como alimento de pão'}, 'note': 'The Latinist (v1, minor), as in Ps 13 draft 2: the noun kept, the people compared to food. Refused as in Ps 13: the Greek βρῶσις is the eating, and “alimento de pão” is not said in Portuguese.', 'from': 'latinist'},
        {'label': 'como se come o pão', 'forms': {'cibum': 'como se come o pão'}, 'note': 'The stylist (v1), to soften the “como … come” jingle, which he himself called mild and said to keep. An option in Ps 13 too.', 'from': 'stylist'},
    ]})

p['choices']['52:5'] += ' Readers v1: the Latinist asked “como alimento de pão” and the stylist offered “como se come o pão” — both refused to keep 13:4’s wording (decision cibum).'
p['choices']['52:7'] = p['choices']['52:7'].replace('(decision converterit).', '(decision converterit: draft 2 “fizer voltar o cativeiro”, the stylist’s and the glossary’s verb).')

A = p['audit']
A.append({'step': 'latinist', 'file': 'critic/v1.latinist.json',
          'note': 'Draft 1, read by claude-opus-5-5 (fresh context). One minor, 52:5 ut cibum panis; everything else passed, the Septuagintal readings named as kept (trepidavérunt timóre, qui homínibus placent, dissipávit ossa, confúsi sunt) and the marks confirmed.',
          'outcomes': [{'verse': '52:5', 'remark': '“como quem come pão” adds an eater; ut cibum panis is a noun phrase → “como alimento de pão” (minor)', 'outcome': 'option', 'decision': 'cibum',
                        'reason': 'Ps 13 wording kept (13:4, rule 6: the Greek is one for both twins). The same remark was refused there (Ps 13 v2 gate): βρώσει is the eating, and “alimento de pão” is not Portuguese.'}]})
A.append({'step': 'stylist', 'file': 'critic/v1.stylist.json',
          'note': 'Draft 1, read by claude-opus-5-5 (fresh context). Five remarks on four verses; best line 52:6, worst 52:7. One taken (52:7 verb), four refused — three of them because they fall on words shared with Ps 13, which rule 6 keeps identical.',
          'outcomes': [
              {'verse': '52:2', 'remark': '“Corromperam-se, e tornaram-se” trips on “-se, e tor-” → “fizeram-se abomináveis”', 'outcome': 'refused',
               'reason': 'Ps 13 wording kept: the colon is 13:1b’s word for word (identical Latin up to in iniquitátibus); a change must be made in both twins. “fazer-se” is the fíeri row’s word for Ps 117, but 13:1b and 13:3a (= 52:4) chose “tornar-se” for a state that comes upon one, and 52:4 repeats it — the Latin’s facti sunt twice. For Gustavo, with Ps 13.'},
              {'verse': '52:5', 'remark': '“como … come” mild jingle → “como se come o pão” (he said keep it unless a plainer sound is wanted)', 'outcome': 'option', 'decision': 'cibum',
               'reason': 'Ps 13 wording kept (13:4); he himself advised keeping it.'},
              {'verse': '52:6b', 'remark': '“foram envergonhados” stiff, bookish → “ficaram envergonhados”', 'outcome': 'option', 'decision': 'confusi',
               'reason': '“ficar envergonhado” is a feeling; confúsi sunt is being put to shame, and D15’s passive stands so elsewhere (21:6, 24:3).'},
              {'verse': '52:7', 'remark': '“reverter” juridical, modern → “fizer voltar o cativeiro”', 'outcome': 'taken', 'decision': 'converterit',
               'reason': 'The glossary’s verb for convértere; draft 1’s fear that it would be heard as the captivity returning was not borne out by any reader.'},
              {'verse': '52:7', 'remark': '-ão/-ão in the first colon and -ará/-ará at the end are sing-song; → “Israel há de alegrar-se”', 'outcome': 'refused',
               'reason': 'Ps 13 wording kept: the first colon is 13:7a word for word and the last clause is 13:7’s (decision exsultabit there); the paired futures are the Latin’s (exsultábit / lætábitur), as he says, and the Portuguese matches them in form.'},
          ]})
amb_out = [
    ('52:1', 'no seu coração: the fool’s own (heard first) / another’s', 'refused', 'Heard rightly; Ps 13 wording.'),
    ('52:2', 'Corromperam-se: plural subject after the singular insensato', 'refused', 'The Latin’s own shift (insípiens → corrúpti sunt), as in Ps 13.'),
    ('52:2', 'abomináveis nas iniquidades: by / while in iniquities', 'refused', 'in + ablative is open the same way; the decision iniquitatibus keeps it without a possessive.'),
    ('52:3', 'quem entenda: no object', 'refused', 'intéllegens has none; Ps 13 wording.'),
    ('52:4', 'inúteis: useless / depraved', 'refused', 'The Latin’s word (inútiles); Ps 13 wording.'),
    ('52:5', 'Não hão de saber: judgment to come not heard; “won’t they ever learn?” heard first', 'refused', 'Ps 13 wording kept (decision cognoscent in Ps 13); the Latin’s nonne scient is as open between knowing now and coming to know; Ps 13’s blind reader heard “they will come to know”.'),
    ('52:5', 'como quem come pão: as easily as eating bread (heard first) / as their food', 'refused', 'Both are in the Latin’s image; Ps 13 wording (decision cibum).'),
    ('52:6', 'ali: a place / then', 'refused', 'illic is as unplaced; Ps 13 wording.'),
    ('52:6', 'onde não havia temor: nothing to fear (heard first) / no fear of God', 'refused', 'The Latin’s repeated noun, open the same way; Ps 13 wording.'),
    ('52:6', 'A Deus não invocaram: could be misheard as God not calling them', 'refused', 'Heard rightly first; the “a” marks the object (decision invocaverunt).'),
    ('52:6b', 'dos que agradam aos homens: people-pleasers (heard first) / liked by men', 'refused', 'Both are in placent; the first is the Greek’s ἀνθρωπαρέσκων, heard without being supplied (decision placent).'),
    ('52:6b', 'foram envergonhados: who is shamed', 'refused', 'The Latin’s subjectless confúsi sunt; heard rightly first.'),
    ('52:6b', 'os desprezou: whom', 'refused', 'eos as open; heard rightly.'),
    ('52:7', 'Quem dará de Sião: the wish not heard', 'refused', 'Ps 13 wording kept (decision quisdabit there): the Latin’s question, through which the wish sounds as in the Latin.'),
    ('52:7', 'reverter o cativeiro: end / undo the captivity / restore fortunes', 'taken', 'Heard rightly, but listed as unknown; the verb was changed for the stylist’s “fizer voltar” (decision converterit).'),
    ('52:7', 'do seu povo: God’s (heard first) / Israel’s', 'refused', 'plebis suæ; Ps 13 wording.'),
    ('52:1', 'unknown word: insensato', 'refused', 'Glossary insípiens (13:1a, 48:11, 48:13); Ps 13 wording.'),
    ('52:7', 'unknown word: reverter o cativeiro', 'taken', 'Replaced (decision converterit).'),
]
A.append({'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json',
          'note': 'Draft 1, Portuguese only, read by claude-opus-5-5 (fresh context). 16 items and 2 unknown words (insensato; reverter o cativeiro). No wrong first hearing that the Latin excludes. “dos que agradam aos homens” heard as people-pleasers (the Greek’s sense) without the gloss; “A Deus não invocaram” heard rightly.',
          'outcomes': [dict(verse=v, remark=r, outcome=o, reason=why, **({'decision': 'converterit'} if v == '52:7' and o == 'taken' else {})) for v, r, o, why in amb_out]})
A.append({'step': 'revision', 'version': 2,
          'note': 'v2. One verse changed: 52:7 “reverter o cativeiro” → “fizer voltar o cativeiro” (the stylist’s, the glossary’s verb). 52:5 and 52:6b gain decisions (cibum, and a stylist option in confusi) so the readers’ proposals are selectable; their text is unchanged. Every refusal that falls on a Ps 13 wording says so. Draft 1 is prayed.v1.json (flat text prayed.v1.vos.json, what the v1 readers read).'})

(here / 'prayed.json').write_text(json.dumps(p, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
