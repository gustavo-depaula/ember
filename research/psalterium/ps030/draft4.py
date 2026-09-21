"""Ps 30, draft 3 → draft 4: 30:12 valde, “sobremaneira” → “grandemente” (option 3 of `valde`). Run once.

    python3.13 research/psalterium/ps030/draft4.py
    python3.13 research/psalterium/render.py research/psalterium/ps030 30
    python3.13 research/psalterium/checks.py research/psalterium/ps030 30
"""

import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent / 'review/apply'))
from newdraft import begin, decision, finish, rule  # noqa: E402

prayed, before = begin(here, 3)
rule(
    prayed, 'valde', {'valde': 'grandemente'},
    note='Draft 4, ruled by the main session (review of the finished work, 2026-09-21; DECISIONS.md, applied as a new '
         'draft). “Sobremaneira”, draft 3’s word, was unknown to the blind reader of draft 3 '
         '(critic/v3.ambiguity.unread.json). “Grandemente” says the degree the Latinist’s gate asked for (valde '
         'intensifies the reproach) and is current; “muito” was heard as “many neighbours”, “sobretudo” compares. '
         'No critic has read draft 4.',
    draftNote='Draft 3, the Latinist’s gate verbatim; unknown to the blind reader.',
)
decision(prayed, 'valde')['why'] += ' Draft 4: “grandemente”, because the blind reader of draft 3 did not know “sobremaneira”.'
finish(here, prayed, before, 4, ['30:12 valde, “sobremaneira” → “grandemente” (unknown to the blind reader)'], ['30:12'])
