"""A lemma in context, as the parse has it: for glossing and for spotting a misparse.

Run from the repo root:  python3.13 research/psalterium/interlinear/show.py <lemma> [<lemma> …] [--all]
Prints the lemma's count and forms (lemmas.json), then each occurrence — verse id, the printed form, LatinCy's part of
speech and features, and the Latin colon it stands in. Eight occurrences a lemma unless --all. A form is also accepted
(prefix it with form:, e.g. form:mei) to list every occurrence of that folded form whatever its lemma.
"""

import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent


def main():
    args = [a for a in sys.argv[1:] if a != '--all']
    limit = None if '--all' in sys.argv else 8
    lemmas = json.loads((here / 'lemmas.json').read_text(encoding='utf-8'))
    parses = [json.loads(p.read_text(encoding='utf-8')) for p in sorted((here / 'parse').glob('ps*.json'))]
    for wanted in args:
        byForm = wanted.startswith('form:')
        key = wanted.removeprefix('form:').lower()
        if not byForm:
            entry = lemmas.get(key)
            print(f'\n## {key}: ' + (f"{entry['count']}× in {len(entry['psalms'])} psalms; forms {', '.join(entry['forms'])}" if entry else 'not a lemma of the parse'))
        else:
            print(f'\n## the form {key}')
        shown = 0
        for parsed in parses:
            for verse in parsed['verses']:
                for colon in verse['cola']:
                    for token in colon['tokens']:
                        if (token['fold'] if byForm else token['lemma']) != key:
                            continue
                        shown += 1
                        if limit is None or shown <= limit:
                            print(f"{verse['id']:>8}  {token['form']:<16} {token['lemma']:<12} {token['pos']:<6} {token['morph']}\n{'':>10}{colon['latin']}")
        if limit is not None and shown > limit:
            print(f'          … {shown - limit} more (--all)')


main()
