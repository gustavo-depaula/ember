"""Ps 7, draft 2 → draft 3: 7:13 nisi convérsi fuéritis → Se não vos converterdes (DECISIONS.md D25). Run once.

    python3.13 research/psalterium/ps007/draft3.py
    python3.13 research/psalterium/render.py research/psalterium/ps007 7
    python3.13 research/psalterium/checks.py research/psalterium/ps007 7
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
    decision = next(d for d in prayed['decisions'] if d['id'] == 'conversi')
    echo, cognate = decision['options'][0], decision['options'][1]
    assert cognate['forms'] == {'conversi': 'converterdes', 'convertetur': 'se voltará'}, cognate['forms']
    decision['options'] = [cognate, echo] + decision['options'][2:]
    echo['note'] = 'Draft 2’s wording, by the translating agent. ' + echo['note'].replace('Ruling: ', '')
    cognate['note'] = (
        'Draft 3, ruled by the main session (DECISIONS.md D25). The agent’s own note gives the reasons: the glossary '
        'avoids “converter” because it is heard as religious conversion, and here that is what is meant; it is the '
        'Latin’s own word (D2); Douay-Rheims and Matos Soares 1932 have it; and the blind reader found that “Se não '
        'vos voltardes” can be heard as said to God, who is “vós” in this psalter and is asked “Voltai-vos” in 6:5 — '
        '“converterdes” cannot be said to God. Cost: the echo with 7:17 (convertétur dolor ejus) is no longer heard, '
        'and convértere has two renderings. No critic has read draft 3. '
    ) + cognate['note']
    cognate['from'] = 'MS1932'
    prayed['version'] = 3
    prayed['audit'].append({
        'step': 'revision', 'version': 3,
        'note': 'v3, by the main session under Gustavo’s delegation (DECISIONS.md D25): 7:13 “Se não vos voltardes” → “Se não vos converterdes”. One word; no critic re-run. The echo wording stays selectable.',
    })
    path.write_text(json.dumps(prayed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('ps007: draft 3 written; draft 2 kept as prayed.v2.json')


main()
