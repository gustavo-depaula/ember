"""Print the Bolls VULG chapters fetched for Pss 13-15 (consult/bolls-VULG-*.json), with the NT places.
python3.13 research/psalterium/ps013/show_vulg.py"""
import json
import re
from pathlib import Path

consult = Path(__file__).resolve().parents[1] / 'consult'
wanted = {
    '19-13': None, '19-14': None, '19-15': None, '19-52': None,
    '45-3': range(10, 19),   # Romans 3:10-18
    '44-2': range(25, 32),   # Acts 2:25-31
    '44-13': range(33, 38),  # Acts 13:33-37
}
for key, verses in wanted.items():
    path = consult / f'bolls-VULG-{key}.json'
    data = json.loads(path.read_text(encoding='utf-8'))
    print(f'## {path.name}')
    for v in data:
        if verses is None or v['verse'] in verses:
            text = re.sub(r'<[^>]+>', '', v['text'])
            print(f"{v['verse']}: {text}")
    print()
