"""After the v2 gate and the v2 blind reading: notes only (option 0 and the text are untouched). Safe to re-run."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
path = folder / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}

d = decisions['infinem']
if 'obliviscéris' not in d['why']:
    d['why'] += (' The verb of the colon, ‘me esquecereis’, is the future: the psalter marks it by the accent — 12:1 obliviscéris'
                 ' (long ē, future) against 43:24 oblivísceris (the present, beside avértis there) — and the Greek has the'
                 ' future ἐπιλήσῃ. HELD AGAINST THE LATINIST’S MAJOR (draft 2), who read the present and asked for'
                 ' ‘me esqueceis’: he misread the form, he passed the same words on draft 1, and the blind reader heard the'
                 ' question as the Latin’s (‘will you forget me for good?’). The present stays with the second colon'
                 ' (‘desviais’, avértis), as the Latin has it.')

d = decisions['zeugma']
if 'draft 2' not in d['options'][0]['note']:
    d['options'][0]['note'] += (' Tested (draft 2): the blind reader now takes ‘dor’ as the second thing set, ‘pôr dor no próprio'
                                ' coração’ beside ‘carry sorrow’ — both are the Latin’s ponam … dolórem; the misparse'
                                ' ‘enquanto houver dor’ is gone.')

d = decisions['tribuit']
if 'raised no item' not in d['options'][0]['note']:
    d['options'][0]['note'] += ' Tested (draft 2): the blind reader raised no item on the colon.'

data['status'] = 'reviewed'
steps = [
    {
        'step': 'checks',
        'note': 'Draft 2: hard pass. Soft flags as draft 1: 12:3 second colon −4, 12:5b +3 / −3, 12:6b last colon +5 (the copied 7:18b colon). 12:2 first colon grows by ‘hei de’; every cadence oxytone or paroxytone; no rhyme flag.',
    },
    {
        'step': 'latinist',
        'file': 'critic/v2.latinist.json',
        'note': 'Draft 2 — the gate. NOT clean: one major, held on purpose (12:1). ‘obliviscéris me’ read as a present → ‘me esqueceis’. The accented form is the future (43:24 has the present oblivísceris), the Greek is future, and he passed the same words on draft 1. Nothing else: the two draft-2 changes (12:2 ‘hei de pôr … e dor’, 12:6b ‘que me deu coisas boas’) passed, and all division marks are in the Latin’s order.',
        'outcomes': [
            {'verse': '12:1', 'remark': '‘me esquecereis’ puts the present obliviscéris in the future → ‘me esqueceis’ (MAJOR)', 'outcome': 'refused', 'decision': 'infinem', 'reason': 'A misreading: obliviscéris (accent on -scé-, long ē) is the future; the present is 43:24 oblivísceris. Greek ἐπιλήσῃ, future. He passed it on draft 1 (D24: weighed, not obeyed).'},
        ],
    },
    {
        'step': 'ambiguity',
        'file': 'critic/v2.ambiguity.json',
        'note': 'Draft 2, Portuguese only — run to test the two fixes. Both hold: 12:2 ‘e dor no meu coração’ is heard as a second object of ‘pôr’ (setting sorrow / carrying it — both the Latin’s), no longer as ‘while there is sorrow’; 12:6b ‘que me deu coisas boas’ drew no item. Unknown words: atribulam (again), exultarão, exultará (glossary: exsultáre → exultar, listed as unknown before and kept). The rest is the Latin’s own range, as draft 1.',
        'outcomes': [
            {'verse': '12:2', 'remark': '‘e dor no meu coração’: set sorrow in one’s own heart / carry sorrow (heard first)', 'outcome': 'refused', 'decision': 'zeugma', 'reason': 'The fix holds; both readings are ponam … dolórem.'},
            {'verse': '12:2', 'remark': '‘pôr conselhos na minha alma’: keep advice received (heard first) / deliberate', 'outcome': 'refused', 'decision': 'consilia', 'reason': 'As draft 1; ‘planos’ stays an option.'},
            {'verse': '12:5b', 'remark': 'unknown words: atribulam, exultarão; 12:6b exultará', 'outcome': 'refused', 'reason': 'Glossary words (tribuláre, exsultáre), known costs.'},
        ],
    },
]
known = [json.dumps(s, sort_keys=True, ensure_ascii=False) for s in data['audit']]
for step in steps:
    if json.dumps(step, sort_keys=True, ensure_ascii=False) not in known:
        data['audit'].append(step)
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('patched')
