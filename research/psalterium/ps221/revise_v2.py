"""Draft 2 of canticle 221 after the v1 readers (all claude-opus-5-5, fresh context). prayed.v1.json is kept.
python3.13 research/psalterium/ps221/revise_v2.py"""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = here / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if d['version'] >= 2:
    raise SystemExit('already v2')
dec = {x['id']: x for x in d['decisions']}


def promote(did, label, note):
    opts = dec[did]['options']
    i = next(k for k, o in enumerate(opts) if o['label'] == label)
    chosen = opts.pop(i)
    chosen['note'] = note
    opts.insert(0, chosen)


promote('conversus', 'o vosso furor se afastou',
        'v2: the stylist\'s wording. Two readers heard *voltou atrás* as "went back on a decision". The sense is DRB\'s *turned away*. Afastar is avértere\'s verb in Ps 84, but only as that psalm\'s exception, and the two Latin verbs do not meet here.')
dec['conversus']['options'][1]['note'] = 'Draft 1. It keeps the glossary\'s verb, but the stylist and the ambiguity reader both heard "retracted / went back on his word".'
dec['conversus']['from_v2'] = True
dec['conversus']['why'] += ' **v2:** *se afastou* (the stylist) replaces *voltou atrás*. It is a change of verb, and it is made because a wrong first hearing is a fault (the D31/D33 test). The glossary\'s *voltar* stays in option 1.'
del dec['conversus']['from_v2']

promote('magnifice', 'porque fez coisas magníficas',
        'v2: the stylist\'s request, and MS1932\'s wording. It keeps *fez* for *fecit* and the root of *magnífice*, and it no longer shares *agir* with 12:2 *agam*. Cost: a proparoxytone before the mediant (rule 4), accepted.')
dec['magnifice']['options'][1]['note'] = 'Draft 1. The stylist found it bureaucratic and clogged at the mediant, and the ambiguity reader listed *magnificência* as unknown. It shares *agir* with 12:2.'
dec['magnifice']['why'] += ' **v2:** changed to *fez coisas magníficas*: the stylist asked for it, and the ambiguity reader did not know *magnificência*. The supplied noun is grammar (D2). The proparoxytone at the mediant is the price.'

dec['gaudio']['options'][1]['note'] += ' The v1 Latinist (minor) asked for it: *júbilo* is louder than *gáudium*. Held for the row, as canticle 214 did with the same remark.'
dec['gaudio']['options'][1]['from'] = 'latinist'
dec['adinventiones']['options'][2]['note'] = 'The stylist asked for it (as he did at 76:13), with *Dai a conhecer*. It is *consílium*\'s word (D33).'
dec['adinventiones']['options'][2]['from'] = 'stylist'
dec['adinventiones']['why'] += ' **v1 readers:** the stylist (worst line) and the ambiguity reader both heard gadgets or fabrications. This is the same objection as at 76:13. Held for the row, and the evidence is added to the row for Gustavo\'s ruling.'
dec['habitatio']['options'][1]['note'] += ' The v1 stylist asked for it (*habitação* sounds administrative). Refused under D44. The ambiguity reader heard *habitação* as a building rather than its people, and *morada* would be heard the same way.'
dec['habitatio']['options'][1]['from'] = 'stylist'

