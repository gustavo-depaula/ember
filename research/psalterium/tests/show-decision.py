"""Print decisions of a psalm folder:  python3.13 research/psalterium/tests/show-decision.py <folder> [<id-substring> …]

With no id, lists every decision with its ruled option. With ids, prints those decisions in full and their verses.
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from latin import resolve  # noqa: E402

folder = Path(sys.argv[1])
prayed = json.loads((folder / 'prayed.json').read_text(encoding='utf-8'))
wanted = sys.argv[2:]
flat = resolve(prayed)
for decision in prayed['decisions']:
    if not wanted:
        print(f"{decision['id']:<22} {','.join(decision.get('refs') or [])[:40]:<42} → {decision['options'][0]['label']}")
        continue
    if not any(w in decision['id'] for w in wanted):
        continue
    print(f"\n## {decision['id']} · {decision.get('latin')} · {decision.get('kind')} · {decision.get('refs')}")
    print('why:', decision.get('why'))
    for i, option in enumerate(decision['options']):
        print(f"  [{i}] {option.get('from')} | {option['label']} | {json.dumps(option.get('forms'), ensure_ascii=False)}\n      {option.get('note')}")
    for ref in decision.get('refs') or []:
        print(f'  {ref}  {flat.get(ref)}')
