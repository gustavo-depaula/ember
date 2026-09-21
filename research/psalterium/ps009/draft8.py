"""Ps 9, draft 7 → draft 8: 9:23 consíliis → “desígnios” (D33); 9:26a “em todo o tempo” → “em todo tempo”. Run once.

    python3.13 research/psalterium/ps009/draft8.py
    python3.13 research/psalterium/render.py research/psalterium/ps009 9
    python3.13 research/psalterium/ps009/partial.py
"""

import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent / 'review/apply'))
from newdraft import begin, decision, finish, rule, slotOut  # noqa: E402

prayed, before = begin(here, 7)
rule(
    prayed, 'consiliis', {'consiliis': 'nos desígnios em que pensam'},
    label='nos desígnios em que pensam',
    note='Draft 8, ruled by the main session (D33; review of the finished work, 2026-09-21, review/consistency.md 1.2). '
         'Here consílium is what the proud intend, and the build is 20:12 cogitavérunt consília → “pensaram em '
         'desígnios”, one of D33’s two founding verses; the blind readers heard “conselhos” there as advice given '
         'to others. The subject stays unnamed. No critic has read draft 8.',
    draftNote='Drafts 1–7, before D33 split consílium.',
)
decision(prayed, 'consiliis')['why'] += ' Draft 8: D33 splits the word — desígnio where consílium is a plan, conselho where it is advice or a council — and this is a plan.'
slotOut(
    prayed, '9:26a', 'em todo o tempo', 'omni_tempore', 'omni_tempore', 'in omni témpore',
    why='in omni témpore (ἐν παντὶ καιρῷ), “at every time”. The finished psalms had it two ways: 33:2 and 118:20 “em '
        'todo tempo”, 9:26a “em todo o tempo” (review/consistency.md 2.4). One form for all three, the majority’s; '
        'Ps 33’s decision “tempore” gives the reason: without the article “todo” is “every”, with it “the whole”, '
        'which a Brazilian also hears as “all the time” (as in the tota die row, D24).',
    ruled='em todo tempo',
    ruledNote='Draft 8, the form of 33:2 and 118:20 (review of the finished work, 2026-09-21). No critic has read draft 8.',
    draftNote='Drafts 1–7 (Matos Soares 1932’s article).',
)
finish(here, prayed, before, 8, [
    '9:23 consíliis, “nos conselhos em que pensam” → “nos desígnios em que pensam” (D33)',
    '9:26a in omni témpore, “em todo o tempo” → “em todo tempo” (as 33:2, 118:20)',
], ['9:23', '9:26a'])
