"""Ps 30 draft 2 -> draft 3: the one major of the v2 Latinist gate, taken verbatim. python3.13 research/psalterium/ps030/revise_v3.py
Reads prayed.v2.json (never prayed.json), so it is safe to re-run."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
data = json.loads((folder / 'prayed.v2.json').read_text(encoding='utf-8'))
decisions = {d['id']: d for d in data['decisions']}


def option(label, forms, note, source):
    return {'label': label, 'forms': forms, 'note': note, 'from': source}


data['version'] = 3
d = decisions['valde']
d['why'] += (' Gate (draft 2): the Latinist, MAJOR — «“Valde” intensifica o grau da afronta … “Sobretudo” introduz uma comparação entre os'
             ' vizinhos e os demais que o latim não expressa» → ‘e sobremaneira para os meus vizinhos’. Taken verbatim in draft 3: it'
             ' says the degree, bound to the dative, and does not hang as \'muito\' did (the stylist\'s worst line). It is the more formal word;'
             ' \'grandemente\' (the valde / veheménter row\'s local alternative) is the option nearest to it. Draft 3 has not been read by a'
             ' critic; the change is one adverb, his own.')
o = d['options'][0]
o['note'] = 'Draft 2. ' + o['note'].removeprefix('Ruling (draft 2): ')
d['options'].insert(0, option('sobremaneira', {'valde': 'sobremaneira'}, 'Ruling (draft 3): the Latinist\'s gate, verbatim.', 'latinist'))
d['options'].insert(2, option('grandemente', {'valde': 'grandemente'}, 'The degree, plainer to some ears.', 'draft'))

data['audit'].append({
    'step': 'latinist', 'file': 'critic/v2.latinist.json',
    'note': 'Draft 2 — the gate. One remark: 30:12 MAJOR on draft 2\'s \'sobretudo\' (a comparison the Latin does not make) → \'sobremaneira\'.'
            ' Every other draft-2 change passed without remark (30:10 \'na ira foram perturbados …\', 30:11b \'se enfraqueceu … foram'
            ' perturbados\', \'Mais que todos os meus inimigos\', \'fugiram para fora, longe de mim\', \'vaso destruído\', \'planejaram\','
            ' \'longe da perturbação\', \'abundantemente aos que agem com soberba\'). «Nos 31 versículos, encontrei uma alteração de sentido em'
            ' “valde”; as demais escolhas são defensáveis como tradução do latim.»',
    'outcomes': [{'verse': '30:12', 'remark': "MAJOR: 'sobretudo' introduces a comparison; valde is degree → 'e sobremaneira para os meus vizinhos'",
                  'outcome': 'taken', 'decision': 'valde'}],
})
data['audit'].append({'step': 'revision', 'version': 3,
                      'note': 'v3 (revise_v3.py, from prayed.v2.json): 30:12 \'sobretudo\' → \'sobremaneira\', the gate\'s fix verbatim. No other change; no critic has read draft 3.'})
(folder / 'prayed.json').write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('draft 3 written')
