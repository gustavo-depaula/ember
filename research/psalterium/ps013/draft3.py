"""Ps 13, draft 2 → draft 3: 13:6 ínopis, “indigente” → “carente” (D38). Run once.

    python3.13 research/psalterium/ps013/draft3.py
    python3.13 research/psalterium/render.py research/psalterium/ps013 13
    python3.13 research/psalterium/checks.py research/psalterium/ps013 13
"""

import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent / 'review/apply'))
from newdraft import begin, decision, finish, rule  # noqa: E402

prayed, before = begin(here, 2)
rule(
    prayed, 'inopis', {'inopis': 'carente'},
    label='carente',
    note='Draft 3, ruled by the main session (D38; review of the finished work, 2026-09-21). “Indigente” was unknown '
         'to four blind readers out of four; “carente” passed (Ps 34:10b). One word for inops through the psalter. '
         '“O conselho do carente” keeps “conselho”: D33 leaves conselho where a verse can mean both (review/consistency.md 1.2). '
         'No critic has read draft 3.',
    draftNote='Drafts 1–2, the then-working row (inops → indigente).',
)
decision(prayed, 'inopis')['why'] += ' Draft 3: D38 rules inops → “carente”; “indigente” and “desvalido” stay options.'
finish(here, prayed, before, 3, ['13:6 ínopis, “do indigente” → “do carente” (D38)'], ['13:6'])
