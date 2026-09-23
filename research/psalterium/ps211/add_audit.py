"""Append an audit step (or set a choices note) in ps211/prayed.json. Usage: add_audit.py step 'note' | add_audit.py choice ID 'text'"""
import json
import sys
from pathlib import Path

path = Path(__file__).parent / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
if sys.argv[1] == 'choice':
    data['choices'][sys.argv[2]] = data['choices'].get(sys.argv[2], '') + ' ' + sys.argv[3]
else:
    data['audit'].append({'step': sys.argv[1], 'note': sys.argv[2]})
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
