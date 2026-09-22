"""List what a Grok trial run saw of the finished psalm it was re-translating.

    python3.13 research/psalterium/trials/grok-4.7/leaks.py <N>

Scans the trial folder's stream-json logs for tool results that carry text from research/psalterium/ps<NNN>/
(grep matches or file reads) and prints the verse ids and lines exposed.
"""

import json
import re
import sys
from pathlib import Path

n = int(sys.argv[1])
nnn = f'{n:03d}'
here = Path(__file__).resolve().parent / f'ps{nnn}'
finished = f'research/psalterium/ps{nnn}/'
seen = {}
for log in sorted(here.glob('log.*.jsonl')):
    for raw in log.read_text(encoding='utf-8').splitlines():
        if finished not in raw:
            continue

        def walk(node, file=None):
            if isinstance(node, dict):
                f = node.get('file') or node.get('path') or file
                if isinstance(f, str) and finished in f and 'trials/' not in f:
                    for key in ('content', 'contents', 'text'):
                        if isinstance(node.get(key), str) and key != 'file':
                            seen.setdefault(f, set()).add(node[key].strip()[:220])
                for v in node.values():
                    walk(v, f if isinstance(f, str) else file)
            elif isinstance(node, list):
                for v in node:
                    walk(v, file)

        walk(json.loads(raw))
for f, lines in seen.items():
    ids = sorted(set(re.findall(rf'\b{n}:\d+[a-z]?\b', ' '.join(lines))))
    print(f'{f}: {len(lines)} snippets; verse ids: {", ".join(ids)}')
    for line in sorted(lines):
        print('   ', line)
if not seen:
    print('nothing seen')
