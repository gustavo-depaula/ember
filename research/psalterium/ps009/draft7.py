"""Ps 9, draft 6 → draft 7: orbis terræ → o mundo (DECISIONS.md D30). Run once.

    python3.13 research/psalterium/ps009/draft7.py
    python3.13 research/psalterium/render.py research/psalterium/ps009 9
    python3.13 research/psalterium/checks.py research/psalterium/ps009 9
"""

import json
import shutil
from pathlib import Path

here = Path(__file__).resolve().parent


def main():
    path = here / 'prayed.json'
    prayed = json.loads(path.read_text(encoding='utf-8'))
    if prayed['version'] != 6 or (here / 'prayed.v6.json').exists():
        raise SystemExit('draft 7 was already made')
    shutil.copy(path, here / 'prayed.v6.json')
    vos = here / 'prayed.vos.json'
    if vos.exists():
        shutil.copy(vos, here / 'prayed.v6.vos.json')
    decision = next(d for d in prayed['decisions'] if d['id'] == 'orbem')
    options = decision['options']
    ruled = next(o for o in options if o['forms'] == {'orbem': 'o mundo'})
    draft = options[0]
    assert draft['forms'] == {'orbem': 'o orbe da terra'}, draft['forms']
    options.remove(ruled)
    options.insert(0, ruled)
    draft['note'] = 'Draft 6’s wording, by the translating agent. ' + draft['note'].replace('Ruling, proposed for the glossary. ', '')
    ruled['note'] = (
        'Draft 7, ruled by the main session (DECISIONS.md D30). Two blind readers did not know ‘orbe’ (Ps 9 draft 1, '
        'Ps 17 draft 1), and the draft’s own note made the blind reader the test. The Latin psalter never uses mundus '
        'for the world (its only mund- words are ‘clean’ and ‘cleanse’: 18:13, 23:4, 50, 88:45), so ‘mundo’ collides with nothing; '
        'where terra and orbis stand side by side (89:2) Portuguese says ‘a terra e o mundo’. Ps 17:16a already reads '
        '‘os fundamentos do mundo’. No critic has read draft 7.'
    )
    prayed['version'] = 7
    prayed['audit'].append({
        'step': 'revision', 'version': 7,
        'note': 'v7, by the main session under Gustavo’s delegation (DECISIONS.md D30): 9:8b orbem terræ, “o orbe da terra” → “o mundo”. One slot; no critic re-run. “O orbe da terra” stays selectable.',
    })
    path.write_text(json.dumps(prayed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('ps009: draft 7 written; draft 6 kept as prayed.v6.json')


main()
