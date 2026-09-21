"""Critic inputs for ONE PORTION of the psalm, so that the blind readers read only the new verses.

Run from the repo root, after render.py and partial.py:
  python3.13 research/psalterium/ps118/part2.py            (118:33–118:80 → ps118/part2/)
  python3.13 research/psalterium/ps118/part2.py 81 128 part3   (the next portion)

Writes <folder>/latin.json and <folder>/prayed.vos.json restricted to the range, and <folder>/blind/prayed.vos.json
(the Portuguese alone, for the ambiguity reader). Then, one at a time:
  python3.13 research/psalterium/codex.py research/psalterium/ps118/part2 ../../prompts/latinist.md prayed.vos.json ../critic/v4.latinist.part2.json
  python3.13 research/psalterium/codex.py research/psalterium/ps118/part2 ../../prompts/stylist.md prayed.vos.json ../critic/v4.stylist.part2.json
  python3.13 research/psalterium/codex.py research/psalterium/ps118/part2/blind ../../../prompts/ambiguity.md prayed.vos.json ../../critic/v4.ambiguity.part2.json
"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
first, last, folder = (int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]) if len(sys.argv) > 3 else (33, 80, 'part2')


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
