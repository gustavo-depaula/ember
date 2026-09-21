"""Ps 118, draft 17 → draft 18: 118:104 odívi, “odiei” → “odeio” (odísse in present sense). Run once.

    python3.13 research/psalterium/ps118/draft18.py
    python3.13 research/psalterium/render.py research/psalterium/ps118 118
    python3.13 research/psalterium/ps118/partial.py
"""

import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent / 'review/apply'))
from newdraft import begin, decision, finish, slotOut  # noqa: E402

prayed, before = begin(here, 17)
slotOut(
    prayed, '118:104', 'odiei', 'odivi104', 'odivi104', 'proptérea odívi omnem viam iniquitátis',
    why='odi / odívi is a perfect with present sense (“I hate”); the odísse row takes it so, after the Latinist’s '
        'majors taken at 24:19 and 25:5 (25:5 Odívi ecclésiam malignántium → “Odeio a assembleia dos malvados”). '
        'The review of the finished work (review/consistency.md 1.4; HANDOFF item 15) found 118:104 still in the '
        'past. ódio hábui (118:113, 128, 163) is a true perfect periphrasis and keeps “tive ódio / Odiei”; the Greek '
        'has ἐμίσησα in all four, so the tense is read off the Latin form, which is what the row does.',
    ruled='odeio',
    ruledNote='Draft 18, ruled by the main session (review of the finished work, 2026-09-21): the present, as 24:19 and '
              '25:5. “Por isso odeio” states the settled disposition that the understanding (entendi) has produced. '
              'No critic has read draft 18.',
    draftNote='Drafts 1–17: the past, read as a narrative after “entendi”.',
)
prayed['choices']['118:104'] = prayed['choices']['118:104'].replace(
    'odívi → "odiei"', 'odívi → "odeio" (present sense, as 25:5; decision odivi104 — drafts 1–17 had "odiei")')
odio = decision(prayed, 'odio_habui')
odio['why'] = odio['why'].replace('(118:104 "odiei")', '(118:104, now "odeio": draft 18)')
option = next(o for o in odio['options'] if o['forms'].get('odio128') == 'odiei todo caminho de iniquidade')
option['note'] += ' (Since draft 18, 118:104 says “odeio”, so the two would differ by tense only.)'
finish(here, prayed, before, 18, ['118:104 odívi, “por isso odiei” → “por isso odeio” (odísse in present sense, as 24:19, 25:5)'], ['118:104'])
