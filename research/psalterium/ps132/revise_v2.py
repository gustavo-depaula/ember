"""Ps 132 draft 2 from draft 1 after the v1 readers.
python3.13 research/psalterium/ps132/revise_v2.py"""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
d['version'] = 2
d['status'] = 'reviewed'
dec = {x['id']: x for x in d['decisions']}

# 132:1 — the stylist's finite clause (grammar only, D2).
h = dec['habitare']
h['why'] += (" v2: the stylist (v1) heard the personal infinitive after the mediant as a grammar exercise and asked for a finite clause with que; "
             "taken under D2 — the same words, the same final juntos, only the build changes.")
h['options'][0]['note'] = 'v1: the personal infinitive, habitar and juntos by the glossary. Nine syllables for the Latin\'s nine.'
h['options'][0]['from'] = 'draft'
h['options'].insert(0, {
    'label': 'que os irmãos habitem juntos',
    'forms': {'habitare': 'que os irmãos habitem juntos'},
    'note': 'v2, the stylist\'s: a finite clause, the natural Brazilian way to finish como é bom…; habitar and juntos kept.',
    'from': 'stylist'})
for o in h['options'][2:]:
    o['forms']['habitare'] = o['forms']['habitare']  # the Brazilian options keep their infinitive as found

# 132:3b — Porque kept; the stylist's Pois as an option.
d['verses']['132:3b'] = '{quoniam} ali o Senhor {mandavit} a bênção, * e a vida para todo o sempre.'
d['decisions'].append({
    'id': 'quoniam', 'refs': ['132:3b'], 'latin': 'Quóniam illic', 'kind': 'glossary',
    'why': "The stylist (v1) heard a hiatus in Porque ali o and found Porque heavy for a short opening; he asked Pois. The glossary keeps pois for quia only where por que questions follow (D42); porque is the default for quóniam across the psalter, and the hiatus is an ordinary elision (ali‿o). Kept.",
    'options': [
        {'label': 'Porque', 'forms': {'quoniam': 'Porque'}, 'note': 'Draft: the psalter\'s default for quóniam (MS1932 porque).', 'from': 'draft'},
        {'label': 'Pois', 'forms': {'quoniam': 'Pois'}, 'note': 'The stylist\'s: lighter, and the CNBB\'s Pois; spends pois outside the one use the glossary gives it.', 'from': 'stylist'}]})

u = dec['unguentum']
u['why'] += " v2: the ambiguity reader listed unguento among words a churchgoer may not know (with orla, Hermon, Aarão). Kept: the Latin's ointment of anointing is the image; o perfume and o óleo perfumado stay one touch away."

d['choices']['132:1'] = d['choices']['132:1'].replace(
    'checks.py: first colon +3', 'v2: the verse ends que os irmãos habitem juntos (the stylist). checks.py: first colon +3')
d['choices']['132:3b'] += (" usque in sǽculum → para todo o sempre is D37, which names 132:3b; the Latinist's para sempre (v1 minor) is bare in sǽculum's (D23) and was refused for that reason."
                           " ali is left open between Sion and the brothers' dwelling, as illic is (the ambiguity reader heard Sion first).")

d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'model': 'claude-opus-5-5 (fresh context, run by the coordinator)',
     'note': '1 minor, refused (D37).',
     'outcomes': [{'verse': '132:3b', 'remark': 'usque in sǽculum → para todo o sempre is heightened; asks para sempre', 'outcome': 'refused',
                   'reason': 'D37 settles usque in sǽculum → para todo o sempre and lists 132:3b; usque is carried by todo, and para sempre is kept for bare in sǽculum (D23).'}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'model': 'claude-opus-5-5 (fresh context, run by the coordinator)',
     'note': '2 remarks: 1 taken, 1 kept as an option. Worst line 132:1, best 132:2b; the Aarão / Sião rhyme judged harmless.',
     'outcomes': [
         {'verse': '132:1', 'remark': 'personal infinitive os irmãos habitarem juntos sounds translated; asks que os irmãos habitem juntos', 'outcome': 'taken', 'decision': 'habitare'},
         {'verse': '132:3b', 'remark': 'hiatus in Porque ali o; asks Pois', 'outcome': 'option', 'decision': 'quoniam',
          'reason': 'porque is the psalter\'s default for quóniam; pois is kept for quia before por que questions (D42); the elision ali‿o is ordinary.'}]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'model': 'claude-opus-5-5 (fresh context, run by the coordinator)',
     'note': '6 readings, all with the Latin\'s sense heard first; 4 words listed unknown.',
     'outcomes': [
         {'verse': '132:2b', 'remark': 'que desce: the ointment or the beard', 'outcome': 'refused', 'reason': 'Heard as the ointment first, by the anaphora, as the choices note expected; no change needed.'},
         {'verse': '132:2b', 'remark': 'da sua veste: Aaron or vague', 'outcome': 'refused', 'reason': 'Heard as Aaron\'s, the Latin\'s ejus.'},
         {'verse': '132:2b', 'remark': 'dew moving from Hermon to Sion, or a comparison', 'outcome': 'refused', 'reason': 'The Latin says the same words (ros Hermon qui descéndit in montem Sion); not to be resolved.'},
         {'verse': '132:3b', 'remark': 'ali: Sion or the brothers\' dwelling', 'outcome': 'refused', 'reason': 'illic is open the same way; kept open.'},
         {'verse': '132:3b', 'remark': 'ordenou: commanded / arranged / ordained', 'outcome': 'refused', 'reason': 'Commanded heard first; the mandáre row\'s word.'},
         {'verse': '132:3b', 'remark': 'e a vida: object of ordenou or an exclamation', 'outcome': 'refused', 'reason': 'Object heard first, as the Latin.'},
         {'verse': '132:2a', 'remark': 'unknown: unguento', 'outcome': 'option', 'decision': 'unguentum', 'reason': 'The ointment of anointing is the Latin\'s image; o perfume / o óleo perfumado are options.'},
         {'verse': '132:2b', 'remark': 'unknown: orla, Hermon, Aarão', 'outcome': 'refused', 'reason': 'orla is the word of every Brazilian text of this verse (circulation.md); Hermon and Aarão are proper names, kept (rows).'}]},
    {'step': 'revision', 'version': 2, 'note': 'v2: 132:1 ends que os irmãos habitem juntos (the stylist, grammar only); 132:3b Porque made a decision with Pois as option; everything else as v1.'}]

p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
