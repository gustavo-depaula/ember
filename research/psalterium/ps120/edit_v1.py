"""Ps 120 draft 1: settle 120:6 on 'De dia … de noite' and record the checks step."""
import json
from pathlib import Path

p = Path(__file__).with_name('prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))

for x in d['decisions']:
    if x['id'] == 'perdiem':
        dur, de = x['options']
        dur['note'] = ("The glossary's working rows (12:2 per diem; 91:3 per noctem), the Latin's 'per' twice; Matos Soares 1932 "
                       "has 'Durante o dia'. Not taken: here the pair is the whole colon, and 'Durante o dia o sol não te queimará' "
                       "is 13 syllables against the Latin's 8 (checks.py +5), 'nem a lua durante a noite' +3.")
        dur['from'] = 'glossary'
        de['note'] = ("Draft. The row's own option, and the Diurnal Monástico 1962's pair ('De dia o sol não te fará mal, * nem a lua, à noite'). "
                      "'de dia' is 'by day' exactly (per diem, ἡμέρας); it cannot be heard as 'all day long', which was the row's worry about "
                      "'durante' at 12:2 anyway. Both colons come within two syllables of the Latin.")
        de['from'] = 'DM1962'
        x['options'] = [de, dur]
        x['why'] = ("The glossary's working rows are 'per diem' → 'durante o dia' (12:2; open, 'de dia' its option) and 91:3 'per noctem' → "
                    "'durante a noite'. Here the two stand as a pair, one in each colon of a short verse, and the length of the colon matters "
                    "for the tone.")

d['choices']['120:6'] = ("úrere → queimar, as 25:2 'queimai os meus rins'. The verb is gapped for the moon ('nem a lua de noite'), as in the "
                         "Latin. 'De dia … de noite' departs from the working row per diem → durante o dia for length (see the decision; "
                         "proposed in glossary.md).")
d['choices']['120:4'] += (" Second colon +3 by checks.py ('aquele que guarda Israel', 10 against 7), accepted: 'aquele que' matches 120:3 "
                          "'aquele que te guarda' for the same Latin 'qui custódit', and 'o que guarda' can be heard as 'what guards'.")
d['choices']['120:8'] += (" Second colon +3 by checks.py, accepted: it is the fixed formula (D37).")

d['audit'].append({
    'step': 'checks',
    'note': ("Draft 1: hard pass (ids and marks). Soft flags: 120:6 was +5/+3 with 'Durante o dia … durante a noite' → changed to "
             "'De dia … de noite' before any reader (decision perdiem). Remaining: 120:4 second colon +3 (accepted, see choices), "
             "120:8 second colon +3 (the D37 formula, accepted). No rhyme or cadence flags."),
})

p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
