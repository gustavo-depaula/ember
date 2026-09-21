"""Which current verses has no Latinist read in the wording they have now?

For every Latinist audit step: the draft it read (version k, from the file name) and the verses it
was shown (the whole draft, or the part folder's verses for staged reads). A current verse is
*unread* when its present flat text equals none of the texts a Latinist was shown for that verse.

python3.13 research/psalterium/unread/coverage.py [psNNN …]
"""

import json
import re
import sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root))
from latin import resolve  # noqa: E402


def draft(folder, k, current):
    p = folder / ('prayed.json' if k == current else f'prayed.v{k}.json')
    if not p.exists():
        return None
    return resolve(json.loads(p.read_text(encoding='utf-8')))


def main():
    names = sys.argv[1:]
    folders = [root / n for n in names] if names else sorted(root.glob('ps[0-9][0-9][0-9]'))
    for folder in folders:
        p = folder / 'prayed.json'
        if not p.exists():
            continue
        d = json.loads(p.read_text(encoding='utf-8'))
        current = d['version']
        now = resolve(d)
        seen = {}
        for a in d.get('audit', []):
            if a.get('step') != 'latinist' or not a.get('file'):
                continue
            m = re.search(r'v(\d+)\.', a['file'])
            if not m:
                continue
            k = int(m.group(1))
            text = draft(folder, k, current)
            if text is None:
                print(f'{folder.name}: no draft file for v{k}')
                continue
            part = re.search(r'\.(part\d+|unread)\.json$', a['file'])
            if part and (folder / part.group(1) / 'prayed.vos.json').exists():
                shown = json.loads((folder / part.group(1) / 'prayed.vos.json').read_text(encoding='utf-8'))
                ids = list(shown['verses'] if 'verses' in shown else shown)
            else:
                ids = list(text)
            for vid in ids:
                if vid in text:
                    seen.setdefault(vid, set()).add(text[vid])
        unread = [vid for vid, t in now.items() if t not in seen.get(vid, set())]
        if unread:
            print(f'{folder.name} v{current}: {len(unread)} unread: {" ".join(unread)}')


main()
