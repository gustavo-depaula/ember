"""Ps 17, draft 5 → draft 6: 17:51 usque in sǽculum, “para sempre” → “para todo o sempre” (D37). Run once.

    python3.13 research/psalterium/ps017/draft6.py
    python3.13 research/psalterium/render.py research/psalterium/ps017 17
    python3.13 research/psalterium/ps017/partial.py
"""

import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent / 'review/apply'))
from newdraft import begin, finish, slotOut  # noqa: E402

prayed, before = begin(here, 5)
slotOut(
    prayed, '17:51', 'para sempre', 'usque', 'usque', 'et sémini ejus usque in sǽculum',
    why='usque in sǽculum / usque in ætérnum → “para todo o sempre” (D37). D23 made in ætérnum and in sǽculum one '
        'phrase (“para sempre”); usque adds “all the way”, and Portuguese has the phrase for it. The review of the '
        'finished work (review/consistency.md 1.5) found this verse saying “para sempre” against 27:9 “para todo o '
        'sempre” for the same Latin; D37 settles it for 27:9’s form. 15 lines of the psalter have usque in sǽculum / '
        'ætérnum (ps005/grep_latin.py); 17:51 and 27:9 are the finished ones.',
    ruled='para todo o sempre',
    ruledNote='Draft 6, ruled by the main session (D37; review of the finished work, 2026-09-21): usque carried by '
              '“todo”, as in 27:9. No critic has read draft 6.',
    draftNote='Drafts 1–5: D23’s phrase, usque unsaid.',
)
prayed['choices']['17:51'] = prayed['choices']['17:51'].replace(
    'usque in sǽculum → para sempre (in sǽculum, glossary)', 'usque in sǽculum → para todo o sempre (D37; decision usque — drafts 1–5 had para sempre)')
finish(here, prayed, before, 6, ['17:51 usque in sǽculum, “para sempre” → “para todo o sempre” (D37)'], ['17:51'])
