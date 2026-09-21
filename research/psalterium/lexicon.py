"""Lewis & Short entries for given lemmas, from the consult/ cache (ls_<LETTER>.json, github.com/IohannesArnold/lewis-short-json).

Run from the repo root:  python3.13 research/psalterium/lexicon.py compungo dilato
L&S is classical-first; for Christian senses it is a floor, not the last word (Blaise and Souter are not digitised here).
"""

import json
import re
import sys
from pathlib import Path

consult = Path(__file__).resolve().parent / 'consult'


def flatten(senses, depth=0):
    for sense in senses or []:
        if isinstance(sense, list):
            yield from flatten(sense, depth + 1)
        else:
            yield '  ' * depth + re.sub(r'\s+', ' ', str(sense)).strip()


def lookup(lemma):
    path = consult / f'ls_{lemma[0].upper()}.json'
    if not path.exists():
        return None
    entries = json.loads(path.read_text(encoding='utf-8'))
    return [e for e in entries if re.sub(r'\d', '', e.get('key', '')).lower() == lemma.lower()]


def main():
    for lemma in sys.argv[1:]:
        entries = lookup(lemma)
        if entries is None:
            print(f'\n## {lemma}: letter file not in consult/')
            continue
        if not entries:
            print(f'\n## {lemma}: no entry')
        for entry in entries:
            print(f"\n## {entry['key']} — {entry.get('part_of_speech', '')} {entry.get('main_notes', '')}".rstrip())
            for line in list(flatten(entry.get('senses')))[:14]:
                print(line[:420])


if __name__ == '__main__':
    main()
