"""Record the v2 Latinist gate in Ps 124 and note the benefácere row. Idempotent."""
import json
from pathlib import Path

here = Path(__file__).parent
path = here / 'prayed.json'
d = json.loads(path.read_text())

if not any(a.get('file') == 'critic/v2.latinist.json' for a in d['audit']):
    d['audit'].append({
        "step": "latinist", "file": "critic/v2.latinist.json",
        "note": "Draft 2; claude-opus-5-5, fresh context, with latin.json. No remarks: the copulas permitted, 'deixará' keeps the future, 'os que se desviam para os laços' kept concrete against the Hebrew, the D37 formula loses nothing; marks match. Gate clean.",
        "outcomes": []
    })
    d['status'] = 'reviewed'

b = next(x for x in d['decisions'] if x['id'] == 'benefac')
extra = " The glossary row benefácere (open; 48:19, 56:3, 114:7) has 'fazer bem'; Ps 114's agent proposed 'fazer o bem' as the row's alternative because its stylist heard 'te fez bem' as 'was good for you'. Here, with 'aos bons' after it, the article is what keeps the echo and the right hearing, so 124:4 departs from the row and supports that proposal."
if extra not in b['why']:
    b['why'] += extra

path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print('ok')
