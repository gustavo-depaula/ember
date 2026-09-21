"""Show finished psalms' prayed text (flat prayed.vos.json) beside the DO Latin, for verse ids or a Latin/Portuguese regex.
python3.13 research/psalterium/ps010/grep_done.py '<regex>' [...]   (matched accent-blind against Latin OR Portuguese)
Read-only."""
import json
import re
import sys
import unicodedata
from pathlib import Path

root = Path(__file__).resolve().parents[1]


def plain(text):
    text = text.replace('æ', 'ae').replace('œ', 'oe').replace('ǽ', 'ae')
    return ''.join(c for c in unicodedata.normalize('NFD', text) if not unicodedata.combining(c)).lower()


for folder in sorted(root.glob('ps[0-9][0-9][0-9]')):
    flat = folder / 'prayed.vos.json'
    latinFile = folder / 'latin.json'
    if not flat.exists():
        continue
    pt = json.loads(flat.read_text(encoding='utf-8'))
    la = json.loads(latinFile.read_text(encoding='utf-8')) if latinFile.exists() else {}
    for vid, text in pt.items():
        for pattern in sys.argv[1:]:
            rx = re.compile(pattern)
            if rx.search(plain(text)) or rx.search(plain(la.get(vid, ''))):
                print(f'{folder.name} {vid}\n  LA {la.get(vid, "")}\n  PT {text}')
                break
