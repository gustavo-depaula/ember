"""Print the Bolls VULG (Clementine) chapters fetched for Pss 32-33 and the NT places that quote Ps 33.
python3.13 research/psalterium/ps033/show_vulg.py"""
import json
import re
from pathlib import Path

consult = Path(__file__).resolve().parents[1] / 'consult'
wanted = {
    '19-32': None, '19-33': None,
    '60-2': range(1, 6),     # 1 Peter 2:1-5 (2:3 = Ps 33:9)
    '60-3': range(8, 16),    # 1 Peter 3:8-15 (3:10-12 = Ps 33:13-17)
    '43-19': range(31, 38),  # John 19:31-37 (19:36)
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
