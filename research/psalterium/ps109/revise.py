"""v1 -> v2: record reader outcomes; stylist proposals kept as options. The prayed text is unchanged."""
import json
import shutil

base = 'research/psalterium/ps109/'
if json.load(open(base + 'prayed.json', encoding='utf-8'))['version'] != 1:
    raise SystemExit('already applied; re-running would overwrite prayed.v1.json')
shutil.copy(base + 'prayed.json', base + 'prayed.v1.json')
d = json.load(open(base + 'prayed.json', encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}

dec['scab']['options'][3]['note'] += '; the v1 stylist asked for it (he believed it the familiar liturgical form, but the CNBB lectionary prints *escabelo* here, verified)'
dec['scab']['options'][3]['from'] = 'stylist'

dec['dominare']['options'].append({
    'label': 'tu, domina',
    'forms': {'dominare': 'tu, domina'},
    'note': "v1 stylist: *domina tu* is stiff, two stresses clash; the pronoun first. Refused: *tu,* set off by a comma sounds like a vocative ('you there'), which is stranger than the postposed subject; the ambiguity reader heard *domina tu* as an imperative",
    'from': 'stylist',
})

d['verses']['109:3'] = d['verses']['109:3'].replace('Contigo está o {principium}', '{tecum}')
i = [x['id'] for x in d['decisions']].index('principium')
d['decisions'].insert(i + 1, {
    'id': 'tecum', 'refs': ['109:3'], 'latin': 'Tecum princípium', 'kind': 'grammar',
    'why': "The Latin colon has no verb; the draft supplies *está* (D2). The v1 stylist asked to drop it: that would shorten the long mediant colon and avoid the hiatus *está o*. Not taken. With *está* gone and commas around it, *o princípio* is heard as an apposition to *Contigo*, or as a heading. The saving is one syllable, *está‿o* elides in speech, and the Latin colon is as long.",
    'options': [
        {'label': 'Contigo está o princípio', 'forms': {'tecum': 'Contigo está o {principium}'}, 'note': 'draft — copula supplied', 'from': 'draft'},
        {'label': 'Contigo, o princípio,', 'forms': {'tecum': 'Contigo, o {principium},'}, 'note': 'v1 stylist — verbless, as the Latin', 'from': 'stylist'},
    ],
})

dec['exalt']['options'].append({
    'label': 'erguerá',
    'forms': {'exalt': 'erguerá'},
    'note': 'v1 stylist: *exaltará a cabeça* has the hiatus *-rá a* before the cadence; *erguerá* is shorter. Refused for the glossary row (one verb for exaltáre); *-rá a* merges in speech as in any *-rá a* before a feminine noun',
    'from': 'stylist',
})

d['version'] = 2
d['status'] = 'reviewed'
d['choices']['109:6'] += ' The v1 ambiguity reader heard *encherá as ruínas* as unclear, "filling or rebuilding ruins": that is the Latin\'s own openness (*implébit ruínas*, DRB "he shall fill ruins"), kept; *encherá de ruínas* stays an option.'
d['choices']['109:1b'] += ' *escabelo* was listed unknown by the v1 ambiguity reader, as in 98:5. It is kept: it is the glossary row, and it is the word of this very line in the CNBB lectionary (verified).'

d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': 'Reader: claude-opus-5-5, fresh context, with latin.json. No remarks: every verse adequate. It singled out as kept: the copula-only supply in 109:3, *estrela da manhã*, the literal *implébit ruínas*, and the unresolved *suæ* (109:5) and *in terra multórum* (109:6).', 'outcomes': []},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': 'Reader: claude-opus-5-5, fresh context. Four remarks, none taken: two would change a glossary word (escabelo, exaltar), and two change the build for a worse hearing. All four kept as options. Best line 109:4, worst 109:3.', 'outcomes': [
        {'verse': '109:1b', 'remark': 'escabelo bookish; estrado', 'outcome': 'option', 'decision': 'scab', 'reason': 'Glossary row (98:5), and the CNBB lectionary itself has *escabelo* in this verse, so the stylist\'s premise that *estrado* is the familiar liturgical form is not borne out.'},
        {'verse': '109:2', 'remark': 'domina tu stiff; tu, domina', 'outcome': 'option', 'decision': 'dominare', 'reason': 'A comma-set *tu* reads as a vocative. The postposed subject is MS1932\'s, and the ambiguity reader heard the imperative.'},
        {'verse': '109:3', 'remark': 'mediant too long; drop está', 'outcome': 'option', 'decision': 'tecum', 'reason': 'Saves one syllable, and the commas make *o princípio* an apposition. The Latin colon is as long.'},
        {'verse': '109:7', 'remark': 'hiatus -rá a; erguerá', 'outcome': 'option', 'decision': 'exalt', 'reason': 'Glossary row exaltáre → exaltar. The vowels merge in speech.'},
    ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': 'Reader: claude-opus-5-5, fresh context, Portuguese only. It heard every hard line as intended: *domina tu* as an imperative; *princípio* as the beginning (the ruled first sense); *não se arrependerá* as not going back on the oath; the two Lords as two persons. Its open points are the Latin\'s own: the *tu* of 109:5, *encherá as ruínas*, and *na terra de muitos*. Unknown words: *escabelo*, *Melquisedec*, *torrente* (all kept: glossary rows or a proper name) and *ruínas* in this sense.', 'outcomes': [
        {'verse': '109:5', 'remark': 'addressee of à tua direita unclear', 'outcome': 'refused', 'reason': 'The Latin leaves it unclear too. The decision dex5 records the other reading.'},
        {'verse': '109:6', 'remark': 'encherá as ruínas unclear (fill / rebuild)', 'outcome': 'refused', 'reason': "The Latin's openness, kept (Latinist concurs); *de ruínas* is an option."},
        {'verse': '109:6', 'remark': 'na terra de muitos unclear', 'outcome': 'refused', 'reason': 'The Latin order and openness, kept; the Latinist praised it.'},
        {'verse': '109:1b', 'remark': 'escabelo unknown', 'outcome': 'refused', 'reason': 'Glossary row; the word of the CNBB lectionary in this line.'},
        {'verse': '109:2', 'remark': 'vara heard as rod, sceptre not necessarily', 'outcome': 'option', 'decision': 'virga', 'reason': '*cetro* already the option; the glossary keeps *vara*.'},
    ]},
    {'step': 'revision', 'version': 2, 'note': 'v2: the prayed text is unchanged from v1 (prayed.v1.json kept). Only options and outcomes were added. The Latinist passed v1 without a remark, so a v2 gate would read the same words.'},
]
json.dump(d, open(base + 'prayed.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
print('ok')
