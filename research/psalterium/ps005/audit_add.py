"""Append audit steps to ps005/prayed.json (or another psalm folder) from a JSON file of steps.
python3.13 research/psalterium/ps005/audit_add.py <folder> <steps.json> [status]"""
import json
import sys
from pathlib import Path

folder, stepsFile = Path(sys.argv[1]), Path(sys.argv[2])
path = folder / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
steps = json.loads(stepsFile.read_text(encoding='utf-8'))
known = [json.dumps(step, sort_keys=True, ensure_ascii=False) for step in data['audit']]
added = 0
for step in steps:
    if json.dumps(step, sort_keys=True, ensure_ascii=False) not in known:
        data['audit'].append(step)
        added += 1
if len(sys.argv) > 3:
    data['status'] = sys.argv[3]
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('added', added, 'status', data['status'])
