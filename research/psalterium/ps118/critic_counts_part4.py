"""Counts from the part-4 critic files, for the PROGRESS.md row.  python3.13 research/psalterium/ps118/critic_counts_part4.py"""

import json
from pathlib import Path

here = Path(__file__).resolve().parent
for path in sorted((here / 'critic').glob('v1[3-6].*.part4.json')):
    reply = json.loads(json.loads(path.read_text(encoding='utf-8'))['reply'])
    summary = {}
    for key, value in reply.items():
        summary[key] = len(value) if isinstance(value, list) else str(value)[:70]
    if 'verses' in reply:
        summary['ids'] = [(v['id'], v.get('severity', '')) for v in reply['verses']]
    print(path.name, summary)
