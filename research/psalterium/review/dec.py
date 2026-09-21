"""Show the decisions (and choices note) touching a verse: python3.13 review/dec.py 5:12a [grep-regex]
Prints each decision whose refs include the verse (or, with a regex, any decision/choice whose text matches)."""
import json
import re
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
vid = sys.argv[1]
psalm = int(vid.split(':')[0])
pat = re.compile(sys.argv[2], re.I) if len(sys.argv) > 2 else None
prayed = json.loads((here.parent / f'ps{psalm:03d}' / 'prayed.json').read_text(encoding='utf-8'))
print('RAW:', prayed['verses'].get(vid))
for d in prayed.get('decisions', []):
    blob = json.dumps(d, ensure_ascii=False)
    if vid in d.get('refs', []) or (pat and pat.search(blob)):
        print('\n== decision', d['id'], d.get('refs'))
        print('why:', d.get('why', '')[:1500])
        for o in d['options'][:4]:
            print('  -', o.get('label'), '|', json.dumps(o.get('forms'), ensure_ascii=False)[:200], '|', (o.get('note') or '')[:300])
ch = prayed.get('choices', {}).get(vid)
if ch:
    print('\n== choices', str(ch)[:2000])
