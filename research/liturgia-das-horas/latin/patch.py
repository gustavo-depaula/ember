# Writes the Latin of parts the iBreviary build leaves without into
# content/loth/latin/, from patches.json: {ref: {"latin": StoredLatin, "from": "<source, date>"}}.
# Each patch was read beside the Brazilian by two readers. A part that has
# Latin already keeps it. Run from the repository's root after the build.
import json, sys
from pathlib import Path

root = Path('content/loth')
patches = json.loads((Path(__file__).parent / 'patches.json').read_text())
written = 0
for ref, patch in sorted(patches.items()):
    bundle, i = ref.rsplit('.', 1)
    i = int(i)
    path = root / 'latin' / f'{bundle}.json'
    data = json.loads(path.read_text()) if path.exists() else {'id': bundle, 'parts': []}
    parts = data['parts']
    size = len(json.loads((root / 'parts' / f'{bundle}.json').read_text())['parts'])
    parts.extend([None] * (size - len(parts)))
    if parts[i]:
        continue
    parts[i] = patch['latin']
    path.write_text(json.dumps(data, ensure_ascii=False, separators=(',', ':')) + '\n')
    written += 1
print(f'{written} of {len(patches)} patches written', file=sys.stderr)
