"""Append an audit step to ps142/prayed.json. python3.13 research/psalterium/ps142/addaudit.py '<json step>'"""
import json, sys
from pathlib import Path
p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
d['audit'].append(json.loads(sys.argv[1]))
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(len(d['audit']))
