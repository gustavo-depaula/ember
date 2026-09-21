"""Ps 6, draft 2 → draft 3: árguere → repreender (DECISIONS.md D21). Run once.

    python3.13 research/psalterium/ps006/draft3.py
    python3.13 research/psalterium/render.py research/psalterium/ps006 6
    python3.13 research/psalterium/checks.py research/psalterium/ps006 6
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
    decision = next(d for d in prayed['decisions'] if d['id'] == 'arguas')
    options = decision['options']
    ruled = next(o for o in options if o['forms'] == {'arguas': 'repreendais'})
    draft = options[0]
    assert draft['forms'] == {'arguas': 'acuseis'}, draft['forms']
    options.remove(ruled)
    options.insert(0, ruled)
    draft['note'] = 'Draft 2’s wording, by the translating agent. ' + draft['note'].replace('Ruling. ', '')
    ruled['note'] = (
        'Draft 3, ruled by the main session (DECISIONS.md D21). Every living witness says rebuke: Douay-Rheims, the '
        'Diurnal (‘não me repreendas’); Matos Soares 1932 keeps the cognate, which is dead. The Greek pair ἐλέγχω … '
        'παιδεύω is reproof and chastening, what a father does; ‘acusar’ makes God the prosecutor in a verse where he '
        'is the judge, and takes one sense of árguere where the Latin holds several. The word is shared with increpáre '
        '(working, one verse so far): the two never stand in one verse of the psalter (checked with ps005/grep_latin.py), '
        'and they are different Greek verbs, so a reader crossing columns loses that distinction. Cost also named by '
        'the agent: ‘repreendais’ has a hiatus before the stress. No critic has read draft 3.'
    )
    prayed['version'] = 3
    prayed['audit'].append({
        'step': 'revision', 'version': 3,
        'note': 'v3, by the main session under Gustavo’s delegation (DECISIONS.md D21): 6:2 árguas, “acuseis” → “repreendais”. One word; no critic re-run. “Acuseis” stays selectable.',
    })
    path.write_text(json.dumps(prayed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('ps006: draft 3 written; draft 2 kept as prayed.v2.json')


main()
