"""Move the length notes onto verse-id keys in choices (Ps 131 v1)."""
import json
from pathlib import Path

p = Path(__file__).with_name('prayed.json')
d = json.loads(p.read_text(encoding='utf-8'))
c = d['choices']
c.pop('131:length', None)
notes = {
    '131:3': 'Length flag 3a (−4) accepted: the oath\'s plain future is shorter than the Latin\'s conditional (si_oath).',
    '131:5': 'Length flag 5a (+4) accepted: *até que eu encontre um lugar para o Senhor* has no shorter sayable form.',
    '131:7': 'Length flag 7a (−4) accepted: *tenda* (row) against *tabernáculum*.',
    '131:8': 'Length flag 8a (+3) accepted: *para o vosso* is the Latin\'s possessive.',
    '131:14': 'Length flag 14a (+4) accepted: the D27 formula.',
    '131:17': 'Length flags 17a/b (+4 each) accepted: the two *para* datives are kept parallel (*um chifre para Davi … uma lâmpada para o meu Cristo*); the shorter *a Davi … ao meu Cristo* is noted for the stylist.',
}
out = {}
for k in d['verses']:
    parts = [x for x in (c.get(k), notes.get(k)) if x]
    if parts:
        out[k] = ' '.join(parts)
d['choices'] = out
p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(list(out))
