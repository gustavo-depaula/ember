"""Ps 118:1–80, draft 5 → draft 6: the singular of elóquium as a clause (DECISIONS.md D16). Run once.

    python3.13 research/psalterium/ps118/draft6.py
    python3.13 research/psalterium/render.py research/psalterium/ps118 118
    python3.13 research/psalterium/ps118/partial.py
    python3.13 research/psalterium/ps118/part2.py

Draft 5 put "o vosso dito" to the test in its six singular places; the stylist refused all six. The plural "os vossos
ditos" had passed. The ambiguity reader, asked only what it understood, paraphrased 118:38 as "Confirmai o que dissestes
ao servo" — which is the rendering tried here: the same root as "ditos", apart from "palavra", and no interpretation.
"""

import json
import shutil
from pathlib import Path

here = Path(__file__).resolve().parent


def main():
    path = here / 'prayed.json'
    prayed = json.loads(path.read_text(encoding='utf-8'))
    if prayed['version'] != 5 or (here / 'prayed.v5.json').exists():
        raise SystemExit('draft 6 was already made')
    shutil.copy(path, here / 'prayed.v5.json')
    decision = next(d for d in prayed['decisions'] if d['id'] == 'eloquia')
    old = decision['options'][0]
    assert old['forms'] == {'e_acc': 'os vossos ditos', 'e_sg': 'o vosso dito', 'e_sec': 'segundo o vosso dito'}, old['forms']
    ruled = {
        'label': 'ditos · o que dissestes',
        'forms': {'e_acc': 'os vossos ditos', 'e_sg': 'o que dissestes', 'e_sec': 'segundo o que dissestes'},
        'note': 'Draft 6, ruled by the main session (DECISIONS.md D16). The plural stays “os vossos ditos”, which passed every reader. The singular, which the stylist refused six times out of six as bookish, is said as a clause of the same root: “segundo o que dissestes”, “guardei o que dissestes”. It is how the blind reader itself put 118:38 when asked what it understood. It stays apart from “palavra” (verbum, sermo), so the one distinction the Greek also makes (λόγιον) survives; it interprets nothing, as “promessa” does; and in 118:76 it mends the participle the stylist heard (“dito ao vosso servo”). Cost: a noun becomes a clause (grammar, where D2 lets the ear lead), and the perfect tense dates an utterance the Latin leaves timeless.',
        'from': 'claude',
    }
    old['label'] = 'ditos · o vosso dito'
    old['from'] = 'draft5'
    old['note'] = 'Draft 5’s wording. ' + old['note'].replace('Ruled (Claude, for review). ', '')
    decision['options'].insert(0, ruled)
    prayed['version'] = 6
    prayed['audit'].append({
        'step': 'revision', 'version': 6,
        'note': 'v6, by the main session under Gustavo’s delegation (DECISIONS.md D16): elóquium tuum, singular, “o vosso dito” → “o que dissestes” in 118:38, 41, 50, 58, 67, 76, after the stylist refused the noun in all six. The stylist was run again on 118:33–80 as critic/v6.stylist.part2.json to see whether the clause holds.',
    })
    path.write_text(json.dumps(prayed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('ps118: draft 6 written; draft 5 kept as prayed.v5.json')


main()
