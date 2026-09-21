"""Stage one, draft 2 → draft 3 after the Latinist gate (critic/v2.latinist.json).
python3.13 research/psalterium/ps017/revise_v3.py   (reads prayed.v2.json, writes prayed.json)"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
data = json.loads((here / 'prayed.v2.json').read_text(encoding='utf-8'))
dec = {d['id']: d for d in data['decisions']}
V = data['verses']


def opt(label, forms, note, source='draft'):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


# 17:13 — in conspéctu ejus is not the clarão's genitive: set it off (the gate's own fix)
assert V['17:13'].startswith('{prae} {c13} passaram as nuvens')
V['17:13'] = V['17:13'].replace('{prae} {c13} passaram as nuvens', '{prae} passaram as nuvens')
p = dec['prae']
p['options'] = [
    opt('Diante do clarão, na sua presença,', {'prae': 'Diante do clarão, {c13},'}, 'Ruling from draft 3, the Latinist\'s fix on draft 2 (major): in conspéctu ejus is where the clouds pass, not whose the brightness is — so it is set off between commas, not made a genitive. "Diante de" is both "before" and "in the face of" (cause), as præ is; clarão is the plain word for a flash of light (DM1962\'s word in this verse); the stylist\'s "Diante do" kept.', 'latinist'),
    opt('Diante do clarão da sua presença', {'prae': 'Diante do clarão da sua presença'}, 'Draft 2 (MS1932\'s build, "Diante do resplendor da sua presença"): one prepositional phrase before the verb, for the stylist; the Latinist (v2, major) — it fuses two phrases, making the presence the brightness\'s owner.', 'MS1932'),
    opt('Ao fulgor, {c13},', {'prae': 'Ao fulgor, {c13},'}, 'Draft 1\'s words (DRB "At the brightness"), with the commas; the stylist\'s worst line on draft 1, and fulgor was unknown to the blind reader.'),
    opt('Diante do fulgor, {c13},', {'prae': 'Diante do fulgor, {c13},'}, 'The stylist\'s own line; fulgor was unknown to the blind reader.', 'stylist')]
p['options'][2]['label'] = 'Ao fulgor, na sua presença,'
p['options'][3]['label'] = 'Diante do fulgor, na sua presença,'
p['why'] += ' Draft 3: the Latinist (v2, MAJOR) refused the genitive "o clarão da sua presença" — it fuses two phrases — and proposed the commas. Taken; a two-comma change proposed by the gate itself, not re-read.'
c = dec['conspectu']
c['options'][0]['forms']['c13'] = 'na sua presença'
c['options'][0]['note'] = c['options'][0]['note'].replace(' Draft 2: in 17:13 the phrase becomes a genitive, "o clarão da sua presença" (MS1932\'s build), so that the colon has one prepositional phrase before its verb, not two (the stylist).', ' Draft 3: in 17:13 it stands between commas ("Diante do clarão, na sua presença, passaram as nuvens"), after the genitive of draft 2 was refused by the Latinist.')

# the two agent nouns held against the gate: say so in the decisions
dec['adjutor']['why'] += ' HELD AGAINST THE LATINIST: minor on draft 1, MAJOR on draft 2 with the words unchanged — the pattern D24 recorded at 118:114 (minor, then major, then major on the same words) and D27 at 9:10. Weighed, not obeyed: auxílio is the glossary\'s word in four psalms; auxiliador is long and hardly said; and the same metonymy for suscéptor is settled (D19). If Gustavo wants the agent nouns, option 1 here and option 1 of decision susceptor turn both at once.'
data['decisions'].insert(5, {
    'id': 'susceptor', 'refs': ['17:3c'], 'latin': 'et suscéptor meus', 'kind': 'glossary',
    'why': 'suscéptor → amparo is settled (D19): the noun is ἀντιλήμπτωρ, "the one who takes hold of, supports", and amparo keeps one family with suscípere → amparar (17:36a déxtera tua suscépit me will say "me amparou"). HELD AGAINST THE LATINIST: minor on draft 1 ("o meu amparador"), MAJOR on draft 2 with the words unchanged ("aquele que me ampara") — two different fixes on two readings. Weighed under D24: the agent noun amparador is not current Portuguese; the relative clause is three words for one and breaks the list of titles (o meu esteio, o meu refúgio, o meu libertador … o meu amparo).',
    'options': [opt('o meu amparo', {'susc': 'o meu amparo'}, 'Ruling: the settled word (D19), as in 3:4, 53:6, 118:114.', 'glossary'),
                opt('aquele que me ampara', {'susc': 'aquele que me ampara'}, 'The Latinist\'s fix on draft 2 (major): the agent kept as a clause.', 'latinist'),
                opt('o meu amparador', {'susc': 'o meu amparador'}, 'The Latinist\'s fix on draft 1 (minor): an agent noun Portuguese hardly has.', 'latinist'),
                opt('o meu defensor', {'susc': 'o meu defensor'}, 'Matos Soares 1932: an agent noun, but defending is not taking up.', 'MS1932')]})
assert V['17:3c'].endswith('* e o meu amparo.')
V['17:3c'] = V['17:3c'].replace('* e o meu amparo.', '* e {susc}.')

data['version'] = 3
data['audit'] += [
    {'step': 'latinist', 'file': 'critic/v2.latinist.json', 'note': 'Stage one, the gate on draft 2. Three verses, all MAJOR. 17:13 taken (the genitive refused; commas). 17:3b auxílio and 17:3c amparo HELD on purpose — both minors on draft 1 with the same words, majors now; the glossary words of four psalms (D19 settled, D24). Everything changed in draft 2 passed: esteio, "os laços da morte me surpreenderam", "se irou contra eles", "havia uma névoa escura", "dispersou", "do mundo", "se fortaleceram mais do que eu", "me apartei impiamente do meu Deus". Marks confirmed in all 27 verses.',
     'outcomes': [
         {'verse': '17:3b', 'remark': 'adjútor names the one who helps; "o meu auxílio" substitutes the help given (MAJOR) → "o meu auxiliador"', 'outcome': 'option', 'decision': 'adjutor', 'reason': 'Held against the gate: minor on draft 1 with the same words; the glossary word of Pss 9, 117, 118 (held there against the same request, D24, D27); auxiliador is long and hardly said.'},
         {'verse': '17:3c', 'remark': 'suscéptor names the one who takes up; "o meu amparo" turns it into an abstraction (MAJOR) → "aquele que me ampara"', 'outcome': 'option', 'decision': 'susceptor', 'reason': 'Held against the gate: settled (D19); minor on draft 1 with the same words and another fix (amparador); the clause breaks the list of titles.'},
         {'verse': '17:13', 'remark': '"o clarão da sua presença" fuses two phrases: in conspéctu ejus does not say whose the brightness is (MAJOR) → "Diante do clarão, na sua presença, passaram as nuvens"', 'outcome': 'taken', 'decision': 'prae', 'reason': 'Right: draft 2 made a genitive of an adverbial phrase for the stylist\'s sake; the commas give the stylist the pause he wanted as well.'}]},
    {'step': 'revision', 'version': 3, 'note': 'Stage one, draft 3 (revise_v3.py; draft 2 kept as prayed.v2.json): 17:13 "Diante do clarão, na sua presença, passaram as nuvens" (the gate\'s fix); a decision susceptor made for 17:3c so that the hold against the gate is recorded where the word is. Not re-read by a critic: a two-comma change proposed by the gate itself. Stage one ends here, at 17:25; its gate stands with two majors held on purpose (17:3b auxílio, 17:3c amparo).'},
]
(here / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft', data['version'], len(data['decisions']), 'decisions')
