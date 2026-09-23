"""Print the fetched parallels of Tobit 13 (Clementine Vulgate, LXX B/A from bolls; DRB from drbo.org if fetched).
python3.13 research/psalterium/ps212/show.py"""
import html
import json
import re
from pathlib import Path

consult = Path(__file__).resolve().parents[1] / 'consult'


def clean(text):
    return html.unescape(re.sub(r'<[^>]+>', '', text)).strip()


for name in ['bolls-VULG-68-13.json', 'bolls-LXX-68-13.json']:
    print(f'## {name}')
    for v in json.loads((consult / name).read_text(encoding='utf-8')):
        if v['verse'] <= 13:
            print(f"13:{v['verse']} {clean(v['text'])}")
    print()
drb = consult / 'drb-tobit13.txt'
if drb.exists():
    print('## DRB (drbo.org)')
    print(drb.read_text(encoding='utf-8'))
