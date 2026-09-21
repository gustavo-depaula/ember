"""Print only the named decisions of prayed.json (labels and forms; --why adds why and notes).
python3.13 research/psalterium/ps118/show_decision.py fiat,odio_habui [--why] [file]"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
args = [a for a in sys.argv[1:] if not a.startswith('--')]
want = args[0].split(',')
name = args[1] if len(args) > 1 else 'prayed.json'
data = json.loads((here / name).read_text(encoding='utf-8'))
for d in data['decisions']:
    if d['id'] not in want:
        continue
    print(f"## {d['id']} [{d['kind']}] refs={d['refs']}\n   latin: {d['latin']}")
    if '--why' in sys.argv:
        print('   why:', d['why'])
    for o in d['options']:
        print(f"   - {o['label']!r} ({o.get('from', '')}): {json.dumps(o['forms'], ensure_ascii=False)}")
        if '--why' in sys.argv:
            print('       note:', o.get('note', ''))
