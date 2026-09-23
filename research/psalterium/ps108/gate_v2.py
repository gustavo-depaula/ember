"""Record the v2 Latinist gate in ps108/prayed.json; hold its minors as options."""
import json
from pathlib import Path

p = Path(__file__).parent / 'prayed.json'
d = json.loads(p.read_text())
dec = {x['id']: x for x in d['decisions']}


def add(id, option):
    if all(o['label'] != option['label'] for o in dec[id]['options']):
        dec[id]['options'].append(option)


add('tacueris', {'label': 'não vos caleis ao meu louvor', 'forms': {'tacueris': 'não vos caleis ao meu louvor'},
                 'note': 'v2 Latinist minor: God not silent toward the one who praises; the calar-se row', 'from': 'latinist'})
add('nati', {'label': 'os seus filhos … votados à destruição', 'forms': {'nati': 'os seus filhos', 'interitum': 'votados à destruição'},
             'note': 'v2 Latinist minor: no act of handing over', 'from': 'latinist'})
if 'eripiens' not in dec:
    d['decisions'].append({
        'id': 'persequentibus',
        'refs': ['108:31'],
        'latin': 'a persequéntibus ánimam meam',
        'kind': 'word',
        'why': ('*a persequéntibus* has no object in the Latin (the Greek: ἐκ τῶν καταδιωκόντων). *dos que a perseguem* supplies *a* (the soul),'
                ' which the Latin leaves open; the v2 Latinist asked for the bare noun. Kept: *dos perseguidores* is heavier at the close and'
                ' the soul is what they pursue in every psalm where the Latin names it (7:6, 141:7).'),
        'options': [
            {'label': 'dos que a perseguem', 'forms': {'persequentibus': 'dos que a perseguem'}, 'note': 'draft', 'from': 'draft'},
            {'label': 'dos perseguidores', 'forms': {'persequentibus': 'dos perseguidores'}, 'note': 'v2 Latinist minor; the Latin\'s absolute participle', 'from': 'latinist'},
        ],
    })
    d['verses']['108:31'] = 'Porque se pôs à direita do pobre, * para salvar a minha alma {persequentibus}.'

d['status'] = 'reviewed'
d['audit'].append({
    'step': 'gate v2',
    'note': 'Latinist gate (claude-opus-5-5, fresh context, with latin.json), critic/v2.latinist.json: no majors or criticals; five minors.',
    'outcomes': [
        '108:2 *não caleis o meu louvor* may read as God stifling the praise — held as option (decision tacueris): the transitive *calar* keeps both senses of *laudem meam*; *ao meu louvor* picks one',
        '108:13 *entregues* adds an act — held as option *votados à destruição* (decision nati); *entregues* follows 43:22b and keeps *Sejam … para* from being heard as purpose',
        '108:21 *agi comigo* — refused: rule 3 (*agi* = first-person past); *tratai-me* is the fácere cum row',
        '108:29 *pudor → vergonha, confúsio → confusão* — refused: the pair follows 70:13 and 34:26b (*desonra / vergonha*, the reveréri row); *confusão* is D15\'s rejected sense',
        '108:31 supplied *a* — held as option *dos perseguidores* (new decision persequentibus)',
    ],
})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print(len(d['decisions']))
