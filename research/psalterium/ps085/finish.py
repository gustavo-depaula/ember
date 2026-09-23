"""Record the v2 Latinist gate in prayed.json's audit (idempotent)."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
path = here / 'prayed.json'
d = json.loads(path.read_text(encoding='utf-8'))
if any(s.get('file') == 'critic/v2.latinist.json' for s in d['audit']):
    raise SystemExit('already recorded')
puer = next(x for x in d['decisions'] if x['id'] == 'puer')
puer['why'] += (' v2 gate: the Latinist (minor) asked "menino" for the same reason. Held: "menino" was heard wrongly at 68:18, and the row and the servo/serva pair stand; "menino" is option 3.')
puer['options'][2]['note'] += ' The v2 Latinist (minor) asked it.'
d['audit'].append({
    'step': 'latinist',
    'file': 'critic/v2.latinist.json',
    'note': 'v2 gate. claude-opus-5-5, fresh context, with latin.json, run by the coordinator. One minor, no major. Overall: "A faithful, close rendering"; pointing matches the Latin in every verse.',
    'outcomes': [{
        'verse': '85:16',
        'remark': 'púero merged with servus (85:2, 3) → "ao vosso menino" (minor)',
        'outcome': 'option',
        'decision': 'puer',
        'reason': 'The púer row (68:18) gives servo; "servo … serva" in one colon is the pair the Latin builds with "fílium ancíllæ tuæ"; "menino" was heard wrongly at 68:18. Kept as option 3; "criado" (the v1 ask) is option 2.',
    }],
})
path.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('recorded')
