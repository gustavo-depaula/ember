"""Checks and critic inputs for Ps 36 while it is PARTIAL — copied from ps036/partial.py (left untouched) with the psalm number changed.

Run from the repo root, after render.py:  python3.13 research/psalterium/ps036/partial.py

Why: checks.py compares prayed.json against all 42 Latin verses and crashes on the first untranslated one;
render.py writes all 42 Latin verses into latin.json, which the blind Latinist would read as missing translations.
This script
  1. trims ps036/latin.json to the verses prayed.json holds (the Latinist's input), and
  2. runs checks.py's own code, unchanged, with the Latin restricted to those verses → ps036/checks.md,
     after confirming that the translated ids are an unbroken run of DO's ids from 36:1, in DO's order.
When the psalm is whole it still runs (it says "none" missing); the ordinary checks.py is then the gate.
"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parent))
import latin  # noqa: E402

psalm = '36'
prayed = json.loads((here / 'prayed.json').read_text(encoding='utf-8'))
have = list(latin.resolve(prayed))
full = latin.readVerses(latin.doLatin / f'Psalmorum/Psalm{psalm}.txt')
fullIds = [v['id'] for v in full]

if have != fullIds[: len(have)]:
    sys.exit(f'partial ids are not an unbroken run of DO ids from the start: {have[:3]} … {have[-3:]}')
missingNote = f'{fullIds[len(have)]}–{fullIds[-1]}' if len(have) < len(fullIds) else 'none — the psalm is whole'
print(f"partial: {len(have)} of {len(fullIds)} verses ({have[0]}–{have[-1]}); ids are DO's, in DO's order, no gaps. Missing: {missingNote}.")

(here / 'latin.json').write_text(json.dumps({v['id']: v['text'] for v in full if v['id'] in have}, ensure_ascii=False, indent=2), encoding='utf-8')

original = latin.readVerses
latin.readVerses = lambda path: [v for v in original(path) if v['id'] in have]
sys.argv = ['checks.py', str(here), psalm]
code = (here.parent / 'checks.py').read_text(encoding='utf-8')
exec(compile(code, 'checks.py', 'exec'), {'__name__': '__main__', '__file__': str(here.parent / 'checks.py')})
