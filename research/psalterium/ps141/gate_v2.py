"""Record the v2 Latinist gate in Ps 141's prayed.json (no wording change). python3.13 research/psalterium/ps141/gate_v2.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    raise SystemExit('already recorded')
dec = {x['id']: x for x in d['decisions']}

dec['deficiendo']['options'].append({
    'label': 'Quando o meu espírito desfalecia de mim',
    'forms': {'deficiendo': 'Quando o meu espírito desfalecia de mim'},
    'note': 'the v2 Latinist\'s fix, ex me as de mim; after desfalecer, de is heard as cause (desfalecer de fome) or not at all', 'from': 'latinist'})
dec['deficiendo']['why'] += (' The v2 Latinist (minor) asked desfalecia de mim for ex me. Held: desfalecer de is heard as the cause of fainting, which is a wrong first hearing; '
                             'the motion of ex me is offered by option 1 (se esvaía de mim), which changes the verb. The ambiguity reader heard em mim without trouble.')
dec['et_tu']['options'][2]['note'] += '; asked by the v2 Latinist (minor)'
dec['et_tu']['why'] += (' The v2 Latinist (minor) proposed então vós. Held: então makes the knowing follow the fainting in time ("only then you knew"), '
                        'a reading the Latin does not force — it can as well be "you knew all along"; the bare vós leaves that open, and DRB\'s then is a choice among them.')

d['verses']['141:7b'] = 'Livrai-me dos que me perseguem: * porque {super_me}.'
d['decisions'].append({
    'id': 'super_me', 'refs': ['141:7b'], 'latin': 'quia confortáti sunt super me', 'kind': 'ambiguity',
    'why': 'The colon is word for word 17:18b (quóniam confortáti sunt super me → porque se fortaleceram mais do que eu), so identical Latin keeps identical Portuguese (rule 6). '
           'ὑπὲρ ἐμέ is comparative in Greek usage (DRB and MS1932: stronger than I); in Ps 17 the stylist heard acima de mim as a place, and the comparison was taken. '
           'The v2 Latinist (minor) asks sobre mim to keep the Latin open between "beyond me" and "over / against me". Held for the doublet; sobre mim is an option and, '
           'if taken, should be taken in 17:18 too.',
    'options': [
        {'label': 'se fortaleceram mais do que eu', 'forms': {'super_me': 'se fortaleceram mais do que eu'}, 'note': '= 17:18b; DRB, MS1932', 'from': 'glossary'},
        {'label': 'se fortaleceram sobre mim', 'forms': {'super_me': 'se fortaleceram sobre mim'}, 'note': 'the v2 Latinist\'s; keeps super open; would break the doublet with 17:18b', 'from': 'latinist'},
    ]})

d['audit'].append({
    'step': 'latinist', 'file': 'critic/v2.latinist.json', 'model': 'claude-opus-5-5 (fresh context, with latin.json)',
    'note': 'Gate on draft 2: no major. Three minors, all held with reasons and kept as options (no wording change): 141:4 ex me, 141:4 the apodotic et, 141:7b super me. Overall: faithful, close.',
    'outcomes': [
        {'verse': '141:4', 'remark': 'ex me → de mim, not em mim', 'outcome': 'option', 'decision': 'deficiendo',
         'reason': 'desfalecer de is heard as the cause of fainting; the motion is available as se esvaía de mim.'},
        {'verse': '141:4', 'remark': 'et dropped; então vós', 'outcome': 'option', 'decision': 'et_tu',
         'reason': 'então sets the knowing after the fainting in time, a reading the Latin leaves open; the conjunction is grammar (D2).'},
        {'verse': '141:7b', 'remark': 'super me settled as comparative; sobre mim', 'outcome': 'option', 'decision': 'super_me',
         'reason': 'Identical to 17:18b, which reads mais do que eu; the doublet is kept (rule 6).'}]})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
