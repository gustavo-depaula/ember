"""Print Daniel 3:52-90 from the Bolls files fetched into consult/ (DRB, VULG, LXX).
python3.13 research/psalterium/ps210/show_dan3.py [DRB|VULG|LXX|MS ...]"""
import json
import re
import sys
from pathlib import Path

consult = Path(__file__).resolve().parents[1] / 'consult'
for code in sys.argv[1:] or ['VULG', 'LXX', 'DRB']:
    path = consult / f'bolls-{code}-27-3.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    print(f'== {code} ({len(data)} verses)')
    for v in data:
        if 52 <= v['verse'] <= 90:
            print(v['verse'], re.sub(r'<[^>]+>', '', v['text']))
