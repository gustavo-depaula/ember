"""v1 adjustments after the first checks run (149:3b articles, 149:5b order)."""
import json
from pathlib import Path

p = Path(__file__).with_name('prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
d['verses']['149:3'] = 'Louvem o seu nome {choro}: * com tamborim e saltério entoem-lhe salmos:'
for dec in d['decisions']:
    if dec['id'] == 'cubil':
        o = dec['options']
        o[0], o[1] = o[1], o[0]
        o[0]['note'] = "Ruling: the Latin's order; the response reads alone. Mesóclise, which here, at the head of a versicle's response in a liturgical register, reads naturally enough and is the only correct form in that place."
        o[1]['note'] = "The phrase first (chiasm with the first colon); avoids the mesóclise, but its final 'alegrarão' rhymes with 149:4's final 'salvação' (checks.py flag), an echo the Latin (salútem / suis) does not have."
        dec['why'] = dec['why'].replace("Moving the phrase first — 'nos seus leitos se alegrarão' — avoids both and makes a chiasm with the first colon; order yields to the ear (D2).", "Moving the phrase first — 'nos seus leitos se alegrarão' — avoids both, but checks.py flagged its final as a rhyme with 149:4 'salvação', which the Latin does not have (rule 5 counts that a defect). So the Latin's order with the mesóclise: 'alegrar-se-ão nos seus leitos'.")
d['choices']['149:3'] = d['choices']['149:3'] + " 'com tamborim e saltério' without articles, as the Latin: the colon was +3 syllables with them (checks.py)."
d['audit'].append({"step": "checks", "note": "Hard pass. First run: 149:3b +3 (articles dropped, as the Latin has none); 149:4/149:5 finals rhymed (-ão), removed by giving 149:5b the Latin's order with mesóclise. Accepted: 149:4a −4, 149:6b −3, 149:8a −5 — Portuguese says these colons in fewer syllables with nothing left out (the Latin's long gerundive and proparoxytone endings); padding would add words the Latin lacks."})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
