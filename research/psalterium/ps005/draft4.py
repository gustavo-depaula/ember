"""Ps 5, draft 3 → draft 4: 5:12a in ætérnum, “eternamente” → “para sempre” (D23). Run once.

    python3.13 research/psalterium/ps005/draft4.py
    python3.13 research/psalterium/render.py research/psalterium/ps005 5
    python3.13 research/psalterium/checks.py research/psalterium/ps005 5
"""

import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent / 'review/apply'))
from newdraft import begin, finish, slotOut  # noqa: E402

prayed, before = begin(here, 3)
slotOut(
    prayed, '5:12a', 'eternamente', 'aeternum', 'in_aeternum', 'in ætérnum exsultábunt',
    why='in ætérnum → para sempre (D23, one with in sǽculum: one Greek phrase, εἰς τὸν αἰῶνα). Ps 5 was drafted '
        'before D23 and was not swept; the review of the finished work (review/consistency.md 1.1) found it the only '
        'one of the 23 in ætérnum verses not saying “para sempre”, with no exception written.',
    ruled='para sempre',
    ruledNote='Draft 4, ruled by the main session (D23; review of the finished work, 2026-09-21). The glossary phrase, '
              'as in the other 22 places; lighter than the five-syllable adverb, which the ear had already voted '
              'down in Ps 118. No critic has read draft 4.',
    draftNote='Drafts 1–3: the pre-D23 glossary (in ætérnum → eternamente, kept apart from in sǽculum then).',
)
prayed['choices']['5:12a'] = prayed['choices']['5:12a'].replace(
    'in ætérnum → eternamente', 'in ætérnum → para sempre (D23; decision in_aeternum — draft 3 had eternamente)').replace(
    "'exultarão eternamente' in natural order", "'exultarão para sempre' in natural order")
finish(here, prayed, before, 4, ['5:12a in ætérnum, “eternamente” → “para sempre” (D23)'], ['5:12a'])
