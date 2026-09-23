"""Print the decisions of the twin psalms (56, 59) compactly, to copy their rulings into Ps 107."""
import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
for n in sys.argv[1:] or ['056', '059']:
    d = json.loads((root / f'ps{n}' / 'prayed.json').read_text())
    print(f'===== Ps {n} v{d["version"]}')
    for dec in d['decisions']:
        print(f'-- {dec["id"]} {dec["refs"]} [{dec["latin"]}]')
        print('   why:', dec['why'])
        for o in dec['options']:
            print(f'   * {o["label"]} | {o.get("forms")} | {o.get("note","")} ({o.get("from","")})')
    print('CHOICES')
    for k, v in d.get('choices', {}).items():
        print(k, ':', v)
