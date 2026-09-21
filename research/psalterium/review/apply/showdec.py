"""Print decisions in full: python3.13 research/psalterium/review/apply/showdec.py psNNN id [id …]"""

import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[2]
d = json.loads((root / sys.argv[1] / 'prayed.json').read_text(encoding='utf-8'))
for dec in d['decisions']:
    if dec['id'] in sys.argv[2:]:
        print(json.dumps(dec, ensure_ascii=False, indent=1))
