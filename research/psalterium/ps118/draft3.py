"""Ps 118:1–32, draft 2 → draft 3: the main session's ruling on sermo (DECISIONS.md D15). Run once.

    python3.13 research/psalterium/ps118/draft3.py
    python3.13 research/psalterium/render.py research/psalterium/ps118 118
    python3.13 research/psalterium/ps118/partial.py
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
    decision = next(d for d in prayed['decisions'] if d['id'] == 'sermones')
    options = decision['options']
    assert options[1]['label'] == 'palavras'
    options[0]['from'] = 'draft2'
    options[0]['note'] = 'Draft 2’s wording, the translating agent’s ruling. ' + options[0]['note'].replace('Ruled (Claude, for review). ', '')
    options.insert(0, options.pop(1))
    options[0]['note'] = (
        'Draft 3, ruled by the main session (DECISIONS.md D15), overruling the agent. The variation verbum / sermo is the'
        ' Latin translator’s elegance over one Greek word (λόγος) — it carries no difference of meaning, unlike'
        ' elóquium (λόγιον), which keeps its own word. No plain Portuguese pair exists for it: the one candidate was'
        ' refused three times by the stylist as sounding made up, and D2 gives the ear the plainer of two faithful words.'
        ' Douay-Rheims, Matos Soares 1932 and the Diurnal Monástico all merge the two. Cost, accepted: where the Latin'
        ' sets verbum beside sermo (118:42, 55:11, 102:20) the Portuguese will repeat a word the Latin varies; those'
        ' verses decide locally. ' + options[0]['note']
    )
    prayed['version'] = 3
    for step in prayed['audit']:
        for outcome in step.get('outcomes') or []:
            if outcome.get('decision') == 'sermones' and outcome.get('outcome') != 'taken':
                outcome['outcome'] = 'taken'
                outcome['reason'] = 'taken in draft 3 by the main session (D15)'
    prayed['audit'].append({
        'step': 'revision', 'version': 3,
        'note': 'v3, by the main session under Gustavo’s delegation (DECISIONS.md D15): sermónes tuos “as vossas falas” → “as vossas palavras” in 118:9, 16, 17 — the stylist’s own proposal from critic/v1, so no critic was re-run. The rest of the agent’s term set is confirmed in D15. Later portions of the psalm: sermo → palavra(s); add the slots to this same decision.',
    })
    path.write_text(json.dumps(prayed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('ps118: draft 3 written; draft 2 kept as prayed.v2.json')


main()
