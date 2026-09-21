"""Ps 118, draft 16 → draft 17: the plural of elóquium as the clause too (DECISIONS.md D26). Run once.

    python3.13 research/psalterium/ps118/draft17.py
    python3.13 research/psalterium/render.py research/psalterium/ps118 118
    python3.13 research/psalterium/checks.py research/psalterium/ps118 118

The stylist refused "os vossos ditos" every time he met it in 118:81–176 (103 twice; 148, 158, 162 twice each) and never
once remarked on the clause "o que dissestes" in some fifteen places. The clause serves the plural as well: "o que
dissestes" has no number. 118:103 needs the copula to agree, so it gets slots of its own in the same decision.
"""

import json
import shutil
from pathlib import Path

here = Path(__file__).resolve().parent


def main():
    path = here / 'prayed.json'
    prayed = json.loads(path.read_text(encoding='utf-8'))
    if prayed['version'] != 16 or (here / 'prayed.v16.json').exists():
        raise SystemExit('draft 17 was already made')
    shutil.copy(path, here / 'prayed.v16.json')

    decision = next(d for d in prayed['decisions'] if d['id'] == 'eloquia')
    old = decision['options'][0]
    assert old['forms']['e_acc'] == 'os vossos ditos' and old['forms']['e_sg'] == 'o que dissestes', old['forms']
    for option in decision['options']:
        option['forms'].update({'e_doce': 'são doces', 'e_doce_inv': 'doces são'})
    ruled = {
        'label': 'o que dissestes, in both numbers',
        'forms': {**old['forms'], 'e_acc': 'o que dissestes', 'e_in': 'no que dissestes', 'e_com': 'com o que dissestes', 'e_doce': 'é doce', 'e_doce_inv': 'doce é'},
        'note': 'Draft 17, ruled by the main session (DECISIONS.md D26). The clause of D16 now serves the plural elóquia tua as well (118:11, 103, 148, 158, 162): “o que dissestes” has no number. The stylist refused “os vossos ditos” eight times out of eight in 118:81–176 and never remarked on the clause; the blind reader understood both. It stays apart from “palavra” (verbum, sermo), so the distinction the Greek makes (λόγιον) survives in all twenty places, which a retreat to “palavras” would give up. Cost: the Latin’s number is not heard (grammar, where D2 lets the ear lead), and the perfect tense dates the utterance, as D16 already said.',
        'from': 'claude',
    }
    old['label'] = 'ditos · o que dissestes (drafts 6–16)'
    old['note'] = 'Drafts 6–16. ' + old['note']
    decision['options'].insert(0, ruled)

    quam = next(d for d in prayed['decisions'] if d['id'] == 'quam')
    forms = [o['forms']['quam'] for o in quam['options']]
    assert forms == ['Como {e_acc} são doces {faucibus}', 'Como são doces {faucibus} {e_acc}', 'Quão doces são {faucibus} {e_acc}'], forms
    quam['options'][0]['forms']['quam'] = 'Como {e_acc} {e_doce} {faucibus}'
    quam['options'][1]['forms']['quam'] = 'Como {e_doce} {faucibus} {e_acc}'
    quam['options'][2]['forms']['quam'] = 'Quão {e_doce_inv} {faucibus} {e_acc}'
    latinOrder = quam['options'].pop(1)
    latinOrder['note'] = 'Draft 17 (D26): with the clause as subject the Latin’s order is also the natural one — “Como é doce à minha garganta o que dissestes”; subject-first would put a clause before its verb. ' + latinOrder['note']
    quam['options'].insert(0, latinOrder)

    prayed['version'] = 17
    prayed['audit'].append({
        'step': 'revision', 'version': 17,
        'note': 'v17, by the main session under Gustavo’s delegation (DECISIONS.md D26): elóquia tua, plural, “os vossos ditos” → “o que dissestes” in 118:11, 103, 148, 158, 162; 118:103 returns to the Latin’s order. The stylist read 118:145–162 again as critic/v17.stylist.part5.json.',
    })
    path.write_text(json.dumps(prayed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('ps118: draft 17 written; draft 16 kept as prayed.v16.json')


main()
