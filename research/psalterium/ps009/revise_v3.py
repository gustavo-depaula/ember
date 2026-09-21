"""Stage one, draft 2 → draft 3 after the Latinist gate critic/v2.latinist.json: in finem → para sempre.
python3.13 research/psalterium/ps009/revise_v3.py  (reads prayed.v2.json)"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
data = json.loads((here / 'prayed.v2.json').read_text(encoding='utf-8'))
dec = {d['id']: d for d in data['decisions']}


def opt(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


d = dec['in_finem']
d['why'] = ('in finem (εἰς τέλος) stands three times in Ps 9 (9:7a, 9:19 twice; 9:32 in the second stage) beside in ætérnum (9:6, 9:7b, 9:37), '
            'and in 19 verses of the psalter (grep; 12:1 obliviscéris me in finem, 43:23, 73:1, 73:19, 78:5, 88:47 …). Draft 1–2 kept it apart from in ætérnum '
            'as ‘até o fim’, on D15’s test (a different Greek phrase). It failed where it is negated: in 9:19b ‘a paciência dos pobres não perecerá até o fim’ '
            'was marked MAJOR by the Latinist on draft 2 (‘até’ bounds the negation: it may perish when the end comes), and the blind reader of draft 1 had '
            'already heard exactly that as a third reading. In the Latin the phrase says perpetuity (L&S finis: ‘in finem, to the end, for ever’); Douay-Rheims '
            'itself turns 9:19b ‘for ever’. In 9:19 the Greek has εἰς τέλος then εἰς τὸν αἰῶνα and the Latin repeats in finem: the repetition is kept either way.')
d['options'] = [
    opt('para sempre', {'finem': 'para sempre'}, 'Ruling since draft 3, proposed for the glossary: in finem → para sempre, one with in ætérnum and in sǽculum (D23), as Matos Soares 1932 has it in all three places. '
        'D15’s test gives way here because the plain second phrase changes the sense wherever it is negated — and most of the 19 places are negated or questions '
        '(12:1 Úsquequo … obliviscéris me in finem?, 43:23 ne repéllas in finem, 73:19 ne obliviscáris in finem). Cost: 9:7a and 9:7b now end in the same words for two Latin phrases '
        '(‘desfaleceram para sempre … permanece para sempre’) — the antithesis the psalm makes, heard; the column shows the two phrases. Where the sense is ‘utterly’ rather '
        'than ‘for ever’ (17:36b corréxit me in finem, 37:7 curvátus sum usque in finem) the psalm that meets it decides.', 'latinist'),
    opt('até o fim', {'finem': 'até o fim'}, 'Drafts 1–2: the Latin’s noun and Douay-Rheims’ ‘unto the end’, kept apart from in ætérnum. Good in the affirmative (9:7a); in the negative (9:19) it bounds the negation — the Latinist’s major, the blind reader’s third reading.', 'DRB'),
]

v = dec['v19a']
v['options'][0]['note'] = ('Ruling (draft 2, the stylist’s order with the Latin’s verb). Since draft 3 it reads ‘o esquecimento do pobre não será para sempre’: the idiom, '
                          'and the order the stylist asked for; ‘sempre’ now ends both cola — the Latin’s own repetition of in finem.')
v['options'][0]['label'] = 'o esquecimento do pobre não será para sempre'
v['options'][1]['label'] = 'não será para sempre o esquecimento do pobre'
v['options'][2]['label'] = 'o esquecimento do pobre não durará para sempre'

data['choices']['9:19'] = ('oblívio páuperis → ‘o esquecimento do pobre’: open, as the Latin is, between the poor man forgetting and being forgotten. patiéntia → paciência '
                          '(Douay-Rheims ‘patience’), not the Hebrew family’s ‘esperança’. The repetition ‘para sempre … para sempre’ is the Latin’s (in finem twice; decision in_finem).')
data['choices']['9:7a'] = data['choices']['9:7a'] + ' Since draft 3 the verse ends its first colon ‘para sempre’, as 9:7b ends: two Latin phrases, one Portuguese (decision in_finem).'
data['version'] = 3
(here / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 3 written')
