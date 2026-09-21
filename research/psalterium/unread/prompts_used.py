"""Print prompt / target / model of every Latinist and ambiguity record in the given folders."""

import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
for name in sys.argv[1:]:
    for f in sorted((root / name / 'critic').glob('*.json')):
        if 'latinist' not in f.name and 'ambiguity' not in f.name:
            continue
        r = json.loads(f.read_text(encoding='utf-8'))
        print(name, f.name, '|', r.get('prompt'), '|', r.get('target'), '|', r.get('model'), '|', r.get('promptSha256', '')[:10])
