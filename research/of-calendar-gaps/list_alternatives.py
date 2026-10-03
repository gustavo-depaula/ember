"""List every `alternatives[]` entry in the ember-extra mass files: the Masses the importer drops."""
import json
import sys
from pathlib import Path

masses = Path(sys.argv[1] if len(sys.argv) > 1 else 'research/of-calendar-gaps/consult/content/libraries/base/of/masses')
for f in sorted(masses.rglob('*.json')):
    if f.name.startswith('_'):
        continue
    d = json.loads(f.read_text())
    for a in d.get('alternatives') or []:
        title = a.get('title') or {}
        print(d.get('id'), a.get('key'), a.get('rank'), '|', title.get('en') or title.get('la'))
