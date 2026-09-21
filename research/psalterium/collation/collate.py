"""Collate the pilot Latin (Divinum Officium mirror) against the Clementine Vulgate Project text.

Run from the repo root:  python3.13 research/psalterium/collation/collate.py
Writes research/psalterium/collation/diffs.md — the mechanical word-level diff.
Judgement about each divergence lives in report.md, not here.
"""

import difflib
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from latin import doLatin as doDir, readVerses, words as normalise  # noqa: E402

witnessDir = Path(__file__).resolve().parent / 'witness'

# (label, DO file, witness file, chapter, first verse, last verse)
pilot = [
    ('Ps 4', 'Psalmorum/Psalm4.txt', 'clem-Ps.lat', 4, 1, 10),
    ('Ps 53', 'Psalmorum/Psalm53.txt', 'clem-Ps.lat', 53, 1, 9),
    ('Ps 90', 'Psalmorum/Psalm90.txt', 'clem-Ps.lat', 90, 1, 16),
    ('Ps 94', 'Psalmorum/Psalm94.txt', 'clem-Ps.lat', 94, 1, 11),
    ('Ps 117', 'Psalmorum/Psalm117.txt', 'clem-Ps.lat', 117, 1, 29),
    ('Ps 118:1-32', 'Psalmorum/Psalm118.txt', 'clem-Ps.lat', 118, 1, 32),
    ('Ps 133', 'Psalmorum/Psalm133.txt', 'clem-Ps.lat', 133, 1, 3),
    ('Nunc dimittis (Lc 2:29-32)', 'Psalmorum/Psalm233.txt', 'clem-Lc.lat', 2, 29, 32),
]


def readDo(path):
    """Return {biblical verse: {'labels': [...], 'words': [...]}} — a/b prayed-verse suffixes folded together."""
    verses = {}
    for prayed in readVerses(path):
        entry = verses.setdefault((prayed['chapter'], prayed['verse']), {'labels': [], 'words': []})
        entry['labels'].append(prayed['id'])
        entry['words'] += normalise(prayed['text'])
    return verses


def readWitness(path):
    verses = {}
    for line in path.read_text(encoding='cp1252').splitlines():
        match = re.match(r'^(\d+):(\d+)\s+(.*)$', line)
        if match:
            verses[(int(match[1]), int(match[2]))] = match[3]
    return verses


def wordDiffs(doWords, witnessWords):
    matcher = difflib.SequenceMatcher(a=doWords, b=witnessWords, autojunk=False)
    return [
        (' '.join(doWords[i1:i2]) or '—', ' '.join(witnessWords[j1:j2]) or '—')
        for tag, i1, i2, j1, j2 in matcher.get_opcodes()
        if tag != 'equal'
    ]


def collatePilot():
    out = []
    for label, doFile, witnessFile, chapter, first, last in pilot:
        do = readDo(doDir / doFile)
        witness = readWitness(witnessDir / witnessFile)
        out.append(f'## {label}\n')
        rows, splits, absent = [], [], []
        for verse in range(first, last + 1):
            key = (chapter, verse)
            if key not in do:
                absent.append(f'- `{chapter}:{verse}` not in DO — witness: *{witness[key].strip()}*')
                continue
            if len(do[key]['labels']) > 1:
                splits.append(', '.join(do[key]['labels']))
            for doReading, witnessReading in wordDiffs(do[key]['words'], normalise(witness[key])):
                rows.append(f'| {chapter}:{verse} | {doReading} | {witnessReading} |')
        out.append(f'Prayed-verse splits: {"; ".join(splits) or "none"}\n')
        if absent:
            out.append('Witness verses absent from DO:\n\n' + '\n'.join(absent) + '\n')
        if rows:
            out.append('Verse by verse:\n\n| verse | DO | Clementine Project |\n| --- | --- | --- |\n' + '\n'.join(rows) + '\n')
        else:
            out.append('No word-level divergence verse by verse.\n')
        # DO's prayed verses sometimes cross biblical verse boundaries — inline `(20)`, a skipped number —
        # so a numbering shift shows up above as wording. Diffing the whole text separates the two.
        doAll = [w for key in sorted(do) if first <= key[1] <= last for w in do[key]['words']]
        witnessAll = [w for verse in range(first, last + 1) for w in normalise(witness[(chapter, verse)])]
        whole = [f'| {a} | {b} |' for a, b in wordDiffs(doAll, witnessAll)]
        if whole:
            out.append('Whole text, numbering ignored:\n\n| DO | Clementine Project |\n| --- | --- |\n' + '\n'.join(whole) + '\n')
        else:
            out.append('Whole text, numbering ignored: identical.\n')
        crossings = re.findall(r'\((\d+[a-z]?)\)', (doDir / doFile).read_text(encoding='utf-8'))
        if crossings:
            out.append(f'Inline biblical-verse markers inside prayed verses: {", ".join(crossings)}\n')
    return out


def collateInvitatory():
    """The invitatory has no verse numbers, so diff it whole against DO's own ordinary-form Ps 94."""
    lines = (doDir / 'Invitatorium.txt').read_text(encoding='utf-8').splitlines()
    invitatory = [w for line in lines if line.startswith('v. ') for w in normalise(line[3:])]
    ordinary = [w for entry in readDo(doDir / 'Psalmorum/Psalm94.txt').values() for w in entry['words']]
    rows = [f'| {a} | {b} |' for a, b in wordDiffs(invitatory, ordinary)]
    return [
        '## Invitatorium vs Psalm94 (both DO)\n',
        '| Invitatorium.txt | Psalm94.txt |\n| --- | --- |\n' + '\n'.join(rows) + '\n',
    ]


def markCensus():
    """Every non-letter, non-punctuation mark in the pilot files, so nothing is silently stripped."""
    files = sorted({doFile for _, doFile, *_ in pilot}) + ['Invitatorium.txt']
    counts = {}
    for name in files:
        for char in (doDir / name).read_text(encoding='utf-8'):
            if not (char.isalnum() or char.isspace() or char in '.,;:!?()\'"'):
                counts.setdefault(char, {}).setdefault(name, 0)
                counts[char][name] += 1
    rows = [
        f'| `{char}` | {sum(by.values())} | {", ".join(f"{Path(n).stem} ×{c}" for n, c in by.items())} |'
        for char, by in sorted(counts.items())
    ]
    return ['## Marks in the DO pilot files\n', '| mark | total | where |\n| --- | --- | --- |\n' + '\n'.join(rows) + '\n']


def main():
    header = [
        '# Pilot collation — mechanical diff\n',
        'Generated by `collate.py`; do not edit. Both sides normalised (accents, pointing and punctuation stripped, `j→i`, `æ→ae`), '
        'so only word-level differences appear. `—` = nothing on that side.\n',
    ]
    body = header + collatePilot() + collateInvitatory() + markCensus()
    (Path(__file__).resolve().parent / 'diffs.md').write_text('\n'.join(body), encoding='utf-8')


main()
