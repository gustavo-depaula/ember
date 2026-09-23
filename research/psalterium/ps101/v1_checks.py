"""Record the v1 checks in ps101's audit and choices."""
import json
from pathlib import Path

p = Path(__file__).resolve().parent / 'prayed.json'
d = json.loads(p.read_text(encoding='utf-8'))
if not any(a['step'] == 'checks' for a in d['audit']):
    d['audit'].append({
        "step": "checks",
        "note": "Hard checks pass. Soft: 101:3 second colon +9 (keeps *quacúmque* and the whole *inclinai para mim o vosso ouvido* formula; accepted); 101:4, 5, 6, 10, 14, 22, 29 +3/+4 (article and possessive before nouns; *descendência* D32) accepted; 101:13 −6, 25 −4, 26 −3, 7 −3 short, accepted. Rhyme 101:16/17 *glória … glória*: the Latin has the same echo (*glóriam tuam … in glória sua*), kept."
    })
    d['choices']['101:16'] += " The rhyme flagged with 101:17 (*glória … glória*) is the Latin's own echo."
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2), encoding='utf-8')
    print('recorded')
else:
    print('already recorded')
