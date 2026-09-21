"""Ps 90, draft 2 → draft 3: 90:15 erípiam, “arrancarei” → “libertarei”. Run once.

    python3.13 research/psalterium/ps090/draft3.py
    python3.13 research/psalterium/render.py research/psalterium/ps090 90
    python3.13 research/psalterium/checks.py research/psalterium/ps090 90
"""

import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent / 'review/apply'))
from newdraft import begin, decision, finish, rule  # noqa: E402

prayed, before = begin(here, 2)
rule(
    prayed, 'eripiam', {'eripiam': 'libertarei'},
    note='Draft 3, ruled by the main session (review of the finished work, 2026-09-21; review/consistency.md 1.3). '
         'Where erípere names no source, “arrancar” leaves the sentence hanging, and every such place in the '
         'finished psalms now says “libertar”: 6:5 “libertai a minha alma”, 21:9, 33:8, 118:153, 118:170. 90:15 was '
         'the one exception; its note (that “na tribulação” supplies the “from where”) was written before that '
         'evidence existed. It stays apart from liberáre → livrar in 90:14, so the Latin’s change of verb is kept. '
         'No critic has read draft 3.',
    draftNote='Drafts 1–2.',
)
decision(prayed, 'eripiam')['why'] += ' Draft 3: “libertar”, the erípere row’s rendering where no source is named.'
finish(here, prayed, before, 3, ['90:15 erípiam, “eu o arrancarei” → “eu o libertarei” (erípere with no source named)'], ['90:15'])
