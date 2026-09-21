"""Ps 118:1–128, draft 11 → draft 12: in ætérnum → para sempre (DECISIONS.md D23). Run once.

    python3.13 research/psalterium/ps118/draft12.py
    python3.13 research/psalterium/render.py research/psalterium/ps118 118
    python3.13 research/psalterium/ps118/partial.py
"""

import json
import shutil
from pathlib import Path

here = Path(__file__).resolve().parent


def main():
    path = here / 'prayed.json'
    prayed = json.loads(path.read_text(encoding='utf-8'))
    if prayed['version'] != 11 or (here / 'prayed.v11.json').exists():
        raise SystemExit('draft 12 was already made')
    shutil.copy(path, here / 'prayed.v11.json')

    decision = next(d for d in prayed['decisions'] if d['id'] == 'in_aeternum')
    glossary, merged = decision['options'][0], decision['options'][1]
    assert merged['forms'] == {'aet': 'para sempre', 'Aet': 'Para sempre'}, merged['forms']
    decision['options'] = [merged, glossary] + decision['options'][2:]
    glossary['note'] = 'Drafts 7–11, the glossary as it then stood. ' + glossary['note']
    merged['from'] = 'claude'
    merged['note'] = (
        'Draft 12, ruled by the main session (DECISIONS.md D23). In ætérnum and in sǽculum are one Greek phrase '
        '(εἰς τὸν αἰῶνα: 118:89, 93, 98, 111, 112 as in the refrain of Ps 117 — read in the Rahlfs text of '
        'consult/parallels), which is D15’s test for merging; Douay-Rheims (“for ever”) and Matos Soares 1932 '
        '(“Para sempre, Senhor”) merge them; and the stylist put “para sempre” in its place in four lines of this '
        'portion. Cost: the Latin’s variation of two words is lost. '
    ) + merged['note']

    old = 'Inclinei o meu coração {faciendas} {aet} {j_acc}, * por causa da retribuição.'
    assert prayed['verses']['118:112'] == old, prayed['verses']['118:112']
    prayed['verses']['118:112'] = 'Inclinei o meu coração {faciendas} {j_acc} {aet}, * por causa da retribuição.'

    handoff = next(a for a in prayed['audit'] if 'ADDED by the agent of 118:81–128' in a.get('note', ''))
    handoff['note'] += (
        ' — ADDED by the main session (draft 12, DECISIONS.md D23), for whoever takes 118:129–176: prayed.v11.json '
        'now exists; copy prayed.json to prayed.v12.json first. in ætérnum → para sempre, the same as in sǽculum '
        '(one Greek phrase); the slots {aet} / {Aet} of decision "in_aeternum" carry it, “eternamente” is option 1. '
        'In 118:112 the adverb went back to the Latin’s place, after the object, so that “para cumprir” and '
        '“para sempre” do not touch.'
    )
    prayed['version'] = 12
    prayed['audit'].append({
        'step': 'revision', 'version': 12,
        'note': 'v12, by the main session under Gustavo’s delegation (DECISIONS.md D23): in ætérnum, “eternamente” → “para sempre” in 118:89, 93, 98, 111, 112; 118:112 adverb moved after the object (the Latin’s order). No critic has read draft 12; the wording is the stylist’s own in four of the five lines.',
    })
    path.write_text(json.dumps(prayed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('ps118: draft 12 written; draft 11 kept as prayed.v11.json')


main()
