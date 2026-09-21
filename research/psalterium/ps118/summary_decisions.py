"""Print the decisions of prayed.json compactly: id, kind, refs count, option labels, and option-0 forms.
python3.13 research/psalterium/ps118/summary_decisions.py [file] [--full id,id]"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
name = sys.argv[1] if len(sys.argv) > 1 and not sys.argv[1].startswith('--') else 'prayed.json'
data = json.loads((here / name).read_text(encoding='utf-8'))
full = []
for a in sys.argv:
    if a.startswith('--full='):
        full = a.split('=')[1].split(',')
print(data['version'], data['status'], data.get('range'), len(data['verses']), 'verses', len(data['decisions']), 'decisions')
print('top keys:', list(data))
for d in data['decisions']:
    labels = [o['label'] for o in d['options']]
    print(f"\n## {d['id']} [{d['kind']}] refs={d['refs']}")
    print('   latin:', d['latin'])
    print('   labels:', labels)
    print('   forms0:', d['options'][0]['forms'])
    if d['id'] in full:
        print(json.dumps(d, ensure_ascii=False, indent=2))
print('\naudit steps:', [(s['step'], s.get('file', '')) for s in data['audit']])
