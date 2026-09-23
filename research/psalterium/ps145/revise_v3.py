"""v3 of Ps 145: the v2 Latinist gate recorded (145:4 major held), and 145:8b copies 144:14 (finished in parallel).
Run from the repo root after copying prayed.json to prayed.v2.json: python3.13 research/psalterium/ps145/revise_v3.py"""
import json
from pathlib import Path

p = Path('research/psalterium/ps145/prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
dec = {x['id']: x for x in d['decisions']}
d['version'] = 3
d['status'] = 'reviewed'

t = dec['terram']
t['why'] += (" v2 gate: the Latinist (v2) marked the dropped *suam* **major** and asked back *e voltará à sua terra*. **Held, for Gustavo.** "
             "The two readings cost different things: without *suam* the verse loses a reflexive possessive (the earth that is his, which "
             "the bare *terra* after a death still says — the ground he came from); with it, a blind reader who saw only the Portuguese heard "
             "first that the man goes home to his native land — a wrong sense, which D2 counts a fault (the same trade as D20's *fora do* "
             "against the calque). No third wording keeps both: *à sua própria terra* is still the homeland, *à terra de onde veio* (the CNBB "
             "LH's build) supplies a clause. *voltará à sua terra* is option 1, one touch away.")

e = dec['elisos']
e['why'] += (" v3: Ps 144 (finished in parallel) rules 144:14 *et érigit omnes elísos* → *e ergue todos os esmagados* and its glossary row "
             "(elísi, open) says 145:8 should copy it. Identical Latin gets identical Portuguese (rule 6), and the Tuesday Lauds antiphon joins "
             "this verse to 145:2a, so the two psalms should say the same thing. My v1 objection to *esmagados* (one does not raise the crushed) "
             "is weaker than the consistency: 144's ambiguity reader heard 'the oppressed and downtrodden', which is the sense, and the word is "
             "nearer L&S's 'crush' than *derrubados*. The v1 ambiguity reader had understood *derrubados* too; it stays option 1.")
e['options'] = [
    {'label': 'esmagados', 'forms': {'elisos': 'esmagados'}, 'note': 'v3 ruling: = 144:14 (the elísi row). L&S crush.', 'from': 'glossary'},
    {'label': 'derrubados', 'forms': {'elisos': 'derrubados'}, 'note': 'v1–v2; struck down. Understood by the v1 ambiguity reader. Differs from 144:14.', 'from': 'draft'},
    {'label': 'abatidos', 'forms': {'elisos': 'abatidos'}, 'note': 'Familiar; heard first as dejected.', 'from': 'draft'},
    {'label': 'caídos', 'forms': {'elisos': 'caídos'}, 'note': "MS1932 here; 144:14 uses 'cair' for qui córruunt in the same verse.", 'from': 'MS1932'},
]

d['audit'] += [
    {'step': 'latinist', 'version': 2, 'file': 'critic/v2.latinist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)',
     'note': ('Gate on v2: one major, one minor. "Faithful and close"; tenses, numbers and the vocative Sion kept. '
              'The major (suam dropped at 145:4) is held with a reason and flagged for Gustavo; the minor (the relative at 145:7a) is his v1 remark '
              'again, held as the option.'),
     'outcomes': [
         {'verse': '145:4', 'remark': "'suam' dropped → e voltará à sua terra (major)", 'outcome': 'option', 'decision': 'terram',
          'reason': "held: with 'sua' the blind ambiguity reader heard the native land (a wrong sense); without it only a reflexive possessive is lost. For Gustavo."},
         {'verse': '145:7a', 'remark': 'relative chain broken → Que guarda (minor)', 'outcome': 'option', 'decision': 'qui7',
          'reason': 'as v1: a relative heading a prayed verse is heard as an exclamation; he calls the finite form understandable'},
     ]},
    {'step': 'revision', 'version': 3,
     'note': ('v3: 145:8b *derrubados* → *esmagados*, copying 144:14 (finished in parallel; rule 6, elísi row). Nothing else changed; '
              'the 145:4 major is held. **Draft 3 has not been read by a gate** (one word, to a glossary rendering). prayed.v2.json kept. '
              'Script: ps145/revise_v3.py.'),
     'checks': 'Hard checks pass; soft flags as v2.'},
]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
