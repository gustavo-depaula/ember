"""Append one audit step to ps048/prayed.json: python3.13 audit_note.py '<json object>'"""
import json
import sys
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
p = json.loads(path.read_text(encoding='utf-8'))
p['audit'].append(json.loads(sys.argv[1]))
path.write_text(json.dumps(p, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(len(p['audit']))
