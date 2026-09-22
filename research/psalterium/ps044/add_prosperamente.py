"""Add the gate Latinist's *prosperamente* as an option on `prospere`. Run: python3.13 research/psalterium/ps044/add_prosperamente.py"""
import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
dec = next(d for d in data['decisions'] if d['id'] == 'prospere')
if not any(o['label'] == 'avança prosperamente' for o in dec['options']):
    dec['options'].insert(2, {'label': 'avança prosperamente', 'forms': {'prospere': 'avança prosperamente', 'prospere_v': 'avançai prosperamente'},
                              'note': 'The gate Latinist\'s: the adverb kept; heavy and rare in speech.', 'from': 'latinist'})
    dec['why'] += ' The gate Latinist (v2) preferred the adverb *prosperamente* (minor); held: *próspero* keeps the root, and the adverb is what draft 1 avoided as heavy.'
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print('ok')
