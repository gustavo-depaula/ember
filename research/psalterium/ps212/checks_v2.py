"""Append the draft-2 checks step to ps212/prayed.json."""
import json
from pathlib import Path
p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
d['audit'].append({"step": "checks", "note": "Draft 2: hard pass. New soft flag 13:4a +3 (23 against the Latin's 20), accepted: the supplied 'ele' is the stylist's asked-for subject, and without it ('Porque para isto vos dispersou') 'vos' and 'o' blur again; the draft-1 flags (13:3b, 13:5a, 13:7a, 13:7b, 13:8a) are unchanged and stay accepted."})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
