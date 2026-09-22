"""Append the v1 reader steps and the v2 revision to Ps 47's audit. Run once, from the repo root."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = json.loads((here / 'prayed.json').read_text(encoding='utf-8'))
m = 'claude-opus-5-5 (fresh context)'
p['audit'] += [
    {'step': 'readers', 'note': f'codex.py not called (Codex out of credits since Ps 37). The coordinator ran the three readers on draft 1 as fresh-context agents: {m}.'},
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': f'{m}. One minor (47:14 the supplied *o*), taken. Tenses, voices, persons, the Septuagintal readings and every ambiguous *ejus* approved.',
     'outcomes': [{'verse': '47:14', 'remark': 'supplied object *o* in *para que o narreis*', 'outcome': 'taken'}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': f'{m}. 8 remarks on 6 verses; best line 47:9, worst 47:6. 4 taken (47:4, 47:6 proclisis, 47:6 in part, 47:11 comma), 4 kept as options.',
     'outcomes': [
         {'verse': '47:3', 'remark': 'subject first: *O monte Sião é fundado com …*', 'outcome': 'option', 'decision': 'fundatur', 'reason': 'the appositions after the asterisk would follow *toda a terra* and be heard as the earth\'s'},
         {'verse': '47:4', 'remark': '*ele a am-* clogs; drop *ele*', 'outcome': 'taken'},
         {'verse': '47:5', 'remark': '*Porque eis que* heavy → *Pois*', 'outcome': 'option', 'decision': 'quoniam', 'reason': 'quóniam → porque is the default and 47:15 has it; 42:2\'s *Pois* was forced by two *por que* questions'},
         {'verse': '47:5', 'remark': '*reuniram-se juntos* pleonasm → *vieram juntos*', 'outcome': 'option', 'decision': 'inunum', 'reason': 'the in unum formula of 2:2, identical Latin (rule 6)'},
         {'verse': '47:6', 'remark': 'three reflexives: *perturbaram-se, abalaram-se*', 'outcome': 'option', 'decision': 'passives', 'reason': '*perturbaram-se* taken; *abalaram-se* refused (movéri row *ser abalado*; colloquial "take off")'},
         {'verse': '47:6', 'remark': 'enclisis *apoderou-se* bookish', 'outcome': 'taken'},
         {'verse': '47:10', 'remark': 'bare vocative *Deus* abrupt → *ó Deus*', 'outcome': 'option', 'decision': 'deus', 'reason': 'the vocative rule: no *ó* unless the Latin has *O*'},
         {'verse': '47:11', 'remark': '*ó Deus*; drop the comma before *até*', 'outcome': 'taken', 'reason': 'comma dropped; the *ó Deus* half is the 47:10 option `deus`'},
     ]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': f'{m}. 29 readings listed; the likely hearing was the intended one almost everywhere. Unclear: *os lados do norte* (47:3), who *quebrareis* addresses (47:7), *partilhai as suas casas* as hospitality (47:14) — each the Latin\'s own openness, kept (choices). Unknown: *Társis*, *os lados do norte*, *amparar*, *regerá* — a name and three glossary words, kept.',
     'outcomes': [
         {'verse': '47:3', 'remark': '*os lados do norte* unplaceable', 'outcome': 'refused', 'reason': 'the Latin apposition is itself obscure; *nos lados do norte* stays an option in `latera`'},
         {'verse': '47:7', 'remark': '*quebrareis*: God or the hearers?', 'outcome': 'refused', 'reason': 'the Latin turns to God with no vocative; a supplied one would be MS1932\'s gloss'},
         {'verse': '47:14', 'remark': '*partilhai as suas casas* heard as hospitality', 'outcome': 'refused', 'reason': 'the Latin is as open; rule 3 leaves *partilhai*'},
         {'verse': '47:14', 'remark': '*o* in *o narreis* has three referents', 'outcome': 'taken', 'reason': 'with the Latinist: the pronoun is gone'},
     ]},
    {'step': 'revision', 'version': 2, 'note': 'v2: 47:4 *quando a amparar*; 47:6 *perturbaram-se*, *o tremor se apoderou deles*; 47:11 no comma before *até*; 47:14 *para que narreis a outra geração*. New decisions carrying refused proposals: `quoniam`, `inunum`, `passives`, `deus`; the `fundatur` slot now includes *o monte Sião* so the stylist\'s order is selectable. Draft 1 kept as prayed.v1.json.'},
]
(here / 'prayed.json').write_text(json.dumps(p, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
