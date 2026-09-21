"""Ps 11, draft 2 → draft 3: 11:6a ínopum, “indigentes” → “carentes” (D38). Run once.

    python3.13 research/psalterium/ps011/draft3.py
    python3.13 research/psalterium/render.py research/psalterium/ps011 11
    python3.13 research/psalterium/checks.py research/psalterium/ps011 11
"""

import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent / 'review/apply'))
from newdraft import begin, decision, finish, rule  # noqa: E402

prayed, before = begin(here, 2)
rule(
    prayed, 'propter', {'propter': 'Por causa da miséria dos carentes,'},
    label='Por causa da miséria dos carentes,',
    note='Draft 3, ruled by the main session (D38; review of the finished work, 2026-09-21). inops → “carente”: '
         '“indigente” was unknown to four blind readers out of four (this psalm’s among them), “carente” passed '
         '(Ps 34:10b). The glossary’s “por causa de” kept. No critic has read draft 3.',
    draftNote='Drafts 1–2, the then-working inops → indigente.',
)
decision(prayed, 'propter')['why'] += ' Draft 3: D38 rules inops → “carente”; “indigente” and “desvalido” stay options.'
finish(here, prayed, before, 3, ['11:6a ínopum, “dos indigentes” → “dos carentes” (D38)'], ['11:6a'])
