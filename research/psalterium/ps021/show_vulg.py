"""Print the Bolls VULG chapters fetched for Ps 21 (consult/bolls-VULG-*.json): the psalm and its NT places.
python3.13 research/psalterium/ps021/show_vulg.py"""
import json
import re
from pathlib import Path

consult = Path(__file__).resolve().parents[1] / 'consult'
wanted = {
    '19-21': None,
    '40-27': range(35, 47),  # Matthew 27:35-46 (lots, wagging heads, "confidit in Deo", Eli Eli)
    '41-15': range(24, 35),  # Mark 15:24-34
    '43-19': range(23, 25),  # John 19:23-24 (the tunic)
    '58-2': range(10, 13),   # Hebrews 2:10-12
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
