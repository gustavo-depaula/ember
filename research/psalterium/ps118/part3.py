"""Critic inputs for the THIRD PORTION of the psalm (118:81–118:128), so that the blind readers read only
the new verses. Adapted from part2.py, which is left as it was.

Run from the repo root, after render.py and partial.py:
  python3.13 research/psalterium/ps118/part3.py                   (118:81–118:128 → ps118/part3/)
  python3.13 research/psalterium/ps118/part3.py 129 176 part4     (the last portion)

Writes <folder>/latin.json and <folder>/prayed.vos.json restricted to the range, and <folder>/blind/prayed.vos.json
(the Portuguese alone, for the ambiguity reader). Then, one at a time (k = the version the critics read):
  python3.13 research/psalterium/codex.py research/psalterium/ps118/part3 ../../prompts/latinist.md prayed.vos.json ../critic/v<k>.latinist.part3.json
  python3.13 research/psalterium/codex.py research/psalterium/ps118/part3 ../../prompts/stylist.md prayed.vos.json ../critic/v<k>.stylist.part3.json
  python3.13 research/psalterium/codex.py research/psalterium/ps118/part3/blind ../../../prompts/ambiguity.md prayed.vos.json ../../critic/v<k>.ambiguity.part3.json
Never re-run a critic whose output file already exists.
"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
first, last, folder = (int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]) if len(sys.argv) > 3 else (81, 128, 'part3')


def inRange(verseId):
    number = int(''.join(ch for ch in verseId.split(':')[1] if ch.isdigit()))
    return first <= number <= last


def restrict(name):
    full = json.loads((here / name).read_text(encoding='utf-8'))
    return {k: v for k, v in full.items() if inRange(k)}


latin = restrict('latin.json')
vos = restrict('prayed.vos.json')
if list(latin) != list(vos) or not vos:
    sys.exit(f'latin.json and prayed.vos.json disagree in the range: {len(latin)} / {len(vos)} verses')

out = here / folder
(out / 'blind').mkdir(parents=True, exist_ok=True)
dump = lambda d: json.dumps(d, ensure_ascii=False, indent=2) + '\n'
(out / 'latin.json').write_text(dump(latin), encoding='utf-8')
(out / 'prayed.vos.json').write_text(dump(vos), encoding='utf-8')
(out / 'blind' / 'prayed.vos.json').write_text(dump(vos), encoding='utf-8')
print(f'{folder}: {len(vos)} verses ({next(iter(vos))}–{list(vos)[-1]})')
