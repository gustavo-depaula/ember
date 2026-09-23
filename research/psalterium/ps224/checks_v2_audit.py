"""Ps 224 v2: record the checks step (one-off)."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
d['audit'] = [a for a in d['audit'] if not (a['step'] == 'checks' and a.get('version') == 2)]
d['audit'].append({'step': 'checks', 'file': 'checks.md', 'version': 2,
    'note': "v2: hard checks pass. Soft flags as v1 (15:4a +4, 15:8a +5, 15:16a +4, 15:6 −3/−3, 15:10b −3, 15:14a −3), all accepted as in v1. "
            "New: 15:19b −4 with 'fizestes'; nothing of the Latin is left out. 15:21 / 15:22 finals 'mar / mar': not a rhyme but the same word, "
            "the sea named twice as the Latin's 'maris … ejus' refers to it; accepted for the audibility the ambiguity reader asked. "
            "15:3 'glorificarei / exaltarei' is the Latin's own parallel, as v1."})
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