d['decisions'].append({
    'id': 'notas', 'refs': ['12:5'], 'latin': 'Notas fácite', 'kind': 'glossary',
    'why': 'The *notum fácere* row gives *fazer conhecer* (97:2, 102:7, 142:8b, 144:12). The v1 stylist asked for the idiom *Dai a conhecer*, as the stylists of Pss 97 and 144 did. It is kept for the cross-psalm repetition (rule 6); if the row changes, this follows.',
    'options': [
        {'label': 'Fazei conhecer', 'forms': {'notas': 'Fazei conhecer'}, 'note': 'The row.', 'from': 'glossary'},
        {'label': 'Dai a conhecer', 'forms': {'notas': 'Dai a conhecer'}, 'note': 'The stylist\'s idiom; the third stylist to ask for it.', 'from': 'stylist'},
    ],
})
d['verses']['12:5'] = d['verses']['12:5'].replace('Fazei conhecer', '{notas}')
d['version'] = 2
d['audit'] += [
    {'step': 'latinist', 'file': 'critic/v1.latinist.json', 'note': 'claude-opus-5-5, fresh context, read latin.json. One minor finding, no majors. It found the rendering faithful and the pointing matching.',
     'outcomes': [{'verse': '12:4', 'remark': 'júbilo is louder than gaudium; alegria', 'outcome': 'option', 'decision': 'gaudio',
                   'reason': 'The glossary row gáudium → júbilo is open for a ruling and has been followed in five places, including canticle 214, which refused the same remark. Alegria is lætítia\'s word.'}]},
    {'step': 'stylist', 'file': 'critic/v1.stylist.json', 'note': 'claude-opus-5-5, fresh context, read latin.json. Five remarks: two taken, three kept as options. Worst line 12:5, best 12:4.',
     'outcomes': [
         {'verse': '12:1', 'remark': 'voltou atrás heard as retracting; se afastou', 'outcome': 'taken'},
         {'verse': '12:5', 'remark': 'invenções heard as gadgets or lies; desígnios', 'outcome': 'option', 'decision': 'adinventiones', 'reason': 'This is the row for all six places, and it was held against the same remark at 76:13. Desígnios is consílium\'s word (D33). The question goes to Gustavo with the row.'},
         {'verse': '12:5', 'remark': 'Fazei conhecer calqued; Dai a conhecer', 'outcome': 'option', 'decision': 'notas', 'reason': 'The notum fácere row, repeated across psalms (rule 6).'},
         {'verse': '12:6', 'remark': 'agiu com magnificência clogged; fez coisas magníficas', 'outcome': 'taken'},
         {'verse': '12:7', 'remark': 'habitação administrative; morada', 'outcome': 'option', 'decision': 'habitatio', 'reason': 'Morada is habitáculum\'s word (D44). Habitação is the row\'s word (75:3, 86:7, 131:13), and it was held against the same remark at 86:7.'}]},
    {'step': 'ambiguity', 'file': 'critic/v1.ambiguity.json', 'note': 'claude-opus-5-5, fresh context, read the Portuguese only. It gave twelve readings and listed three unknown words (irastes, excelso, magnificência).',
     'outcomes': [
         {'verse': '12:1', 'remark': 'porque: thanks for the anger itself sounds strange', 'outcome': 'refused', 'reason': 'This is the Latin\'s causal quóniam, kept open on purpose (decision quoniam).'},
         {'verse': '12:1', 'remark': 'voltou atrás = went back on a decision', 'outcome': 'taken', 'reason': 'Changed to se afastou, with the stylist.'},
         {'verse': '12:4', 'remark': 'tirareis: sudden, unclear addressee', 'outcome': 'refused', 'reason': 'The Latin turns to the plural in the same way. DO\'s text drops the Vulgate\'s lead-in *Et dices*, so it is DO\'s cut, not ours to repair.'},
         {'verse': '12:5', 'remark': 'invenções heard as devices or fabrications', 'outcome': 'option', 'decision': 'adinventiones', 'reason': 'Held for the row, with the stylist\'s remark; for Gustavo.'},
         {'verse': '12:6', 'remark': 'magnificência unknown', 'outcome': 'taken', 'reason': 'Changed to fez coisas magníficas.'},
         {'verse': '12:7', 'remark': 'habitação heard as a building, not its people', 'outcome': 'refused', 'reason': 'The Latin itself addresses the dwelling (habitátio, an abstract feminine), and the Hebrew and Greek say the inhabitants. Following the Latin, the image stays.'},
         {'verse': '12:1, 12:5', 'remark': 'irastes, excelso unknown', 'outcome': 'refused', 'reason': 'Both are settled psalter words (irar-se; D43 excelso).'}]},
    {'step': 'revision', 'version': 2, 'note': 'v2 has two wording changes: 12:1 *o vosso furor se afastou* and 12:6 *porque fez coisas magníficas*. It also adds a decision `notas` for the stylist\'s refused *Dai a conhecer*. prayed.v1.json is kept.'},
]
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('v2 written')
