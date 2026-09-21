"""Ps 28: record the v2 Latinist gate in the decision it concerns and in the audit (no wording changes).
python3.13 research/psalterium/ps028/patch_gate.py — idempotent."""
import json
from pathlib import Path

folder = Path(__file__).resolve().parent
path = folder / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
d = next(d for d in data['decisions'] if d['id'] == 'cervos')
held = (' Gate (draft 2): the Latinist, now MAJOR on the same word — «“Cervos” é masculino; “corças” especifica fêmeas, introduzindo uma'
        ' distinção que o latim não faz». HELD on purpose: the objection is the known cost (gender), where the alternative is a wrong'
        ' first hearing (\'que prepara os servos\', a sentence a praying ear accepts, with no animal named before it in the verse); the'
        ' 17:34 blind reader made exactly that mishearing; \'veados\' is a slur in Brazil. The same unchanged word was a minor on draft 1'
        ' and a major on draft 2 (D24\'s variance). \'os cervos\' stays option 2, one touch away; the glossary row cervus asks for a ruling.')
if held.strip() not in d['why']:
    d['why'] += held
step = {
    'step': 'latinist',
    'file': 'critic/v2.latinist.json',
    'note': 'Draft 2 — the gate. One remark: 28:9 corças, now MAJOR on the same word he marked minor on draft 1; held. Every draft-2 change'
            ' passed without remark (ao seu nome, the fronted comparison of 28:6 and its copula, e que desnudará as matas densas).'
            ' «A tradução conserva adequadamente o sentido do latim, inclusive suas imagens incomuns.»',
    'outcomes': [{'verse': '28:9', 'remark': "MAJOR: 'corças' specifies females; the Latin's masculine does not → 'os cervos'",
                  'outcome': 'refused', 'decision': 'cervos',
                  'reason': "Held: cervos / servos are homophones (the 17:34 blind reader's fault); the gender is the lesser loss. Minor on draft 1, major on draft 2, same word."}],
}
if not any(s.get('file') == 'critic/v2.latinist.json' for s in data['audit']):
    data['audit'].append(step)
data['status'] = 'reviewed'
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('patched')
