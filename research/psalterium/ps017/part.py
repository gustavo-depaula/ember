"""Critic inputs for a verse range of Ps 17, so that the blind readers read only the new portion.
Copied from ps009/part.py (itself from ps118/part3.py; both left untouched) and adapted: the range is given as DO verse numbers.

Run from the repo root, after render.py and partial.py:
  python3.13 research/psalterium/ps017/part.py 26 51 part2      (17:26–17:51 → ps017/part2/)

Writes <folder>/latin.json and <folder>/prayed.vos.json restricted to the range, and <folder>/blind/prayed.vos.json
(the Portuguese alone, for the ambiguity reader). Then, one at a time (k = the version the critics read):
  python3.13 research/psalterium/codex.py research/psalterium/ps017/part2 ../../prompts/latinist.md prayed.vos.json ../critic/v<k>.latinist.part2.json
  python3.13 research/psalterium/codex.py research/psalterium/ps017/part2 ../../prompts/stylist.md prayed.vos.json ../critic/v<k>.stylist.part2.json
  python3.13 research/psalterium/codex.py research/psalterium/ps017/part2/blind ../../../prompts/ambiguity.md prayed.vos.json ../../critic/v<k>.ambiguity.part2.json
Never re-run a critic whose output file already exists.
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import latin as latinModule  # noqa: E402

here = Path(__file__).resolve().parent
first, last, folder = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]


def inRange(verseId):
    number = int(''.join(ch for ch in verseId.split(':')[1] if ch.isdigit()))
    return first <= number <= last


# the full Latin, not ps017/latin.json (partial.py trims that one to what is translated)
fullLatin = {v['id']: v['text'] for v in latinModule.readVerses(latinModule.doLatin / 'Psalmorum/Psalm17.txt')}
latin = {k: v for k, v in fullLatin.items() if inRange(k)}
vos = {k: v for k, v in json.loads((here / 'prayed.vos.json').read_text(encoding='utf-8')).items() if inRange(k)}
if list(latin) != list(vos) or not vos:
    sys.exit(f'latin and prayed.vos.json disagree in the range: {len(latin)} / {len(vos)} verses')

out = here / folder
(out / 'blind').mkdir(parents=True, exist_ok=True)
dump = lambda d: json.dumps(d, ensure_ascii=False, indent=2) + '\n'  # noqa: E731
(out / 'latin.json').write_text(dump(latin), encoding='utf-8')
(out / 'prayed.vos.json').write_text(dump(vos), encoding='utf-8')
(out / 'blind' / 'prayed.vos.json').write_text(dump(vos), encoding='utf-8')
print(f'{folder}: {len(vos)} verses ({next(iter(vos))}–{list(vos)[-1]})')
