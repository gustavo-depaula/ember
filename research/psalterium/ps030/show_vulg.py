"""Print the Bolls VULG chapters fetched for Pss 30-31 (consult/bolls-VULG-*.json), with the NT places.
python3.13 research/psalterium/ps030/show_vulg.py"""
import json
import re
from pathlib import Path

consult = Path(__file__).resolve().parents[1] / 'consult'
wanted = {
    '19-30': None, '19-31': None,
    '42-23': range(44, 48),  # Luke 23:44-47
    '45-4': range(5, 10),    # Romans 4:5-9
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
