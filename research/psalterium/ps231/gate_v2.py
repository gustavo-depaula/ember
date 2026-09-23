"""Record the v2 Latinist gate (critic/v2.latinist.json) in prayed.json: two minors, held as options. Idempotent.
python3.13 research/psalterium/ps231/gate_v2.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    raise SystemExit('already recorded')
v = d['verses']
v['1:70'] = 'Como falou pela boca {sanctorum}:'
v['1:77'] = 'Para dar {scientia} ao seu povo: * {remissio} {eorum}:'
ids = [x['id'] for x in d['decisions']]
d['decisions'].insert(ids.index('asaeculo'), {
    'id': 'sanctorum', 'refs': ['1:70'], 'latin': 'per os sanctórum, * qui a sǽculo sunt, prophetárum ejus', 'kind': 'order',
    'why': 'The Latin splits sanctórum from prophetárum ejus across the relative clause and the asterisk; it most naturally reads as one '
           'phrase, "his holy prophets" (Greek τῶν ἁγίων ἀπ\' αἰῶνος προφητῶν αὐτοῦ), but a noun "the saints" with "his prophets" in '
           'apposition is grammatical. Portuguese cannot hold an adjective across a clause, so it must either resolve or keep two nouns.',
    'options': [
        {'label': 'dos santos, * dos seus profetas, que são …', 'forms': {'sanctorum': 'dos santos, * dos seus profetas, {asaeculo}'},
         'note': 'Draft (v1, v2): two nouns, the second in apposition; the relative after "profetas" inside the second colon. The v2 '
                 'Latinist (minor) found the apposition reading allowed but not favoured.', 'from': 'draft'},
        {'label': 'dos seus santos, * que são …, os seus profetas', 'forms': {'sanctorum': 'dos seus santos, * {asaeculo}, os seus profetas'},
         'note': 'The v2 Latinist\'s fix: the Latin\'s order. "seus" twice, and "os seus profetas" hangs without "de" after the clause.',
         'from': 'latinist'},
        {'label': 'dos seus santos profetas, * que são …', 'forms': {'sanctorum': 'dos seus santos profetas, * {asaeculo}'},
         'note': 'MS1932 and DRB\'s sense ("his holy prophets"); resolves the Latin\'s reading, but the first colon then carries the '
                 'prophets and the second only the clause (lengths 13 / 9).', 'from': 'MS1932'},
    ]})
d['decisions'].insert([x['id'] for x in d['decisions']].index('scientia') + 1, {
    'id': 'eorum', 'refs': ['1:77'], 'latin': 'in remissiónem peccatórum eórum', 'kind': 'word',
    'why': 'The Latin has ejus (God\'s people) and eórum (the people\'s sins): two pronouns. Portuguese "seu … seus" does not mark the '
           'change of possessor; "deles" does, but it is heavy at the close of a prayed line.',
    'options': [
        {'label': 'dos seus pecados', 'forms': {'eorum': 'dos seus pecados'},
         'note': 'Draft: with the people just named, "seus" is heard as theirs (the v1 ambiguity reader heard it so). MS1932, DM1962.',
         'from': 'draft'},
        {'label': 'dos pecados deles', 'forms': {'eorum': 'dos pecados deles'},
         'note': 'The v2 Latinist (minor) and the literal: marks eórum; a colloquial close ("deles") on the cadence.', 'from': 'latinist'},
    ]})
d['audit'].append({
    'step': 'latinist', 'version': 2, 'file': 'critic/v2.latinist.json',
    'note': 'Gate on v2: claude-opus-5-5, fresh context, read latin.json. No majors; two minors, both held as options, and v2 stands. '
            'It confirmed the perfect visitávit, óriens as a noun, the images, and the marks.',
    'outcomes': [
        {'verse': '1:70', 'remark': 'sanctórum … prophetárum read as one phrase; the Latin order', 'outcome': 'option',
         'decision': 'sanctorum',
         'reason': 'The apposition reading is the Latin\'s grammar too; the fix repeats "seus" and leaves "os seus profetas" without its '
                   'preposition. The one-phrase reading is option 3.'},
        {'verse': '1:77', 'remark': 'seu … seus blurs ejus / eórum; dos pecados deles', 'outcome': 'option', 'decision': 'eorum',
         'reason': 'The v1 ambiguity reader heard "seus" as the people\'s, so the blur is not heard; "deles" is a heavy close.'},
    ]})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('recorded')
