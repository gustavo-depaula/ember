"""Check the ear.json files: each parses, every item has a note and verses of its own page, and a named decision exists.

Run from the repo root:  python3.13 research/psalterium/tests/ear_check.py [N …]
With no numbers, every folder that has an ear.json. Prints one line per folder, then "all ok" or the count of problems.
The notes themselves are shown by the site in the margin of the psalm page, level with their first verse.
"""

import importlib.util
import sys
from pathlib import Path

here = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(here))
# by path: the name `site` is Python's own module, already imported at startup
spec = importlib.util.spec_from_file_location('psalterium_site', here / 'site.py')
site = importlib.util.module_from_spec(spec)
spec.loader.exec_module(site)
loadPsalm, progressTable = site.loadPsalm, site.progressTable

folders = [here / f'ps{int(n):03d}' for n in sys.argv[1:]] or sorted(f.parent for f in here.glob('ps[0-9][0-9][0-9]/ear.json'))
progress = progressTable(here)
problems = 0
for folder in folders:
    if not (folder / 'ear.json').exists():
        print(f'{folder.name}: no ear.json')
        problems += 1
        continue
    try:
        p = loadPsalm(folder, progress)
    except ValueError as error:
        print(f'{folder.name}: the page does not build ({error})')
        problems += 1
        continue
    bad = [w for w in p['warnings'] if w.startswith('ear.json')]
    problems += len(bad)
    long = [item['refs'][0] for item in p['ear'] if len(item['note'].split()) > 45]
    print(f"{folder.name}: {len(p['ear'])} items" + ''.join(f'\n  {w}' for w in bad) + (f"\n  over 45 words: {', '.join(long)}" if long else ''))
print('all ok' if not problems else f'{problems} problems')
