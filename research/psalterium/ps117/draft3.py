"""Ps 117, draft 2 → draft 3: the ruling of DECISIONS.md D13 on 117:19 Aperíte. Run once.

    python3.13 research/psalterium/ps117/draft3.py
"""

import json
import shutil
from pathlib import Path

here = Path(__file__).resolve().parent


def main():
    path = here / 'prayed.json'
    prayed = json.loads(path.read_text(encoding='utf-8'))
    if prayed['version'] != 2 or (here / 'prayed.v2.json').exists():
        raise SystemExit('draft 3 was already made')
    shutil.copy(path, here / 'prayed.v2.json')
    decision = next(d for d in prayed['decisions'] if d['id'] == 'aperite')
    options = decision['options']
    assert options[1]['label'] == 'Abri-me'
    options[0]['from'] = 'draft2'
    options[0]['note'] = 'Draft 2’s wording. ' + options[0]['note']
    options.insert(0, options.pop(1))
    options[0]['note'] = 'Draft 3, ruled by the main session (DECISIONS.md D13). ' + options[0]['note']
    decision['why'] += (
        ' Ruled (D13): the ban on -ir imperatives is a ban on the bare form, which the ear can take for “I opened”. With'
        ' the enclitic (Abri-me as portas) the first-person reading would need a reflexive nobody hears; Matos Soares 1932'
        ' and the Diurnal Monástico 1962 both have exactly this; and the Latinist marked the loss of the imperative “major”'
        ' on both drafts. So the imperative returns, and the gate is clean on this verse.'
    )
    prayed['version'] = 3
    for step in prayed['audit']:
        for outcome in step.get('outcomes') or []:
            if outcome.get('decision') == 'aperite' and outcome.get('outcome') != 'taken':
                outcome['outcome'] = 'taken'
                outcome['reason'] = 'taken in draft 3 by the main session (D13)'
    prayed['audit'].append({
        'step': 'revision', 'version': 3,
        'note': 'v3, by the main session under Gustavo’s delegation (DECISIONS.md D13): 117:19 “Abram-se para mim” → “Abri-me”. It is the Latinist’s own fix from critic/v1 and critic/v2 (marked major both times), so no critic was re-run. The refrain’s new form is ruled in D14.',
    })
    path.write_text(json.dumps(prayed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('ps117: draft 3 written; draft 2 kept as prayed.v2.json')


main()
