"""After the v2 gate: make the Latinist's second fix for 8:5 selectable (options only; option 0 and the text are untouched). Safe to re-run."""
import json
from pathlib import Path

path = Path(__file__).resolve().parent / 'prayed.json'
data = json.loads(path.read_text(encoding='utf-8'))
for d in data['decisions']:
    if d['id'] == 'quod' and not any(o['label'].startswith('que vos lembrais dele … pois') for o in d['options']):
        d['options'].insert(2, {
            'label': 'que vos lembrais dele … pois o visitais',
            'forms': {'quod': 'que vos lembrais dele', 'quoniam': 'pois o visitais'},
            'note': 'The Latinist’s second fix (draft 2, major): the indicative, and two conjunctions for the Latin’s two (quod … quóniam). The bare ‘que’ is heard in Brazil as a relative (‘the man you remember’), and the two halves of the question no longer match.',
            'from': 'latinist',
        })
        d['why'] += ' On draft 2 he repeated the major with another fix: ‘que vos lembrais dele … pois o visitais’.'
        print('option added')
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
