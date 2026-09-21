"""Critic inputs for the verses of a psalm that no Latinist has read in their current wording (review of 2026-09-21).

  python3.13 research/psalterium/unread/build.py <psNNN> <folder> <ids,comma,separated> <context> [latinist]

Writes <psNNN>/<folder>/blind/prayed.vos.json: the current flat text of the given verses and of <context> verses on
either side (the Portuguese alone, for the ambiguity reader). With `latinist`, also <folder>/latin.json and
<folder>/prayed.vos.json of the given verses alone (no context), for a Latinist read of a staged psalm.
The text is taken from prayed.json itself (latin.resolve), not from a rendered file.
"""

import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root))
from latin import resolve  # noqa: E402

name, folder, ids, context = sys.argv[1], sys.argv[2], sys.argv[3].split(','), int(sys.argv[4])
withLatinist = len(sys.argv) > 5 and sys.argv[5] == 'latinist'
psalm = root / name
now = resolve(json.loads((psalm / 'prayed.json').read_text(encoding='utf-8')))
latin = json.loads((psalm / 'latin.json').read_text(encoding='utf-8'))
order = [vid for vid in latin if vid in now]
missing = [vid for vid in ids if vid not in now]
if missing:
    sys.exit(f'not in prayed.json: {missing}')
wanted = {i for vid in ids for i in range(order.index(vid) - context, order.index(vid) + context + 1) if 0 <= i < len(order)}
blind = {order[i]: now[order[i]] for i in sorted(wanted)}
out = psalm / folder
(out / 'blind').mkdir(parents=True, exist_ok=True)
dump = lambda d: json.dumps(d, ensure_ascii=False, indent=2) + '\n'  # noqa: E731
(out / 'blind' / 'prayed.vos.json').write_text(dump(blind), encoding='utf-8')
print(f'{name}/{folder}/blind: {len(blind)} verses: {" ".join(blind)}')
if withLatinist:
    chosen = [vid for vid in order if vid in ids]
    (out / 'latin.json').write_text(dump({vid: latin[vid] for vid in chosen}), encoding='utf-8')
    (out / 'prayed.vos.json').write_text(dump({vid: now[vid] for vid in chosen}), encoding='utf-8')
    print(f'{name}/{folder}: latinist input, {len(chosen)} verses')
