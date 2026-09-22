"""Keeps the gloss shards in step with the parse: every lemma of lemmas.json has a line in its shard.

Run from the repo root:  python3.13 research/psalterium/interlinear/shards.py
A lemma new to the parse is added with an empty gloss; a gloss already written is never touched; a lemma the parse no
longer yields is listed, not deleted (a formOverride or lemmaFixes may still point at it). The first run seeds the
shards from the pilot's ps004/glosses.json. Shards are split by the lemma's first letter so that gloss agents can
work in parallel, one shard each (GLOSSING.md).
"""

import json
from pathlib import Path

here = Path(__file__).resolve().parent
shards = {'a-b': 'ab', 'c': 'c', 'd-e': 'de', 'f-h': 'fgh', 'i-l': 'ijkl', 'm-o': 'mno', 'p': 'p', 'q-r': 'qr', 's': 's', 't-z': 'tuvwxyz'}
note = (
    'Glosses for the interlinear (tier 1): the bare Brazilian Portuguese dictionary sense of each lemma, the psalter’s sense '
    'first, at most about four words — not a rendering. Brief: interlinear/GLOSSING.md. An empty string is a gloss not yet written.'
)


def shardOf(lemma):
    return next((name for name, letters in shards.items() if lemma[:1] in letters), 't-z')


def main():
    lemmas = json.loads((here / 'lemmas.json').read_text(encoding='utf-8'))
    folder = here / 'glosses'
    folder.mkdir(exist_ok=True)
    seed = {'lemmas': {}, 'formOverrides': {}}
    if not any(folder.glob('*.json')):
        seed = json.loads((here.parent / 'ps004' / 'glosses.json').read_text(encoding='utf-8'))
    for name in shards:
        path = folder / f'{name}.json'
        shard = json.loads(path.read_text(encoding='utf-8')) if path.exists() else {'note': note, 'lemmas': {}, 'lemmaFixes': {}, 'formOverrides': {}}
        glosses = shard['lemmas']
        added = 0
        for lemma in lemmas:
            if shardOf(lemma) == name and lemma not in glosses:
                glosses[lemma] = seed['lemmas'].get(lemma, '')
                added += 1
        for form, override in seed['formOverrides'].items():
            if shardOf(override.get('lemma', form)) == name:
                shard['formOverrides'].setdefault(form, override)
        gone = [lemma for lemma in glosses if lemma not in lemmas]
        shard['lemmas'] = dict(sorted(glosses.items()))
        path.write_text(json.dumps(shard, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
        done = sum(1 for lemma, gloss in glosses.items() if gloss or lemma in shard.get('lemmaFixes', {}))
        print(f'{name:>4}: {len(glosses)} lemmas, {done} glossed, {added} added' + (f'; not in the parse: {", ".join(gone)}' if gone else ''))


main()
