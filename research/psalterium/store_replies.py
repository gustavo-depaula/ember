"""Store every pending blind-reader reply in the given psalm folders, via reader_record.py.

Run from the repo root:  python3.13 research/psalterium/store_replies.py 57 62 63

A reply is pending when `psNNN/reply.latinist.txt`, `psNNN/reply.stylist.txt` or `psNNN/blind/reply.ambiguity.txt`
exists. It is stored as `critic/v<k>.<role>.json`, where k is `version` in prayed.json (the draft the reader read),
and never over an existing record. Prints, per psalm, which roles now have a record for that draft.
"""

import json
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parent
model = 'claude-opus-5-5 (fresh context, with latin.json)'
for arg in sys.argv[1:]:
    folder = root / f'ps{int(arg):03d}'
    k = json.loads((folder / 'prayed.json').read_text(encoding='utf-8'))['version']
    jobs = [
        ('latinist', folder, '../prompts/latinist.md', 'reply.latinist.txt', f'critic/v{k}.latinist.json', model),
        ('stylist', folder, '../prompts/stylist.md', 'reply.stylist.txt', f'critic/v{k}.stylist.json', model),
        ('ambiguity', folder / 'blind', '../../prompts/ambiguity.md', 'reply.ambiguity.txt', f'../critic/v{k}.ambiguity.json',
         'claude-opus-5-5 (fresh context)'),
    ]
    for role, workdir, prompt, reply, out, who in jobs:
        if not (workdir / reply).exists():
            continue
        if (workdir / out).exists():
            print(f'ps{int(arg):03d}: {out} already exists; {reply} left in place')
            continue
        subprocess.run([sys.executable, str(root / 'reader_record.py'), str(workdir), prompt, 'prayed.vos.json', reply, out, who],
                       check=True, stdout=subprocess.DEVNULL)
    have = [r for r in ('latinist', 'stylist', 'ambiguity') if (folder / f'critic/v{k}.{r}.json').exists()]
    print(f'ps{int(arg):03d} v{k}: {", ".join(have) or "none"}')
