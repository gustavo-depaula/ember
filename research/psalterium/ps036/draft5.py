"""Ps 36, draft 4 → draft 5: 36:14b ínopem, “indigente” → “carente” (D38). Run once.

    python3.13 research/psalterium/ps036/draft5.py
    python3.13 research/psalterium/render.py research/psalterium/ps036 36
    python3.13 research/psalterium/ps036/partial.py
"""

import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent / 'review/apply'))
from newdraft import begin, decision, finish, rule  # noqa: E402

prayed, before = begin(here, 4)
rule(
    prayed, 'inops', {'inops': 'carente'},
    label='carente',
    note='Draft 5, ruled by the main session (D38; review of the finished work, 2026-09-21). “Indigente” was unknown '
         'to four blind readers out of four; “carente” passed (Ps 34:10b, where it also stands beside pauper). '
         '“Desvalido”, this psalm’s proposal, stays an option: one reader did not know it. No critic has read draft 5.',
    draftNote='Drafts 1–4, the then-working row.',
)
decision(prayed, 'inops')['why'] += ' Draft 5: D38 rules inops → “carente”; “indigente” and “desvalido” stay options.'
finish(here, prayed, before, 5, ['36:14b ínopem, “o indigente” → “o carente” (D38)'], ['36:14b'])
