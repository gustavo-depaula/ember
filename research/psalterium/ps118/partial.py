"""Checks and critic inputs for a PARTIAL psalm — a work-around, so that checks.py and render.py stay untouched.

Run from the repo root, after render.py:  python3.13 research/psalterium/ps118/partial.py

Why: checks.py compares prayed.json against all 176 Latin verses and crashes on the first untranslated one
(marks(None)); render.py writes all 176 Latin verses into latin.json, which the blind Latinist would read as
144 missing translations. This script
  1. trims ps118/latin.json to the verses prayed.json holds (the Latinist's input), and
  2. runs checks.py's own code, unchanged, with the Latin restricted to those verses → ps118/checks.md,
     after confirming that the translated ids are an unbroken run of DO's ids from 118:1, in DO's order.
Delete it when the psalm is complete.
"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent))
import latin  # noqa: E402

prayed = json.loads((here / 'prayed.json').read_text(encoding='utf-8'))
have = list(prayed['verses'])
full = latin.readVerses(latin.doLatin / 'Psalmorum/Psalm118.txt')
fullIds = [v['id'] for v in full]

if have != fullIds[: len(have)]:
    sys.exit(f'partial ids are not an unbroken run of DO ids from the start: {have[:3]} … {have[-3:]}')
# the fourth agent (118:129–176): with all 176 verses present, fullIds[len(have)] raised IndexError — say "none" instead
missingNote = f'{fullIds[len(have)]}–{fullIds[-1]}' if len(have) < len(fullIds) else 'none — the psalm is whole'
print(f"partial: {len(have)} of {len(fullIds)} verses ({have[0]}–{have[-1]}); ids are DO's, in DO's order, no gaps. Missing: {missingNote}.")

(here / 'latin.json').write_text(json.dumps({v['id']: v['text'] for v in full if v['id'] in have}, ensure_ascii=False, indent=2), encoding='utf-8')

original = latin.readVerses
latin.readVerses = lambda path: [v for v in original(path) if v['id'] in have]
sys.argv = ['checks.py', str(here), '118']
source = (here.parent / 'checks.py').read_text(encoding='utf-8')
exec(compile(source, 'checks.py', 'exec'), {'__name__': '__main__', '__file__': str(here.parent / 'checks.py')})
