"""Show the New Testament places that quote Ps 8, from the Vulgate fetched to consult/ (bolls.life, VULG).
python3.13 research/psalterium/ps008/show_nt.py"""
import json
import re
from pathlib import Path

consult = Path(__file__).resolve().parents[1] / 'consult'
for name, verses in (('bolls-VULG-58-2.json', range(5, 10)), ('bolls-VULG-40-21.json', range(15, 17))):
    path = consult / name
    try:
        data = json.loads(path.read_text(encoding='utf-8'))
    except Exception as error:  # noqa: BLE001
        print(name, 'unreadable:', error, path.read_text(encoding='utf-8')[:200])
        continue
    for row in data:
        if row['verse'] in verses:
            print(name, row['verse'], re.sub(r'<[^>]+>', '', row['text']))
