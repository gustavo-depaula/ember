"""Align 67:7b *vinctos* with 68:34 *prisioneiros* (the vincti row). Run after build_gate.py; idempotent."""
import json
from pathlib import Path

here = Path(__file__).resolve().parent
p = json.loads((here / 'prayed.json').read_text(encoding='utf-8'))
v = p['verses']
if 'os presos com força' in v['67:7b']:
    v['67:7b'] = v['67:7b'].replace('os presos com força', 'os prisioneiros com força')
    p['choices']['67:7b'] += ' Final: *vinctos* → *os prisioneiros* (was *os presos*), one word with 68:34 *vincti* (πεπεδημένοι both; the glossary row *vincti*). Not read by a critic; 13 syllables against the Latin\'s 12.'
    p['audit'].append({'step': 'final', 'note': '67:7b *os presos* → *os prisioneiros*, to match 68:34 (row *vincti*, at the Ps 68 agent\'s request). No critic has read it.'})
(here / 'prayed.json').write_text(json.dumps(p, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(v['67:7b'])
