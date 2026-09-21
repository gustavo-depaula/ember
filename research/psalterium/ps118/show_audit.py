"""Print chosen audit steps / choices of prayed.json. python3.13 research/psalterium/ps118/show_audit.py handoff [file]"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
want = sys.argv[1] if len(sys.argv) > 1 else 'handoff'
name = sys.argv[2] if len(sys.argv) > 2 else 'prayed.json'
data = json.loads((here / name).read_text(encoding='utf-8'))
if want == 'choices':
    for k, v in data['choices'].items():
        print(k, '::', v)
else:
    for i, s in enumerate(data['audit']):
        if want in ('all', s['step']) or want == str(i):
            print(f"--- [{i}] {s['step']} {s.get('file', '')} v={s.get('version', '')}")
            print(s['note'])
            for o in s.get('outcomes', []):
                print('   *', json.dumps(o, ensure_ascii=False))
