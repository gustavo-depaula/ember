"""Ps 18: slot `maximo` was filled by two decisions (`delicta` and `maximo`). Run once. No wording changes.

latin.resolve lets the later decision win, so `delicta`'s own form for 18:14b was dead: choosing *delitos* on the
site left *da maior falta* in 18:14b. The noun now lives in `delicta` as its own slot (`delicto`, singular), and
`maximo`'s ruling is *maior {delicto}* — *maior* is the same in both genders — so the two decisions compose.
Found by ps020/validate.py ("slot maximo in two decisions"), review of 2026-09-21.

    python3.13 research/psalterium/ps018/fix_maximo_slot.py
"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent))
from latin import resolve  # noqa: E402


def main():
    path = here / 'prayed.json'
    prayed = json.loads(path.read_text(encoding='utf-8'))
    before = resolve(prayed)
    delicta = next(d for d in prayed['decisions'] if d['id'] == 'delicta')
    maximo = next(d for d in prayed['decisions'] if d['id'] == 'maximo')
    if 'maximo' not in delicta['options'][0]['forms']:
        raise SystemExit('already fixed')
    nouns = {'maior falta': 'falta', 'maior delito': 'delito'}
    for option in delicta['options']:
        option['forms']['delicto'] = nouns[option['forms'].pop('maximo')]
    assert maximo['options'][0]['forms'] == {'maximo': 'maior falta'}, maximo['options'][0]['forms']
    maximo['options'][0]['forms'] = {'maximo': 'maior {delicto}'}
    maximo['options'][0]['label'] = 'maior (falta)'
    maximo['options'][0]['note'] += ' The noun follows decision “delicta” (falta / delito).'
    delicta['why'] += ' The singular noun of 18:14b is slot delicto, which decision “maximo” builds on (it had been a second owner of slot maximo, which left this decision’s choice dead in 18:14b; fixed 2026-09-21, wording unchanged).'
    after = resolve(prayed)
    assert after == before, {k: (before[k], after[k]) for k in before if before[k] != after[k]}
    path.write_text(json.dumps(prayed, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print('ps018: slot maximo has one owner; flat text unchanged')


main()
