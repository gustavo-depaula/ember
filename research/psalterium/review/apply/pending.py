"""List every audit outcome still 'pending' in the finished psalms (review of 2026-09-21), with its recommendation.

python3.13 research/psalterium/review/apply/pending.py [--refuse]   (refuse-recommended ones are only counted unless --refuse)
"""

import json
import sys
from collections import Counter
from pathlib import Path

root = Path(__file__).resolve().parents[2]
show_refuse = '--refuse' in sys.argv
counts = Counter()
for folder in sorted(root.glob('ps[0-9][0-9][0-9]')):
    path = folder / 'prayed.json'
    if not path.exists():
        continue
    d = json.loads(path.read_text(encoding='utf-8'))
    for i, step in enumerate(d.get('audit', [])):
        for j, o in enumerate(step.get('outcomes', []) or []):
            if o.get('outcome') != 'pending':
                continue
            rec = o.get('recommendation')
            counts[(folder.name, rec)] += 1
            if rec == 'refuse' and not show_refuse:
                continue
            print(f"{folder.name} step{i} {step.get('step')} {step.get('file','')} #{j} [{rec}] {o.get('verse')} dec={o.get('decision')}")
            print('    R:', o.get('remark', '')[:500])
            print('    WHY:', o.get('reason', '')[:700])
for k, v in sorted(counts.items(), key=str):
    print(k, v)
print('total', sum(counts.values()))
